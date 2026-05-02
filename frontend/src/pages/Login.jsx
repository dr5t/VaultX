import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password, totp);
      if (res.success) {
        toast.success('Welcome back!');
        navigate('/');
      } else if (res.requiresTwoFactor) {
        setRequires2FA(true);
        toast.error('2FA token required');
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-center justify-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div className="flex align-center gap-10" style={{ justifyContent: 'center', marginBottom: '30px' }}>
          <div style={{ padding: '10px', background: 'var(--primary)', borderRadius: '12px' }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem' }}>Vault<span style={{ color: 'var(--primary)' }}>X</span></h1>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Secure Login</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Enter your master password to decrypt your vault.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><Mail size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={requires2FA}
            />
          </div>

          <div className="input-group">
            <label><Lock size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Master Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={requires2FA}
            />
          </div>

          {requires2FA && (
            <div className="input-group animate-fade-in">
              <label>2FA Token</label>
              <input 
                type="text" 
                placeholder="000000" 
                required 
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? 'Processing...' : (requires2FA ? 'Verify & Unlock' : 'Unlock Vault')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have a vault? </span>
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
