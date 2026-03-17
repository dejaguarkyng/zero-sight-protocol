import { encrypt, encryptWithSecret as encryptDataWithSecret } from "./crypto/encrypt.js"
import { decrypt, decryptWithSecret as decryptDataWithSecret } from "./crypto/decrypt.js"
import { createTimestampedPayload, validateTimestampedPayload } from "./crypto/payload.js"
import { deriveKey } from "./key/deriveKey.js"
import {
  createSessionToken,
  verifySessionToken,
  type SessionTokenResult,
  type SessionVerificationResult,
} from "./session/sessionManager.js"
import { generateOtp, verifyOtp } from "./recovery/otpManager.js"
import { initiateRecovery, verifyRecovery, resetPin } from "./recovery/recoveryManager.js"
import { addTrustedDevice, isTrustedDevice, removeTrustedDevice } from "./recovery/device.js"
import crypto from "crypto"

export interface EncryptedData {
  iv: string
  ciphertext: string
  tag: string
}

export interface EncryptedWallet {
  encrypted: EncryptedData
  salt: string
}

export default class ZeroSightProtocol {
  // Encrypt data with a user PIN
  static async encryptWallet(pin: string, walletData: string | Buffer): Promise<EncryptedWallet> {
    const salt = crypto.randomBytes(16)
    const key = await deriveKey(pin, salt)
    return {
      encrypted: encrypt(key, walletData),
      salt: salt.toString("hex"),
    }
  }

  // Decrypt wallet with PIN and salt
  static async decryptWallet(pin: string, encryptedWallet: EncryptedData, saltHex: string): Promise<string> {
    const salt = Buffer.from(saltHex, "hex")
    const key = await deriveKey(pin, salt)
    return decrypt(key, encryptedWallet.iv, encryptedWallet.ciphertext, encryptedWallet.tag)
  }

  /**
   * Encrypts data using a client secret (app-level PIN encryption).
   * @param {string} clientSecret - The client secret for encryption.
   * @param {string} plaintext - Data to encrypt.
   * @returns {object} - Object with iv, ciphertext, and tag (hex-encoded).
   */
  static encryptWithSecret(clientSecret: string, plaintext: string | Buffer): EncryptedData {
    return encryptDataWithSecret(clientSecret, plaintext)
  }

  /**
   * Decrypts data using a client secret.
   * @param {string} clientSecret - The client secret for decryption.
   * @param {string} ivHex - Hex-encoded IV.
   * @param {string} ciphertextHex - Hex-encoded ciphertext.
   * @param {string} tagHex - Hex-encoded GCM tag.
   * @returns {string} - Decrypted plaintext.
   */
  static decryptWithSecret(
    clientSecret: string,
    ivHex: string,
    ciphertextHex: string,
    tagHex: string,
  ): string {
    return decryptDataWithSecret(clientSecret, ivHex, ciphertextHex, tagHex)
  }

  /**
   * Creates a timestamped encrypted payload for secure PIN transmission.
   * @param {string} data - Data to encrypt (e.g., PIN).
   * @param {string} clientSecret - The client secret for encryption.
   * @returns {string} - Base64-encoded payload.
   */
  static createTimestampedPayload(data: string, clientSecret: string): string {
    return createTimestampedPayload(data, clientSecret)
  }

  /**
   * Validates and decrypts a timestamped payload.
   * @param {string} encryptedPayload - Base64-encoded payload.
   * @param {string} clientSecret - The client secret for decryption.
   * @param {number} timeWindowMs - Maximum age in milliseconds (default: 5 minutes).
   * @returns {string} - Decrypted plaintext.
   */
  static validateTimestampedPayload(encryptedPayload: string, clientSecret: string, timeWindowMs = 300000): string {
    return validateTimestampedPayload(encryptedPayload, clientSecret, timeWindowMs)
  }

  // Create and verify sessions
  static createSession(userId: string): SessionTokenResult {
    return createSessionToken(userId)
  }
  static verifySession(token: string): SessionVerificationResult {
    return verifySessionToken(token)
  }

  // Recovery OTP methods
  static generateOtp(target: string): string {
    return generateOtp(target)
  }
  static verifyOtp(target: string, otp: string): boolean {
    return verifyOtp(target, otp)
  }

  // Recovery flow
  static initiateRecovery(
    email: string,
    phone: string,
    encryptedWallet: EncryptedData,
    salt: Buffer | string,
  ): Promise<{ otpEmail: string; otpSMS: string }> {
    return initiateRecovery(email, phone, encryptedWallet, salt)
  }
  static verifyRecovery(email: string, phone: string, emailOtp: string, smsOtp: string): boolean {
    return verifyRecovery(email, phone, emailOtp, smsOtp)
  }
  static resetPin(
    email: string,
    phone: string,
    newPin: string,
  ): Promise<{ newEncryptedWallet: EncryptedData; newSalt: string }> {
    return resetPin(email, phone, newPin)
  }

  // Trusted device management
  static addTrustedDevice(userId: string, deviceId: string): void {
    return addTrustedDevice(userId, deviceId)
  }
  static isTrustedDevice(userId: string, deviceId: string): boolean {
    return isTrustedDevice(userId, deviceId)
  }
  static removeTrustedDevice(userId: string, deviceId: string): void {
    return removeTrustedDevice(userId, deviceId)
  }
}
