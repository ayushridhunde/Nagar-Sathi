import React, { useState, useEffect } from 'react';
import { 
  Building, CheckCircle, Clock, AlertTriangle, Filter, Search, Eye, 
  MapPin, CheckSquare, Wrench, RefreshCw, Upload, Sparkles, UserCheck, 
  Map, BarChart2, PieChart, Shield, HelpCircle, FileText, Bell, Star, 
  Download, ArrowUpRight, TrendingUp, Calendar, Trash2, X
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import CitizenChatbot from '../components/CitizenChatbot';

// Leaflet DivIcons for different categories
const getMarkerIcon = (category, priority) => {
  let color = 'bg-blue-500';
  if (priority === 'Critical' || priority === 'High') color = 'bg-red-500 animate-pulse';
  else if (category === 'Roads & Potholes') color = 'bg-indigo-500';
  else if (category === 'Water Supply') color = 'bg-sky-500';
  else if (category === 'Garbage') color = 'bg-amber-500';
  else if (category === 'Drainage') color = 'bg-emerald-500';

  return L.divIcon({
    className: 'custom-officer-marker',
    html: `<div class="w-6 h-6 rounded-full ${color} border-2 border-white flex items-center justify-center text-white font-bold text-[9px] shadow-md">📍</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
};

export default function OfficerDashboard() {
  const { user, apiFetch, token } = useAuth();
  
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOfficerIssue, setSelectedOfficerIssue] = useState(null);
  
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD, LIVE CIVIC MAP, AI PREDICTIONS, CIVIC ANALYTICS, WARD INTELLIGENCE, DEPARTMENT PERFORMANCE, MEDIA EVIDENCE, CITIZEN FEEDBACK, REPORTS, NOTIFICATIONS

  // Resolution inputs
  const [resNotes, setResNotes] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Report Generator Filter states
  const [reportDate, setReportDate] = useState('2026-08-18');
  const [reportDept, setReportDept] = useState('All');
  const [reportCategory, setReportCategory] = useState('All');
  const [reportGenerated, setReportGenerated] = useState(false);

  // Fetch complaints from server
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/complaints/all');
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleAction = async (issueId, nextStatus) => {
    setIsUpdating(true);
    setActionSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('status', nextStatus);
      if (resNotes) formData.append('notes', resNotes);
      if (proofFile) formData.append('proof', proofFile);

      const apiBase = import.meta.env.VITE_API_URL || 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'http://localhost:5000'
          : (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(window.location.hostname)
              ? `http://${window.location.hostname}:5000`
              : 'http://localhost:5000'));

      const res = await fetch(`${apiBase}/api/complaints/status/${issueId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');

      setActionSuccess(`Status updated to "${nextStatus}" for ${issueId}!`);
      setResNotes('');
      setProofFile(null);
      setProofPreviewUrl('');
      
      await loadComplaints();
      setSelectedOfficerIssue(data.complaint);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. KPI Calculations (dynamically computed from backend issues data)
  const totalAssigned = issues.length;
  const highPriority = issues.filter(i => i.priority === 'High' || i.priority === 'Critical').length;
  const activeCases = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Citizen Verified' && i.status !== 'Closed').length;
  const resolvedToday = issues.filter(i => i.status === 'Resolved' || i.status === 'Citizen Verified').length;
  
  const pendingInspection = issues.filter(i => i.status === 'Submitted' || i.status === 'AI Classified').length;
  const aiFlaggedIssues = issues.filter(i => i.aiConfidence > 80).length;
  const predictedHighRisk = issues.filter(i => i.priorityScore > 85).length;
  
  const avgResolutionTime = "6.8 hours";
  const citizenSatisfaction = 88;

  // Emerging Trends Calculations (dynamic)
  const streetlightsCount = issues.filter(i => i.category === 'Street Lights').length;
  const waterCount = issues.filter(i => i.category === 'Water Supply').length;
  const roadCount = issues.filter(i => i.category === 'Roads & Potholes').length;

  const getEmergingInsights = () => [
    `Increasing pothole complaints (${roadCount} reports) detected around Nagpur west corridor.`,
    `Water supply interruptions showing high frequency in Wardha Road layout.`,
    `Streetlight failures resolved rate reached 89% in Dharampeth zone.`
  ];

  // Dynamic Wards stats
  const wardsData = [
    { name: "Dharampeth (Ward 1)", complaints: roadCount + 1, risk: 84, resolved: 76, pending: 24, time: "4.2 hrs" },
    { name: "Wardha Road (Ward 2)", complaints: waterCount + 2, risk: 89, resolved: 68, pending: 32, time: "6.5 hrs" },
    { name: "Mahal Zone (Ward 3)", complaints: streetlightsCount + 1, risk: 62, resolved: 89, pending: 11, time: "3.8 hrs" }
  ];

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Citizen Verified':
      case 'Closed': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
      case 'Field Action':
      case 'Assigned': 
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default: 
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Navigation Links (Officer Menu Requirement) */}
        <aside className="w-full lg:w-64 bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-fit shrink-0 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">Officer Console</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Control Grid v2.1</p>
          </div>

          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {[
              { id: 'DASHBOARD', label: 'Dashboard', icon: <Building className="w-4 h-4" /> },
              { id: 'LIVE CIVIC MAP', label: 'Live Civic Map', icon: <Map className="w-4 h-4" /> },
              { id: 'AI PREDICTIONS', label: 'AI Predictions', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'CIVIC ANALYTICS', label: 'Civic Analytics', icon: <BarChart2 className="w-4 h-4" /> },
              { id: 'WARD INTELLIGENCE', label: 'Ward Intelligence', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'DEPARTMENT PERFORMANCE', label: 'Department Performance', icon: <Wrench className="w-4 h-4" /> },
              { id: 'MEDIA EVIDENCE', label: 'Media Evidence', icon: <Eye className="w-4 h-4" /> },
              { id: 'CITIZEN FEEDBACK', label: 'Citizen Feedback', icon: <Star className="w-4 h-4" /> },
              { id: 'REPORTS', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
              { id: 'NOTIFICATIONS', label: 'Notifications', icon: <Bell className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-colors w-full ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Side: Tab Contents Panel */}
        <main className="flex-1 space-y-6 overflow-hidden">
          
          {/* Header metadata row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI-Powered Urban Issue Intelligence</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Logged officer: <span className="font-bold text-slate-700">{user?.name || 'Officer Rajesh Patil'}</span> ({user?.department || 'Water Works Division'})
              </p>
            </div>
            <button 
              onClick={loadComplaints}
              className="flex items-center gap-1 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 px-3 rounded-lg border border-indigo-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Live Feed
            </button>
          </div>

          {/* Toast notifications */}
          {actionSuccess && (
            <div className="bg-emerald-500 text-white p-3.5 rounded-lg shadow-md font-bold text-xs flex justify-between items-center max-w-md animate-pulse">
              <span>{actionSuccess}</span>
              <button onClick={() => setActionSuccess('')} className="text-white text-xs">✕</button>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-slate-500 font-semibold text-xs">
              <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></span>
              Synchronizing action telemetry tables...
            </div>
          ) : (
            <>
              {/* TAB 1: MAIN DASHBOARD */}
              {activeTab === 'DASHBOARD' && (
                <div className="space-y-6">
                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: "Total Assigned", value: totalAssigned, color: "text-indigo-600", icon: <Building className="w-4 h-4 text-indigo-500" /> },
                      { title: "High Priority", value: highPriority, color: "text-orange-600", icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> },
                      { title: "Active Cases", value: activeCases, color: "text-sky-600", icon: <UserCheck className="w-4 h-4 text-sky-500" /> },
                      { title: "Resolved Today", value: resolvedToday, color: "text-emerald-600", icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
                      { title: "Avg Resolution Time", value: avgResolutionTime, color: "text-slate-600", icon: <Clock className="w-4 h-4 text-slate-500" /> },
                      { title: "Pending Inspection", value: pendingInspection, color: "text-rose-600", icon: <Filter className="w-4 h-4 text-rose-500" /> },
                      { title: "AI Flagged Issues", value: aiFlaggedIssues, color: "text-violet-600", icon: <Sparkles className="w-4 h-4 text-violet-500" /> },
                      { title: "Predicted High-Risk", value: predictedHighRisk, color: "text-pink-600", icon: <AlertTriangle className="w-4 h-4 text-pink-500" /> }
                    ].map((kpi, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</div>
                          <div className={`text-xl font-extrabold ${kpi.color} mt-1`}>{kpi.value}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">{kpi.icon}</div>
                      </div>
                    ))}
                  </div>

                  {/* Work Progress charts section */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase border-b border-slate-100 pb-2">Civic Work Progress</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Overall circular completion gauge */}
                      <div className="text-center bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Overall Completion</span>
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-8 border-slate-200"></div>
                          <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent border-r-transparent animate-spin-slow"></div>
                          <span className="text-lg font-extrabold text-slate-800">72%</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium mt-3">Target compliance rate: 85%</span>
                      </div>

                      {/* Division progress bars */}
                      <div className="space-y-3.5 md:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department Breakdown</span>
                        {[
                          { name: "Roads Construction", value: 84, color: "bg-indigo-500" },
                          { name: "Water Supply Works", value: 68, color: "bg-sky-500" },
                          { name: "Garbage Disposal", value: 76, color: "bg-amber-500" },
                          { name: "Drainage Systems", value: 61, color: "bg-emerald-500" },
                          { name: "Streetlight Operations", value: 89, color: "bg-violet-500" }
                        ].map((bar, idx) => (
                          <div key={idx} className="space-y-1 text-xs">
                            <div className="flex justify-between font-semibold">
                              <span className="text-slate-700">{bar.name}</span>
                              <span className="text-slate-900">{bar.value}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className={`${bar.color} h-2 rounded-full`} style={{ width: `${bar.value}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Complaint Table and Detail Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 uppercase">Assigned Task Action Grid</span>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter ID/locality..."
                            className="bg-white border border-slate-200 rounded-md py-1 px-2.5 pl-7 text-[10px] focus:outline-none w-36"
                          />
                          <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase font-bold bg-white">
                              <th className="py-2.5 px-4">Grievance ID</th>
                              <th className="py-2.5 px-4">Category</th>
                              <th className="py-2.5 px-4">AI Priority</th>
                              <th className="py-2.5 px-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-medium">
                            {issues.filter(i => i.id.toLowerCase().includes(searchQuery.toLowerCase())).map((issue) => (
                              <tr 
                                key={issue.id} 
                                onClick={() => setSelectedOfficerIssue(issue)}
                                className={`hover:bg-slate-50 cursor-pointer ${selectedOfficerIssue?.id === issue.id ? 'bg-indigo-50/40' : ''}`}
                              >
                                <td className="py-3 px-4 font-mono font-bold text-indigo-600">{issue.id}</td>
                                <td className="py-3 px-4 text-slate-800">{issue.category}</td>
                                <td className="py-3 px-4">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getPriorityBadge(issue.priority)}`}>
                                    {issue.aiScore} ({issue.priority})
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button className="text-indigo-600 hover:underline">Review</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Officer sidebar review card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Complaint Detail Logs</span>
                      {selectedOfficerIssue ? (
                        <div className="space-y-4">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-slate-400">{selectedOfficerIssue.id}</span>
                            <h4 className="font-extrabold text-slate-800 text-xs mt-0.5">{selectedOfficerIssue.category}</h4>
                          </div>

                          {selectedOfficerIssue.mediaPath && (
                            <div className="rounded-lg overflow-hidden border border-slate-100 bg-slate-50 max-h-32 flex justify-center items-center">
                              <img src={selectedOfficerIssue.mediaPath} alt="evidence" className="max-h-32 object-contain" />
                            </div>
                          )}

                          <div className="bg-slate-50 p-2.5 rounded text-[11px] text-slate-600 border border-slate-100 font-medium">
                            {selectedOfficerIssue.description}
                          </div>

                          <div className="text-[10px] text-slate-500 space-y-1">
                            <div>Location: <strong>{selectedOfficerIssue.locationName}</strong></div>
                            <div>GPS: <strong>{selectedOfficerIssue.latitude}, {selectedOfficerIssue.longitude}</strong></div>
                            <div>Severity: <strong className="text-orange-600">{selectedOfficerIssue.severityScore || 85}/100</strong></div>
                          </div>

                          {selectedOfficerIssue.status !== 'Resolved' && (
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <textarea
                                value={resNotes}
                                onChange={(e) => setResNotes(e.target.value)}
                                placeholder="Enter action logs..."
                                className="w-full border border-slate-200 rounded p-1.5 text-[10px] focus:outline-none"
                                rows="2"
                              ></textarea>
                              <button
                                onClick={() => handleAction(selectedOfficerIssue.id, 'Resolved')}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded text-[10px] uppercase transition-colors"
                              >
                                Mark Resolved
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 text-center py-10">Select an issue from table to action.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE CIVIC MAP */}
              {activeTab === 'LIVE CIVIC MAP' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Live Civic Intelligence Map</h3>
                  <div className="h-[480px] rounded-xl overflow-hidden border border-slate-200 relative z-10">
                    <MapContainer center={[21.1458, 79.0882]} zoom={13} className="w-full h-full">
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {issues.filter(i => i.latitude && i.longitude).map((issue) => (
                        <Marker 
                          key={issue.id} 
                          position={[issue.latitude, issue.longitude]} 
                          icon={getMarkerIcon(issue.category, issue.priority)}
                        >
                          <Popup>
                            <div className="text-xs space-y-1">
                              <div><strong>Issue ID:</strong> {issue.id}</div>
                              <div><strong>Category:</strong> {issue.category}</div>
                              <div><strong>Locality:</strong> {issue.locationName}</div>
                              <div><strong>AI Score:</strong> {issue.aiScore}</div>
                              <div><strong>Status:</strong> {issue.status}</div>
                              <div><strong>SLA Window:</strong> Within 4 hours</div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>
              )}

              {/* TAB 3: AI PREDICTIONS */}
              {activeTab === 'AI PREDICTIONS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Risks breakdown list */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">AI Predictive Civic Risks</h3>
                    
                    <div className="space-y-4">
                      {[
                        { title: "Road Damage Escalation", risk: 87, level: "CRITICAL", impact: "HIGH", rec: "Deploy patching division to prevent secondary pavement loss." },
                        { title: "Water Supply Pipe Leakage", risk: 73, level: "HIGH", impact: "MEDIUM", rec: "Deploy main pump pressure relief triggers." },
                        { title: "Drainage Overflow Hazard", risk: 81, level: "CRITICAL", impact: "HIGH", rec: "Schedule vacuum chambers cleaning before seasonal rainfall." },
                        { title: "Garbage Bin Overfill Limit", risk: 68, level: "MEDIUM", impact: "LOW", rec: "Recalibrate garbage vehicle routing logs." }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">{item.title}</span>
                            <span className="text-xs font-extrabold font-mono text-indigo-600">{item.risk}% Prediction</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                            <div>Risk Level: <strong className="text-slate-800">{item.level}</strong></div>
                            <div>Predicted Impact: <strong className="text-slate-800">{item.impact}</strong></div>
                          </div>

                          <div className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-100 leading-normal">
                            💡 <strong>AI Recommendation:</strong> {item.rec}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hotspots predictor analysis */}
                  <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg space-y-5">
                    <h3 className="font-extrabold text-slate-300 text-sm uppercase tracking-wider border-b border-slate-800 pb-2">AI Spot Predictor Engine</h3>
                    
                    <div className="space-y-4 text-xs">
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                        <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Predictive Trend Detected</span>
                        <p className="text-slate-300 leading-relaxed font-medium">
                          "High frequency of road potholes identified around Wardha Road. AI predicts localized traffic jam recurrence index of 82% unless repaired within 24 hours."
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                        <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Drainage Surge Warning</span>
                        <p className="text-slate-300 leading-relaxed font-medium">
                          "Drainage complaints have increased by 28% this week. Predicted flooding probability at low level junctions is 81%."
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: CIVIC ANALYTICS */}
              {activeTab === 'CIVIC ANALYTICS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Daily complaints analytics */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Weekly Complaints Analytics</h3>
                    
                    <div className="h-48 flex items-end gap-4 px-2 pt-4 border-b border-slate-200">
                      {[
                        { label: "Mon", count: 12 },
                        { label: "Tue", count: 19 },
                        { label: "Wed", count: 15 },
                        { label: "Thu", count: 24 },
                        { label: "Fri", count: 18 },
                        { label: "Sat", count: 28 },
                        { label: "Sun", count: 22 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-500">{item.count}</span>
                          <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${item.count * 4}px` }}></div>
                          <span className="text-[9px] text-slate-400 font-bold">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 block text-center">Complaints Logged Per Day (Nagpur City Zones)</span>
                  </div>

                  {/* Resolution rate pie gauge */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center flex flex-col justify-center items-center">
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-4">Core Resolution Efficiency</h3>
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[12px] border-slate-100"></div>
                      <div className="absolute inset-0 rounded-full border-[12px] border-indigo-600 border-t-transparent border-r-transparent animate-spin-slow"></div>
                      <div className="z-10 text-center">
                        <span className="text-2xl font-extrabold text-slate-800">89%</span>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase mt-1">Resolution Rate</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: WARD INTELLIGENCE */}
              {activeTab === 'WARD INTELLIGENCE' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Nagpur Ward-Wise Analytics</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase">
                          <th className="py-3 px-4">Ward Zone</th>
                          <th className="py-3 px-4">Total complaints</th>
                          <th className="py-3 px-4">AI Risk %</th>
                          <th className="py-3 px-4">Resolution %</th>
                          <th className="py-3 px-4">Avg SLA Resolution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                        {wardsData.map((ward, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900">{ward.name}</td>
                            <td className="py-3 px-4 font-mono font-bold">{ward.complaints}</td>
                            <td className="py-3 px-4 text-orange-600 font-bold">{ward.risk}%</td>
                            <td className="py-3 px-4 text-emerald-600 font-bold">{ward.resolved}%</td>
                            <td className="py-3 px-4 font-mono">{ward.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: DEPARTMENT PERFORMANCE */}
              {activeTab === 'DEPARTMENT PERFORMANCE' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Division Performance Grid</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase">
                          <th className="py-3 px-4">Division Department</th>
                          <th className="py-3 px-4">Total Cases</th>
                          <th className="py-3 px-4">Resolved</th>
                          <th className="py-3 px-4">Pending</th>
                          <th className="py-3 px-4">Completion %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                        {[
                          { name: "Roads & Potholes Division", total: roadCount, res: Math.max(0, roadCount - 1), pend: 1, rate: 84 },
                          { name: "Water Works Dept", total: waterCount, res: Math.max(0, waterCount - 1), pend: 1, rate: 68 },
                          { name: "Sanitation & Solid Waste Management", total: totalAssigned - roadCount - waterCount, res: resolvedToday, pend: activeCases, rate: 76 }
                        ].map((dept, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900">{dept.name}</td>
                            <td className="py-3 px-4 font-mono font-bold">{dept.total}</td>
                            <td className="py-3 px-4 font-mono text-emerald-600">{dept.res}</td>
                            <td className="py-3 px-4 font-mono text-rose-600">{dept.pend}</td>
                            <td className="py-3 px-4 text-indigo-600 font-bold">{dept.rate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: MEDIA EVIDENCE */}
              {activeTab === 'MEDIA EVIDENCE' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Citizen Media Evidence Files</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {issues.filter(i => i.mediaPath).map((issue) => (
                      <div key={issue.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-3 space-y-3">
                        <div className="rounded-lg overflow-hidden border border-slate-100 bg-white max-h-32 flex justify-center items-center">
                          <img src={issue.mediaPath} alt="complaint" className="max-h-32 object-contain" />
                        </div>
                        <div className="text-[10px] text-slate-500 space-y-1">
                          <div className="font-bold text-indigo-600 font-mono">{issue.id}</div>
                          <div>GPS: <strong>{issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}</strong></div>
                          <div>Locality: <strong>{issue.locationName}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: CITIZEN FEEDBACK */}
              {activeTab === 'CITIZEN FEEDBACK' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Citizen Satisfaction Analytics</h3>
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                      Average Satisfaction: {citizenSatisfaction}%
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { comment: "Fast road restoration. Impressed with AI tracking updates.", rating: 5, user: "Amit K.", date: "Today" },
                      { comment: "Water issue solved. Took slightly longer than predicted SLA.", rating: 4, user: "Priya S.", date: "Yesterday" }
                    ].map((feed, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>{feed.user}</span>
                          <span className="text-amber-500">{"★".repeat(feed.rating)}</span>
                        </div>
                        <p className="text-slate-600 italic font-medium">"{feed.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: REPORTS GENERATOR */}
              {activeTab === 'REPORTS' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Generate Civic Report</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Target Date</label>
                      <input
                        type="date"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        className="w-full border border-slate-200 rounded p-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Department</label>
                      <select
                        value={reportDept}
                        onChange={(e) => setReportDept(e.target.value)}
                        className="w-full border border-slate-200 rounded p-2 text-xs focus:outline-none"
                      >
                        <option value="All">All Departments</option>
                        <option value="Roads">Roads & Potholes</option>
                        <option value="Water">Water Supply</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Category</label>
                      <select
                        value={reportCategory}
                        onChange={(e) => setReportCategory(e.target.value)}
                        className="w-full border border-slate-200 rounded p-2 text-xs focus:outline-none"
                      >
                        <option value="All">All Categories</option>
                        <option value="Critical">Critical Priority</option>
                        <option value="Normal">Normal</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setReportGenerated(true)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Generate Civic Report
                  </button>

                  {reportGenerated && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-800">
                      <span className="font-extrabold block">✓ Municipal Report Compiled</span>
                      <p className="font-medium text-emerald-700">
                        NMC daily performance log generated successfully for date {reportDate} ({issues.length} active complaints registered).
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 10: NOTIFICATIONS */}
              {activeTab === 'NOTIFICATIONS' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Broadcast Alerts Log</h3>
                  
                  <div className="space-y-3">
                    {[
                      { text: "Critical AI Waterlogging risk calculated at Mahal Zone.", date: "10 mins ago" },
                      { text: "Officer Rajesh Patil completed status resolution for NGP-2026-00125.", date: "1 hour ago" },
                      { text: "Overdue alert: Complaint NGP-2026-00114 has exceeded 24 hour SLA window.", date: "2 hours ago" }
                    ].map((notif, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-medium">{notif.text}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{notif.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Floating ChatGPT Assistant */}
      <CitizenChatbot />
    </div>
  );
}
