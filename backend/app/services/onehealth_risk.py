"""One Health risk assessment engine bridging freshwater ecology to human and animal health."""
from typing import List, Tuple
from ..models.observation import (
    PhysicalChemicalReadings,
    BioIndicators,
    VisualObservations,
    FlowRate,
    WaterOdor,
    SurfaceSheen,
    TrashDensity
)
from ..models.onehealth import (
    RiskLevel,
    AdvisoryStatus,
    PublicHealthHazards,
    EcologicalHealth,
    BiologicalIndices,
    OneHealthAssessment,
    AIValidationResult
)

def evaluate_pathogen_risk(
    readings: PhysicalChemicalReadings,
    bio: BioIndicators,
    visual: VisualObservations
) -> Tuple[RiskLevel, float, List[str]]:
    """Evaluate waterborne bacterial and enteric pathogen risk (e.g. E. coli, Leptospira, Salmonella)."""
    score = 15.0  # Baseline low risk in natural waters
    vectors = []
    
    # Turbidity as a prime surrogate for sediment-bound microbial contamination and stormwater wash-off
    if readings.turbidity_ntu > 50.0:
        score += 30.0
        vectors.append("Severe turbidity (>50 NTU) indicates heavy sediment and pathogen runoff")
    elif readings.turbidity_ntu > 20.0:
        score += 18.0
        vectors.append("Elevated turbidity (>20 NTU) correlates with suspended microbial carriers")
    elif readings.turbidity_ntu > 10.0:
        score += 8.0

    # Recent heavy rainfall causes Combined Sewer Overflow (CSO) and surface wash
    if visual.recent_heavy_rainfall:
        score += 20.0
        vectors.append("Recent heavy rainfall triggers urban stormwater flush and sewer overflow potential")

    # Sewage / sulfur odor is a direct flag of fecal or septic discharge
    if visual.water_odor == WaterOdor.SEWAGE_SULFUR:
        score += 35.0
        vectors.append("Detectable sewage/hydrogen sulfide odor indicates raw sanitary wastewater entry")
    elif visual.water_odor == WaterOdor.FISHY_DECAY:
        score += 15.0
        vectors.append("Organic decay odor indicates decomposing biological matter")

    # Temperature acceleration of enteric bacteria replication
    if readings.temperature_c >= 22.0:
        score += 10.0
        vectors.append("Warm water (>22°C) accelerates coliform and environmental bacterial incubation")
        
    # Nitrate elevation from agricultural or sewage sources
    if readings.nitrate_mg_l and readings.nitrate_mg_l > 10.0:
        score += 15.0
        vectors.append(f"Elevated nitrates ({readings.nitrate_mg_l} mg/L) confirm wastewater or agricultural manure contamination")

    # Benthic biological indicators of organic sewage
    if bio.tubifex_worms > 15 or bio.midges_bloodworms > 20:
        score += 15.0
        vectors.append("Dominance of tubifex and bloodworms reflects chronic organic sludge accumulation")

    score = round(max(5.0, min(100.0, score)), 1)
    
    if score >= 75.0:
        level = RiskLevel.CRITICAL
    elif score >= 50.0:
        level = RiskLevel.HIGH
    elif score >= 30.0:
        level = RiskLevel.MODERATE
    else:
        level = RiskLevel.LOW
        
    if not vectors:
        vectors.append("Low pathogen indicators; baseline ambient stream conditions")
        
    return level, score, vectors

def evaluate_vector_borne_hazard(
    readings: PhysicalChemicalReadings,
    bio: BioIndicators,
    visual: VisualObservations
) -> Tuple[RiskLevel, float, str]:
    """Evaluate mosquito and disease-vector breeding hazard (Culex pipiens / West Nile / arboviruses)."""
    score = 10.0
    notes = []
    
    # Flow condition is paramount: mosquito larvae require calm/stagnant water
    if visual.flow_rate == FlowRate.STAGNANT_POOLS:
        score += 40.0
        notes.append("Stagnant standing pools create optimal, undisturbed mosquito oviposition habitat")
    elif visual.flow_rate == FlowRate.SLOW_TRICKLE:
        score += 20.0
        notes.append("Slow trickle flow allows marginal pool stagnation suitable for larval development")
    elif visual.flow_rate == FlowRate.MODERATE_RIFFLE:
        score -= 5.0  # Moving water disrupts surface tension and dislodges larvae
    elif visual.flow_rate == FlowRate.TORRENTIAL_SPATE:
        score -= 10.0

    # Temperature suitability for Culex mosquito life cycle
    if 20.0 <= readings.temperature_c <= 32.0:
        score += 25.0
        notes.append(f"Water temperature ({readings.temperature_c}°C) accelerates mosquito larval instars to ~6-8 days")
    elif readings.temperature_c > 15.0:
        score += 10.0

    # Predator exclusion via hypoxia:
    # If DO < 3.5 mg/L, predatory fish (Gambusia, stickleback) and dragonfly nymphs die off,
    # but mosquito larvae (which breathe atmospheric oxygen via respiratory siphons) thrive!
    if readings.dissolved_oxygen_mg_l < 3.5:
        score += 25.0
        notes.append("Severe hypoxia (<3.5 mg/L DO) eliminates aquatic mosquito predators while larvae breathe air")
    elif bio.dragonfly_nymphs > 3 or bio.live_fish_observed > 0:
        score -= 15.0
        notes.append("Abundant aquatic predators (dragonfly nymphs / fish) provide natural biocontrol")

    # Organic nutrients / detritus serve as larval food
    if visual.trash_density in (TrashDensity.MODERATE, TrashDensity.SEVERE) or bio.algal_cover_pct > 30.0:
        score += 10.0
        notes.append("Organic detritus and algal mats provide shelter and microbial nourishment for larvae")

    score = round(max(5.0, min(100.0, score)), 1)
    
    if score >= 70.0:
        level = RiskLevel.CRITICAL
    elif score >= 45.0:
        level = RiskLevel.HIGH
    elif score >= 25.0:
        level = RiskLevel.MODERATE
    else:
        level = RiskLevel.LOW
        
    summary_notes = "; ".join(notes) if notes else "Flow velocity and biological predation maintain low vector breeding hazard."
    return level, score, summary_notes

