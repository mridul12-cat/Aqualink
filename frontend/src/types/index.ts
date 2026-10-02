export type WaterClarity = 'crystal_clear' | 'slightly_turbid' | 'murky' | 'opaque';
export type WaterOdor = 'none' | 'earthy_musty' | 'sewage_sulfur' | 'chemical_petrol' | 'fishy_decay';
export type SurfaceSheen = 'none' | 'natural_biogenic' | 'petroleum_rainbow' | 'scum_foam';
export type FlowRate = 'dry_bed' | 'stagnant_pools' | 'slow_trickle' | 'moderate_riffle' | 'torrential_spate';
export type TrashDensity = 'none' | 'low' | 'moderate' | 'severe';

export interface PhysicalChemicalReadings {
  temperature_c: number;
  ph: number;
  dissolved_oxygen_mg_l: number;
  turbidity_ntu: number;
  conductivity_us_cm?: number | null;
  nitrate_mg_l?: number | null;
  phosphate_mg_l?: number | null;
}

export interface BioIndicators {
  mayfly_nymphs: number;
  stonefly_nymphs: number;
  caddisfly_larvae: number;
  freshwater_shrimp: number;
  dragonfly_nymphs: number;
  beetle_larvae: number;
  blackfly_larvae: number;
  midges_bloodworms: number;
  tubifex_worms: number;
  leeches: number;
  pouch_snails: number;
  algal_cover_pct: number;
  dead_fish_observed: number;
  live_fish_observed: number;
}

export interface VisualObservations {
  water_clarity: WaterClarity;
  water_odor: WaterOdor;
  surface_sheen: SurfaceSheen;
  flow_rate: FlowRate;
  recent_heavy_rainfall: boolean;
  trash_density: TrashDensity;
  photo_url?: string | null;
  photo_description?: string | null;
}

export interface CitizenObservationCreate {
  station_id?: string;
  stream_name: string;
  latitude: number;
  longitude: number;
  catchment_basin: string;
  pilot_city?: string;
  observer_name: string;
  observer_tier: string;
  notes?: string;
  readings: PhysicalChemicalReadings;
  bio: BioIndicators;
  visual: VisualObservations;
  timestamp?: string;
}

export interface AnomalyItem {
  category: string;
  severity: 'low' | 'medium' | 'high';
  rule_triggered: string;
  description: string;
  suggested_correction?: string;
}

export interface AIValidationResult {
  status: 'VERIFIED' | 'FLAG_ANOMALY' | 'FLAG_CONTRADICTION' | 'NEEDS_REVIEW';
  confidence_score: number;
  anomalies: AnomalyItem[];
  contradictions_detected: string[];
  scientific_rationale: string;
  human_in_the_loop_flag: boolean;
  image_verification_notes?: string | null;
}

export interface BiologicalIndices {
  bmwp_score: number;
  bmwp_class: string;
  ept_count: number;
  fbi_score: number;
  organic_pollution_level: string;
}

export interface EcologicalHealth {
  wqi_score: number;
  wqi_rating: string;
  ehi_score: number;
  ehi_rating: string;
  dissolved_oxygen_saturation_pct: number;
  resilience_tier: string;
}

export interface PublicHealthHazards {
  waterborne_pathogen_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  pathogen_risk_score: number;
  pathogen_vectors: string[];
  vector_borne_hazard: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  vector_risk_score: number;
  vector_notes: string;
  cyanobacterial_hab_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  hab_risk_score: number;
  hab_notes: string;
  recreational_advisory: 'SAFE' | 'CAUTION' | 'UNSAFE';
  pet_and_wildlife_hazard: 'SAFE' | 'CAUTION' | 'UNSAFE';
  primary_hazard_driver: string;
}

export interface OneHealthAssessment {
  composite_one_health_score: number;
  one_health_tier: string;
  ecological_health: EcologicalHealth;
  biological_indices: BiologicalIndices;
  public_health_hazards: PublicHealthHazards;
  validation: AIValidationResult;
  plain_language_summary: string;
  actionable_interventions: string[];
  early_warning_alerts: string[];
}

