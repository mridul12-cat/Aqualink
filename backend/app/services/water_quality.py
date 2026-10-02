"""Water quality indices, DO saturation, and biological monitoring algorithms."""
from __future__ import annotations
import math
from typing import Dict, Any, Tuple
from ..models.observation import PhysicalChemicalReadings, BioIndicators
from ..models.onehealth import BiologicalIndices, EcologicalHealth

# Standard freshwater Dissolved Oxygen saturation at sea level (Benson & Krause 1984 / USGS Standard Methods)
def calculate_theoretical_do_saturation(temp_c: float) -> float:
    """Calculate theoretical freshwater DO saturation in mg/L (USGS / Benson & Krause 1984).
    Valid across temperatures from 0 to 50 C at standard atmospheric pressure.
    """
    t_c = max(0.0, min(temp_c, 50.0))
    t_kelvin = t_c + 273.15
    ln_c = (
        -139.34411 +
        (1.575701e5 / t_kelvin) -
        (6.642308e7 / (t_kelvin ** 2)) +
        (1.243800e10 / (t_kelvin ** 3)) -
        (8.621949e11 / (t_kelvin ** 4))
    )
    return round(math.exp(ln_c), 2)

def calculate_do_subindex(do_sat_pct: float) -> float:
    """NSF-WQI sub-index curve approximation for Dissolved Oxygen % saturation (0-100 score)."""
    if do_sat_pct < 40.0:
        return max(5.0, do_sat_pct * 0.75)
    elif do_sat_pct <= 90.0:
        return 30.0 + (do_sat_pct - 40.0) * (60.0 / 50.0)
    elif do_sat_pct <= 110.0:
        # Near 100% saturation is ideal
        return 98.0 - abs(do_sat_pct - 100.0) * 1.5
    elif do_sat_pct <= 140.0:
        # Supersaturation due to algal blooms
        return max(40.0, 95.0 - (do_sat_pct - 110.0) * 1.6)
    else:
        # Extreme supersaturation / eutrophication
        return 30.0

def calculate_ph_subindex(ph: float) -> float:
    """NSF-WQI sub-index curve for pH."""
    if ph < 4.0 or ph > 11.0:
        return 2.0
    elif 6.5 <= ph <= 8.2:
        # Optimal freshwater aquatic life range
        return 90.0 + (10.0 - abs(ph - 7.35) * 8.0)
    elif 5.0 <= ph < 6.5:
        return 30.0 + (ph - 5.0) * 40.0
    elif 8.2 < ph <= 9.5:
        return 90.0 - (ph - 8.2) * 45.0
    elif ph > 9.5:
        return max(5.0, 31.0 - (ph - 9.5) * 15.0)
    else:
        return max(5.0, 10.0 + (ph - 4.0) * 20.0)

def calculate_turbidity_subindex(turbidity_ntu: float) -> float:
    """Sub-index for Turbidity (lower is generally better in freshwater streams)."""
    if turbidity_ntu <= 5.0:
        return 98.0 - (turbidity_ntu * 1.6)
    elif turbidity_ntu <= 20.0:
        return 90.0 - ((turbidity_ntu - 5.0) * 2.0)
    elif turbidity_ntu <= 50.0:
        return 60.0 - ((turbidity_ntu - 20.0) * 0.8)
    elif turbidity_ntu <= 100.0:
        return 36.0 - ((turbidity_ntu - 50.0) * 0.3)
    else:
        return max(5.0, 21.0 - math.log10(max(turbidity_ntu, 1.0)) * 5.0)

def calculate_temperature_subindex(temp_c: float) -> float:
    """Sub-index for stream temperature (temperate urban streams ideal: 10 - 18 C)."""
    if 10.0 <= temp_c <= 18.0:
        return 95.0
    elif temp_c < 10.0:
        return max(50.0, 95.0 - (10.0 - temp_c) * 4.5)
    elif 18.0 < temp_c <= 24.0:
        return 95.0 - (temp_c - 18.0) * 5.0
    elif 24.0 < temp_c <= 30.0:
        return 65.0 - (temp_c - 24.0) * 7.0
    else:
        return max(10.0, 23.0 - (temp_c - 30.0) * 2.0)

def calculate_nutrient_subindex(nitrate_mg_l: float | None, phosphate_mg_l: float | None) -> float:
    """Sub-index based on nitrate and phosphate levels."""
    scores = []
    if nitrate_mg_l is not None:
        if nitrate_mg_l <= 1.0:
            n_score = 95.0
        elif nitrate_mg_l <= 5.0:
            n_score = 75.0
        elif nitrate_mg_l <= 10.0:
            n_score = 50.0
        else:
            n_score = max(10.0, 40.0 - (nitrate_mg_l - 10.0) * 2.0)
        scores.append(n_score)
        
    if phosphate_mg_l is not None:
        if phosphate_mg_l <= 0.05:
            p_score = 95.0
        elif phosphate_mg_l <= 0.1:
            p_score = 80.0
        elif phosphate_mg_l <= 0.3:
            p_score = 50.0
        else:
            p_score = max(10.0, 30.0 - (phosphate_mg_l - 0.3) * 15.0)
        scores.append(p_score)
        
    if not scores:
        return 85.0
    return round(sum(scores) / len(scores), 1)

