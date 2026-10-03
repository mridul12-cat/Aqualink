import test from 'node:test';
import assert from 'node:assert';
import type {
  CitizenObservationCreate,
  StreamObservationRecord,
  WaterClarity,
  WaterOdor,
  SurfaceSheen,
  FlowRate,
  TrashDensity,
  AIValidationResult
} from '../types/index.ts';

test('CitizenObservationCreate data structure conforms to schema', () => {
  const sample: CitizenObservationCreate = {
    stream_name: 'Test Stream',
    latitude: 45.515,
    longitude: -122.65,
    catchment_basin: 'Willamette Urban Basin',
    observer_name: 'Volunteer Sarah',
    observer_tier: 'Citizen Volunteer',
    readings: {
      temperature_c: 14.2,
      ph: 7.2,
      dissolved_oxygen_mg_l: 9.8,
      turbidity_ntu: 3.1,
      conductivity_us_cm: 190,
      nitrate_mg_l: 1.1,
      phosphate_mg_l: 0.03
    },
    bio: {
      stonefly_nymphs: 3,
      mayfly_nymphs: 6,
      caddisfly_larvae: 4,
      freshwater_shrimp: 2,
      dragonfly_nymphs: 1,
      beetle_larvae: 2,
      blackfly_larvae: 0,
      midges_bloodworms: 0,
      tubifex_worms: 0,
      leeches: 0,
      pouch_snails: 1,
      algal_cover_pct: 5,
      dead_fish_observed: 0,
      live_fish_observed: 4
    },
    visual: {
      water_clarity: 'crystal_clear' as WaterClarity,
      water_odor: 'none' as WaterOdor,
      surface_sheen: 'none' as SurfaceSheen,
      flow_rate: 'moderate_riffle' as FlowRate,
      recent_heavy_rainfall: false,
      trash_density: 'none' as TrashDensity,
      photo_description: 'Clear riffle stream'
    }
  };

  assert.strictEqual(sample.stream_name, 'Test Stream');
  assert.strictEqual(sample.readings.dissolved_oxygen_mg_l, 9.8);
  assert.strictEqual(sample.bio.stonefly_nymphs, 3);
  assert.strictEqual(sample.visual.water_clarity, 'crystal_clear');
});

test('AIValidationResult supports all four validation statuses', () => {
  const statuses: AIValidationResult['status'][] = [
    'VERIFIED',
    'FLAG_ANOMALY',
    'FLAG_CONTRADICTION',
    'NEEDS_REVIEW'
  ];

  for (const status of statuses) {
    const valResult: AIValidationResult = {
      status,
      confidence_score: status === 'VERIFIED' ? 95 : 60,
      anomalies: [],
      contradictions_detected: [],
      scientific_rationale: `Testing status ${status}`,
      human_in_the_loop_flag: status !== 'VERIFIED'
    };
    assert.strictEqual(valResult.status, status);
    assert.ok(valResult.confidence_score >= 0 && valResult.confidence_score <= 100);
  }
});

test('Color indicator mappings for One Health score thresholds', () => {
  const getMarkerColor = (score: number, advisory: string) => {
    if (score < 45 || advisory === 'UNSAFE') return '#f43f5e'; // Red
    if (score < 70 || advisory === 'CAUTION') return '#f59e0b'; // Amber
    if (score >= 85) return '#06b6d4'; // Cyan
    return '#10b981'; // Green
  };

  assert.strictEqual(getMarkerColor(92, 'SAFE'), '#06b6d4'); // Cyan pristine
  assert.strictEqual(getMarkerColor(75, 'SAFE'), '#10b981'); // Green balanced
  assert.strictEqual(getMarkerColor(55, 'CAUTION'), '#f59e0b'); // Amber stressed
  assert.strictEqual(getMarkerColor(30, 'UNSAFE'), '#f43f5e'); // Red degraded
  assert.strictEqual(getMarkerColor(85, 'UNSAFE'), '#f43f5e'); // Unsafe advisory forces red
});

