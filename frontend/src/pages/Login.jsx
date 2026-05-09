import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, Mail, Lock, ArrowRight, Fingerprint, HelpCircle, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [mfaType, setMfaType] = useState('authenticator'); 
  const [question, setQuestion] = useState('');
  const [canFallback, setCanFallback] = useState(false);
  
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password, totp, securityAnswer);
      if (res.success) {
        toast.success('Access Granted');
        navigate('/');
      } else if (res.requiresTwoFactor) {
        setRequires2FA(true);
        setMfaType(res.twoFactorType || mfaType);
        if (res.question) setQuestion(res.question);
        if (res.canFallback) setCanFallback(true);
        
        if (res.message && res.message !== '2FA required') {
          toast.error(res.message);
        }
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleFallback = () => {
    setMfaType('security_question');
    setTotp('');
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
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '20px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}
          >
            <Fingerprint size={32} color="white" />
          </motion.div>

          <h1 className="text-gradient" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '12px', fontWeight: 800 }}>
            {requires2FA ? 'Security Check' : 'Welcome Back'}
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>
            {requires2FA ? 'Additional verification required.' : 'Securely access your encrypted vault.'}
          </p>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {!requires2FA ? (
                <motion.div key="auth-fields" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="input-group">
                    <label>ID / Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                      <input type="email" style={{ paddingLeft: '48px' }} placeholder="your@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Master Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                      <input type="password" style={{ paddingLeft: '48px' }} placeholder="••••••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="2fa-field" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {mfaType === 'authenticator' ? (
                    <div className="input-group">
                      <label className="flex justify-between">
                        <span>Authenticator App</span>
                        {canFallback && (
                          <button type="button" onClick={handleFallback} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer' }}>Try another way</button>
                        )}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Smartphone size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                        <input 
                          type="text" placeholder="000 000" required value={totp} onChange={(e) => setTotp(e.target.value)} autoFocus
                          style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', paddingLeft: '20px' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="input-group">
                      <label>Security Question</label>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        {question || "Loading question..."}
                      </p>
                      <div style={{ position: 'relative' }}>
                        <HelpCircle size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                        <input 
                          type="password" style={{ paddingLeft: '48px' }} placeholder="Your secret answer" required 
                          value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} autoFocus
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '18px', marginTop: '20px' }} 
              disabled={loading}
            >
              {loading ? 'Verifying...' : (requires2FA ? 'Verify & Unlock' : 'Unlock Vault')}
              <ArrowRight size={20} style={{ marginLeft: '12px' }} />
            </motion.button>
          </form>

          <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {requires2FA ? (
                <button onClick={() => setRequires2FA(false)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Back to Login</button>
              ) : (
                <>New to VaultX? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Create Account</Link></>
              )}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