def evaluate_cyanobacterial_hab_risk(
    readings: PhysicalChemicalReadings,
    bio: BioIndicators,
    visual: VisualObservations,
    do_sat_pct: float
) -> Tuple[RiskLevel, float, str]:
    """Evaluate Harmful Cyanobacterial Algae Bloom (HAB) risk producing microcystins and dermatotoxins."""
    score = 10.0
    notes = []
    
    # Warm water favor cyanobacterial growth over green algae
    if readings.temperature_c >= 22.0:
        score += 25.0
        notes.append(f"Warm thermal conditions ({readings.temperature_c}°C) favor cyanobacterial dominance")
        
    # High phosphate triggers blooms
    if readings.phosphate_mg_l and readings.phosphate_mg_l >= 0.1:
        score += 25.0
        notes.append(f"Elevated orthophosphate ({readings.phosphate_mg_l} mg/L) exceeds eutrophication trigger threshold")

    # Extreme daytime DO supersaturation or nocturnal depletion
    if do_sat_pct >= 125.0:
        score += 25.0
        notes.append(f"Intense photosynthetic oxygen supersaturation ({do_sat_pct}%) indicates rapid algal bloom activity")
    elif bio.algal_cover_pct >= 40.0:
        score += 20.0
        notes.append(f"High macroscopic algal benthic/surface cover ({bio.algal_cover_pct}%)")

    # Alkaline pH driven by carbon dioxide uptake
    if readings.ph >= 8.5:
        score += 15.0
        notes.append(f"Alkaline pH ({readings.ph}) aligns with hyper-productive photosynthetic carbon consumption")

    # Scum/foam or stagnant water
    if visual.surface_sheen == SurfaceSheen.SCUM_FOAM or visual.flow_rate == FlowRate.STAGNANT_POOLS:
        score += 15.0
        notes.append("Surface scum accumulation and stagnation amplify cyanobacterial cyanotoxin concentration")

    score = round(max(5.0, min(100.0, score)), 1)
    
    if score >= 70.0:
        level = RiskLevel.CRITICAL
    elif score >= 45.0:
        level = RiskLevel.HIGH
    elif score >= 25.0:
        level = RiskLevel.MODERATE
    else:
        level = RiskLevel.LOW
        
    summary_notes = "; ".join(notes) if notes else "Nutrient levels and flow velocity suppress harmful cyanobacteria proliferation."
    return level, score, summary_notes

def evaluate_public_health_hazards(
    readings: PhysicalChemicalReadings,
    bio: BioIndicators,
    visual: VisualObservations,
    do_sat_pct: float
) -> PublicHealthHazards:
    """Consolidate public health hazards into unified vector assessment."""
    p_level, p_score, p_vectors = evaluate_pathogen_risk(readings, bio, visual)
    v_level, v_score, v_notes = evaluate_vector_borne_hazard(readings, bio, visual)
    hab_level, hab_score, hab_notes = evaluate_cyanobacterial_hab_risk(readings, bio, visual, do_sat_pct)
    
    # Determine recreational advisory
    if p_level == RiskLevel.CRITICAL or hab_level == RiskLevel.CRITICAL or readings.ph < 5.0 or readings.ph > 9.5:
        recreation = AdvisoryStatus.UNSAFE
        primary_driver = "Acute Pathogen Contamination or Toxic Algal Risk"
    elif p_level == RiskLevel.HIGH or hab_level == RiskLevel.HIGH or readings.turbidity_ntu > 40.0:
        recreation = AdvisoryStatus.CAUTION
        primary_driver = "Elevated Turbidity / Pathogen Loading"
    else:
        recreation = AdvisoryStatus.SAFE
        primary_driver = "Parameters Within Safe Recreational Thresholds"
        
    # Pet & wildlife hazard (dogs are especially vulnerable to cyanotoxins and leptospirosis)
    if hab_level in (RiskLevel.HIGH, RiskLevel.CRITICAL) or p_level == RiskLevel.CRITICAL:
        pet_hazard = AdvisoryStatus.UNSAFE
    elif p_level == RiskLevel.HIGH or visual.surface_sheen == SurfaceSheen.PETROLEUM_RAINBOW:
        pet_hazard = AdvisoryStatus.CAUTION
    else:
        pet_hazard = AdvisoryStatus.SAFE
        
    return PublicHealthHazards(
        waterborne_pathogen_risk=p_level,
        pathogen_risk_score=p_score,
        pathogen_vectors=p_vectors,
        vector_borne_hazard=v_level,
        vector_risk_score=v_score,
        vector_notes=v_notes,
        cyanobacterial_hab_risk=hab_level,
        hab_risk_score=hab_score,
        hab_notes=hab_notes,
        recreational_advisory=recreation,
        pet_and_wildlife_hazard=pet_hazard,
        primary_hazard_driver=primary_driver
    )

