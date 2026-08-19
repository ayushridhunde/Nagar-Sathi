import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nagar_sathi_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('nagar_sathi_token') || null;
  });

  const saveSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('nagar_sathi_token', newToken);
    localStorage.setItem('nagar_sathi_user', JSON.stringify(newUser));
  };

  // Logout session
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nagar_sathi_token');
    localStorage.removeItem('nagar_sathi_user');
  };

  // Helper to resolve API base URL dynamically for local network/mobile testing
  const getApiBase = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // If running locally, check hostname
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    // If opening from mobile on same Wi-Fi local IP, point to port 5000 on that IP
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)) {
      return `http://${hostname}:5000`;
    }
    // Default fallback when deployed to Netlify without VITE_API_URL
    return 'http://localhost:5000';
  };

  // Helper fetch function that automatically injects JWT
  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const apiBase = getApiBase();
    const requestUrl = url.startsWith('/') ? `${apiBase}${url}` : url;

    const res = await fetch(requestUrl, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    return res.json();
  };

  // Citizen auth methods
  const sendCitizenOtp = async (mobile) => {
    return apiFetch('/api/auth/citizen/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  };

  const verifyCitizenOtp = async (mobile, otp) => {
    const data = await apiFetch('/api/auth/citizen/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
    if (data.success && data.token) {
      saveSession(data.token, data.user);
    }
    return data;
  };

  const resendCitizenOtp = async (mobile) => {
    return apiFetch('/api/auth/citizen/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  };

  // Officer auth methods
  const loginOfficer = async (officialId, password) => {
    return apiFetch('/api/auth/officer/login', {
      method: 'POST',
      body: JSON.stringify({ officialId, password }),
    });
  };

  const verifyOfficerOtp = async (officialId, otp) => {
    const data = await apiFetch('/api/auth/officer/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ officialId, otp }),
    });
    if (data.success && data.token) {
      saveSession(data.token, data.user);
    }
    return data;
  };

  // Admin auth methods
  const loginAdmin = async (adminId, password) => {
    return apiFetch('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ adminId, password }),
    });
  };

  const verifyAdminOtp = async (adminId, otp) => {
    const data = await apiFetch('/api/auth/admin/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ adminId, otp }),
    });
    if (data.success && data.token) {
      saveSession(data.token, data.user);
    }
    return data;
  };

  // Automatically check token validity
  useEffect(() => {
    if (token && !user) {
      apiFetch('/api/auth/me')
        .then(userData => {
          setUser(userData);
          localStorage.setItem('nagar_sathi_user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      logout, 
      apiFetch, 
      sendCitizenOtp, 
      verifyCitizenOtp, 
      resendCitizenOtp,
      loginOfficer, 
      verifyOfficerOtp, 
      loginAdmin, 
      verifyAdminOtp 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
