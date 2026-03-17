import crypto from "crypto";
const SECRET = process.env.ZSP_SESSION_SECRET || "fallback_dev_secret";
const TOKEN_VALIDITY_MS = 1000 * 60 * 10;
export function createSessionToken(userId) {
    const expiresAt = Date.now() + TOKEN_VALIDITY_MS;
    const payload = `${userId}.${expiresAt}`;
    const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    const token = `${payload}.${signature}`;
    return { token, expiresAt };
}
export function verifySessionToken(token) {
    if (!token)
        return { valid: false };
    const [userId, expiresAtStr, signature] = token.split(".");
    if (!userId || !expiresAtStr || !signature)
        return { valid: false };
    const expectedSig = crypto
        .createHmac("sha256", SECRET)
        .update(`${userId}.${expiresAtStr}`)
        .digest("hex");
    const isValidSig = expectedSig === signature;
    const isNotExpired = Number.parseInt(expiresAtStr, 10) > Date.now();
    return {
        valid: isValidSig && isNotExpired,
        userId: isValidSig ? userId : undefined,
    };
}
