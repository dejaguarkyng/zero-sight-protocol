/**
 * Decrypts AES-256-GCM encrypted data.
 * @param {Buffer} key - A 32-byte key.
 * @param {string} ivHex - Hex-encoded IV.
 * @param {string} ciphertextHex - Hex-encoded ciphertext.
 * @param {string} tagHex - Hex-encoded GCM tag.
 * @returns {string} - Decrypted plaintext.
 */
export declare function decrypt(key: Buffer, ivHex: string, ciphertextHex: string, tagHex: string): string;
/**
 * Decrypts data using a client secret (hashed to 32-byte key).
 * @param {string} clientSecret - The client secret to hash for decryption.
 * @param {string} ivHex - Hex-encoded IV.
 * @param {string} ciphertextHex - Hex-encoded ciphertext.
 * @param {string} tagHex - Hex-encoded GCM tag.
 * @returns {string} - Decrypted plaintext.
 */
export declare function decryptWithSecret(clientSecret: string, ivHex: string, ciphertextHex: string, tagHex: string): string;
