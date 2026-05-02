import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, Mail, Lock, CheckCircle } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 8) {
      return toast.error('Master password must be at least 8 characters');
    }

    setLoading(true);
    try {
      const res = await register(email, password);
      if (res.success) {
        toast.success('Vault created successfully!');
        navigate('/');
      } else {
        toast.error(res.message || 'Registration failed');
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

        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Create Your Vault</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Your master password is the only key to your data. **Don't lose it.**
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
            />
          </div>

          <div className="input-group">
            <label><Lock size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Confirm Master Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? 'Creating Vault...' : 'Create Secure Vault'}
            {!loading && <CheckCircle size={18} style={{ marginLeft: '8px' }} />}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have a vault? </span>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
