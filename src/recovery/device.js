// Simple trusted device management (in-memory store for demo; replace with DB)

const trustedDevices = new Map(); // userId -> Set of deviceIds

/**
 * Add a device as trusted for a user
 * @param {string} userId 
 * @param {string} deviceId 
 */
export function addTrustedDevice(userId, deviceId) {
  if (!trustedDevices.has(userId)) {
    trustedDevices.set(userId, new Set());
  }
  trustedDevices.get(userId).add(deviceId);
}

/**
 * Check if device is trusted for user
 * @param {string} userId 
 * @param {string} deviceId 
 * @returns {boolean}
 */
export function isTrustedDevice(userId, deviceId) {
  return trustedDevices.has(userId) && trustedDevices.get(userId).has(deviceId);
}

/**
 * Remove a trusted device
 * @param {string} userId 
 * @param {string} deviceId 
 */
export function removeTrustedDevice(userId, deviceId) {
  if (trustedDevices.has(userId)) {
    trustedDevices.get(userId).delete(deviceId);
    if (trustedDevices.get(userId).size === 0) {
      trustedDevices.delete(userId);
    }
  }
}
