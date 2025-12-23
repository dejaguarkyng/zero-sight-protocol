import { generateOtp, verifyOtp } from './otpManager.js';
import { deriveKey } from '../key/deriveKey.js';
import { encrypt } from '../crypto/encrypt.js';
import { decrypt } from '../crypto/decrypt.js';
import { generateSalt } from '../key/entropy.js';

// In-memory temporary store (use DB in production)
const recoverySessions = new Map(); // key: email+phone, value: { encryptedWallet, salt }

function combineSecret(email, phone) {
  return `${email}:${phone}`;
}

/**
 * Step 1: Initiate recovery — generate OTPs and store session.
 */
export async function initiateRecovery(email, phone, encryptedWallet, salt) {
  const otpEmail = generateOtp(email);
  const otpSMS = generateOtp(phone);

  const recoveryKey = combineSecret(email, phone);
  recoverySessions.set(recoveryKey, { encryptedWallet, salt });

  return { otpEmail, otpSMS };
}

/**
 * Step 2: Verify both OTPs before allowing PIN reset.
 */
export function verifyRecovery(email, phone, emailOtp, smsOtp) {
  const isEmailValid = verifyOtp(email, emailOtp);
  const isSMSValid = verifyOtp(phone, smsOtp);
  return isEmailValid && isSMSValid;
}

/**
 * Step 3: Reset PIN securely by decrypting with recovery secret and re-encrypting.
 */
export async function resetPin(email, phone, newPin) {
  const recoveryKey = combineSecret(email, phone);
  const session = recoverySessions.get(recoveryKey);
  if (!session) throw new Error('No recovery session found.');

  const { encryptedWallet, salt } = session;

  // Derive recovery key from email+phone
  const recoveryDerivedKey = await deriveKey(recoveryKey, salt);
  const decryptedWallet = decrypt(
    recoveryDerivedKey,
    encryptedWallet.iv,
    encryptedWallet.ciphertext,
    encryptedWallet.tag
  );

  // Derive new PIN key and re-encrypt
  const newSalt = generateSalt();
  const newPinKey = await deriveKey(newPin, newSalt);
  const reEncrypted = encrypt(newPinKey, decryptedWallet);

  // Cleanup
  recoverySessions.delete(recoveryKey);

  return {
    newEncryptedWallet: reEncrypted,
    newSalt: newSalt.toString('hex')
  };
}
