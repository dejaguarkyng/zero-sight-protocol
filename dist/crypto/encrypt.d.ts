export interface EncryptedData {
    iv: string;
    ciphertext: string;
    tag: string;
}
/**
 * Encrypts plaintext data using AES-256-GCM.
 * @param {Buffer} key - A 32-byte encryption key.
 * @param {string|Buffer} data - Plaintext to encrypt.
 * @returns {{ iv: string, ciphertext: string, tag: string }}
 */
export declare function encrypt(key: Buffer, data: string | Buffer): EncryptedData;
/**
 * Encrypts data using a client secret (hashed to 32-byte key).
 * @param {string} clientSecret - The client secret to hash for encryption.
 * @param {string|Buffer} plaintext - Data to encrypt.
 * @returns {{ iv: string, ciphertext: string, tag: string }}
 */
export declare function encryptWithSecret(clientSecret: string, plaintext: string | Buffer): EncryptedData;
