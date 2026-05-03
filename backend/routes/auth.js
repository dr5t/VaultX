const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { get, run } = require('../db/database');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper for password hashing
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
    if (!email || !masterPassword) {
      return res.status(400).json({ success: false, message: 'Email and master password required' });
    }

    const existingUser = await get('SELECT email FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const masterPasswordHash = hashPassword(masterPassword);
    
    await run(
      'INSERT INTO users (email, masterPasswordHash) VALUES (?, ?)',
      [email.toLowerCase(), masterPasswordHash]
    );

    const accessToken = jwt.sign({ id: email.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: email.toLowerCase() }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await run('UPDATE users SET refreshToken = ? WHERE email = ?', [refreshToken, email.toLowerCase()]);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).status(201).json({
      success: true,
      accessToken,
      user: { id: email.toLowerCase(), email: email.toLowerCase(), twoFactorEnabled: false }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, masterPassword, totpToken, securityAnswer } = req.body;
    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (!user || !verifyPassword(masterPassword, user.masterPasswordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.twoFactorEnabled) {
      if (!totpToken && !securityAnswer) {
        return res.status(200).json({ 
          success: false, 
          requiresTwoFactor: true, 
          twoFactorType: user.twoFactorType,
          question: user.twoFactorType === 'security_question' ? user.securityQuestion : null,
          message: '2FA required' 
        });
      }

      if (user.twoFactorType === 'authenticator' && totpToken) {
        const valid = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: totpToken,
          window: 1,
        });
        if (!valid) {
          return res.status(200).json({ 
            success: false, 
            requiresTwoFactor: true, 
            canFallback: !!user.securityQuestion,
            question: user.securityQuestion,
            message: 'Invalid TOTP code' 
          });
        }
      } else if (securityAnswer) {
        if (!user.securityAnswerHash || !verifyPassword(securityAnswer.toLowerCase().trim(), user.securityAnswerHash)) {
          return res.status(401).json({ success: false, message: 'Incorrect security answer' });
        }
      } else if (user.twoFactorType === 'security_question' && !securityAnswer) {
         return res.status(200).json({ 
          success: false, 
          requiresTwoFactor: true, 
          twoFactorType: 'security_question',
          question: user.securityQuestion,
          message: 'Security question required' 
        });
      }
    }

    const accessToken = jwt.sign({ id: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await run('UPDATE users SET refreshToken = ? WHERE email = ?', [refreshToken, user.email]);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      success: true,
      accessToken,
      user: { id: user.email, email: user.email, twoFactorEnabled: !!user.twoFactorEnabled }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.email,
      email: req.user.email,
      twoFactorEnabled: !!req.user.twoFactorEnabled,
      twoFactorType: req.user.twoFactorType
    }
  });
});

// 2FA Routes
router.post('/2fa/setup', protect, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `VaultX (${req.user.email})` });
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ success: true, secret: secret.base32, qrCode });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/2fa/verify', protect, async (req, res) => {
  try {
    const { token, secret } = req.body;
    const valid = speakeasy.totp.verify({
      secret: secret || req.user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2 // Increased window for sync issues
    });

    console.log(`🔍 TOTP Verification: Token=${token}, Valid=${valid}`);

    if (valid) {
      await run(
        'UPDATE users SET twoFactorEnabled = 1, twoFactorSecret = ?, twoFactorType = "authenticator" WHERE email = ?',
        [secret || req.user.twoFactorSecret, req.user.email]
      );
      res.json({ success: true, message: '2FA enabled' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid token' });
    }
  } catch (err) {
    console.error('❌ TOTP Verify Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/2fa/security-questions/setup', protect, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const answerHash = hashPassword(answer.toLowerCase().trim());
    await run(
      'UPDATE users SET twoFactorEnabled = 1, twoFactorType = "security_question", securityQuestion = ?, securityAnswerHash = ? WHERE email = ?',
      [question, answerHash, req.user.email]
    );
    res.json({ success: true, message: 'Security question set' });
  } catch (err) {
    console.error('❌ Security Question Setup Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/2fa/disable', protect, async (req, res) => {
  try {
    const { masterPassword } = req.body;
    if (!verifyPassword(masterPassword, req.user.masterPasswordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid master password' });
    }
    await run(
      'UPDATE users SET twoFactorEnabled = 0, twoFactorSecret = NULL, securityAnswerHash = NULL WHERE email = ?',
      [req.user.email]
    );
    res.json({ success: true, message: '2FA disabled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
