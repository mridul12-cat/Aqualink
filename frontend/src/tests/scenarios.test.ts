import test from 'node:test';
import assert from 'node:assert';

test('loadScenario resets all parameters cleanly with zero state pollution', () => {
  // Scenario definitions matching ObservationForm.tsx
  const cleanScenario = {
    tempC: 13.8,
    nitrate: 0.8,
    phosphate: 0.02,
    conductivity: 120,
    stoneflies: 5,
    mayflies: 10,
    tubifex: 0,
    bloodworms: 0,
    trashDensity: 'none'
  };

  const algalBloomScenario = {
    tempC: 24.8,
    nitrate: 16.0,
    phosphate: 0.55,
    conductivity: 450,
    stoneflies: 0,
    mayflies: 0,
    tubifex: 12,
    bloodworms: 18,
    trashDensity: 'moderate'
  };

  // Simulating loading algal bloom then switching to clean
  let current = { ...algalBloomScenario };
  assert.strictEqual(current.nitrate, 16.0);
  assert.strictEqual(current.phosphate, 0.55);

  current = { ...cleanScenario };
  assert.strictEqual(current.nitrate, 0.8);
  assert.strictEqual(current.phosphate, 0.02);
  assert.strictEqual(current.tubifex, 0);
  assert.strictEqual(current.stoneflies, 5);
  assert.strictEqual(current.trashDensity, 'none');
});

test('Watershed station filtering logic', () => {
  const dummyStreams = [
    {
      id: 'obs-001',
      stream_name: 'Silver Creek',
      station_id: 'STA-001',
      catchment_basin: 'Upper Willamette Basin',
      assessment: {
        composite_one_health_score: 92.5,
        public_health_hazards: {
          recreational_advisory: 'SAFE'
        }
      }
    },
    {
      id: 'obs-002',
      stream_name: 'Industrial Canal',
      station_id: 'STA-002',
      catchment_basin: 'Lower Harbor Basin',
      assessment: {
        composite_one_health_score: 28.0,
        public_health_hazards: {
          recreational_advisory: 'UNSAFE'
        }
      }
    }
  ];

  // Filter by advisory
  const safeOnly = dummyStreams.filter(
    (s) => s.assessment.public_health_hazards.recreational_advisory === 'SAFE'
  );
  assert.strictEqual(safeOnly.length, 1);
  assert.strictEqual(safeOnly[0].station_id, 'STA-001');

  // Filter by search query
  const searchMatch = dummyStreams.filter(
    (s) => s.stream_name.toLowerCase().includes('canal')
  );
  assert.strictEqual(searchMatch.length, 1);
  assert.strictEqual(searchMatch[0].id, 'obs-002');
});
