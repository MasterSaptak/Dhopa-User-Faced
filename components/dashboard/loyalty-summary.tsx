"use client"

import { motion } from "framer-motion"
import { Trophy, ArrowRight } from "lucide-react"
import { getTierByPoints, getPointsToNextTier, getNextTier } from "@/lib/loyalty"

interface LoyaltySummaryProps {
  points?: number
  onViewBenefits?: () => void
}

export function LoyaltySummary({ points = 0, onViewBenefits }: LoyaltySummaryProps) {
  const tier = getTierByPoints(points)
  const nextTier = getNextTier(tier)
  const pointsToNext = getPointsToNextTier(points)

  const min = tier.minPoints
  const max = tier.maxPoints ?? Math.max(points + 200, tier.minPoints + 500)
  const progress = Math.min(1, (points - min) / (max - min))

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-sky-500/25 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-blue-900/80 p-6 text-sky-50 shadow-[0_35px_80px_-35px_rgba(14,116,233,0.5)] backdrop-blur-2xl"
    >
      <div className="absolute -left-10 top-0 h-48 w-48 rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="absolute -right-16 -bottom-10 h-52 w-52 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/15 text-sky-50">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-sky-200/80">Loyalty</p>
            <h2 className="text-2xl font-semibold leading-tight text-sky-50">
              {tier.name} tier · <span className="text-sky-200">{points} pts</span>
            </h2>
            <p className="mt-1 text-sm text-sky-200/75">
              {nextTier
                ? `${pointsToNext} pts away from ${nextTier.name} tier perks`
                : "You’ve unlocked the highest tier. Enjoy all premium benefits!"}
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-sky-500/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300 shadow-[0_0_20px_rgba(125,211,252,0.45)]"
            />
          </div>
          <button
            onClick={onViewBenefits}
            className="ripple-overlay inline-flex items-center justify-center gap-2 rounded-full border border-sky-500/40 bg-gradient-to-r from-cyan-400/40 to-blue-600/40 px-5 py-2 text-sm font-medium text-sky-50 transition-transform hover:-translate-y-[2px]"
            type="button"
          >
            View benefits
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.section>
  )
}

