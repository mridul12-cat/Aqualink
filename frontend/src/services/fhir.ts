import type { StreamObservationRecord } from '../types';

function createObservationResource({
  obsId,
  streamName,
  catchment,
  timestampIso,
  observerName,
  observerTier,
  codeLoinc,
  displayName,
  value,
  unit,
  ucumCode,
  interpretationCode = 'N',
  interpretationDisplay = 'Normal',
  notes = '',
  pilotCity,
}: {
  obsId: string;
  streamName: string;
  catchment: string;
  timestampIso: string;
  observerName: string;
  observerTier: string;
  codeLoinc: string;
  displayName: string;
  value: number;
  unit: string;
  ucumCode: string;
  interpretationCode?: string;
  interpretationDisplay?: string;
  notes?: string;
  pilotCity?: string;
}) {
  const resource: any = {
    resourceType: 'Observation',
    id: obsId,
    meta: {
      profile: [
        'http://hl7.org/fhir/StructureDefinition/Observation',
        'http://hl7.eu/fhir/environmental/StructureDefinition/water-quality-observation',
      ],
    },
    identifier: [
      {
        system: 'urn:ietf:rfc:3986',
        value: `urn:uuid:${obsId}`,
      },
    ],
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'social-history',
            display: 'Social History / Environmental Exposure',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: codeLoinc,
          display: displayName,
        },
      ],
      text: displayName,
    },
    subject: {
      reference: `Location/${(catchment || 'stream').toLowerCase().replace(/\s+/g, '-')}`,
      display: `Catchment: ${catchment} | Stream: ${streamName}`,
    },
    effectiveDateTime: timestampIso,
    performer: [
      {
        display: `${observerName} (${observerTier})`,
      },
    ],
    valueQuantity: {
      value: Number(value),
      unit: unit,
      system: 'http://unitsofmeasure.org',
      code: ucumCode,
    },
    interpretation: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: interpretationCode,
            display: interpretationDisplay,
          },
        ],
      },
    ],
  };

  if (notes) {
    resource.note = [{ text: notes }];
  }
  if (pilotCity) {
    resource.extension = [
      {
        url: 'http://hl7.eu/fhir/environmental/StructureDefinition/pilot-city',
        valueString: pilotCity,
      },
    ];
  }
  return resource;
}

function createRiskAssessmentResource({
  assessmentId,
  streamName,
  timestampIso,
  compositeScore,
  pathogenRisk,
  vectorRisk,
  habRisk,
  recreationAdvisory,
  actionableInterventions,
  pilotCity,
}: {
  assessmentId: string;
  streamName: string;
  timestampIso: string;
  compositeScore: number;
  pathogenRisk: string;
  vectorRisk: string;
  habRisk: string;
  recreationAdvisory: string;
  actionableInterventions: string[];
  pilotCity?: string;
}) {
  const resource: any = {
    resourceType: 'RiskAssessment',
    id: assessmentId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/RiskAssessment'],
    },
    status: 'final',
    subject: {
      display: `Urban Stream Waterway: ${streamName}`,
    },
    occurrenceDateTime: timestampIso,
    condition: {
      text: 'Urban Environmental Exposure & One Health Vector Hazard',
    },
    prediction: [
      {
        outcome: {
          text: 'Waterborne Pathogen Infection Hazard (E. coli / Leptospira / Enteric vectors)',
        },
        qualitativeRisk: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/risk-probability',
              code: (pathogenRisk || 'low').toLowerCase(),
              display: `${pathogenRisk || 'Low'} Risk`,
            },
          ],
        },
      },
      {
        outcome: {
          text: 'Vector-Borne Arboviral Hazard (Culex mosquito breeding in stagnant hypoxic reach)',
        },
        qualitativeRisk: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/risk-probability',
              code: (vectorRisk || 'low').toLowerCase(),
              display: `${vectorRisk || 'Low'} Hazard`,
            },
          ],
        },
      },
      {
        outcome: {
          text: 'Cyanobacterial Toxin Exposure (Harmful Algal Bloom / Microcystins)',
        },
        qualitativeRisk: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/risk-probability',
              code: (habRisk || 'low').toLowerCase(),
              display: `${habRisk || 'Low'} Hazard`,
            },
          ],
        },
      },
    ],
    mitigation: (actionableInterventions || []).join('; '),
    note: [
      {
        text: `One Health Composite Score: ${compositeScore}/100. Contact Advisory: ${recreationAdvisory}.`,
      },
    ],
  };

  if (pilotCity) {
    resource.extension = [
      {
        url: 'http://hl7.eu/fhir/environmental/StructureDefinition/pilot-city',
        valueString: pilotCity,
      },
    ];
  }
  return resource;
}

function getRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a standards-compliant HL7 FHIR R4 Bundle directly from any StreamObservationRecord.
 * Ensures that newly submitted observations can export FHIR bundles immediately, even on
 * serverless or offline deployments where the in-memory database may not persist across instances.
 */
export function generateClientFhirBundle(record: StreamObservationRecord): any {
  const bundleId = getRandomUUID();
  const timestamp = record.timestamp || new Date().toISOString();
  const streamName = record.stream_name;
  const catchment = record.catchment_basin;
  const pilotCity = record.pilot_city;
  const observer = record.observer_name;
  const tier = record.observer_tier;
  const readings = record.readings;
  const assessment = record.assessment;
  const hazards = assessment.public_health_hazards;

  const entries: any[] = [];

  // 1. Water Temperature (LOINC 8040-0)
  entries.push({
    fullUrl: `urn:uuid:${getRandomUUID()}`,
    resource: createObservationResource({
      obsId: `obs-temp-${record.id}`,
      streamName,
      catchment,
      timestampIso: timestamp,
      observerName: observer,
      observerTier: tier,
      codeLoinc: '8040-0',
      displayName: 'Water Temperature',
      value: readings.temperature_c,
      unit: 'Cel',
      ucumCode: 'Cel',
      interpretationCode: readings.temperature_c > 22.0 ? 'H' : 'N',
      interpretationDisplay: readings.temperature_c > 22.0 ? 'High' : 'Normal',
      pilotCity,
    }),
  });

  // 2. pH of Water (LOINC 11558-4)
  const phInterp = readings.ph < 6.5 ? 'L' : readings.ph > 8.5 ? 'H' : 'N';
  const phDisplay = readings.ph < 6.5 ? 'Low / Acidic' : readings.ph > 8.5 ? 'High / Alkaline' : 'Normal';
  entries.push({
    fullUrl: `urn:uuid:${getRandomUUID()}`,
    resource: createObservationResource({
      obsId: `obs-ph-${record.id}`,
      streamName,
      catchment,
      timestampIso: timestamp,
      observerName: observer,
      observerTier: tier,
      codeLoinc: '11558-4',
      displayName: 'pH of Water',
      value: readings.ph,
      unit: 'pH',
      ucumCode: '[pH]',
      interpretationCode: phInterp,
      interpretationDisplay: phDisplay,
      pilotCity,
    }),
  });

  // 3. Dissolved Oxygen (LOINC 2710-2)
  const doInterp = readings.dissolved_oxygen_mg_l < 4.0 ? 'LL' : readings.dissolved_oxygen_mg_l < 6.0 ? 'L' : 'N';
  const doDisplay = readings.dissolved_oxygen_mg_l < 4.0 ? 'Critically Hypoxic' : readings.dissolved_oxygen_mg_l < 6.0 ? 'Sub-optimal' : 'Adequate';
  entries.push({
    fullUrl: `urn:uuid:${getRandomUUID()}`,
    resource: createObservationResource({
      obsId: `obs-do-${record.id}`,
      streamName,
      catchment,
      timestampIso: timestamp,
      observerName: observer,
      observerTier: tier,
      codeLoinc: '2710-2',
      displayName: 'Oxygen dissolved [Mass/volume] in Water',
      value: readings.dissolved_oxygen_mg_l,
      unit: 'mg/L',
      ucumCode: 'mg/L',
      interpretationCode: doInterp,
      interpretationDisplay: doDisplay,
      pilotCity,
    }),
  });

  // 4. Turbidity of Water (LOINC 97561-5)
  const turbInterp = readings.turbidity_ntu > 20.0 ? 'H' : 'N';
  const turbDisplay = readings.turbidity_ntu > 20.0 ? 'Elevated Turbidity' : 'Normal';
  entries.push({
    fullUrl: `urn:uuid:${getRandomUUID()}`,
    resource: createObservationResource({
      obsId: `obs-turb-${record.id}`,
      streamName,
      catchment,
      timestampIso: timestamp,
      observerName: observer,
      observerTier: tier,
      codeLoinc: '97561-5',
      displayName: 'Turbidity of Water',
      value: readings.turbidity_ntu,
      unit: 'NTU',
      ucumCode: '[NTU]',
      interpretationCode: turbInterp,
      interpretationDisplay: turbDisplay,
      pilotCity,
    }),
  });

  // 5. Optional Specific Conductance (LOINC 2965-2)
  if (readings.conductivity_us_cm !== undefined && readings.conductivity_us_cm !== null) {
    entries.push({
      fullUrl: `urn:uuid:${getRandomUUID()}`,
      resource: createObservationResource({
        obsId: `obs-cond-${record.id}`,
        streamName,
        catchment,
        timestampIso: timestamp,
        observerName: observer,
        observerTier: tier,
        codeLoinc: '2965-2',
        displayName: 'Specific Conductance of Water',
        value: readings.conductivity_us_cm,
        unit: 'uS/cm',
        ucumCode: 'uS/cm',
        pilotCity,
      }),
    });
  }

  // 6. Optional Nitrate (LOINC 14860-1)
  if (readings.nitrate_mg_l !== undefined && readings.nitrate_mg_l !== null) {
    entries.push({
      fullUrl: `urn:uuid:${getRandomUUID()}`,
      resource: createObservationResource({
        obsId: `obs-no3-${record.id}`,
        streamName,
        catchment,
        timestampIso: timestamp,
        observerName: observer,
        observerTier: tier,
        codeLoinc: '14860-1',
        displayName: 'Nitrate [Mass/volume] in Water',
        value: readings.nitrate_mg_l,
        unit: 'mg/L',
        ucumCode: 'mg/L',
        interpretationCode: readings.nitrate_mg_l > 10.0 ? 'H' : 'N',
        interpretationDisplay: readings.nitrate_mg_l > 10.0 ? 'Elevated Nitrate' : 'Normal',
        pilotCity,
      }),
    });
  }

  // 7. Optional Phosphate (LOINC 14879-1)
  if (readings.phosphate_mg_l !== undefined && readings.phosphate_mg_l !== null) {
    entries.push({
      fullUrl: `urn:uuid:${getRandomUUID()}`,
      resource: createObservationResource({
        obsId: `obs-po4-${record.id}`,
        streamName,
        catchment,
        timestampIso: timestamp,
        observerName: observer,
        observerTier: tier,
        codeLoinc: '14879-1',
        displayName: 'Phosphate [Mass/volume] in Water',
        value: readings.phosphate_mg_l,
        unit: 'mg/L',
        ucumCode: 'mg/L',
        interpretationCode: readings.phosphate_mg_l > 0.1 ? 'H' : 'N',
        interpretationDisplay: readings.phosphate_mg_l > 0.1 ? 'Elevated / Eutrophic Trigger' : 'Normal',
        pilotCity,
      }),
    });
  }

  // 8. One Health Risk Assessment resource
  entries.push({
    fullUrl: `urn:uuid:${getRandomUUID()}`,
    resource: createRiskAssessmentResource({
      assessmentId: `risk-${record.id}`,
      streamName,
      timestampIso: timestamp,
      compositeScore: assessment.composite_one_health_score,
      pathogenRisk: hazards.waterborne_pathogen_risk,
      vectorRisk: hazards.vector_borne_hazard,
      habRisk: hazards.cyanobacterial_hab_risk,
      recreationAdvisory: hazards.recreational_advisory,
      actionableInterventions: assessment.actionable_interventions || [],
      pilotCity,
    }),
  });

  return {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'collection',
    timestamp: new Date().toISOString(),
    total: entries.length,
    entry: entries,
  };
}
