const express = require('express');
const { protect } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');
const { db } = require('../db/database');
const fs = require('fs');
const path = require('path');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = db.collection('credentials').where('userId', '==', req.user.email);
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.get();
    const rows = [];
    snapshot.forEach(doc => {
      rows.push({ id: doc.id, ...doc.data() });
    });
    
    const credentials = rows.map(row => {
      let decodedPassword = row.encryptedPassword;
      try {
        decodedPassword = decrypt(row.encryptedPassword, req.user.email);
      } catch (e) {
        // If it's zero-knowledge encrypted on client, decrypt on backend will fail.
        // We just return the encrypted blob or raw string.
      }
      return {
        _id: row.id,
        ...row,
        password: decodedPassword
      };
    });

    const usernameMap = {};
    credentials.forEach(c => {
      if (!usernameMap[c.username]) usernameMap[c.username] = [];
      usernameMap[c.username].push(c.siteName);
    });
    const duplicates = Object.entries(usernameMap)
      .filter(([, sites]) => sites.length > 1)
      .map(([username, sites]) => ({ username, sites }));

    res.json({ success: true, credentials, duplicates });
  } catch (err) {
    console.error('Fetch Credentials Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/by-url', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    let domain = url;
    try {
      domain = new URL(url).hostname;
    } catch (e) {}

    // Firestore doesn't support LIKE '%domain%'. Fetch all and filter.
    const snapshot = await db.collection('credentials')
      .where('userId', '==', req.user.email)
      .get();
      
    const rows = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if ((data.url && data.url.includes(domain)) || (data.siteName && data.siteName.includes(domain))) {
        rows.push({ id: doc.id, ...data });
      }
    });

    const credentials = rows.map(row => {
      let decodedPassword = row.encryptedPassword;
      try {
        decodedPassword = decrypt(row.encryptedPassword, req.user.email);
      } catch (e) {}
      return {
        _id: row.id,
        ...row,
        password: decodedPassword
      };
    });

    res.json({ success: true, credentials });
  } catch (err) {
    console.error('Fetch by URL Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { siteName, url, username, password, category, notes } = req.body;
    
    // Store encrypted password as provided, per recent Zero-Knowledge updates
    const encryptedPassword = password;
    
    const newCred = {
      userId: req.user.email,
      siteName,
      url: url || '',
      username,
      encryptedPassword,
      category: category || 'other',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };
    
    const docRef = await db.collection('credentials').add(newCred);

    const auditPath = path.join(__dirname, '../vault_audit.md');
    const logEntry = `| ${siteName} | ${new Date().toLocaleString()} | ******** | ${username} | Protected | ${req.user.twoFactorEnabled ? 'ON' : 'OFF'} |\n`;
    fs.appendFileSync(auditPath, logEntry);

    res.status(201).json({
      success: true,
      credential: {
        _id: docRef.id,
        siteName,
        url,
        username,
        password,
        category,
        notes
      }
    });
  } catch (err) {
    console.error('Add Credential Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { siteName, url, username, password, category, notes } = req.body;
    const encryptedPassword = password;

    const docRef = db.collection('credentials').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists || doc.data().userId !== req.user.email) {
      return res.status(404).json({ success: false, message: 'Credential not found' });
    }

    await docRef.update({
      siteName,
      url,
      username,
      encryptedPassword,
      category,
      notes,
      lastAccessed: new Date().toISOString()
    });

    res.json({
      success: true,
      credential: { _id: req.params.id, siteName, url, username, password, category, notes }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('credentials').doc(req.params.id);
    const doc = await docRef.get();
    
    if (!doc.exists || doc.data().userId !== req.user.email) {
      return res.status(404).json({ success: false, message: 'Credential not found' });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Credential deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
