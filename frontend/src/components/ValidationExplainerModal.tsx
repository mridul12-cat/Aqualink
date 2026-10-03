import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, Shield, Droplets, Eye, Bug, Scale } from 'lucide-react';

interface ValidationExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationExplainerModal: React.FC<ValidationExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10 flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">How Validation Works: Scientific Rules & Evidence</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Explainable AI-assisted pipeline combining physical laws, sensor concordance, and ecological guild reasoning.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Core Philosophy Callout */}
          <div className="bg-gradient-to-r from-teal-950/60 to-cyan-950/60 border border-teal-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider">Core Validation Principle</h3>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  <strong>The system does not automatically decide that a citizen is wrong.</strong> It identifies observations containing scientific contradictions or anomalies that require verification, preventing unverified data from corrupting baselines while keeping human expertise in the loop.
                </p>
              </div>
            </div>
          </div>

          {/* Conceptual Pipeline */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Explainable Validation Pipeline
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center font-semibold">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-300">
                1. Citizen Input
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-cyan-300">
                2. Physical Solubility
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-teal-300">
                3. Sensor ↔ Visual
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-emerald-300">
                4. Ecological Guilds
              </div>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-amber-300">
                5. Human Review
              </div>
            </div>
          </div>

          {/* The 4 Rule Modules */}
          <div className="space-y-4">
            
            {/* Rule 1: Physical Plausibility */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  1. Physical Plausibility & DO Saturation
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Does measured dissolved oxygen agree with expected physical gas solubility limits?
              </p>
              <div className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-400 space-y-1 font-mono">
                <div>• <strong className="text-slate-200">Benson & Krause (1984) / USGS Formula:</strong> Computes theoretical DO saturation limit for stream temperature.</div>
                <div>• <strong className="text-slate-200">Rule PHYS_01:</strong> DO saturation &gt; 170% physically defies gas solubility laws at atmospheric pressure without probe calibration drift (-30% confidence, Flag Contradiction).</div>
                <div>• <strong className="text-slate-200">Rule PHYS_02:</strong> DO saturation &gt; 130% without visible algal cover flags unexplained supersaturation (-12% confidence, Flag Anomaly).</div>
              </div>
            </div>

            {/* Rule 2: Sensor vs Visual */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Sensor ↔ Visual Consistency
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Does reported visual clarity match measured turbidity values?
              </p>
              <div className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-400 space-y-1 font-mono">
                <div>• <strong className="text-slate-200">Rule VIS_01:</strong> Reporting "crystal clear" water while probe turbidity is &gt; 45 NTU represents a direct contradiction (-20% confidence, Flag Contradiction). Suggests turbidimeter vial contamination or misobservation.</div>
                <div>• <strong className="text-slate-200">Rule VIS_02:</strong> Reporting "opaque" water while turbidity is &lt; 5 NTU flags sensory disagreement (-18% confidence). Suggests deep shadow was mistaken for turbidity.</div>
              </div>
            </div>

            {/* Rule 3: Ecological Consistency */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Bug className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  3. Ecological Consistency & Bio-Indicator Paradoxes
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are reported aquatic organisms compatible with measured environmental conditions?
              </p>
              <div className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-400 space-y-1 font-mono">
                <div>• <strong className="text-slate-200">Rule BIO_01 (Stonefly Hypoxia Paradox):</strong> <em>Plecoptera</em> (stonefly nymphs) have delicate gill tufts and cannot survive prolonged dissolved oxygen &lt; 4.0 mg/L (-25% confidence, Flag Contradiction). Indicates specimen misidentification (likely damselfly or midge).</div>
                <div>• <strong className="text-slate-200">Rule BIO_01B (Mayfly Hypoxia Paradox):</strong> <em>Ephemeroptera</em> (mayfly nymphs) cannot survive acute hypoxia &lt; 3.0 mg/L (-20% confidence, Flag Contradiction).</div>
                <div>• <strong className="text-slate-200">Rule BIO_02 (Sanitary vs EPT Contradiction):</strong> Heavy sewage odor logged alongside sensitive EPT nymphs (-25% confidence, Flag Contradiction).</div>
                <div>• <strong className="text-slate-200">Rule BIO_03:</strong> Dominance of pollution-tolerant <em>Tubifex</em> worms in hyper-oxygenated water flags organic sediment legacy (-10% confidence).</div>
              </div>
            </div>

            {/* Rule 4: Extreme Range & Anomaly Detection */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  4. Range Plausibility & Ecological Anomalies
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are readings within freshwater biological tolerance ranges?
              </p>
              <div className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-400 space-y-1 font-mono">
                <div>• <strong className="text-slate-200">Rule RANGE_01:</strong> pH &lt; 4.5 or &gt; 10.0 falls outside standard biological tolerance (5.5 - 9.0) (-15% confidence, Flag Anomaly).</div>
                <div>• <strong className="text-slate-200">Rule ECO_01:</strong> Dead fish observed despite normal DO (&gt; 7.0 mg/L) and normal pH flags suspicion of acute unmonitored toxin or thermal shock (-12% confidence, Flag Anomaly).</div>
              </div>
            </div>

          </div>

          {/* Validation Status Glossary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Validation Statuses & Outcomes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="font-bold text-emerald-400 block mb-0.5">VERIFIED</span>
                <span className="text-[11px] text-slate-300">No automated contradictions detected; full agreement across physics, chemistry, biology, and field reports.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <span className="font-bold text-rose-400 block mb-0.5">FLAG_CONTRADICTION</span>
                <span className="text-[11px] text-slate-300">Direct scientific conflict detected (e.g. stonefly in hypoxia, clear water with high NTU). Triggers human-in-the-loop review.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span className="font-bold text-amber-400 block mb-0.5">FLAG_ANOMALY</span>
                <span className="text-[11px] text-slate-300">Multiple atypical environmental conditions detected. Human review requested before regulatory use.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <span className="font-bold text-blue-300 block mb-0.5">NEEDS_REVIEW</span>
                <span className="text-[11px] text-slate-300">Minor advisory anomaly flagged; data accepted with cautionary advisory notes.</span>
              </div>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-300">Scientific Calibration Note:</span> Validation confidence reflects mathematical and ecological agreement with the prototype's explainable validation rules; it does not represent scientific certainty or laboratory confirmation.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold transition-all"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
};
