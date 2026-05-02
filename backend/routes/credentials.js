const express = require('express');
const Credential = require('../models/Credential');
const { protect } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

const router = express.Router();

// Apply JWT guard to all credential routes
router.use(protect);

// GET /api/credentials - get all credentials (passwords decrypted)
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'all') query.category = category;

    let credentials = await Credential.find(query).sort(
      sort === 'recent' ? { lastAccessed: -1 } : { siteName: 1 }
    );

    if (search) {
      const s = search.toLowerCase();
      credentials = credentials.filter(
        (c) => c.siteName.toLowerCase().includes(s) || c.username.toLowerCase().includes(s)
      );
    }

    // Decrypt passwords before sending
    const result = credentials.map((c) => ({
      _id: c._id,
      siteName: c.siteName,
      url: c.url,
      username: c.username,
      password: decrypt(c.encryptedPassword, req.user._id),
      category: c.category,
      notes: c.notes,
      lastAccessed: c.lastAccessed,
      passwordChangedAt: c.passwordChangedAt,
      createdAt: c.createdAt,
    }));

    // Detect duplicate usernames across different sites
    const usernameMap = {};
    result.forEach((c) => {
      if (!usernameMap[c.username]) usernameMap[c.username] = [];
      usernameMap[c.username].push(c.siteName);
    });
    const duplicates = Object.entries(usernameMap)
      .filter(([, sites]) => sites.length > 1)
      .map(([username, sites]) => ({ username, sites }));

    res.json({ success: true, credentials: result, duplicates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/credentials/by-url - used by browser extension
router.get('/by-url', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    // Extract hostname for matching
    let hostname;
    try {
      hostname = new URL(url).hostname.replace('www.', '');
    } catch {
      hostname = url.toLowerCase();
    }

    const credentials = await Credential.find({ userId: req.user._id });
    const matches = credentials.filter((c) => {
      if (!c.url) return false;
      try {
        const credHost = new URL(c.url).hostname.replace('www.', '');
        return credHost === hostname;
      } catch {
        return c.url.toLowerCase().includes(hostname);
      }
    });

    const result = matches.map((c) => ({
      _id: c._id,
      siteName: c.siteName,
      url: c.url,
      username: c.username,
      password: decrypt(c.encryptedPassword, req.user._id),
      category: c.category,
    }));

    // Update lastAccessed
    if (matches.length > 0) {
      await Credential.updateMany(
        { _id: { $in: matches.map((m) => m._id) } },
        { lastAccessed: new Date() }
      );
    }

    res.json({ success: true, credentials: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/credentials - add new credential
router.post('/', async (req, res) => {
  try {
    const { siteName, url, username, password, category, notes } = req.body;

    if (!siteName || !username || !password) {
      return res.status(400).json({ success: false, message: 'siteName, username, and password are required' });
    }

    const encryptedPassword = encrypt(password, req.user._id);

    const credential = await Credential.create({
      userId: req.user._id,
      siteName,
      url: url || '',
      username,
      encryptedPassword,
      category: category || 'other',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      credential: {
        _id: credential._id,
        siteName: credential.siteName,
        url: credential.url,
        username: credential.username,
        password,
        category: credential.category,
        notes: credential.notes,
        createdAt: credential.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/credentials/:id - update credential
router.put('/:id', async (req, res) => {
  try {
    const { siteName, url, username, password, category, notes } = req.body;

    const credential = await Credential.findOne({ _id: req.params.id, userId: req.user._id });
    if (!credential) return res.status(404).json({ success: false, message: 'Credential not found' });

    if (siteName) credential.siteName = siteName;
    if (url !== undefined) credential.url = url;
    if (username) credential.username = username;
    if (password) {
      credential.encryptedPassword = encrypt(password, req.user._id);
      credential.passwordChangedAt = new Date();
    }
    if (category) credential.category = category;
    if (notes !== undefined) credential.notes = notes;

    await credential.save();

    res.json({
      success: true,
      credential: {
        _id: credential._id,
        siteName: credential.siteName,
        url: credential.url,
        username: credential.username,
        password: decrypt(credential.encryptedPassword, req.user._id),
        category: credential.category,
        notes: credential.notes,
        passwordChangedAt: credential.passwordChangedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/credentials/:id
router.delete('/:id', async (req, res) => {
  try {
    const credential = await Credential.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!credential) return res.status(404).json({ success: false, message: 'Credential not found' });

    res.json({ success: true, message: 'Credential deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
