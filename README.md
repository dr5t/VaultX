# 🔐 VaultX — Secure Password Manager

A full-stack, secure password manager with a React dashboard and Chrome Extension. Built with focus on security, categorization, and seamless autofill.

## 🚀 Features
- **Client-Side Security**: Master password hashing with bcrypt and multi-layer encryption.
- **Two-Factor Authentication (2FA)**: Support for TOTP via authenticator apps (Google Authenticator, Authy, etc.).
- **Chrome Extension**: Intelligent autofill that detects website URLs and suggests matching credentials.
- **Smart Generator**: Create complex, secure passwords with customizable strength and character sets.
- **Audit System**: Real-time detection of duplicate usernames and password age alerts.
- **Premium Design**: Modern dark-mode interface with glassmorphism and smooth micro-interactions.

## 🛠️ Tech Stack & Architecture
- **Frontend**: React.js & Vite
- **Backend**: Node.js & Express
- **Database**: Firebase Firestore (Migrated from SQLite)
- **Hosting**: Firebase Hosting (Frontend)

## 📦 Setup Instructions

### 1. Firebase Configuration
This project relies on Firebase for its database. You will need to create a Firebase project and obtain the Service Account credentials.
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Project Settings > Service Accounts**.
3. Click **Generate new private key** and download the JSON file.
4. Rename the downloaded file to `firebase-config.json` and place it in the `backend/` directory. (This file is ignored by `.gitignore` and should never be committed).

### 2. Backend API
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install necessary packages:
   ```bash
   npm install
   ```
3. Setup your environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` and provide your JWT secrets and other configurations.*
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The API will be live at `http://localhost:5000` (or the port specified in your .env).*

### 3. Frontend Dashboard
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

### 4. Chrome Extension
1. Open Chrome and go to `chrome://extensions/`.
2. Turn on **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `extension` folder from the project directory.
4. **Usage**: Log in to the VaultX web dashboard. The extension will automatically sync your session to allow for secure autofilling on external sites.

## 🛡️ Security
- **Never commit your `.env` or `firebase-config.json` files.**
- **Password Hashing**: Bcrypt for master passwords.
- **Encryption**: AES-256-GCM for stored credentials.
- **Auth**: JWT (JSON Web Tokens) with refresh token rotation.

## 📄 License
This project is open-source. Educational use is encouraged. Ensure all environment secrets are rotated before any production deployment.
