import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building, Shield, Eye, EyeOff, Lock, Mail, CreditCard, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { 
    sendCitizenOtp, verifyCitizenOtp, resendCitizenOtp,
    loginOfficer, verifyOfficerOtp, 
    loginAdmin, verifyAdminOtp 
  } = useAuth();

  // Citizen OTP Flow
  const [citMobile, setCitMobile] = useState('9876543210');
  const [citOtp, setCitOtp] = useState('');
  const [citSent, setCitSent] = useState(false);
  const [citTimer, setCitTimer] = useState(0);
  const [citError, setCitError] = useState('');
  const [citSuccessMsg, setCitSuccessMsg] = useState('');

  // Officer OTP Flow
  const [offId, setOffId] = useState('NMC-OFF-402');
  const [offPass, setOffPass] = useState('officerpass');
  const [offOtp, setOffOtp] = useState('');
  const [offSent, setOffSent] = useState(false);
  const [offTimer, setOffTimer] = useState(0);
  const [offError, setOffError] = useState('');
  const [offSuccessMsg, setOffSuccessMsg] = useState('');

  // Admin OTP Flow
  const [admId, setAdmId] = useState('NMC-ADMIN-01');
  const [admPass, setAdmPass] = useState('adminpass');
  const [admOtp, setAdmOtp] = useState('');
  const [admSent, setAdmSent] = useState(false);
  const [admTimer, setAdmTimer] = useState(0);
  const [admError, setAdmError] = useState('');
  const [admSuccessMsg, setAdmSuccessMsg] = useState('');

  // Visibility states
  const [showPass, setShowPass] = useState({ officer: false, admin: false });

  // Handle countdown timers
  useEffect(() => {
    let interval = null;
    if (citTimer > 0) {
      interval = setInterval(() => setCitTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [citTimer]);

  useEffect(() => {
    let interval = null;
    if (offTimer > 0) {
      interval = setInterval(() => setOffTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [offTimer]);

  useEffect(() => {
    let interval = null;
    if (admTimer > 0) {
      interval = setInterval(() => setAdmTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [admTimer]);

  // Citizen: Send OTP
  const handleCitizenSend = async (e) => {
    if (e) e.preventDefault();
    setCitError('');
    setCitSuccessMsg('');
    try {
      const res = await sendCitizenOtp(citMobile);
      setCitSent(true);
      setCitTimer(30); // 30 seconds resend cooldown
      setCitSuccessMsg(res.message);
    } catch (err) {
      setCitError(err.message || 'Failed to send OTP. Try again.');
    }
  };

  // Citizen: Resend OTP
  const handleCitizenResend = async () => {
    setCitError('');
    setCitSuccessMsg('');
    try {
      const res = await resendCitizenOtp(citMobile);
      setCitTimer(30);
      setCitSuccessMsg(res.message);
    } catch (err) {
      setCitError(err.message || 'Failed to resend OTP. Try again.');
    }
  };

  // Citizen: Verify OTP
  const handleCitizenVerify = async (e) => {
    e.preventDefault();
    setCitError('');
    try {
      await verifyCitizenOtp(citMobile, citOtp);
      navigate('/citizen');
    } catch (err) {
      setCitError(err.message || 'Invalid OTP code. Please check and try again.');
    }
  };

  // Officer: Submit Credentials
  const handleOfficerLogin = async (e) => {
    e.preventDefault();
    setOffError('');
    setOffSuccessMsg('');
    try {
      const res = await loginOfficer(offId, offPass);
      setOffSent(true);
      setOffTimer(60);
      setOffSuccessMsg(`Password validated! OTP for Demo: ${res.otp}`);
    } catch (err) {
      setOffError(err.message || 'Login details invalid.');
    }
  };

  // Officer: Verify OTP
  const handleOfficerVerify = async (e) => {
    e.preventDefault();
    setOffError('');
    try {
      await verifyOfficerOtp(offId, offOtp);
      navigate('/officer');
    } catch (err) {
      setOffError(err.message || 'Invalid OTP code.');
    }
  };

  // Admin: Submit Credentials
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdmError('');
    setAdmSuccessMsg('');
    try {
      const res = await loginAdmin(admId, admPass);
      setAdmSent(true);
      setAdmTimer(60);
      setAdmSuccessMsg(`Password validated! OTP for Demo: ${res.otp}`);
    } catch (err) {
      setAdmError(err.message || 'Admin login details invalid.');
    }
  };

  // Admin: Verify OTP
  const handleAdminVerify = async (e) => {
    e.preventDefault();
    setAdmError('');
    try {
      await verifyAdminOtp(admId, admOtp);
      navigate('/admin');
    } catch (err) {
      setAdmError(err.message || 'Invalid OTP code.');
    }
  };

  return (
    <div className="py-16 px-6 bg-slate-50 min-h-[calc(100vh-140px)] flex flex-col justify-center items-center">
      <div className="max-w-6xl w-full text-center space-y-4 mb-12">
        <span className="text-nagpur-navy font-bold text-xs uppercase tracking-widest bg-nagpur-navy-soft px-3 py-1 rounded-full">
          Secure Civic Portals
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{t('loginTitle')}</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          {t('loginSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* A. CITIZEN PORTAL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">{t('citizenPortal')}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{t('citizenPortalSub')}</p>
              </div>
            </div>

            {citError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg">{citError}</div>}
            {citSuccessMsg && <div className="p-3 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold rounded-lg font-mono">{citSuccessMsg}</div>}

            {!citSent ? (
              <form onSubmit={handleCitizenSend} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">{t('mobileLabel')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={citMobile}
                      onChange={(e) => setCitMobile(e.target.value)}
                      placeholder={t('mobilePlaceholder')}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-nagpur-navy"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                >
                  {t('sendOtpBtn')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCitizenVerify} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">{t('otpLabel')}</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={citOtp}
                      onChange={(e) => setCitOtp(e.target.value)}
                      placeholder={t('otpPlaceholder')}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-nagpur-navy font-mono tracking-widest text-center"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                >
                  {t('verifyLoginBtn')}
                </button>

                <div className="flex justify-between items-center text-xs pt-2">
                  <button
                    type="button"
                    disabled={citTimer > 0}
                    onClick={handleCitizenResend}
                    className={`font-bold ${citTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-sky-600 hover:underline'}`}
                  >
                    {citTimer > 0 ? `${t('resendCooldown')} ${citTimer}s` : t('resendBtn')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* B. MUNICIPAL OFFICER PORTAL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">{t('officerPortal')}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{t('officerPortalSub')}</p>
              </div>
            </div>

            {offError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg">{offError}</div>}
            {offSuccessMsg && <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg font-mono">{offSuccessMsg}</div>}

            {!offSent ? (
              <form onSubmit={handleOfficerLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">{t('officerIdLabel')}</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={offId}
                      onChange={(e) => setOffId(e.target.value)}
                      placeholder={t('officerIdPlaceholder')}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-nagpur-navy"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">{t('passwordLabel')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPass.officer ? 'text' : 'password'}
                      required
                      value={offPass}
                      onChange={(e) => setOffPass(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-nagpur-navy"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(prev => ({ ...prev, officer: !prev.officer }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass.officer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                >
                  {t('verifyCredsBtn')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOfficerVerify} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">{t('officerOtpLabel')}</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={offOtp}
                      onChange={(e) => setOffOtp(e.target.value)}
                      placeholder={t('otpPlaceholder')}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-nagpur-navy font-mono tracking-widest text-center"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                >
                  {t('officerVerifyBtn')}
                </button>

                <div className="flex justify-between items-center text-xs pt-2">
                  <button
                    type="button"
                    disabled={offTimer > 0}
                    onClick={handleOfficerLogin}
                    className={`font-bold ${offTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:underline'}`}
                  >
                    {offTimer > 0 ? `${t('resendCooldown')} ${offTimer}s` : t('resendBtn')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* C. ADMINISTRATOR PORTAL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">{t('adminPortal')}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{t('adminPortalSub')}</p>
              </div>
            </div>

            {admError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg">{admError}</div>}
            {admSuccessMsg && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg font-mono">{admSuccessMsg}</div>}

            {!admSent ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">{t('adminIdLabel')}</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={admId}
                      onChange={(e) => setAdmId(e.target.value)}
                      placeholder={t('adminIdPlaceholder')}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-nagpur-navy"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">{t('passwordLabel')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPass.admin ? 'text' : 'password'}
                      required
                      value={admPass}
                      onChange={(e) => setAdmPass(e.target.value)}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-nagpur-navy"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(prev => ({ ...prev, admin: !prev.admin }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass.admin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                >
                  {t('verifyCredsBtn')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminVerify} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-bold">{t('adminOtpLabel')}</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={admOtp}
                      onChange={(e) => setAdmOtp(e.target.value)}
                      placeholder={t('otpPlaceholder')}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-nagpur-navy font-mono tracking-widest text-center"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                >
                  {t('adminVerifyBtn')}
                </button>

                <div className="flex justify-between items-center text-xs pt-2">
                  <button
                    type="button"
                    disabled={admTimer > 0}
                    onClick={handleAdminLogin}
                    className={`font-bold ${admTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-red-600 hover:underline'}`}
                  >
                    {admTimer > 0 ? `${t('resendCooldown')} ${admTimer}s` : t('resendBtn')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
