import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, User } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="flex align-center justify-between" style={{ padding: '20px 40px', borderBottom: '1px solid var(--glass-border)' }}>
      <div className="flex align-center gap-20" style={{ flex: 1 }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search vault..." 
            style={{ paddingLeft: '40px', background: 'var(--glass)' }}
          />
        </div>
      </div>

      <div className="flex align-center gap-20">
        <button className="btn" style={{ background: 'var(--glass)', padding: '10px' }}>
          <Bell size={20} />
        </button>
        <div className="flex align-center gap-10">
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.email?.[0].toUpperCase()}
          </div>
          <div style={{ display: 'none', md: 'block' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.email?.split('@')[0]}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pro Member</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
