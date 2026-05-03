const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

const router = express.Router();

// Helper for password hashing (since bcrypt was removed)
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [salt, hash] = storedHash.split(':');
  const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === checkHash;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, masterPassword } = req.body;
    const db = req.db;

    if (!email || !masterPassword) {
      return res.status(400).json({ success: false, message: 'Email and master password required' });
    }

    const userRef = db.collection('users').doc(email.toLowerCase());
    const doc = await userRef.get();

    if (doc.exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const masterPasswordHash = hashPassword(masterPassword);
    
    await userRef.set({
      email: email.toLowerCase(),
      masterPasswordHash,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      createdAt: new Date().toISOString()
    });

    const accessToken = jwt.sign({ id: email.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: email.toLowerCase() }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await userRef.update({ refreshToken });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).status(201).json({
      success: true,
      accessToken,
      user: { id: email.toLowerCase(), email, twoFactorEnabled: false }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    require('fs').appendFileSync('error.log', `[${new Date().toISOString()}] ${err.stack}\n`);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, masterPassword, totpToken } = req.body;
    const db = req.db;

    const userRef = db.collection('users').doc(email.toLowerCase());
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = doc.data();
    if (!verifyPassword(masterPassword, user.masterPasswordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.twoFactorEnabled) {
      if (!totpToken) {
        return res.status(200).json({ success: false, requiresTwoFactor: true, message: '2FA token required' });
      }
      const valid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: totpToken,
        window: 1,
      });
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid 2FA token' });
      }
    }

    const accessToken = jwt.sign({ id: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await userRef.update({ refreshToken });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      success: true,
      accessToken,
      user: { id: user.email, email: user.email, twoFactorEnabled: user.twoFactorEnabled }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Other routes (refresh, logout, etc) will be migrated similarly
// ...

// POST /api/auth/2fa/setup
router.post('/2fa/setup', require('../middleware/auth').protect, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `VaultX (${req.user.email})` });
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
    // Store secret temporarily or just return it for the user to verify
    // For now, we'll store it in a pending state or just let the user verify it
    res.json({ success: true, secret: secret.base32, qrCode });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/2fa/verify
router.post('/2fa/verify', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { token, secret } = req.body;
    const valid = speakeasy.totp.verify({
      secret: secret || req.user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (valid) {
      await req.db.collection('users').doc(req.user.id).update({
        twoFactorEnabled: true,
        twoFactorSecret: secret || req.user.twoFactorSecret,
        twoFactorType: 'authenticator'
      });
      res.json({ success: true, message: '2FA enabled' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid token' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/2fa/security-questions/setup
router.post('/2fa/security-questions/setup', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const answerHash = hashPassword(answer.toLowerCase().trim());
    
    await req.db.collection('users').doc(req.user.id).update({
      twoFactorEnabled: true,
      twoFactorType: 'security_question',
      securityQuestion: question,
      securityAnswerHash: answerHash
    });
    
    res.json({ success: true, message: 'Security question set' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/2fa/disable
router.post('/2fa/disable', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { masterPassword } = req.body;
    if (!verifyPassword(masterPassword, req.user.masterPasswordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid master password' });
    }

    await req.db.collection('users').doc(req.user.id).update({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      securityAnswerHash: null
    });
    res.json({ success: true, message: '2FA disabled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/recover
router.post('/recover', async (req, res) => {
  try {
    const { email, question, answer } = req.body;
    const db = req.db;

    const userRef = db.collection('users').doc(email.toLowerCase());
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = doc.data();
    if (user.twoFactorType !== 'security_question' || user.securityQuestion !== question) {
      return res.status(400).json({ success: false, message: 'Recovery not available or question mismatch' });
    }

    if (!verifyPassword(answer.toLowerCase().trim(), user.securityAnswerHash)) {
      return res.status(401).json({ success: false, message: 'Incorrect answer' });
    }

    // If verified, we can't show the password (it's hashed), but we can allow a reset
    // Or, for this specific request "show the password", we'll just return success for now 
    // and the frontend can handle the reset flow.
    res.json({ success: true, message: 'Identity verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
