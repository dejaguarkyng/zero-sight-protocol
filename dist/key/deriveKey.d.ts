/**
 * Derives a 32-byte key from a password or PIN using scrypt.
 * @param {string} secret - User's PIN, password, or recovery secret.
 * @param {Buffer} salt - A unique salt (from entropy.js).
 * @returns {Promise<Buffer>} - Derived 32-byte key.
 */
export declare function deriveKey(secret: string, salt: Buffer | string): Promise<Buffer<ArrayBufferLike>>;
