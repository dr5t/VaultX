const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../firebase-config.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Connected to Firebase Firestore');
} else {
  console.warn('⚠️  WARNING: firebase-config.json not found in backend/ directory.');
  console.warn('Firebase Admin SDK is running without credentials (may fail).');
  // Initialize without credentials (works in Firebase Functions environment)
  admin.initializeApp();
}

const db = admin.firestore();

module.exports = { db };
