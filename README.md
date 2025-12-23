# Zero Sight Protocol (ZSP)

A robust, production-ready cryptographic library for secure wallet encryption, recovery management, and session handling. Includes client secret-based encryption for app-level PIN protection.

## Features

- **Wallet Encryption**: AES-256-GCM encryption with PBKDF2-derived keys
- **Client Secret Encryption**: Direct encryption/decryption using client secrets (hashed to 32-byte keys)
- **Timestamped Payloads**: Secure PIN transmission with expiration validation
- **Session Management**: Secure session token creation and verification
- **OTP Recovery**: One-time password generation and verification
- **Recovery Flow**: Multi-step recovery process with email and SMS verification
- **Trusted Device Management**: Track and manage trusted devices per user

## Installation

```bash
npm install zero-sight-protocol
```

## Quick Start

### Basic Wallet Encryption

```javascript
import ZeroSightProtocol from 'zero-sight-protocol'

// Encrypt a wallet with a PIN
const pin = '1234'
const walletData = JSON.stringify({ address: '0x...', privateKey: '...' })
const encrypted = await ZeroSightProtocol.encryptWallet(pin, walletData)
// encrypted = { encrypted: { iv, ciphertext, tag }, salt }

// Decrypt the wallet
const decrypted = await ZeroSightProtocol.decryptWallet(pin, encrypted.encrypted, encrypted.salt)
console.log(decrypted) // Original wallet data
```

### Client Secret Encryption

Encrypt/decrypt data using a client secret (ideal for app-level PIN protection):

```javascript
import ZeroSightProtocol from 'zero-sight-protocol'

const clientSecret = 'your-app-secret-key'
const plaintext = '1234' // The PIN

// Encrypt
const result = ZeroSightProtocol.encryptWithSecret(clientSecret, plaintext)
// result = { iv, ciphertext, tag } (all hex-encoded)

// Decrypt
const decrypted = ZeroSightProtocol.decryptWithSecret(
  clientSecret,
  result.iv,
  result.ciphertext,
  result.tag
)
console.log(decrypted) // '1234'
```

### Timestamped Payload (Recommended for PIN Transmission)

Create secure, timestamped encrypted payloads with automatic expiration:

```javascript
import ZeroSightProtocol from 'zero-sight-protocol'

const clientSecret = 'your-app-secret-key'
const pin = '1234'

// Create a timestamped payload
const payload = ZeroSightProtocol.createTimestampedPayload(pin, clientSecret)
// payload = Base64-encoded JSON with encrypted data, IV, tag, and timestamp

// Validate and decrypt (default 5-minute window)
const decrypted = ZeroSightProtocol.validateTimestampedPayload(payload, clientSecret)
console.log(decrypted) // '1234'

// Custom time window (10 minutes)
const decrypted2 = ZeroSightProtocol.validateTimestampedPayload(
  payload,
  clientSecret,
  600000 // 10 minutes in milliseconds
)

// Throws error if payload is expired or invalid
```

## API Reference

### Encryption Methods

#### `encryptWallet(pin, walletData)`
Encrypts wallet data using a PIN with PBKDF2 key derivation.

**Parameters:**
- `pin` (string): The user's PIN
- `walletData` (string|Buffer): Data to encrypt

**Returns:** `{ encrypted: { iv, ciphertext, tag }, salt }`

#### `decryptWallet(pin, encryptedWallet, saltHex)`
Decrypts wallet data using a PIN and salt.

**Parameters:**
- `pin` (string): The user's PIN
- `encryptedWallet` (object): Result from `encryptWallet().encrypted`
- `saltHex` (string): Hex-encoded salt from `encryptWallet().salt`

**Returns:** Decrypted plaintext (string)

#### `encryptWithSecret(clientSecret, plaintext)`
Encrypts data using a client secret (SHA-256 hashed to 32-byte key).

**Parameters:**
- `clientSecret` (string): The client secret
- `plaintext` (string|Buffer): Data to encrypt

**Returns:** `{ iv, ciphertext, tag }` (all hex-encoded)

#### `decryptWithSecret(clientSecret, ivHex, ciphertextHex, tagHex)`
Decrypts data using a client secret.

**Parameters:**
- `clientSecret` (string): The client secret
- `ivHex` (string): Hex-encoded IV
- `ciphertextHex` (string): Hex-encoded ciphertext
- `tagHex` (string): Hex-encoded GCM authentication tag

**Returns:** Decrypted plaintext (string)

### Timestamped Payload Methods

#### `createTimestampedPayload(data, clientSecret)`
Creates a secure timestamped encrypted payload.

**Parameters:**
- `data` (string): Data to encrypt (e.g., PIN)
- `clientSecret` (string): The client secret

**Returns:** Base64-encoded JSON payload with `encryptedPin`, `iv`, `tag`, and `timestamp`

#### `validateTimestampedPayload(encryptedPayload, clientSecret, timeWindowMs)`
Validates timestamp and decrypts payload.

**Parameters:**
- `encryptedPayload` (string): Base64-encoded payload
- `clientSecret` (string): The client secret
- `timeWindowMs` (number): Maximum age in milliseconds (default: 300000 = 5 minutes)

**Returns:** Decrypted plaintext

**Throws:** Error if payload is expired or invalid

