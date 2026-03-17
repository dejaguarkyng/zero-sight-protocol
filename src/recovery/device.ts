const trustedDevices = new Map<string, Set<string>>()

export function addTrustedDevice(userId: string, deviceId: string): void {
  if (!trustedDevices.has(userId)) {
    trustedDevices.set(userId, new Set())
  }
  trustedDevices.get(userId)!.add(deviceId)
}

export function isTrustedDevice(userId: string, deviceId: string): boolean {
  return trustedDevices.has(userId) && trustedDevices.get(userId)!.has(deviceId)
}

export function removeTrustedDevice(userId: string, deviceId: string): void {
  if (!trustedDevices.has(userId)) return

  const deviceSet = trustedDevices.get(userId)!
  deviceSet.delete(deviceId)

  if (deviceSet.size === 0) {
    trustedDevices.delete(userId)
  }
}
