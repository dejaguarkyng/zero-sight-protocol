import crypto from 'crypto';

/**
 * Derives a 32-byte key from a password or PIN using scrypt.
 * @param {string} secret - User's PIN, password, or recovery secret.
 * @param {Buffer} salt - A unique salt (from entropy.js).
 * @returns {Promise<Buffer>} - Derived 32-byte key.
 */
export function deriveKey(secret, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(secret, salt, 32, { cost: 16384, blockSize: 8, parallelization: 1 }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}
