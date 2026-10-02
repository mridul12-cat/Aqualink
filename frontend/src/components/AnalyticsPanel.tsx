import React, { useState } from 'react';
import { StreamObservationRecord } from '../types';
import { BarChart3, TrendingUp, Bug, Droplets, ArrowUpDown, ChevronDown, CheckCircle2 } from 'lucide-react';

interface AnalyticsPanelProps {
  streams: StreamObservationRecord[];
  onSelectStream: (stream: StreamObservationRecord) => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ streams, onSelectStream }) => {
  const [sortField, setSortField] = useState<'score' | 'wqi' | 'ept' | 'pathogen'>('score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const sortedStreams = [...streams].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    if (sortField === 'score') {
      valA = a.assessment.composite_one_health_score;
      valB = b.assessment.composite_one_health_score;
    } else if (sortField === 'wqi') {
      valA = a.assessment.ecological_health.wqi_score;
      valB = b.assessment.ecological_health.wqi_score;
    } else if (sortField === 'ept') {
      valA = a.assessment.biological_indices.ept_count;
      valB = b.assessment.biological_indices.ept_count;
    } else if (sortField === 'pathogen') {
      valA = a.assessment.public_health_hazards.pathogen_risk_score;
      valB = b.assessment.public_health_hazards.pathogen_risk_score;
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const toggleSort = (field: 'score' | 'wqi' | 'ept' | 'pathogen') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Aggregated Macroinvertebrate guilds across watershed
  const totalStoneflies = streams.reduce((sum, s) => sum + (s.bio.stonefly_nymphs || 0), 0);
  const totalMayflies = streams.reduce((sum, s) => sum + (s.bio.mayfly_nymphs || 0), 0);
  const totalCaddisflies = streams.reduce((sum, s) => sum + (s.bio.caddisfly_larvae || 0), 0);
  const totalShrimp = streams.reduce((sum, s) => sum + (s.bio.freshwater_shrimp || 0), 0);
  const totalTubifex = streams.reduce((sum, s) => sum + (s.bio.tubifex_worms || 0), 0);
  const totalBloodworms = streams.reduce((sum, s) => sum + (s.bio.midges_bloodworms || 0), 0);
  const totalLeeches = streams.reduce((sum, s) => sum + (s.bio.leeches || 0), 0);
  const totalSnails = streams.reduce((sum, s) => sum + (s.bio.pouch_snails || 0), 0);

  const totalSensitive = totalStoneflies + totalMayflies + totalCaddisflies + totalShrimp;
  const totalTolerant = totalTubifex + totalBloodworms + totalLeeches + totalSnails;
  const totalBugs = totalSensitive + totalTolerant || 1;

  // Catchment Basin Aggregates
  const catchmentMap: Record<string, { count: number; totalScore: number }> = {};
  streams.forEach((s) => {
    const c = s.catchment_basin;
    if (!catchmentMap[c]) catchmentMap[c] = { count: 0, totalScore: 0 };
    catchmentMap[c].count += 1;
    catchmentMap[c].totalScore += s.assessment.composite_one_health_score;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <BarChart3 className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-extrabold text-white">Watershed Ecological & Health Analytics</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Track 2 Data-to-Insight: Multi-parameter synthesis, benthic bio-guild spectrum, and comparative station rankings.
        </p>
      </div>

      {/* 2-Column Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bio-Indicator Guild Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
            <Bug className="w-3.5 h-3.5 text-teal-400" />
            <span>Macroinvertebrate Guild Spectrum (Regional)</span>
          </h2>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-semibold">Sensitive EPT Taxa (Clean Water)</span>
                <span className="font-mono font-bold text-white">{totalSensitive} specimens ({Math.round((totalSensitive / totalBugs) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${(totalSensitive / totalBugs) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Stoneflies: {totalStoneflies}</span>
                <span>Mayflies: {totalMayflies}</span>
                <span>Caddisflies: {totalCaddisflies}</span>
                <span>Shrimp: {totalShrimp}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold">Pollution-Tolerant Taxa (Sludge/Organic)</span>
                <span className="font-mono font-bold text-white">{totalTolerant} specimens ({Math.round((totalTolerant / totalBugs) * 100)}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${(totalTolerant / totalBugs) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Tubifex: {totalTubifex}</span>
                <span>Bloodworms: {totalBloodworms}</span>
                <span>Leeches: {totalLeeches}</span>
                <span>Snails: {totalSnails}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
            A high EPT-to-Tolerant ratio confirms biological water quality and self-purification capacity in headwaters, while high Tubifex density indicates organic sludge deposition downstream.
          </p>
        </div>

        {/* Catchment Basin Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-800">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Catchment Basin Resilience Comparison</span>
          </h2>

          <div className="space-y-2.5">
            {Object.entries(catchmentMap).map(([basin, data]) => {
              const meanScore = Math.round(data.totalScore / data.count);
              const color =
                meanScore >= 75 ? 'bg-emerald-500 text-emerald-400' :
                meanScore >= 50 ? 'bg-amber-500 text-amber-400' :
                'bg-rose-500 text-rose-400';

              return (
                <div key={basin} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 truncate max-w-[200px]">{basin}</span>
                    <span className="font-mono font-bold text-slate-300">
                      Mean: <strong className={color.split(' ')[1]}>{meanScore}</strong>/100 ({data.count} stn)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${color.split(' ')[0]}`}
                      style={{ width: `${meanScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Comparative Stream Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white">
            Comparative Stream Monitoring Leaderboard
          </h2>
          <span className="text-xs text-slate-400">
            Click column headers to sort & rank
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Stream / Station</th>
                <th className="py-2.5 px-3">Catchment</th>
                <th
                  onClick={() => toggleSort('score')}
                  className="py-2.5 px-3 cursor-pointer hover:text-teal-400 font-bold"
                >
                  <div className="flex items-center space-x-1">
                    <span>One Health</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('wqi')}
                  className="py-2.5 px-3 cursor-pointer hover:text-cyan-400"
                >
                  <div className="flex items-center space-x-1">
                    <span>WQI</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('ept')}
                  className="py-2.5 px-3 cursor-pointer hover:text-emerald-400"
                >
                  <div className="flex items-center space-x-1">
                    <span>EPT Taxa</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('pathogen')}
                  className="py-2.5 px-3 cursor-pointer hover:text-rose-400"
                >
                  <div className="flex items-center space-x-1">
                    <span>Pathogen Risk</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Advisory</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {sortedStreams.map((s) => {
                const score = s.assessment.composite_one_health_score;
                const advisory = s.assessment.public_health_hazards.recreational_advisory;
                const scoreColor =
                  score >= 80 ? 'text-teal-300' :
                  score >= 60 ? 'text-amber-400' :
                  'text-rose-400';

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => onSelectStream(s)}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-100 group-hover:text-teal-400">{s.stream_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{s.station_id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[150px]">
                      {s.catchment_basin}
                    </td>
                    <td className={`py-2.5 px-3 font-mono font-extrabold ${scoreColor}`}>
                      {score}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">
                      {s.assessment.ecological_health.wqi_score}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">
                      {s.assessment.biological_indices.ept_count}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-rose-300">
                      {s.assessment.public_health_hazards.pathogen_risk_score}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        advisory === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        advisory === 'CAUTION' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {advisory}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStream(s);
                        }}
                        className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
