"""HL7 FHIR R4 Interoperability Service.
Converts citizen science stream observations into compliant FHIR Observation and RiskAssessment resources,
enabling direct ingestion by clinical health systems, epidemiological registries (EFMI), and HL7 Europe tools.
"""
from typing import Dict, Any, List
from datetime import datetime, timezone
import uuid

def create_fhir_observation(
    obs_id: str,
    stream_name: str,
    catchment: str,
    timestamp_iso: str,
    observer_name: str,
    observer_tier: str,
    code_loinc: str,
    display_name: str,
    value: float,
    unit: str,
    ucum_code: str,
    interpretation_code: str = "N",
    interpretation_display: str = "Normal",
    notes: str = ""
) -> Dict[str, Any]:
    """Generate a single HL7 FHIR R4 compliant Observation resource."""
    resource = {
        "resourceType": "Observation",
        "id": obs_id,
        "meta": {
            "profile": [
                "http://hl7.org/fhir/StructureDefinition/Observation",
                "http://hl7.eu/fhir/environmental/StructureDefinition/water-quality-observation"
            ]
        },
        "identifier": [
            {
                "system": "urn:ietf:rfc:3986",
                "value": f"urn:uuid:{obs_id}"
            }
        ],
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "social-history",
                        "display": "Social History / Environmental Exposure"
                    }
                ]
            }
        ],
        "code": {
            "coding": [
                {
                    "system": "http://loinc.org",
                    "code": code_loinc,
                    "display": display_name
                }
            ],
            "text": display_name
        },
        "subject": {
            "reference": f"Location/{catchment.lower().replace(' ', '-')}",
            "display": f"Catchment: {catchment} | Stream: {stream_name}"
        },
        "effectiveDateTime": timestamp_iso,
        "performer": [
            {
                "display": f"{observer_name} ({observer_tier})"
            }
        ],
        "valueQuantity": {
            "value": float(value),
            "unit": unit,
            "system": "http://unitsofmeasure.org",
            "code": ucum_code
        },
        "interpretation": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                        "code": interpretation_code,
                        "display": interpretation_display
                    }
                ]
            }
        ]
    }
    if notes:
        resource["note"] = [{"text": notes}]
    return resource

def create_fhir_risk_assessment(
    assessment_id: str,
    stream_name: str,
    timestamp_iso: str,
    composite_score: float,
    pathogen_risk: str,
    vector_risk: str,
    hab_risk: str,
    recreation_advisory: str,
    actionable_interventions: List[str]
) -> Dict[str, Any]:
    """Generate an HL7 FHIR R4 RiskAssessment resource summarizing One Health hazards."""
    return {
        "resourceType": "RiskAssessment",
        "id": assessment_id,
        "meta": {
            "profile": ["http://hl7.org/fhir/StructureDefinition/RiskAssessment"]
        },
        "status": "final",
        "subject": {
            "display": f"Urban Stream Waterway: {stream_name}"
        },
        "occurrenceDateTime": timestamp_iso,
        "condition": {
            "text": "Urban Environmental Exposure & One Health Vector Hazard"
        },
        "prediction": [
            {
                "outcome": {
                    "text": "Waterborne Pathogen Infection Hazard (E. coli / Leptospira / Enteric vectors)"
                },
                "qualitativeRisk": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/risk-probability",
                            "code": pathogen_risk.lower(),
                            "display": f"{pathogen_risk} Risk"
                        }
                    ]
                }
            },
            {
                "outcome": {
                    "text": "Vector-Borne Arboviral Hazard (Culex mosquito breeding in stagnant hypoxic reach)"
                },
                "qualitativeRisk": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/risk-probability",
                            "code": vector_risk.lower(),
                            "display": f"{vector_risk} Hazard"
                        }
                    ]
                }
            },
            {
                "outcome": {
                    "text": "Cyanobacterial Toxin Exposure (Harmful Algal Bloom / Microcystins)"
                },
                "qualitativeRisk": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/risk-probability",
                            "code": hab_risk.lower(),
                            "display": f"{hab_risk} Hazard"
                        }
                    ]
                }
            }
        ],
        "mitigation": "; ".join(actionable_interventions),
        "note": [
            {
                "text": f"One Health Composite Score: {composite_score}/100. Contact Advisory: {recreation_advisory}."
            }
        ]
    }

