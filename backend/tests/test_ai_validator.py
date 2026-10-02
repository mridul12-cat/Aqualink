"""Unit tests for AI validation, contradiction detection, and explainable reasoning."""
import pytest
from app.models.observation import (
    CitizenObservationCreate,
    PhysicalChemicalReadings,
    BioIndicators,
    VisualObservations,
    WaterClarity,
    WaterOdor,
    FlowRate
)
from app.models.onehealth import ValidationStatus
from app.services.ai_validator import validate_stream_observation

def test_ai_validator_pristine_concordance():
    obs = CitizenObservationCreate(
        stream_name="North Fork Creek",
        latitude=45.5,
        longitude=-122.6,
        catchment_basin="Upper Basin",
        readings=PhysicalChemicalReadings(
            temperature_c=13.0,
            ph=7.2,
            dissolved_oxygen_mg_l=10.2,
            turbidity_ntu=2.5
        ),
        bio=BioIndicators(stonefly_nymphs=4, mayfly_nymphs=7),
        visual=VisualObservations(
            water_clarity=WaterClarity.CRYSTAL_CLEAR,
            water_odor=WaterOdor.NONE,
            flow_rate=FlowRate.MODERATE_RIFFLE
        )
    )
    result = validate_stream_observation(obs)
    assert result.status == ValidationStatus.VERIFIED
    assert result.confidence_score >= 95.0
    assert len(result.contradictions_detected) == 0
    assert result.human_in_the_loop_flag is False

def test_ai_validator_sensor_visual_contradiction():
    # User claims crystal clear, but turbidity probe reads 85 NTU
    obs = CitizenObservationCreate(
        stream_name="Conflict Brook",
        latitude=45.5,
        longitude=-122.6,
        catchment_basin="Urban Basin",
        readings=PhysicalChemicalReadings(
            temperature_c=16.0,
            ph=7.2,
            dissolved_oxygen_mg_l=8.0,
            turbidity_ntu=85.0  # Turbid
        ),
        bio=BioIndicators(),
        visual=VisualObservations(
            water_clarity=WaterClarity.CRYSTAL_CLEAR  # Contradiction!
        )
    )
    result = validate_stream_observation(obs)
    assert result.status == ValidationStatus.FLAG_CONTRADICTION
    assert any("crystal clear" in c.lower() for c in result.contradictions_detected)
    assert result.human_in_the_loop_flag is True

def test_ai_validator_ecological_stonefly_hypoxia_paradox():
    # Stoneflies cannot live in DO < 4.0 mg/L
    obs = CitizenObservationCreate(
        stream_name="Paradox Reach",
        latitude=45.5,
        longitude=-122.6,
        catchment_basin="Urban Basin",
        readings=PhysicalChemicalReadings(
            temperature_c=22.0,
            ph=7.0,
            dissolved_oxygen_mg_l=2.5,  # Hypoxic
            turbidity_ntu=15.0
        ),
        bio=BioIndicators(
            stonefly_nymphs=6  # Impossible in 2.5 mg/L DO
        ),
        visual=VisualObservations(
            water_clarity=WaterClarity.MURKY
        )
    )
    result = validate_stream_observation(obs)
    assert result.status == ValidationStatus.FLAG_CONTRADICTION
    assert any("stonefly" in c.lower() for c in result.contradictions_detected)
    assert result.confidence_score < 80.0

def test_ai_validator_sewage_vs_ept_contradiction():
    obs = CitizenObservationCreate(
        stream_name="Sewer Tributary",
        latitude=45.5,
        longitude=-122.6,
        catchment_basin="Central Basin",
        readings=PhysicalChemicalReadings(
            temperature_c=18.0,
            ph=7.0,
            dissolved_oxygen_mg_l=6.0,
            turbidity_ntu=20.0
        ),
        bio=BioIndicators(mayfly_nymphs=10),
        visual=VisualObservations(
            water_odor=WaterOdor.SEWAGE_SULFUR
        )
    )
    result = validate_stream_observation(obs)
    assert result.status == ValidationStatus.FLAG_CONTRADICTION
    assert any("sewage" in c.lower() for c in result.contradictions_detected)

def test_ai_validator_mayfly_hypoxia_paradox():
    obs = CitizenObservationCreate(
        stream_name="Hypoxic Mayfly Creek",
        latitude=45.5,
        longitude=-122.6,
        catchment_basin="Lower Basin",
        readings=PhysicalChemicalReadings(
            temperature_c=22.0,
            ph=7.0,
            dissolved_oxygen_mg_l=2.1,  # Critically hypoxic
            turbidity_ntu=18.0
        ),
        bio=BioIndicators(mayfly_nymphs=8),  # Paradox: Ephemeroptera cannot survive acute hypoxia < 3.0
        visual=VisualObservations()
    )
    result = validate_stream_observation(obs)
    assert result.status == ValidationStatus.FLAG_CONTRADICTION
    assert any("mayfly" in c.lower() for c in result.contradictions_detected)
    assert result.human_in_the_loop_flag is True

def test_ai_validator_single_anomaly_needs_review():
    # Only one minor anomaly: extreme pH triggers RULE_RANGE_01_EXTREME_PH
    obs = CitizenObservationCreate(
        stream_name="Acidic Bog Run",
        latitude=45.5,
        longitude=-122.6,
        catchment_basin="Bog Basin",
        readings=PhysicalChemicalReadings(
            temperature_c=14.0,
            ph=4.2,  # Low pH anomaly
            dissolved_oxygen_mg_l=9.5,
            turbidity_ntu=4.0
        ),
        bio=BioIndicators(),
        visual=VisualObservations()
    )
    result = validate_stream_observation(obs)
    assert result.status == ValidationStatus.NEEDS_REVIEW
    assert result.human_in_the_loop_flag is True
    assert len(result.anomalies) == 1
    assert len(result.contradictions_detected) == 0
