"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Minus, Plus, Info, Shirt } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ServiceItem } from "@/lib/types"
import { useStore } from "@/lib/store"
import { getServiceItemFinalPrice, formatCurrency } from "@/lib/utils"

interface ServiceItemCardProps {
  item: ServiceItem
}

export function ServiceItemCard({ item }: ServiceItemCardProps) {
  const { cart, addToCart, updateCartItem } = useStore()
  const cartItem = cart.find((i) => i.id === item.id)
  const [quantity, setQuantity] = useState(cartItem?.quantity || 0)
  const finalPrice = getServiceItemFinalPrice(item)
  const hasDiscount = item.discount && finalPrice !== item.price
  const media = item.image || item.icon

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

  return (
    <Card className="glass px-3 py-3 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 md:px-4">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-sm shadow-primary/10 md:h-14 md:w-14">
          {media ? (
            item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-10 w-10 rounded-xl object-cover md:h-12 md:w-12"
              />
            ) : (
              <span className="text-lg md:text-xl">{item.icon}</span>
            )
          ) : (
            <Shirt className="h-5 w-5 text-primary md:h-6 md:w-6" />
          )}
        </div>

        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold md:text-base">{item.name}</h3>
              {item.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground transition-all hover:scale-125 hover:text-primary md:h-4 md:w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-xs text-sm text-pretty">{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-base font-bold text-primary md:text-lg">{formatCurrency(finalPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="text-muted-foreground line-through">{formatCurrency(item.price)}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                    {item.discount?.type === "percent" ? `${item.discount.value}% OFF` : `₹${item.discount?.value} OFF`}
                  </span>
                </>
              )}
            </div>
            {item.discount?.note && <p className="text-[10px] uppercase tracking-wide text-primary/80">{item.discount.note}</p>}
          </div>

          <div className="flex flex-shrink-0 items-center">
            {quantity === 0 ? (
              <Button
                size="sm"
                onClick={() => handleQuantityChange(1)}
                className="rounded-full px-3 text-xs uppercase tracking-wide md:px-4"
              >
                Add
              </Button>
            ) : (
              <div className="flex items-center gap-1 rounded-full border border-primary/20 bg-white/80 px-2 py-1 shadow-sm md:gap-2">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="h-7 w-7 rounded-full hover:bg-primary/10 md:h-8 md:w-8"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  <Minus className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 0)}
                  className="h-7 w-10 border-0 bg-transparent p-0 text-center text-sm font-semibold md:h-8 md:w-12"
                  min="0"
                />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="h-7 w-7 rounded-full hover:bg-primary/10 md:h-8 md:w-8"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  <Plus className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
