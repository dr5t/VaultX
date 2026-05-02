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

module.exports = router;
