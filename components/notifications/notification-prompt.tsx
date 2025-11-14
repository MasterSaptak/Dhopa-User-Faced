"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePushNotifications } from "@/hooks/use-push-notifications"

interface NotificationPromptProps {
  userId?: string
}

export function NotificationPrompt({ userId }: NotificationPromptProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { permission, isSupported, requestPermission } = usePushNotifications(userId)

  useEffect(() => {
    // Show prompt if notifications are supported and permission not granted
    if (isSupported && permission === "default") {
      // Wait a bit before showing prompt
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isSupported, permission])

  if (!isVisible || permission !== "default") {
    return null
  }

  const handleEnable = async () => {
    const granted = await requestPermission()
    if (granted) {
      setIsVisible(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="rounded-lg border border-cyan-500/20 bg-slate-900/95 backdrop-blur-xl p-4 shadow-lg">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
              <Bell className="h-5 w-5 text-cyan-500" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-100">Enable Notifications</h3>
            <p className="mt-1 text-xs text-slate-400">Get instant updates when your order status changes</p>

            <div className="mt-3 flex gap-2">
              <Button onClick={handleEnable} size="sm" className="text-xs">
                Enable
              </Button>
              <Button onClick={() => setIsVisible(false)} variant="ghost" size="sm" className="text-xs">
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
