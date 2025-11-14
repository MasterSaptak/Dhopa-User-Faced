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
    <Card className="glass space-y-4 p-5 md:p-6">
      {!hideHeading && (
        <div>
          <h3 className="text-lg font-semibold">Delivery Options</h3>
          <p className="text-xs text-muted-foreground md:text-sm">Pick up & drop slots tailored to your schedule.</p>
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
              className="rounded-2xl border border-white/12 bg-white/60 p-3 shadow-sm shadow-primary/10 transition hover:-translate-y-0.5 hover:border-primary/30 md:p-4"
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value={option.id} id={option.id} className="mt-2" />
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {media ? (
                    option.image ? (
                      <img
                        src={option.image}
                        alt={option.name}
                        className="h-9 w-9 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-lg">{option.icon}</span>
                    )
                  ) : (
                    <Truck className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor={option.id} className="flex items-center gap-1 text-sm font-semibold md:text-base">
                    {option.name}
                    {option.description && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm text-pretty">{option.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Label>
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                    <span className={isSelected ? "font-semibold text-primary" : "text-muted-foreground"}>
                      {finalPrice === 0 ? "Free" : `${formatCurrency(finalPrice)} per slot`}
                      {!isSelected && " · Select to apply"}
                    </span>
                    {option.discount?.note && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {option.discount.note}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="text-[11px] text-muted-foreground line-through md:ml-auto">
                        {formatCurrency(option.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/10 bg-white/70 px-3 py-2">
                <span className="text-xs text-muted-foreground md:text-sm">
                  {total > 0 ? `Total ${formatCurrency(total)}` : "No delivery slot selected"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-7 w-7 rounded-full hover:bg-primary/10 md:h-8 md:w-8"
                    onClick={() => updateQuantity(option.id, Math.max(1, quantity - 1))}
                    disabled={!isSelected || quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      updateQuantity(option.id, Math.max(1, Number.parseInt(e.target.value || "1", 10)))
                    }
                    disabled={!isSelected}
                    className="h-7 w-14 border-0 bg-transparent p-0 text-center text-sm font-semibold md:h-8 md:w-16"
                  />
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="h-7 w-7 rounded-full hover:bg-primary/10 md:h-8 md:w-8"
                    onClick={() => {
                      if (!isSelected) handleSelect(option.id)
                      updateQuantity(option.id, quantity + 1)
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
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

