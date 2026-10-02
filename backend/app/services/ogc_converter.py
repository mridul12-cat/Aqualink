"""Open Geospatial Consortium (OGC) and Sensor Observation Service (SOS) GeoJSON Export."""
from typing import List, Dict, Any

def convert_to_ogc_geojson_features(records: List[Any]) -> Dict[str, Any]:
    """Convert stream observation records to standard OGC GeoJSON FeatureCollection."""
    features = []
    
    for r in records:
        feature = {
            "type": "Feature",
            "id": r.id,
            "geometry": {
                "type": "Point",
                "coordinates": [r.longitude, r.latitude]
            },
            "properties": {
                "station_id": r.station_id,
                "stream_name": r.stream_name,
                "catchment_basin": r.catchment_basin,
                "timestamp": r.timestamp,
                "observer": f"{r.observer_name} ({r.observer_tier})",
                "one_health_score": r.assessment.composite_one_health_score,
                "one_health_tier": r.assessment.one_health_tier,
                "wqi_score": r.assessment.ecological_health.wqi_score,
                "ehi_score": r.assessment.ecological_health.ehi_score,
                "recreational_advisory": r.assessment.public_health_hazards.recreational_advisory.value,
                "pathogen_risk": r.assessment.public_health_hazards.waterborne_pathogen_risk.value,
                "vector_hazard": r.assessment.public_health_hazards.vector_borne_hazard.value,
                "hab_risk": r.assessment.public_health_hazards.cyanobacterial_hab_risk.value,
                "validation_status": r.assessment.validation.status.value,
                "confidence_score": r.assessment.validation.confidence_score,
                "readings": {
                    "temperature_c": r.readings.temperature_c,
                    "ph": r.readings.ph,
                    "dissolved_oxygen_mg_l": r.readings.dissolved_oxygen_mg_l,
                    "turbidity_ntu": r.readings.turbidity_ntu,
                    "conductivity_us_cm": r.readings.conductivity_us_cm,
                    "nitrate_mg_l": r.readings.nitrate_mg_l,
                    "phosphate_mg_l": r.readings.phosphate_mg_l
                },
                "bio_indices": {
                    "bmwp_score": r.assessment.biological_indices.bmwp_score,
                    "ept_count": r.assessment.biological_indices.ept_count,
                    "fbi_score": r.assessment.biological_indices.fbi_score
                },
                "alerts": r.assessment.early_warning_alerts,
                "interventions": r.assessment.actionable_interventions
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "features": features,
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        }
    }
