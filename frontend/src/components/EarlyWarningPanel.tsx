import React, { useState } from 'react';
import { EarlyWarningAlert, StreamObservationRecord } from '../types';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Flame,
  Bug,
  Droplets,
  ExternalLink,
  Printer,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface EarlyWarningPanelProps {
  alerts: EarlyWarningAlert[];
  streams: StreamObservationRecord[];
  onSelectStream: (stream: StreamObservationRecord) => void;
}

export const EarlyWarningPanel: React.FC<EarlyWarningPanelProps> = ({ alerts, streams, onSelectStream }) => {
  const [filterType, setFilterType] = useState<'all' | 'pathogen' | 'vector' | 'hab'>('all');
  const [dispatchedAlerts, setDispatchedAlerts] = useState<Record<string, boolean>>({});

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'pathogen') return a.pathogen_risk === 'HIGH' || a.pathogen_risk === 'CRITICAL';
    if (filterType === 'vector') return a.vector_hazard === 'HIGH' || a.vector_hazard === 'CRITICAL';
    if (filterType === 'hab') return a.hab_risk === 'HIGH' || a.hab_risk === 'CRITICAL';
    return true;
  });

  const handleDispatch = (alertId: string) => {
    setDispatchedAlerts((prev) => ({ ...prev, [alertId]: true }));
  };

  const pathogenCount = alerts.filter((a) => a.pathogen_risk === 'HIGH' || a.pathogen_risk === 'CRITICAL').length;
  const vectorCount = alerts.filter((a) => a.vector_hazard === 'HIGH' || a.vector_hazard === 'CRITICAL').length;
  const habCount = alerts.filter((a) => a.hab_risk === 'HIGH' || a.hab_risk === 'CRITICAL').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertOctagon className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-white">One Health Early Warning & Resilience Center</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated anomaly triggers, vector breeding advisories, and municipal incident mitigation workflows.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Incident Briefing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hazard Triage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div
          onClick={() => setFilterType(filterType === 'pathogen' ? 'all' : 'pathogen')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'pathogen'
              ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Pathogen / CSO Alerts</span>
            <Droplets className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-400 font-mono">{pathogenCount}</span>
            <span className="text-xs text-slate-400">active sites</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            E. coli / Coliform runoff, sewer overflow, extreme turbidity.
          </p>
        </div>

        <div
          onClick={() => setFilterType(filterType === 'vector' ? 'all' : 'vector')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'vector'
              ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Vector Breeding Triggers</span>
            <Bug className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-400 font-mono">{vectorCount}</span>
            <span className="text-xs text-slate-400">critical pools</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Stagnant warm water & severe hypoxia excluding natural fish predators.
          </p>
        </div>

        <div
          onClick={() => setFilterType(filterType === 'hab' ? 'all' : 'hab')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterType === 'hab'
              ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Cyanobacterial Blooms</span>
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-cyan-400 font-mono">{habCount}</span>
            <span className="text-xs text-slate-400">bloom warnings</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Microcystin cyanotoxin risk from nutrient load & DO supersaturation.
          </p>
        </div>

      </div>

      {/* Alerts Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Active Environmental Health Directives ({filteredAlerts.length})</span>
          </h2>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg ${filterType === 'all' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilterType('pathogen')}
              className={`px-2.5 py-1 rounded-lg ${filterType === 'pathogen' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Pathogen
            </button>
            <button
              onClick={() => setFilterType('vector')}
              className={`px-2.5 py-1 rounded-lg ${filterType === 'vector' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Vector
            </button>
            <button
              onClick={() => setFilterType('hab')}
              className={`px-2.5 py-1 rounded-lg ${filterType === 'hab' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              HAB
            </button>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">No active alerts matching this filter.</p>
            <p className="text-xs text-slate-500 mt-1">Watershed conditions in this category remain within acceptable baselines.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert, idx) => {
              const streamObj = streams.find((s) => s.id === alert.stream_id);
              const isDispatched = dispatchedAlerts[`${alert.stream_id}-${idx}`];

              return (
                <div
                  key={`${alert.stream_id}-${idx}`}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-400">{alert.station_id}</span>
                        <h3 className="text-sm font-bold text-white">{alert.stream_name}</h3>
                        <span className="text-[10px] text-slate-400">({alert.catchment_basin})</span>
                      </div>
                      <p className="text-xs font-semibold text-rose-300 mt-1 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{alert.alert}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        alert.advisory === 'UNSAFE' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {alert.advisory}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
                        Score: {alert.one_health_score}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Dispatch Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                      <span>Pathogen: <strong className="text-slate-200">{alert.pathogen_risk}</strong></span>
                      <span>Vector: <strong className="text-slate-200">{alert.vector_hazard}</strong></span>
                      <span>HAB: <strong className="text-slate-200">{alert.hab_risk}</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {streamObj && (
                        <button
                          onClick={() => onSelectStream(streamObj)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-semibold flex items-center space-x-1"
                        >
                          <span>Full Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDispatch(`${alert.stream_id}-${idx}`)}
                        disabled={isDispatched}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center space-x-1 ${
                          isDispatched
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {isDispatched ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Dispatch Logged</span>
                          </>
                        ) : (
                          <span>Dispatch Municipal Unit</span>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
