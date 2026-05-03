const jwt = require('jsonwebtoken');
const { get } = require('../db/database');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Query SQLite for user
    const user = await get('SELECT * FROM users WHERE email = ?', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.user.id = user.email; // Alias for compatibility
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = { protect };
