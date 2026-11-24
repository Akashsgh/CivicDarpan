import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civiclens_token'));
  const [loading, setLoading] = useState(true);

  // Initialize user from token on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('civiclens_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('[Auth Init Error]:', err);
          localStorage.removeItem('civiclens_token');
          localStorage.removeItem('civiclens_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user } = res.data;
      localStorage.setItem('civiclens_token', token);
      localStorage.setItem('civiclens_user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return user;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token, user } = res.data;
      localStorage.setItem('civiclens_token', token);
      localStorage.setItem('civiclens_user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return user;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('civiclens_token');
    localStorage.removeItem('civiclens_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('[Refresh User Error]:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
