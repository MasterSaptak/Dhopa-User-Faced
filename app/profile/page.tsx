// README: Premium profile hub refresh (2025-11-14). Revert via `git checkout -- app/profile/page.tsx`.
"use client"

import { motion } from "framer-motion"
import { Sparkles, UserCircle2, Medal, Droplet } from "lucide-react"
import { OrderHeader } from "@/components/order/header"
import { LoyaltyCard } from "@/components/profile/loyalty-card"
import { TierProgress } from "@/components/profile/tier-progress"
import { ProfileForm } from "@/components/profile/profile-form"
import { StatsCard } from "@/components/profile/stats-card"
import { useStore } from "@/lib/store"

export default function ProfilePage() {
  const loyaltyPoints = useStore((state) => state.loyaltyPoints)
  const user = useStore((state) => state.user)
  const currentPoints = loyaltyPoints?.points || 0
  const greetingName = user?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Guest"

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-10%] top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute inset-x-10 bottom-0 h-80 rounded-[48px] bg-gradient-to-t from-sky-500/20 via-transparent to-transparent blur-3xl" />
      </div>

      <OrderHeader />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <motion.section
          className="mb-10 rounded-4xl border border-white/10 bg-white/[0.07] p-6 text-left shadow-[0_40px_120px_-60px_rgba(56,189,248,0.55)] backdrop-blur-xl md:p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                profile hub
              </div>
              <div className="space-y-2">
                <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold text-white md:text-4xl">
                  <UserCircle2 className="h-8 w-8 text-cyan-200" aria-hidden="true" />
                  {greetingName}, your wardrobe is in good hands
                </h1>
                <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                  Manage details, unlock rewards, and track your journey through DHOPA’s loyalty universe — all from one glassy dashboard.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200 shadow-inner shadow-cyan-500/10">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-cyan-100/80">
                <Droplet className="h-4 w-4" aria-hidden="true" />
                current status
              </span>
              <div className="flex flex-col text-lg font-semibold text-white">
                <span>{loyaltyPoints?.tier ?? "Bronze"} tier member</span>
                <span className="text-sm font-normal text-slate-300">{currentPoints} total loyalty points</span>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <StatsCard />
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            <motion.div
              className="space-y-6 lg:col-span-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            >
              <ProfileForm />
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.18 }}
            >
              <LoyaltyCard points={currentPoints} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.22 }}
          >
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-primary">
              <Medal className="h-5 w-5" />
              Progress Overview
            </div>
            <TierProgress currentPoints={currentPoints} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
