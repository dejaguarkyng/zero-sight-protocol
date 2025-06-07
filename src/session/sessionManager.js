import crypto from 'crypto';

const SECRET = process.env.ZSP_SESSION_SECRET || 'fallback_dev_secret';
const TOKEN_VALIDITY_MS = 1000 * 60 * 10; // 10 minutes

/**
 * Generates an HMAC-signed session token.
 * @param {string} userId
 * @returns {{ token: string, expiresAt: number }}
 */
export function createSessionToken(userId) {
  const expiresAt = Date.now() + TOKEN_VALIDITY_MS;
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');

  const token = `${payload}.${signature}`;
  return { token, expiresAt };
}

/**
 * Verifies the session token's integrity and expiry.
 * @param {string} token
 * @returns {{ valid: boolean, userId?: string }}
 */
export function verifySessionToken(token) {
  if (!token) return { valid: false };

  const [userId, expiresAtStr, signature] = token.split('.');
  if (!userId || !expiresAtStr || !signature) return { valid: false };

  const expectedSig = crypto
    .createHmac('sha256', SECRET)
    .update(`${userId}.${expiresAtStr}`)
    .digest('hex');

  const isValidSig = expectedSig === signature;
  const isNotExpired = parseInt(expiresAtStr) > Date.now();

  return {
    valid: isValidSig && isNotExpired,
    userId: isValidSig ? userId : undefined,
  };
}
