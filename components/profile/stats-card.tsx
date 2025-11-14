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
      color: "text-blue-600",
    },
    {
      label: "Completed",
      value: completedOrders,
      icon: Package,
      color: "text-green-600",
    },
    {
      label: "In Progress",
      value: pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-lg shadow-primary/10 backdrop-blur text-slate-900"
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{stat.value}</p>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
