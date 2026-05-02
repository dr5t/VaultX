/**
 * Secure crypto utilities for client-side zero-knowledge encryption.
 * Uses Web Crypto API for AES-256-GCM.
 */

const ITERATIONS = 100000;
const SALT = 'vaultx-client-salt-fixed'; // In a real app, this should be unique per user or stored

/**
 * Derive an AES-256 key from a master password using PBKDF2
 */
export async function deriveKey(masterPassword) {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a plaintext string using an AES-GCM key
 */
export async function encryptData(plaintext, key) {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = encoder.encode(plaintext);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  const encryptedArray = new Uint8Array(encrypted);
  const result = new Uint8Array(iv.length + encryptedArray.length);
  result.set(iv);
  result.set(encryptedArray, iv.length);

  return btoa(String.fromCharCode(...result));
}

/**
 * Decrypt a base64 encoded ciphertext using an AES-GCM key
 */
export async function decryptData(ciphertextBase64, key) {
  const binary = atob(ciphertextBase64);
  const data = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    data[i] = binary.charCodeAt(i);
  }

  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
