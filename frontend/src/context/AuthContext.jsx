import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setEmployee(data.employee);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password, company_name) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, company_name })
    });
    
    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error("Unable to reach the requested service.\nPlease contact the administrator.");
    }

    if (!res.ok) {
      throw new Error(data.message || "Unable to reach the requested service.\nPlease contact the administrator.");
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setEmployee(data.employee);
    return data.user;
  };

  const signup = async (name, email, password, role, company_name) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role, company_name })
    });
    
    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error("Unable to reach the requested service.\nPlease contact the administrator.");
    }

    if (!res.ok) {
      throw new Error(data.message || "Unable to reach the requested service.\nPlease contact the administrator.");
    }

    // If pending (employee self-signup), there is NO token — do not auto-login
    if (data.pending) {
      return { pending: true, user: data.user };
    }

    // Admin signup: AUTO LOGIN
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setEmployee(data.employee);
    return { pending: false, user: data.user };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setEmployee(null);
  };

  const updateProfile = async (profileData) => {
    const res = await fetch(`${API_URL}/employees/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
    setEmployee(data.employee);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, employee, token, login, signup, logout, updateProfile, loading, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
