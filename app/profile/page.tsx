"use client"

import { motion } from "framer-motion"
import { Sparkles, UserCircle2, Medal } from "lucide-react"
import { OrderHeader } from "@/components/order/header"
import { LoyaltyCard } from "@/components/profile/loyalty-card"
import { TierProgress } from "@/components/profile/tier-progress"
import { ProfileForm } from "@/components/profile/profile-form"
import { StatsCard } from "@/components/profile/stats-card"
import { useStore } from "@/lib/store"

export default function ProfilePage() {
  const loyaltyPoints = useStore((state) => state.loyaltyPoints)
  const currentPoints = loyaltyPoints?.points || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <OrderHeader />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8 text-center space-y-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-primary shadow-sm shadow-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
            Account & Rewards Hub
          </div>
          <div className="flex items-center justify-center gap-2 text-3xl font-bold">
            <UserCircle2 className="h-8 w-8 text-primary/80" />
            My Profile
          </div>
          <p className="text-muted-foreground">Manage your account and loyalty rewards</p>
        </motion.div>

        <div className="mx-auto max-w-7xl space-y-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { delayChildren: 0.1, staggerChildren: 0.1, duration: 0.45, ease: "easeOut" },
              },
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <StatsCard />
            </motion.div>
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
