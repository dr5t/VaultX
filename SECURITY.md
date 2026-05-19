# Security Policy and Architecture

## Supported Versions

Currently, only the latest `main` branch of VaultX receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Zero-Knowledge Architecture

VaultX is designed under a strict **Zero-Knowledge Architecture**, meaning the backend server and its administrators cannot access, read, or decrypt your stored passwords under any circumstances.

### 1. Client-Side Encryption
- **Algorithm**: AES-256-GCM.
- **Process**: All credentials (passwords, notes, etc.) are encrypted on the client's device (browser/extension) *before* they are sent to the backend.
- **Key Derivation**: The encryption key is derived from your Master Password using an advanced Key Derivation Function (KDF) like Scrypt/Argon2. The raw Master Password is never transmitted to the server.

### 2. Master Password Authentication
- The backend verifies your identity using a hashed version of your Master Password (using Bcrypt with a high cost factor).
- Even if the backend database is compromised, attackers only obtain Bcrypt hashes and AES-256 encrypted blobs, rendering the data useless without the individual Master Passwords.

### 3. Multi-Factor Authentication (MFA/2FA)
- Time-based One-Time Passwords (TOTP) compliant with standard authenticator apps (Google Authenticator, Authy).
- Secure fallback via encrypted Security Questions.

### 4. Secure Transport & Storage
- **In Transit**: All data transmission must occur over HTTPS/TLS 1.2+.
- **At Rest**: Firebase Firestore databases are encrypted at rest by Google Cloud. Data stored within Firestore fields are double-encrypted by the client-side AES-256 implementation.
- **Session Management**: VaultX uses JWT (JSON Web Tokens) with short-lived Access Tokens (15 minutes) and HTTP-only, secure Cookies for Refresh Tokens to prevent XSS and CSRF attacks.

## Reporting a Vulnerability

Security is our top priority. If you discover a vulnerability in VaultX, we appreciate your cooperation in reporting it responsibly.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to the project maintainer at:
`tiwarishaurya395@gmail.com`

**What to include in your report:**
- Description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact.

We will acknowledge receipt of your vulnerability report within 48 hours and strive to send you regular updates about our progress. If you are the first to report a confirmed vulnerability, you may be acknowledged in our security advisories.

## Disclaimer and License

This software is provided "AS IS", without warranty of any kind, express or implied. The developers and contributors of VaultX are not responsible for any data loss, breaches, or damages resulting from the use of this software. By using VaultX, you agree to take full responsibility for securing your Master Password and maintaining backups.
