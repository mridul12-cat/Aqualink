import React, { useState, useEffect } from 'react';
import {
  CitizenObservationCreate,
  AIValidationResult,
  StreamObservationRecord,
  WaterClarity,
  WaterOdor,
  SurfaceSheen,
  FlowRate,
  TrashDensity
} from '../types';
import { validateObservationDraft, submitObservation } from '../services/api';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Camera,
  Droplets,
  Bug,
  Eye,
  Send,
  Loader2,
  Check,
  RefreshCw
} from 'lucide-react';

interface ObservationFormProps {
  onObservationAdded: (newRecord: StreamObservationRecord) => void;
  onViewRecord: (record: StreamObservationRecord) => void;
}

export const ObservationForm: React.FC<ObservationFormProps> = ({ onObservationAdded, onViewRecord }) => {
  // Form State
  const [streamName, setStreamName] = useState('Columbia Slough Tributary');
  const [catchmentBasin, setCatchmentBasin] = useState('Lower Columbia Watershed');
  const [observerName, setObserverName] = useState('Alex Rivera');
  const [observerTier, setObserverTier] = useState('Citizen Volunteer');
  const [latitude, setLatitude] = useState(45.515);
  const [longitude, setLongitude] = useState(-122.652);
  const [notes, setNotes] = useState('Observed after morning rain; water flow moderate.');

  // Physical-chemical
  const [tempC, setTempC] = useState<number>(16.5);
  const [ph, setPh] = useState<number>(7.4);
  const [doMgL, setDoMgL] = useState<number>(9.2);
  const [turbidityNtu, setTurbidityNtu] = useState<number>(4.8);
  const [conductivity, setConductivity] = useState<number>(180);
  const [nitrate, setNitrate] = useState<number>(1.2);
  const [phosphate, setPhosphate] = useState<number>(0.04);

  // Macroinvertebrates
  const [stoneflies, setStoneflies] = useState<number>(4);
  const [mayflies, setMayflies] = useState<number>(8);
  const [caddisflies, setCaddisflies] = useState<number>(6);
  const [dragonflies, setDragonflies] = useState<number>(2);
  const [beetles, setBeetles] = useState<number>(3);
  const [blackflies, setBlackflies] = useState<number>(0);
  const [bloodworms, setBloodworms] = useState<number>(0);
  const [tubifex, setTubifex] = useState<number>(0);
  const [leeches, setLeeches] = useState<number>(0);
  const [snails, setSnails] = useState<number>(1);
  const [algalCover, setAlgalCover] = useState<number>(10);
  const [deadFish, setDeadFish] = useState<number>(0);
  const [liveFish, setLiveFish] = useState<number>(3);

  // Visual
  const [clarity, setClarity] = useState<WaterClarity>('crystal_clear');
  const [odor, setOdor] = useState<WaterOdor>('none');
  const [sheen, setSheen] = useState<SurfaceSheen>('none');
  const [flowRate, setFlowRate] = useState<FlowRate>('moderate_riffle');
  const [recentRain, setRecentRain] = useState<boolean>(false);
  const [trashDensity, setTrashDensity] = useState<TrashDensity>('low');

  // Photo
  const [photoSample, setPhotoSample] = useState<string>('clear_stream');
  const [photoDescription, setPhotoDescription] = useState<string>('Clear rocky substrate with moderate ripple flow');

  // AI Validation State
  const [validationResult, setValidationResult] = useState<AIValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<StreamObservationRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Build payload
  const currentPayload: CitizenObservationCreate = {
    stream_name: streamName,
    catchment_basin: catchmentBasin,
    observer_name: observerName,
    observer_tier: observerTier,
    latitude: Number(latitude),
    longitude: Number(longitude),
    notes,
    readings: {
      temperature_c: Number(tempC),
      ph: Number(ph),
      dissolved_oxygen_mg_l: Number(doMgL),
      turbidity_ntu: Number(turbidityNtu),
      conductivity_us_cm: Number(conductivity),
      nitrate_mg_l: Number(nitrate),
      phosphate_mg_l: Number(phosphate),
    },
    bio: {
      stonefly_nymphs: Number(stoneflies),
      mayfly_nymphs: Number(mayflies),
      caddisfly_larvae: Number(caddisflies),
      freshwater_shrimp: 2,
      dragonfly_nymphs: Number(dragonflies),
      beetle_larvae: Number(beetles),
      blackfly_larvae: Number(blackflies),
      midges_bloodworms: Number(bloodworms),
      tubifex_worms: Number(tubifex),
      leeches: Number(leeches),
      pouch_snails: Number(snails),
      algal_cover_pct: Number(algalCover),
      dead_fish_observed: Number(deadFish),
      live_fish_observed: Number(liveFish),
    },
    visual: {
      water_clarity: clarity,
      water_odor: odor,
      surface_sheen: sheen,
      flow_rate: flowRate,
      recent_heavy_rainfall: recentRain,
      trash_density: trashDensity,
      photo_description: photoDescription,
    },
  };

  // Run instant AI validation with debounce
  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = await validateObservationDraft(currentPayload);
        if (!cancelled) {
          setValidationResult(result);
        }
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        if (!cancelled) setIsValidating(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    streamName, catchmentBasin, tempC, ph, doMgL, turbidityNtu, conductivity,
    nitrate, phosphate, stoneflies, mayflies, caddisflies, tubifex, bloodworms,
    clarity, odor, sheen, flowRate, recentRain, algalCover, deadFish, photoDescription
  ]);

  // Handle Preset Quick Scenarios
  const loadScenario = (type: 'clean' | 'sewage_paradox' | 'stagnant_vector' | 'algal_bloom') => {
    setSubmittedRecord(null);
    if (type === 'clean') {
      setStreamName('Fernhill Restored Riffle');
      setTempC(13.8);
      setPh(7.4);
      setDoMgL(10.2);
      setTurbidityNtu(2.5);
      setConductivity(120);
      setNitrate(0.8);
      setPhosphate(0.02);
      setStoneflies(5);
      setMayflies(10);
      setCaddisflies(8);
      setDragonflies(2);
      setBeetles(3);
      setBlackflies(0);
      setBloodworms(0);
      setTubifex(0);
      setLeeches(0);
      setSnails(0);
      setDeadFish(0);
      setLiveFish(6);
      setClarity('crystal_clear');
      setOdor('none');
      setSheen('none');
      setFlowRate('moderate_riffle');
      setRecentRain(false);
      setTrashDensity('none');
      setAlgalCover(5);
      setPhotoDescription('Clear mountain riffle with gravel substrate and abundant stoneflies');
    } else if (type === 'sewage_paradox') {
      setStreamName('Urban Paradox Creek');
      setTempC(21.0);
      setPh(6.8);
      setDoMgL(3.2); // Hypoxic
      setTurbidityNtu(68.0);
      setConductivity(650);
      setNitrate(18.0);
      setPhosphate(0.65);
      setStoneflies(6); // CONTRADICTION: Stoneflies in hypoxic water
      setMayflies(8);
      setCaddisflies(0);
      setDragonflies(0);
      setBeetles(0);
      setBlackflies(2);
      setBloodworms(30);
      setTubifex(25);
      setLeeches(12);
      setSnails(8);
      setDeadFish(2);
      setLiveFish(0);
      setClarity('crystal_clear'); // CONTRADICTION: Claims crystal clear with 68 NTU
      setOdor('sewage_sulfur'); // CONTRADICTION: Sewage odor with stoneflies
      setSheen('scum_foam');
      setFlowRate('slow_trickle');
      setRecentRain(true);
      setTrashDensity('severe');
      setAlgalCover(25);
      setPhotoDescription('Visible foam near outflow, brown turbidity');
    } else if (type === 'stagnant_vector') {
      setStreamName('Lowland Marsh Hollow');
      setTempC(26.5); // Warm
      setPh(7.2);
      setDoMgL(2.4); // Severe Hypoxia
      setTurbidityNtu(16.0);
      setConductivity(380);
      setNitrate(4.5);
      setPhosphate(0.15);
      setStoneflies(0);
      setMayflies(0);
      setCaddisflies(0);
      setDragonflies(0);
      setBeetles(1);
      setBlackflies(0);
      setBloodworms(35);
      setTubifex(28);
      setLeeches(8);
      setSnails(15);
      setDeadFish(0);
      setLiveFish(0); // No fish to eat mosquito larvae
      setClarity('murky');
      setOdor('earthy_musty');
      setSheen('scum_foam');
      setFlowRate('stagnant_pools'); // Stagnant
      setRecentRain(false);
      setTrashDensity('moderate');
      setAlgalCover(40);
      setPhotoDescription('Stagnant standing pools with surface organic film and mosquito larvae');
    } else if (type === 'algal_bloom') {
      setStreamName('Agricultural Slough #7');
      setTempC(24.8);
      setPh(9.1); // High pH due to CO2 consumption
      setDoMgL(14.5); // Supersaturation
      setTurbidityNtu(34.0);
      setConductivity(450);
      setNitrate(16.0);
      setPhosphate(0.55);
      setStoneflies(0);
      setMayflies(0);
      setCaddisflies(0);
      setDragonflies(1);
      setBeetles(0);
      setBlackflies(0);
      setBloodworms(18);
      setTubifex(12);
      setLeeches(4);
      setSnails(10);
      setDeadFish(1);
      setLiveFish(1);
      setClarity('murky');
      setOdor('fishy_decay');
      setSheen('scum_foam');
      setFlowRate('slow_trickle');
      setRecentRain(false);
      setTrashDensity('moderate');
      setAlgalCover(80);
      setPhotoDescription('Vibrant green surface bloom covering 80% of pool');
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const record = await submitObservation(currentPayload);
      setSubmittedRecord(record);
      onObservationAdded(record);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit observation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-white">Citizen Stream Observation Portal</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Track 1 Citizen Science UX with Live Track 3 AI Multimodal Validation and Contradiction Detection.
            </p>
          </div>

          {/* Quick Demo Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Load Scenario:</span>
            <button
              type="button"
              onClick={() => loadScenario('clean')}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
            >
              Pristine Headwater
            </button>
            <button
              type="button"
              onClick={() => loadScenario('sewage_paradox')}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
            >
              Contradiction Paradox
            </button>
            <button
              type="button"
              onClick={() => loadScenario('stagnant_vector')}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              Mosquito Vector Risk
            </button>
            <button
              type="button"
              onClick={() => loadScenario('algal_bloom')}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
            >
              Toxic HAB Bloom
            </button>
          </div>
        </div>
      </div>

      {/* Submission Success Confirmation Modal / Banner */}
      {submittedRecord && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Observation Successfully Certified & Recorded!
              </h2>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                {submittedRecord.stream_name} assigned One Health Score:{' '}
                <strong>{submittedRecord.assessment.composite_one_health_score}/100</strong> ({submittedRecord.assessment.one_health_tier})
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewRecord(submittedRecord)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              Inspect Full One Health Profile &rarr;
            </button>
            <button
              onClick={() => setSubmittedRecord(null)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Form & Live AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Input Form (2 cols wide on desktop) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Location & Observer Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
              <span>1. Location & Field Metadata</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Stream Name</label>
                <input
                  type="text"
                  value={streamName}
                  onChange={(e) => setStreamName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Catchment Basin</label>
                <input
                  type="text"
                  value={catchmentBasin}
                  onChange={(e) => setCatchmentBasin(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Observer Name</label>
                <input
                  type="text"
                  value={observerName}
                  onChange={(e) => setObserverName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Observer Tier</label>
                <select
                  value={observerTier}
                  onChange={(e) => setObserverTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="Citizen Volunteer">Citizen Volunteer</option>
                  <option value="Trained Streamkeeper">Trained Streamkeeper</option>
                  <option value="Field Biologist">Field Biologist / Academic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Physical & Chemical In-Situ Readings */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>2. Physical & Chemical Probe Measurements</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Dissolved Oxygen */}
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-300">Dissolved Oxygen (DO)</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">{doMgL} mg/L</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="18"
                  step="0.1"
                  value={doMgL}
                  onChange={(e) => setDoMgL(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0 (Hypoxic)</span>
                  <span>Optimal: 7 - 11</span>
                  <span>18 (Hyper-aerated)</span>
                </div>
              </div>

              {/* pH Level */}
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-300">pH Level</span>
                  <span className="text-xs font-mono font-bold text-teal-400">{ph}</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="11.0"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(parseFloat(e.target.value))}
                  className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Acidic (&lt;6)</span>
                  <span>Neutral: 6.8 - 8.2</span>
                  <span>Alkaline (&gt;8.5)</span>
                </div>
              </div>

              {/* Turbidity */}
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-300">Turbidity</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{turbidityNtu} NTU</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={turbidityNtu}
                  onChange={(e) => setTurbidityNtu(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0 (Crystal)</span>
                  <span>&lt;10 Clear</span>
                  <span>&gt;40 Turbid/Storm</span>
                </div>
              </div>

              {/* Water Temperature */}
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-300">Water Temperature</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{tempC} °C</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="0.5"
                  value={tempC}
                  onChange={(e) => setTempC(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5°C (Cold)</span>
                  <span>12-18°C (Salmonid)</span>
                  <span>&gt;22°C (Warm/Vector)</span>
                </div>
              </div>

              {/* Nitrates */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Nitrate (NO₃⁻ mg/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={nitrate}
                  onChange={(e) => setNitrate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Phosphates */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Orthophosphate (PO₄³⁻ mg/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={phosphate}
                  onChange={(e) => setPhosphate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

            </div>
          </div>

          {/* Section 3: Benthic Macroinvertebrate Bio-Assessment */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Bug className="w-3.5 h-3.5 text-teal-400" />
                <span>3. Macroinvertebrates & Bio-Indicators</span>
              </h3>
              <span className="text-[10px] text-slate-400">BMWP & EPT Richness Metric</span>
            </div>

            {/* Group 1: Sensitive Organisms */}
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 block mb-2">
                Group 1: Pollution-Sensitive Organisms (Clean Water Indicators)
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[11px] font-medium text-slate-300 block">Stonefly Nymphs</span>
                  <span className="text-[9px] text-slate-400 block mb-1.5">Needs DO &gt; 6.5 mg/L</span>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setStoneflies(Math.max(0, stoneflies - 1))}
                      className="w-6 h-6 rounded bg-slate-800 text-white font-bold text-xs"
                    >-</button>
                    <span className="font-mono font-bold text-sm text-teal-300">{stoneflies}</span>
                    <button
                      type="button"
                      onClick={() => setStoneflies(stoneflies + 1)}
                      className="w-6 h-6 rounded bg-slate-800 text-white font-bold text-xs"
                    >+</button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[11px] font-medium text-slate-300 block">Mayfly Nymphs</span>
                  <span className="text-[9px] text-slate-400 block mb-1.5">Sensitive Gills</span>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setMayflies(Math.max(0, mayflies - 1))}
                      className="w-6 h-6 rounded bg-slate-800 text-white font-bold text-xs"
                    >-</button>
                    <span className="font-mono font-bold text-sm text-teal-300">{mayflies}</span>
                    <button
                      type="button"
                      onClick={() => setMayflies(mayflies + 1)}
                      className="w-6 h-6 rounded bg-slate-800 text-white font-bold text-xs"
                    >+</button>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-center">
                  <span className="text-[11px] font-medium text-slate-300 block">Caddisfly Larvae</span>
                  <span className="text-[9px] text-slate-400 block mb-1.5">Case-builders</span>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCaddisflies(Math.max(0, caddisflies - 1))}
                      className="w-6 h-6 rounded bg-slate-800 text-white font-bold text-xs"
                    >-</button>
                    <span className="font-mono font-bold text-sm text-teal-300">{caddisflies}</span>
                    <button
                      type="button"
                      onClick={() => setCaddisflies(caddisflies + 1)}
                      className="w-6 h-6 rounded bg-slate-800 text-white font-bold text-xs"
                    >+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 2 & 3: Moderate & Tolerant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 block mb-2">
                  Group 2: Moderately Tolerant
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                    <span className="text-[11px] text-slate-300 block">Dragonflies</span>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <button type="button" onClick={() => setDragonflies(Math.max(0, dragonflies - 1))} className="w-5 h-5 bg-slate-800 rounded text-xs">-</button>
                      <span className="font-mono font-bold text-xs text-amber-300">{dragonflies}</span>
                      <button type="button" onClick={() => setDragonflies(dragonflies + 1)} className="w-5 h-5 bg-slate-800 rounded text-xs">+</button>
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                    <span className="text-[11px] text-slate-300 block">Beetle Larvae</span>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <button type="button" onClick={() => setBeetles(Math.max(0, beetles - 1))} className="w-5 h-5 bg-slate-800 rounded text-xs">-</button>
                      <span className="font-mono font-bold text-xs text-amber-300">{beetles}</span>
                      <button type="button" onClick={() => setBeetles(beetles + 1)} className="w-5 h-5 bg-slate-800 rounded text-xs">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-rose-400 block mb-2">
                  Group 3: Pollution-Tolerant (Sludge/Organic)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                    <span className="text-[11px] text-slate-300 block">Tubifex Worms</span>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <button type="button" onClick={() => setTubifex(Math.max(0, tubifex - 1))} className="w-5 h-5 bg-slate-800 rounded text-xs">-</button>
                      <span className="font-mono font-bold text-xs text-rose-400">{tubifex}</span>
                      <button type="button" onClick={() => setTubifex(tubifex + 1)} className="w-5 h-5 bg-slate-800 rounded text-xs">+</button>
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                    <span className="text-[11px] text-slate-300 block">Bloodworms (Midges)</span>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <button type="button" onClick={() => setBloodworms(Math.max(0, bloodworms - 1))} className="w-5 h-5 bg-slate-800 rounded text-xs">-</button>
                      <span className="font-mono font-bold text-xs text-rose-400">{bloodworms}</span>
                      <button type="button" onClick={() => setBloodworms(bloodworms + 1)} className="w-5 h-5 bg-slate-800 rounded text-xs">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Algal Cover and Fish Observations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Algal Cover %: {algalCover}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={algalCover}
                  onChange={(e) => setAlgalCover(parseInt(e.target.value))}
                  className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Live Fish Observed</label>
                <input
                  type="number"
                  min="0"
                  value={liveFish}
                  onChange={(e) => setLiveFish(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-rose-400 mb-1">Dead Fish Count</label>
                <input
                  type="number"
                  min="0"
                  value={deadFish}
                  onChange={(e) => setDeadFish(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-rose-900/50 rounded-lg px-2.5 py-1 text-xs text-rose-300"
                />
              </div>
            </div>

          </div>

          {/* Section 4: Visual & Environmental Conditions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>4. Visual & Environmental Field Observations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Water Clarity</label>
                <select
                  value={clarity}
                  onChange={(e) => setClarity(e.target.value as WaterClarity)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="crystal_clear">Crystal Clear</option>
                  <option value="slightly_turbid">Slightly Turbid</option>
                  <option value="murky">Murky / Cloudy</option>
                  <option value="opaque">Opaque / Dense</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Water Odor</label>
                <select
                  value={odor}
                  onChange={(e) => setOdor(e.target.value as WaterOdor)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="none">None / Fresh</option>
                  <option value="earthy_musty">Earthy / Musty</option>
                  <option value="sewage_sulfur">Sewage / Sulfur (Rotten Egg)</option>
                  <option value="chemical_petrol">Chemical / Petroleum</option>
                  <option value="fishy_decay">Fishy / Organic Decay</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Flow Rate</label>
                <select
                  value={flowRate}
                  onChange={(e) => setFlowRate(e.target.value as FlowRate)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="moderate_riffle">Moderate Riffle / Flow</option>
                  <option value="slow_trickle">Slow Trickle</option>
                  <option value="stagnant_pools">Stagnant Pools (Vector Risk)</option>
                  <option value="torrential_spate">Torrential Storm Spate</option>
                  <option value="dry_bed">Dry Bed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Surface Sheen</label>
                <select
                  value={sheen}
                  onChange={(e) => setSheen(e.target.value as SurfaceSheen)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="none">None</option>
                  <option value="natural_biogenic">Natural Biogenic Sheen</option>
                  <option value="scum_foam">Algae Scum / Foam</option>
                  <option value="petroleum_rainbow">Petroleum Rainbow Film</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Trash Density</label>
                <select
                  value={trashDensity}
                  onChange={(e) => setTrashDensity(e.target.value as TrashDensity)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="none">None</option>
                  <option value="low">Low (1-2 pieces)</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe Dumping</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recentRain}
                    onChange={(e) => setRecentRain(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-teal-500 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300 font-medium">Recent heavy rain within 24h</span>
                </label>
              </div>

            </div>

            {/* Field Photo Description */}
            <div className="pt-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1">
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                <span>Field Image Annotation / Vision Analysis</span>
              </label>
              <input
                type="text"
                value={photoDescription}
                onChange={(e) => setPhotoDescription(e.target.value)}
                placeholder="Describe substrate, water coloration, foam, or algal cover..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Validated submissions are transformed into HL7 FHIR and OGC standards.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing One Health Pipeline...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Certify & Submit Observation</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Right Column: Live AI Validation Assistant & Contradiction Feed */}
        <div className="space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-20 shadow-md">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">AI Validation Agent</h3>
                  <span className="text-[10px] text-slate-400">Continuous Heuristic & Ecological Reasoning</span>
                </div>
              </div>
              {isValidating && <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin" />}
            </div>

            {/* Confidence Score Bar */}
            {validationResult && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Data Confidence Score</span>
                  <span className={`font-mono font-extrabold text-sm ${
                    validationResult.confidence_score >= 80 ? 'text-emerald-400' :
                    validationResult.confidence_score >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {validationResult.confidence_score}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      validationResult.confidence_score >= 80 ? 'bg-emerald-500' :
                      validationResult.confidence_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${validationResult.confidence_score}%` }}
                  />
                </div>

                {/* Validation Status Badge */}
                <div className="pt-2">
                  {validationResult.status === 'VERIFIED' && (
                    <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-lg text-emerald-400 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">Observation Certified (Zero Contradictions)</span>
                    </div>
                  )}

                  {validationResult.status === 'FLAG_CONTRADICTION' && (
                    <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-lg text-rose-400 text-xs">
                      <AlertOctagonIcon className="w-4 h-4 shrink-0" />
                      <span className="font-bold">Contradiction Detected: Human Review Flagged</span>
                    </div>
                  )}

                  {validationResult.status === 'FLAG_ANOMALY' && (
                    <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-lg text-amber-400 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="font-semibold">Data Anomaly Triggered</span>
                    </div>
                  )}

                  {validationResult.status === 'NEEDS_REVIEW' && (
                    <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-3 py-2 rounded-lg text-blue-300 text-xs">
                      <HelpCircle className="w-4 h-4 shrink-0 text-blue-400" />
                      <span className="font-semibold">Observation Advisory (Under Review)</span>
                    </div>
                  )}
                </div>

                {/* Contradictions List */}
                {validationResult.contradictions_detected.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                      Critical Contradictions:
                    </span>
                    {validationResult.contradictions_detected.map((c, idx) => (
                      <div key={idx} className="bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-lg text-xs text-rose-200">
                        {c}
                      </div>
                    ))}
                  </div>
                )}

                {/* Anomalies List */}
                {validationResult.anomalies.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Ecological & Sensor Flags:
                    </span>
                    {validationResult.anomalies.map((a, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-300">{a.category}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {a.severity}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{a.description}</p>
                        {a.suggested_correction && (
                          <p className="text-teal-400 text-[10px] italic">
                            Correction: {a.suggested_correction}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Explainable Rationale */}
                <div className="mt-4 bg-slate-950/80 border border-slate-800 p-3 rounded-lg text-xs text-slate-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Explainable AI Rationale:
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {validationResult.scientific_rationale}
                  </p>
                </div>

                {/* Multimodal image notes */}
                {validationResult.image_verification_notes && (
                  <div className="mt-2 bg-teal-950/30 border border-teal-500/20 p-2.5 rounded-lg text-[11px] text-teal-300">
                    <Camera className="w-3.5 h-3.5 inline mr-1 text-teal-400" />
                    <strong>Vision Sync:</strong> {validationResult.image_verification_notes}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

function AlertOctagonIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
