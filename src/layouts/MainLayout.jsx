import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Landmark, Menu, X, LogOut, Shield, User, Globe, ChevronDown } from 'lucide-react';
import CitizenChatbot from '../components/CitizenChatbot';

export default function MainLayout() {
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    setLangDropdownOpen(false);
  };

  const currentLangLabel = () => {
    if (lang === 'mr') return 'मराठी';
    if (lang === 'hi') return 'हिंदी';
    return 'English';
  };

  // Mock public leadership profiles (subtle circular avatars)
  const leaders = [
    { name: "Narendra Modi", role: "Prime Minister", image: "/modi.png" },
    { name: "Devendra Fadnavis", role: "Deputy Chief Minister", image: "/fadnavis.jpg" },
    { name: "Nitin Gadkari", role: "Union Minister", image: "/gadkari.jpg" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* 1. Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center py-3">
          
          {/* Left Side: Brand & Leadership Placeholders */}
          <div className="flex items-center gap-6">
            {/* Branding Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-nagpur-navy rounded-lg flex items-center justify-center text-nagpur-yellow border-2 border-nagpur-yellow/40 shadow">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-[9px] text-slate-400 tracking-wider leading-none uppercase">नागपूर महानगरपालिका</span>
                <span className="font-extrabold text-[9px] text-slate-600 tracking-wider leading-none uppercase mt-0.5">Nagpur Municipal Corp</span>
                <span className="font-black text-base text-nagpur-navy leading-none mt-1.5 flex items-center gap-1">
                  Nagar Sathi AI
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-nagpur-yellow text-nagpur-navy-dark border border-nagpur-yellow-dark">PRO</span>
                </span>
              </div>
            </div>

            {/* Public Leadership Avatars (subtle official row) */}
            <div className="hidden md:flex items-center gap-2.5 pl-6 border-l border-slate-200">
              {leaders.map((leader, index) => (
                <div key={index} className="relative group cursor-help">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-nagpur-yellow flex items-center justify-center shadow-sm transition-transform hover:scale-105 bg-slate-100">
                    <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                    <div className="text-nagpur-yellow">{leader.name}</div>
                    <div className="text-[8px] text-slate-400 font-medium">{leader.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center/Right: Desktop Navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Link to="/" className="hover:text-nagpur-navy transition-colors">{t('navHome')}</Link>
            
            {user && user.role === 'citizen' ? (
              <>
                <Link to="/citizen/complaints" className="hover:text-nagpur-navy transition-colors">{t('navMyComplaints')}</Link>
                <Link to="/citizen/report" className="hover:text-nagpur-navy transition-colors">{t('navReportIssue')}</Link>
                <Link to="/citizen/map" className="hover:text-nagpur-navy transition-colors">{t('navCivicMap')}</Link>
                <Link to="/citizen/notifications" className="hover:text-nagpur-navy transition-colors">{t('navNotifications')}</Link>
                <Link to="/citizen/profile" className="hover:text-nagpur-navy transition-colors">{t('navMyProfile')}</Link>
              </>
            ) : user && (user.role === 'officer' || user.role === 'admin') ? (
              <Link 
                to={user.role === 'officer' ? '/officer' : '/admin'} 
                className="text-indigo-600 hover:text-indigo-800 transition-colors font-extrabold flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                My Dashboard
              </Link>
            ) : null}
          </nav>

          {/* Right side controls: Language switcher, Login/User button, Hamburger */}
          <div className="flex items-center gap-3">
            
            {/* Dynamic Language selector */}
            <div className="relative">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentLangLabel()}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-28 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 text-xs font-semibold">
                  <button 
                    onClick={() => handleLangChange('en')}
                    className={`w-full py-2 px-3 text-left hover:bg-slate-50 transition-colors ${lang === 'en' ? 'text-nagpur-navy bg-slate-50 font-bold' : 'text-slate-600'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => handleLangChange('mr')}
                    className={`w-full py-2 px-3 text-left hover:bg-slate-50 transition-colors ${lang === 'mr' ? 'text-nagpur-navy bg-slate-50 font-bold' : 'text-slate-600'}`}
                  >
                    मराठी
                  </button>
                  <button 
                    onClick={() => handleLangChange('hi')}
                    className={`w-full py-2 px-3 text-left hover:bg-slate-50 transition-colors ${lang === 'hi' ? 'text-nagpur-navy bg-slate-50 font-bold' : 'text-slate-600'}`}
                  >
                    हिंदी
                  </button>
                </div>
              )}
            </div>

            {/* Login button / User menu */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="bg-slate-100 border border-slate-200 rounded-lg py-1.5 px-2.5 flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                  {user.role === 'citizen' ? <User className="w-3.5 h-3.5 text-sky-600" /> : <Shield className="w-3.5 h-3.5 text-red-600" />}
                  <span>{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg py-1.5 px-3 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:inline-block bg-nagpur-navy hover:bg-nagpur-navy-light text-white font-bold py-1.5 px-5 rounded-lg text-xs tracking-wider uppercase transition-colors"
              >
                {t('navLogin')}
              </button>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3 font-semibold text-xs text-slate-700 flex flex-col">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-nagpur-navy">{t('navHome')}</Link>
            
            {user && user.role === 'citizen' ? (
              <>
                <Link to="/citizen/complaints" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-nagpur-navy">{t('navMyComplaints')}</Link>
                <Link to="/citizen/report" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-nagpur-navy">{t('navReportIssue')}</Link>
                <Link to="/citizen/map" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-nagpur-navy">{t('navCivicMap')}</Link>
                <Link to="/citizen/notifications" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-nagpur-navy">{t('navNotifications')}</Link>
                <Link to="/citizen/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-nagpur-navy">{t('navMyProfile')}</Link>
              </>
            ) : user && (user.role === 'officer' || user.role === 'admin') ? (
              <Link 
                to={user.role === 'officer' ? '/officer' : '/admin'} 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-2 text-indigo-600 flex items-center gap-1 font-bold"
              >
                <Shield className="w-4 h-4" />
                My Dashboard
              </Link>
            ) : null}

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              {user ? (
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="font-bold">{user.name}</span>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="text-red-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  className="w-full bg-nagpur-navy text-white text-center py-2 rounded-lg font-bold uppercase tracking-wider"
                >
                  {t('navLogin')}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Blue Announcements Bar (Welcome Marquee/Ticker) */}
      <div className="bg-gradient-to-r from-nagpur-navy-dark to-nagpur-navy border-b border-nagpur-yellow/20 text-white py-2 px-4 overflow-hidden relative h-8 flex items-center shadow-inner">
        <div className="absolute left-4 z-15 bg-nagpur-yellow text-nagpur-navy-dark font-extrabold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider shadow-sm mr-4 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
          Alert
        </div>
        <div className="flex-1 w-full pl-16">
          <div className="whitespace-nowrap inline-block animate-ticker text-xs font-bold text-nagpur-yellow font-sans tracking-wide">
            {t('welcome')} &nbsp; &bull; &nbsp; {t('welcome')} &nbsp; &bull; &nbsp; {t('welcome')} &nbsp; &bull; &nbsp; {t('welcome')}
          </div>
        </div>
      </div>

      {/* 3. Page Content Outlet */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* 4. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 sm:px-12 lg:px-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 bg-nagpur-navy rounded flex items-center justify-center text-nagpur-yellow border border-nagpur-yellow/30">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-wider">Nagar Sathi AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footerText')}
            </p>
            <div className="text-[11px] text-nagpur-yellow font-bold uppercase bg-nagpur-navy-dark/40 border border-slate-800 rounded py-1.5 px-3 w-fit">
              {t('footerBuiltFor')}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white text-xs font-extrabold uppercase tracking-widest">{t('footerLinks')}</h4>
            <ul className="text-xs space-y-2 font-medium">
              <li>
                <a href="#services" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors">{t('navServices')}</a>
              </li>
              <li>
                <a href="#intelligence" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('intel-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-white transition-colors">{t('navIntelligence')}</a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">{t('navReport')}</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white text-xs font-extrabold uppercase tracking-widest">{t('footerLegal')}</h4>
            <ul className="text-xs space-y-2 font-medium">
              <li><button className="hover:text-white transition-colors">{t('footerPrivacy')}</button></li>
              <li><button className="hover:text-white transition-colors">{t('footerTerms')}</button></li>
            </ul>
            <div className="pt-2 text-[10px] text-slate-500 font-semibold">
              &copy; 2026 Nagpur Municipal Corporation. All Rights Reserved.
            </div>
          </div>

        </div>
      </footer>

      {/* Conditionally Render Floating Citizen Chatbot on Citizen pages */}
      {location.pathname.startsWith('/citizen') && <CitizenChatbot />}

    </div>
  );
}
