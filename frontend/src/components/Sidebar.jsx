import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Shield, Zap, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'My Vault', icon: <Shield size={20} />, path: '/vault' },
    { name: 'Generator', icon: <Zap size={20} />, path: '/generator' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className="glass-card" style={{ 
      width: '260px', 
      height: '100vh', 
      position: 'fixed', 
      left: 0, 
      top: 0, 
      borderRadius: 0, 
      borderLeft: 'none', 
      borderTop: 'none', 
      borderBottom: 'none',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="flex align-center gap-10" style={{ marginBottom: '50px', padding: '0 10px' }}>
        <div style={{ padding: '8px', background: 'var(--primary)', borderRadius: '10px' }}>
          <Shield size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.5rem', letterSpacing: '1px' }}>Vault<span style={{ color: 'var(--primary)' }}>X</span></h2>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.name}
            to={item.path}
            className={({ isActive }) => `flex align-center gap-10 btn`}
            style={({ isActive }) => ({
              width: '100%',
              justifyContent: 'flex-start',
              marginBottom: '10px',
              background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent'
            })}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <button 
        className="flex align-center gap-10 btn" 
        onClick={logout}
        style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)', background: 'transparent' }}
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
