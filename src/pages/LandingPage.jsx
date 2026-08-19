import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Droplet, AlertTriangle, Trash2, ShieldAlert, Lightbulb, Navigation, 
  Eye, FileText, Camera, CheckSquare, Map, AlertCircle, Compass, ShieldCheck
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleHeroCta = () => {
    if (user && user.role === 'citizen') {
      navigate('/citizen/report');
    } else {
      navigate('/login');
    }
  };

  const scrollToServices = () => {
    document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Expanded Citizen Services (12 items with unique working routes/actions)
  const citizenServices = [
    { title: "Track Complaint", icon: <Eye className="w-5 h-5 text-indigo-600" />, link: '/citizen' },
    { title: "Upload Photo/Video", icon: <Camera className="w-5 h-5 text-amber-600" />, link: '/citizen/report' },
    { title: "Check Complaint Status", icon: <CheckSquare className="w-5 h-5 text-emerald-600" />, link: '/citizen' },
    { title: "Nearby Civic Issues", icon: <Compass className="w-5 h-5 text-rose-600" />, link: '/citizen/map' },
    { title: "Civic Map", icon: <Map className="w-5 h-5 text-slate-600" />, link: '/citizen/map' },
    { title: "Water Services", icon: <Droplet className="w-5 h-5 text-sky-500" />, link: '/citizen/report', state: { category: 'Water Supply' } },
    { title: "Garbage Services", icon: <Trash2 className="w-5 h-5 text-amber-500" />, link: '/citizen/report', state: { category: 'Garbage' } },
    { title: "Road/Pothole Services", icon: <AlertTriangle className="w-5 h-5 text-red-500" />, link: '/citizen/report', state: { category: 'Roads & Potholes' } },
    { title: "Streetlight Complaint", icon: <Lightbulb className="w-5 h-5 text-yellow-500" />, link: '/citizen/report', state: { category: 'Street Lights' } },
    { title: "Drainage Complaint", icon: <ShieldAlert className="w-5 h-5 text-lime-500" />, link: '/citizen/report', state: { category: 'Drainage' } },
    { title: "Emergency Civic Alert", icon: <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />, link: '/citizen/map' },
    { title: "Verify Resolution", icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, link: '/citizen' }
  ];

  return (
    <div className="w-full">
      {/* 1. Hero Section with Background Cinematic Video */}
      <section className="relative h-[650px] w-full flex items-center justify-center text-white px-6 sm:px-12 lg:px-24 overflow-hidden">
        
        {/* Background Cinematic Video Tag */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover z-0"
        >
          <source src="/nagpur_cinematic.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-nagpur-navy-dark via-nagpur-navy-dark/70 to-slate-900/50 z-10"></div>
        
        {/* Content above the video background */}
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-20 animate-slide-up">
          <span className="inline-block bg-nagpur-yellow text-nagpur-navy-dark font-extrabold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-md">
            VIKASIT NAGPUR
          </span>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-md">
            AI-Powered Urban Issue Intelligence
          </h1>
          
          <p className="text-slate-200 text-lg sm:text-xl font-medium max-w-3xl mx-auto leading-relaxed drop-shadow">
            Transforming citizen complaints into intelligent, predictive and proactive civic action for Nagpur.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={handleHeroCta}
              className="bg-nagpur-yellow hover:bg-nagpur-yellow-dark text-nagpur-navy-dark font-black py-3.5 px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm tracking-wider uppercase"
            >
              Report Civic Issue
            </button>
            <button 
              onClick={scrollToServices}
              className="bg-transparent hover:bg-white/10 text-white font-bold py-3.5 px-8 rounded-lg border border-white/40 hover:border-white transition-all text-sm uppercase"
            >
              Explore Citizen Services
            </button>
          </div>
        </div>
      </section>

      {/* 2. AI Intelligence Features Capabilities (9 Cards) */}
      <section id="intel-section" className="py-20 px-6 sm:px-12 lg:px-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              System Core Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Smarter Nagpur. Faster Action.
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              How Nagar Sathi AI uses advanced spatial decision routing and predictive analytics to resolve Nagpur's civic challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "AI Issue Detection", desc: "Automatically understand and classify citizen complaints." },
              { title: "Intelligent Issue Categorization", desc: "Classify complaints into water, roads, garbage, streetlights, drainage and other civic categories." },
              { title: "Civic Hotspot Detection", desc: "Identify locations where civic issues repeatedly occur." },
              { title: "Predictive Civic Risk", desc: "Predict potential civic problems before they become critical." },
              { title: "AI Priority Score", desc: "Generate an intelligent priority score from 0–100." },
              { title: "Smart Department Routing", desc: "Automatically route issues to the responsible municipal department." },
              { title: "Duplicate Complaint Detection", desc: "Detect duplicate complaints about the same issue or location." },
              { title: "Citizen Verification", desc: "Allow citizens to verify whether the reported issue was actually resolved." },
              { title: "Predictive Action Recommendation", desc: "Recommend proactive municipal action based on historical and current issue patterns." }
            ].map((cap, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl p-6 border border-slate-200 hover:border-slate-800 transition-all duration-300 group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-white mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-slate-600 group-hover:text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {cap.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Citizen Services Section */}
      <section id="services-section" className="py-20 px-6 sm:px-12 lg:px-24 bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
              Citizen Hub
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              One Platform. Every Civic Need.
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto">
              Access working services provided for Nagpur Municipal Corporation citizens. Sign in to log new cases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {citizenServices.map((srv, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(srv.link, { state: srv.state || {} })}
                className="bg-white hover:bg-nagpur-navy hover:text-white rounded-xl p-5 border border-slate-200 hover:border-nagpur-yellow shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-4 group"
              >
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg group-hover:bg-white/10 group-hover:border-transparent transition-all shrink-0">
                  {srv.icon}
                </div>
                <h4 className="font-bold text-slate-800 text-sm group-hover:text-white leading-snug">
                  {srv.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
