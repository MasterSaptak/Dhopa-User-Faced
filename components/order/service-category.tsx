"use client"

import { ServiceItemCard } from "./service-item-card"
import type { ServiceItem } from "@/lib/types"

interface ServiceCategoryProps {
  category: {
    id: string
    name: string
    description?: string
    items: ServiceItem[]
  }
}

export function ServiceCategory({ category }: ServiceCategoryProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col gap-1 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-left shadow-sm shadow-primary/10 md:flex-row md:items-center md:justify-between md:px-5">
        <div>
          <h2 className="text-xl font-semibold text-primary md:text-2xl">{category.name}</h2>
          {category.description && <p className="text-xs text-muted-foreground md:text-sm">{category.description}</p>}
        </div>
        <span className="text-xs font-medium uppercase text-primary/70">
          {category.items.length} {category.items.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {category.items.map((item) => (
          <ServiceItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
