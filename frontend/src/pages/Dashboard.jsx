import React, { useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { Shield, Key, AlertTriangle, Clock, Plus, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { credentials, duplicates, fetchCredentials, loading } = useVault();

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const stats = [
    { label: 'Vault Items', value: credentials.length, icon: <Key />, color: '#6366f1', trend: '+2 this week' },
    { label: 'Compromised', value: duplicates.length, icon: <AlertTriangle />, color: '#f59e0b', trend: 'Critical' },
    { label: 'Strength', value: '92%', icon: <Shield />, color: '#10b981', trend: 'Excellent' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="container"
      style={{ paddingTop: '20px' }}
    >
      {/* Header Section */}
      <header className="flex align-center justify-between" style={{ marginBottom: '50px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }} className="text-gradient">Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Welcome to your command center.</p>
        </div>
        <Link to="/vault" className="btn btn-primary" style={{ padding: '14px 28px' }}>
          <Plus size={20} /> <span style={{ marginLeft: '4px' }}>Add Credential</span>
        </Link>
      </header>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card"
            style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: stat.color }} />
            <div className="flex justify-between align-center mb-10">
              <div style={{ padding: '12px', background: `${stat.color}15`, color: stat.color, borderRadius: '12px' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: stat.color, background: `${stat.color}10`, padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <TrendingUp size={12} /> {stat.trend}
              </div>
            </div>
            <h2 style={{ fontSize: '2.8rem', margin: '15px 0' }}>{stat.value}</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card" 
          style={{ padding: '40px' }}
        >
          <div className="flex align-center gap-10 mb-30">
            <Activity size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '1.5rem' }}>Recent Vault Activity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {credentials.slice(0, 5).map((item, idx) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                style={{ 
                  padding: '20px', 
                  background: 'rgba(255,255,255,0.02)', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'between'
                }}
              >
                <div className="flex align-center gap-20" style={{ flex: 1 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.siteName[0]}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem' }}>{item.siteName}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.username}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} /> {new Date(item.lastAccessed).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card" 
          style={{ padding: '40px' }}
        >
          <h3 style={{ marginBottom: '25px' }}>Security Audit</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: '20px' }}>
              <div className="flex align-center gap-10 mb-10" style={{ color: '#f59e0b' }}>
                <AlertTriangle size={18} />
                <span style={{ fontWeight: 600 }}>Duplicate Detected</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {duplicates.length > 0 
                  ? `We found ${duplicates.length} accounts using identical usernames.` 
                  : "No duplicate usernames found. Good job!"}
              </p>
            </div>

            <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '20px' }}>
              <div className="flex align-center gap-10 mb-10" style={{ color: '#10b981' }}>
                <Shield size={18} />
                <span style={{ fontWeight: 600 }}>Zero-Knowledge Active</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                All your data is encrypted locally with AES-256 before leaving your machine.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
