"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client"

const navItems = [
  { label: "Products", href: "#products" },
  { label: "Pricing", href: "#pricing" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
]

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const user = useStore((state) => state.user)
  const logoutUser = useStore((state) => state.logoutUser)
  const storePersist = (useStore as typeof useStore & {
    persist?: {
      hasHydrated?: () => boolean
      onFinishHydration?: (callback: () => void) => (() => void) | undefined
    }
  }).persist
  const [isStoreHydrated, setIsStoreHydrated] = useState(
    !storePersist || storePersist.hasHydrated?.() || false,
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!storePersist) {
      setIsStoreHydrated(true)
      return
    }
    if (storePersist.hasHydrated?.()) {
      setIsStoreHydrated(true)
      return
    }
    const unsub = storePersist.onFinishHydration?.(() => setIsStoreHydrated(true))
    return () => unsub?.()
  }, [storePersist])

  const userInitial =
    user?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? undefined
  const isLoggedIn = isStoreHydrated && !!user

  const handleLogout = () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseBrowserClient()
      supabase.auth.signOut().catch(() => {})
    }
    logoutUser()
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      data-test-id="landing-header"
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-primary/10 bg-white/85 shadow-[0_1px_0_rgba(12,74,110,0.12)] backdrop-blur-xl"
          : "bg-white/60 backdrop-blur-md"
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
            aria-label="DHOPA Home"
          >
            <span className="relative h-9 w-9 overflow-hidden rounded-xl border border-primary/10 bg-white shadow-inner">
              <Image src="/placeholder-logo.svg" alt="DHOPA logo" fill sizes="36px" priority />
            </span>
            <span className="hidden sm:inline-block tracking-tight">DHOPA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              >
                {item.label}
                <span className="absolute bottom-1 left-1/2 h-0.5 w-0 translate-x-[-50%] rounded-full bg-primary transition-[width] duration-300 group-hover:w-3/4" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-foreground/70 transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-3 py-2"
                >
                  Log out
                </button>
                <Link
                  href="/dashboard"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
                  aria-label="View dashboard"
                >
                  {userInitial ?? "U"}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground/70 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg px-3 py-2"
                >
                  Sign In
                </Link>
                <Button asChild size="lg" data-test-id="header-cta">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {isLoggedIn ? (
              <Button asChild size="sm" variant="secondary" className="shadow-none">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="shadow-none" data-test-id="header-cta-mobile">
                <Link href="/signup">Get Started</Link>
              </Button>
            )}
            <button
              type="button"
              className="rounded-lg p-2 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-primary/10 bg-white/95 backdrop-blur-xl"
          >
            <nav className="container mx-auto px-4 py-4 space-y-2" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 space-y-2 border-t border-primary/10">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 rounded-lg border border-primary/10 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">
                        {userInitial ?? "U"}
                      </div>
                      <div className="flex flex-col text-sm">
                        <span className="font-semibold text-foreground">
                          {user?.full_name ?? user?.email ?? "Your account"}
                        </span>
                        <span className="text-foreground/60">Signed in</span>
                      </div>
                    </div>
                    <Button asChild size="lg" className="w-full" variant="secondary">
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        Go to dashboard
                      </Link>
                    </Button>
                    <Button size="lg" variant="ghost" className="w-full" onClick={handleLogout}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-base font-medium text-foreground/70 hover:text-primary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Button asChild size="lg" className="w-full" data-test-id="mobile-cta">
                      <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

