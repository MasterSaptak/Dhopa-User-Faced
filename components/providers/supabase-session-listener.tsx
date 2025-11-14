"use client"

import { useEffect, useRef } from "react"

import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client"
import { useStore } from "@/lib/store"

export function SupabaseSessionListener() {
  const setUser = useStore((state) => state.setUser)
  const logoutUser = useStore((state) => state.logoutUser)
  const hasInitialized = useRef(false)
  const lastSyncedUserRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const supabase = getSupabaseBrowserClient()
    let isMounted = true

    const ensureProfile = async (userId: string) => {
      if (lastSyncedUserRef.current === userId) {
        return
      }

      try {
        const response = await fetch("/api/auth/profile", { method: "POST" })
        if (!response.ok) {
          console.warn("[DHOPA] Profile sync response:", await response.text())
        } else {
          lastSyncedUserRef.current = userId
        }
      } catch (error) {
        console.error("[DHOPA] Profile sync failed:", error)
      }
    }

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) return

      if (error) {
        console.error("[DHOPA] Failed to get Supabase session:", error.message)
        return
      }

      const sessionUser = data.session?.user

      if (!sessionUser) {
        lastSyncedUserRef.current = null
        logoutUser()
        return
      }

      await ensureProfile(sessionUser.id)

      const profile = await supabase
        .from("profiles")
        .select("name, email, phone")
        .eq("id", sessionUser.id)
        .maybeSingle()

      if (!isMounted) return

      setUser({
        id: sessionUser.id,
        email: profile.data?.email ?? sessionUser.email ?? undefined,
        full_name: profile.data?.name ?? (sessionUser.user_metadata?.full_name as string | undefined),
        phone: profile.data?.phone ?? (sessionUser.user_metadata?.phone as string | undefined),
      })
    }

    if (!hasInitialized.current) {
      hasInitialized.current = true
      void syncSession()
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return

      if (!session) {
        logoutUser()
        return
      }

      void (async () => {
        await ensureProfile(session.user.id)

        return supabase
        .from("profiles")
        .select("name, email, phone")
        .eq("id", session.user.id)
        .maybeSingle()
        .then((profile) => {
          if (!isMounted) return
          setUser({
            id: session.user.id,
            email: profile.data?.email ?? session.user.email ?? undefined,
            full_name: profile.data?.name ?? (session.user.user_metadata?.full_name as string | undefined),
            phone: profile.data?.phone ?? (session.user.user_metadata?.phone as string | undefined),
          })
        })
        .catch(() => {
          if (!isMounted) return
          setUser({
            id: session.user.id,
            email: session.user.email ?? (session.user.user_metadata?.email as string | undefined),
            full_name: (session.user.user_metadata?.full_name as string | undefined) ?? undefined,
            phone: (session.user.user_metadata?.phone as string | undefined) ?? undefined,
          })
        })
      })()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [logoutUser, setUser])

  return null
}

