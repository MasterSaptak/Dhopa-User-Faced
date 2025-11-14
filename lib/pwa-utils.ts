export async function checkForUpdates(): Promise<boolean> {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.update()
      return !!registration.waiting
    }
  }
  return false
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false

  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
}

export function canInstallPWA(): boolean {
  if (typeof window === "undefined") return false
  return "BeforeInstallPromptEvent" in window
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) {
    return false
  }

  try {
    const isPersisted = await navigator.storage.persist()
    console.log("[v0] Persistent storage:", isPersisted)
    return isPersisted
  } catch (error) {
    console.error("[v0] Failed to request persistent storage:", error)
    return false
  }
}

export async function getStorageEstimate(): Promise<{
  usage: number
  quota: number
  percentage: number
} | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    const usage = estimate.usage || 0
    const quota = estimate.quota || 0
    const percentage = quota > 0 ? (usage / quota) * 100 : 0

    return { usage, quota, percentage }
  } catch (error) {
    console.error("[v0] Failed to get storage estimate:", error)
    return null
  }
}
