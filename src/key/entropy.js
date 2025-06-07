import crypto from 'crypto';

/**
 * Generates a random 16-byte IV.
 * @returns {Buffer}
 */
export function generateIV() {
  return crypto.randomBytes(16);
}

/**
 * Generates a random salt (32 bytes) for key derivation.
 * @returns {Buffer}
 */
export function generateSalt() {
  return crypto.randomBytes(32);
}
