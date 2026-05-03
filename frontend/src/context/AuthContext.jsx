import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { deriveKey } from '../utils/crypto';

const AuthContext = createContext();

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001/api/auth' 
  : '/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState(null);

  // Set up axios defaults
  axios.defaults.withCredentials = true;

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const checkLoggedIn = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Verify token with health check or user profile endpoint
        // For simplicity, we just assume it's valid if present
        const savedUser = JSON.parse(localStorage.getItem('user'));
        setUser(savedUser);
      }
    } catch (err) {
      console.error('Auth check failed', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, masterPassword) => {
    const res = await axios.post(`${API_URL}/register`, { email, masterPassword });
    if (res.data.success) {
      const key = await deriveKey(masterPassword);
      setEncryptionKey(key);
      handleAuthSuccess(res.data);
    }
    return res.data;
  };

  const login = async (email, masterPassword, totpToken) => {
    const res = await axios.post(`${API_URL}/login`, { email, masterPassword, totpToken });
    if (res.data.success) {
      const key = await deriveKey(masterPassword);
      setEncryptionKey(key);
      handleAuthSuccess(res.data);
    }
    return res.data;
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setEncryptionKey(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, encryptionKey, loading, register, login, logout, setEncryptionKey }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
