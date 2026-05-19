const express = require('express');
const { protect } = require('../middleware/auth');
const { db } = require('../db/database');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('categories')
      .where('userId', '==', req.user.email)
      .get();
    
    const categories = [];
    snapshot.forEach(doc => {
      categories.push({ _id: doc.id, id: doc.id, ...doc.data() });
    });

    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const newCat = {
      userId: req.user.email,
      name,
      icon: icon || '🔐',
      color: color || '#6366f1',
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('categories').add(newCat);

    res.status(201).json({ 
      success: true, 
      category: { _id: docRef.id, id: docRef.id, ...newCat } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('categories').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().userId !== req.user.email) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
