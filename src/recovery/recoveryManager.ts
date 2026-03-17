import { generateOtp, verifyOtp } from "./otpManager.js"
import { deriveKey } from "../key/deriveKey.js"
import { encrypt } from "../crypto/encrypt.js"
import { decrypt } from "../crypto/decrypt.js"
import { generateSalt } from "../key/entropy.js"

interface EncryptedPayload {
  iv: string
  ciphertext: string
  tag: string
}

interface RecoverySession {
  encryptedWallet: EncryptedPayload
  salt: Buffer | string
}

const recoverySessions = new Map<string, RecoverySession>()

function combineSecret(email: string, phone: string): string {
  return `${email}:${phone}`
}

export async function initiateRecovery(
  email: string,
  phone: string,
  encryptedWallet: EncryptedPayload,
  salt: Buffer | string,
): Promise<{ otpEmail: string; otpSMS: string }> {
  const otpEmail = generateOtp(email)
  const otpSMS = generateOtp(phone)

  const recoveryKey = combineSecret(email, phone)
  recoverySessions.set(recoveryKey, { encryptedWallet, salt })

  return { otpEmail, otpSMS }
}

export function verifyRecovery(email: string, phone: string, emailOtp: string, smsOtp: string): boolean {
  const isEmailValid = verifyOtp(email, emailOtp)
  const isSMSValid = verifyOtp(phone, smsOtp)
  return isEmailValid && isSMSValid
}

export async function resetPin(
  email: string,
  phone: string,
  newPin: string,
): Promise<{ newEncryptedWallet: EncryptedPayload; newSalt: string }> {
  const recoveryKey = combineSecret(email, phone)
  const session = recoverySessions.get(recoveryKey)
  if (!session) throw new Error("No recovery session found.")

  const { encryptedWallet, salt } = session

  const recoveryDerivedKey = await deriveKey(recoveryKey, salt)
  const decryptedWallet = decrypt(
    recoveryDerivedKey,
    encryptedWallet.iv,
    encryptedWallet.ciphertext,
    encryptedWallet.tag,
  )

  const newSalt = generateSalt()
  const newPinKey = await deriveKey(newPin, newSalt)
  const reEncrypted = encrypt(newPinKey, decryptedWallet)

  recoverySessions.delete(recoveryKey)

  return {
    newEncryptedWallet: reEncrypted,
    newSalt: newSalt.toString("hex"),
  }
}
