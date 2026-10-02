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
