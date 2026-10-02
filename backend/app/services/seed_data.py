"""Seed data generator providing diverse real-world urban stream baselines and historical records."""
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

    return StreamObservationRecord(
        id=rec_id,
        station_id=st_id,
        stream_name=obs.stream_name,
        latitude=obs.latitude,
        longitude=obs.longitude,
        catchment_basin=obs.catchment_basin,
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
    """Generate 12 diverse urban stream stations across varied ecological and public health states."""
    base_time = datetime.now(timezone.utc)
    
    seed_inputs = [
        # 1. Pristine Headwater - High One Health Score
        CitizenObservationCreate(
            station_id="STA-001",
            stream_name="Silver Creek Headwaters",
            latitude=45.5231,
            longitude=-122.6765,
            catchment_basin="Upper Columbia Basin",
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
        
        # 2. Stagnant Urban Slough - High Vector Hazard (Mosquitoes)
        CitizenObservationCreate(
            station_id="STA-002",
            stream_name="Willowbrook Urban Slough",
            latitude=45.5082,
            longitude=-122.6510,
            catchment_basin="Lower Willamette Catchment",
            observer_name="Marcus Reed",
            observer_tier="Citizen Volunteer",
            notes="Warm stagnant reach near road bridge culvert. High mosquito larval presence noticed.",
            readings=PhysicalChemicalReadings(
                temperature_c=25.2,
                ph=7.4,
                dissolved_oxygen_mg_l=2.8,  # Hypoxic
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

        # 3. Stormwater Outfall - Critical Pathogen Risk after storm
        CitizenObservationCreate(
            station_id="STA-003",
            stream_name="Industrial Canal Culvert #4",
            latitude=45.4950,
            longitude=-122.6320,
            catchment_basin="Eastside Stormwater Basin",
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

        # 4. Agricultural Runoff Tributary - Cyanobacterial HAB Hazard
        CitizenObservationCreate(
            station_id="STA-004",
            stream_name="Meadowlark Farm Runoff Brook",
            latitude=45.5410,
            longitude=-122.6105,
            catchment_basin="Valley Agricultural Basin",
            observer_name="David Chen",
            observer_tier="Trained Streamkeeper",
            notes="Intense pea-soup green surface scum and high daytime photosynthetic oxygen saturation.",
            readings=PhysicalChemicalReadings(
                temperature_c=24.5,
                ph=8.9,  # High pH due to CO2 depletion by bloom
                dissolved_oxygen_mg_l=13.8,  # Daytime supersaturation
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

        # 5. Restored Urban Wetland - Resilient & Thriving
        CitizenObservationCreate(
            station_id="STA-005",
            stream_name="Oaks Bottom Wetland Tributary",
            latitude=45.4780,
            longitude=-122.6580,
            catchment_basin="Oaks Bottom Sanctuary",
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

        # 6. Urban Park Creek - Balanced / Recreational Caution
        CitizenObservationCreate(
            station_id="STA-006",
            stream_name="Laurelhurst Park Creek",
            latitude=45.5245,
            longitude=-122.6280,
            catchment_basin="Central Urban Tributaries",
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

        # 7. Tryon Creek South Riffle
        CitizenObservationCreate(
            station_id="STA-007",
            stream_name="Tryon Creek State Riffle",
            latitude=45.4410,
            longitude=-122.6730,
            catchment_basin="Tryon Creek Watershed",
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

        # 8. Johnson Creek Urban Floodplain
        CitizenObservationCreate(
            station_id="STA-008",
            stream_name="Johnson Creek Urban Reach",
            latitude=45.4620,
            longitude=-122.5830,
            catchment_basin="Johnson Creek Watershed",
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

        # 9. Crystal Springs Salmon Rearing Reach
        CitizenObservationCreate(
            station_id="STA-009",
            stream_name="Crystal Springs Cold Headwaters",
            latitude=45.4735,
            longitude=-122.6410,
            catchment_basin="Crystal Springs Sanctuary",
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

        # 10. Sullivan's Gulch Highway Outfall
        CitizenObservationCreate(
            station_id="STA-010",
            stream_name="Sullivan's Gulch Concrete Culvert",
            latitude=45.5310,
            longitude=-122.6450,
            catchment_basin="Highway 84 Drainage",
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

        # 11. Balch Creek (Forest Park)
        CitizenObservationCreate(
            station_id="STA-011",
            stream_name="Balch Creek Canyon",
            latitude=45.5385,
            longitude=-122.7140,
            catchment_basin="Forest Park Watershed",
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

        # 12. Fanno Creek Confluence
        CitizenObservationCreate(
            station_id="STA-012",
            stream_name="Fanno Creek Urban Confluence",
            latitude=45.4520,
            longitude=-122.7480,
            catchment_basin="Tualatin River Basin",
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
