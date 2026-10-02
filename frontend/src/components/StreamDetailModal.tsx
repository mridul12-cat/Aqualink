import React, { useState } from 'react';
import { StreamObservationRecord, PILOT_BASINS, PilotCityId } from '../types';
import { fetchSingleFhir } from '../services/api';
import {
  X,
  Droplets,
  Bug,
  AlertTriangle,
  ShieldCheck,
  Activity,
  HeartPulse,
  FileCode2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Info
} from 'lucide-react';

interface StreamDetailModalProps {
  stream: StreamObservationRecord | null;
  onClose: () => void;
}

export const StreamDetailModal: React.FC<StreamDetailModalProps> = ({ stream, onClose }) => {
  const [showFhir, setShowFhir] = useState(false);
  const [fhirData, setFhirData] = useState<any>(null);
  const [isLoadingFhir, setIsLoadingFhir] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!stream) return null;

  const assessment = stream.assessment;
  const hazards = assessment.public_health_hazards;
  const eco = assessment.ecological_health;
  const bio = assessment.biological_indices;
  const val = assessment.validation;

  const handleLoadFhir = async () => {
    setIsLoadingFhir(true);
    try {
      const data = await fetchSingleFhir(stream.id);
      setFhirData(data);
      setShowFhir(true);
    } catch (err) {
      console.error('Failed to load FHIR bundle:', err);
    } finally {
      setIsLoadingFhir(false);
    }
  };

  const handleCopyFhir = () => {
    if (!fhirData) return;
    navigator.clipboard.writeText(JSON.stringify(fhirData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const advisoryBadge =
    hazards.recreational_advisory === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
    hazards.recreational_advisory === 'CAUTION' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
    'bg-rose-500/20 text-rose-400 border-rose-500/40';

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                {stream.station_id}
              </span>
              {stream.pilot_city && (
                <span className="inline-flex items-center space-x-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800/80 text-sky-300 border border-sky-500/30">
                  <span>{PILOT_BASINS[stream.pilot_city as PilotCityId]?.flag || '🌍'}</span>
                  <span>{PILOT_BASINS[stream.pilot_city as PilotCityId]?.city || stream.pilot_city}</span>
                </span>
              )}
              <span className="text-xs text-slate-400">{stream.catchment_basin}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${advisoryBadge}`}>
                {hazards.recreational_advisory} CONTACT
              </span>
            </div>
            <h2 className="text-xl font-black text-white">{stream.stream_name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Observer: {stream.observer_name} ({stream.observer_tier}) &bull; Lat: {stream.latitude.toFixed(4)}, Lng: {stream.longitude.toFixed(4)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Top Score Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">One Health Harmony</span>
              <div className="text-3xl font-black text-teal-300 font-mono">
                {assessment.composite_one_health_score}
                <span className="text-sm text-slate-400">/100</span>
              </div>
              <span className="text-[10px] text-teal-400 font-semibold mt-1 block">
                {assessment.one_health_tier}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Water Quality (WQI)</span>
              <div className="text-3xl font-black text-cyan-300 font-mono">
                {eco.wqi_score}
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold mt-1 block">
                {eco.wqi_rating} (DO: {eco.dissolved_oxygen_saturation_pct}% sat)
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ecological Health</span>
              <div className="text-3xl font-black text-emerald-300 font-mono">
                {eco.ehi_score}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                {eco.resilience_tier} Tier
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">BMWP Bio-Score</span>
              <div className="text-3xl font-black text-teal-400 font-mono">
                {bio.bmwp_score}
              </div>
              <span className="text-[10px] text-teal-300 font-semibold mt-1 block">
                {bio.ept_count} Sensitive EPT Taxa
              </span>
            </div>

          </div>

          {/* Plain Language Summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span>Plain-Language One Health Summary</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {assessment.plain_language_summary}
            </p>
          </div>

          {/* Public Health Hazard Vector Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Public Health Disease Vector Hazards</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Pathogen Risk */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Waterborne Pathogens</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    hazards.waterborne_pathogen_risk === 'LOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    hazards.waterborne_pathogen_risk === 'MODERATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {hazards.waterborne_pathogen_risk}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Risk Score: <strong className="text-white">{hazards.pathogen_risk_score}/100</strong>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                  {hazards.pathogen_vectors.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>

              {/* Vector-Borne Hazard */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Disease Vector Habitat</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    hazards.vector_borne_hazard === 'LOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    hazards.vector_borne_hazard === 'MODERATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {hazards.vector_borne_hazard}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Vector Score: <strong className="text-white">{hazards.vector_risk_score}/100</strong>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {hazards.vector_notes}
                </p>
              </div>

              {/* Cyanobacterial HAB */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Toxic HAB Bloom</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    hazards.cyanobacterial_hab_risk === 'LOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    hazards.cyanobacterial_hab_risk === 'MODERATE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {hazards.cyanobacterial_hab_risk}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  HAB Score: <strong className="text-white">{hazards.hab_risk_score}/100</strong>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {hazards.hab_notes}
                </p>
              </div>

            </div>
          </div>

          {/* Physical & Chemical In-situ measurements grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Recorded Physical & Chemical In-Situ Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Temperature</span>
                <span className="font-mono font-bold text-slate-100">{stream.readings.temperature_c} °C</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">pH</span>
                <span className="font-mono font-bold text-slate-100">{stream.readings.ph}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Dissolved Oxygen</span>
                <span className="font-mono font-bold text-cyan-400">{stream.readings.dissolved_oxygen_mg_l} mg/L</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Turbidity</span>
                <span className="font-mono font-bold text-amber-400">{stream.readings.turbidity_ntu} NTU</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Conductivity</span>
                <span className="font-mono font-bold text-slate-100">{stream.readings.conductivity_us_cm ?? 'N/A'} µS/cm</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Nitrate (NO₃⁻)</span>
                <span className="font-mono font-bold text-slate-100">{stream.readings.nitrate_mg_l ?? 'N/A'} mg/L</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Phosphate (PO₄³⁻)</span>
                <span className="font-mono font-bold text-slate-100">{stream.readings.phosphate_mg_l ?? 'N/A'} mg/L</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Hilsenhoff FBI</span>
                <span className="font-mono font-bold text-teal-400">{bio.fbi_score}</span>
              </div>
            </div>
          </div>

          {/* Benthic Macroinvertebrate Survey Counts */}
          {stream.bio && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Benthic Macroinvertebrate Survey Observations</span>
                <span className="text-[10px] text-teal-400 font-normal">BMWP: {bio.bmwp_score} ({bio.bmwp_class})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Stonefly Nymphs</span>
                  <span className="font-mono font-bold text-teal-300">{stream.bio.stonefly_nymphs}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Mayfly Nymphs</span>
                  <span className="font-mono font-bold text-teal-300">{stream.bio.mayfly_nymphs}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Caddisfly Larvae</span>
                  <span className="font-mono font-bold text-teal-300">{stream.bio.caddisfly_larvae}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Freshwater Shrimp</span>
                  <span className="font-mono font-bold text-teal-300">{stream.bio.freshwater_shrimp}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Dragonfly Nymphs</span>
                  <span className="font-mono font-bold text-amber-300">{stream.bio.dragonfly_nymphs}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Beetle Larvae</span>
                  <span className="font-mono font-bold text-amber-300">{stream.bio.beetle_larvae}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Blackfly Larvae</span>
                  <span className="font-mono font-bold text-amber-300">{stream.bio.blackfly_larvae}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Tubifex Worms</span>
                  <span className="font-mono font-bold text-rose-400">{stream.bio.tubifex_worms}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Midges / Bloodworms</span>
                  <span className="font-mono font-bold text-rose-400">{stream.bio.midges_bloodworms}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Leeches</span>
                  <span className="font-mono font-bold text-rose-400">{stream.bio.leeches}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pouch Snails</span>
                  <span className="font-mono font-bold text-rose-400">{stream.bio.pouch_snails}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Algal Cover / Fish</span>
                  <span className="font-mono font-bold text-slate-200">{stream.bio.algal_cover_pct}% / {stream.bio.live_fish_observed} live</span>
                </div>
              </div>
            </div>
          )}

          {/* Actionable Interventions */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Actionable Municipal & Community Interventions
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
              {assessment.actionable_interventions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>

          {/* HL7 FHIR Interoperability Drawer */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-950 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-200">HL7 FHIR R4 Standards Export</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Track 7 Interoperability
                </span>
              </div>
              {!showFhir ? (
                <button
                  onClick={handleLoadFhir}
                  disabled={isLoadingFhir}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1"
                >
                  <span>Generate FHIR Bundle</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyFhir}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={() => setShowFhir(false)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                  >
                    Collapse
                  </button>
                </div>
              )}
            </div>

            {showFhir && fhirData && (
              <div className="bg-slate-950/90 p-4 border-t border-slate-800 max-h-72 overflow-y-auto">
                <pre className="text-[11px] font-mono text-emerald-400/90 whitespace-pre-wrap">
                  {JSON.stringify(fhirData, null, 2)}
                </pre>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
