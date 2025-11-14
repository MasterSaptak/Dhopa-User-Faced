// README: Premium profile form styling refresh (2025-11-14). Revert via `git checkout -- components/profile/profile-form.tsx`.
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { User } from "lucide-react"

export function ProfileForm() {
  const user = useStore((state) => state.user)
  const setUser = useStore((state) => state.setUser)
  const { toast } = useToast()

  const [fullName, setFullName] = useState(user?.full_name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [address, setAddress] = useState(user?.address || "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseBrowserClient()
        const { error } = await supabase.from("profiles").upsert(
          {
            id: user.id,
            name: fullName.trim(),
            email: user.email,
            phone: phone.trim() || null,
          },
          { onConflict: "id" },
        )

        if (error) {
          throw error
        }
      }

      setUser({
        ...user,
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
      })

      toast({
        title: "Profile updated",
        description: "Your details have been saved successfully.",
      })
    } catch (error) {
      console.error("[DHOPA] Failed to save profile:", error)
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unable to update profile right now.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.08] p-6 text-slate-100 shadow-xl shadow-cyan-500/10 backdrop-blur-xl md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-100">
            <User className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white md:text-2xl">Profile information</h3>
            <p className="text-sm text-slate-300">Keep your contact and delivery info up to date.</p>
          </div>
        </div>
        <span className="hidden rounded-full border border-cyan-200/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100 lg:inline-flex">
          secure
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-200">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="h-12 rounded-2xl border border-white/10 bg-white/5 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-200/80 disabled:opacity-70"
          />
          <p className="text-xs text-slate-400">Email is part of your Supabase login and cannot be changed here.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium text-slate-200">
            Full name
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12 rounded-2xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-200/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-slate-200">
            Phone number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 rounded-2xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-200/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium text-slate-200">
            Delivery address
          </Label>
          <Textarea
            id="address"
            placeholder="Enter your complete address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="min-h-28 rounded-2xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-200/80"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 focus-visible:ring-2 focus-visible:ring-cyan-200/80"
        size="lg"
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </Card>
  )
}
