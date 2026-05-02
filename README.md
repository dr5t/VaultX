# 🔐 VaultX — Secure Password Manager

A full-stack, secure password manager with a React dashboard and Chrome Extension. Built with focus on security, categorization, and seamless autofill.

## 🚀 Features
- **Client-Side Security**: Master password hashing with bcrypt and multi-layer encryption.
- **Two-Factor Authentication (2FA)**: Support for TOTP via authenticator apps (Google Authenticator, Authy, etc.).
- **Chrome Extension**: Intelligent autofill that detects website URLs and suggests matching credentials.
- **Smart Generator**: Create complex, secure passwords with customizable strength and character sets.
- **Audit System**: Real-time detection of duplicate usernames and password age alerts.
- **Premium Design**: Modern dark-mode interface with glassmorphism and smooth micro-interactions.

## 🛠️ Setup Instructions

### 1. Backend API (Node.js & Firebase)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install necessary packages:
   ```bash
   npm install
   ```
3. Setup Firebase:
   - Go to Firebase Console > Project Settings > Service Accounts.
   - Click "Generate new private key" and download the JSON.
   - Rename it to `firebase-config.json` and place it in the `backend/` folder.
4. Setup your environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and provide your JWT secrets.*
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The API will be live at `http://localhost:5000`.*

### 2. Frontend Dashboard (React & Vite)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the application:
   ```bash
   npm run dev
   ```
   *The dashboard will be available at `http://localhost:3000` (or `http://localhost:5173`). Check your console for the exact port.*

### 3. Chrome Extension
1. Open Chrome and go to `chrome://extensions/`.
2. Turn on **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `extension` folder from the project directory.
4. **Usage**: Log in to the VaultX web dashboard. The extension will automatically sync your session to allow for secure autofilling on external sites.

## 🛡️ Security Architecture
- **Password Hashing**: Bcrypt (cost factor 12) for master passwords.
- **Encryption**: AES-256-GCM for stored credentials.
- **Auth**: JWT (JSON Web Tokens) with refresh token rotation.
- **Transport**: Designed for HTTPS with secure cookie handling.

## 📄 License
Educational use only. Ensure all environment secrets are rotated before any production deployment.
