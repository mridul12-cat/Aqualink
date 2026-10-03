import type {
  StreamObservationRecord,
  CitizenObservationCreate,
  AIValidationResult,
  EarlyWarningAlert,
  WatershedStats,
} from '../types';
import { generateClientFhirBundle } from './fhir';

export { generateClientFhirBundle };

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : {};
    if (metaEnv.VITE_API_URL) {
      return metaEnv.VITE_API_URL;
    }
    // In development mode (e.g. Vite running on port 5173), direct requests to the FastAPI backend on port 8000
    if (window.location.port === '5173') {
      const host = window.location.hostname || 'localhost';
      return `http://${host}:8000/api/v1`;
    }
  }
  return '/api/v1';
};

const API_BASE = getApiBase();

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchStreams(
  catchment?: string,
  advisory?: string,
  minScore?: number,
  pilotCity?: string
): Promise<StreamObservationRecord[]> {
  const params = new URLSearchParams();
  if (catchment && catchment !== 'all') params.append('catchment', catchment);
  if (advisory && advisory !== 'all') params.append('advisory', advisory);
  if (minScore !== undefined) params.append('min_score', minScore.toString());
  if (pilotCity && pilotCity !== 'all') params.append('pilot_city', pilotCity);

  const url = `${API_BASE}/streams${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch streams');
  return res.json();
}

export async function fetchStreamById(id: string): Promise<StreamObservationRecord> {
  const res = await fetch(`${API_BASE}/streams/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch stream ${id}`);
  return res.json();
}

export async function validateObservationDraft(draft: CitizenObservationCreate): Promise<AIValidationResult> {
  const res = await fetch(`${API_BASE}/observations/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  });
  if (!res.ok) throw new Error('Failed to validate draft');
  return res.json();
}

export async function submitObservation(data: CitizenObservationCreate): Promise<StreamObservationRecord> {
  const res = await fetch(`${API_BASE}/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit observation');
  return res.json();
}

export async function fetchAlerts(pilotCity?: string): Promise<{ total_active_alerts: number; alerts: EarlyWarningAlert[] }> {
  const params = new URLSearchParams();
  if (pilotCity && pilotCity !== 'all') params.append('pilot_city', pilotCity);

  const url = `${API_BASE}/alerts${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchStats(pilotCity?: string): Promise<WatershedStats> {
  const params = new URLSearchParams();
  if (pilotCity && pilotCity !== 'all') params.append('pilot_city', pilotCity);

  const url = `${API_BASE}/stats${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function fetchFhirBundle(pilotCity?: string): Promise<any> {
  const params = new URLSearchParams();
  if (pilotCity && pilotCity !== 'all') params.append('pilot_city', pilotCity);

  const url = `${API_BASE}/fhir/bundle${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch FHIR bundle');
  return res.json();
}

export async function fetchSingleFhir(recordId: string, fallbackRecord?: StreamObservationRecord): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/fhir/observations/${recordId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`GET ${API_BASE}/fhir/observations/${recordId} network call failed:`, err);
  }

  // If backend GET returned non-200 (e.g. 404 in serverless environments) or failed, attempt stateless POST or client-side generation
  if (fallbackRecord) {
    try {
      const postRes = await fetch(`${API_BASE}/fhir/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fallbackRecord),
      });
      if (postRes.ok) {
        return await postRes.json();
      }
    } catch (err) {
      console.warn(`POST ${API_BASE}/fhir/generate failed, falling back to local FHIR generator:`, err);
    }
    return generateClientFhirBundle(fallbackRecord);
  }

  throw new Error(`Failed to fetch FHIR record`);
}

export async function fetchOgcGeoJson(pilotCity?: string): Promise<any> {
  const params = new URLSearchParams();
  if (pilotCity && pilotCity !== 'all') params.append('pilot_city', pilotCity);

  const url = `${API_BASE}/ogc/geojson${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch OGC GeoJSON');
  return res.json();
}

