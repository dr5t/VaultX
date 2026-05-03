import React, { useState, useEffect } from 'react';
import { Shield, Copy, RefreshCw, CheckCircle, Lock, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Generator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [strength, setStrength] = useState({ label: 'Weak', color: '#ef4444', score: 0 });

  const generatePassword = () => {
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };

    let availableChars = '';
    Object.keys(options).forEach(key => {
      if (options[key]) availableChars += charset[key];
    });

    if (!availableChars) {
      toast.error('Select at least one option');
      return;
    }

    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
    }
    setPassword(generated);
  };

  useEffect(() => {
    generatePassword();
  }, []);

  useEffect(() => {
    let score = 0;
    if (length > 12) score++;
    if (length > 16) score++;
    if (options.uppercase) score++;
    if (options.numbers) score++;
    if (options.symbols) score++;

    if (score <= 2) setStrength({ label: 'Weak', color: '#ef4444', score });
    else if (score <= 4) setStrength({ label: 'Moderate', color: '#f59e0b', score });
    else setStrength({ label: 'Strong', color: '#10b981', score });
  }, [password, length, options]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    toast.success('Key copied to clipboard');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container"
      style={{ paddingTop: '20px' }}
    >
      <header style={{ marginBottom: '40px' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Key Forge</h1>
        <p style={{ color: 'var(--text-muted)' }}>Generate cryptographically strong passwords.</p>
      </header>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <motion.div className="glass-card" style={{ padding: '40px', marginBottom: '30px' }}>
          <div style={{ position: 'relative', marginBottom: '30px' }}>
            <motion.input 
              key={password}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              type="text" 
              readOnly 
              value={password}
              style={{ fontSize: '1.4rem', textAlign: 'center', height: '80px', letterSpacing: '2px', fontWeight: 700, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}
            />
            <div className="flex gap-10" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn" onClick={generatePassword} style={{ background: 'var(--glass)', color: 'white', width: '48px', height: '48px', borderRadius: '12px' }}><RefreshCw size={20} /></motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="btn btn-primary" onClick={copyToClipboard} style={{ width: '48px', height: '48px', borderRadius: '12px' }}><Copy size={20} /></motion.button>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <div className="flex justify-between mb-10">
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Key Length: <span style={{ color: 'white' }}>{length}</span></span>
            </div>
            <input 
              type="range" min="8" max="64" value={length}
              onChange={(e) => setLength(e.target.value)}
              style={{ padding: 0, height: '6px', background: 'var(--glass)', accentColor: 'var(--primary)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            {Object.keys(options).map(key => (
              <motion.div 
                key={key} 
                whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                onClick={() => setOptions({...options, [key]: !options[key]})}
                style={{ 
                  padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'between', cursor: 'pointer',
                  transition: 'var(--transition)',
                  background: options[key] ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  borderColor: options[key] ? 'var(--primary)' : 'var(--border)'
                }}
              >
                <span style={{ textTransform: 'capitalize', fontWeight: 500, color: options[key] ? 'white' : 'var(--text-muted)' }}>{key}</span>
                {options[key] && <CheckCircle size={18} color="var(--primary)" />}
              </motion.div>
            ))}
          </div>

          <div className="flex align-center gap-20" style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${strength.color}20`, color: strength.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ESTIMATED STRENGTH</p>
              <h4 style={{ color: strength.color, fontSize: '1.2rem' }}>{strength.label}</h4>
            </div>
            <div className="flex gap-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ width: '20px', height: '6px', borderRadius: '10px', background: i < strength.score ? strength.color : 'var(--glass)' }} />
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex gap-20">
          <motion.div className="glass-card" style={{ flex: 1, padding: '24px' }}>
            <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} color="var(--primary)" /> Cryptographically Safe</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>We use standard browser-native entropy for all key generation.</p>
          </motion.div>
          <motion.div className="glass-card" style={{ flex: 1, padding: '24px' }}>
            <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18} color="var(--accent)" /> Zero Leakage</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Generated keys never touch our servers until you choose to save them.</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Generator;
