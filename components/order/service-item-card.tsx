// README: Premium service item card styling update (2025-11-14). Revert via `git checkout -- components/order/service-item-card.tsx`.
"use client"

import { useMemo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Minus, Plus, Info, Shirt, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ServiceItem } from "@/lib/types"
import { useStore } from "@/lib/store"
import { getServiceItemFinalPrice, formatCurrency } from "@/lib/utils"

interface ServiceItemCardProps {
  item: ServiceItem
  viewMode?: "grid" | "list"
}

export function ServiceItemCard({ item, viewMode = "grid" }: ServiceItemCardProps) {
  const { cart, addToCart, updateCartItem } = useStore()
  const cartItem = cart.find((i) => i.id === item.id)
  const [quantity, setQuantity] = useState(cartItem?.quantity || 0)
  const finalPrice = getServiceItemFinalPrice(item)
  const basePrice = useMemo(() => item.price, [item.price])
  const hasDiscount = item.discount && finalPrice !== item.price
  const media = item.image || item.icon
  const lineTotal = finalPrice * quantity
  const shouldReduceMotion = useReducedMotion()
  const isList = viewMode === "list"

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 0) return
    setQuantity(newQty)

    if (newQty === 0) {
      updateCartItem(item.id, 0)
    } else if (cartItem) {
      updateCartItem(item.id, newQty)
    } else {
      addToCart({ ...item, quantity: newQty })
    }
  }

  const priceBadge = (
    <div
      className={`flex flex-wrap items-center gap-2 text-xs md:text-sm ${
        isList ? "justify-start text-slate-200 md:text-base" : "text-slate-200 md:text-base"
      }`}
    >
      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
        {hasDiscount ? "Member price" : "Standard price"}
      </span>
      <span className="text-lg font-semibold text-white md:text-xl">{formatCurrency(finalPrice)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-slate-400 line-through">{formatCurrency(basePrice)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {item.discount?.type === "percent" ? `${item.discount.value}% off` : `₹${item.discount?.value} off`}
          </span>
        </>
      )}
    </div>
  )

  const quantityControls =
    quantity === 0 ? (
      <Button
        size="sm"
        onClick={() => handleQuantityChange(1)}
        className="rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/20 transition focus-visible:ring-2 focus-visible:ring-cyan-200/80"
      >
        Add
      </Button>
    ) : (
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-white shadow-inner shadow-cyan-500/10 md:px-3 md:py-2">
        <Button
          size="icon-sm"
          variant="ghost"
          className="h-7 w-7 rounded-full text-slate-100 transition hover:bg-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:h-8 md:w-8"
          onClick={() => handleQuantityChange(quantity - 1)}
          aria-label={`Reduce quantity of ${item.name}`}
        >
          <Minus className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 0)}
          className="h-7 w-12 border-0 bg-transparent p-0 text-center text-sm font-semibold text-white focus-visible:ring-0 md:h-8 md:w-14"
          min="0"
          inputMode="numeric"
          aria-label={`Quantity for ${item.name}`}
        />
        <Button
          size="icon-sm"
          variant="ghost"
          className="h-7 w-7 rounded-full text-slate-100 transition hover:bg-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:h-8 md:w-8"
          onClick={() => handleQuantityChange(quantity + 1)}
          aria-label={`Increase quantity of ${item.name}`}
        >
          <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
        </Button>
      </div>
    )

  const iconBlock = (
    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-200 shadow-inner shadow-cyan-500/20 md:h-16 md:w-16">
      {media ? (
        item.image ? (
          <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover md:h-14 md:w-14" />
        ) : (
          <span className="text-xl md:text-2xl" aria-hidden="true">
            {item.icon}
          </span>
        )
      ) : (
        <Shirt className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true" />
      )}
    </div>
  )

  const tooltip =
    item.description &&
    (
      <TooltipProvider>
        <Tooltip delayDuration={120}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 transition hover:border-cyan-300/60 hover:bg-cyan-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
              aria-label={`More info about ${item.name}`}
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-xs rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-left text-sm text-slate-100 shadow-xl shadow-cyan-500/10"
          >
            <p className="leading-relaxed">{item.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

  if (isList) {
    return (
      <motion.div
        variants={{
          rest: { y: 0, opacity: 1 },
          hover: shouldReduceMotion ? { y: 0, opacity: 1 } : { y: -4, opacity: 1 },
        }}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        className="group"
      >
        <Card className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.08] p-5 text-slate-100 shadow-lg shadow-cyan-500/5 transition-colors backdrop-blur-xl focus-within:ring-2 focus-within:ring-cyan-200/80 md:flex-row md:items-center md:justify-between md:gap-6">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-cyan-400/12 via-sky-500/10 to-blue-500/15 opacity-0 transition group-hover:opacity-100"
          />

          <div className="flex flex-1 items-start gap-4">
            {iconBlock}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                {item.discount?.note && (
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                    {item.discount.note}
                  </span>
                )}
                {tooltip}
              </div>
              <p className="text-sm text-slate-300">
                {hasDiscount
                  ? `Save ${formatCurrency(basePrice - finalPrice)} per unit compared to standard pricing.`
                  : "Perfect for daily fabrics that need extra care."}
              </p>
              {priceBadge}
              <span className="text-xs text-slate-300/80">
                {quantity > 0 ? `${quantity} in basket • Line total ${formatCurrency(lineTotal)}` : "Tap add to begin"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3">
            {quantityControls}
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={{
        rest: { y: 0, opacity: 1 },
        hover: shouldReduceMotion ? { y: 0, opacity: 1 } : { y: -6, opacity: 1 },
      }}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      className="group"
    >
      <Card className="relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.08] p-5 text-slate-100 shadow-lg shadow-cyan-500/5 transition-colors backdrop-blur-xl focus-within:ring-2 focus-within:ring-cyan-200/80 md:gap-6">
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-cyan-400/12 via-sky-500/10 to-blue-500/15 opacity-0 transition group-hover:opacity-100"
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {iconBlock}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold leading-tight text-white md:text-lg">{item.name}</h3>
                {item.discount?.note && (
                  <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                    {item.discount.note}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 md:text-sm">
                {hasDiscount
                  ? `Save ${formatCurrency(basePrice - finalPrice)} per unit compared to standard pricing.`
                  : "Perfect for daily fabrics that need extra care."}
              </p>
            </div>
          </div>

          {tooltip}
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          {priceBadge}
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="hidden text-sm text-slate-300 md:block">
            {hasDiscount
              ? `Buy now to lock in ${formatCurrency(basePrice - finalPrice)} savings per garment.`
              : "Add to your wash list for premium care and folding."}
          </p>
          <div className="flex flex-1 justify-end md:flex-none">{quantityControls}</div>
        </div>
      </Card>
    </motion.div>
  )
}
