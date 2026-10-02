"""Unit tests for One Health risk algorithms and vector hazard assessment."""
import pytest
from app.models.observation import (
    PhysicalChemicalReadings,
    BioIndicators,
    VisualObservations,
    FlowRate,
    WaterOdor,
    SurfaceSheen,
    TrashDensity
)
from app.models.onehealth import RiskLevel, AdvisoryStatus
from app.services.onehealth_risk import (
    evaluate_pathogen_risk,
    evaluate_vector_borne_hazard,
    evaluate_cyanobacterial_hab_risk,
    evaluate_public_health_hazards
)

def test_pathogen_risk_stormwater_overflow():
    readings = PhysicalChemicalReadings(
        temperature_c=21.0,
        ph=6.8,
        dissolved_oxygen_mg_l=4.5,
        turbidity_ntu=75.0,  # High turbidity
        nitrate_mg_l=12.0
    )
    bio = BioIndicators(tubifex_worms=20)
    visual = VisualObservations(
        water_odor=WaterOdor.SEWAGE_SULFUR,
        recent_heavy_rainfall=True
    )
    level, score, vectors = evaluate_pathogen_risk(readings, bio, visual)
    assert level in (RiskLevel.HIGH, RiskLevel.CRITICAL)
    assert score >= 70.0
    assert any("sewage" in v.lower() for v in vectors)

def test_vector_hazard_stagnant_hypoxic():
    # Stagnant warm pool without predators -> optimal mosquito breeding
    readings = PhysicalChemicalReadings(
        temperature_c=26.0,
        ph=7.2,
        dissolved_oxygen_mg_l=2.5,  # Hypoxic: kills predator fish
        turbidity_ntu=15.0
    )
    bio = BioIndicators(dragonfly_nymphs=0, live_fish_observed=0)
    visual = VisualObservations(
        flow_rate=FlowRate.STAGNANT_POOLS,
        trash_density=TrashDensity.MODERATE
    )
    level, score, notes = evaluate_vector_borne_hazard(readings, bio, visual)
    assert level in (RiskLevel.HIGH, RiskLevel.CRITICAL)
    assert score >= 65.0
    assert "stagnant" in notes.lower() or "hypoxia" in notes.lower()

def test_cyanobacteria_hab_risk():
    readings = PhysicalChemicalReadings(
        temperature_c=25.0,
        ph=8.8,
        dissolved_oxygen_mg_l=14.0,  # Supersaturation
        turbidity_ntu=25.0,
        phosphate_mg_l=0.45  # High eutrophic phosphate
    )
    bio = BioIndicators(algal_cover_pct=60.0)
    visual = VisualObservations(
        surface_sheen=SurfaceSheen.SCUM_FOAM,
        flow_rate=FlowRate.SLOW_TRICKLE
    )
    level, score, notes = evaluate_cyanobacterial_hab_risk(readings, bio, visual, do_sat_pct=145.0)
    assert level in (RiskLevel.HIGH, RiskLevel.CRITICAL)
    assert score >= 60.0

def test_recreational_advisory_determination():
    # Clean stream
    clean_readings = PhysicalChemicalReadings(
        temperature_c=14.0,
        ph=7.2,
        dissolved_oxygen_mg_l=10.0,
        turbidity_ntu=2.0
    )
    clean_bio = BioIndicators(mayfly_nymphs=5)
    clean_visual = VisualObservations()
    hazards = evaluate_public_health_hazards(clean_readings, clean_bio, clean_visual, 100.0)
    assert hazards.recreational_advisory == AdvisoryStatus.SAFE
    assert hazards.pet_and_wildlife_hazard == AdvisoryStatus.SAFE
