import crypto from 'crypto';

const otpStore = new Map(); // key: target (email/phone), value: { otp, expiresAt }
const OTP_EXPIRY_MS = 1000 * 60 * 5; // 5 minutes

function generateRandomOtp(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/**
 * Generates and stores an OTP for the given target (email or phone).
 */
export function generateOtp(target) {
  const otp = generateRandomOtp();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  otpStore.set(target, { otp, expiresAt });

  return otp;
}

/**
 * Verifies a submitted OTP.
 */
export function verifyOtp(target, inputOtp) {
  const record = otpStore.get(target);
  if (!record) return false;

  const isExpired = Date.now() > record.expiresAt;
  const isValid = inputOtp === record.otp;

  if (isValid || isExpired) {
    otpStore.delete(target); // one-time use
  }

  return isValid && !isExpired;
}

/**
 * Clear expired OTPs (optional cleanup).
 */
export function clearExpiredOtps() {
  const now = Date.now();
  for (const [key, { expiresAt }] of otpStore.entries()) {
    if (expiresAt < now) otpStore.delete(key);
  }
}
