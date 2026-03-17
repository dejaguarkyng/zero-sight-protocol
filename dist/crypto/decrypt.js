import crypto from "crypto";
/**
 * Decrypts AES-256-GCM encrypted data.
 * @param {Buffer} key - A 32-byte key.
 * @param {string} ivHex - Hex-encoded IV.
 * @param {string} ciphertextHex - Hex-encoded ciphertext.
 * @param {string} tagHex - Hex-encoded GCM tag.
 * @returns {string} - Decrypted plaintext.
 */
export function decrypt(key, ivHex, ciphertextHex, tagHex) {
    const iv = Buffer.from(ivHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
}
/**
 * Decrypts data using a client secret (hashed to 32-byte key).
 * @param {string} clientSecret - The client secret to hash for decryption.
 * @param {string} ivHex - Hex-encoded IV.
 * @param {string} ciphertextHex - Hex-encoded ciphertext.
 * @param {string} tagHex - Hex-encoded GCM tag.
 * @returns {string} - Decrypted plaintext.
 */
export function decryptWithSecret(clientSecret, ivHex, ciphertextHex, tagHex) {
    const key = crypto.createHash("sha256").update(clientSecret).digest();
    const iv = Buffer.from(ivHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
}
