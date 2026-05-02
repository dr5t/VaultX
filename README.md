# VaultX — Secure Password Manager

A full-stack, zero-knowledge password manager with a React dashboard and Chrome Extension.

## Features
- **Zero-Knowledge Encryption**: Passwords are encrypted client-side using AES-256-GCM.
- **Two-Factor Authentication**: Support for TOTP (Google Authenticator, etc.).
- **Chrome Extension**: Autofill credentials based on the current website URL.
- **Password Generator**: Customizable, secure password generation.
- **Duplicate Detection**: Alerts when the same username is used across multiple sites.

## Setup Instructions

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and secrets
npm start
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:3000`.

### 3. Chrome Extension
1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `extension` folder in this repository.
4. Log in to the web dashboard at `http://localhost:3000` to sync your session to the extension.

## Security Architecture
- **Master Password**: Never sent to the server. Used to derive the encryption key via PBKDF2.
- **API Security**: JWT with refresh tokens (httpOnly cookies) and rate limiting.
- **Data Storage**: Encrypted blobs in MongoDB, server-side AES layer for added protection.
