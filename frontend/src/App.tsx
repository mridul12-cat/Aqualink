import React, { useState, useEffect } from 'react';
import { StreamObservationRecord, WatershedStats, EarlyWarningAlert } from './types';
import { fetchStreams, fetchStats, fetchAlerts } from './services/api';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { StreamMap } from './components/StreamMap';
import { ObservationForm } from './components/ObservationForm';
import { EarlyWarningPanel } from './components/EarlyWarningPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { InteropModal } from './components/InteropModal';
import { StreamDetailModal } from './components/StreamDetailModal';
import { Waves, Loader2, RefreshCw } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'form' | 'alerts' | 'analytics' | 'standards'>('map');
  const [streams, setStreams] = useState<StreamObservationRecord[]>([]);
  const [stats, setStats] = useState<WatershedStats | null>(null);
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamObservationRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [streamsData, statsData, alertsData] = await Promise.all([
        fetchStreams(),
        fetchStats(),
        fetchAlerts(),
      ]);
      setStreams(streamsData);
      setStats(statsData);
      setAlerts(alertsData.alerts || []);
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setError('Unable to connect to AquaLink OneHealth Backend API. Please verify backend is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleObservationAdded = (newRecord: StreamObservationRecord) => {
    setStreams((prev) => [newRecord, ...prev]);
    // Refresh stats & alerts
    fetchStats().then(setStats).catch(console.error);
    fetchAlerts().then((res) => setAlerts(res.alerts)).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-teal-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertCount={alerts.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error Notice */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between">
            <span className="text-xs text-rose-300 font-semibold">{error}</span>
            <button
              onClick={loadData}
              className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Global Watershed Status Metric Strip */}
        <StatsOverview stats={stats} onSelectTab={setActiveTab} />

        {/* Loading Spinner */}
        {isLoading && streams.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            <span className="text-sm font-semibold text-slate-400">
              Loading AquaLink OneHealth Intelligence Engine...
            </span>
          </div>
        ) : (
          <>
            {activeTab === 'map' && (
              <StreamMap
                streams={streams}
                onSelectStream={(s) => setSelectedStream(s)}
              />
            )}

            {activeTab === 'form' && (
              <ObservationForm
                onObservationAdded={handleObservationAdded}
                onViewRecord={(rec) => setSelectedStream(rec)}
              />
            )}

            {activeTab === 'alerts' && (
              <EarlyWarningPanel
                alerts={alerts}
                streams={streams}
                onSelectStream={(s) => setSelectedStream(s)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsPanel
                streams={streams}
                onSelectStream={(s) => setSelectedStream(s)}
              />
            )}

            {activeTab === 'standards' && (
              <InteropModal />
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      <StreamDetailModal
        stream={selectedStream}
        onClose={() => setSelectedStream(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Waves className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-200">AquaLink OneHealth</span>
            <span className="text-slate-600">&bull;</span>
            <span>IEEE OneAquaHealth Global Hackathon 2026</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="text-slate-400">Track 3: AI-Supported Assessment</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400">Track 7: Digital Health Standards (HL7 FHIR / EFMI)</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400">Track 1 & 2: Citizen UX & Insights</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
