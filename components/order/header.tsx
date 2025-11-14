// README: Premium order UI header refresh (2025-11-14). Revert by running `git checkout -- components/order/header.tsx`.
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, History, LogOut, Droplets } from "lucide-react"
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/order")}
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-semibold text-cyan-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/50 via-sky-400/40 to-blue-500/40 text-white shadow-inner shadow-cyan-500/30">
            <Droplets className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-xs uppercase text-cyan-200/80">DHOPA</span>
            <span className="text-sm text-white">Laundry Studio</span>
          </span>
        </button>

        <div className="flex items-center gap-1.5 md:gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-transparent text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/10 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:h-10 md:w-10"
            onClick={() => router.push("/history")}
            aria-label="Order history"
          >
            <History className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-transparent text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/10 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:h-10 md:w-10"
            onClick={() => router.push("/profile")}
            aria-label="Profile"
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-transparent text-slate-200 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-100 focus-visible:ring-2 focus-visible:ring-rose-200/80 md:h-10 md:w-10"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  )
}
