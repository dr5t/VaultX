const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const db = req.db;
    const snapshot = await db.collection('categories').where('userId', '==', req.user.id).get();
    
    const categories = [];
    snapshot.forEach(doc => {
      categories.push({ _id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const db = req.db;
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const catRef = await db.collection('categories').add({
      userId: req.user.id,
      name,
      icon: icon || '🔐',
      color: color || '#6366f1',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ 
      success: true, 
      category: { _id: catRef.id, name, icon, color } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = req.db;
    const docRef = db.collection('categories').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
