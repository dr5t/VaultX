import React, { useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { Shield, Key, AlertTriangle, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card" 
    style={{ padding: '24px', flex: 1 }}
  >
    <div className="flex align-center justify-between mb-10">
      <div style={{ padding: '10px', background: `${color}20`, color: color, borderRadius: '10px' }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live</span>
    </div>
    <h3 style={{ fontSize: '2rem', margin: '10px 0' }}>{value}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{title}</p>
  </motion.div>
);

const Dashboard = () => {
  const { credentials, duplicates, fetchCredentials, loading } = useVault();

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const recentItems = [...credentials]
    .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
    .slice(0, 5);

  return (
    <div>
      <div className="flex align-center justify-between" style={{ marginBottom: '30px' }}>
        <div>
          <h1>Security Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Vault health and activity status.</p>
        </div>
        <Link to="/vault" className="btn btn-primary">
          <Plus size={18} /> New Item
        </Link>
      </div>

      <div className="flex gap-20" style={{ marginBottom: '40px' }}>
        <StatCard 
          title="Total Credentials" 
          value={credentials.length} 
          icon={<Key size={24} />} 
          color="#6366f1"
          delay={0.1}
        />
        <StatCard 
          title="Duplicate Usernames" 
          value={duplicates.length} 
          icon={<AlertTriangle size={24} />} 
          color="#f59e0b"
          delay={0.2}
        />
        <StatCard 
          title="Security Health" 
          value={credentials.length > 0 ? "85%" : "N/A"} 
          icon={<Shield size={24} />} 
          color="#10b981"
          delay={0.3}
        />
      </div>

      <div className="flex gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card" 
          style={{ flex: 2, padding: '30px' }}
        >
          <div className="flex align-center justify-between" style={{ marginBottom: '20px' }}>
            <h3>Recent Activity</h3>
            <Link to="/vault" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}>View Vault</Link>
          </div>
          
          {loading ? (
            <p>Scanning vault...</p>
          ) : recentItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {recentItems.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1) }}
                  key={item._id} 
                  className="flex align-center justify-between" 
                  style={{ padding: '16px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                >
                  <div className="flex align-center gap-10">
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Key size={18} color="var(--primary)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: '600' }}>{item.siteName}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.username}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={12} />
                      {new Date(item.lastAccessed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>Your vault is empty. Secure your first password today!</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card" 
          style={{ flex: 1, padding: '30px' }}
        >
          <h3>Security Insights</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: <Shield size={20} />, text: "2FA is active. Your account is 2x safer.", color: "var(--accent)" },
              { icon: <AlertTriangle size={20} />, text: `${duplicates.length} duplicate usernames detected.`, color: "var(--warning)" },
              { icon: <Key size={20} />, text: "Use the 3D generator for unhackable keys.", color: "var(--primary)" }
            ].map((tip, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (i * 0.1) }}
                className="flex gap-10"
              >
                <div style={{ color: tip.color, flexShrink: 0 }}>{tip.icon}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{tip.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
