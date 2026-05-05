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

  axios.defaults.withCredentials = true;

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const checkLoggedIn = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

  const login = async (email, masterPassword, totpToken, securityAnswer) => {
    const res = await axios.post(`${API_URL}/login`, { email, masterPassword, totpToken, securityAnswer });
    if (res.data.success) {
      const key = await deriveKey(masterPassword);
      setEncryptionKey(key);
      handleAuthSuccess(res.data);
    }
    return res.data;
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    setUser(data.user);
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API_URL.replace('/auth', '')}/auth/me`);
      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('User refresh failed', err);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('accessToken');
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
