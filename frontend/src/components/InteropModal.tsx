import React, { useState, useEffect } from 'react';
import { fetchFhirBundle, fetchOgcGeoJson } from '../services/api';
import { PilotCityId, PILOT_BASINS } from '../types';
import { FileCode2, Copy, Check, Download, Layers, ShieldCheck, ExternalLink, RefreshCw, Cpu, Globe2 } from 'lucide-react';

interface InteropModalProps {
  selectedPilot?: PilotCityId;
}

export const InteropModal: React.FC<InteropModalProps> = ({ selectedPilot = 'all' }) => {
  const [activeTab, setActiveTab] = useState<'fhir' | 'ogc' | 'loinc'>('fhir');
  const [fhirData, setFhirData] = useState<any>(null);
  const [ogcData, setOgcData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentBasin = PILOT_BASINS[selectedPilot || 'all'] || PILOT_BASINS.all;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fhir, ogc] = await Promise.all([
        fetchFhirBundle(selectedPilot),
        fetchOgcGeoJson(selectedPilot)
      ]);
      setFhirData(fhir);
      setOgcData(ogc);
    } catch (err) {
      console.error('Error loading standards data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPilot]);

  const handleCopy = (content: any) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: any, filename: string) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <FileCode2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-white">Digital Health Standards & Interoperability Hub</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Track 7 Digital Health Standards: Connecting Citizen Science to HL7 Europe, EFMI Clinical Systems, and OGC Sensor Networks.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
              <span>{currentBasin.flag}</span>
              <span className="font-bold text-white">{currentBasin.city}</span>
              <span className="text-[10px] text-teal-400 font-mono hidden sm:inline">[{currentBasin.badge}]</span>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track 7 Sponsor Alignment Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Why Interoperability Matters for One Health (EFMI & HL7 Europe)</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Environmental health data is typically locked in isolated municipal spreadsheets, while health registries operate separately.
          When a citizen scientist logs elevated stream turbidity and organic sewage odor, AquaLink OneHealth converts those observations into standardized
          <strong> HL7 FHIR R4 Observation</strong> and <strong>RiskAssessment</strong> resources coded with official <strong>LOINC</strong> identifiers.
          This standard digital health payload is structured for interoperable ingestion by clinical health systems, regional epidemiologists, and veterinary surveillance networks to support early environmental health decision support.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('fhir')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'fhir' ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>HL7 FHIR R4 Bundle</span>
        </button>

        <button
          onClick={() => setActiveTab('ogc')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'ogc' ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>OGC GeoJSON Observables</span>
        </button>

        <button
          onClick={() => setActiveTab('loinc')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'loinc' ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>LOINC Terminology Dictionary</span>
        </button>
      </div>

      {/* Content Panes */}
      {activeTab === 'fhir' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">HL7 FHIR R4 Collection Bundle</h3>
              <p className="text-xs text-slate-400">
                Live exported payload with {fhirData?.total || 0} Observation and RiskAssessment resources.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(fhirData)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy FHIR JSON'}</span>
              </button>
              <button
                onClick={() => handleDownload(fhirData, 'aqualink-onehealth-fhir-bundle.json')}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .JSON</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[500px] overflow-y-auto">
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
              {fhirData ? JSON.stringify(fhirData, null, 2) : 'Loading FHIR bundle...'}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'ogc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">OGC GeoJSON FeatureCollection</h3>
              <p className="text-xs text-slate-400">
                Spatial environmental observatory format compatible with QGIS, ArcGIS, and SensorThings API.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(ogcData)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy GeoJSON'}</span>
              </button>
              <button
                onClick={() => handleDownload(ogcData, 'aqualink-streams.geojson')}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .GeoJSON</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[500px] overflow-y-auto">
            <pre className="text-xs font-mono text-cyan-400 leading-relaxed whitespace-pre-wrap">
              {ogcData ? JSON.stringify(ogcData, null, 2) : 'Loading GeoJSON...'}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'loinc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">
            HL7 / LOINC Standard Parameter Mapping Specification
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Parameter Name</th>
                  <th className="py-2.5 px-3">LOINC Code</th>
                  <th className="py-2.5 px-3">UCUM Unit</th>
                  <th className="py-2.5 px-3">Clinical / Public Health Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">Water Temperature</td>
                  <td className="py-2 px-3 text-teal-400">8040-0</td>
                  <td className="py-2 px-3">Cel</td>
                  <td className="py-2 px-3 font-sans text-slate-400">Governs bacterial replication rate and mosquito larval development time.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">pH of Water</td>
                  <td className="py-2 px-3 text-teal-400">11558-4</td>
                  <td className="py-2 px-3">[pH]</td>
                  <td className="py-2 px-3 font-sans text-slate-400">Biological homeostasis indicator; extreme shifts disrupt aquatic mucosa.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">Dissolved Oxygen</td>
                  <td className="py-2 px-3 text-teal-400">2710-2</td>
                  <td className="py-2 px-3">mg/L</td>
                  <td className="py-2 px-3 font-sans text-slate-400">Hypoxia (&lt;3.5 mg/L) causes predator fish mortality, enabling mosquito vector proliferation.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">Water Turbidity</td>
                  <td className="py-2 px-3 text-teal-400">97561-5</td>
                  <td className="py-2 px-3">[NTU]</td>
                  <td className="py-2 px-3 font-sans text-slate-400">Sediment surrogate strongly correlated with Cryptosporidium and E. coli pathogen wash-off.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">Specific Conductance</td>
                  <td className="py-2 px-3 text-teal-400">2965-2</td>
                  <td className="py-2 px-3">uS/cm</td>
                  <td className="py-2 px-3 font-sans text-slate-400">Salinity, road de-icing salts, and ionic industrial effluents.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">Nitrate [Mass/volume]</td>
                  <td className="py-2 px-3 text-teal-400">14860-1</td>
                  <td className="py-2 px-3">mg/L</td>
                  <td className="py-2 px-3 font-sans text-slate-400">Agricultural fertilizer and untreated sewage; methemoglobinemia risk in infants.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold text-white">Phosphate [Mass/volume]</td>
                  <td className="py-2 px-3 text-teal-400">14879-1</td>
                  <td className="py-2 px-3">mg/L</td>
                  <td className="py-2 px-3 font-sans text-slate-400">Limiting nutrient triggering toxic Cyanobacterial Harmful Algal Blooms (HABs).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
