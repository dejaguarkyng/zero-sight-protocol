# Zero Sight Protocol (ZSP)

![npm](https://img.shields.io/npm/v/zero-sight-protocol.svg)
![License](https://img.shields.io/npm/l/zero-sight-protocol.svg)
![Build](https://github.com/dejaguarkyng/zsp/actions/workflows/ci.yml/badge.svg)
![Tests](https://img.shields.io/badge/tests-vitest-blue)

Zero Sight Protocol is a general-purpose cryptographic toolkit for protecting sensitive application data. It provides AES-256-GCM encryption helpers, timestamped encrypted payloads, HMAC session tokens, OTP-based recovery flow primitives, and trusted-device tracking.

Requirements:
- Node.js 16+

## Features

- Data encryption with secret-derived keys
- Data encryption with user-provided PIN/passphrase-derived keys
- Timestamped encrypted payload creation and validation
- Signed session token generation and verification
- One-time-password generation and verification
- Multi-factor recovery orchestration (email + phone OTP)
- Trusted-device list management per user

## Installation

With pnpm:

```bash
pnpm add zero-sight-protocol
```

With npm:

```bash
npm install zero-sight-protocol
```

With yarn:

```bash
yarn add zero-sight-protocol
```

This package is ESM-only and should be used with import syntax.

## Quick Start

```js
import ZeroSightProtocol from "zero-sight-protocol"

const secret = process.env.APP_CLIENT_SECRET
const payload = JSON.stringify({
  userId: "u_123",
  scope: ["read", "write"],
})

const encrypted = ZeroSightProtocol.encryptWithSecret(secret, payload)
const decrypted = ZeroSightProtocol.decryptWithSecret(
  secret,
  encrypted.iv,
  encrypted.ciphertext,
  encrypted.tag,
)

console.log(JSON.parse(decrypted))
```

## API

### Encryption

encryptWallet(pin, walletData)
- Derives a key from pin and a random salt, then encrypts walletData.
- Returns: { encrypted: { iv, ciphertext, tag }, salt }

decryptWallet(pin, encryptedWallet, saltHex)
- Derives the key from pin + saltHex and decrypts encryptedWallet.
- Returns: decrypted plaintext string.

encryptWithSecret(clientSecret, plaintext)
- Hashes clientSecret to a 32-byte key and encrypts plaintext.
- Returns: { iv, ciphertext, tag }

decryptWithSecret(clientSecret, ivHex, ciphertextHex, tagHex)
- Decrypts ciphertext produced by encryptWithSecret.
- Returns: decrypted plaintext string.

### Timestamped Payloads

createTimestampedPayload(data, clientSecret)
- Encrypts data and wraps it with a timestamp.
- Returns: base64-encoded payload string.

validateTimestampedPayload(encryptedPayload, clientSecret, timeWindowMs = 300000)
- Validates payload age and decrypts the payload.
- Default time window: 5 minutes.
- Throws when payload is invalid or expired.

### Sessions

createSession(userId)
- Generates an HMAC-signed session token.
- Returns: { token, expiresAt }

verifySession(token)
- Verifies signature and expiry.
- Returns: { valid: boolean, userId?: string }

### OTP and Recovery

generateOtp(target)
- Generates and stores a one-time password for target.
- Returns: OTP string.

verifyOtp(target, otp)
- Verifies OTP and enforces one-time usage.
- Returns: boolean.

initiateRecovery(email, phone, encryptedWallet, salt)
- Generates OTPs for email and phone and stores an in-memory recovery session.
- Returns: { otpEmail, otpSMS }

verifyRecovery(email, phone, emailOtp, smsOtp)
- Verifies email and phone OTPs.
- Returns: boolean.

resetPin(email, phone, newPin)
- Re-derives recovery key from email:phone, decrypts existing encrypted payload, then re-encrypts using newPin.
- Returns: { newEncryptedWallet, newSalt }

### Trusted Devices

addTrustedDevice(userId, deviceId)
- Marks device as trusted for a user.

isTrustedDevice(userId, deviceId)
- Checks whether a device is trusted.
- Returns: boolean.

removeTrustedDevice(userId, deviceId)
- Removes a trusted device association.

## Security Notes

- Keep client secrets in secure secret management or environment variables.
- Use HTTPS/TLS for all payload transport.
- Handle decryption and verification failures without leaking internals.
- Keep salts and encrypted payloads stored together so decryption can be performed later.
- Current OTP, recovery-session, and trusted-device stores are in-memory. Replace these with persistent storage for production deployments.

## Development

Install dependencies:

```bash
pnpm install
```

Run tests:

```bash
pnpm test
```

Build TypeScript output:

```bash
pnpm build
```

Type-check only:

```bash
pnpm typecheck
```

## License

MIT
