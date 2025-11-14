"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { User } from "lucide-react"

export function ProfileForm() {
  const user = useStore((state) => state.user)
  const setUser = useStore((state) => state.setUser)

  const [fullName, setFullName] = useState(user?.full_name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [address, setAddress] = useState(user?.address || "")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setUser({
        ...user!,
        full_name: fullName,
        phone: phone,
        address: address,
      })
      setSaving(false)
    }, 1000)
  }

  return (
    <Card className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-lg shadow-primary/10 space-y-6 text-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Profile Information</h3>
          <p className="text-sm text-slate-600">Update your personal details</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="border border-slate-200 bg-slate-100/80 text-slate-700"
          />
          <p className="text-xs text-slate-500">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border border-slate-200 bg-white text-slate-800"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-slate-200 bg-white text-slate-800"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Delivery Address</Label>
          <Textarea
            id="address"
            placeholder="Enter your complete address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="min-h-24 border border-slate-200 bg-white text-slate-800"
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </Card>
  )
}
