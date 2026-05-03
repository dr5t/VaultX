require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-config.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const authRoutes = require('./routes/auth');
const credentialRoutes = require('./routes/credentials');
const categoryRoutes = require('./routes/categories');

const app = express();
app.use((req, res, next) => { console.log(`👉 ${req.method} ${req.url}`); next(); });

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:3001', 'chrome-extension://'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Pass firestore to routes
app.use((req, res, next) => {
  req.db = db;
  req.adminAuth = auth;
  next();
});

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: { success: false, message: 'Too many requests' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'VaultX API (Firebase) is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 VaultX API running on port ${PORT} (Firebase mode)`));

module.exports = { app, db };
