// README: Premium stats card styling refresh (2025-11-14). Revert via `git checkout -- components/profile/stats-card.tsx`.
"use client"

import { Card } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { ShoppingBag, Package, Clock } from "lucide-react"

export function StatsCard() {
  const orders = useStore((state) => state.orders)

  const totalOrders = orders.length
  const completedOrders = orders.filter((o) => o.status === "completed").length
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      accent: "from-cyan-400/60 via-sky-500/30 to-blue-500/30",
    },
    {
      label: "Completed",
      value: completedOrders,
      icon: Package,
      accent: "from-emerald-400/60 via-teal-500/30 to-cyan-500/30",
    },
    {
      label: "In Progress",
      value: pendingOrders,
      icon: Clock,
      accent: "from-amber-400/60 via-orange-400/30 to-pink-400/30",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.08] p-6 text-slate-100 shadow-xl shadow-cyan-500/10 backdrop-blur-lg"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-white">
              <span className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} aria-hidden="true" />
              <stat.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none text-white">{stat.value}</p>
              <p className="text-sm text-slate-300">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
