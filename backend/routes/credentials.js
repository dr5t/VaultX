const express = require('express');
const { protect } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

const router = express.Router();
router.use(protect);

// GET /api/credentials
router.get('/', async (req, res) => {
  try {
    const db = req.db;
    const { category } = req.query;
    
    let query = db.collection('credentials').where('userId', '==', req.user.id);
    
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    const credentials = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      credentials.push({
        _id: doc.id,
        ...data,
        password: decrypt(data.encryptedPassword, req.user.id)
      });
    });

    // Duplicate detection
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

// POST /api/credentials
router.post('/', async (req, res) => {
  try {
    const db = req.db;
    const { siteName, url, username, password, category, notes } = req.body;

    const encryptedPassword = encrypt(password, req.user.id);

    const credRef = await db.collection('credentials').add({
      userId: req.user.id,
      siteName,
      url: url || '',
      username,
      encryptedPassword,
      category: category || 'other',
      notes: notes || '',
      lastAccessed: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      credential: {
        _id: credRef.id,
        siteName,
        url,
        username,
        password,
        category,
        notes
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Other CRUD methods (PUT, DELETE) will follow the same pattern
// ...

module.exports = router;
