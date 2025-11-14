"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      const reloadPage = () => {
        if (typeof window !== "undefined") {
          window.location.reload()
        }
      }

      const shouldReload = () => {
        if (typeof window !== "undefined" && typeof window.confirm === "function") {
          return window.confirm("New version available! Reload to update?")
        }

        return false
      }

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[v0] Service Worker registered:", registration)

          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60000) // Check every minute

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New version available
                  console.log("[v0] New version available")
                  if (shouldReload()) {
                    newWorker.postMessage({ type: "SKIP_WAITING" })
                    reloadPage()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("[v0] Service Worker registration failed:", error)
        })

      // Handle service worker updates
      let refreshing = false
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true
          reloadPage()
        }
      })
    }
  }, [])

  return null
}
