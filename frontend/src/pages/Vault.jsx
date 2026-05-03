import React, { useState, useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Copy, Eye, EyeOff, Edit2, Trash2, Globe, Lock, X, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Vault = () => {
  const { user } = useAuth();
  const { credentials, duplicates, fetchCredentials, addCredential, updateCredential, deleteCredential, loading } = useVault();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAllPasswords, setShowAllPasswords] = useState({});

  const [formData, setFormData] = useState({
    siteName: '', url: '', username: '', password: '', category: 'other', notes: ''
  });

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const handleOpenModal = (cred = null) => {
    if (cred) {
      setEditingCred(cred);
      setFormData({ siteName: cred.siteName, url: cred.url || '', username: cred.username, password: cred.password, category: cred.category, notes: cred.notes || '' });
    } else {
      setEditingCred(null);
      setFormData({ siteName: '', url: '', username: '', password: '', category: 'other', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCred) {
        await updateCredential(editingCred._id, formData);
        toast.success('Key Updated');
      } else {
        await addCredential(formData);
        toast.success('Key Secured');
      }
      setIsModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error occurred';
      toast.error(msg);
    }
  };

  const togglePassword = (id) => {
    setShowAllPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCredentials = credentials.filter(c => {
    const matchesSearch = c.siteName.toLowerCase().includes(search.toLowerCase()) || c.username.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['all', 'social', 'education', 'banking', 'work', 'other'];

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <header className="flex align-center justify-between" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Secure Vault</h1>
          <p style={{ color: 'var(--text-muted)' }}>{credentials.length} local records managed by SQL.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> <span style={{ marginLeft: '4px' }}>New Credential</span>
        </motion.button>
      </header>

      <div className="flex gap-20" style={{ marginBottom: '40px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by platform or username..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '48px', height: '54px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`btn ${filter === cat ? 'btn-primary' : ''}`}
              style={{ 
                background: filter === cat ? 'var(--primary)' : 'var(--glass)',
                color: filter === cat ? 'white' : 'var(--text-muted)',
                fontSize: '0.85rem',
                padding: '0 20px',
                textTransform: 'capitalize',
                border: filter === cat ? 'none' : '1px solid var(--glass-border)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: 600 }}>PLATFORM</th>
              <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: 600 }}>WHO CREATED</th>
              <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: 600 }}>CATEGORY</th>
              <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: 600 }}>KEY</th>
              <th style={{ padding: '20px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCredentials.length > 0 ? (
              filteredCredentials.map((cred) => (
                <tr key={cred._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.3s' }}>
                  <td style={{ padding: '20px' }}>
                    <div className="flex align-center gap-12">
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={16} color="var(--primary)" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{cred.siteName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div className="flex align-center gap-8" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <User size={14} /> {cred.userId || user?.email}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 10px', borderRadius: '12px', textTransform: 'capitalize' }}>
                      {cred.category}
                    </span>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div className="flex align-center gap-10">
                      <span style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: showAllPasswords[cred._id] ? 'normal' : '3px' }}>
                        {showAllPasswords[cred._id] ? cred.password : '••••••••'}
                      </span>
                      <button className="btn" onClick={() => togglePassword(cred._id)} style={{ padding: '4px', background: 'transparent', color: 'var(--text-muted)' }}>
                        {showAllPasswords[cred._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button className="btn" onClick={() => copyToClipboard(cred.password, 'Password')} style={{ padding: '4px', background: 'transparent', color: 'var(--primary)' }}><Copy size={14} /></button>
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div className="flex gap-8 justify-end">
                      <button className="btn" onClick={() => handleOpenModal(cred)} style={{ padding: '8px', background: 'var(--glass)' }}><Edit2 size={14} /></button>
                      <button className="btn" onClick={() => deleteCredential(cred._id)} style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No credentials found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '540px', padding: '50px', position: 'relative' }}
            >
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X /></button>
              
              <h2 style={{ fontSize: '2rem', marginBottom: '30px' }} className="text-gradient">
                {editingCred ? 'Modify Key' : 'Secure New Key'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="flex gap-20">
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Platform Name</label>
                    <input type="text" required placeholder="e.g. GitHub" value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label>Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {categories.filter(c => c !== 'all').map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Service URL</label>
                  <input type="url" placeholder="https://app.example.com" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                </div>

                <div className="input-group">
                  <label>Identity / Username</label>
                  <input type="text" required placeholder="user@example.com" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>

                <div className="input-group">
                  <label>Access Key / Password</label>
                  <input type="text" required placeholder="Create a strong key" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>

                <div className="flex justify-between gap-20" style={{ marginTop: '40px' }}>
                  <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white' }}>Discard</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingCred ? 'Sync Changes' : 'Secure Identity'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vault;
