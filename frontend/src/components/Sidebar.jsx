import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Database, Key, Settings, LogOut, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Database size={20} />, label: 'Secure Vault', path: '/vault' },
    { icon: <Key size={20} />, label: 'Generator', path: '/generator' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      style={{ 
        width: '280px', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        zIndex: 100,
        background: 'rgba(2, 6, 23, 0.7)',
        backdropFilter: 'blur(30px)',
        borderRight: '1px solid var(--border)',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="flex align-center gap-15" style={{ marginBottom: '50px', padding: '0 12px' }}>
        <div style={{ padding: '10px', background: 'var(--primary)', borderRadius: '12px', boxShadow: '0 0 20px var(--primary-glow)' }}>
          <Shield size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Vault<span style={{ color: 'var(--primary)' }}>X</span></h2>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none' }}>
          {menuItems.map((item, idx) => (
            <motion.li 
              key={idx} 
              style={{ marginBottom: '8px' }}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <NavLink 
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'var(--transition)'
                })}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <button 
          onClick={logout}
          className="btn"
          style={{ 
            width: '100%', 
            justifyContent: 'flex-start', 
            background: 'rgba(239, 68, 68, 0.05)', 
            color: '#ef4444', 
            border: '1px solid rgba(239, 68, 68, 0.1)',
            padding: '14px 16px'
          }}
        >
          <LogOut size={20} /> <span style={{ marginLeft: '12px' }}>Secure Logout</span>
        </button>
        
        <div style={{ marginTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <p>© 2026 VaultX Security</p>
          <div className="flex justify-center gap-10" style={{ marginTop: '10px' }}>
            <Github size={14} style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
