import crypto from "crypto"
import { generateIV } from "../key/entropy.js"

export interface EncryptedData {
  iv: string
  ciphertext: string
  tag: string
}

/**
 * Encrypts plaintext data using AES-256-GCM.
 * @param {Buffer} key - A 32-byte encryption key.
 * @param {string|Buffer} data - Plaintext to encrypt.
 * @returns {{ iv: string, ciphertext: string, tag: string }}
 */
export function encrypt(key: Buffer, data: string | Buffer): EncryptedData {
  const iv = generateIV()
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)

  const ciphertext = Buffer.concat([
    typeof data === "string" ? cipher.update(data, "utf8") : cipher.update(data),
    cipher.final(),
  ])

  const tag = cipher.getAuthTag()

  return {
    iv: iv.toString("hex"),
    ciphertext: ciphertext.toString("hex"),
    tag: tag.toString("hex"),
  }
}

/**
 * Encrypts data using a client secret (hashed to 32-byte key).
 * @param {string} clientSecret - The client secret to hash for encryption.
 * @param {string|Buffer} plaintext - Data to encrypt.
 * @returns {{ iv: string, ciphertext: string, tag: string }}
 */
export function encryptWithSecret(clientSecret: string, plaintext: string | Buffer): EncryptedData {
  const key = crypto.createHash("sha256").update(clientSecret).digest()
  const iv = generateIV()
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)

  const ciphertext = Buffer.concat([
    typeof plaintext === "string" ? cipher.update(plaintext, "utf8") : cipher.update(plaintext),
    cipher.final(),
  ])

  const tag = cipher.getAuthTag()

  return {
    iv: iv.toString("hex"),
    ciphertext: ciphertext.toString("hex"),
    tag: tag.toString("hex"),
  }
}
