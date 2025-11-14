// README: Premium add-ons styling refresh (2025-11-14). Revert via `git checkout -- components/order/addons-section.tsx`.
"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Minus, Plus, Sparkles } from "lucide-react"
import { useStore } from "@/lib/store"
import { getAddonFinalPrice, formatCurrency } from "@/lib/utils"

export function AddonsSection() {
  const addonsCatalog = useStore((state) => state.addonsCatalog)
  const selectedAddons = useStore((state) => state.selectedAddons)
  const updateAddonQuantity = useStore((state) => state.updateAddonQuantity)

  return (
    <Card className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.08] p-5 text-slate-100 shadow-lg shadow-cyan-500/5 backdrop-blur-xl md:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white md:text-2xl">Add-on Rituals</h3>
          <p className="text-sm text-slate-300">Elevate your fabrics with aromatics, shields, and gentle extras.</p>
        </div>
        <span className="rounded-full border border-cyan-200/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-100">
          enhance care
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {addonsCatalog.map((addon) => {
          const selected = selectedAddons.find((a) => a.id === addon.id)
          const quantity = selected?.quantity ?? 0
          const finalPrice = getAddonFinalPrice(selected ?? addon)
          const hasDiscount = addon.discount && finalPrice !== addon.price
          const media = addon.image || addon.icon

          return (
            <div
              key={addon.id}
              className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-md shadow-cyan-500/10 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 md:p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-cyan-100">
                  {media ? (
                    addon.image ? (
                      <img
                        src={addon.image}
                        alt={addon.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-lg">{addon.icon}</span>
                    )
                  ) : (
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-white md:text-base">
                    {addon.name}
                    {addon.description && (
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                              aria-label={`More info about ${addon.name}`}
                            >
                              <Info className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-xs rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-left text-sm text-slate-100 shadow-xl shadow-cyan-500/10"
                          >
                            <p className="leading-relaxed">{addon.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Label>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 md:text-sm">
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-cyan-100">
                      {formatCurrency(finalPrice)} / unit
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-slate-400 line-through">{formatCurrency(addon.price)}</span>
                        <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                          {addon.discount?.type === "percent"
                            ? `${addon.discount.value}% OFF`
                            : `₹${addon.discount?.value} OFF`}
                        </span>
                      </>
                    )}
                  </div>
                  {addon.discount?.note && <span className="text-[11px] text-cyan-100/80">{addon.discount.note}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 md:px-4 md:py-3">
                <span className="text-xs text-slate-300 md:text-sm">
                  {quantity > 0
                    ? `Line total · ${formatCurrency(finalPrice)} × ${quantity} = ${formatCurrency(finalPrice * quantity)}`
                    : "Not added yet"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 rounded-full text-slate-100 transition hover:bg-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:h-8 md:w-8"
                    onClick={() => updateAddonQuantity(addon.id, Math.max(0, quantity - 1))}
                    disabled={quantity === 0}
                    aria-label={`Reduce quantity of ${addon.name}`}
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) =>
                      updateAddonQuantity(addon.id, Math.max(0, Number.parseInt(e.target.value || "0", 10)))
                    }
                    className="h-7 w-14 border-0 bg-transparent p-0 text-center text-sm font-semibold text-white focus-visible:ring-0 md:h-8 md:w-16"
                    aria-label={`Quantity for ${addon.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 rounded-full text-slate-100 transition hover:bg-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:h-8 md:w-8"
                    onClick={() => updateAddonQuantity(addon.id, quantity + 1)}
                    aria-label={`Increase quantity of ${addon.name}`}
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
