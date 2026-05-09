import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-center justify-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-card" 
        style={{ width: '100%', maxWidth: '480px', padding: '50px' }}
      >
        <Link to="/login" className="flex align-center gap-10" style={{ color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '30px', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <h1 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Recover Vault</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
          {sent 
            ? "Check your inbox for instructions to reset your master password." 
            : "Enter your email and we'll send you a secure recovery link."}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
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

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '18px' }} 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Recovery Link'}
              <Send size={18} style={{ marginLeft: '10px' }} />
            </motion.button>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', marginBottom: '30px' }}>
              <p>Email sent! Please check your spam folder if you don't see it within a few minutes.</p>
            </div>
            <button onClick={() => setSent(false)} className="btn" style={{ width: '100%', background: 'var(--glass)', color: 'white' }}>
              Try another email
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
