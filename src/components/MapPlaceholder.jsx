import React, { useState } from 'react';
import { MapPin, Info, Droplet, AlertTriangle, Trash2, ShieldAlert, Lightbulb, Navigation } from 'lucide-react';
import { mockIssues } from '../data/mockIssues';

// Map issues to local coordinates on a 100x100 grid for the SVG map visualization
const issueMapPoints = {
  "NGP-2026-00124": { x: 35, y: 40, color: 'text-sky-500 bg-sky-100 border-sky-400' }, // Dharampeth (West)
  "NGP-2026-00125": { x: 50, y: 70, color: 'text-red-500 bg-red-100 border-red-400' }, // Wardha Road (South)
  "NGP-2026-00118": { x: 75, y: 45, color: 'text-amber-500 bg-amber-100 border-amber-400' }, // Mahal (East)
  "NGP-2026-00130": { x: 55, y: 30, color: 'text-lime-500 bg-lime-100 border-lime-400' }, // Sadar (North-Central)
  "NGP-2026-00131": { x: 58, y: 80, color: 'text-yellow-500 bg-yellow-100 border-yellow-400' }, // Manish Nagar (South-East)
  "NGP-2026-00109": { x: 55, y: 48, color: 'text-red-500 bg-red-100 border-red-400' }, // Sitabuldi (Central)
  "NGP-2026-00132": { x: 20, y: 65, color: 'text-slate-500 bg-slate-100 border-slate-400' }, // Hingna (South-West)
  "NGP-2026-00114": { x: 30, y: 55, color: 'text-amber-500 bg-amber-100 border-amber-400' }, // Trimurti Nagar (West-South)
  "NGP-2026-00133": { x: 68, y: 90, color: 'text-lime-500 bg-lime-100 border-lime-400' }, // Besa (Far South-East)
  "NGP-2026-00129": { x: 70, y: 25, color: 'text-sky-500 bg-sky-100 border-sky-400' }, // Jaripatka (North-East)
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Water Supply': return <Droplet className="w-4 h-4" />;
    case 'Roads & Potholes': return <AlertTriangle className="w-4 h-4" />;
    case 'Garbage': return <Trash2 className="w-4 h-4" />;
    case 'Drainage': return <ShieldAlert className="w-4 h-4" />;
    case 'Street Lights': return <Lightbulb className="w-4 h-4" />;
    default: return <Navigation className="w-4 h-4" />;
  }
};

