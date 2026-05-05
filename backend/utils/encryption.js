const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function deriveKey(userId) {
  const secret = process.env.ENCRYPTION_SECRET || 'fallback_dev_secret_32_characters!';
  return crypto.scryptSync(secret + userId.toString(), 'vaultx-salt', 32);
}

function encrypt(plaintext, userId) {
  const key = deriveKey(userId);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(cipherblob, userId) {
  const key = deriveKey(userId);
  const buf = Buffer.from(cipherblob, 'base64');

  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
}

module.exports = { encrypt, decrypt };
