import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplet, AlertTriangle, Trash2, ShieldAlert, Lightbulb, MapPin, Compass, Sparkles } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';

// Safe Leaflet DivIcon styled with Tailwind CSS to avoid standard missing-asset errors
const getMapDivIcon = (category) => {
  let color = 'bg-sky-500';
  if (category === 'Roads & Potholes') color = 'bg-red-500';
  else if (category === 'Garbage') color = 'bg-amber-500';
  else if (category === 'Drainage') color = 'bg-lime-500';
  else if (category === 'Street Lights') color = 'bg-yellow-500';
  
  return L.divIcon({
    className: 'leaflet-custom-div-icon',
    html: `<div class="w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center text-white shadow-lg font-bold text-xs">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Map controller component to handle camera pans programmatically
function MapPanController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function CivicMapPage() {
  const navigate = useNavigate();
  const { apiFetch } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [activeIssue, setActiveIssue] = useState(null);
  const [mapCenter, setMapCenter] = useState([21.1458, 79.0882]); // Center of Nagpur

  const categories = ['All', 'Water Supply', 'Roads & Potholes', 'Garbage', 'Drainage', 'Street Lights'];

  // Load complaints from backend database
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/complaints/all');
      // Set default latitude/longitude if missing in data records
      const mapped = data.map((item, idx) => {
        // Fallback coordinates for Nagpur localities if null
        let lat = item.latitude;
        let lon = item.longitude;
        if (!lat || !lon) {
          const defaults = [
            [21.1425, 79.0601], // Dharampeth
            [21.0924, 79.0664], // Wardha Road
            [21.1444, 79.1118], // Mahal
            [21.1612, 79.0815], // Sadar
            [21.0884, 79.0722], // Manish Nagar
          ];
          const coords = defaults[idx % defaults.length];
          lat = coords[0];
          lon = coords[1];
        }
        return { ...item, latitude: lat, longitude: lon };
      });
      setIssues(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredIssues = issues.filter(issue => {
    if (selectedFilter === 'All') return true;
    return issue.category === selectedFilter;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Water Supply': return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'Roads & Potholes': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Garbage': return <Trash2 className="w-4 h-4 text-amber-500" />;
      case 'Drainage': return <ShieldAlert className="w-4 h-4 text-lime-500" />;
      case 'Street Lights': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      default: return <Compass className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleIssueSelect = (issue) => {
    setActiveIssue(issue);
    if (issue.latitude && issue.longitude) {
      setMapCenter([issue.latitude, issue.longitude]);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Nagpur Civic Smart Map</h1>
            <p className="text-xs text-slate-500 mt-1">
              Visual intelligence mapping active database complaints across Nagpur zones.
            </p>
          </div>
          <button 
            onClick={loadComplaints}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg border border-slate-200 transition-colors"
          >
            Refresh Database Pins
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-semibold text-sm">
            <span className="inline-block w-6 h-6 border-2 border-nagpur-navy border-t-transparent rounded-full animate-spin mr-2"></span>
            Loading OpenStreetMap layers...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col lg:flex-row h-[600px] w-full">
            
            {/* Real Map Container */}
            <div className="flex-1 h-full relative z-10">
              <MapContainer 
                center={mapCenter} 
                zoom={13} 
                className="w-full h-full"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Custom camera controller */}
                <MapPanController center={mapCenter} />

                {/* Markers */}
                {filteredIssues.map((issue) => (
                  <Marker
                    key={issue.id}
                    position={[issue.latitude, issue.longitude]}
                    icon={getMapDivIcon(issue.category)}
                    eventHandlers={{
                      click: () => setActiveIssue(issue),
                    }}
                  >
                    <Popup>
                      <div className="font-sans text-xs space-y-1">
                        <div className="font-bold text-slate-900">{issue.category}</div>
                        <div className="text-[10px] text-slate-500">{issue.locationName}</div>
                        <p className="text-slate-600 line-clamp-2">{issue.description}</p>
                        <div className="pt-1 flex justify-between items-center text-[10px]">
                          <span className="bg-sky-50 text-sky-700 font-bold px-1 rounded">Score: {issue.aiScore}</span>
                          <span className="font-semibold text-indigo-600">{issue.status}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Hotspot Circles */}
                {/* Seeded Flooding Hotspot around Wardha Road */}
                <Circle 
                  center={[21.0924, 79.0664]}
                  radius={400}
                  pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
                />

                {/* Seeded Garbage Hotspot around Mahal */}
                <Circle 
                  center={[21.1444, 79.1118]}
                  radius={350}
                  pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.2 }}
                />
              </MapContainer>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-lg p-2.5 text-[10px] space-y-1.5 shadow-md z-[1000] pointer-events-auto">
                <div className="font-bold border-b border-slate-200 pb-1 mb-1 text-slate-700">Legend & Hotspots</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Water Supply</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Roads & Potholes</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Garbage</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-lime-500"></span> Drainage</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Street Lights</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-red-500 bg-red-500/20"></span> Active Hotspot Circle</div>
              </div>
            </div>

            {/* Sidebar List Area */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full bg-slate-50">
              <div className="p-4 border-b border-slate-200 bg-white">
                <h3 className="font-bold text-slate-800 text-base mb-3">Nagpur Smart City Map</h3>
                
                {/* Category Filters */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
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
                    No active complaints found in this category.
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    const isSelected = activeIssue?.id === issue.id;
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueSelect(issue)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-nagpur-navy ring-1 ring-nagpur-navy shadow-md'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-500">{issue.id}</span>
                          <span className="bg-sky-50 text-sky-700 font-bold px-1 py-0.5 rounded text-[9px]">
                            AI: {issue.aiScore}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <span className="text-slate-500">{getCategoryIcon(issue.category)}</span>
                          {issue.subcategory || issue.category}
                        </h4>
                        <p className="text-[11px] text-slate-600 truncate mt-1">{issue.description}</p>
                        <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                          <span>{issue.locationName.split(',')[0]}</span>
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">{issue.status}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
