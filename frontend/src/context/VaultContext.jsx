import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const VaultContext = createContext();
const API_URL = 'http://localhost:5000/api/credentials';

export const VaultProvider = ({ children }) => {
  const [credentials, setCredentials] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCredentials = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { params });
      if (res.data.success) {
        setCredentials(res.data.credentials);
        setDuplicates(res.data.duplicates);
      }
    } catch (err) {
      console.error('Fetch credentials error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCredential = async (data) => {
    const res = await axios.post(API_URL, data);
    if (res.data.success) {
      setCredentials((prev) => [...prev, res.data.credential]);
    }
    return res.data;
  };

  const updateCredential = async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    if (res.data.success) {
      setCredentials((prev) => 
        prev.map((c) => (c._id === id ? res.data.credential : c))
      );
    }
    return res.data;
  };

  const deleteCredential = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
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
