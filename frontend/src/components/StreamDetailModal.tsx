import React, { useState } from 'react';
import { StreamObservationRecord, PILOT_BASINS, PilotCityId } from '../types';
import { fetchSingleFhir, generateClientFhirBundle } from '../services/api';
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
  Info,
  Sparkles,
  HelpCircle,
  AlertOctagon,
  Eye,
  Shield,
  Loader2
} from 'lucide-react';
import { ValidationExplainerModal } from './ValidationExplainerModal';

interface StreamDetailModalProps {
  stream: StreamObservationRecord | null;
  onClose: () => void;
}

export const StreamDetailModal: React.FC<StreamDetailModalProps> = ({ stream, onClose }) => {
  const [showFhir, setShowFhir] = useState(false);
  const [fhirData, setFhirData] = useState<any>(null);
  const [isLoadingFhir, setIsLoadingFhir] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);

  if (!stream) return null;

  const assessment = stream.assessment;
  const hazards = assessment.public_health_hazards;
  const eco = assessment.ecological_health;
  const bio = assessment.biological_indices;
  const val = assessment.validation;

  const isHighRisk = hazards.recreational_advisory === 'UNSAFE' || assessment.composite_one_health_score < 45 || hazards.waterborne_pathogen_risk === 'CRITICAL';
  const isModerateRisk = !isHighRisk && (hazards.recreational_advisory === 'CAUTION' || assessment.composite_one_health_score < 70);
  const riskTitle = isHighRisk ? 'HIGH ECOLOGICAL & PUBLIC HEALTH RISK' : isModerateRisk ? 'MODERATE ECOLOGICAL STRESS' : assessment.composite_one_health_score >= 85 ? 'PRISTINE STREAM ECOSYSTEM' : 'HEALTHY & BALANCED STREAM REACH';

  const handleLoadFhir = async () => {
    if (!stream) return;
    setIsLoadingFhir(true);
    try {
      const data = await fetchSingleFhir(stream.id || stream.station_id, stream);
      setFhirData(data);
      setShowFhir(true);
    } catch (err) {
      console.warn('Backend FHIR fetch failed, generating client-side bundle:', err);
      try {
        const localData = generateClientFhirBundle(stream);
        setFhirData(localData);
        setShowFhir(true);
      } catch (localErr) {
        console.error('Failed to generate local FHIR bundle:', localErr);
      }
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

          {/* Executive One Health Decision Hierarchy (Judge-Oriented) */}
          <div className={`border rounded-xl p-4 space-y-3 ${
            isHighRisk ? 'bg-rose-950/30 border-rose-500/40 shadow-lg shadow-rose-950/30' :
            isModerateRisk ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-950/30' :
            'bg-slate-950/80 border-slate-800'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-black tracking-wider px-2.5 py-1 rounded-lg uppercase ${
                  isHighRisk ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  isModerateRisk ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {riskTitle}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  Score: <strong className="text-white font-mono">{assessment.composite_one_health_score}/100</strong> ({assessment.one_health_tier})
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Status:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  val.human_in_the_loop_flag
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {val.human_in_the_loop_flag ? 'HUMAN REVIEW REQUIRED' : 'AUTOMATED CHECKS PASSED'}
                </span>
              </div>
            </div>

            {/* Why? */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 block">
                Why?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border ${
                  stream.readings.dissolved_oxygen_mg_l < 4.0 ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' :
                  stream.readings.dissolved_oxygen_mg_l < 6.0 ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' :
                  'bg-slate-900/90 border-slate-800 text-slate-200'
                }`}>
                  <span className="font-bold mr-1.5">{stream.readings.dissolved_oxygen_mg_l < 6.0 ? '⚠' : '✓'}</span>
                  DO: <strong>{stream.readings.dissolved_oxygen_mg_l} mg/L</strong> ({eco.dissolved_oxygen_saturation_pct}% sat {stream.readings.dissolved_oxygen_mg_l < 4.0 ? '— Critical Hypoxia / Fish Mortality' : stream.readings.dissolved_oxygen_mg_l < 6.0 ? '— Low Oxygen Stress' : '— Sufficient Aeration'})
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  stream.readings.turbidity_ntu > 20.0 ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' :
                  'bg-slate-900/90 border-slate-800 text-slate-200'
                }`}>
                  <span className="font-bold mr-1.5">{stream.readings.turbidity_ntu > 20.0 ? '⚠' : '✓'}</span>
                  Turbidity: <strong>{stream.readings.turbidity_ntu} NTU</strong> {stream.readings.turbidity_ntu > 40.0 ? '(Severe runoff & sediment loading)' : stream.readings.turbidity_ntu > 20.0 ? '(Elevated suspended particles)' : '(Clear water column)'}
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  stream.visual?.water_odor === 'sewage_sulfur' ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' :
                  stream.visual?.water_odor !== 'none' ? 'bg-amber-950/40 border-amber-500/30 text-amber-200' :
                  'bg-slate-900/90 border-slate-800 text-slate-200'
                }`}>
                  <span className="font-bold mr-1.5">{stream.visual?.water_odor !== 'none' ? '⚠' : '✓'}</span>
                  Odor: <strong>{stream.visual?.water_odor || 'none'}</strong> {stream.visual?.water_odor === 'sewage_sulfur' ? '(Raw sewage/sulfur discharge)' : stream.visual?.water_odor === 'none' ? '(No noxious odors)' : '(Decomposing matter flag)'}
                </div>

                <div className={`p-2.5 rounded-lg border ${
                  bio.ept_count === 0 ? 'bg-rose-950/40 border-rose-500/30 text-rose-200' :
                  'bg-slate-900/90 border-slate-800 text-slate-200'
                }`}>
                  <span className="font-bold mr-1.5">{bio.ept_count > 0 ? '✓' : '⚠'}</span>
                  Sensitive bio-indicators: <strong>{bio.ept_count} EPT taxa</strong> {bio.ept_count > 0 ? '(Plecoptera/Ephemeroptera present)' : `(Zero EPT; ${stream.bio?.tubifex_worms || 0} Tubifex worms indicate organic sludge)`}
                </div>
              </div>
            </div>

            {/* Validation & Meaning */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-300">
                  <strong>Validation:</strong> {val.contradictions_detected.length > 0 ? `${val.contradictions_detected.length} contradiction(s) detected` : '0 contradictions detected (Concordant)'}
                </span>
                <span className="text-slate-300">
                  <strong>Validation confidence:</strong> <span className="font-mono text-teal-300">{val.confidence_score}%</span>
                </span>
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed pt-1 border-t border-slate-800">
                <strong>What does it mean?</strong> {assessment.plain_language_summary}
              </div>
            </div>

            {/* Recommended next step */}
            <div className="bg-teal-950/40 border border-teal-500/30 p-2.5 rounded-lg text-xs flex items-start space-x-2">
              <span className="text-[11px] font-black uppercase text-teal-300 shrink-0 mt-0.5">Recommended next step:</span>
              <span className="text-slate-200 font-semibold">
                {assessment.actionable_interventions[0] || 'Continue regular bi-weekly monitoring.'}
              </span>
            </div>
          </div>

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

          {/* AI-Assisted Validation & Data Provenance */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    AI-Assisted Validation & Data Provenance
                  </h3>
                  <span className="text-[10px] text-slate-400">Explainable scientific rule checks & contradiction detection</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExplainer(true)}
                className="px-2.5 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold flex items-center space-x-1 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How Validation Works</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Validation Status</span>
                <span className={`inline-block font-mono font-bold text-xs mt-1 px-2 py-0.5 rounded ${
                  val.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  val.status === 'FLAG_CONTRADICTION' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  val.status === 'FLAG_ANOMALY' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {val.status}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Verification Action</span>
                <span className={`inline-block font-bold text-xs mt-1 px-2 py-0.5 rounded ${
                  val.human_in_the_loop_flag
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {val.human_in_the_loop_flag ? 'HUMAN REVIEW REQUIRED' : 'AUTOMATED CHECKS PASSED'}
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400 text-[10px]">Validation Confidence</span>
                  <span className="font-mono font-black text-sm text-teal-300">{val.confidence_score}%</span>
                </div>
                <span className="text-[9px] text-slate-500 block leading-tight mt-1">
                  Confidence reflects rule agreement; not scientific certainty.
                </span>
              </div>
            </div>

            {val.contradictions_detected.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  Contradictions Flagged ({val.contradictions_detected.length}):
                </span>
                {val.contradictions_detected.map((c, i) => (
                  <div key={i} className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 p-2 rounded-lg">
                    {c}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-900/60 p-2.5 rounded-lg text-xs text-slate-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Scientific Rationale:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {val.scientific_rationale}
              </p>
            </div>
          </div>

          {/* Section: INFERRED One Health Synthesis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>[INFERRED] One Health Risk Indicators & Ecosystem Synthesis</span>
              </h3>
              <span className="text-[10px] text-slate-400">Model-derived indicators</span>
            </div>

            {/* Plain Language Summary */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-teal-400" />
                <span>Plain-Language Synthesis</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {assessment.plain_language_summary}
              </p>
            </div>

            {/* Public Health Hazard Vector Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Pathogen Risk Indicator */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Waterborne Pathogen Risk Indicator</span>
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
                <span className="text-[10px] text-amber-400/90 block italic">
                  Model-derived indicator based on environmental conditions; laboratory confirmation is required.
                </span>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4 pt-1">
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
                  <span className="text-xs font-bold text-slate-200">Toxic HAB Bloom Indicator</span>
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
              [OBSERVED] Physical & Chemical In-Situ Probe Parameters
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
                <span>[OBSERVED] Benthic Macroinvertebrate Field Observations</span>
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
              [RECOMMENDED ACTION] Actionable Municipal & Community Interventions
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
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-slate-950 font-bold text-xs transition-all flex items-center space-x-1.5"
                >
                  {isLoadingFhir ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating FHIR...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate FHIR Bundle</span>
                      <ExternalLink className="w-3 h-3" />
                    </>
                  )}
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

      {/* Validation Explainer Modal */}
      <ValidationExplainerModal
        isOpen={showExplainer}
        onClose={() => setShowExplainer(false)}
      />

    </div>
  );
};
