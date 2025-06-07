import crypto from 'crypto';
import { generateIV } from '../key/entropy.js';

/**
 * Encrypts plaintext data using AES-256-GCM.
 * @param {Buffer} key - A 32-byte encryption key.
 * @param {string|Buffer} data - Plaintext to encrypt.
 * @returns {{ iv: string, ciphertext: string, tag: string }}
 */
export function encrypt(key, data) {
  const iv = generateIV();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    ciphertext: ciphertext.toString('hex'),
    tag: tag.toString('hex')
  };
}
