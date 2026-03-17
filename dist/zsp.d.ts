import { type SessionTokenResult, type SessionVerificationResult } from "./session/sessionManager.js";
export interface EncryptedData {
    iv: string;
    ciphertext: string;
    tag: string;
}
export interface EncryptedWallet {
    encrypted: EncryptedData;
    salt: string;
}
export default class ZeroSightProtocol {
    static encryptWallet(pin: string, walletData: string | Buffer): Promise<EncryptedWallet>;
    static decryptWallet(pin: string, encryptedWallet: EncryptedData, saltHex: string): Promise<string>;
    /**
     * Encrypts data using a client secret (app-level PIN encryption).
     * @param {string} clientSecret - The client secret for encryption.
     * @param {string} plaintext - Data to encrypt.
     * @returns {object} - Object with iv, ciphertext, and tag (hex-encoded).
     */
    static encryptWithSecret(clientSecret: string, plaintext: string | Buffer): EncryptedData;
    /**
     * Decrypts data using a client secret.
     * @param {string} clientSecret - The client secret for decryption.
     * @param {string} ivHex - Hex-encoded IV.
     * @param {string} ciphertextHex - Hex-encoded ciphertext.
     * @param {string} tagHex - Hex-encoded GCM tag.
     * @returns {string} - Decrypted plaintext.
     */
    static decryptWithSecret(clientSecret: string, ivHex: string, ciphertextHex: string, tagHex: string): string;
    /**
     * Creates a timestamped encrypted payload for secure PIN transmission.
     * @param {string} data - Data to encrypt (e.g., PIN).
     * @param {string} clientSecret - The client secret for encryption.
     * @returns {string} - Base64-encoded payload.
     */
    static createTimestampedPayload(data: string, clientSecret: string): string;
    /**
     * Validates and decrypts a timestamped payload.
     * @param {string} encryptedPayload - Base64-encoded payload.
     * @param {string} clientSecret - The client secret for decryption.
     * @param {number} timeWindowMs - Maximum age in milliseconds (default: 5 minutes).
     * @returns {string} - Decrypted plaintext.
     */
    static validateTimestampedPayload(encryptedPayload: string, clientSecret: string, timeWindowMs?: number): string;
    static createSession(userId: string): SessionTokenResult;
    static verifySession(token: string): SessionVerificationResult;
    static generateOtp(target: string): string;
    static verifyOtp(target: string, otp: string): boolean;
    static initiateRecovery(email: string, phone: string, encryptedWallet: EncryptedData, salt: Buffer | string): Promise<{
        otpEmail: string;
        otpSMS: string;
    }>;
    static verifyRecovery(email: string, phone: string, emailOtp: string, smsOtp: string): boolean;
    static resetPin(email: string, phone: string, newPin: string): Promise<{
        newEncryptedWallet: EncryptedData;
        newSalt: string;
    }>;
    static addTrustedDevice(userId: string, deviceId: string): void;
    static isTrustedDevice(userId: string, deviceId: string): boolean;
    static removeTrustedDevice(userId: string, deviceId: string): void;
}
