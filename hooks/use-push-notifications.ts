"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export function usePushNotifications(userId: string | undefined) {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported("Notification" in window)

    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("[v0] Notifications not supported")
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        console.log("[v0] Notification permission granted")

        // Register FCM token if userId is available
        if (userId) {
          await registerFCMToken(userId)
        }

        return true
      }

      return false
    } catch (error) {
      console.error("[v0] Failed to request notification permission:", error)
      return false
    }
  }

  const registerFCMToken = async (userId: string) => {
    try {
      // In a real implementation, you would get the FCM token here
      // using Firebase Cloud Messaging
      // const token = await getMessaging().getToken()

      const supabase = getSupabaseBrowserClient()
      if (!supabase) return

      // Store token in customer record
      // await supabase
      //   .from('customers')
      //   .update({ fcm_token: token })
      //   .eq('id', userId)

      console.log("[v0] FCM token registered (placeholder)")
    } catch (error) {
      console.error("[v0] Failed to register FCM token:", error)
    }
  }

  return {
    permission,
    isSupported,
    requestPermission,
  }
}
