const { onRequest } = require("firebase-functions/v2/https");
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Initialize Firebase Admin with default environment credentials
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

const authRoutes = require('./routes/auth');
const credentialRoutes = require('./routes/credentials');
const categoryRoutes = require('./routes/categories');

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: ['https://vaultx-69534.web.app', 'https://vaultx-69534.firebaseapp.com', 'chrome-extension://'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Inject services into request
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

// Mount routes at /api (matching the Firebase Hosting rewrite)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'VaultX API (Cloud Functions) is running' }));

// Export the Cloud Function
exports.api = onRequest({ region: "us-central1" }, app);
