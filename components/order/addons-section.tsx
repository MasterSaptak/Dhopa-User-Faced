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
    <Card className="glass space-y-4 p-5 md:p-6">
      <div>
        <h3 className="text-lg font-semibold">Add-ons</h3>
        <p className="text-xs text-muted-foreground md:text-sm">Extra care boosters, tailored for your garments.</p>
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
              className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/60 p-3 shadow-sm shadow-primary/10 transition hover:-translate-y-0.5 hover:border-primary/30 md:p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {media ? (
                    addon.image ? (
                      <img
                        src={addon.image}
                        alt={addon.name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-lg">{addon.icon}</span>
                    )
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <Label className="flex items-center gap-1 text-sm font-semibold md:text-base">
                    {addon.name}
                    {addon.description && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="max-w-xs text-sm text-pretty">{addon.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Label>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-primary">{formatCurrency(finalPrice)}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-muted-foreground line-through">{formatCurrency(addon.price)}</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          {addon.discount?.type === "percent"
                            ? `${addon.discount.value}% OFF`
                            : `₹${addon.discount?.value} OFF`}
                        </span>
                      </>
                    )}
                  </div>
                  {addon.discount?.note && <span className="text-[11px] text-muted-foreground">{addon.discount.note}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-white/70 px-3 py-2">
                <span className="text-xs text-muted-foreground md:text-sm">
                  {quantity > 0 ? `Total ${formatCurrency(finalPrice * quantity)}` : "Not added"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 rounded-full hover:bg-primary/10 md:h-8 md:w-8"
                    onClick={() => updateAddonQuantity(addon.id, Math.max(0, quantity - 1))}
                    disabled={quantity === 0}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) =>
                      updateAddonQuantity(addon.id, Math.max(0, Number.parseInt(e.target.value || "0", 10)))
                    }
                    className="h-7 w-14 border-0 bg-transparent p-0 text-center text-sm font-semibold md:h-8 md:w-16"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 rounded-full hover:bg-primary/10 md:h-8 md:w-8"
                    onClick={() => updateAddonQuantity(addon.id, quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
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
