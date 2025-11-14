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
      className={`rounded-3xl border-0 bg-gradient-to-br ${currentTier.color} p-6 text-white shadow-xl shadow-primary/30`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6" />
            <h3 className="text-2xl font-bold">{currentTier.name} Member</h3>
          </div>
          <p className="text-white/80 text-sm">Your loyalty tier</p>
        </div>
        <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
          <TrendingUp className="w-3 h-3 mr-1" />
          Active
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">Total Points</span>
          <span className="text-3xl font-bold">{points}</span>
        </div>

        {nextTier && pointsToNext !== null && (
          <>
            <Progress value={progress} className="h-2 bg-white/20" />
            <p className="text-white/80 text-sm">
              {pointsToNext} points to {nextTier.name} tier
            </p>
          </>
        )}

        {!nextTier && (
          <p className="text-white/80 text-sm flex items-center gap-2">
            <Award className="w-4 h-4" />
            You&apos;ve reached the highest tier!
          </p>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t border-white/20">
        <h4 className="font-semibold text-sm text-white/80">Your Benefits</h4>
        <ul className="space-y-1">
          {currentTier.benefits.map((benefit, index) => (
            <li key={index} className="text-sm flex items-start gap-2">
              <span className="text-white/60">•</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
