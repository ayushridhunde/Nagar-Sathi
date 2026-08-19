import React from 'react';
import { AlertCircle, TrendingUp, Users, MapPin, Activity, HelpCircle } from 'lucide-react';

export default function AiPriorityGauge({ score = 85, factors = {} }) {
  const defaultFactors = {
    citizenReports: 20,
    severity: 25,
    populationImpact: 20,
    historicalFrequency: 12,
    locationRisk: 8
  };

  const activeFactors = { ...defaultFactors, ...factors };

  const getPriorityLabel = (val) => {
    if (val >= 90) return { label: 'CRITICAL', color: 'text-red-600 bg-red-50 border-red-200' };
    if (val >= 75) return { label: 'HIGH', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    if (val >= 50) return { label: 'MEDIUM', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'LOW', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  const severityInfo = getPriorityLabel(score);

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-nagpur-yellow animate-pulse" />
          AI Priority Assessment
        </h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${severityInfo.color} bg-opacity-10`}>
          {severityInfo.label}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 mb-5">
        {/* Radial Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="56"
              cy="56"
              r="48"
              className="stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Active Ring */}
            <circle
              cx="56"
              cy="56"
              r="48"
              className={`transition-all duration-1000 ease-out ${
                score >= 90 ? 'stroke-red-500' :
                score >= 75 ? 'stroke-orange-500' :
                score >= 50 ? 'stroke-amber-500' : 'stroke-green-500'
              }`}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - score / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold font-mono leading-none">{score}</span>
            <span className="text-[9px] text-slate-400 font-semibold tracking-wider mt-1">SCORE / 100</span>
          </div>
        </div>

        {/* Priority Explanation */}
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h5 className="font-bold text-sm text-slate-200">Intelligent Priority Score</h5>
          <p className="text-xs text-slate-400 leading-relaxed">
            Calculated in real-time based on local incident density, population footprint, category danger level, and citizen reinforcement counts.
          </p>
        </div>
      </div>

      {/* Factors Breakdown */}
      <div className="border-t border-slate-800 pt-4">
        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">AI Decision Matrix Factors</h5>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Factor 1: Citizen Reports */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-300">Citizen Reports</span>
            </div>
            <span className="font-mono font-bold text-sky-400">+{activeFactors.citizenReports}</span>
          </div>

          {/* Factor 2: Severity */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-slate-300">Incident Severity</span>
            </div>
            <span className="font-mono font-bold text-red-400">+{activeFactors.severity}</span>
          </div>

          {/* Factor 3: Population Impact */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">Population Impact</span>
            </div>
            <span className="font-mono font-bold text-emerald-400">+{activeFactors.populationImpact}</span>
          </div>

          {/* Factor 4: Historical Frequency */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">Historical Frequency</span>
            </div>
            <span className="font-mono font-bold text-amber-400">+{activeFactors.historicalFrequency}</span>
          </div>

          {/* Factor 5: Location Risk */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 sm:col-span-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300">Localized Infrastructure Risk Profile</span>
            </div>
            <span className="font-mono font-bold text-indigo-400">+{activeFactors.locationRisk}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
