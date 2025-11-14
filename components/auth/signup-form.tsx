"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Phone, Mail, Lock, BadgeCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/use-toast"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client"

const getSiteOrigin = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || ""
}

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabaseConfigured = isSupabaseConfigured()

  const digitsOnlyPhone = useMemo(() => phone.replace(/\D/g, ""), [phone])

  const validateForm = () => {
    if (digitsOnlyPhone.length < 10) {
      return "Phone number must contain at least 10 digits."
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address."
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters."
    }

    if (fullName.trim().length < 2) {
      return "Please enter your full name."
    }

    return null
  }

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      toast({
        variant: "destructive",
        title: "Check details",
        description: validationError,
      })
      return
    }

    setLoading(true)
    setError(null)

    if (!supabaseConfigured) {
      setTimeout(() => {
        toast({
          title: "Account created (demo)",
          description: "Supabase is not configured. Enable Supabase to persist accounts.",
        })
        router.push("/login")
        setLoading(false)
      }, 700)
      return
    }

    try {
      const supabase = getSupabaseBrowserClient()
      const siteOrigin = getSiteOrigin()
      const emailRedirectTo =
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || (siteOrigin ? `${siteOrigin}/update-password` : undefined)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        phone: phone.trim(),
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      const userId = data.user?.id ?? data.session?.user?.id

      if (userId) {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: userId,
            name: fullName.trim(),
            email: email.toLowerCase(),
            phone: phone.trim(),
          },
          { onConflict: "id" },
        )

        if (profileError) {
          console.warn("[DHOPA] Failed to sync profile metadata:", profileError.message)
        }
      }

      toast({
        title: "Account created",
        description: "Welcome to DHOPA! Please log in with your new credentials.",
      })

      router.push("/login")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create account. Please try again."
      setError(message)
      toast({
        variant: "destructive",
        title: "Signup failed",
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
          className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400/90 via-cyan-400/70 to-blue-500/80 shadow-lg shadow-cyan-500/30"
        >
          <BadgeCheck className="h-7 w-7 text-white" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Create your DHOPA ID</h1>
          <p className="text-sm text-slate-600 md:text-base">Sign up to unlock offers, loyalty points, and faster care.</p>
        </div>
      </div>

      <motion.form
        onSubmit={handleSignup}
        className="space-y-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              id="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Aarav Sharma"
              className="h-12 rounded-2xl border-white/40 bg-white/80 pl-11 text-sm shadow-inner shadow-cyan-500/10 backdrop-blur focus-visible:ring-2 focus-visible:ring-primary"
              autoComplete="name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+91 98765 43210"
              className="h-12 rounded-2xl border-white/40 bg-white/80 pl-11 text-sm shadow-inner shadow-cyan-500/10 backdrop-blur focus-visible:ring-2 focus-visible:ring-primary"
              autoComplete="tel"
            />
          </div>
          <p className="text-xs text-muted-foreground">Digits only · we&apos;ll use this for pickup updates.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 rounded-2xl border-white/40 bg-white/80 pl-11 text-sm shadow-inner shadow-cyan-500/10 backdrop-blur focus-visible:ring-2 focus-visible:ring-primary"
              autoComplete="email"
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
              placeholder="At least 6 characters"
              className="h-12 rounded-2xl border-white/40 bg-white/80 pl-11 text-sm shadow-inner shadow-cyan-500/10 backdrop-blur focus-visible:ring-2 focus-visible:ring-primary"
              autoComplete="new-password"
              minLength={6}
            />
          </div>
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
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="text-center text-sm text-slate-600"
      >
        Already with DHOPA?{" "}
        <Button
          type="button"
          variant="link"
          className="font-semibold text-primary"
          onClick={() => router.push("/login")}
        >
          Log in
        </Button>
      </motion.div>
    </motion.div>
  )
}
