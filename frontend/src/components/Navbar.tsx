import React from 'react';
import { Activity, MapPin, PlusCircle, AlertTriangle, BarChart3, FileCode2, Waves, Globe2 } from 'lucide-react';
import { PilotCityId, PILOT_BASINS } from '../types';

interface NavbarProps {
  activeTab: 'map' | 'form' | 'alerts' | 'analytics' | 'standards';
  setActiveTab: (tab: 'map' | 'form' | 'alerts' | 'analytics' | 'standards') => void;
  alertCount: number;
  selectedPilot: PilotCityId;
  onSelectPilot: (pilot: PilotCityId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  alertCount,
  selectedPilot,
  onSelectPilot
}) => {
  const currentBasin = PILOT_BASINS[selectedPilot] || PILOT_BASINS.coimbra;

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3 min-w-0">
          
          {/* Brand Logo & Mission */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('map')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 ring-1 ring-teal-400/30 shrink-0">
              <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">AquaLink</span>
                <span className="font-semibold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 whitespace-nowrap">
                  OneHealth
                </span>
                <span className="hidden lg:inline-flex text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 whitespace-nowrap">
                  IEEE Hackathon
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden 2xl:block truncate">
                From Streams to Systems: Citizen Science to One Health Intelligence
              </p>
            </div>
          </div>

          {/* Watershed / Pilot City Selector Dropdown */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-950/80 border border-teal-500/30 hover:border-teal-400/60 rounded-xl px-2 sm:px-2.5 py-1 transition-all shadow-inner min-w-0 shrink max-w-[170px] sm:max-w-[230px] md:max-w-[280px] lg:max-w-[340px]">
            <Globe2 className="w-4 h-4 text-teal-400 shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold text-teal-400/90 leading-tight truncate">
                Pilot Watershed:
              </span>
              <select
                id="watershed-pilot-selector"
                value={selectedPilot}
                onChange={(e) => onSelectPilot(e.target.value as PilotCityId)}
                aria-label="Select River Basin / Pilot City"
                className="bg-transparent text-[11px] sm:text-xs font-bold text-white focus:outline-none cursor-pointer truncate w-full pr-1 py-0.5"
              >
                <option value="coimbra" className="bg-slate-900 text-slate-100">
                  🇵🇹 Coimbra, Portugal (Mondego River Basin / Ribeira de Coselhas) [Primary EU Pilot]
                </option>
                <option value="benevento" className="bg-slate-900 text-slate-100">
                  🇮🇹 Benevento, Italy (Calore River / Sabato River Basin) [EU Pilot]
                </option>
                <option value="oslo" className="bg-slate-900 text-slate-100">
                  🇳🇴 Oslo, Norway (Akerselva / Alna River Basin) [EU Pilot]
                </option>
                <option value="portland" className="bg-slate-900 text-slate-100">
                  🇺🇸 Portland, USA (Columbia Slough / Lower Willamette Basin) [US Case Study]
                </option>
                <option value="all" className="bg-slate-900 text-slate-100">
                  🌍 All Basins (Global OneAquaHealth Network)
                </option>
              </select>
            </div>
            <span className="hidden xl:inline-flex text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 whitespace-nowrap shrink-0">
              {currentBasin.badge}
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span><span className="hidden md:inline">Stream </span>Map</span>
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'form'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span><span className="hidden md:inline">Field </span>Submit</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === 'alerts'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Resilience</span>
              {alertCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'alerts' ? 'bg-slate-950 text-amber-300' : 'bg-rose-500 text-white animate-pulse'
                }`}>
                  {alertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('standards')}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'standards'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xl:inline">HL7 FHIR / OGC</span>
              <span className="xl:hidden">FHIR</span>
            </button>
          </nav>

          {/* Live Status indicator */}
          <div className="hidden 2xl:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[10px] text-emerald-400">AI Live</span>
          </div>

        </div>
      </div>
    </header>
  );
};
