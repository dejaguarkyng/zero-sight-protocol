/**
 * Zero Sight Protocol - Cryptographic Protocol for Secure PIN Management
 */

export interface EncryptedData {
  iv: string
  ciphertext: string
  tag: string
}

export interface EncryptedWallet {
  encrypted: EncryptedData
  salt: string
}

export interface SessionToken {
  token: string
  userId: string
  expiresAt: number
}

export interface OtpResult {
  target: string
  expiresAt: number
  attempts: number
}

export interface RecoverySession {
  id: string
  email?: string
  phone?: string
  status: string
  encryptedWallet: EncryptedData
  salt: string
}

export interface TrustedDevice {
  userId: string
  deviceId: string
  addedAt: number
}

declare class ZeroSightProtocol {
  /**
   * Encrypts wallet data with a user PIN
   */
  static encryptWallet(pin: string, walletData: string): Promise<EncryptedWallet>

  /**
   * Decrypts wallet with PIN and salt
   */
  static decryptWallet(pin: string, encryptedWallet: EncryptedData, saltHex: string): Promise<string>

  /**
   * Encrypts data using a client secret (app-level PIN encryption)
   */
  static encryptWithSecret(clientSecret: string, plaintext: string): EncryptedData

  /**
   * Decrypts data using a client secret
   */
  static decryptWithSecret(clientSecret: string, ivHex: string, ciphertextHex: string, tagHex: string): string

  /**
   * Creates a timestamped encrypted payload for secure PIN transmission
   */
  static createTimestampedPayload(data: string, clientSecret: string): string

  /**
   * Validates and decrypts a timestamped payload
   */
  static validateTimestampedPayload(encryptedPayload: string, clientSecret: string, timeWindowMs?: number): string

  /**
   * Creates a session token for a user
   */
  static createSession(userId: string): SessionToken

  /**
   * Verifies and decodes a session token
   */
  static verifySession(token: string): SessionToken | null

  /**
   * Generates an OTP for recovery
   */
  static generateOtp(target: string): OtpResult

  /**
   * Verifies an OTP
   */
  static verifyOtp(target: string, otp: string): boolean

  /**
   * Initiates account recovery
   */
  static initiateRecovery(
    email: string | undefined,
    phone: string | undefined,
    encryptedWallet: EncryptedData,
    salt: string,
  ): RecoverySession

  /**
   * Verifies recovery with OTPs
   */
  static verifyRecovery(
    email: string | undefined,
    phone: string | undefined,
    emailOtp: string | undefined,
    smsOtp: string | undefined,
  ): boolean

  /**
   * Resets PIN during recovery
   */
  static resetPin(email: string | undefined, phone: string | undefined, newPin: string): EncryptedWallet

  /**
   * Adds a trusted device
   */
  static addTrustedDevice(userId: string, deviceId: string): TrustedDevice

  /**
   * Checks if a device is trusted
   */
  static isTrustedDevice(userId: string, deviceId: string): boolean

  /**
   * Removes a trusted device
   */
  static removeTrustedDevice(userId: string, deviceId: string): boolean
}

export default ZeroSightProtocol
