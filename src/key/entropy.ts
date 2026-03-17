import crypto from "crypto"

export function generateIV(): Buffer {
  return crypto.randomBytes(16)
}

export function generateSalt(): Buffer {
  return crypto.randomBytes(32)
}
