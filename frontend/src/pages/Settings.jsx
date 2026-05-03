import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Mail, Smartphone, AlertCircle, LogOut, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { user, logout } = useAuth();
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [totpToken, setTotpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5001' : '';

  const setup2FA = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/2fa/setup`);
      if (res.data.success) {
        setTwoFactorData(res.data);
        setShowSetup(true);
      }
    } catch (err) {
      toast.error('Failed to initiate 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/2fa/verify`, { token: totpToken });
      if (res.data.success) {
        toast.success('2FA enabled successfully!');
        setShowSetup(false);
        window.location.reload(); 
      }
    } catch (err) {
      toast.error('Invalid token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    const password = prompt('Please enter your master password to disable 2FA:');
    if (!password) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/2fa/disable`, { masterPassword: password });
      if (res.data.success) {
        toast.success('2FA has been disabled');
        window.location.reload();
      }
    } catch (err) {
      toast.error('Failed to disable 2FA. Check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container"
      style={{ paddingTop: '20px' }}
    >
      <header style={{ marginBottom: '40px' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Security Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure your vault's defensive layers.</p>
      </header>

      <div style={{ maxWidth: '900px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        {/* Account Control */}
        <motion.div whileHover={{ translateY: -5 }} className="glass-card" style={{ padding: '40px' }}>
          <div className="flex align-center gap-15 mb-30">
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '14px' }}>
              <Mail size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem' }}>Account</h3>
          </div>
          
          <div className="input-group">
            <label>Registered Email</label>
            <input type="text" value={user?.email || ''} disabled style={{ background: 'rgba(255,255,255,0.02)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn" 
            onClick={logout} 
            style={{ width: '100%', marginTop: '20px', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.1)' }}
          >
            <LogOut size={18} /> Terminate All Sessions
          </motion.button>
        </motion.div>

        {/* 2FA Control */}
        <motion.div whileHover={{ translateY: -5 }} className="glass-card" style={{ padding: '40px' }}>
          <div className="flex align-center gap-15 mb-30">
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', borderRadius: '14px' }}>
              <Smartphone size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem' }}>Multi-Factor Auth</h3>
          </div>

          <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
            <div className="flex align-center justify-between">
              <div>
                <p style={{ fontWeight: '700', color: user?.twoFactorEnabled ? 'var(--accent)' : 'white' }}>
                  {user?.twoFactorEnabled ? 'PROTECTED' : 'UNPROTECTED'}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Authenticator-based verification.
                </p>
              </div>
              {user?.twoFactorEnabled ? (
                <button className="btn" onClick={disable2FA} style={{ background: 'transparent', color: 'var(--danger)', fontWeight: '700' }}>Disable</button>
              ) : (
                !showSetup && <button className="btn btn-primary" onClick={setup2FA} style={{ padding: '8px 20px' }}>Setup</button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showSetup && twoFactorData && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: '30px', overflow: 'hidden' }}
              >
                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--primary)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '25px', background: 'white', padding: '15px', display: 'inline-block', borderRadius: '15px', boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)' }}>
                    <img src={twoFactorData.qrCode} alt="2FA" style={{ width: '180px', height: '180px' }} />
                  </div>
                  <input 
                    type="text" placeholder="000 000" maxLength="6"
                    value={totpToken} onChange={(e) => setTotpToken(e.target.value)}
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', marginBottom: '20px' }}
                  />
                  <div className="flex gap-10">
                    <button className="btn btn-primary" onClick={verify2FA} disabled={loading} style={{ flex: 2 }}>Enable Now</button>
                    <button className="btn" onClick={() => setShowSetup(false)} style={{ flex: 1, background: 'var(--glass)', color: 'white' }}>Exit</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Global Protection Note */}
        <motion.div whileHover={{ translateY: -5 }} className="glass-card" style={{ padding: '40px', gridColumn: '1 / -1', borderLeft: '6px solid var(--primary)' }}>
          <div className="flex align-center gap-15 mb-15">
            <AlertCircle size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '1.4rem' }}>Master Key Protocol</h3>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.8' }}>
            <p>VaultX utilizes <span style={{ color: 'white', fontWeight: 600 }}>Zero-Knowledge Proof</span> architecture. Your master password is the only key capable of unlocking your data.</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
              <div className="flex align-center gap-8" style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px' }}>
                <Key size={16} /> <span>AES-256-GCM Encrypted</span>
              </div>
              <div className="flex align-center gap-8" style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '12px' }}>
                <Shield size={16} /> <span>End-to-End Integrity</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;
