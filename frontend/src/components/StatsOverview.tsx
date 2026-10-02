import React from 'react';
import { WatershedStats } from '../types';
import { ShieldCheck, AlertOctagon, Bug, Droplets, Activity, HeartPulse } from 'lucide-react';

interface StatsOverviewProps {
  stats: WatershedStats | null;
  onSelectTab: (tab: 'map' | 'form' | 'alerts' | 'analytics' | 'standards') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, onSelectTab }) => {
  if (!stats) return null;

  const score = stats.mean_one_health_score;
  const scoreColor =
    score >= 75 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
    score >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
    'text-rose-400 border-rose-500/30 bg-rose-500/10';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* 1. Regional One Health Score */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">One Health Score</span>
          <HeartPulse className="w-4 h-4 text-teal-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white">{stats.mean_one_health_score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
        <div className="mt-2">
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${scoreColor}`}>
            {score >= 75 ? 'Balanced Watershed' : score >= 50 ? 'Stressed Baseline' : 'Degraded Health'}
          </span>
        </div>
      </div>

      {/* 2. Mean WQI */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Water Quality (WQI)</span>
          <Droplets className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-cyan-300">{stats.mean_wqi}</span>
          <span className="text-xs text-slate-400">NSF-WQI</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 truncate">
          Phys-chem composite index
        </p>
      </div>

      {/* 3. Ecological Health Index (EHI) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ecological Health</span>
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-emerald-300">{stats.mean_ehi}</span>
          <span className="text-xs text-slate-400">EHI</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 truncate">
          Aquatic resilience & habitat
        </p>
      </div>

      {/* 4. Sensitive Bio-Indicators (EPT Richness) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">EPT Bio-Richness</span>
          <Bug className="w-4 h-4 text-teal-300" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-teal-300">{stats.total_ept_richness_observed}</span>
          <span className="text-xs text-slate-400">taxa observed</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 truncate">
          Mayfly, stonefly, caddisfly
        </p>
      </div>

      {/* 5. Recreational Safety */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recreation Status</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs font-bold text-emerald-400">{stats.advisories.safe} Safe</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-bold text-amber-400">{stats.advisories.caution} Warn</span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-bold text-rose-400">{stats.advisories.unsafe} Unsafe</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 truncate">
          Public contact guidance
        </p>
      </div>

      {/* 6. Active Hazard Triggers */}
      <div
        onClick={() => onSelectTab('alerts')}
        className="bg-slate-900/80 border border-rose-500/30 hover:border-rose-400 rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition-all shadow-sm hover:bg-slate-900 group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">Active Hazards</span>
          <AlertOctagon className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-black text-rose-400">
            {stats.hazard_alerts.high_pathogen_risk_sites +
             stats.hazard_alerts.high_vector_breeding_sites +
             stats.hazard_alerts.high_cyanobacteria_hab_sites}
          </span>
          <span className="text-xs text-rose-300/80">triggers</span>
        </div>
        <p className="text-[10px] text-rose-300 mt-2 underline truncate">
          Inspect Resilience Panel &rarr;
        </p>
      </div>

    </div>
  );
};
