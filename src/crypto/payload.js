import { encryptWithSecret } from "./encrypt.js"
import { decryptWithSecret } from "./decrypt.js"

/**
 * Creates a timestamped encrypted payload for secure PIN transmission.
 * @param {string} data - The data to encrypt (e.g., PIN).
 * @param {string} clientSecret - The client secret for encryption.
 * @returns {string} - Base64-encoded JSON payload with encrypted data, IV, tag, and timestamp.
 */
export function createTimestampedPayload(data, clientSecret) {
  const encrypted = encryptWithSecret(clientSecret, data)
  const payload = {
    encryptedPin: encrypted.ciphertext,
    iv: encrypted.iv,
    tag: encrypted.tag,
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

/**
 * Validates and decrypts a timestamped encrypted payload.
 * @param {string} encryptedPayload - Base64-encoded payload.
 * @param {string} clientSecret - The client secret for decryption.
 * @param {number} timeWindowMs - Maximum age of payload in milliseconds (default: 5 minutes).
 * @returns {string} - Decrypted plaintext if valid, throws error otherwise.
 */
export function validateTimestampedPayload(encryptedPayload, clientSecret, timeWindowMs = 300000) {
  const payloadBuffer = Buffer.from(encryptedPayload, "base64")
  const payload = JSON.parse(payloadBuffer.toString("utf8"))

  // Validate timestamp
  const currentTime = Date.now()
  const payloadAge = currentTime - payload.timestamp

  if (payloadAge > timeWindowMs) {
    throw new Error(`Payload expired: ${payloadAge}ms old (max: ${timeWindowMs}ms)`)
  }

  // Decrypt and return
  return decryptWithSecret(clientSecret, payload.iv, payload.encryptedPin, payload.tag)
}
