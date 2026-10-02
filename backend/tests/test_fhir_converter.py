"""Unit tests for HL7 FHIR R4 standard transformation and LOINC mappings."""
import pytest
from app.models.observation import (
    CitizenObservationCreate,
    PhysicalChemicalReadings,
    BioIndicators,
    VisualObservations
)
from app.services.seed_data import create_processed_record
from app.services.fhir_converter import convert_observation_to_fhir_bundle

def test_fhir_bundle_structure():
    obs = CitizenObservationCreate(
        stream_name="Standard Creek",
        latitude=45.5,
        longitude=-122.6,
        catchment_basin="Test Catchment",
        observer_name="Tester Jane",
        observer_tier="Trained Streamkeeper",
        readings=PhysicalChemicalReadings(
            temperature_c=14.5,
            ph=7.3,
            dissolved_oxygen_mg_l=9.2,
            turbidity_ntu=3.5,
            conductivity_us_cm=240.0,
            nitrate_mg_l=1.2,
            phosphate_mg_l=0.15
        ),
        bio=BioIndicators(stonefly_nymphs=2),
        visual=VisualObservations()
    )
    record = create_processed_record(obs)
    bundle = convert_observation_to_fhir_bundle(record)
    
    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "collection"
    assert bundle["total"] == 8  # 4 core + cond + nitrate + phosphate + RiskAssessment
    assert record.fhir_observation_count == 8
    
    resources = [entry["resource"] for entry in bundle["entry"]]
    resource_types = [r["resourceType"] for r in resources]
    assert "Observation" in resource_types
    assert "RiskAssessment" in resource_types
    
    # Verify LOINC codes exist in observations
    loinc_codes = []
    for r in resources:
        if r["resourceType"] == "Observation":
            coding = r["code"]["coding"]
            for c in coding:
                if c["system"] == "http://loinc.org":
                    loinc_codes.append(c["code"])
                    
    assert "8040-0" in loinc_codes   # Water Temp
    assert "11558-4" in loinc_codes  # pH
    assert "2710-2" in loinc_codes   # Dissolved Oxygen
    assert "97561-5" in loinc_codes  # Turbidity
    assert "2965-2" in loinc_codes   # Conductivity
    assert "14860-1" in loinc_codes  # Nitrate
    assert "14879-1" in loinc_codes  # Phosphate
    
    # Verify RiskAssessment resource
    risk_resource = next(r for r in resources if r["resourceType"] == "RiskAssessment")
    assert "Urban Stream Waterway: Standard Creek" in risk_resource["subject"]["display"]
    assert len(risk_resource["prediction"]) == 3

    # Verify HL7 EU Pilot City extension attached to all resources
    assert record.pilot_city == "portland"
    pilot_extensions = [
        ext["valueString"]
        for r in resources
        if "extension" in r
        for ext in r["extension"]
        if ext["url"] == "http://hl7.eu/fhir/environmental/StructureDefinition/pilot-city"
    ]
    assert len(pilot_extensions) == len(resources)
    assert all(p == "portland" for p in pilot_extensions)
