"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, History, LogOut } from "lucide-react"
import { useStore } from "@/lib/store"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client"

export function OrderHeader() {
  const router = useRouter()
  const logoutUser = useStore((state) => state.logoutUser)

  const handleLogout = () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient()
      supabase.auth.signOut().catch(() => {
        // Ignore sign-out errors in UI
      })
    }
    logoutUser()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <h1
            className="text-xl md:text-2xl font-bold text-primary cursor-pointer transition-all hover:scale-105 active:scale-95"
            onClick={() => router.push("/order")}
          >
            DHOPA
          </h1>

          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 transition-all hover:scale-110 active:scale-95 hover:bg-primary/10"
              onClick={() => router.push("/history")}
            >
              <History className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 transition-all hover:scale-110 active:scale-95 hover:bg-primary/10"
              onClick={() => router.push("/profile")}
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 transition-all hover:scale-110 active:scale-95 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