def convert_observation_to_fhir_bundle(obs_record: Any) -> Dict[str, Any]:
    """Transform an entire stream observation record into a standard FHIR R4 Bundle."""
    bundle_id = str(uuid.uuid4())
    timestamp = obs_record.timestamp or datetime.now(timezone.utc).isoformat()
    stream_name = obs_record.stream_name
    catchment = obs_record.catchment_basin
    observer = obs_record.observer_name
    tier = obs_record.observer_tier
    readings = obs_record.readings
    assessment = obs_record.assessment
    
    entries = []
    
    # 1. Temperature (LOINC 8040-0)
    entries.append({
        "fullUrl": f"urn:uuid:{uuid.uuid4()}",
        "resource": create_fhir_observation(
            obs_id=f"obs-temp-{obs_record.id}",
            stream_name=stream_name,
            catchment=catchment,
            timestamp_iso=timestamp,
            observer_name=observer,
            observer_tier=tier,
            code_loinc="8040-0",
            display_name="Water Temperature",
            value=readings.temperature_c,
            unit="Cel",
            ucum_code="Cel",
            interpretation_code="H" if readings.temperature_c > 22.0 else "N",
            interpretation_display="High" if readings.temperature_c > 22.0 else "Normal"
        )
    })
    
    # 2. pH (LOINC 11558-4)
    ph_interp = "N"
    ph_display = "Normal"
    if readings.ph < 6.5:
        ph_interp = "L"
        ph_display = "Low / Acidic"
    elif readings.ph > 8.5:
        ph_interp = "H"
        ph_display = "High / Alkaline"
    entries.append({
        "fullUrl": f"urn:uuid:{uuid.uuid4()}",
        "resource": create_fhir_observation(
            obs_id=f"obs-ph-{obs_record.id}",
            stream_name=stream_name,
            catchment=catchment,
            timestamp_iso=timestamp,
            observer_name=observer,
            observer_tier=tier,
            code_loinc="11558-4",
            display_name="pH of Water",
            value=readings.ph,
            unit="pH",
            ucum_code="[pH]",
            interpretation_code=ph_interp,
            interpretation_display=ph_display
        )
    })
    
    # 3. Dissolved Oxygen (LOINC 2710-2)
    do_interp = "N"
    do_display = "Adequate"
    if readings.dissolved_oxygen_mg_l < 4.0:
        do_interp = "LL"
        do_display = "Critically Hypoxic"
    elif readings.dissolved_oxygen_mg_l < 6.0:
        do_interp = "L"
        do_display = "Sub-optimal"
    entries.append({
        "fullUrl": f"urn:uuid:{uuid.uuid4()}",
        "resource": create_fhir_observation(
            obs_id=f"obs-do-{obs_record.id}",
            stream_name=stream_name,
            catchment=catchment,
            timestamp_iso=timestamp,
            observer_name=observer,
            observer_tier=tier,
            code_loinc="2710-2",
            display_name="Oxygen dissolved [Mass/volume] in Water",
            value=readings.dissolved_oxygen_mg_l,
            unit="mg/L",
            ucum_code="mg/L",
            interpretation_code=do_interp,
            interpretation_display=do_display
        )
    })
    
    # 4. Turbidity (LOINC 97561-5)
    turb_interp = "H" if readings.turbidity_ntu > 20.0 else "N"
    turb_disp = "Elevated Turbidity" if readings.turbidity_ntu > 20.0 else "Normal"
    entries.append({
        "fullUrl": f"urn:uuid:{uuid.uuid4()}",
        "resource": create_fhir_observation(
            obs_id=f"obs-turb-{obs_record.id}",
            stream_name=stream_name,
            catchment=catchment,
            timestamp_iso=timestamp,
            observer_name=observer,
            observer_tier=tier,
            code_loinc="97561-5",
            display_name="Turbidity of Water",
            value=readings.turbidity_ntu,
            unit="NTU",
            ucum_code="[NTU]",
            interpretation_code=turb_interp,
            interpretation_display=turb_disp
        )
    })
    
    # 5. Optional Conductivity
    if readings.conductivity_us_cm is not None:
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": create_fhir_observation(
                obs_id=f"obs-cond-{obs_record.id}",
                stream_name=stream_name,
                catchment=catchment,
                timestamp_iso=timestamp,
                observer_name=observer,
                observer_tier=tier,
                code_loinc="2965-2",
                display_name="Specific Conductance of Water",
                value=readings.conductivity_us_cm,
                unit="uS/cm",
                ucum_code="uS/cm"
            )
        })

    # 6. Optional Nitrates
    if readings.nitrate_mg_l is not None:
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": create_fhir_observation(
                obs_id=f"obs-no3-{obs_record.id}",
                stream_name=stream_name,
                catchment=catchment,
                timestamp_iso=timestamp,
                observer_name=observer,
                observer_tier=tier,
                code_loinc="14860-1",
                display_name="Nitrate [Mass/volume] in Water",
                value=readings.nitrate_mg_l,
                unit="mg/L",
                ucum_code="mg/L",
                interpretation_code="H" if readings.nitrate_mg_l > 10.0 else "N",
                interpretation_display="Elevated Nitrate" if readings.nitrate_mg_l > 10.0 else "Normal"
            )
        })

    # 7. Optional Phosphate (LOINC 14879-1)
    if readings.phosphate_mg_l is not None:
        entries.append({
            "fullUrl": f"urn:uuid:{uuid.uuid4()}",
            "resource": create_fhir_observation(
                obs_id=f"obs-po4-{obs_record.id}",
                stream_name=stream_name,
                catchment=catchment,
                timestamp_iso=timestamp,
                observer_name=observer,
                observer_tier=tier,
                code_loinc="14879-1",
                display_name="Phosphate [Mass/volume] in Water",
                value=readings.phosphate_mg_l,
                unit="mg/L",
                ucum_code="mg/L",
                interpretation_code="H" if readings.phosphate_mg_l > 0.1 else "N",
                interpretation_display="Elevated / Eutrophic Trigger" if readings.phosphate_mg_l > 0.1 else "Normal"
            )
        })

    # 8. One Health Risk Assessment resource
    risk_res = create_fhir_risk_assessment(
        assessment_id=f"risk-{obs_record.id}",
        stream_name=stream_name,
        timestamp_iso=timestamp,
        composite_score=assessment.composite_one_health_score,
        pathogen_risk=assessment.public_health_hazards.waterborne_pathogen_risk.value,
        vector_risk=assessment.public_health_hazards.vector_borne_hazard.value,
        hab_risk=assessment.public_health_hazards.cyanobacterial_hab_risk.value,
        recreation_advisory=assessment.public_health_hazards.recreational_advisory.value,
        actionable_interventions=assessment.actionable_interventions
    )
    entries.append({
        "fullUrl": f"urn:uuid:{uuid.uuid4()}",
        "resource": risk_res
    })

    return {
        "resourceType": "Bundle",
        "id": bundle_id,
        "type": "collection",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total": len(entries),
        "entry": entries
    }
