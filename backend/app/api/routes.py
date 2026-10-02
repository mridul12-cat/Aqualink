"""FastAPI router endpoints for AquaLink OneHealth."""
from __future__ import annotations
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone

from ..models.observation import CitizenObservationCreate
from ..models.onehealth import StreamObservationRecord, OneHealthAssessment, AIValidationResult
from ..services.seed_data import generate_seed_stream_records, create_processed_record, resolve_pilot_id
from ..services.water_quality import compute_ecological_health, compute_biological_indices
from ..services.onehealth_risk import evaluate_public_health_hazards, synthesize_one_health_assessment
from ..services.ai_validator import validate_stream_observation
from ..services.fhir_converter import convert_observation_to_fhir_bundle
from ..services.ogc_converter import convert_to_ogc_geojson_features

router = APIRouter()

# In-memory storage seeded with realistic urban stream network
RECORDS_DB: dict[str, StreamObservationRecord] = {}

def initialize_database():
    global RECORDS_DB
    if not RECORDS_DB:
        seed_records = generate_seed_stream_records()
        for r in seed_records:
            RECORDS_DB[r.id] = r

# Initialize on module load
initialize_database()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AquaLink OneHealth API",
        "stations_loaded": len(RECORDS_DB),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

def filter_by_city_or_watershed(record: StreamObservationRecord, query_str: str) -> bool:
    if not query_str:
        return True
    resolved = resolve_pilot_id(query_str)
    if resolved == "all":
        return True
    if resolved and record.pilot_city == resolved:
        return True
    q = query_str.lower().strip()
    first_part = q.split(",")[0].strip()
    return bool(
        (record.pilot_city and (q in record.pilot_city.lower() or first_part in record.pilot_city.lower())) or
        (q in record.catchment_basin.lower() or first_part in record.catchment_basin.lower()) or
        (q in record.stream_name.lower() or first_part in record.stream_name.lower())
    )

filter_by_city = filter_by_city_or_watershed

@router.get("/streams", response_model=List[StreamObservationRecord])
def get_streams(
    pilot_city: Optional[str] = Query(None, description="Filter by pilot city/watershed (e.g., coimbra, benevento, oslo, portland, all)"),
    city: Optional[str] = Query(None, description="Alias for pilot_city"),
    watershed: Optional[str] = Query(None, description="Alias for pilot_city or catchment"),
    catchment: Optional[str] = Query(None, description="Filter by catchment basin"),
    advisory: Optional[str] = Query(None, description="Filter by recreational advisory (SAFE, CAUTION, UNSAFE)"),
    min_score: Optional[float] = Query(None, description="Minimum One Health score")
):
    results = list(RECORDS_DB.values())
    target = pilot_city or city or watershed
    if target:
        results = [r for r in results if filter_by_city_or_watershed(r, target)]
    if catchment:
        results = [r for r in results if catchment.lower() in r.catchment_basin.lower()]
    if advisory:
        results = [r for r in results if r.assessment.public_health_hazards.recreational_advisory.value.upper() == advisory.upper()]
    if min_score is not None:
        results = [r for r in results if r.assessment.composite_one_health_score >= min_score]
        
    return results

@router.get("/streams/{record_id}", response_model=StreamObservationRecord)
def get_stream_by_id(record_id: str):
    # Match by id or station_id
    if record_id in RECORDS_DB:
        return RECORDS_DB[record_id]
    for r in RECORDS_DB.values():
        if r.station_id.lower() == record_id.lower():
            return r
    raise HTTPException(status_code=404, detail="Stream observation record not found")

@router.post("/observations/validate", response_model=AIValidationResult)
def validate_observation_draft(obs: CitizenObservationCreate):
    """Instant preview validation endpoint for client-side field forms."""
    return validate_stream_observation(obs)

@router.post("/observations", response_model=StreamObservationRecord)
def submit_citizen_observation(obs: CitizenObservationCreate):
    """Full submission pipeline: AI verification, bio-indices, One Health risk assessment, and storage."""
    record = create_processed_record(obs)
    RECORDS_DB[record.id] = record
    return record

@router.get("/alerts")
def get_early_warning_alerts(
    pilot_city: Optional[str] = Query(None, description="Filter alerts by pilot city/watershed"),
    city: Optional[str] = Query(None, description="Alias for pilot_city"),
    watershed: Optional[str] = Query(None, description="Alias for pilot_city or catchment"),
    catchment: Optional[str] = Query(None, description="Filter by catchment basin")
):
    """Aggregate early warning triggers and public health alerts across the watershed."""
    target = pilot_city or city or watershed
    records = list(RECORDS_DB.values())
    if target:
        records = [r for r in records if filter_by_city_or_watershed(r, target)]
    if catchment:
        records = [r for r in records if catchment.lower() in r.catchment_basin.lower()]

    alerts = []
    for r in records:
        hazards = r.assessment.public_health_hazards
        if r.assessment.early_warning_alerts:
            for alert_text in r.assessment.early_warning_alerts:
                alerts.append({
                    "stream_id": r.id,
                    "stream_name": r.stream_name,
                    "station_id": r.station_id,
                    "catchment_basin": r.catchment_basin,
                    "pilot_city": r.pilot_city,
                    "timestamp": r.timestamp,
                    "alert": alert_text,
                    "advisory": hazards.recreational_advisory.value,
                    "pathogen_risk": hazards.waterborne_pathogen_risk.value,
                    "vector_hazard": hazards.vector_borne_hazard.value,
                    "hab_risk": hazards.cyanobacterial_hab_risk.value,
                    "one_health_score": r.assessment.composite_one_health_score
                })
    return {
        "total_active_alerts": len(alerts),
        "alerts": sorted(alerts, key=lambda x: x["one_health_score"])
    }

