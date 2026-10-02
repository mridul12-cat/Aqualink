import React from 'react';
import { Activity, MapPin, PlusCircle, AlertTriangle, BarChart3, FileCode2, Waves } from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'form' | 'alerts' | 'analytics' | 'standards';
  setActiveTab: (tab: 'map' | 'form' | 'alerts' | 'analytics' | 'standards') => void;
  alertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, alertCount }) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Mission */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 ring-1 ring-teal-400/30">
              <Waves className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">AquaLink</span>
                <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  OneHealth
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  IEEE Hackathon
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                From Streams to Systems: Citizen Science to One Health Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Stream Map</span>
            </button>

            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'form'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Field Submit</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === 'alerts'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
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
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('standards')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'standards'
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span className="hidden lg:inline">HL7 FHIR / OGC</span>
              <span className="lg:hidden">FHIR</span>
            </button>
          </nav>

          {/* Live Status indicator */}
          <div className="hidden xl:flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px] text-emerald-400">One Health AI Live</span>
          </div>

        </div>
      </div>
    </header>
  );
};
