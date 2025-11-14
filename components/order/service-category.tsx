// README: Premium service category styling update (2025-11-14). Revert via `git checkout -- components/order/service-category.tsx`.
"use client"

import { ServiceItemCard } from "./service-item-card"
import type { ServiceItem } from "@/lib/types"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface ServiceCategoryProps {
  category: {
    id: string
    name: string
    description?: string
    items: ServiceItem[]
  }
  viewMode?: "grid" | "list"
}

export function ServiceCategory({ category, viewMode = "grid" }: ServiceCategoryProps) {
  return (
    <section className="space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.08] px-4 py-4 text-left shadow-lg shadow-cyan-500/5 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-6 md:py-5"
      >
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">{category.name}</h2>
          {category.description && <p className="text-sm text-slate-300">{category.description}</p>}
        </div>
        <Badge variant="outline" className="w-max rounded-full border-cyan-300/60 bg-cyan-400/10 text-xs font-semibold text-cyan-100">
          {category.items.length} {category.items.length === 1 ? "care item" : "care items"}
        </Badge>
      </motion.div>
      {viewMode === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {category.items.map((item) => (
            <ServiceItemCard key={item.id} item={item} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {category.items.map((item) => (
            <ServiceItemCard key={item.id} item={item} viewMode="list" />
          ))}
        </div>
      )}
    </section>
  )
}