@router.get("/stats")
def get_watershed_statistics(
    pilot_city: Optional[str] = Query(None, description="Filter stats by pilot city/watershed"),
    city: Optional[str] = Query(None, description="Alias for pilot_city"),
    watershed: Optional[str] = Query(None, description="Alias for pilot_city or catchment"),
    catchment: Optional[str] = Query(None, description="Filter by catchment basin")
):
    """Summary metrics of ecological and public health status across the monitored region."""
    records = list(RECORDS_DB.values())
    target = pilot_city or city or watershed
    if target:
        records = [r for r in records if filter_by_city_or_watershed(r, target)]
    if catchment:
        records = [r for r in records if catchment.lower() in r.catchment_basin.lower()]

    if not records:
        return {
            "total_monitoring_stations": 0,
            "mean_one_health_score": 0.0,
            "mean_wqi": 0.0,
            "mean_ehi": 0.0,
            "total_ept_richness_observed": 0,
            "advisories": {
                "safe": 0,
                "caution": 0,
                "unsafe": 0
            },
            "hazard_alerts": {
                "high_pathogen_risk_sites": 0,
                "high_vector_breeding_sites": 0,
                "high_cyanobacteria_hab_sites": 0
            }
        }
        
    scores = [r.assessment.composite_one_health_score for r in records]
    wqi_scores = [r.assessment.ecological_health.wqi_score for r in records]
    ehi_scores = [r.assessment.ecological_health.ehi_score for r in records]
    ept_totals = [r.assessment.biological_indices.ept_count for r in records]
    
    safe_count = sum(1 for r in records if r.assessment.public_health_hazards.recreational_advisory.value == "SAFE")
    caution_count = sum(1 for r in records if r.assessment.public_health_hazards.recreational_advisory.value == "CAUTION")
    unsafe_count = sum(1 for r in records if r.assessment.public_health_hazards.recreational_advisory.value == "UNSAFE")
    
    high_vector_count = sum(1 for r in records if r.assessment.public_health_hazards.vector_borne_hazard.value in ("HIGH", "CRITICAL"))
    high_pathogen_count = sum(1 for r in records if r.assessment.public_health_hazards.waterborne_pathogen_risk.value in ("HIGH", "CRITICAL"))
    high_hab_count = sum(1 for r in records if r.assessment.public_health_hazards.cyanobacterial_hab_risk.value in ("HIGH", "CRITICAL"))
    
    return {
        "total_monitoring_stations": len(records),
        "mean_one_health_score": round(sum(scores) / len(scores), 1),
        "mean_wqi": round(sum(wqi_scores) / len(wqi_scores), 1),
        "mean_ehi": round(sum(ehi_scores) / len(ehi_scores), 1),
        "total_ept_richness_observed": sum(ept_totals),
        "advisories": {
            "safe": safe_count,
            "caution": caution_count,
            "unsafe": unsafe_count
        },
        "hazard_alerts": {
            "high_pathogen_risk_sites": high_pathogen_count,
            "high_vector_breeding_sites": high_vector_count,
            "high_cyanobacteria_hab_sites": high_hab_count
        }
    }

@router.get("/fhir/observations/{record_id}")
def export_single_fhir_bundle(record_id: str):
    """Export single stream observation as HL7 FHIR R4 Bundle containing LOINC Observations and RiskAssessment."""
    record = get_stream_by_id(record_id)
    return convert_observation_to_fhir_bundle(record)

@router.get("/fhir/bundle")
def export_all_fhir_bundle(
    pilot_city: Optional[str] = Query(None, description="Filter by pilot city/watershed"),
    city: Optional[str] = Query(None, description="Alias for pilot_city"),
    watershed: Optional[str] = Query(None, description="Alias for pilot_city or catchment"),
    catchment: Optional[str] = Query(None, description="Filter by catchment basin")
):
    """Export watershed observations as combined HL7 FHIR R4 Collection Bundle."""
    target = pilot_city or city or watershed
    records = list(RECORDS_DB.values())
    if target:
        records = [r for r in records if filter_by_city_or_watershed(r, target)]
    if catchment:
        records = [r for r in records if catchment.lower() in r.catchment_basin.lower()]
    all_entries = []
    for r in records:
        b = convert_observation_to_fhir_bundle(r)
        all_entries.extend(b.get("entry", []))
        
    return {
        "resourceType": "Bundle",
        "id": "aqualink-watershed-fhir-collection",
        "type": "collection",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total": len(all_entries),
        "entry": all_entries
    }

@router.get("/ogc/geojson")
def export_ogc_geojson(
    pilot_city: Optional[str] = Query(None, description="Filter by pilot city/watershed"),
    city: Optional[str] = Query(None, description="Alias for pilot_city"),
    watershed: Optional[str] = Query(None, description="Alias for pilot_city or catchment"),
    catchment: Optional[str] = Query(None, description="Filter by catchment basin")
):
    """Export stream monitoring stations as OGC-compliant GeoJSON FeatureCollection."""
    target = pilot_city or city or watershed
    records = list(RECORDS_DB.values())
    if target:
        records = [r for r in records if filter_by_city_or_watershed(r, target)]
    if catchment:
        records = [r for r in records if catchment.lower() in r.catchment_basin.lower()]
    return convert_to_ogc_geojson_features(records)

