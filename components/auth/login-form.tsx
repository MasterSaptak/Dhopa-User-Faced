"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Phone, Lock, Sparkles, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client"
import { useStore } from "@/lib/store"

const REMEMBER_KEY = "dhopa-auth-identifier"

const getSiteOrigin = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || ""
}

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const setUser = useStore((state) => state.setUser)

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabaseConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (typeof window === "undefined") return
    const storedIdentifier = window.localStorage.getItem(REMEMBER_KEY)
    if (storedIdentifier) {
      setIdentifier(storedIdentifier)
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (rememberMe && identifier) {
      window.localStorage.setItem(REMEMBER_KEY, identifier)
    } else {
      window.localStorage.removeItem(REMEMBER_KEY)
    }
  }, [identifier, rememberMe])

  const IdentifierIcon = useMemo(() => {
    if (!identifier) return Phone
    return identifier.includes("@") ? Mail : Phone
  }, [identifier])

  const handleForgotPassword = async () => {
    if (!supabaseConfigured) {
      toast({
        variant: "destructive",
        title: "Supabase not configured",
        description: "Connect Supabase to enable password reset.",
      })
      return
    }

    if (!identifier || !identifier.includes("@")) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Enter your email address above to receive a reset link.",
      })
      return
    }

    try {
      const supabase = getSupabaseBrowserClient()
      const redirectTo = `${getSiteOrigin()}/update-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(identifier.trim(), {
        redirectTo,
      })

      if (resetError) {
        throw resetError
      }

      toast({
        title: "Password reset sent",
        description: "Check your inbox for instructions to reset your password.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong."
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: message,
      })
    }
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!identifier.trim() || !password) {
      setError("Please provide both your email/phone and password.")
      return
    }

    setLoading(true)
    setError(null)

    const trimmedIdentifier = identifier.trim()
    const isEmail = trimmedIdentifier.includes("@")

    if (!supabaseConfigured) {
      setTimeout(() => {
        setUser({
          id: `demo-${Date.now()}`,
          email: isEmail ? trimmedIdentifier : "",
          phone: isEmail ? undefined : trimmedIdentifier,
          full_name: isEmail ? trimmedIdentifier.split("@")[0] : trimmedIdentifier,
        })

        toast({
          title: "Demo login",
          description: "Supabase is not configured. Using a demo account instead.",
        })

        router.push("/")
        setLoading(false)
      }, 700)
      return
    }

    try {
      const supabase = getSupabaseBrowserClient()
      const credentials = isEmail
        ? { email: trimmedIdentifier.toLowerCase(), password }
        : { phone: trimmedIdentifier, password }

      const { data, error: signInError } = await supabase.auth.signInWithPassword(credentials)

      if (signInError) {
        throw signInError
      }

      const sessionUser = data.user

      if (!sessionUser) {
        throw new Error("Unable to retrieve Supabase user session.")
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, email, phone")
        .eq("id", sessionUser.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      setUser({
        id: sessionUser.id,
        email: profileData?.email ?? sessionUser.email ?? "",
        full_name: profileData?.name ?? (sessionUser.user_metadata?.full_name as string | undefined),
        phone: profileData?.phone ?? (sessionUser.user_metadata?.phone as string | undefined),
      })

      toast({
        title: "Welcome back!",
        description: `Signed in as ${profileData?.name ?? sessionUser.email ?? "DHOPA user"}.`,
      })

      router.push("/")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in. Please try again."
      setError(message)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-md space-y-7"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 18 }}
          className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/90 via-sky-400/70 to-blue-500/80 shadow-lg shadow-cyan-500/30"
        >
          <Sparkles className="h-7 w-7 text-white" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Log in to DHOPA</h1>
          <p className="text-sm text-slate-600 md:text-base">Laundry made lovable — sign in to continue.</p>
        </div>
      </div>

      <motion.form
        onSubmit={handleLogin}
        className="space-y-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or phone number</Label>
          <div className="relative">
            <IdentifierIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              id="identifier"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="you@example.com or +91 98765 43210"
              className="h-12 rounded-2xl border-white/40 bg-white/80 pl-11 text-sm shadow-inner shadow-cyan-500/10 backdrop-blur focus-visible:ring-2 focus-visible:ring-primary"
              autoComplete="username"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-12 rounded-2xl border-white/40 bg-white/80 pl-11 text-sm shadow-inner shadow-cyan-500/10 backdrop-blur focus-visible:ring-2 focus-visible:ring-primary"
              autoComplete="current-password"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 font-medium">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(value) => setRememberMe(value === true)}
            />
            Remember me
          </label>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-primary transition hover:opacity-80"
            onClick={handleForgotPassword}
          >
            <ShieldCheck className="h-4 w-4" />
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-primary via-cyan-400 to-blue-500 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="text-white" />
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </Button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="text-center text-sm text-slate-600"
      >
        Need an account?{" "}
        <Button
          type="button"
          variant="link"
          className="font-semibold text-primary"
          onClick={() => router.push("/signup")}
        >
          Create one
        </Button>
      </motion.div>
    </motion.div>
  )
}
