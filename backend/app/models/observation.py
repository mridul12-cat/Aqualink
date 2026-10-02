"""Data models for citizen stream observations."""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class WaterClarity(str, Enum):
    CRYSTAL_CLEAR = "crystal_clear"
    SLIGHTLY_TURBID = "slightly_turbid"
    MURKY = "murky"
    OPAQUE = "opaque"

class WaterOdor(str, Enum):
    NONE = "none"
    EARTHY_MUSTY = "earthy_musty"
    SEWAGE_SULFUR = "sewage_sulfur"
    CHEMICAL_PETROL = "chemical_petrol"
    FISHY_DECAY = "fishy_decay"

class SurfaceSheen(str, Enum):
    NONE = "none"
    NATURAL_BIOGENIC = "natural_biogenic"
    PETROLEUM_RAINBOW = "petroleum_rainbow"
    SCUM_FOAM = "scum_foam"

class FlowRate(str, Enum):
    DRY_BED = "dry_bed"
    STAGNANT_POOLS = "stagnant_pools"
    SLOW_TRICKLE = "slow_trickle"
    MODERATE_RIFFLE = "moderate_riffle"
    TORRENTIAL_SPATE = "torrential_spate"

class TrashDensity(str, Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    SEVERE = "severe"

class PhysicalChemicalReadings(BaseModel):
    temperature_c: float = Field(..., ge=-5.0, le=45.0, description="Water temperature in Celsius")
    ph: float = Field(..., ge=1.0, le=14.0, description="pH level (0-14)")
    dissolved_oxygen_mg_l: float = Field(..., ge=0.0, le=25.0, description="Dissolved Oxygen in mg/L")
    turbidity_ntu: float = Field(..., ge=0.0, le=1500.0, description="Turbidity in Nephelometric Turbidity Units")
    conductivity_us_cm: Optional[float] = Field(None, ge=0.0, le=10000.0, description="Specific Conductivity in µS/cm")
    nitrate_mg_l: Optional[float] = Field(None, ge=0.0, le=100.0, description="Nitrate-Nitrogen concentration mg/L")
    phosphate_mg_l: Optional[float] = Field(None, ge=0.0, le=20.0, description="Orthophosphate concentration mg/L")

class BioIndicators(BaseModel):
    # Pollution-sensitive (Group 1 - High water quality indicators)
    mayfly_nymphs: int = Field(0, ge=0)
    stonefly_nymphs: int = Field(0, ge=0)
    caddisfly_larvae: int = Field(0, ge=0)
    freshwater_shrimp: int = Field(0, ge=0)
    
    # Somewhat pollution-tolerant (Group 2 - Moderate quality indicators)
    dragonfly_nymphs: int = Field(0, ge=0)
    beetle_larvae: int = Field(0, ge=0)
    blackfly_larvae: int = Field(0, ge=0)
    
    # Highly pollution-tolerant (Group 3 - Low quality / organic pollution indicators)
    midges_bloodworms: int = Field(0, ge=0)
    tubifex_worms: int = Field(0, ge=0)
    leeches: int = Field(0, ge=0)
    pouch_snails: int = Field(0, ge=0)
    
    # Additional ecological observations
    algal_cover_pct: float = Field(0.0, ge=0.0, le=100.0)
    dead_fish_observed: int = Field(0, ge=0)
    live_fish_observed: int = Field(0, ge=0)

class VisualObservations(BaseModel):
    water_clarity: WaterClarity = WaterClarity.CRYSTAL_CLEAR
    water_odor: WaterOdor = WaterOdor.NONE
    surface_sheen: SurfaceSheen = SurfaceSheen.NONE
    flow_rate: FlowRate = FlowRate.MODERATE_RIFFLE
    recent_heavy_rainfall: bool = False
    trash_density: TrashDensity = TrashDensity.LOW
    photo_url: Optional[str] = None
    photo_description: Optional[str] = None

class CitizenObservationCreate(BaseModel):
    station_id: Optional[str] = None
    stream_name: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    catchment_basin: str
    pilot_city: Optional[str] = None
    observer_name: str = "Anonymous Volunteer"
    observer_tier: str = "Citizen Volunteer"
    notes: Optional[str] = None
    readings: PhysicalChemicalReadings
    bio: BioIndicators = Field(default_factory=BioIndicators)
    visual: VisualObservations = Field(default_factory=VisualObservations)
    timestamp: Optional[str] = None
