import React, { useState, useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { Plus, Search, Copy, Eye, EyeOff, Edit2, Trash2, Globe, Lock, ExternalLink, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CredentialCard = ({ credential, onEdit, onDelete, index }) => {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ translateY: -5 }}
      className="glass-card" 
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}
    >
      <div className="flex align-center justify-between">
        <div className="flex align-center gap-12">
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
            <Globe size={22} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{credential.siteName}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {credential.url ? (
                <a href={credential.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {credential.url.replace('https://', '').replace('http://', '').split('/')[0]} <ExternalLink size={12} />
                </a>
              ) : 'No URL'}
            </p>
          </div>
        </div>
        <div className="flex gap-8">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn" onClick={() => onEdit(credential)} style={{ padding: '8px', background: 'var(--glass)', color: 'var(--text-main)' }}><Edit2 size={14} /></motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn" onClick={() => onDelete(credential._id)} style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><Trash2 size={14} /></motion.button>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
        <div className="flex align-center justify-between mb-8">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Username</span>
          <button className="btn" onClick={() => copyToClipboard(credential.username, 'Username')} style={{ padding: '4px', background: 'transparent', color: 'var(--primary)' }}><Copy size={14} /></button>
        </div>
        <p style={{ fontSize: '1rem', fontWeight: '500' }}>{credential.username}</p>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
        <div className="flex align-center justify-between mb-8">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Password</span>
          <div className="flex gap-10">
            <button className="btn" onClick={() => setShowPassword(!showPassword)} style={{ padding: '4px', background: 'transparent', color: 'var(--text-muted)' }}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button className="btn" onClick={() => copyToClipboard(credential.password, 'Password')} style={{ padding: '4px', background: 'transparent', color: 'var(--primary)' }}><Copy size={14} /></button>
          </div>
        </div>
        <p style={{ fontSize: '1rem', fontWeight: '500', letterSpacing: showPassword ? 'normal' : '4px' }}>
          {showPassword ? credential.password : '••••••••••••'}
        </p>
      </div>

      <div className="flex align-center gap-8">
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)', textTransform: 'capitalize' }}>
          {credential.category || 'Other'}
        </span>
        {credential.isDuplicate && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            Duplicate Identity
          </span>
        )}
      </div>
    </motion.div>
  );
};

const Vault = () => {
  const { credentials, duplicates, fetchCredentials, addCredential, updateCredential, deleteCredential, loading } = useVault();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    siteName: '', url: '', username: '', password: '', category: 'other', notes: ''
  });

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleOpenModal = (cred = null) => {
    if (cred) {
      setEditingCred(cred);
      setFormData({ siteName: cred.siteName, url: cred.url, username: cred.username, password: cred.password, category: cred.category, notes: cred.notes || '' });
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
      const msg = err.response?.data?.message || err.message || 'Encryption failed';
      toast.error(msg);
    }
  };

  const filteredCredentials = credentials.filter(c => {
    const matchesSearch = c.siteName.toLowerCase().includes(search.toLowerCase()) || c.username.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.category === filter;
    return matchesSearch && matchesFilter;
  }).map(c => ({
    ...c,
    isDuplicate: duplicates.some(d => d.username === c.username)
  }));

  const categories = ['all', 'social', 'education', 'banking', 'work', 'custom', 'other'];

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <header className="flex align-center justify-between" style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Secure Vault</h1>
          <p style={{ color: 'var(--text-muted)' }}>{credentials.length} items currently encrypted.</p>
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
            placeholder="Find a credential..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '48px', height: '54px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {categories.map(cat => (
            <motion.button 
              key={cat}
              onClick={() => setFilter(cat)}
              className="btn"
              whileHover={{ scale: 1.05 }}
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
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Syncing with cloud...</motion.p>
        ) : filteredCredentials.length > 0 ? (
          <motion.div 
            layout
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}
          >
            {filteredCredentials.map((cred, i) => (
              <CredentialCard 
                key={cred._id} 
                index={i}
                credential={cred} 
                onEdit={handleOpenModal} 
                onDelete={deleteCredential}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={40} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem' }}>No credentials found</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Start your journey by securing your first account.</p>
            <button className="btn btn-primary" style={{ marginTop: '30px' }} onClick={() => handleOpenModal()}>
              Add Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ultra-Premium Modal */}
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
