import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="flex align-center justify-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <motion.div 
        className="glass-card" 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: '100%', maxWidth: '420px', padding: '40px', background: 'rgba(15, 23, 42, 0.6)' }}
      >
        <motion.div variants={itemVariants} className="flex align-center gap-10" style={{ justifyContent: 'center', marginBottom: '30px' }}>
          <div style={{ padding: '12px', background: 'var(--primary)', borderRadius: '14px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Vault<span style={{ color: 'var(--primary)' }}>X</span></h1>
        </motion.div>

        <motion.h2 variants={itemVariants} style={{ textAlign: 'center', marginBottom: '8px' }}>Secure Login</motion.h2>
        <motion.p variants={itemVariants} style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Decrypt your secure vault with your master password.
        </motion.p>

        <form onSubmit={handleSubmit}>
          <motion.div variants={itemVariants} className="input-group">
            <label><Mail size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={requires2FA}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="input-group">
            <label><Lock size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Master Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={requires2FA}
            />
          </motion.div>

          {requires2FA && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="input-group">
              <label>2FA Token</label>
              <input 
                type="text" 
                placeholder="000000" 
                required 
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                autoFocus
              />
            </motion.div>
          )}

          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }} 
            disabled={loading}
          >
            {loading ? 'Processing...' : (requires2FA ? 'Verify & Unlock' : 'Unlock Vault')}
            {!loading && <ArrowRight size={18} style={{ marginLeft: '10px' }} />}
          </motion.button>
        </form>

        <motion.div variants={itemVariants} style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have a vault? </span>
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>Create one</Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
