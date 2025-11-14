"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { isStandalone } from "@/lib/pwa-utils"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) {
      return
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("[v0] Install prompt outcome:", outcome)

    if (outcome === "accepted") {
      console.log("[v0] PWA installed")
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom">
      <div className="rounded-lg border border-cyan-500/20 bg-slate-900/95 backdrop-blur-xl p-4 shadow-lg">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
              <Download className="h-6 w-6 text-cyan-500" />
            </div>
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Install DHOPA App</h3>
            <p className="text-xs text-slate-400 mb-3">
              Install our app for quick access, offline support, and a better experience
            </p>

            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="text-xs h-8">
                Install
              </Button>
              <Button onClick={handleDismiss} variant="ghost" size="sm" className="text-xs h-8">
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
