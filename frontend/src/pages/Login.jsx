import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, Mail, Lock, ArrowRight, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        toast.success('Access Granted');
        navigate('/');
      } else if (res.requiresTwoFactor) {
        setRequires2FA(true);
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-center justify-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '480px', padding: '50px', position: 'relative', overflow: 'hidden' }}
      >
        {/* Animated Background Accent */}
        <div style={{ 
          position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', 
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '20px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}
          >
            <Fingerprint size={32} color="white" />
          </motion.div>

          <h1 className="text-gradient" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '12px', fontWeight: 800 }}>
            Welcome Back
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1rem' }}>
            Securely access your encrypted vault.
          </p>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {!requires2FA ? (
                <motion.div
                  key="auth-fields"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="input-group">
                    <label>ID / Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                      <input 
                        type="email" 
                        style={{ paddingLeft: '48px' }}
                        placeholder="your@email.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Master Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        style={{ paddingLeft: '48px' }}
                        placeholder="••••••••••••" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="2fa-field"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="input-group">
                    <label>Verification Token</label>
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit code" 
                      required 
                      value={totp}
                      onChange={(e) => setTotp(e.target.value)}
                      autoFocus
                      style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 700 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ textAlign: 'right', marginBottom: '20px' }}>
              <Link to="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                Forgot Master Password?
              </Link>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '18px', marginTop: '10px' }} 
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (requires2FA ? 'Confirm Identity' : 'Unlock Vault')}
              <ArrowRight size={20} style={{ marginLeft: '12px' }} />
            </motion.button>
          </form>

          <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>New to VaultX? </span>
            <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Create Account</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