export interface StreamObservationRecord {
  id: string;
  station_id: string;
  stream_name: string;
  latitude: number;
  longitude: number;
  catchment_basin: string;
  pilot_city?: string;
  timestamp: string;
  observer_name: string;
  observer_tier: string;
  notes?: string;
  readings: PhysicalChemicalReadings;
  bio: BioIndicators;
  visual: VisualObservations;
  assessment: OneHealthAssessment;
  fhir_observation_count: number;
}

export interface EarlyWarningAlert {
  stream_id: string;
  stream_name: string;
  station_id: string;
  catchment_basin: string;
  pilot_city?: string;
  timestamp: string;
  alert: string;
  advisory: 'SAFE' | 'CAUTION' | 'UNSAFE';
  pathogen_risk: string;
  vector_hazard: string;
  hab_risk: string;
  one_health_score: number;
}

export interface WatershedStats {
  total_monitoring_stations: number;
  mean_one_health_score: number;
  mean_wqi: number;
  mean_ehi: number;
  total_ept_richness_observed: number;
  advisories: {
    safe: number;
    caution: number;
    unsafe: number;
  };
  hazard_alerts: {
    high_pathogen_risk_sites: number;
    high_vector_breeding_sites: number;
    high_cyanobacteria_hab_sites: number;
  };
}

export type PilotCityId = 'all' | 'coimbra' | 'benevento' | 'oslo' | 'portland';

export interface PilotBasinInfo {
  id: PilotCityId;
  name: string;
  city: string;
  country: string;
  basinName: string;
  flag: string;
  badge: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  description: string;
}

export const PILOT_BASINS: Record<PilotCityId, PilotBasinInfo> = {
  coimbra: {
    id: 'coimbra',
    name: 'Coimbra, Portugal (Mondego River Basin / Ribeira de Coselhas) [Primary EU Pilot]',
    city: 'Coimbra',
    country: 'Portugal',
    basinName: 'Mondego River Basin / Ribeira de Coselhas',
    flag: '🇵🇹',
    badge: 'Primary EU Pilot',
    center: [40.211, -8.429],
    zoom: 13,
    description: 'Coimbra, Portugal (Mondego River Basin / Ribeira de Coselhas) [Primary EU Pilot]'
  },
  benevento: {
    id: 'benevento',
    name: 'Benevento, Italy (Calore River / Sabato River Basin) [EU Pilot]',
    city: 'Benevento',
    country: 'Italy',
    basinName: 'Calore River / Sabato River Basin',
    flag: '🇮🇹',
    badge: 'EU Pilot',
    center: [41.132, 14.778],
    zoom: 13,
    description: 'Benevento, Italy (Calore River / Sabato River Basin) [EU Pilot]'
  },
  oslo: {
    id: 'oslo',
    name: 'Oslo, Norway (Akerselva / Alna River Basin) [EU Pilot]',
    city: 'Oslo',
    country: 'Norway',
    basinName: 'Akerselva / Alna River Basin',
    flag: '🇳🇴',
    badge: 'EU Pilot',
    center: [59.932, 10.772],
    zoom: 12,
    description: 'Oslo, Norway (Akerselva / Alna River Basin) [EU Pilot]'
  },
  portland: {
    id: 'portland',
    name: 'Portland, USA (Columbia Slough / Lower Willamette Basin) [US Case Study]',
    city: 'Portland',
    country: 'USA',
    basinName: 'Columbia Slough / Lower Willamette Basin',
    flag: '🇺🇸',
    badge: 'US Case Study',
    center: [45.512, -122.668],
    zoom: 12,
    description: 'Portland, USA (Columbia Slough / Lower Willamette Basin) [US Case Study]'
  },
  all: {
    id: 'all',
    name: 'All Basins (Global OneAquaHealth Network)',
    city: 'Global',
    country: 'International',
    basinName: 'OneAquaHealth Pilot Network',
    flag: '🌍',
    badge: 'Global Network',
    center: [48.0, 5.0],
    zoom: 4,
    description: 'All International Pilot River Basins & Case Study Locations'
  }
};

