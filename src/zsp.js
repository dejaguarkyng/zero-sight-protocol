import { encrypt, encryptWithSecret as encryptDataWithSecret } from "./crypto/encrypt.js"
import { decrypt, decryptWithSecret as decryptDataWithSecret } from "./crypto/decrypt.js"
import { createTimestampedPayload, validateTimestampedPayload } from "./crypto/payload.js"
import { deriveKey } from "./key/deriveKey.js"
import { createSessionToken, verifySessionToken } from "./session/sessionManager.js"
import { generateOtp, verifyOtp } from "./recovery/otpManager.js"
import { initiateRecovery, verifyRecovery, resetPin } from "./recovery/recoveryManager.js"
import { addTrustedDevice, isTrustedDevice, removeTrustedDevice } from "./recovery/device.js"
import crypto from "crypto"

export default class ZeroSightProtocol {
  // Encrypt data with a user PIN
  static async encryptWallet(pin, walletData) {
    const salt = crypto.randomBytes(16)
    const key = await deriveKey(pin, salt)
    return {
      encrypted: encrypt(key, walletData),
      salt: salt.toString("hex"),
    }
  }

  // Decrypt wallet with PIN and salt
  static async decryptWallet(pin, encryptedWallet, saltHex) {
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
  static encryptWithSecret(clientSecret, plaintext) {
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
  static decryptWithSecret(clientSecret, ivHex, ciphertextHex, tagHex) {
    return decryptDataWithSecret(clientSecret, ivHex, ciphertextHex, tagHex)
  }

  /**
   * Creates a timestamped encrypted payload for secure PIN transmission.
   * @param {string} data - Data to encrypt (e.g., PIN).
   * @param {string} clientSecret - The client secret for encryption.
   * @returns {string} - Base64-encoded payload.
   */
  static createTimestampedPayload(data, clientSecret) {
    return createTimestampedPayload(data, clientSecret)
  }

  /**
   * Validates and decrypts a timestamped payload.
   * @param {string} encryptedPayload - Base64-encoded payload.
   * @param {string} clientSecret - The client secret for decryption.
   * @param {number} timeWindowMs - Maximum age in milliseconds (default: 5 minutes).
   * @returns {string} - Decrypted plaintext.
   */
  static validateTimestampedPayload(encryptedPayload, clientSecret, timeWindowMs = 300000) {
    return validateTimestampedPayload(encryptedPayload, clientSecret, timeWindowMs)
  }

  // Create and verify sessions
  static createSession(userId) {
    return createSessionToken(userId)
  }
  static verifySession(token) {
    return verifySessionToken(token)
  }

  // Recovery OTP methods
  static generateOtp(target) {
    return generateOtp(target)
  }
  static verifyOtp(target, otp) {
    return verifyOtp(target, otp)
  }

  // Recovery flow
  static initiateRecovery(email, phone, encryptedWallet, salt) {
    return initiateRecovery(email, phone, encryptedWallet, salt)
  }
  static verifyRecovery(email, phone, emailOtp, smsOtp) {
    return verifyRecovery(email, phone, emailOtp, smsOtp)
  }
  static resetPin(email, phone, newPin) {
    return resetPin(email, phone, newPin)
  }

  // Trusted device management
  static addTrustedDevice(userId, deviceId) {
    return addTrustedDevice(userId, deviceId)
  }
  static isTrustedDevice(userId, deviceId) {
    return isTrustedDevice(userId, deviceId)
  }
  static removeTrustedDevice(userId, deviceId) {
    return removeTrustedDevice(userId, deviceId)
  }
}