def synthesize_one_health_assessment(
    eco: EcologicalHealth,
    bio_indices: BiologicalIndices,
    hazards: PublicHealthHazards,
    validation: AIValidationResult,
    stream_name: str
) -> OneHealthAssessment:
    """Synthesize composite One Health score, actionable recommendations, and plain-language summary."""
    # Composite score formula (0-100, where 100 is optimal health for ecology and community):
    # EHI weight: 40%
    # Inverted Pathogen Risk: 25% (100 - p_score)
    # Inverted Vector Risk: 20% (100 - v_score)
    # Inverted HAB Risk: 15% (100 - hab_score)
    composite = (
        (eco.ehi_score * 0.40) +
        ((100.0 - hazards.pathogen_risk_score) * 0.25) +
        ((100.0 - hazards.vector_risk_score) * 0.20) +
        ((100.0 - hazards.hab_risk_score) * 0.15)
    )
    composite = round(max(0.0, min(100.0, composite)), 1)
    
    if composite >= 85.0:
        tier = "Thriving Stream & Healthy Community"
    elif composite >= 70.0:
        tier = "Balanced Ecosystem / Low Community Risk"
    elif composite >= 50.0:
        tier = "Stressed Ecosystem / Moderate One Health Risk"
    elif composite >= 30.0:
        tier = "Degraded / High Public Health Exposure"
    else:
        tier = "Hazardous / Ecological & Sanitary Emergency"

    # Actionable interventions for municipal authorities and community stewards
    actions = []
    alerts = []
    
    if hazards.recreational_advisory == AdvisoryStatus.UNSAFE:
        alerts.append(f"PUBLIC HEALTH ALERT: Post contact prohibition signs along {stream_name} due to elevated pathogen/toxin indicators.")
        actions.append("Dispatch municipal environmental health team for microbial culture & source tracking.")
        
    if hazards.vector_borne_hazard in (RiskLevel.HIGH, RiskLevel.CRITICAL):
        alerts.append("VECTOR HAZARD TRIGGER: Stagnant, hypoxic conditions are actively promoting mosquito vector breeding.")
        actions.append("Clear culvert blockages or introduce aeration / biological larvicide (Bti) in standing pools.")
        
    if hazards.cyanobacterial_hab_risk in (RiskLevel.HIGH, RiskLevel.CRITICAL):
        alerts.append("HAB WARNING: High nutrient and thermal load creating dangerous conditions for cyanotoxin release.")
        actions.append("Restrict pet and livestock access immediately; inspect upstream stormwater for fertilizer/sewage runoff.")
        
    if eco.resilience_tier in ("Impaired", "Collapsing"):
        actions.append("Initiate riparian zone restoration, native tree planting for shade cooling, and gravel bed scouring.")
        
    if not actions:
        actions.append("Continue regular bi-weekly citizen science monitoring to maintain watershed baseline.")
        actions.append("Protect existing riparian buffer zones and native stream canopy cover.")
        
    # Plain language ecological summary for citizen scientists
    if "Not Sampled" in bio_indices.bmwp_class:
        bio_clause = "Benthic macroinvertebrate sampling was not conducted for this survey."
    else:
        bio_clause = (
            f"From a biological perspective, sensitive aquatic macroinvertebrates (EPT taxa) totaled {bio_indices.ept_count}, "
            f"yielding a BMWP rating of '{bio_indices.bmwp_class}'."
        )

    plain_summary = (
        f"{stream_name} presents an overall One Health Score of {composite}/100 ({tier}). "
        f"The stream's ecological health is evaluated as {eco.ehi_rating.lower()} (WQI: {eco.wqi_score}, EHI: {eco.ehi_score}). "
        f"{bio_clause} "
        f"For the surrounding human community, recreational contact is currently rated as '{hazards.recreational_advisory.value}', "
        f"with pathogen risk scored at {hazards.pathogen_risk_score}/100 and disease vector hazard scored at {hazards.vector_risk_score}/100."
    )
    
    return OneHealthAssessment(
        composite_one_health_score=composite,
        one_health_tier=tier,
        ecological_health=eco,
        biological_indices=bio_indices,
        public_health_hazards=hazards,
        validation=validation,
        plain_language_summary=plain_summary,
        actionable_interventions=actions,
        early_warning_alerts=alerts
    )
