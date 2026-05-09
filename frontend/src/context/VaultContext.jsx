import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { encryptData, decryptData } from '../utils/crypto';

const VaultContext = createContext();
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001/api/credentials' 
  : '/api/credentials';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  console.log('🔑 Attaching token:', token ? 'Exists' : 'MISSING');
  return { Authorization: `Bearer ${token}` };
};

export const VaultProvider = ({ children }) => {
  const { encryptionKey } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCredentials = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { 
        params,
        headers: getAuthHeaders()
      });
      if (res.data.success) {
        const decryptedCredentials = await Promise.all(res.data.credentials.map(async (cred) => {
          try {
            if (encryptionKey) {
              const decryptedPassword = await decryptData(cred.password, encryptionKey);
              return { ...cred, password: decryptedPassword };
            }
          } catch (e) {
            console.warn('Failed to decrypt credential:', cred.siteName, e);
          }
          return cred;
        }));
        setCredentials(decryptedCredentials);
        setDuplicates(res.data.duplicates);
      }
    } catch (err) {
      console.error('Fetch credentials error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCredential = async (data) => {
    let payload = { ...data };
    if (encryptionKey) {
      payload.password = await encryptData(data.password, encryptionKey);
    }
    const res = await axios.post(API_URL, payload, {
      headers: getAuthHeaders()
    });
    if (res.data.success) {
      setCredentials((prev) => [...prev, { ...res.data.credential, password: data.password }]);
    }
    return res.data;
  };

  const updateCredential = async (id, data) => {
    let payload = { ...data };
    if (encryptionKey) {
      payload.password = await encryptData(data.password, encryptionKey);
    }
    const res = await axios.put(`${API_URL}/${id}`, payload, {
      headers: getAuthHeaders()
    });
    if (res.data.success) {
      setCredentials((prev) => 
        prev.map((c) => (c._id === id ? { ...res.data.credential, password: data.password } : c))
      );
    }
    return res.data;
  };

  const deleteCredential = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeaders()
    });
    if (res.data.success) {
      setCredentials((prev) => prev.filter((c) => c._id !== id));
    }
    return res.data;
  };

  return (
    <VaultContext.Provider value={{ 
      credentials, 
      duplicates, 
      loading, 
      fetchCredentials, 
      addCredential, 
      updateCredential, 
      deleteCredential 
    }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);
