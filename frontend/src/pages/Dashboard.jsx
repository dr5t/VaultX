import React, { useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { Shield, Key, AlertTriangle, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card" style={{ padding: '24px', flex: 1 }}>
    <div className="flex align-center justify-between mb-10">
      <div style={{ padding: '10px', background: `${color}20`, color: color, borderRadius: '10px' }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Updated just now</span>
    </div>
    <h3 style={{ fontSize: '1.8rem', margin: '10px 0' }}>{value}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{title}</p>
  </div>
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
          <p style={{ color: 'var(--text-muted)' }}>Welcome back to your secure vault.</p>
        </div>
        <Link to="/vault" className="btn btn-primary">
          <Plus size={18} /> Add New
        </Link>
      </div>

      <div className="flex gap-20" style={{ marginBottom: '40px' }}>
        <StatCard 
          title="Total Passwords" 
          value={credentials.length} 
          icon={<Key size={24} />} 
          color="#6366f1" 
        />
        <StatCard 
          title="Duplicate Usernames" 
          value={duplicates.length} 
          icon={<AlertTriangle size={24} />} 
          color="#f59e0b" 
        />
        <StatCard 
          title="Health Score" 
          value={credentials.length > 0 ? "85%" : "N/A"} 
          icon={<Shield size={24} />} 
          color="#10b981" 
        />
      </div>

      <div className="flex gap-20">
        <div className="glass-card" style={{ flex: 2, padding: '30px' }}>
          <div className="flex align-center justify-between" style={{ marginBottom: '20px' }}>
            <h3>Recent Access</h3>
            <Link to="/vault" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none' }}>View All</Link>
          </div>
          
          {loading ? (
            <p>Loading...</p>
          ) : recentItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {recentItems.map((item) => (
                <div key={item._id} className="flex align-center justify-between" style={{ padding: '12px', background: 'var(--glass)', borderRadius: '12px' }}>
                  <div className="flex align-center gap-10">
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Key size={18} color="var(--primary)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: '600' }}>{item.siteName}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.username}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {new Date(item.lastAccessed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No activity yet.</p>
          )}
        </div>

        <div className="glass-card" style={{ flex: 1, padding: '30px' }}>
          <h3>Security Tips</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="flex gap-10">
              <div style={{ color: 'var(--accent)' }}><Shield size={20} /></div>
              <p style={{ fontSize: '0.85rem' }}>Enable 2FA in settings for an extra layer of protection.</p>
            </div>
            <div className="flex gap-10">
              <div style={{ color: 'var(--warning)' }}><AlertTriangle size={20} /></div>
              <p style={{ fontSize: '0.85rem' }}>You have {duplicates.length} duplicate usernames. Consider using unique ones.</p>
            </div>
            <div className="flex gap-10">
              <div style={{ color: 'var(--primary)' }}><Key size={20} /></div>
              <p style={{ fontSize: '0.85rem' }}>Use the password generator for complex, unhackable passwords.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