def compute_water_quality_index(readings: PhysicalChemicalReadings) -> Tuple[float, str, float]:
    """Compute weighted Water Quality Index (0-100) and return (WQI score, Rating, DO Saturation %)."""
    sat_mg_l = calculate_theoretical_do_saturation(readings.temperature_c)
    do_sat_pct = round((readings.dissolved_oxygen_mg_l / sat_mg_l) * 100.0, 1)
    
    q_do = calculate_do_subindex(do_sat_pct)
    q_ph = calculate_ph_subindex(readings.ph)
    q_turb = calculate_turbidity_subindex(readings.turbidity_ntu)
    q_temp = calculate_temperature_subindex(readings.temperature_c)
    q_nutrients = calculate_nutrient_subindex(readings.nitrate_mg_l, readings.phosphate_mg_l)
    
    # Weightings: DO (0.32), pH (0.22), Turbidity (0.18), Temp (0.13), Nutrients/Conductivity (0.15)
    wqi = (
        (q_do * 0.32) +
        (q_ph * 0.22) +
        (q_turb * 0.18) +
        (q_temp * 0.13) +
        (q_nutrients * 0.15)
    )
    wqi = round(max(0.0, min(100.0, wqi)), 1)
    
    if wqi >= 90.0:
        rating = "Excellent"
    elif wqi >= 70.0:
        rating = "Good"
    elif wqi >= 50.0:
        rating = "Fair"
    elif wqi >= 30.0:
        rating = "Marginal"
    else:
        rating = "Poor"
        
    return wqi, rating, do_sat_pct

def compute_biological_indices(bio: BioIndicators) -> BiologicalIndices:
    """Calculate BMWP score, EPT taxa richness, and Hilsenhoff Family Biotic Index (FBI)."""
    # BMWP scoring weights
    bmwp_scores = {
        "stonefly_nymphs": 10.0,
        "mayfly_nymphs": 10.0,
        "caddisfly_larvae": 10.0,
        "dragonfly_nymphs": 8.0,
        "freshwater_shrimp": 6.0,
        "beetle_larvae": 5.0,
        "blackfly_larvae": 5.0,
        "pouch_snails": 3.0,
        "leeches": 3.0,
        "midges_bloodworms": 2.0,
        "tubifex_worms": 1.0,
    }
    
    # Hilsenhoff tolerance values (0-10, lower = cleaner)
    tolerance_values = {
        "stonefly_nymphs": 1.0,
        "mayfly_nymphs": 2.0,
        "caddisfly_larvae": 3.0,
        "freshwater_shrimp": 4.0,
        "dragonfly_nymphs": 5.0,
        "beetle_larvae": 5.0,
        "blackfly_larvae": 6.0,
        "pouch_snails": 7.0,
        "leeches": 8.0,
        "midges_bloodworms": 8.0,
        "tubifex_worms": 10.0,
    }
    
    total_bmwp = 0.0
    ept_count = 0
    if bio.stonefly_nymphs > 0:
        total_bmwp += bmwp_scores["stonefly_nymphs"]
        ept_count += 1
    if bio.mayfly_nymphs > 0:
        total_bmwp += bmwp_scores["mayfly_nymphs"]
        ept_count += 1
    if bio.caddisfly_larvae > 0:
        total_bmwp += bmwp_scores["caddisfly_larvae"]
        ept_count += 1
    if bio.dragonfly_nymphs > 0:
        total_bmwp += bmwp_scores["dragonfly_nymphs"]
    if bio.freshwater_shrimp > 0:
        total_bmwp += bmwp_scores["freshwater_shrimp"]
    if bio.beetle_larvae > 0:
        total_bmwp += bmwp_scores["beetle_larvae"]
    if bio.blackfly_larvae > 0:
        total_bmwp += bmwp_scores["blackfly_larvae"]
    if bio.pouch_snails > 0:
        total_bmwp += bmwp_scores["pouch_snails"]
    if bio.leeches > 0:
        total_bmwp += bmwp_scores["leeches"]
    if bio.midges_bloodworms > 0:
        total_bmwp += bmwp_scores["midges_bloodworms"]
    if bio.tubifex_worms > 0:
        total_bmwp += bmwp_scores["tubifex_worms"]

    # Calculate FBI
    weighted_tolerance_sum = (
        bio.stonefly_nymphs * tolerance_values["stonefly_nymphs"] +
        bio.mayfly_nymphs * tolerance_values["mayfly_nymphs"] +
        bio.caddisfly_larvae * tolerance_values["caddisfly_larvae"] +
        bio.freshwater_shrimp * tolerance_values["freshwater_shrimp"] +
        bio.dragonfly_nymphs * tolerance_values["dragonfly_nymphs"] +
        bio.beetle_larvae * tolerance_values["beetle_larvae"] +
        bio.blackfly_larvae * tolerance_values["blackfly_larvae"] +
        bio.pouch_snails * tolerance_values["pouch_snails"] +
        bio.leeches * tolerance_values["leeches"] +
        bio.midges_bloodworms * tolerance_values["midges_bloodworms"] +
        bio.tubifex_worms * tolerance_values["tubifex_worms"]
    )
    total_individuals = (
        bio.stonefly_nymphs + bio.mayfly_nymphs + bio.caddisfly_larvae +
        bio.freshwater_shrimp + bio.dragonfly_nymphs + bio.beetle_larvae +
        bio.blackfly_larvae + bio.pouch_snails + bio.leeches +
        bio.midges_bloodworms + bio.tubifex_worms
    )
    
    if total_individuals > 0:
        fbi_score = round(weighted_tolerance_sum / total_individuals, 2)
        # Interpret BMWP
        if total_bmwp >= 70.0:
            bmwp_class = "Category I: Unpolluted / High Quality"
        elif total_bmwp >= 40.0:
            bmwp_class = "Category II: Clean / Moderate Quality"
        elif total_bmwp >= 20.0:
            bmwp_class = "Category III: Moderately Impacted"
        elif total_bmwp >= 10.0:
            bmwp_class = "Category IV: Polluted"
        else:
            bmwp_class = "Category V: Heavily Degraded"
            
        # Interpret FBI
        if fbi_score <= 3.75:
            organic_pollution = "Excellent (No apparent organic pollution)"
        elif fbi_score <= 5.0:
            organic_pollution = "Good (Slight organic pollution)"
        elif fbi_score <= 6.5:
            organic_pollution = "Fair (Moderate organic pollution)"
        elif fbi_score <= 7.5:
            organic_pollution = "Poor (Substantial organic pollution)"
        else:
            organic_pollution = "Very Poor (Severe organic pollution)"
    else:
        fbi_score = 0.0
        bmwp_class = "Not Sampled (No macroinvertebrates recorded)"
        organic_pollution = "Not Sampled (No macroinvertebrates recorded)"
        
    return BiologicalIndices(
        bmwp_score=round(total_bmwp, 1),
        bmwp_class=bmwp_class,
        ept_count=ept_count,
        fbi_score=fbi_score,
        organic_pollution_level=organic_pollution
    )

