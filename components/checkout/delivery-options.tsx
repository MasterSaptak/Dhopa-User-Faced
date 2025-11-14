// README: Premium delivery options styling refresh (2025-11-14). Revert via `git checkout -- components/checkout/delivery-options.tsx`.
"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Minus, Plus, Truck } from "lucide-react"
import { useStore } from "@/lib/store"
import { getDeliveryOptionFinalPrice, formatCurrency } from "@/lib/utils"

interface DeliveryOptionsProps {
  selected?: string
  onSelect?: (value: string) => void
  hideHeading?: boolean
}

export function DeliveryOptions({ selected, onSelect, hideHeading }: DeliveryOptionsProps) {
  const deliveryOptions = useStore((state) => state.deliveryOptionsCatalog)
  const preferred = useStore((state) => state.preferredDeliveryOption)
  const setPreferred = useStore((state) => state.setPreferredDeliveryOption)
  const updateQuantity = useStore((state) => state.updateDeliveryQuantity)

  const value = selected ?? preferred ?? deliveryOptions[0]?.id ?? ""

  const handleSelect = (value: string) => {
    setPreferred(value)
    onSelect?.(value)
  }

  return (
    <Card className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.08] p-5 text-slate-100 shadow-lg shadow-cyan-500/5 backdrop-blur-xl md:p-7">
      {!hideHeading && (
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white md:text-2xl">Pickup & Drop Studio</h3>
            <p className="text-sm text-slate-300">Slide into your favourite slot and we’ll handle the rest.</p>
          </div>
          <span className="rounded-full border border-cyan-200/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-100">
            flexible
          </span>
        </div>
      )}
      <RadioGroup value={value} onValueChange={handleSelect} className="space-y-3">
        {deliveryOptions.map((option) => {
          const isSelected = value === option.id
          const quantity = option.quantity ?? (isSelected ? 1 : 0)
          const finalPrice = getDeliveryOptionFinalPrice(option)
          const hasDiscount = option.discount && finalPrice !== option.price
          const total = quantity > 0 ? finalPrice * quantity : 0
          const media = option.image || option.icon

          return (
            <div
              key={option.id}
              className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 shadow-md shadow-cyan-500/10 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 md:p-5"
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value={option.id} id={option.id} className="mt-2 border border-white/20 text-cyan-200" aria-label={`Select ${option.name}`} />
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-cyan-100">
                  {media ? (
                    option.image ? (
                      <img
                        src={option.image}
                        alt={option.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-lg" aria-hidden="true">
                        {option.icon}
                      </span>
                    )
                  ) : (
                    <Truck className="h-5 w-5" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor={option.id} className="flex items-center gap-2 text-sm font-semibold text-white md:text-base">
                    {option.name}
                    {option.description && (
                      <TooltipProvider>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                              aria-label={`More info about ${option.name}`}
                            >
                              <Info className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            className="max-w-xs rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 text-left text-sm text-slate-100 shadow-xl shadow-cyan-500/10"
                          >
                            <p className="leading-relaxed">{option.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Label>
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                    <span className={isSelected ? "font-semibold text-cyan-100" : "text-slate-400"}>
                      {finalPrice === 0 ? "Complimentary slot" : `${formatCurrency(finalPrice)} per slot`}
                      {!isSelected && " · tap to apply"}
                    </span>
                    {option.discount?.note && (
                      <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[11px] font-semibold text-cyan-100">
                        {option.discount.note}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="text-[11px] text-slate-400 line-through md:ml-auto">
                        {formatCurrency(option.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 md:px-4 md:py-3">
                <span className="text-xs text-slate-300 md:text-sm">
                  {total > 0 ? `Line total · ${formatCurrency(finalPrice)} × ${quantity} = ${formatCurrency(total)}` : "No delivery slot selected"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-7 w-7 rounded-full text-slate-100 transition hover:bg-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:h-8 md:w-8"
                    onClick={() => updateQuantity(option.id, Math.max(1, quantity - 1))}
                    disabled={!isSelected || quantity <= 1}
                    aria-label={`Reduce quantity for ${option.name}`}
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      updateQuantity(option.id, Math.max(1, Number.parseInt(e.target.value || "1", 10)))
                    }
                    disabled={!isSelected}
                    className="h-7 w-14 border-0 bg-transparent p-0 text-center text-sm font-semibold text-white focus-visible:ring-0 md:h-8 md:w-16"
                    aria-label={`Quantity for ${option.name}`}
                  />
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-7 w-7 rounded-full text-slate-100 transition hover:bg-cyan-500/20 focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:h-8 md:w-8"
                    onClick={() => {
                      if (!isSelected) handleSelect(option.id)
                      updateQuantity(option.id, quantity + 1)
                    }}
                    aria-label={`Increase quantity for ${option.name}`}
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </RadioGroup>
    </Card>
  )
}

