import crypto from "crypto";
export function generateIV() {
    return crypto.randomBytes(16);
}
export function generateSalt() {
    return crypto.randomBytes(32);
}