### Session Management

#### `createSession(userId)`
Creates a secure session token.

**Parameters:**
- `userId` (string): The user ID

**Returns:** Session token (string)

#### `verifySession(token)`
Verifies and decodes a session token.

**Parameters:**
- `token` (string): The session token

**Returns:** Session data or null if invalid

### Recovery Methods

#### `generateOtp(target)`
Generates a one-time password for recovery.

**Parameters:**
- `target` (string): Email or phone number

**Returns:** OTP (string)

#### `verifyOtp(target, otp)`
Verifies an OTP.

**Parameters:**
- `target` (string): Email or phone number
- `otp` (string): The OTP to verify

**Returns:** Boolean

#### `initiateRecovery(email, phone, encryptedWallet, salt)`
Initiates the recovery flow by sending OTPs.

**Parameters:**
- `email` (string): User's email
- `phone` (string): User's phone number
- `encryptedWallet` (object): Encrypted wallet data
- `salt` (string): Hex-encoded salt

**Returns:** Recovery session data

#### `verifyRecovery(email, phone, emailOtp, smsOtp)`
Verifies both email and SMS OTPs during recovery.

**Parameters:**
- `email` (string): User's email
- `phone` (string): User's phone number
- `emailOtp` (string): Email OTP
- `smsOtp` (string): SMS OTP

**Returns:** Boolean

#### `resetPin(email, phone, newPin)`
Resets the user's PIN after successful recovery.

**Parameters:**
- `email` (string): User's email
- `phone` (string): User's phone number
- `newPin` (string): The new PIN

**Returns:** Updated encrypted wallet data

### Trusted Device Management

#### `addTrustedDevice(userId, deviceId)`
Adds a device to the user's trusted devices list.

**Parameters:**
- `userId` (string): The user ID
- `deviceId` (string): The device ID

**Returns:** Result object

#### `isTrustedDevice(userId, deviceId)`
Checks if a device is trusted.

**Parameters:**
- `userId` (string): The user ID
- `deviceId` (string): The device ID

**Returns:** Boolean

#### `removeTrustedDevice(userId, deviceId)`
Removes a device from the trusted devices list.

**Parameters:**
- `userId` (string): The user ID
- `deviceId` (string): The device ID

**Returns:** Result object

## Architecture

### File Structure

```
src/
├── crypto/
│   ├── encrypt.js          # AES-256-GCM encryption
│   ├── decrypt.js          # AES-256-GCM decryption
│   ├── hash.js             # Hashing utilities
│   └── payload.js          # Timestamped payload handling
├── key/
│   ├── deriveKey.js        # PBKDF2 key derivation
│   └── entropy.js          # IV generation
├── session/
│   └── sessionManager.js    # Session token management
├── recovery/
│   ├── otpManager.js       # OTP generation and verification
│   ├── recoveryManager.js  # Recovery flow management
│   └── device.js           # Trusted device tracking
└── zsp.js                  # Main library export
```

### Cryptographic Standards

- **Encryption Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with SHA-256 (for PIN-based encryption)
- **Client Secret Hashing**: SHA-256
- **IV Size**: 96 bits (12 bytes) for GCM
- **Auth Tag Size**: 128 bits (16 bytes)
- **Random Number Generation**: Node.js crypto.randomBytes()

## Security Considerations

1. **Key Storage**: Store client secrets securely (environment variables, key management systems)
2. **PIN Security**: Encourage strong PINs; consider implementing rate limiting for failed attempts
3. **Payload Expiration**: Always validate timestamps; adjust `timeWindowMs` based on your security requirements
4. **Transport Security**: Transmit encrypted payloads over HTTPS only
5. **Error Handling**: Don't expose decryption errors to users; log them securely
6. **Salt Storage**: Store salts with encrypted wallets; they don't need to be secret but must be retained for decryption

## Usage Examples

### Migrating from utils/appZsp.utils.js

Replace custom implementation with native ZSP methods:

```javascript
// Old way (custom implementation)
// const { encryptPin, decryptPin } = require('./utils/appZsp.utils.js')

import ZeroSightProtocol from 'zero-sight-protocol'

const clientSecret = process.env.APP_CLIENT_SECRET
const pin = '1234'

// Encrypt
const encrypted = ZeroSightProtocol.encryptWithSecret(clientSecret, pin)

// Create timestamped payload for transmission
const payload = ZeroSightProtocol.createTimestampedPayload(pin, clientSecret)

// Validate and decrypt
const decrypted = ZeroSightProtocol.validateTimestampedPayload(payload, clientSecret)
```

### Server-Side PIN Validation

```javascript
import ZeroSightProtocol from 'zero-sight-protocol'

async function validateUserPin(encryptedPayload, clientSecret) {
  try {
    const pin = ZeroSightProtocol.validateTimestampedPayload(encryptedPayload, clientSecret)
    // Use pin for authentication/wallet operations
    return { success: true, pin }
  } catch (error) {
    if (error.message.includes('expired')) {
      return { success: false, error: 'PIN request expired. Please try again.' }
    }
    return { success: false, error: 'Invalid PIN request.' }
  }
}
```

## Testing

The library includes comprehensive tests for all cryptographic operations. Run tests with:

```bash
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass and add new tests for any new functionality.
