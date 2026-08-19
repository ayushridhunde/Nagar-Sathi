import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

// Layout
import MainLayout from './layouts/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportIssue from './pages/ReportIssue';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CivicMapPage from './pages/CivicMapPage';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              
              {/* Citizen Routes */}
              <Route path="citizen" element={<CitizenDashboard />} />
              <Route path="citizen/report" element={<ReportIssue />} />
              <Route path="citizen/complaints" element={<CitizenDashboard />} />
              <Route path="citizen/notifications" element={<CitizenDashboard />} />
              <Route path="citizen/profile" element={<CitizenDashboard />} />
              <Route path="citizen/map" element={<CivicMapPage />} />

              {/* Officer Routes */}
              <Route path="officer" element={<OfficerDashboard />} />
              <Route path="officer/issues" element={<OfficerDashboard />} />
              <Route path="officer/actions" element={<OfficerDashboard />} />

              {/* Admin Routes */}
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/analytics" element={<AdminDashboard />} />
              <Route path="admin/predictions" element={<AdminDashboard />} />
              <Route path="admin/map" element={<CivicMapPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
