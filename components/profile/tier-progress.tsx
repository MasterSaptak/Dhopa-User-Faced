"use client"

import { Card } from "@/components/ui/card"
import { loyaltyTiers } from "@/lib/loyalty"
import { Check } from "lucide-react"

interface TierProgressProps {
  currentPoints: number
}

export function TierProgress({ currentPoints }: TierProgressProps) {
  return (
    <Card className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-lg shadow-primary/10 space-y-6 text-slate-900">
      <h3 className="text-xl font-semibold text-slate-900">Loyalty Tiers</h3>

      <div className="space-y-4">
        {loyaltyTiers.map((tier, index) => {
          const isUnlocked = currentPoints >= tier.minPoints
          const isCurrent =
            currentPoints >= tier.minPoints && (tier.maxPoints === null || currentPoints <= tier.maxPoints)

          return (
            <div key={tier.name} className="relative">
              {index < loyaltyTiers.length - 1 && (
                <div className={`absolute left-5 top-12 w-0.5 h-12 ${isUnlocked ? "bg-primary" : "bg-border"}`} />
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                    isUnlocked ? `bg-gradient-to-br ${tier.color}` : "bg-slate-100"
                  }`}
                >
                  {isUnlocked ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-sm font-semibold text-slate-500">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold ${isCurrent ? "text-primary" : "text-slate-800"}`}>{tier.name}</h4>
                    <span className="text-sm text-slate-500">{tier.minPoints}+ points</span>
                  </div>

                  {isCurrent && <p className="text-sm text-primary font-semibold">Current Tier</p>}

                  <ul className="space-y-1">
                    {tier.benefits.slice(0, 2).map((benefit, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-slate-400">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
