import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, CheckCircle, Clock, FileText, ChevronRight, Activity, Calendar, MapPin, 
  Sparkles, Search, MessageSquare, Trash2, Copy, RefreshCw, Mic, Paperclip, 
  Map, Bell, User, AlertTriangle, ShieldCheck, Download, Edit2, Send, X,
  ArrowUpRight, BrainCircuit, Compass
} from 'lucide-react';
import AiPriorityGauge from '../components/AiPriorityGauge';
import { useAuth } from '../context/AuthContext';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, apiFetch } = useAuth();

  // Tab Sync from Pathname
  const getActiveTab = () => {
    if (location.pathname.includes('/complaints')) return 'complaints';
    if (location.pathname.includes('/notifications')) return 'notifications';
    if (location.pathname.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tabName) => {
    if (tabName === 'dashboard') navigate('/citizen');
    else navigate(`/citizen/${tabName}`);
  };

  // State Management
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  // Track Complaint Search States
  const [searchId, setSearchId] = useState('');
  const [searchedComplaint, setSearchedComplaint] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Profile Form States
  const [profileName, setProfileName] = useState(user?.name || 'Ayush Ranade');
  const [profileMobile, setProfileMobile] = useState(user?.mobile || '9876543210');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'ayush@nagpurmail.com');
  const [profileAddress, setProfileAddress] = useState('Dharampeth Square, Nagpur');
  const [profileLang, setProfileLang] = useState('en');
  const [profileSaved, setProfileSaved] = useState(false);

  // Civic Alerts Mock
  const alerts = [
    { zone: "Dharampeth", text: "Water main repairs scheduled on Aug 18, 9:00 AM - 5:00 PM. Expect low pressure.", type: "Water" },
    { zone: "Wardha Road", text: "Flyover pipeline cleaning operations tonight. Traffic diverted to lower roads.", type: "Traffic" },
    { zone: "Mahal Zone", text: "Auxiliary solid waste dump bins placed for festive bazaar week.", type: "Garbage" }
  ];

  // Citizen Notifications Mock
  const notifications = [
    { date: "August 17, 11:30 AM", text: "Officer Sunita Joshi assigned to your complaint NGP-2026-00125.", id: 1 },
    { date: "August 16, 4:00 PM", text: "Timeline stage 'Assigned' completed for complaint NGP-2026-00130.", id: 2 },
    { date: "August 14, 4:30 PM", text: "Your complaint NGP-2026-00118 has been marked as Resolved. Resolution proof is available.", id: 3 }
  ];

  // Fetch Complaints
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/complaints/my');
      setIssues(data);
      if (data.length > 0) {
        setSelectedIssue(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // Track Complaint lookup handler
  const handleComplaintSearch = (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchedComplaint(null);

    const found = issues.find(i => i.id.toUpperCase() === searchId.trim().toUpperCase());
    if (found) {
      setSearchedComplaint(found);
    } else {
      setSearchError('No complaint found matching that ID in Nagpur NMC database.');
    }
  };

  // Profile Save
  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // Suggested Prompts Selection
  const handleSuggestedPrompt = (prompt) => {
    window.dispatchEvent(new CustomEvent('open-nagar-sathi-chat', { detail: prompt }));
  };

  // Metrics
  const getMetrics = () => {
    const total = issues.length;
    const active = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Citizen Verified' && i.status !== 'Closed').length;
    const resolved = issues.filter(i => i.status === 'Resolved' || i.status === 'Citizen Verified').length;
    const pending = issues.filter(i => i.status === 'Submitted' || i.status === 'AI Classified').length;
    return { total, active, resolved, pending };
  };
  const metrics = getMetrics();

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Citizen Verified': 
      case 'Closed': 
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'In Progress':
      case 'Field Action':
      case 'Assigned': 
        return 'text-sky-600 bg-sky-50 border-sky-200';
      default: 
        return 'text-amber-600 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen relative">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Dashboard Tabs Header Nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white p-2.5 rounded-xl shadow-sm">
          {[
            { id: 'dashboard', label: 'Overview Dashboard', icon: <Activity className="w-4 h-4" /> },
            { id: 'complaints', label: 'My Complaints', icon: <FileText className="w-4 h-4" /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
            { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.id 
                  ? 'bg-nagpur-navy text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content conditional panels */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-slate-900">{metrics.total}</div>
                  <div className="text-xs text-slate-500 font-bold">Total Complaints</div>
                </div>
                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg shrink-0"><FileText className="w-5 h-5" /></div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-sky-600">{metrics.active}</div>
                  <div className="text-xs text-slate-500 font-bold">Active Issues</div>
                </div>
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg shrink-0"><Activity className="w-5 h-5" /></div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-emerald-600">{metrics.resolved}</div>
                  <div className="text-xs text-slate-500 font-bold">Resolved</div>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><CheckCircle className="w-5 h-5" /></div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-amber-600">{metrics.pending}</div>
                  <div className="text-xs text-slate-500 font-bold">Pending AI Triage</div>
                </div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0"><Clock className="w-5 h-5" /></div>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: "REPORT ISSUE", desc: "Report road, water, garbage or drainage issues.", icon: <Plus className="w-5 h-5 text-sky-600 animate-pulse" />, link: '/citizen/report' },
                { title: "TRACK COMPLAINT", desc: "Track using ID NGP-2026-XXXX.", icon: <Search className="w-5 h-5 text-indigo-600" />, action: () => document.getElementById('track-section')?.scrollIntoView({ behavior: 'smooth' }) },
                { title: "NEARBY ISSUES", desc: "See issues reported in your area.", icon: <Compass className="w-5 h-5 text-rose-600" />, link: '/citizen/map' },
                { title: "CIVIC MAP", desc: "Open interactive OpenStreetMap.", icon: <Map className="w-5 h-5 text-slate-600" />, link: '/citizen/map' },
                { title: "CIVIC ALERTS", desc: "Water supply, flood warning alerts.", icon: <AlertTriangle className="w-5 h-5 text-red-500" />, action: () => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' }) },
                { title: "MY DOCUMENTS", desc: "View submitted photos and reports.", icon: <Download className="w-5 h-5 text-emerald-600" />, action: () => handleTabChange('complaints') },
                { title: "NOTIFICATIONS", desc: "Check updates and officer reviews.", icon: <Bell className="w-5 h-5 text-amber-600" />, action: () => handleTabChange('notifications') },
                { title: "MY PROFILE", desc: "Manage phone, email, and address.", icon: <User className="w-5 h-5 text-purple-600" />, action: () => handleTabChange('profile') }
              ].map((card, idx) => (
                <div 
                  key={idx} 
                  onClick={card.action || (() => navigate(card.link))}
                  className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow hover:scale-102 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">{card.icon}</div>
                    <span className="font-extrabold text-xs text-slate-800 tracking-wider uppercase">{card.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-4 leading-normal font-medium">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Smart Citizen Section: Suggested prompts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6 shadow-lg">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-nagpur-yellow animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-200">Your Civic Assistant</h3>
                  <p className="text-xs text-slate-400">Ask Nagar Sathi AI anything about Nagpur municipal services.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "माझ्या भागात पाणी कधी येणार आहे?",
                  "माझी तक्रार कुठे पोहोचली?",
                  "माझ्या जवळ कोणते नागरी प्रश्न आहेत?",
                  "मला रस्त्यावरील खड्ड्याची तक्रार करायची आहे.",
                  "mere area mein garbage collection kab hota hai?",
                  "How do I report a water leakage?"
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="p-3 bg-slate-950/60 border border-slate-800 hover:border-nagpur-yellow rounded-xl text-left text-xs font-semibold leading-relaxed hover:text-nagpur-yellow transition-all flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-nagpur-yellow shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Track Section */}
            <div id="track-section" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-slate-800 text-base">Track Specific Complaint Status</h3>
              
              <form onSubmit={handleComplaintSearch} className="flex gap-3 max-w-md">
                <input
                  type="text"
                  required
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Complaint ID (e.g. NGP-2026-00124)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-mono tracking-wider"
                />
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2 rounded-lg text-xs transition-colors shrink-0"
                >
                  Track Status
                </button>
              </form>

              {searchError && <div className="text-red-500 text-xs font-bold">{searchError}</div>}

              {searchedComplaint && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-5 max-w-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="font-mono text-xs font-bold text-slate-400">{searchedComplaint.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(searchedComplaint.status)}`}>
                      {searchedComplaint.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><strong>Category:</strong> {searchedComplaint.category}</div>
                    <div><strong>Reported:</strong> {searchedComplaint.reportedDate}</div>
                    <div className="col-span-2"><strong>Location:</strong> {searchedComplaint.locationName}</div>
                  </div>

                  {/* Timeline */}
                  <div className="pl-6 space-y-4 border-l border-slate-200 ml-3">
                    {JSON.parse(searchedComplaint.timeline).map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          step.done ? 'bg-sky-500 border-sky-500' : 'bg-white border-slate-300'
                        }`}>
                          {step.done && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                        </div>
                        <span className={`text-xs font-bold block ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.stage}</span>
                        {step.done && step.date && <span className="text-[9px] text-slate-400 block">{step.date}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alerts Section */}
            <div id="alerts-section" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                Nagpur Local Civic Alerts
              </h3>
              
              <div className="space-y-3">
                {alerts.map((al, idx) => (
                  <div key={idx} className="p-3 bg-red-50/40 border border-red-100 rounded-xl flex gap-3 text-xs leading-normal">
                    <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded h-fit uppercase tracking-wide text-[9px]">{al.zone}</span>
                    <p className="font-medium text-slate-700">{al.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* List panel */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">My Registered Complaints</h2>
              
              {issues.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
                  You haven't logged any complaints yet. Click "+ Report New Issue" to file one.
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className={`p-4 bg-white rounded-xl border transition-all cursor-pointer flex justify-between items-start gap-4 ${
                        selectedIssue?.id === issue.id 
                          ? 'border-sky-500 ring-1 ring-sky-500 shadow-md' 
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-slate-400">{issue.id}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">{issue.reportedDate}</span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {issue.category} - <span className="text-slate-500 text-xs font-semibold">{issue.subcategory}</span>
                        </h3>
                        
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {issue.description}
                        </p>

                        <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {issue.locationName.split(',')[0]}
                          </span>
                          <span>•</span>
                          <span>AI Score: <strong className="text-slate-700">{issue.aiScore}/100</strong></span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-full min-h-[80px]">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400 mt-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details panel */}
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Complaint Detail Track</h2>
              
              {selectedIssue ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-md p-5 space-y-6">
                  
                  {/* ID Header */}
                  <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-400">{selectedIssue.id}</span>
                      <h3 className="font-extrabold text-slate-800 text-base mt-0.5">{selectedIssue.category}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status}
                    </span>
                  </div>

                  {/* Preview Image */}
                  {selectedIssue.mediaPath && (
                    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-h-48 flex justify-center items-center">
                      {selectedIssue.mediaType === 'video' ? (
                        <video controls className="max-h-48 w-full object-contain">
                          <source src={selectedIssue.mediaPath} />
                        </video>
                      ) : (
                        <img src={selectedIssue.mediaPath} alt="Complaint proof" className="max-h-48 w-full object-contain" />
                      )}
                    </div>
                  )}

                  {/* AI Score */}
                  <AiPriorityGauge score={selectedIssue.aiScore} factors={selectedIssue.factors} />

                  {/* Timeline */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 font-sans">Resolution Path</h4>
                    <div className="relative pl-6 space-y-5 border-l border-slate-200 ml-3">
                      {selectedIssue.timeline.map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            step.done 
                              ? 'bg-sky-500 border-sky-500 text-white' 
                              : 'bg-white border-slate-300 text-transparent'
                          }`}>
                            {step.done && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                          </div>
                          <div>
                            <h5 className={`text-xs font-bold ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.stage}</h5>
                            {step.done && step.date && <span className="text-[10px] text-slate-400 block mt-0.5">{step.date}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-slate-400 text-sm">
                  Select a card from complaints tab to examine active details.
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-800 text-base">Civic Updates & Officer Actions</h3>
            
            <div className="divide-y divide-slate-100">
              {notifications.map((not) => (
                <div key={not.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4 text-xs">
                  <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 leading-normal">
                    <span className="text-slate-400 font-bold block">{not.date}</span>
                    <p className="font-semibold text-slate-700">{not.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-xl">
            <h3 className="font-extrabold text-slate-800 text-base mb-5">Manage Citizen Profile</h3>
            
            {profileSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold mb-4 animate-pulse">
                ✓ Profile changes successfully saved!
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={profileMobile}
                  onChange={(e) => setProfileMobile(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold">Residential Address</label>
                <input
                  type="text"
                  required
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600 font-bold">Preferred Communication Language</label>
                <select
                  value={profileLang}
                  onChange={(e) => setProfileLang(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="en">English</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-nagpur-navy hover:bg-nagpur-navy-light text-white font-bold py-2.5 px-6 rounded-lg text-xs shadow transition-colors"
              >
                Save Profile Details
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
