// README: Premium tier progress styling refresh (2025-11-14). Revert via `git checkout -- components/profile/tier-progress.tsx`.
"use client"

import { Card } from "@/components/ui/card"
import { loyaltyTiers } from "@/lib/loyalty"
import { Check } from "lucide-react"

interface TierProgressProps {
  currentPoints: number
}

export function TierProgress({ currentPoints }: TierProgressProps) {
  return (
    <Card className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.08] p-6 text-slate-100 shadow-xl shadow-cyan-500/10 backdrop-blur-xl md:p-7">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white md:text-2xl">Loyalty tiers</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-cyan-100/80">journey</span>
      </div>

      <div className="space-y-4">
        {loyaltyTiers.map((tier, index) => {
          const isUnlocked = currentPoints >= tier.minPoints
          const isCurrent =
            currentPoints >= tier.minPoints && (tier.maxPoints === null || currentPoints <= tier.maxPoints)

          return (
            <div key={tier.name} className="relative">
              {index < loyaltyTiers.length - 1 && (
                <div className={`absolute left-6 top-12 h-12 w-0.5 ${isUnlocked ? "bg-cyan-300/80" : "bg-white/15"}`} />
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                    isUnlocked ? `bg-gradient-to-br ${tier.color} text-slate-900` : "bg-white/10 text-slate-400"
                  }`}
                >
                  {isUnlocked ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-lg font-semibold ${isCurrent ? "text-cyan-100" : "text-slate-200"}`}>{tier.name}</h4>
                    <span className="text-sm text-slate-400">{tier.minPoints}+ pts</span>
                  </div>

                  {isCurrent && (
                    <p className="text-sm font-semibold text-cyan-100">
                      Current tier · Enjoy {tier.discount}% off every order
                    </p>
                  )}

                  <ul className="space-y-1">
                    {tier.benefits.slice(0, 2).map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden="true" />
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
