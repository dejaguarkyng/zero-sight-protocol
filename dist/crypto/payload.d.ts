/**
 * Creates a timestamped encrypted payload for secure PIN transmission.
 * @param {string} data - The data to encrypt (e.g., PIN).
 * @param {string} clientSecret - The client secret for encryption.
 * @returns {string} - Base64-encoded JSON payload with encrypted data, IV, tag, and timestamp.
 */
export declare function createTimestampedPayload(data: string, clientSecret: string): string;
/**
 * Validates and decrypts a timestamped encrypted payload.
 * @param {string} encryptedPayload - Base64-encoded payload.
 * @param {string} clientSecret - The client secret for decryption.
 * @param {number} timeWindowMs - Maximum age of payload in milliseconds (default: 5 minutes).
 * @returns {string} - Decrypted plaintext if valid, throws error otherwise.
 */
export declare function validateTimestampedPayload(encryptedPayload: string, clientSecret: string, timeWindowMs?: number): string;
