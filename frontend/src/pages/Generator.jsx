import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, ShieldCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Generator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'var(--danger)' });

  const generatePassword = () => {
    let charset = '';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (charset === '') {
      toast.error('Please select at least one option');
      return;
    }

    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(generated);
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  useEffect(() => {
    calculateStrength();
  }, [password]);

  const calculateStrength = () => {
    let score = 0;
    if (password.length > 8) score++;
    if (password.length > 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 3) setStrength({ score, label: 'Weak', color: 'var(--danger)' });
    else if (score < 5) setStrength({ score, label: 'Medium', color: 'var(--warning)' });
    else setStrength({ score, label: 'Strong', color: 'var(--accent)' });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    toast.success('Password copied!');
  };

  return (
    <div className="flex align-center justify-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Password Generator</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>
          Create secure, random passwords to stay protected.
        </p>

        <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '30px' }}>
          <div className="flex align-center justify-between">
            <h2 style={{ fontSize: '1.4rem', letterSpacing: '1px', wordBreak: 'break-all' }}>{password}</h2>
            <div className="flex gap-10">
              <button className="btn" onClick={generatePassword} style={{ background: 'var(--glass)', padding: '8px' }}><RefreshCw size={20} /></button>
              <button className="btn btn-primary" onClick={copyToClipboard} style={{ padding: '8px' }}><Copy size={20} /></button>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div className="flex justify-between mb-10" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Strength: <span style={{ color: strength.color, fontWeight: 'bold' }}>{strength.label}</span></span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{strength.score}/5</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--glass)', borderRadius: '3px' }}>
              <div style={{ 
                width: `${(strength.score / 5) * 100}%`, 
                height: '100%', 
                background: strength.color, 
                borderRadius: '3px',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          </div>
        </div>

        <div className="input-group">
          <div className="flex justify-between" style={{ marginBottom: '10px' }}>
            <label>Password Length</label>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{length}</span>
          </div>
          <input 
            type="range" min="8" max="64" 
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            style={{ padding: 0, height: '6px', background: 'var(--glass)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {Object.keys(options).map((opt) => (
            <label key={opt} className="flex align-center gap-10" style={{ cursor: 'pointer', padding: '12px', background: 'var(--glass)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
              <input 
                type="checkbox" 
                checked={options[opt]}
                onChange={() => setOptions({...options, [opt]: !options[opt]})}
                style={{ width: '20px', height: '20px' }}
              />
              <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{opt}</span>
            </label>
          ))}
        </div>

        <div style={{ marginTop: '40px', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ShieldCheck size={24} color="var(--accent)" />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
            This password is generated locally on your device and is never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Generator;
