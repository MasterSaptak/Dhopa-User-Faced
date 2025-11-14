// README: Premium loyalty card styling refresh (2025-11-14). Revert via `git checkout -- components/profile/loyalty-card.tsx`.
"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, TrendingUp } from "lucide-react"
import { getTierByPoints, getNextTier, getPointsToNextTier } from "@/lib/loyalty"

interface LoyaltyCardProps {
  points: number
}

export function LoyaltyCard({ points }: LoyaltyCardProps) {
  const currentTier = getTierByPoints(points)
  const nextTier = getNextTier(currentTier)
  const pointsToNext = getPointsToNextTier(points)

  const progress = nextTier
    ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100

  return (
    <Card
      className={`space-y-5 rounded-3xl border border-white/10 bg-gradient-to-br ${currentTier.color} p-6 text-white shadow-[0_45px_120px_-50px_rgba(56,189,248,0.5)] backdrop-blur-lg md:p-7`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
            <Award className="h-5 w-5" aria-hidden="true" />
            loyalty status
          </div>
          <h3 className="text-3xl font-bold">{currentTier.name} member</h3>
          <p className="text-sm text-white/80">Exclusive benefits unlocked for your tier.</p>
        </div>
        <Badge className="rounded-full border-white/40 bg-white/20 text-white shadow-sm shadow-black/10">
          <TrendingUp className="mr-1 h-3 w-3" aria-hidden="true" />
          Active
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-white/85">
          <span>Total points</span>
          <span className="text-3xl font-bold text-white">{points}</span>
        </div>

        {nextTier && pointsToNext !== null ? (
          <>
            <Progress value={progress} className="h-2 overflow-hidden rounded-full bg-white/25 [&>div]:bg-white/80" />
            <p className="text-sm text-white/85">
              Only <span className="font-semibold text-white">{pointsToNext}</span> points until you reach{" "}
              <span className="font-semibold text-white">{nextTier.name}</span>.
            </p>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-white/85">
            <Award className="h-4 w-4" aria-hidden="true" />
            You&apos;ve reached the highest tier! Enjoy priority perks all year round.
          </p>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">Benefits</h4>
        <ul className="space-y-1.5">
          {currentTier.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-white/90">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/60" aria-hidden="true" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {nextTier && pointsToNext !== null && (
        <div className="rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-sm text-white/85">
          <p>
            Book an express pickup this week and earn an extra{" "}
            <span className="font-semibold text-white">+25 points</span>. You&apos;re closer to{" "}
            <span className="font-semibold text-white">{nextTier.name}</span> than ever.
          </p>
        </div>
      )}
    </Card>
  )
}
