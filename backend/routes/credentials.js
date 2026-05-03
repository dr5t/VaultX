const express = require('express');
const { protect } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');
const { get, run, query } = require('../db/database');
const fs = require('fs');
const path = require('path');

const router = express.Router();
router.use(protect);

// GET /api/credentials
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM credentials WHERE userId = ?';
    let params = [req.user.email];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    const rows = await query(sql, params);
    
    const credentials = rows.map(row => ({
      _id: row.id,
      ...row,
      password: decrypt(row.encryptedPassword, req.user.email)
    }));

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
    const { siteName, url, username, password, category, notes } = req.body;
    console.log('👉 Encrypting for user:', req.user?.email);
    
    const encryptedPassword = encrypt(password, req.user.email);
    
    const result = await run(
      `INSERT INTO credentials (userId, siteName, url, username, encryptedPassword, category, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.email, siteName, url || '', username, encryptedPassword, category || 'other', notes || '']
    );

    // Update Audit Log File with specific structure
    const auditPath = path.join(__dirname, '../vault_audit.md');
    const mfaStatus = req.user.twoFactorEnabled ? 'ON' : 'OFF';
    const sQuestion = req.user.securityQuestion || 'None Set';
    const logEntry = `| ${siteName} | ${new Date().toLocaleString()} | ${password} | ${username} | ${sQuestion} | ${mfaStatus} |\n`;
    fs.appendFileSync(auditPath, logEntry);

    res.status(201).json({
      success: true,
      credential: {
        _id: result.id,
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

// PUT /api/credentials/:id
router.put('/:id', async (req, res) => {
  try {
    const { siteName, url, username, password, category, notes } = req.body;
    const encryptedPassword = encrypt(password, req.user.email);

    await run(
      `UPDATE credentials SET siteName = ?, url = ?, username = ?, encryptedPassword = ?, category = ?, notes = ?, lastAccessed = CURRENT_TIMESTAMP 
       WHERE id = ? AND userId = ?`,
      [siteName, url, username, encryptedPassword, category, notes, req.params.id, req.user.email]
    );

    res.json({
      success: true,
      credential: { _id: req.params.id, siteName, url, username, password, category, notes }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/credentials/:id
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM credentials WHERE id = ? AND userId = ?', [req.params.id, req.user.email]);
    res.json({ success: true, message: 'Credential deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