test('generateClientFhirBundle creates valid HL7 FHIR R4 Bundle from StreamObservationRecord', async () => {
  const { generateClientFhirBundle } = await import('../services/fhir.ts');
  const record: StreamObservationRecord = {
    id: 'obs-test1234',
    station_id: 'STA-1234',
    stream_name: 'Ribeira de Coselhas Tributary',
    latitude: 40.2285,
    longitude: -8.428,
    catchment_basin: 'Ribeira de Coselhas / Mondego Basin',
    pilot_city: 'coimbra',
    timestamp: '2026-10-03T10:00:00Z',
    observer_name: 'Alex Rivera',
    observer_tier: 'Citizen Volunteer',
    readings: {
      temperature_c: 18.0,
      ph: 7.2,
      dissolved_oxygen_mg_l: 8.5,
      turbidity_ntu: 4.0,
      conductivity_us_cm: 250,
      nitrate_mg_l: 1.5,
      phosphate_mg_l: 0.05
    },
    bio: {
      stonefly_nymphs: 4,
      mayfly_nymphs: 8,
      caddisfly_larvae: 6,
      freshwater_shrimp: 2,
      dragonfly_nymphs: 2,
      beetle_larvae: 3,
      blackfly_larvae: 0,
      midges_bloodworms: 0,
      tubifex_worms: 0,
      leeches: 0,
      pouch_snails: 1,
      algal_cover_pct: 10,
      dead_fish_observed: 0,
      live_fish_observed: 3
    },
    visual: {
      water_clarity: 'crystal_clear',
      water_odor: 'none',
      surface_sheen: 'none',
      flow_rate: 'moderate_riffle',
      recent_heavy_rainfall: false,
      trash_density: 'none'
    },
    assessment: {
      composite_one_health_score: 90.2,
      one_health_tier: 'Pristine Stream Ecosystem',
      ecological_health: {
        wqi_score: 92.0,
        wqi_rating: 'Excellent',
        ehi_score: 88.5,
        ehi_rating: 'Optimal',
        dissolved_oxygen_saturation_pct: 94.2,
        resilience_tier: 'Resilient'
      },
      biological_indices: {
        bmwp_score: 52,
        bmwp_class: 'Category II: Clean / Moderate Quality',
        ept_count: 18,
        fbi_score: 3.5,
        organic_pollution_level: 'Very Clean'
      },
      public_health_hazards: {
        waterborne_pathogen_risk: 'LOW',
        pathogen_risk_score: 12.0,
        pathogen_vectors: [],
        vector_borne_hazard: 'LOW',
        vector_risk_score: 10.0,
        vector_notes: 'Natural biocontrol present',
        cyanobacterial_hab_risk: 'LOW',
        hab_risk_score: 8.0,
        hab_notes: 'Thermal and nutrient levels safe',
        recreational_advisory: 'SAFE',
        pet_and_wildlife_hazard: 'SAFE',
        primary_hazard_driver: 'Parameters Within Safe Recreational Thresholds'
      },
      validation: {
        status: 'VERIFIED',
        confidence_score: 95.0,
        anomalies: [],
        contradictions_detected: [],
        scientific_rationale: 'Concordance confirmed across all physical, visual, and ecological indicators.',
        human_in_the_loop_flag: false
      },
      plain_language_summary: 'Water is clean and safe for contact.',
      actionable_interventions: ['Continue regular bi-weekly monitoring.'],
      early_warning_alerts: []
    },
    fhir_observation_count: 8
  };

  const bundle = generateClientFhirBundle(record);
  assert.strictEqual(bundle.resourceType, 'Bundle');
  assert.strictEqual(bundle.type, 'collection');
  assert.strictEqual(bundle.total, 8); // 4 core + cond + nitrate + phosphate + RiskAssessment

  const resourceTypes = bundle.entry.map((e: any) => e.resource.resourceType);
  assert.ok(resourceTypes.includes('Observation'));
  assert.ok(resourceTypes.includes('RiskAssessment'));

  const riskRes = bundle.entry.find((e: any) => e.resource.resourceType === 'RiskAssessment')?.resource;
  assert.strictEqual(riskRes.subject.display, 'Urban Stream Waterway: Ribeira de Coselhas Tributary');
  assert.strictEqual(riskRes.note[0].text, 'One Health Composite Score: 90.2/100. Contact Advisory: SAFE.');
});
