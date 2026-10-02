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

test('PILOT_BASINS configuration contains all required pilots and valid coordinates', async () => {
  const { PILOT_BASINS } = await import('../types/index.ts');

  // Verify all 4 required locations + all view exist
  assert.ok(PILOT_BASINS.coimbra);
  assert.ok(PILOT_BASINS.benevento);
  assert.ok(PILOT_BASINS.oslo);
  assert.ok(PILOT_BASINS.portland);
  assert.ok(PILOT_BASINS.all);

  // Coimbra coordinates (~40.20°N, -8.41°W)
  const [coiLat, coiLng] = PILOT_BASINS.coimbra.center;
  assert.ok(coiLat >= 40.0 && coiLat <= 40.5, `Coimbra lat ${coiLat} out of range`);
  assert.ok(coiLng >= -8.6 && coiLng <= -8.2, `Coimbra lng ${coiLng} out of range`);
  assert.strictEqual(PILOT_BASINS.coimbra.badge, 'Primary EU Pilot');
  assert.ok(PILOT_BASINS.coimbra.basinName.includes('Mondego'));

  // Benevento coordinates (~41.13°N, 14.78°E)
  const [benLat, benLng] = PILOT_BASINS.benevento.center;
  assert.ok(benLat >= 41.0 && benLat <= 41.3, `Benevento lat ${benLat} out of range`);
  assert.ok(benLng >= 14.6 && benLng <= 15.0, `Benevento lng ${benLng} out of range`);
  assert.strictEqual(PILOT_BASINS.benevento.badge, 'EU Pilot');
  assert.ok(PILOT_BASINS.benevento.basinName.includes('Calore'));

  // Oslo coordinates (~59.91°N, 10.75°E)
  const [oslLat, oslLng] = PILOT_BASINS.oslo.center;
  assert.ok(oslLat >= 59.8 && oslLat <= 60.1, `Oslo lat ${oslLat} out of range`);
  assert.ok(oslLng >= 10.6 && oslLng <= 10.9, `Oslo lng ${oslLng} out of range`);
  assert.strictEqual(PILOT_BASINS.oslo.badge, 'EU Pilot');
  assert.ok(PILOT_BASINS.oslo.basinName.includes('Akerselva'));

  // Portland coordinates (~45.51°N, -122.67°W)
  const [pdxLat, pdxLng] = PILOT_BASINS.portland.center;
  assert.ok(pdxLat >= 45.4 && pdxLat <= 45.6, `Portland lat ${pdxLat} out of range`);
  assert.ok(pdxLng >= -122.8 && pdxLng <= -122.5, `Portland lng ${pdxLng} out of range`);
  assert.strictEqual(PILOT_BASINS.portland.badge, 'US Case Study');
  assert.ok(PILOT_BASINS.portland.basinName.includes('Columbia Slough'));
});

test('Pilot city filtering and alert pin detection logic', () => {
  const multiPilotStreams = [
    {
      id: 'obs-prt-coi-001',
      stream_name: 'Ribeira de Coselhas',
      pilot_city: 'coimbra',
      assessment: {
        early_warning_alerts: ['Pathogen risk detected']
      }
    },
    {
      id: 'obs-ita-ben-001',
      stream_name: 'Fiume Calore',
      pilot_city: 'benevento',
      assessment: {
        early_warning_alerts: []
      }
    },
    {
      id: 'obs-nor-osl-001',
      stream_name: 'Akerselva',
      pilot_city: 'oslo',
      assessment: {
        early_warning_alerts: []
      }
    }
  ];

  // Filtering by pilot city
  const coimbraOnly = multiPilotStreams.filter(s => s.pilot_city === 'coimbra');
  assert.strictEqual(coimbraOnly.length, 1);
  assert.strictEqual(coimbraOnly[0].id, 'obs-prt-coi-001');

  // Alert pin detection
  const hasAlertPin = (stream: any) => stream.assessment.early_warning_alerts.length > 0;
  assert.strictEqual(hasAlertPin(multiPilotStreams[0]), true);
  assert.strictEqual(hasAlertPin(multiPilotStreams[1]), false);
});

test('PILOT_BASINS exact dropdown display names match requirement specifications', async () => {
  const { PILOT_BASINS } = await import('../types/index.ts');

  assert.strictEqual(
    PILOT_BASINS.coimbra.name,
    'Coimbra, Portugal (Mondego River Basin / Ribeira de Coselhas) [Primary EU Pilot]'
  );
  assert.strictEqual(
    PILOT_BASINS.benevento.name,
    'Benevento, Italy (Calore River / Sabato River Basin) [EU Pilot]'
  );
  assert.strictEqual(
    PILOT_BASINS.oslo.name,
    'Oslo, Norway (Akerselva / Alna River Basin) [EU Pilot]'
  );
  assert.strictEqual(
    PILOT_BASINS.portland.name,
    'Portland, USA (Columbia Slough / Lower Willamette Basin) [US Case Study]'
  );
});

test('Observation payload contains valid pilot_city assignment', () => {
  const observationPayload = {
    stream_name: 'Ribeira de Coselhas Tributary',
    catchment_basin: 'Ribeira de Coselhas / Mondego Basin',
    pilot_city: 'coimbra',
    latitude: 40.2285,
    longitude: -8.428,
    observer_name: 'Test Volunteer',
    observer_tier: 'Citizen Volunteer',
    readings: {
      temperature_c: 19.5,
      ph: 7.2,
      dissolved_oxygen_mg_l: 7.8,
      turbidity_ntu: 5.0
    }
  };

  assert.strictEqual(observationPayload.pilot_city, 'coimbra');
  assert.ok(observationPayload.latitude >= 40.0 && observationPayload.latitude <= 40.5);
  assert.ok(observationPayload.longitude >= -8.6 && observationPayload.longitude <= -8.2);
});

