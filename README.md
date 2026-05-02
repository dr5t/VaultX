# VaultX — Secure Password Manager

A full-stack, zero-knowledge password manager with a React dashboard and Chrome Extension. Built with security and aesthetics in mind.

## 🚀 Features
- **Zero-Knowledge Encryption**: All credentials are encrypted client-side using AES-256-GCM. Your master password never leaves your device.
- **Two-Factor Authentication (2FA)**: Robust support for TOTP (Google Authenticator, Authy, etc.).
- **Chrome Extension**: Seamlessly autofill credentials based on the current website URL.
- **Advanced Password Generator**: Create complex, secure passwords with customizable length and character sets.
- **Security Audit**: Real-time detection of duplicate usernames and weak passwords.
- **Premium UI**: Modern dark theme with glassmorphism and smooth animations.

## 🛠️ Setup Instructions

### 1. Backend API (Node.js)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *Update `.env` with your MongoDB URI (e.g., MongoDB Atlas or local) and set your secrets.*
4. Start the server:
   ```bash
   npm run dev
   ```
   *The API will run on `http://localhost:5000`.*

### 2. Frontend Dashboard (React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The dashboard will be available at `http://localhost:3000`.*

### 3. Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `extension` folder in this project's root.
4. **Login Sync**: Log in to the web dashboard at `http://localhost:3000`. The extension will automatically detect your session and sync the encryption keys.

## 🔐 Security Architecture
- **Encryption**: AES-256-GCM with a key derived via PBKDF2 (100,000 iterations).
- **Zero Knowledge**: The server only stores encrypted blobs. It cannot decrypt your passwords.
- **Transport**: Secure API communication with JWT and refresh token rotation.

## 📄 License
This project is for educational purposes. Ensure you use strong secrets in production environments.
