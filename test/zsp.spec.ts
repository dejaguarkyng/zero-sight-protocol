import { describe, it, expect, beforeEach, vi } from 'vitest'
import ZeroSightProtocol from '../src/zsp.ts'
import { deriveKey } from '../src/key/deriveKey.ts'
import { encrypt } from '../src/crypto/encrypt.ts'
import { decrypt as decryptFn } from '../src/crypto/decrypt.ts'

describe('ZeroSightProtocol - core functionality', () => {
  beforeEach(() => {
    // Reset timers between tests
    vi.useRealTimers()
  })

  it('encryptWithSecret / decryptWithSecret roundtrip', () => {
    const secret = 'client-secret-123'
    const plaintext = 'hello world'

    const result = ZeroSightProtocol.encryptWithSecret(secret, plaintext)
    expect(result).toHaveProperty('iv')
    expect(result).toHaveProperty('ciphertext')
    expect(result).toHaveProperty('tag')

    const decrypted = ZeroSightProtocol.decryptWithSecret(secret, result.iv, result.ciphertext, result.tag)
    expect(decrypted).toBe(plaintext)
  })

  it('encryptWallet / decryptWallet roundtrip (async deriveKey)', async () => {
    const pin = '1234'
    const walletData = JSON.stringify({ addr: '0xabc', keys: ['k1'] })

    const encrypted = await ZeroSightProtocol.encryptWallet(pin, walletData)
    expect(encrypted).toHaveProperty('encrypted')
    expect(encrypted).toHaveProperty('salt')

    const decrypted = await ZeroSightProtocol.decryptWallet(pin, encrypted.encrypted, encrypted.salt)
    expect(decrypted).toBe(walletData)
  })

  it('createTimestampedPayload / validateTimestampedPayload valid and expired behavior', () => {
    const secret = 'secret-xyz'
    const data = 'pin-9876'

    // Freeze time
    const now = Date.now()
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const payload = ZeroSightProtocol.createTimestampedPayload(data, secret)
    const validated = ZeroSightProtocol.validateTimestampedPayload(payload, secret)
    expect(validated).toBe(data)

    // Advance time beyond default window (5 minutes)
    vi.setSystemTime(now + 300000 + 1000)
    expect(() => ZeroSightProtocol.validateTimestampedPayload(payload, secret)).toThrow(/Payload expired/)

    vi.useRealTimers()
  })

  it('createSession / verifySession works and expires', () => {
    const userId = 'user-1001'

    const { token, expiresAt } = ZeroSightProtocol.createSession(userId)
    const valid = ZeroSightProtocol.verifySession(token)
    expect(valid.valid).toBe(true)
    expect(valid.userId).toBe(userId)

    // Move time past expiresAt
    vi.useFakeTimers()
    vi.setSystemTime(expiresAt + 1000)

    const invalid = ZeroSightProtocol.verifySession(token)
    expect(invalid.valid).toBe(false)

    vi.useRealTimers()
  })

  it('OTP generation is one-time and respects expiry', () => {
    const target = `email+${Math.random()}@example.test`

    const otp = ZeroSightProtocol.generateOtp(target)
    expect(typeof otp).toBe('string')
    expect(otp.length).toBeGreaterThanOrEqual(4)

    // Correct OTP is valid and one-time use
    expect(ZeroSightProtocol.verifyOtp(target, otp)).toBe(true)
    expect(ZeroSightProtocol.verifyOtp(target, otp)).toBe(false) // cannot reuse

    // New OTP expires after expiry window
    const otp2 = ZeroSightProtocol.generateOtp(target)
    vi.useFakeTimers()
    // advance time beyond OTP_EXPIRY_MS (5 minutes) + 1s
    vi.setSystemTime(Date.now() + 1000 * 60 * 5 + 1000)
    expect(ZeroSightProtocol.verifyOtp(target, otp2)).toBe(false)
    vi.useRealTimers()
  })

  it('recovery flow: initiate -> verify -> resetPin', async () => {
    const email = `user+${Math.random()}@test`;
    const phone = `+1555${Math.floor(Math.random() * 10000)}`;

    const originalPin = 'origPin42'
    const walletData = JSON.stringify({ secret: 'vault-data' })

    // Choose a random salt for the recovery session
    const salt = Buffer.from('abcd1234abcd1234', 'hex')

    // Derive recovery key from email+phone and encrypt wallet
    const recoveryKey = `${email}:${phone}`
    const recoveryDerivedKey = await deriveKey(recoveryKey, salt)
    const encryptedWallet = encrypt(recoveryDerivedKey, walletData)

    // Initiate recovery (returns the OTPs)
    const { otpEmail, otpSMS } = await ZeroSightProtocol.initiateRecovery(email, phone, encryptedWallet, salt)
    // Verify OTPs
    const ok = ZeroSightProtocol.verifyRecovery(email, phone, otpEmail, otpSMS)
    expect(ok).toBe(true)

    // Reset PIN to a new pin
    const newPin = 'newPin999'
    const { newEncryptedWallet, newSalt } = await ZeroSightProtocol.resetPin(email, phone, newPin)
    expect(newEncryptedWallet).toHaveProperty('iv')
    expect(newSalt).toBeTruthy()

    // Decrypt with derived key from newPin+newSalt and confirm it matches original
    const newKey = await deriveKey(newPin, Buffer.from(newSalt, 'hex'))
    const decrypted = decryptFn(newKey, newEncryptedWallet.iv, newEncryptedWallet.ciphertext, newEncryptedWallet.tag)
    expect(decrypted).toBe(walletData)
  })

  it('trusted device add/is/remove behave correctly', () => {
    const userId = `u-${Math.random()}`
    const deviceId = `d-${Math.random()}`

    expect(ZeroSightProtocol.isTrustedDevice(userId, deviceId)).toBe(false)
    ZeroSightProtocol.addTrustedDevice(userId, deviceId)
    expect(ZeroSightProtocol.isTrustedDevice(userId, deviceId)).toBe(true)
    ZeroSightProtocol.removeTrustedDevice(userId, deviceId)
    expect(ZeroSightProtocol.isTrustedDevice(userId, deviceId)).toBe(false)
  })
})
