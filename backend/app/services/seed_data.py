"""Seed data generator providing diverse real-world urban stream baselines and historical records.
Supports official OneAquaHealth international river basin pilot locations:
- Coimbra, Portugal (Mondego River Basin / Ribeira de Coselhas) [Primary EU Pilot]
- Benevento, Italy (Calore River / Sabato River Basin) [EU Pilot]
- Oslo, Norway (Akerselva / Alna River Basin) [EU Pilot]
- Portland, USA (Columbia Slough / Lower Willamette Basin) [US Case Study]
"""
from __future__ import annotations
import uuid
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from ..models.observation import (
    CitizenObservationCreate,
    PhysicalChemicalReadings,
    BioIndicators,
    VisualObservations,
    WaterClarity,
    WaterOdor,
    SurfaceSheen,
    FlowRate,
    TrashDensity
)
from ..models.onehealth import StreamObservationRecord
from .water_quality import compute_ecological_health, compute_biological_indices
from .onehealth_risk import evaluate_public_health_hazards, synthesize_one_health_assessment
from .ai_validator import validate_stream_observation

PILOT_ALIASES: dict[str, list[str]] = {
    "coimbra": [
        "coimbra", "mondego", "coselhas", "ribeira de coselhas",
        "choupal", "eiras", "são martinho", "sao martinho", "portugal"
    ],
    "benevento": [
        "benevento", "calore", "sabato", "fiume calore", "fiume sabato",
        "san nicola", "pantano", "rione libertà", "rione liberta", "serretelle", "italy", "italia"
    ],
    "oslo": [
        "oslo", "akerselva", "alna", "alnaelva", "hovinbekken",
        "maridalsvannet", "nydalen", "grünerløkka", "grunerlokka", "kvernerbyen", "kværnerbyen", "grorud", "ensjø", "ensjo", "norway", "norge"
    ],
    "portland": [
        "portland", "columbia", "columbia slough", "willamette", "lower willamette",
        "silver creek", "willowbrook", "meadowlark", "oaks bottom", "laurelhurst",
        "tryon", "johnson creek", "crystal springs", "sullivan", "balch", "fanno",
        "oregon", "usa", "united states"
    ]
}

def resolve_pilot_id(query_str: Optional[str]) -> Optional[str]:
    """Resolve any pilot city name, basin name, country, or alias to a canonical pilot ID."""
    if not query_str:
        return None
    q = query_str.lower().strip()
    if q in ("all", "global", "*") or "global" in q or "all basins" in q or "oneaquahealth network" in q:
        return "all"
    if q in PILOT_ALIASES:
        return q
    for pilot_id, aliases in PILOT_ALIASES.items():
        for alias in aliases:
            if alias in q or (len(q) >= 3 and q in alias):
                return pilot_id
    return None

def infer_pilot_city(lat: float, lon: float, catchment: str = "", stream_name: str = "") -> str:
    """Infer pilot city from coordinates or catchment/stream names."""
    if 39.5 <= lat <= 41.0 and -9.5 <= lon <= -7.5:
        return "coimbra"
    if 40.5 <= lat <= 42.0 and 13.5 <= lon <= 16.0:
        return "benevento"
    if 59.0 <= lat <= 61.0 and 9.5 <= lon <= 12.0:
        return "oslo"
    if 44.5 <= lat <= 46.5 and -124.5 <= lon <= -121.0:
        return "portland"
    
    text = f"{catchment} {stream_name}".lower()
    for pilot_id, aliases in PILOT_ALIASES.items():
        if any(alias in text for alias in aliases):
            return pilot_id
            
    return "portland"

def create_processed_record(obs: CitizenObservationCreate, record_id: str | None = None, timestamp: str | None = None) -> StreamObservationRecord:
    rec_id = record_id or f"obs-{uuid.uuid4().hex[:8]}"
    st_id = obs.station_id or f"STA-{rec_id[-4:]}"
    ts = timestamp or obs.timestamp or datetime.now(timezone.utc).isoformat()
    
    validation = validate_stream_observation(obs)
    eco = compute_ecological_health(obs.readings, obs.bio)
    bio_idx = compute_biological_indices(obs.bio)
    hazards = evaluate_public_health_hazards(obs.readings, obs.bio, obs.visual, eco.dissolved_oxygen_saturation_pct)
    assessment = synthesize_one_health_assessment(eco, bio_idx, hazards, validation, obs.stream_name)
    
    # Dynamic count of FHIR resources generated: 4 core + RiskAssessment + optional parameters
    fhir_count = 5
    if obs.readings.conductivity_us_cm is not None:
        fhir_count += 1
    if obs.readings.nitrate_mg_l is not None:
        fhir_count += 1
    if obs.readings.phosphate_mg_l is not None:
        fhir_count += 1

    pilot = None
    if obs.pilot_city:
        resolved = resolve_pilot_id(obs.pilot_city)
        if resolved and resolved != "all":
            pilot = resolved
        else:
            pilot = obs.pilot_city.strip().lower()
    if not pilot:
        pilot = infer_pilot_city(obs.latitude, obs.longitude, obs.catchment_basin, obs.stream_name)

    return StreamObservationRecord(
        id=rec_id,
        station_id=st_id,
        stream_name=obs.stream_name,
        latitude=obs.latitude,
        longitude=obs.longitude,
        catchment_basin=obs.catchment_basin,
        pilot_city=pilot,
        timestamp=ts,
        observer_name=obs.observer_name,
        observer_tier=obs.observer_tier,
        notes=obs.notes,
        readings=obs.readings,
        bio=obs.bio,
        visual=obs.visual,
        assessment=assessment,
        fhir_observation_count=fhir_count
    )

