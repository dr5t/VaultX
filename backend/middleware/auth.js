const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userDoc = await db.collection('users').doc(decoded.id).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = userDoc.data();
    req.user = user;
    req.user.id = user.email;
    next();
  } catch (err) {
    console.error('❌ Auth Middleware Token Failure:', err.name, err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: `Auth Error: ${err.message}` });
  }
};

module.exports = { protect };
