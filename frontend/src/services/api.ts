import {
  StreamObservationRecord,
  CitizenObservationCreate,
  AIValidationResult,
  EarlyWarningAlert,
  WatershedStats,
} from '../types';

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

export async function fetchStreams(catchment?: string, advisory?: string, minScore?: number): Promise<StreamObservationRecord[]> {
  const params = new URLSearchParams();
  if (catchment) params.append('catchment', catchment);
  if (advisory) params.append('advisory', advisory);
  if (minScore !== undefined) params.append('min_score', minScore.toString());

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

export async function fetchAlerts(): Promise<{ total_active_alerts: number; alerts: EarlyWarningAlert[] }> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchStats(): Promise<WatershedStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function fetchFhirBundle(): Promise<any> {
  const res = await fetch(`${API_BASE}/fhir/bundle`);
  if (!res.ok) throw new Error('Failed to fetch FHIR bundle');
  return res.json();
}

export async function fetchSingleFhir(recordId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/fhir/observations/${recordId}`);
  if (!res.ok) throw new Error('Failed to fetch FHIR record');
  return res.json();
}

export async function fetchOgcGeoJson(): Promise<any> {
  const res = await fetch(`${API_BASE}/ogc/geojson`);
  if (!res.ok) throw new Error('Failed to fetch OGC GeoJSON');
  return res.json();
}