def generate_seed_stream_records() -> List[StreamObservationRecord]:
    """Generate diverse urban stream stations across international pilot river basins."""
    base_time = datetime.now(timezone.utc)
    
    seed_inputs = [
        # =========================================================================
        # 1. COIMBRA, PORTUGAL (Mondego River Basin / Ribeira de Coselhas) [Primary EU Pilot]
        # =========================================================================
        # 1.1 Ribeira de Coselhas - Linear Park (Urban Stressed / Stormwater Runoff)
        CitizenObservationCreate(
            station_id="PRT-COI-001",
            stream_name="Ribeira de Coselhas - Parque Linear",
            latitude=40.2285,
            longitude=-8.4280,
            catchment_basin="Ribeira de Coselhas / Mondego Basin",
            pilot_city="coimbra",
            observer_name="Eng. Miguel Ferreira",
            observer_tier="Trained Streamkeeper",
            notes="Urban linear park segment of Ribeira de Coselhas. Stormwater culvert input visible, moderate urban runoff and plastic litter.",
            readings=PhysicalChemicalReadings(
                temperature_c=19.8,
                ph=7.2,
                dissolved_oxygen_mg_l=5.6,
                turbidity_ntu=24.0,
                conductivity_us_cm=480.0,
                nitrate_mg_l=6.2,
                phosphate_mg_l=0.22
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=2,
                caddisfly_larvae=2,
                dragonfly_nymphs=3,
                beetle_larvae=2,
                blackfly_larvae=6,
                midges_bloodworms=14,
                tubifex_worms=10,
                leeches=3,
                pouch_snails=8,
                algal_cover_pct=28.0,
                live_fish_observed=2
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.SLIGHTLY_TURBID,
                water_odor=WaterOdor.EARTHY_MUSTY,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.MODERATE
            )
        ),
        
        # 1.2 Ribeira de Coselhas - Headwaters Alto dos Gaios (Pristine Mediterranean)
        CitizenObservationCreate(
            station_id="PRT-COI-002",
            stream_name="Ribeira de Coselhas - Nascente Alto dos Gaios",
            latitude=40.2450,
            longitude=-8.4120,
            catchment_basin="Ribeira de Coselhas Headwaters",
            pilot_city="coimbra",
            observer_name="Dr. Sofia Carriço",
            observer_tier="Field Biologist",
            notes="Mediterranean oak and pine headwater reach. Pristine crystal flow over limestone gravel substrate with sensitive stonefly nymphs.",
            readings=PhysicalChemicalReadings(
                temperature_c=15.2,
                ph=7.6,
                dissolved_oxygen_mg_l=9.9,
                turbidity_ntu=2.2,
                conductivity_us_cm=110.0,
                nitrate_mg_l=0.6,
                phosphate_mg_l=0.02
            ),
            bio=BioIndicators(
                stonefly_nymphs=7,
                mayfly_nymphs=14,
                caddisfly_larvae=12,
                freshwater_shrimp=8,
                dragonfly_nymphs=2,
                beetle_larvae=4,
                algal_cover_pct=6.0,
                live_fish_observed=7
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # 1.3 Rio Mondego - Parque Verde do Mondego (Recreational River Embankment / Caution)
        CitizenObservationCreate(
            station_id="PRT-COI-003",
            stream_name="Rio Mondego - Parque Verde do Mondego",
            latitude=40.2030,
            longitude=-8.4265,
            catchment_basin="Lower Mondego River Basin",
            pilot_city="coimbra",
            observer_name="Tiago Antunes",
            observer_tier="Citizen Volunteer",
            notes="Recreational river embankment near Santa Clara bridge and rowing clubs. High public water sports contact; warm surface water with moderate cyanobacteria risk.",
            readings=PhysicalChemicalReadings(
                temperature_c=22.4,
                ph=8.3,
                dissolved_oxygen_mg_l=7.8,
                turbidity_ntu=12.5,
                conductivity_us_cm=310.0,
                nitrate_mg_l=3.4,
                phosphate_mg_l=0.15
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=4,
                caddisfly_larvae=3,
                dragonfly_nymphs=5,
                freshwater_shrimp=3,
                midges_bloodworms=8,
                pouch_snails=6,
                algal_cover_pct=35.0,
                live_fish_observed=5
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.SLIGHTLY_TURBID,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.SCUM_FOAM,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.LOW
            )
        ),

        # 1.4 Vala do Choupal - Mata Nacional do Choupal (Riparian Wetland Reserve)
        CitizenObservationCreate(
            station_id="PRT-COI-004",
            stream_name="Vala do Choupal - Mata Nacional do Choupal",
            latitude=40.2190,
            longitude=-8.4390,
            catchment_basin="Choupal Riparian Sanctuary",
            pilot_city="coimbra",
            observer_name="Dr. Sofia Carriço",
            observer_tier="Field Biologist",
            notes="Historic black poplar floodplain forest canal. Strong biological filtration capacity, native freshwater turtle and amphibian habitat.",
            readings=PhysicalChemicalReadings(
                temperature_c=16.8,
                ph=7.4,
                dissolved_oxygen_mg_l=8.6,
                turbidity_ntu=4.1,
                conductivity_us_cm=165.0,
                nitrate_mg_l=1.4,
                phosphate_mg_l=0.04
            ),
            bio=BioIndicators(
                stonefly_nymphs=3,
                mayfly_nymphs=9,
                caddisfly_larvae=8,
                freshwater_shrimp=10,
                dragonfly_nymphs=6,
                beetle_larvae=4,
                algal_cover_pct=12.0,
                live_fish_observed=9
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NATURAL_BIOGENIC,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # 1.5 Ribeira de São Martinho (Agricultural Outflow / HAB Risk)
        CitizenObservationCreate(
            station_id="PRT-COI-005",
            stream_name="Ribeira de São Martinho - Agricultural Outflow",
            latitude=40.1980,
            longitude=-8.4480,
            catchment_basin="Mondego Agricultural Valley",
            pilot_city="coimbra",
            observer_name="Beatriz Lopes",
            observer_tier="Trained Streamkeeper",
            notes="Peri-urban drainage ditch subject to agricultural irrigation runoff and fertilizer influx. High pH from algal bloom photosynthetic activity.",
            readings=PhysicalChemicalReadings(
                temperature_c=23.5,
                ph=8.8,
                dissolved_oxygen_mg_l=12.8,
                turbidity_ntu=32.0,
                conductivity_us_cm=540.0,
                nitrate_mg_l=15.8,
                phosphate_mg_l=0.58
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=1,
                caddisfly_larvae=0,
                dragonfly_nymphs=4,
                midges_bloodworms=22,
                tubifex_worms=16,
                leeches=4,
                pouch_snails=12,
                algal_cover_pct=70.0,
                dead_fish_observed=1,
                live_fish_observed=1
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.MURKY,
                water_odor=WaterOdor.FISHY_DECAY,
                surface_sheen=SurfaceSheen.SCUM_FOAM,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.LOW
            )
        ),

        # 1.6 Ribeira de Eiras - Industrial Culvert (Acute Pathogen Risk after Rain)
        CitizenObservationCreate(
            station_id="PRT-COI-006",
            stream_name="Ribeira de Eiras - Industrial Culvert",
            latitude=40.2410,
            longitude=-8.4350,
            catchment_basin="Northern Coimbra Industrial Catchment",
            pilot_city="coimbra",
            observer_name="Eng. Miguel Ferreira",
            observer_tier="Trained Streamkeeper",
            notes="Outfall downstream of commercial zone. Acute grey turbidity, hydrogen sulfide sewer smell, and severe pathogen vector indicators after rainfall.",
            readings=PhysicalChemicalReadings(
                temperature_c=20.6,
                ph=6.6,
                dissolved_oxygen_mg_l=3.8,
                turbidity_ntu=78.0,
                conductivity_us_cm=820.0,
                nitrate_mg_l=13.2,
                phosphate_mg_l=0.42
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=0,
                caddisfly_larvae=0,
                midges_bloodworms=28,
                tubifex_worms=35,
                leeches=9,
                pouch_snails=15,
                algal_cover_pct=22.0,
                dead_fish_observed=2,
                live_fish_observed=0
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.OPAQUE,
                water_odor=WaterOdor.SEWAGE_SULFUR,
                surface_sheen=SurfaceSheen.SCUM_FOAM,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=True,
                trash_density=TrashDensity.SEVERE
            )
        ),

        # =========================================================================
        # 2. BENEVENTO, ITALY (Calore River / Sabato River Basin) [EU Pilot]
        # =========================================================================
        # 2.1 Fiume Calore - Ponte Vanvitelli (Historic Center Crossing)
        CitizenObservationCreate(
            station_id="ITA-BEN-001",
            stream_name="Fiume Calore - Ponte Vanvitelli",
            latitude=41.1320,
            longitude=14.7730,
            catchment_basin="Calore River Urban Reach",
            pilot_city="benevento",
            observer_name="Dr. Marco Esposito",
            observer_tier="Field Biologist",
            notes="Historic bridge crossing through central Benevento. Riverbed exposed to urban stormwater overflow and municipal effluent plumes.",
            readings=PhysicalChemicalReadings(
                temperature_c=20.2,
                ph=7.3,
                dissolved_oxygen_mg_l=6.4,
                turbidity_ntu=28.0,
                conductivity_us_cm=520.0,
                nitrate_mg_l=7.5,
                phosphate_mg_l=0.26
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=3,
                caddisfly_larvae=2,
                dragonfly_nymphs=3,
                blackfly_larvae=8,
                midges_bloodworms=18,
                tubifex_worms=14,
                pouch_snails=9,
                algal_cover_pct=30.0,
                live_fish_observed=2
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.SLIGHTLY_TURBID,
                water_odor=WaterOdor.EARTHY_MUSTY,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.MODERATE
            )
        ),

        # 2.2 Fiume Sabato - Confluenza Calore (Stagnant River Confluence / Vector Hazard)
        CitizenObservationCreate(
            station_id="ITA-BEN-002",
            stream_name="Fiume Sabato - Confluenza Calore",
            latitude=41.1360,
            longitude=14.7670,
            catchment_basin="Sabato River Confluence",
            pilot_city="benevento",
            observer_name="Giulia De Luca",
            observer_tier="Trained Streamkeeper",
            notes="Confluence reach of rivers Sabato and Calore. Stagnant sandbank pools during summer drought favoring Culex mosquito breeding vectors.",
            readings=PhysicalChemicalReadings(
                temperature_c=26.0,
                ph=7.5,
                dissolved_oxygen_mg_l=2.6,
                turbidity_ntu=22.0,
                conductivity_us_cm=440.0,
                nitrate_mg_l=4.8,
                phosphate_mg_l=0.20
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=0,
                caddisfly_larvae=0,
                dragonfly_nymphs=1,
                midges_bloodworms=34,
                tubifex_worms=26,
                leeches=7,
                pouch_snails=14,
                algal_cover_pct=48.0,
                live_fish_observed=0
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.MURKY,
                water_odor=WaterOdor.EARTHY_MUSTY,
                surface_sheen=SurfaceSheen.SCUM_FOAM,
                flow_rate=FlowRate.STAGNANT_POOLS,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.MODERATE
            )
        ),

        # 2.3 Torrente San Nicola - Parco Fluviale (Protected Riparian Nature Park)
        CitizenObservationCreate(
            station_id="ITA-BEN-003",
            stream_name="Torrente San Nicola - Parco Fluviale",
            latitude=41.1440,
            longitude=14.7890,
            catchment_basin="San Nicola Riparian Basin",
            pilot_city="benevento",
            observer_name="Dr. Marco Esposito",
            observer_tier="Field Biologist",
            notes="Suburban nature park reach with well-shaded willow canopy, restored riffle bed, and active macroinvertebrate colonization.",
            readings=PhysicalChemicalReadings(
                temperature_c=16.4,
                ph=7.7,
                dissolved_oxygen_mg_l=8.9,
                turbidity_ntu=4.5,
                conductivity_us_cm=180.0,
                nitrate_mg_l=1.8,
                phosphate_mg_l=0.05
            ),
            bio=BioIndicators(
                stonefly_nymphs=4,
                mayfly_nymphs=11,
                caddisfly_larvae=8,
                freshwater_shrimp=6,
                dragonfly_nymphs=5,
                beetle_larvae=4,
                algal_cover_pct=14.0,
                live_fish_observed=7
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.LOW
            )
        ),

        # 2.4 Fiume Calore - Pantano Floodplain (Agricultural Eutrophication)
        CitizenObservationCreate(
            station_id="ITA-BEN-004",
            stream_name="Fiume Calore - Pantano Floodplain",
            latitude=41.1250,
            longitude=14.7520,
            catchment_basin="Calore Agricultural Floodplain",
            pilot_city="benevento",
            observer_name="Antonio Rossi",
            observer_tier="Citizen Volunteer",
            notes="Lowland agricultural floodplain. Heavy synthetic fertilizer and animal husbandry runoff with severe cyanobacteria bloom.",
            readings=PhysicalChemicalReadings(
                temperature_c=24.1,
                ph=8.9,
                dissolved_oxygen_mg_l=13.5,
                turbidity_ntu=36.0,
                conductivity_us_cm=580.0,
                nitrate_mg_l=17.4,
                phosphate_mg_l=0.62
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=1,
                caddisfly_larvae=0,
                dragonfly_nymphs=3,
                midges_bloodworms=20,
                tubifex_worms=15,
                leeches=5,
                pouch_snails=11,
                algal_cover_pct=78.0,
                dead_fish_observed=1,
                live_fish_observed=1
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.MURKY,
                water_odor=WaterOdor.FISHY_DECAY,
                surface_sheen=SurfaceSheen.SCUM_FOAM,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.LOW
            )
        ),

        # 2.5 Fiume Sabato - Rione Libertà Bridge (CSO Event / Unsafe Public Health)
        CitizenObservationCreate(
            station_id="ITA-BEN-005",
            stream_name="Fiume Sabato - Rione Libertà Bridge",
            latitude=41.1210,
            longitude=14.7780,
            catchment_basin="Sabato Urban Corridor",
            pilot_city="benevento",
            observer_name="Giulia De Luca",
            observer_tier="Trained Streamkeeper",
            notes="High-density residential neighborhood reach. Active combined sewer overflow event after rain, foul sulfur odor, severe trash.",
            readings=PhysicalChemicalReadings(
                temperature_c=19.5,
                ph=6.8,
                dissolved_oxygen_mg_l=4.1,
                turbidity_ntu=82.0,
                conductivity_us_cm=790.0,
                nitrate_mg_l=12.8,
                phosphate_mg_l=0.40
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=0,
                caddisfly_larvae=0,
                midges_bloodworms=26,
                tubifex_worms=32,
                leeches=10,
                pouch_snails=16,
                algal_cover_pct=18.0,
                dead_fish_observed=2,
                live_fish_observed=0
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.OPAQUE,
                water_odor=WaterOdor.SEWAGE_SULFUR,
                surface_sheen=SurfaceSheen.SCUM_FOAM,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=True,
                trash_density=TrashDensity.SEVERE
            )
        ),

        # 2.6 Torrente Serretelle - Oasi Collinare (Apennine Foothill Headwaters)
        CitizenObservationCreate(
            station_id="ITA-BEN-006",
            stream_name="Torrente Serretelle - Oasi Collinare",
            latitude=41.1550,
            longitude=14.8150,
            catchment_basin="Serretelle Foothill Watershed",
            pilot_city="benevento",
            observer_name="Antonio Rossi",
            observer_tier="Citizen Volunteer",
            notes="Pristine mountain stream descending the Apennine foothills into the Benevento basin. Clear cold water, gravel banks.",
            readings=PhysicalChemicalReadings(
                temperature_c=13.8,
                ph=7.5,
                dissolved_oxygen_mg_l=10.3,
                turbidity_ntu=2.0,
                conductivity_us_cm=95.0,
                nitrate_mg_l=0.5,
                phosphate_mg_l=0.02
            ),
            bio=BioIndicators(
                stonefly_nymphs=6,
                mayfly_nymphs=13,
                caddisfly_larvae=10,
                freshwater_shrimp=7,
                dragonfly_nymphs=2,
                algal_cover_pct=8.0,
                live_fish_observed=6
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # =========================================================================
        # 3. OSLO, NORWAY (Akerselva / Alna River Basin) [EU Pilot]
        # =========================================================================
        # 3.1 Akerselva - Maridalsvannet Outflow (Boreal Cold Drinking Water Outlet)
        CitizenObservationCreate(
            station_id="NOR-OSL-001",
            stream_name="Akerselva - Maridalsvannet Outflow",
            latitude=59.9670,
            longitude=10.7810,
            catchment_basin="Akerselva Drinking Reservoir Basin",
            pilot_city="oslo",
            observer_name="Dr. Astrid Lindqvist",
            observer_tier="Field Biologist",
            notes="Direct outflow from city drinking reservoir into forested gorge. Sub-boreal cold waters with exceptionally high DO and stonefly fauna.",
            readings=PhysicalChemicalReadings(
                temperature_c=9.4,
                ph=7.2,
                dissolved_oxygen_mg_l=11.8,
                turbidity_ntu=1.6,
                conductivity_us_cm=65.0,
                nitrate_mg_l=0.3,
                phosphate_mg_l=0.01
            ),
            bio=BioIndicators(
                stonefly_nymphs=9,
                mayfly_nymphs=16,
                caddisfly_larvae=13,
                freshwater_shrimp=9,
                dragonfly_nymphs=1,
                algal_cover_pct=5.0,
                live_fish_observed=8
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # 3.2 Akerselva - Nydalen Falls & River Park (Urban Salmon Spawning & Bathing)
        CitizenObservationCreate(
            station_id="NOR-OSL-002",
            stream_name="Akerselva - Nydalen Falls & River Park",
            latitude=59.9510,
            longitude=10.7680,
            catchment_basin="Mid-Akerselva River Park",
            pilot_city="oslo",
            observer_name="Henrik Johansen",
            observer_tier="Trained Streamkeeper",
            notes="Restored urban river park with designated public bathing and salmon spawning ladder. Very good biological health.",
            readings=PhysicalChemicalReadings(
                temperature_c=12.8,
                ph=7.4,
                dissolved_oxygen_mg_l=10.4,
                turbidity_ntu=3.2,
                conductivity_us_cm=120.0,
                nitrate_mg_l=0.9,
                phosphate_mg_l=0.03
            ),
            bio=BioIndicators(
                stonefly_nymphs=5,
                mayfly_nymphs=11,
                caddisfly_larvae=9,
                freshwater_shrimp=6,
                dragonfly_nymphs=3,
                beetle_larvae=4,
                algal_cover_pct=12.0,
                live_fish_observed=9
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # 3.3 Akerselva - Grünerløkka Lower Falls (Vibrant Urban Reach / Recreational)
        CitizenObservationCreate(
            station_id="NOR-OSL-003",
            stream_name="Akerselva - Grünerløkka Lower Falls",
            latitude=59.9230,
            longitude=10.7560,
            catchment_basin="Lower Akerselva Urban Reach",
            pilot_city="oslo",
            observer_name="Ingrid Bakke",
            observer_tier="Citizen Volunteer",
            notes="Dense urban park corridor. Heavy pedestrian and pet activity, occasional urban stormwater discharge and low trash.",
            readings=PhysicalChemicalReadings(
                temperature_c=14.5,
                ph=7.3,
                dissolved_oxygen_mg_l=8.8,
                turbidity_ntu=8.5,
                conductivity_us_cm=240.0,
                nitrate_mg_l=2.4,
                phosphate_mg_l=0.07
            ),
            bio=BioIndicators(
                stonefly_nymphs=1,
                mayfly_nymphs=6,
                caddisfly_larvae=5,
                dragonfly_nymphs=3,
                blackfly_larvae=6,
                pouch_snails=5,
                algal_cover_pct=22.0,
                live_fish_observed=3
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.SLIGHTLY_TURBID,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.LOW
            )
        ),

        # 3.4 Alnaelva - Kværnerbyen Daylighted Section (Post-industrial Revitalization)
        CitizenObservationCreate(
            station_id="NOR-OSL-004",
            stream_name="Alnaelva - Kværnerbyen Daylighted Section",
            latitude=59.9055,
            longitude=10.7920,
            catchment_basin="Alna River Valley",
            pilot_city="oslo",
            observer_name="Henrik Johansen",
            observer_tier="Trained Streamkeeper",
            notes="Daylighted river segment running through former industrial gorge now transformed into modern eco-district. Silt accumulation in slackwater.",
            readings=PhysicalChemicalReadings(
                temperature_c=13.9,
                ph=7.2,
                dissolved_oxygen_mg_l=7.6,
                turbidity_ntu=14.0,
                conductivity_us_cm=340.0,
                nitrate_mg_l=3.8,
                phosphate_mg_l=0.11
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=4,
                caddisfly_larvae=3,
                dragonfly_nymphs=4,
                blackfly_larvae=8,
                midges_bloodworms=12,
                tubifex_worms=9,
                pouch_snails=7,
                algal_cover_pct=28.0,
                live_fish_observed=3
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.SLIGHTLY_TURBID,
                water_odor=WaterOdor.EARTHY_MUSTY,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.LOW
            )
        ),

        # 3.5 Alnaelva - Grorud Industrial Reach (Urban Highway & Rail Drainage Impairment)
        CitizenObservationCreate(
            station_id="NOR-OSL-005",
            stream_name="Alnaelva - Grorud Industrial Reach",
            latitude=59.9590,
            longitude=10.8840,
            catchment_basin="Upper Alna Industrial Basin",
            pilot_city="oslo",
            observer_name="Dr. Astrid Lindqvist",
            observer_tier="Field Biologist",
            notes="Heavily modified urban stream reach adjacent to rail yard and road interchange. Elevated conductivity from winter de-icing and industrial runoff.",
            readings=PhysicalChemicalReadings(
                temperature_c=15.6,
                ph=6.9,
                dissolved_oxygen_mg_l=5.8,
                turbidity_ntu=38.0,
                conductivity_us_cm=890.0,
                nitrate_mg_l=8.4,
                phosphate_mg_l=0.28
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=0,
                caddisfly_larvae=1,
                midges_bloodworms=24,
                tubifex_worms=28,
                leeches=8,
                pouch_snails=14,
                algal_cover_pct=36.0,
                dead_fish_observed=1,
                live_fish_observed=1
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.MURKY,
                water_odor=WaterOdor.CHEMICAL_PETROL,
                surface_sheen=SurfaceSheen.PETROLEUM_RAINBOW,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=True,
                trash_density=TrashDensity.SEVERE
            )
        ),

        # 3.6 Hovinbekken - Ensjø Urban Water Feature (Constructed Wetland Bio-filtration)
        CitizenObservationCreate(
            station_id="NOR-OSL-006",
            stream_name="Hovinbekken - Ensjø Urban Water Feature",
            latitude=59.9140,
            longitude=10.7870,
            catchment_basin="Hovinbekken Daylighted Watershed",
            pilot_city="oslo",
            observer_name="Ingrid Bakke",
            observer_tier="Citizen Volunteer",
            notes="Model daylighted urban stream flowing through residential square with engineered bio-retention wetlands, duckweed, and thriving frogs.",
            readings=PhysicalChemicalReadings(
                temperature_c=14.2,
                ph=7.5,
                dissolved_oxygen_mg_l=9.1,
                turbidity_ntu=3.8,
                conductivity_us_cm=175.0,
                nitrate_mg_l=1.5,
                phosphate_mg_l=0.05
            ),
            bio=BioIndicators(
                stonefly_nymphs=2,
                mayfly_nymphs=8,
                caddisfly_larvae=7,
                freshwater_shrimp=8,
                dragonfly_nymphs=6,
                beetle_larvae=5,
                algal_cover_pct=15.0,
                live_fish_observed=6
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NATURAL_BIOGENIC,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # =========================================================================
        # 4. PORTLAND, USA (Columbia Slough / Lower Willamette Basin) [US Case Study]
        # =========================================================================
        # 4.1 Pristine Headwater - High One Health Score
        CitizenObservationCreate(
            station_id="STA-001",
            stream_name="Silver Creek Headwaters",
            latitude=45.5231,
            longitude=-122.6765,
            catchment_basin="Upper Columbia Slough Headwaters",
            pilot_city="portland",
            observer_name="Dr. Elena Vance",
            observer_tier="Field Biologist",
            notes="Pristine mountain stream run. Abundant stoneflies and gravel beds with dense native cedar canopy.",
            readings=PhysicalChemicalReadings(
                temperature_c=12.4,
                ph=7.3,
                dissolved_oxygen_mg_l=10.4,
                turbidity_ntu=2.1,
                conductivity_us_cm=85.0,
                nitrate_mg_l=0.4,
                phosphate_mg_l=0.02
            ),
            bio=BioIndicators(
                stonefly_nymphs=8,
                mayfly_nymphs=14,
                caddisfly_larvae=11,
                freshwater_shrimp=6,
                dragonfly_nymphs=2,
                algal_cover_pct=5.0,
                live_fish_observed=5
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),
        
        # 4.2 Stagnant Urban Slough - High Vector Hazard (Mosquitoes)
        CitizenObservationCreate(
            station_id="STA-002",
            stream_name="Willowbrook Urban Slough",
            latitude=45.5082,
            longitude=-122.6510,
            catchment_basin="Columbia Slough Stagnant Reach",
            pilot_city="portland",
            observer_name="Marcus Reed",
            observer_tier="Citizen Volunteer",
            notes="Warm stagnant reach near road bridge culvert. High mosquito larval presence noticed.",
            readings=PhysicalChemicalReadings(
                temperature_c=25.2,
                ph=7.4,
                dissolved_oxygen_mg_l=2.8,
                turbidity_ntu=18.5,
                conductivity_us_cm=420.0,
                nitrate_mg_l=3.2,
                phosphate_mg_l=0.18
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=0,
                caddisfly_larvae=0,
                dragonfly_nymphs=0,
                midges_bloodworms=32,
                tubifex_worms=24,
                leeches=6,
                algal_cover_pct=45.0,
                dead_fish_observed=0
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.MURKY,
                water_odor=WaterOdor.EARTHY_MUSTY,
                surface_sheen=SurfaceSheen.SCUM_FOAM,
                flow_rate=FlowRate.STAGNANT_POOLS,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.MODERATE
            )
        ),

        # 4.3 Stormwater Outfall - Critical Pathogen Risk after storm
        CitizenObservationCreate(
            station_id="STA-003",
            stream_name="Industrial Canal Culvert #4",
            latitude=45.4950,
            longitude=-122.6320,
            catchment_basin="Lower Willamette Stormwater Basin",
            pilot_city="portland",
            observer_name="Aisha Morales",
            observer_tier="Trained Streamkeeper",
            notes="Heavy sewage odor and greyish cloudiness downstream of combined sewer overflow point.",
            readings=PhysicalChemicalReadings(
                temperature_c=19.8,
                ph=6.7,
                dissolved_oxygen_mg_l=4.2,
                turbidity_ntu=85.0,
                conductivity_us_cm=880.0,
                nitrate_mg_l=14.5,
                phosphate_mg_l=0.45
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=0,
                tubifex_worms=38,
                midges_bloodworms=25,
                pouch_snails=12,
                algal_cover_pct=20.0,
                dead_fish_observed=2
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.OPAQUE,
                water_odor=WaterOdor.SEWAGE_SULFUR,
                surface_sheen=SurfaceSheen.SCUM_FOAM,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=True,
                trash_density=TrashDensity.SEVERE
            )
        ),

        # 4.4 Agricultural Runoff Tributary - Cyanobacterial HAB Hazard
        CitizenObservationCreate(
            station_id="STA-004",
            stream_name="Meadowlark Farm Runoff Brook",
            latitude=45.5410,
            longitude=-122.6105,
            catchment_basin="Columbia Slough Agricultural Tributary",
            pilot_city="portland",
            observer_name="David Chen",
            observer_tier="Trained Streamkeeper",
            notes="Intense pea-soup green surface scum and high daytime photosynthetic oxygen saturation.",
            readings=PhysicalChemicalReadings(
                temperature_c=24.5,
                ph=8.9,
                dissolved_oxygen_mg_l=13.8,
                turbidity_ntu=38.0,
                conductivity_us_cm=510.0,
                nitrate_mg_l=18.2,
                phosphate_mg_l=0.65
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=1,
                caddisfly_larvae=0,
                dragonfly_nymphs=4,
                freshwater_shrimp=0,
                algal_cover_pct=75.0,
                dead_fish_observed=1
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.MURKY,
                water_odor=WaterOdor.FISHY_DECAY,
                surface_sheen=SurfaceSheen.SCUM_FOAM,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.LOW
            )
        ),

        # 4.5 Restored Urban Wetland - Resilient & Thriving
        CitizenObservationCreate(
            station_id="STA-005",
            stream_name="Oaks Bottom Wetland Tributary",
            latitude=45.4780,
            longitude=-122.6580,
            catchment_basin="Oaks Bottom Wetland Sanctuary",
            pilot_city="portland",
            observer_name="Sarah Jenkins",
            observer_tier="Field Biologist",
            notes="Post-restoration bio-monitoring. Native sedges, beaver dam presence, diverse aquatic insects.",
            readings=PhysicalChemicalReadings(
                temperature_c=15.1,
                ph=7.4,
                dissolved_oxygen_mg_l=8.8,
                turbidity_ntu=4.8,
                conductivity_us_cm=140.0,
                nitrate_mg_l=1.1,
                phosphate_mg_l=0.04
            ),
            bio=BioIndicators(
                stonefly_nymphs=3,
                mayfly_nymphs=10,
                caddisfly_larvae=8,
                freshwater_shrimp=9,
                dragonfly_nymphs=7,
                beetle_larvae=4,
                algal_cover_pct=15.0,
                live_fish_observed=8
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NATURAL_BIOGENIC,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # 4.6 Urban Park Creek - Balanced / Recreational Caution
        CitizenObservationCreate(
            station_id="STA-006",
            stream_name="Laurelhurst Park Creek",
            latitude=45.5245,
            longitude=-122.6280,
            catchment_basin="Lower Willamette Urban Tributaries",
            pilot_city="portland",
            observer_name="Kenji Sato",
            observer_tier="Citizen Volunteer",
            notes="Popular dog walking corridor. Moderate duck and canine presence near banks.",
            readings=PhysicalChemicalReadings(
                temperature_c=17.2,
                ph=7.2,
                dissolved_oxygen_mg_l=7.5,
                turbidity_ntu=9.2,
                conductivity_us_cm=260.0,
                nitrate_mg_l=2.5,
                phosphate_mg_l=0.08
            ),
            bio=BioIndicators(
                stonefly_nymphs=1,
                mayfly_nymphs=5,
                caddisfly_larvae=4,
                dragonfly_nymphs=3,
                blackfly_larvae=5,
                pouch_snails=6,
                algal_cover_pct=22.0,
                live_fish_observed=3
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.SLIGHTLY_TURBID,
                water_odor=WaterOdor.EARTHY_MUSTY,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.LOW
            )
        ),

        # 4.7 Tryon Creek South Riffle
        CitizenObservationCreate(
            station_id="STA-007",
            stream_name="Tryon Creek State Riffle",
            latitude=45.4410,
            longitude=-122.6730,
            catchment_basin="Tryon Creek Watershed",
            pilot_city="portland",
            observer_name="Rachel Green",
            observer_tier="Trained Streamkeeper",
            notes="Shaded forest creek, clean gravel cobble, active coho salmon spawning reach.",
            readings=PhysicalChemicalReadings(
                temperature_c=13.6,
                ph=7.5,
                dissolved_oxygen_mg_l=9.8,
                turbidity_ntu=3.2,
                conductivity_us_cm=110.0,
                nitrate_mg_l=0.8,
                phosphate_mg_l=0.03
            ),
            bio=BioIndicators(
                stonefly_nymphs=6,
                mayfly_nymphs=12,
                caddisfly_larvae=9,
                freshwater_shrimp=5,
                dragonfly_nymphs=3,
                algal_cover_pct=10.0,
                live_fish_observed=6
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # 4.8 Johnson Creek Urban Floodplain
        CitizenObservationCreate(
            station_id="STA-008",
            stream_name="Johnson Creek Urban Reach",
            latitude=45.4620,
            longitude=-122.5830,
            catchment_basin="Johnson Creek Watershed",
            pilot_city="portland",
            observer_name="Tom Bradley",
            observer_tier="Citizen Volunteer",
            notes="Urban corridor stream with flash flood history; moderate silt deposit.",
            readings=PhysicalChemicalReadings(
                temperature_c=18.5,
                ph=7.1,
                dissolved_oxygen_mg_l=6.9,
                turbidity_ntu=16.4,
                conductivity_us_cm=310.0,
                nitrate_mg_l=3.9,
                phosphate_mg_l=0.12
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=4,
                caddisfly_larvae=3,
                beetle_larvae=5,
                blackfly_larvae=8,
                pouch_snails=7,
                algal_cover_pct=30.0,
                live_fish_observed=2
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.SLIGHTLY_TURBID,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.MODERATE
            )
        ),

        # 4.9 Crystal Springs Salmon Rearing Reach
        CitizenObservationCreate(
            station_id="STA-009",
            stream_name="Crystal Springs Cold Headwaters",
            latitude=45.4735,
            longitude=-122.6410,
            catchment_basin="Crystal Springs Sanctuary",
            pilot_city="portland",
            observer_name="Dr. Elena Vance",
            observer_tier="Field Biologist",
            notes="Constant groundwater fed spring. Constant ~11C temp makes this a prime refuge for juvenile salmonids.",
            readings=PhysicalChemicalReadings(
                temperature_c=11.2,
                ph=7.6,
                dissolved_oxygen_mg_l=10.9,
                turbidity_ntu=1.8,
                conductivity_us_cm=95.0,
                nitrate_mg_l=0.5,
                phosphate_mg_l=0.02
            ),
            bio=BioIndicators(
                stonefly_nymphs=7,
                mayfly_nymphs=15,
                caddisfly_larvae=14,
                freshwater_shrimp=8,
                dragonfly_nymphs=2,
                algal_cover_pct=8.0,
                live_fish_observed=12
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # 4.10 Sullivan's Gulch Highway Outfall
        CitizenObservationCreate(
            station_id="STA-010",
            stream_name="Sullivan's Gulch Concrete Culvert",
            latitude=45.5310,
            longitude=-122.6450,
            catchment_basin="Highway 84 Drainage",
            pilot_city="portland",
            observer_name="Alex Rivera",
            observer_tier="Citizen Volunteer",
            notes="Visible petroleum rainbow sheen from highway runoff, plastic debris, low flow.",
            readings=PhysicalChemicalReadings(
                temperature_c=21.0,
                ph=6.4,
                dissolved_oxygen_mg_l=5.1,
                turbidity_ntu=32.0,
                conductivity_us_cm=720.0,
                nitrate_mg_l=6.5,
                phosphate_mg_l=0.22
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=0,
                caddisfly_larvae=0,
                tubifex_worms=19,
                leeches=8,
                pouch_snails=14,
                algal_cover_pct=35.0,
                dead_fish_observed=0
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.MURKY,
                water_odor=WaterOdor.CHEMICAL_PETROL,
                surface_sheen=SurfaceSheen.PETROLEUM_RAINBOW,
                flow_rate=FlowRate.SLOW_TRICKLE,
                recent_heavy_rainfall=True,
                trash_density=TrashDensity.SEVERE
            )
        ),

        # 4.11 Balch Creek (Forest Park)
        CitizenObservationCreate(
            station_id="STA-011",
            stream_name="Balch Creek Canyon",
            latitude=45.5385,
            longitude=-122.7140,
            catchment_basin="Forest Park Watershed",
            pilot_city="portland",
            observer_name="Maya Lin",
            observer_tier="Trained Streamkeeper",
            notes="Deep forested canyon with native cutthroat trout population. Clean, cool water.",
            readings=PhysicalChemicalReadings(
                temperature_c=12.9,
                ph=7.4,
                dissolved_oxygen_mg_l=10.1,
                turbidity_ntu=2.4,
                conductivity_us_cm=90.0,
                nitrate_mg_l=0.6,
                phosphate_mg_l=0.02
            ),
            bio=BioIndicators(
                stonefly_nymphs=5,
                mayfly_nymphs=11,
                caddisfly_larvae=9,
                freshwater_shrimp=4,
                dragonfly_nymphs=1,
                algal_cover_pct=6.0,
                live_fish_observed=4
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.CRYSTAL_CLEAR,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.NONE
            )
        ),

        # 4.12 Fanno Creek Confluence
        CitizenObservationCreate(
            station_id="STA-012",
            stream_name="Fanno Creek Urban Confluence",
            latitude=45.4520,
            longitude=-122.7480,
            catchment_basin="Tualatin River Basin",
            pilot_city="portland",
            observer_name="James Wilson",
            observer_tier="Citizen Volunteer",
            notes="Suburban stream with residential runoff and lawn fertilizer input.",
            readings=PhysicalChemicalReadings(
                temperature_c=19.4,
                ph=7.8,
                dissolved_oxygen_mg_l=6.2,
                turbidity_ntu=22.0,
                conductivity_us_cm=440.0,
                nitrate_mg_l=7.8,
                phosphate_mg_l=0.28
            ),
            bio=BioIndicators(
                stonefly_nymphs=0,
                mayfly_nymphs=2,
                caddisfly_larvae=3,
                dragonfly_nymphs=5,
                blackfly_larvae=10,
                pouch_snails=8,
                algal_cover_pct=40.0,
                live_fish_observed=1
            ),
            visual=VisualObservations(
                water_clarity=WaterClarity.SLIGHTLY_TURBID,
                water_odor=WaterOdor.NONE,
                surface_sheen=SurfaceSheen.NONE,
                flow_rate=FlowRate.MODERATE_RIFFLE,
                recent_heavy_rainfall=False,
                trash_density=TrashDensity.LOW
            )
        )
    ]
    
    records = []
    for idx, inp in enumerate(seed_inputs):
        time_offset = base_time - timedelta(hours=idx * 2)
        rec = create_processed_record(inp, record_id=f"obs-{inp.station_id.lower()}", timestamp=time_offset.isoformat())
        records.append(rec)
        
    return records