export default function MapPlaceholder() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [activeIssue, setActiveIssue] = useState(null);

  const categories = ['All', 'Water Supply', 'Roads & Potholes', 'Garbage', 'Drainage', 'Street Lights'];

  const filteredIssues = mockIssues.filter(issue => {
    if (selectedFilter === 'All') return true;
    return issue.category === selectedFilter;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col lg:flex-row h-[600px] w-full">
      {/* Map Area */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35"></div>
        
        {/* Map SVG Graphic */}
        <svg viewBox="0 0 100 100" className="w-full h-full max-h-[500px] max-w-[500px] text-slate-800 opacity-80" stroke="currentColor" fill="none" strokeWidth="0.5">
          {/* Outer Boundary Area (representing Nagpur Smart City zone) */}
          <path d="M 15 30 Q 30 10 50 15 Q 75 10 85 25 Q 95 50 85 75 Q 70 95 45 90 Q 20 95 10 70 Z" fill="#0c1e35" stroke="#1e3e62" strokeWidth="1" className="transition-all duration-350" />
          
          {/* Lakes / Water Bodies in Nagpur */}
          {/* Ambazari Lake (West) */}
          <path d="M 22 52 Q 28 50 25 58 Q 20 60 22 52 Z" fill="#0284c7" fillOpacity="0.4" stroke="#0ea5e9" strokeWidth="0.5" />
          <text x="18" y="48" className="fill-sky-400 text-[2.5px] font-semibold tracking-wider" stroke="none">AMBAZARI LAKE</text>
          
          {/* Futala Lake (North-West) */}
          <path d="M 25 35 Q 31 33 29 40 Q 24 41 25 35 Z" fill="#0284c7" fillOpacity="0.4" stroke="#0ea5e9" strokeWidth="0.5" />
          <text x="24" y="32" className="fill-sky-400 text-[2.5px] font-semibold tracking-wider" stroke="none">FUTALA LAKE</text>
          
          {/* Major Nagpur Roads */}
          {/* Wardha Road */}
          <path d="M 50 15 L 50 90" stroke="#334155" strokeWidth="1.5" strokeDasharray="1 1" />
          <text x="43" y="85" className="fill-slate-400 text-[2px] font-bold origin-center -rotate-90" stroke="none">WARDHA ROAD</text>
          
          {/* Amravati Road / Hingna Link */}
          <path d="M 10 45 L 90 45" stroke="#334155" strokeWidth="1.5" strokeDasharray="1 1" />
          <text x="75" y="43" className="fill-slate-400 text-[2px] font-bold" stroke="none">CA ROAD</text>

          {/* Nagpur Metro Route (Orange Line) */}
          <path d="M 50 10 L 50 90" stroke="#f97316" strokeWidth="0.6" strokeOpacity="0.8" />
          {/* Nagpur Metro Route (Aqua Line) */}
          <path d="M 15 45 L 85 45" stroke="#06b6d4" strokeWidth="0.6" strokeOpacity="0.8" />
          
          {/* Landmark Text Markers */}
          <text x="52" y="52" className="fill-slate-500 text-[2.5px] font-bold" stroke="none">SITABULDI INTERCHANGE</text>
          <text x="35" y="43" className="fill-slate-500 text-[2px]" stroke="none">DHARAMPETH</text>
          <text x="56" y="33" className="fill-slate-500 text-[2px]" stroke="none">SADAR</text>
          <text x="77" y="47" className="fill-slate-500 text-[2px]" stroke="none">MAHAL</text>
          <text x="18" y="68" className="fill-slate-500 text-[2px]" stroke="none">HINGNA IND.</text>
        </svg>

        {/* Render Interactive Pin Markers over SVG */}
        {filteredIssues.map((issue) => {
          const coords = issueMapPoints[issue.id] || { x: 50, y: 50, color: 'text-red-500 bg-red-100 border-red-400' };
          const isSelected = activeIssue?.id === issue.id;
          
          return (
            <button
              key={issue.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'}`}
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              onClick={() => setActiveIssue(issue)}
            >
              <div className={`p-1.5 rounded-full border-2 shadow-lg flex items-center justify-center transition-all ${coords.color} ${isSelected ? 'ring-4 ring-white ring-opacity-50 animate-pulse' : ''}`}>
                {getCategoryIcon(issue.category)}
              </div>
              
              {/* Tooltip on Hover */}
              <div className="absolute left-1/2 bottom-full mb-2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-40 border border-slate-700">
                <span className="font-semibold">{issue.category}</span> - {issue.location.split(',')[0]}
              </div>
            </button>
          );
        })}

        {/* Selected Popup Modal on Map */}
        {activeIssue && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-xl p-4 shadow-2xl animate-slide-up z-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                  activeIssue.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  activeIssue.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {activeIssue.priority} Priority
                </span>
                <h4 className="font-bold text-sm mt-1">{activeIssue.category}</h4>
              </div>
              <button onClick={() => setActiveIssue(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            
            <p className="text-xs text-slate-300 mb-2 line-clamp-2">{activeIssue.description}</p>
            
            <div className="text-[11px] text-slate-400 space-y-1">
              <div><strong className="text-slate-300">Location:</strong> {activeIssue.location}</div>
              <div><strong className="text-slate-300">Status:</strong> <span className="text-amber-400">{activeIssue.status}</span></div>
              <div className="flex items-center gap-1.5 mt-1">
                <strong className="text-slate-300">AI Priority Score:</strong>
                <span className="bg-blue-950 text-blue-400 font-bold px-1 py-0.5 rounded border border-blue-800">{activeIssue.aiScore}/100</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Map Legend */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 text-white rounded-lg p-2.5 text-[10px] space-y-1.5 shadow-md hidden sm:block">
          <div className="font-bold border-b border-slate-700 pb-1 mb-1">Issue Pins</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Water Supply</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Roads / Potholes</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Garbage</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span> Drainage</div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Streetlights</div>
        </div>

        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 text-sky-400 rounded-lg py-1 px-2.5 text-[10px] flex items-center gap-1.5 font-semibold shadow-md">
          <Info className="w-3.5 h-3.5" />
          Interactive Nagpur SVG Map Mockup
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-slate-800 text-base mb-3">Nagpur Active Issues</h3>
          
          {/* Category Filter Selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2 scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedFilter(cat);
                  setActiveIssue(null);
                }}
                className={`py-1 px-2.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                  selectedFilter === cat
                    ? 'bg-nagpur-navy text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All' : cat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Issue List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No reported issues found in this category.
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const isSelected = activeIssue?.id === issue.id;
              return (
                <div
                  key={issue.id}
                  onClick={() => setActiveIssue(issue)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-nagpur-navy ring-1 ring-nagpur-navy shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{issue.id}</span>
                    <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                      issue.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                      issue.priority === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>
                      {issue.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="text-slate-500">{getCategoryIcon(issue.category)}</span>
                    {issue.subcategory || issue.category}
                  </h4>
                  <p className="text-[11px] text-slate-600 truncate mt-1">{issue.description}</p>
                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                    <span>{issue.location.split(',')[0]}</span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">{issue.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
