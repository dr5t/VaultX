import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Mail, Smartphone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useAuth();
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [totpToken, setTotpToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const setup2FA = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/2fa/setup');
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
      const res = await axios.post('http://localhost:5000/api/auth/2fa/verify', { token: totpToken });
      if (res.data.success) {
        toast.success('2FA enabled successfully!');
        setShowSetup(false);
        // In a real app, you'd want to refresh the user state here
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
      const res = await axios.post('http://localhost:5000/api/auth/2fa/disable', { masterPassword: password });
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
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '10px' }}>Settings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Manage your account and security preferences.</p>

      <div className="flex gap-20" style={{ flexDirection: 'column' }}>
        {/* Account Info */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <div className="flex align-center gap-10" style={{ marginBottom: '20px' }}>
            <Mail size={20} color="var(--primary)" />
            <h3>Account Information</h3>
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="text" value={user?.email || ''} disabled style={{ background: 'var(--glass)' }} />
          </div>
          <button className="btn" onClick={logout} style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
            Logout from all sessions
          </button>
        </div>

        {/* Security / 2FA */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <div className="flex align-center gap-10" style={{ marginBottom: '20px' }}>
            <Shield size={20} color="var(--accent)" />
            <h3>Two-Factor Authentication (2FA)</h3>
          </div>
          
          <div className="flex align-center justify-between" style={{ padding: '20px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div className="flex align-center gap-10">
              <Smartphone size={24} color={user?.twoFactorEnabled ? 'var(--accent)' : 'var(--text-muted)'} />
              <div>
                <p style={{ fontWeight: '600' }}>Authenticator App</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {user?.twoFactorEnabled ? 'Your account is protected with 2FA.' : 'Add an extra layer of security to your account.'}
                </p>
              </div>
            </div>
            {user?.twoFactorEnabled ? (
              <button className="btn" onClick={disable2FA} style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}>Disable</button>
            ) : (
              !showSetup && <button className="btn btn-primary" onClick={setup2FA}>Enable 2FA</button>
            )}
          </div>

          {showSetup && twoFactorData && (
            <div className="animate-fade-in" style={{ marginTop: '30px', padding: '20px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
              <h4>Setup 2FA</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '10px 0 20px' }}>
                1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              
              <div style={{ textAlign: 'center', marginBottom: '20px', background: 'white', padding: '10px', display: 'inline-block', borderRadius: '10px' }}>
                <img src={twoFactorData.qrCode} alt="2FA QR Code" style={{ width: '200px', height: '200px' }} />
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                2. Enter the 6-digit code from your app:
              </p>
              
              <div className="flex gap-10">
                <input 
                  type="text" 
                  placeholder="000000" 
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  style={{ maxWidth: '200px' }}
                />
                <button className="btn btn-primary" onClick={verify2FA} disabled={loading}>
                  Verify & Enable
                </button>
                <button className="btn" onClick={() => setShowSetup(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Master Password Note */}
        <div className="glass-card" style={{ padding: '30px', borderLeft: '4px solid var(--warning)' }}>
          <div className="flex align-center gap-10" style={{ marginBottom: '10px' }}>
            <AlertCircle size={20} color="var(--warning)" />
            <h3 style={{ color: 'var(--warning)' }}>Master Password Recovery</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            VaultX uses zero-knowledge encryption. We do not store your master password. If you lose it, we <strong>cannot</strong> recover your data or reset your password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