def compute_ecological_health(readings: PhysicalChemicalReadings, bio: BioIndicators) -> EcologicalHealth:
    """Combine chemical and biological health to determine overall stream ecosystem resilience."""
    wqi_score, wqi_rating, do_sat_pct = compute_water_quality_index(readings)
    bio_indices = compute_biological_indices(bio)
    
    # Scale BMWP score to 0-100 (BMWP >= 80 is 100)
    bmwp_normalized = min(100.0, (bio_indices.bmwp_score / 80.0) * 100.0)
    # Scale FBI score (0 is 100, 10 is 0)
    fbi_normalized = max(0.0, (10.0 - bio_indices.fbi_score) * 10.0)
    
    # Bio composite
    bio_composite = (bmwp_normalized * 0.6) + (fbi_normalized * 0.4)
    
    # If no macroinvertebrates were logged, bio_composite defaults to WQI score
    total_bugs = (
        bio.stonefly_nymphs + bio.mayfly_nymphs + bio.caddisfly_larvae +
        bio.freshwater_shrimp + bio.dragonfly_nymphs + bio.beetle_larvae +
        bio.blackfly_larvae + bio.pouch_snails + bio.leeches +
        bio.midges_bloodworms + bio.tubifex_worms
    )
    if total_bugs == 0:
        ehi_score = wqi_score
    else:
        ehi_score = (wqi_score * 0.55) + (bio_composite * 0.45)
        
    # Penalty for fish mortality
    if bio.dead_fish_observed > 0:
        mortality_penalty = min(30.0, bio.dead_fish_observed * 10.0)
        ehi_score = max(5.0, ehi_score - mortality_penalty)
        
    ehi_score = round(max(0.0, min(100.0, ehi_score)), 1)
    
    if ehi_score >= 80.0:
        ehi_rating = "Pristine / High Ecological Integrity"
        resilience_tier = "Resilient"
    elif ehi_score >= 60.0:
        ehi_rating = "Healthy Aquatic Ecosystem"
        resilience_tier = "Stable"
    elif ehi_score >= 40.0:
        ehi_rating = "Vulnerable / Moderately Stressed"
        resilience_tier = "Vulnerable"
    elif ehi_score >= 20.0:
        ehi_rating = "Impaired / Low Bio-Resilience"
        resilience_tier = "Impaired"
    else:
        ehi_rating = "Critically Degraded / Collapse Risk"
        resilience_tier = "Collapsing"
        
    return EcologicalHealth(
        wqi_score=wqi_score,
        wqi_rating=wqi_rating,
        ehi_score=ehi_score,
        ehi_rating=ehi_rating,
        dissolved_oxygen_saturation_pct=do_sat_pct,
        resilience_tier=resilience_tier
    )
