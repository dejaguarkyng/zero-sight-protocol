type OtpRecord = { otp: string; expiresAt: number }

const otpStore = new Map<string, OtpRecord>()
const OTP_EXPIRY_MS = 1000 * 60 * 5

function generateRandomOtp(length = 6): string {
  const digits = "0123456789"
  let otp = ""
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)]
  }
  return otp
}

export function generateOtp(target: string): string {
  const otp = generateRandomOtp()
  const expiresAt = Date.now() + OTP_EXPIRY_MS
  otpStore.set(target, { otp, expiresAt })
  return otp
}

export function verifyOtp(target: string, inputOtp: string): boolean {
  const record = otpStore.get(target)
  if (!record) return false

  const isExpired = Date.now() > record.expiresAt
  const isValid = inputOtp === record.otp

  if (isValid || isExpired) {
    otpStore.delete(target)
  }

  return isValid && !isExpired
}

export function clearExpiredOtps(): void {
  const now = Date.now()
  for (const [key, { expiresAt }] of otpStore.entries()) {
    if (expiresAt < now) otpStore.delete(key)
  }
}
