"""Unit tests for water quality and ecological health algorithms."""
import pytest
from app.models.observation import PhysicalChemicalReadings, BioIndicators
from app.services.water_quality import (
    calculate_theoretical_do_saturation,
    calculate_nutrient_subindex,
    compute_water_quality_index,
    compute_biological_indices,
    compute_ecological_health
)

def test_theoretical_do_saturation():
    # Cold water holds more dissolved oxygen
    sat_freezing = calculate_theoretical_do_saturation(0.0)
    sat_cold = calculate_theoretical_do_saturation(5.0)
    sat_warm = calculate_theoretical_do_saturation(25.0)
    sat_hot = calculate_theoretical_do_saturation(45.0)
    assert sat_freezing > sat_cold > sat_warm > sat_hot
    assert 14.0 < sat_freezing < 15.0
    assert 12.0 < sat_cold < 13.5
    assert 7.5 < sat_warm < 9.0
    assert 5.5 < sat_hot < 6.5

def test_water_quality_index_pristine():
    readings = PhysicalChemicalReadings(
        temperature_c=12.0,
        ph=7.4,
        dissolved_oxygen_mg_l=10.5,
        turbidity_ntu=1.5,
        nitrate_mg_l=0.5,
        phosphate_mg_l=0.02
    )
    wqi, rating, sat_pct = compute_water_quality_index(readings)
    assert wqi >= 85.0
    assert rating in ("Excellent", "Good")
    assert 90.0 <= sat_pct <= 110.0

def test_water_quality_index_polluted():
    readings = PhysicalChemicalReadings(
        temperature_c=27.0,
        ph=5.2,
        dissolved_oxygen_mg_l=2.1,
        turbidity_ntu=95.0,
        nitrate_mg_l=25.0,
        phosphate_mg_l=1.2
    )
    wqi, rating, sat_pct = compute_water_quality_index(readings)
    assert wqi < 40.0
    assert rating in ("Marginal", "Poor")

def test_biological_indices_richness():
    # Pristine bio community: stonefly, mayfly, caddisfly
    bio_clean = BioIndicators(
        stonefly_nymphs=5,
        mayfly_nymphs=8,
        caddisfly_larvae=6,
        dragonfly_nymphs=2
    )
    indices = compute_biological_indices(bio_clean)
    assert indices.ept_count == 3  # All three EPT taxa present
    assert indices.bmwp_score >= 35.0
    assert indices.fbi_score < 4.0  # Low tolerance = low pollution

    # Degraded bio community: tubifex, leeches, midges
    bio_polluted = BioIndicators(
        tubifex_worms=25,
        leeches=10,
        midges_bloodworms=20
    )
    indices_polluted = compute_biological_indices(bio_polluted)
    assert indices_polluted.ept_count == 0
    assert indices_polluted.fbi_score > 7.5  # High organic pollution
    assert "Pollution" in indices_polluted.organic_pollution_level or "Poor" in indices_polluted.organic_pollution_level

def test_ecological_health_synthesis():
    readings = PhysicalChemicalReadings(
        temperature_c=14.0,
        ph=7.3,
        dissolved_oxygen_mg_l=9.5,
        turbidity_ntu=3.0
    )
    bio = BioIndicators(
        stonefly_nymphs=4,
        mayfly_nymphs=6,
        caddisfly_larvae=5
    )
    eco = compute_ecological_health(readings, bio)
    assert eco.ehi_score >= 70.0
    assert eco.resilience_tier in ("Resilient", "Stable")

def test_biological_indices_zero_sampled():
    # When citizen scientist does not log macroinvertebrates
    bio_empty = BioIndicators()
    indices = compute_biological_indices(bio_empty)
    assert indices.ept_count == 0
    assert indices.bmwp_score == 0.0
    assert "Not Sampled" in indices.bmwp_class
    assert "Not Sampled" in indices.organic_pollution_level
    assert indices.fbi_score == 0.0

def test_nutrient_subindex_calculation():
    # Both provided
    both = calculate_nutrient_subindex(1.0, 0.05)  # 95 + 95 -> 95.0
    assert both == 95.0
    
    # Only nitrate
    nitrate_only = calculate_nutrient_subindex(1.0, None)
    assert nitrate_only == 95.0
    
    # Only phosphate
    phos_only = calculate_nutrient_subindex(None, 0.05)
    assert phos_only == 95.0
    
    # Neither provided
    neither = calculate_nutrient_subindex(None, None)
    assert neither == 85.0
