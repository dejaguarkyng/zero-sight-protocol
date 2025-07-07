import { encrypt} from './crypto/encrypt.js';
import { decrypt } from './crypto/decrypt.js';
import { deriveKey } from './key/deriveKey.js';
import { createSessionToken, verifySessionToken } from './session/sessionManager.js';
import { generateOtp, verifyOtp } from './recovery/otpManager.js';
import { initiateRecovery, verifyRecovery, resetPin } from './recovery/recoveryManager.js';
import { addTrustedDevice, isTrustedDevice, removeTrustedDevice } from './recovery/device.js';
import crypto from 'crypto';
export default class ZeroSightProtocol {
  // Encrypt data with a user PIN
  static async encryptWallet(pin, walletData) {
    const salt = crypto.randomBytes(16);
    const key = await deriveKey(pin, salt);
    return {
      encrypted: encrypt(key, walletData),
      salt: salt.toString('hex'),
    };
  }

  // Decrypt wallet with PIN and salt
  static async decryptWallet(pin, encryptedWallet, saltHex) {
    const salt = Buffer.from(saltHex, 'hex');
    const key = await deriveKey(pin, salt);
    return decrypt(
      key,
      encryptedWallet.iv,
      encryptedWallet.ciphertext,
      encryptedWallet.tag
    );
  }

  // Create and verify sessions
  static createSession(userId) {
    return createSessionToken(userId);
  }
  static verifySession(token) {
    return verifySessionToken(token);
  }

  // Recovery OTP methods
  static generateOtp(target) {
    return generateOtp(target);
  }
  static verifyOtp(target, otp) {
    return verifyOtp(target, otp);
  }

  // Recovery flow
  static initiateRecovery(email, phone, encryptedWallet, salt) {
    return initiateRecovery(email, phone, encryptedWallet, salt);
  }
  static verifyRecovery(email, phone, emailOtp, smsOtp) {
    return verifyRecovery(email, phone, emailOtp, smsOtp);
  }
  static resetPin(email, phone, newPin) {
    return resetPin(email, phone, newPin);
  }

  // Trusted device management
  static addTrustedDevice(userId, deviceId) {
    return addTrustedDevice(userId, deviceId);
  }
  static isTrustedDevice(userId, deviceId) {
    return isTrustedDevice(userId, deviceId);
  }
  static removeTrustedDevice(userId, deviceId) {
    return removeTrustedDevice(userId, deviceId);
  }
}
