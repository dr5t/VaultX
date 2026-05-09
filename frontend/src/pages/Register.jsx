import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, Mail, Lock, ArrowRight, UserPlus, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let s = 0;
    if (password.length > 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    setStrength(s);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (strength < 2) {
      return toast.error('Please use a stronger master password');
    }
    setLoading(true);
    try {
      const res = await register(email, password);
      if (res.success) {
        toast.success('Vault Created Successfully!');
        navigate('/');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="flex align-center justify-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '500px', padding: '50px', position: 'relative' }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '20px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}
        >
          <UserPlus size={32} color="white" />
        </motion.div>

        <h1 className="text-gradient" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '12px', fontWeight: 800 }}>
          Initialize Vault
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1rem' }}>
          Create your zero-knowledge encrypted storage.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Master Identity (Email)</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                style={{ paddingLeft: '48px' }}
                placeholder="identity@vaultx.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label>Master Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                style={{ paddingLeft: '48px' }}
                placeholder="Choose a strong key" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {}
          <div className="flex gap-5" style={{ marginBottom: '25px', height: '4px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: '10px', background: i < strength ? strengthColors[strength - 1] : 'var(--glass)', transition: 'all 0.3s' }} />
            ))}
          </div>

          <div className="input-group">
            <label>Confirm Master Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                style={{ paddingLeft: '48px' }}
                placeholder="Verify your key" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            <div className="flex align-center gap-8" style={{ fontSize: '0.75rem', color: password.length >= 8 ? 'var(--accent)' : 'var(--text-muted)' }}>
              {password.length >= 8 ? <CheckCircle2 size={12} /> : <Circle size={12} />} 8+ Characters
            </div>
            <div className="flex align-center gap-8" style={{ fontSize: '0.75rem', color: strength >= 3 ? 'var(--accent)' : 'var(--text-muted)' }}>
              {strength >= 3 ? <CheckCircle2 size={12} /> : <Circle size={12} />} Complexity
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '18px', position: 'relative', overflow: 'hidden' }} 
            disabled={loading}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Securing Vault...
                </motion.span>
              ) : (
                <motion.span key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Begin Encryption <ArrowRight size={20} style={{ marginLeft: '12px' }} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have a vault? </span>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Secure Login</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
