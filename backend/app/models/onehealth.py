"""One Health risk assessment and validation models."""
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from .observation import (
    CitizenObservationCreate,
    PhysicalChemicalReadings,
    BioIndicators,
    VisualObservations
)

class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AdvisoryStatus(str, Enum):
    SAFE = "SAFE"
    CAUTION = "CAUTION"
    UNSAFE = "UNSAFE"

class ValidationStatus(str, Enum):
    VERIFIED = "VERIFIED"
    FLAG_ANOMALY = "FLAG_ANOMALY"
    FLAG_CONTRADICTION = "FLAG_CONTRADICTION"
    NEEDS_REVIEW = "NEEDS_REVIEW"

class AnomalyItem(BaseModel):
    category: str  # "Physical-Chemical", "Ecological-Biological", "Visual-Sensor", "Plausibility"
    severity: str  # "low", "medium", "high"
    rule_triggered: str
    description: str
    suggested_correction: Optional[str] = None

class AIValidationResult(BaseModel):
    status: ValidationStatus
    confidence_score: float = Field(..., ge=0.0, le=100.0)
    anomalies: List[AnomalyItem] = Field(default_factory=list)
    contradictions_detected: List[str] = Field(default_factory=list)
    scientific_rationale: str
    human_in_the_loop_flag: bool = False
    image_verification_notes: Optional[str] = None

class BiologicalIndices(BaseModel):
    bmwp_score: float = Field(..., description="Biological Monitoring Working Party Score")
    bmwp_class: str = Field(..., description="E.g., Very Good, Moderate, Poor")
    ept_count: int = Field(..., description="Number of sensitive EPT taxa observed")
    fbi_score: float = Field(..., description="Hilsenhoff Family Biotic Index (0-10)")
    organic_pollution_level: str

class EcologicalHealth(BaseModel):
    wqi_score: float = Field(..., ge=0.0, le=100.0, description="Weighted Water Quality Index")
    wqi_rating: str  # Excellent, Good, Fair, Marginal, Poor
    ehi_score: float = Field(..., ge=0.0, le=100.0, description="Ecological Health Index")
    ehi_rating: str
    dissolved_oxygen_saturation_pct: float
    resilience_tier: str  # Resilient, Vulnerable, Impaired, Collapsing

class PublicHealthHazards(BaseModel):
    waterborne_pathogen_risk: RiskLevel
    pathogen_risk_score: float = Field(..., ge=0.0, le=100.0)
    pathogen_vectors: List[str]  # e.g., ["Coliform / E. coli indicator", "Leptospira hazard"]
    
    vector_borne_hazard: RiskLevel
    vector_risk_score: float = Field(..., ge=0.0, le=100.0)
    vector_notes: str  # e.g., "Stagnant, hypoxic conditions favor Culex mosquito oviposition"
    
    cyanobacterial_hab_risk: RiskLevel
    hab_risk_score: float = Field(..., ge=0.0, le=100.0)
    hab_notes: str
    
    recreational_advisory: AdvisoryStatus
    pet_and_wildlife_hazard: AdvisoryStatus
    primary_hazard_driver: str

class OneHealthAssessment(BaseModel):
    composite_one_health_score: float = Field(..., ge=0.0, le=100.0, description="100 = Optimal One Health harmony")
    one_health_tier: str  # Thriving, Balanced, Stressed, Degraded, Hazardous
    ecological_health: EcologicalHealth
    biological_indices: BiologicalIndices
    public_health_hazards: PublicHealthHazards
    validation: AIValidationResult
    plain_language_summary: str
    actionable_interventions: List[str]
    early_warning_alerts: List[str]

class StreamObservationRecord(BaseModel):
    id: str
    station_id: str
    stream_name: str
    latitude: float
    longitude: float
    catchment_basin: str
    pilot_city: str = "portland"
    timestamp: str
    observer_name: str
    observer_tier: str
    notes: Optional[str] = None
    readings: PhysicalChemicalReadings
    bio: BioIndicators
    visual: VisualObservations
    assessment: OneHealthAssessment
    fhir_observation_count: int = 0
