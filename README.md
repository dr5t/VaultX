<div align="center">
  <img src="https://img.icons8.com/color/96/000000/safe.png" alt="VaultX Logo"/>
  <h1>🔐 VaultX</h1>
  <p><strong>A Next-Generation, Zero-Knowledge Secure Password Manager</strong></p>
  
  <p>
    <a href="https://vaultx-69534.web.app" target="_blank">
      <img src="https://img.shields.io/badge/Live_Website-vaultx--69534.web.app-success?style=for-the-badge&logo=firebase" alt="Live Website" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white" alt="NodeJS" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=flat-square" alt="ExpressJS" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  </p>
</div>

---

## 🌟 Introduction

VaultX is a full-stack, state-of-the-art password manager designed with privacy and security at its core. It features a stunning React dashboard, a dedicated Chrome Extension for seamless autofill, and a robust Firebase backend. 

VaultX operates on a strict **Zero-Knowledge Architecture**, ensuring that your data is encrypted on your device *before* it ever leaves your browser. Not even the server administrators can read your passwords.

👉 **[Live Demo](https://vaultx-69534.web.app)** 👈

## 🚀 Key Features

- **Zero-Knowledge Encryption**: AES-256-GCM client-side encryption guarantees only you have the keys.
- **Master Password Security**: Bcrypt hashing with high cost-factors.
- **Two-Factor Authentication (2FA)**: Fully supports TOTP authenticator apps (Google Authenticator, Authy, etc.).
- **Chrome Extension Integration**: Intelligent URL detection and secure credential autofill across all your websites.
- **Password Generator**: Instantly create complex, cryptographically secure passwords with customizable character sets.
- **Security Audit Dashboard**: Real-time detection of duplicate passwords, old credentials, and compromised accounts.
- **Premium UI/UX**: Designed with a sleek dark-mode, glassmorphism elements, and buttery smooth micro-interactions.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Environment**: React.js, Vite, TailwindCSS
- **Backend API**: Node.js, Express.js
- **Database Engine**: Firebase Firestore (NoSQL)
- **Deployment & Hosting**: Firebase Hosting
- **Authentication**: Custom JWT (JSON Web Tokens) with Refresh Token Rotation
- **Extension**: Manifest V3 Chrome Extension architecture

---

## 📦 Local Setup Instructions

Follow these steps to run VaultX locally on your machine.

### 1. Firebase Configuration
VaultX relies on Firebase for its database. You will need to create a Firebase project and obtain the Service Account credentials.
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Project Settings > Service Accounts**.
3. Click **Generate new private key** and download the JSON file.
4. Rename the downloaded file to `firebase-config.json` and place it directly inside the `backend/` directory. *(Note: This file is ignored by `.gitignore` to prevent accidental leaks).*

### 2. Backend API Setup
The Node.js server handles authentication validation and database operations.
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install necessary NPM packages:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit the `.env` file and provide strong cryptographic strings for your JWT secrets.*
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The API will be live at `http://localhost:5000`.*

### 3. Frontend Dashboard Setup
The React application powers the user interface.
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
   *The dashboard will be available at `http://localhost:3000` (or `http://localhost:5173`).*

### 4. Chrome Extension Installation
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the `extension` folder from this project directory.
4. **Usage**: Simply log in to the VaultX web dashboard. The extension will automatically sync your secure session, allowing you to seamlessly autofill credentials on external sites.

---

## 🛡️ Security Details

For a detailed breakdown of our security protocols, encryption algorithms, and vulnerability reporting procedures, please read our comprehensive [SECURITY.md](./SECURITY.md).

> **WARNING:** Never commit your `.env` or `firebase-config.json` files to public version control. Ensure all environment secrets are rotated before deploying to a production environment.

---

## 📄 License & Legal

This project is open-source and intended for educational and personal use. The developers assume no liability for data loss or security breaches. Please see the [SECURITY.md](./SECURITY.md) file for more details.

**Developed with ❤️ by Shaurya Tiwari**  
Support Contact: [tiwarishaurya395@gmail.com](mailto:tiwarishaurya395@gmail.com)
