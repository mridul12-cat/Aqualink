import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { StreamObservationRecord, PilotCityId, PILOT_BASINS, EarlyWarningAlert } from '../types';
import { Search, Filter, Layers, Info, AlertTriangle, ShieldCheck, Waves, ExternalLink, Globe2 } from 'lucide-react';

interface StreamMapProps {
  streams: StreamObservationRecord[];
  onSelectStream: (stream: StreamObservationRecord) => void;
  selectedPilot?: PilotCityId;
  alerts?: EarlyWarningAlert[];
}

export const StreamMap: React.FC<StreamMapProps> = ({
  streams,
  onSelectStream,
  selectedPilot = 'coimbra',
  alerts = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatchment, setSelectedCatchment] = useState<string>('all');
  const [selectedAdvisory, setSelectedAdvisory] = useState<string>('all');

  const currentBasin = PILOT_BASINS[selectedPilot || 'coimbra'] || PILOT_BASINS.coimbra;

  // Extract unique catchments
  const catchments = Array.from(new Set(streams.map((s) => s.catchment_basin))).sort();

  // Filter streams
  const filteredStreams = streams.filter((stream) => {
    const matchesSearch =
      stream.stream_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.station_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.catchment_basin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCatchment = selectedCatchment === 'all' || stream.catchment_basin === selectedCatchment;
    const matchesAdvisory =
      selectedAdvisory === 'all' ||
      stream.assessment.public_health_hazards.recreational_advisory.toLowerCase() === selectedAdvisory.toLowerCase();

    return matchesSearch && matchesCatchment && matchesAdvisory;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialBasin = PILOT_BASINS[selectedPilot || 'coimbra'] || PILOT_BASINS.coimbra;

    const map = L.map(mapContainerRef.current, {
      center: initialBasin.center,
      zoom: initialBasin.zoom,
      zoomControl: true,
    });

    // Public keyless tile layers (USGS / Esri Topographic and OpenStreetMap)
    const topoLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: USGS, GIS User Community',
      maxZoom: 19,
    });

    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics',
      maxZoom: 19,
    });

    // Default to Topographic map (clear river basin & watershed elevation lines)
    topoLayer.addTo(map);

    L.control.layers({
      "Topographic Watershed": topoLayer,
      "OpenStreetMap": osmLayer,
      "Satellite Imagery": satLayer,
    }, undefined, { position: 'topright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Ensure Leaflet recalculates dimensions once mounted
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Dynamically pan and fit bounds when selectedPilot changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // Close any active popup to prevent DOM reference leaks during animation
    try {
      mapInstanceRef.current.closePopup();
    } catch (e) {
      // ignore
    }
    const basin = PILOT_BASINS[selectedPilot || 'all'];
    if (basin) {
      mapInstanceRef.current.flyTo(basin.center, basin.zoom, {
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
    setSelectedCatchment('all');
    setSearchQuery('');
  }, [selectedPilot]);

  // Update Markers and Alert Pins when filteredStreams or alerts change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    filteredStreams.forEach((stream) => {
      const score = stream.assessment.composite_one_health_score;
      const advisory = stream.assessment.public_health_hazards.recreational_advisory;

      const streamAlerts = (stream.assessment.early_warning_alerts || []).concat(
        alerts.filter((a) => a.stream_id === stream.id).map((a) => a.alert)
      );
      const uniqueAlerts = Array.from(new Set(streamAlerts));
      const hasAlert = uniqueAlerts.length > 0;

      // Color coding based on One Health score & advisory
      let markerColor = '#10b981'; // Green
      if (score < 45 || advisory === 'UNSAFE') {
        markerColor = '#f43f5e'; // Red
      } else if (score < 70 || advisory === 'CAUTION') {
        markerColor = '#f59e0b'; // Amber
      } else if (score >= 85) {
        markerColor = '#06b6d4'; // Cyan
      }

      const alertPingHtml = hasAlert ? `
        <span style="
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          background: #f43f5e;
          opacity: 0.6;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          pointer-events: none;
        "></span>
        <span style="
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
          border: 2px solid #0f172a;
          box-shadow: 0 2px 4px rgba(0,0,0,0.6);
          z-index: 20;
        ">!</span>
      ` : '';

      const customIcon = L.divIcon({
        className: 'custom-stream-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px;">
            ${alertPingHtml}
            <div style="
              background-color: ${markerColor};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.5);
              font-weight: 800;
              font-size: 11px;
              color: #0f172a;
              position: relative;
              z-index: 10;
            ">
              ${Math.round(score)}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([stream.latitude, stream.longitude], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1';
      popupContent.innerHTML = `
        <div style="font-family: inherit;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">${stream.station_id}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${markerColor}22; color: ${markerColor}; border: 1px solid ${markerColor}44;">
              ${stream.assessment.public_health_hazards.recreational_advisory}
            </span>
          </div>
          <h3 style="font-size: 14px; font-weight: 700; color: #f8fafc; margin: 0 0 4px 0;">${stream.stream_name}</h3>
          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 8px 0;">${stream.catchment_basin}</p>

          ${hasAlert ? `
            <div style="background: rgba(225, 29, 72, 0.15); border: 1px solid rgba(244, 63, 94, 0.5); border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
              <div style="font-size: 10px; font-weight: 800; color: #fb7185; display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
                ⚠️ ACTIVE EARLY WARNING DIRECTIVE
              </div>
              ${uniqueAlerts.map(a => `<div style="font-size: 10px; color: #fecdd3; line-height: 1.3;">• ${a}</div>`).join('')}
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px;">
            <div style="background: #1e293b; padding: 4px 8px; border-radius: 6px;">
              <span style="color: #64748b;">One Health:</span> <strong style="color: #38bdf8;">${score}/100</strong>
            </div>
            <div style="background: #1e293b; padding: 4px 8px; border-radius: 6px;">
              <span style="color: #64748b;">DO:</span> <strong>${stream.readings.dissolved_oxygen_mg_l} mg/L</strong>
            </div>
            <div style="background: #1e293b; padding: 4px 8px; border-radius: 6px;">
              <span style="color: #64748b;">Turbidity:</span> <strong>${stream.readings.turbidity_ntu} NTU</strong>
            </div>
            <div style="background: #1e293b; padding: 4px 8px; border-radius: 6px;">
              <span style="color: #64748b;">EPT Taxa:</span> <strong style="color: #34d399;">${stream.assessment.biological_indices.ept_count}</strong>
            </div>
          </div>
          <button id="view-details-${stream.id}" style="
            width: 100%;
            background: #0d9488;
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          ">
            View One Health Profile &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-details-${stream.id}`);
        if (btn) {
          btn.onclick = () => onSelectStream(stream);
        }
      });

      markersRef.current?.addLayer(marker);
    });
  }, [filteredStreams, onSelectStream, alerts]);

  const handleFocusStream = (stream: StreamObservationRecord) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([stream.latitude, stream.longitude], 14, {
        duration: 1.2,
      });
    }
    onSelectStream(stream);
  };

  return (
    <div className="space-y-4">
      {/* Map Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
        {/* Pilot Basin Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
          <span className="text-base">{currentBasin.flag}</span>
          <div>
            <span className="font-bold text-white">{currentBasin.city}</span>
            <span className="text-slate-400 text-[11px] ml-1.5 hidden md:inline">({currentBasin.basinName})</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search streams, stations, or catchments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Catchment Select */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCatchment}
            onChange={(e) => setSelectedCatchment(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Catchments ({currentBasin.city})</option>
            {catchments.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Recreational Advisory Select */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Advisory:</span>
          <select
            value={selectedAdvisory}
            onChange={(e) => setSelectedAdvisory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Advisories</option>
            <option value="safe">Safe Only</option>
            <option value="caution">Caution / Warn</option>
            <option value="unsafe">Unsafe / Prohibited</option>
          </select>
        </div>

        {/* Count summary */}
        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-teal-400 font-bold">{filteredStreams.length}</span> of {streams.length} stations
        </div>
      </div>

      {/* Main Map + Station Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[620px]">
        
        {/* Interactive Leaflet Map Container */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden border border-slate-800 relative shadow-inner isolate z-0">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          
          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs space-y-1 shadow-lg">
            <span className="font-semibold text-slate-300 block mb-1">One Health Risk Score:</span>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-slate-300">85 - 100: Pristine / Thriving</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">70 - 84: Balanced / Healthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-300">45 - 69: Stressed / Moderate Hazard</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-300">&lt; 45: Degraded / Hazardous (Unsafe)</span>
            </div>
            <div className="flex items-center space-x-2 pt-1 border-t border-slate-800">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-rose-400">!</span>
              <span className="text-rose-300 font-semibold">Active Early Warning Alert Pin</span>
            </div>
          </div>
        </div>

        {/* Station List Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Monitored Streams</span>
            </h2>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {filteredStreams.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredStreams.map((s) => {
              const score = s.assessment.composite_one_health_score;
              const advisory = s.assessment.public_health_hazards.recreational_advisory;
              
              const badgeStyle =
                advisory === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                advisory === 'CAUTION' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                'bg-rose-500/10 text-rose-400 border-rose-500/30';

              return (
                <div
                  key={s.id}
                  onClick={() => handleFocusStream(s)}
                  className="bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800/80 hover:border-teal-500/50 rounded-lg p-2.5 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-slate-400">{s.station_id}</span>
                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-teal-300 truncate">
                        {s.stream_name}
                      </h3>
                    </div>
                    <span className="text-xs font-extrabold font-mono text-slate-100 bg-slate-800 px-1.5 py-0.5 rounded">
                      {score}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate mb-2">
                    {s.catchment_basin}
                  </p>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-semibold border ${badgeStyle}`}>
                      {advisory}
                    </span>
                    <span className="text-slate-400">
                      DO: <strong className="text-slate-200">{s.readings.dissolved_oxygen_mg_l}</strong> | Turb: <strong className="text-slate-200">{s.readings.turbidity_ntu}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
