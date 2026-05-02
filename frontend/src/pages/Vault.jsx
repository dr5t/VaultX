import React, { useState, useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Copy, Eye, EyeOff, Edit2, Trash2, Globe, Lock, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CredentialCard = ({ credential, onEdit, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div className="flex align-center justify-between">
        <div className="flex align-center gap-10">
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={20} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem' }}>{credential.siteName}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {credential.url ? (
                <a href={credential.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {credential.url.replace('https://', '').replace('http://', '').split('/')[0]} <ExternalLink size={10} />
                </a>
              ) : 'No URL'}
            </p>
          </div>
        </div>
        <div className="flex gap-10">
          <button className="btn" onClick={() => onEdit(credential)} style={{ padding: '8px', background: 'var(--glass)' }}><Edit2 size={14} /></button>
          <button className="btn" onClick={() => onDelete(credential._id)} style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><Trash2 size={14} /></button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
        <div className="flex align-center justify-between mb-10" style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Username</span>
          <button className="btn" onClick={() => copyToClipboard(credential.username, 'Username')} style={{ padding: '4px', background: 'transparent', color: 'var(--primary)' }}><Copy size={12} /></button>
        </div>
        <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{credential.username}</p>
      </div>

      <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
        <div className="flex align-center justify-between" style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Password</span>
          <div className="flex gap-10">
            <button className="btn" onClick={() => setShowPassword(!showPassword)} style={{ padding: '4px', background: 'transparent', color: 'var(--text-muted)' }}>
              {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <button className="btn" onClick={() => copyToClipboard(credential.password, 'Password')} style={{ padding: '4px', background: 'transparent', color: 'var(--primary)' }}><Copy size={12} /></button>
          </div>
        </div>
        <p style={{ fontSize: '0.9rem', fontWeight: '500', letterSpacing: showPassword ? 'normal' : '3px' }}>
          {showPassword ? credential.password : '••••••••••••'}
        </p>
      </div>

      <div className="flex align-center justify-between" style={{ marginTop: '5px' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--glass)', padding: '4px 8px', borderRadius: '4px' }}>
          {credential.category || 'Other'}
        </span>
        {credential.isDuplicate && (
          <span style={{ fontSize: '0.7rem', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
            Duplicate Username
          </span>
        )}
      </div>
    </div>
  );
};

const Vault = () => {
  const { credentials, duplicates, fetchCredentials, addCredential, updateCredential, deleteCredential, loading } = useVault();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    siteName: '',
    url: '',
    username: '',
    password: '',
    category: 'other',
    notes: ''
  });

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleOpenModal = (cred = null) => {
    if (cred) {
      setEditingCred(cred);
      setFormData({
        siteName: cred.siteName,
        url: cred.url,
        username: cred.username,
        password: cred.password,
        category: cred.category,
        notes: cred.notes || ''
      });
    } else {
      setEditingCred(null);
      setFormData({
        siteName: '',
        url: '',
        username: '',
        password: '',
        category: 'other',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCred) {
        await updateCredential(editingCred._id, formData);
        toast.success('Credential updated');
      } else {
        await addCredential(formData);
        toast.success('Credential added');
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const filteredCredentials = credentials.filter(c => {
    const matchesSearch = c.siteName.toLowerCase().includes(search.toLowerCase()) || 
                         c.username.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.category === filter;
    return matchesSearch && matchesFilter;
  }).map(c => ({
    ...c,
    isDuplicate: duplicates.some(d => d.username === c.username)
  }));

  const categories = ['all', 'social', 'education', 'banking', 'work', 'custom', 'other'];

  return (
    <div style={{ paddingBottom: '50px' }}>
      <div className="flex align-center justify-between" style={{ marginBottom: '30px' }}>
        <div>
          <h1>My Vault</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and access your secure credentials.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add New Credential
        </button>
      </div>

      <div className="flex gap-20" style={{ marginBottom: '30px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by site or username..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className="btn"
              style={{ 
                background: filter === cat ? 'var(--primary)' : 'var(--glass)',
                color: filter === cat ? 'white' : 'var(--text-muted)',
                fontSize: '0.8rem',
                padding: '8px 16px',
                textTransform: 'capitalize'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading your secure data...</p>
      ) : filteredCredentials.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredCredentials.map(cred => (
            <CredentialCard 
              key={cred._id} 
              credential={cred} 
              onEdit={handleOpenModal} 
              onDelete={deleteCredential}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <Lock size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
          <h3>No credentials found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Start by adding your first password to the vault.</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => handleOpenModal()}>
            Add Now
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', padding: '20px' 
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '40px', position: 'relative' }}>
            <h2 style={{ marginBottom: '20px' }}>{editingCred ? 'Edit Credential' : 'Add New Credential'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="flex gap-20">
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Site Name</label>
                  <input 
                    type="text" required placeholder="e.g. Google"
                    value={formData.siteName}
                    onChange={e => setFormData({...formData, siteName: e.target.value})}
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Website URL</label>
                <input 
                  type="url" placeholder="https://google.com"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>Username / Email</label>
                <input 
                  type="text" required placeholder="yourname@email.com"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" required placeholder="Your secret password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-between" style={{ marginTop: '30px' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: 'var(--glass)' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCred ? 'Update Credential' : 'Save Credential'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vault;
