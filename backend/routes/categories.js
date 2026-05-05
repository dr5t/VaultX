const express = require('express');
const { protect } = require('../middleware/auth');
const { query, run, get } = require('../db/database');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories WHERE userId = ?', [req.user.email]);
    res.json({ 
      success: true, 
      categories: categories.map(c => ({ _id: c.id, ...c }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const result = await run(
      'INSERT INTO categories (userId, name, icon, color) VALUES (?, ?, ?, ?)',
      [req.user.email, name, icon || '🔐', color || '#6366f1']
    );

    res.status(201).json({ 
      success: true, 
      category: { _id: result.id, name, icon, color } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const cat = await get('SELECT userId FROM categories WHERE id = ?', [req.params.id]);
    if (!cat || cat.userId !== req.user.email) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
