"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Tag } from "lucide-react"
import { useStore } from "@/lib/store"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { getServiceItemFinalPrice, getAddonFinalPrice, getDeliveryOptionFinalPrice, formatCurrency } from "@/lib/utils"

interface FloatingSummaryProps {
  deliveryFee?: number
  onCheckout?: () => void
  showCheckoutButton?: boolean
}

export function FloatingSummary({ deliveryFee = 0, onCheckout, showCheckoutButton = true }: FloatingSummaryProps) {
  const { cart, selectedAddons, removeFromCart, getCartTotal, getAddonsTotal, updateAddonQuantity } = useStore()
  const deliveryOptions = useStore((state) => state.deliveryOptionsCatalog)
  const preferredDeliveryOption = useStore((state) => state.preferredDeliveryOption)
  const selectedDelivery = deliveryOptions.find((option) => option.id === preferredDeliveryOption)
  const [discountCode, setDiscountCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [discountApplied, setDiscountApplied] = useState(false)

  const subtotal = getCartTotal()
  const addonsTotal = getAddonsTotal()
  const deliveryUnitPrice = selectedDelivery ? getDeliveryOptionFinalPrice(selectedDelivery) : 0
  const deliveryQuantity = selectedDelivery ? selectedDelivery.quantity ?? 1 : 0
  const total = subtotal + addonsTotal + deliveryFee - discount

  const applyDiscount = () => {
    // Simple discount logic - can be enhanced with backend validation
    if (discountCode.toUpperCase() === "FIRST10") {
      setDiscount(subtotal * 0.1)
      setDiscountApplied(true)
    } else if (discountCode.toUpperCase() === "SAVE20") {
      setDiscount(subtotal * 0.2)
      setDiscountApplied(true)
    } else {
      setDiscount(0)
      setDiscountApplied(false)
    }
  }

  const removeDiscount = () => {
    setDiscount(0)
    setDiscountCode("")
    setDiscountApplied(false)
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <Card className="glass p-4 md:p-6 sticky top-24 space-y-3 md:space-y-4 animate-fade-in-up">
      <h3 className="text-lg md:text-xl font-bold">Order Summary</h3>

      {/* Cart Items */}
      <div className="space-y-2 md:space-y-3 max-h-64 overflow-y-auto">
        {cart.map((item) => {
          const finalPrice = getServiceItemFinalPrice(item)
          const hasDiscount = item.discount && finalPrice !== item.price

          return (
          <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-muted-foreground text-xs md:text-sm">
                {formatCurrency(finalPrice)} × {item.quantity}
                {hasDiscount && (
                  <span className="ml-2 text-[11px] text-muted-foreground line-through">
                    {formatCurrency(item.price)}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{formatCurrency(finalPrice * item.quantity)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 transition-all hover:scale-110 active:scale-95 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeFromCart(item.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )})}
      </div>

      {/* Add-ons */}
      {selectedAddons.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Add-ons</p>
            {selectedAddons.map((addon) => {
              const finalPrice = getAddonFinalPrice(addon)
              const quantity = addon.quantity ?? 0
              const hasDiscount = addon.discount && finalPrice !== addon.price
              return (
                <div key={addon.id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex flex-col">
                    <p className="font-medium">{addon.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(finalPrice)} × {quantity}
                      {hasDiscount && (
                        <span className="ml-2 line-through">{formatCurrency(addon.price)}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{formatCurrency(finalPrice * quantity)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 transition-all hover:scale-110 active:scale-95 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => updateAddonQuantity(addon.id, 0)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <Separator />

      {/* Discount Code */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Discount Code
        </p>
        {!discountApplied ? (
          <div className="flex gap-2">
            <Input
              placeholder="Enter code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="bg-background/50 transition-all focus:scale-[1.02]"
            />
            <Button
              variant="outline"
              onClick={applyDiscount}
              disabled={!discountCode}
              className="transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 bg-transparent"
            >
              Apply
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {discountCode.toUpperCase()} Applied
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeDiscount}
              className="transition-all hover:scale-105 active:scale-95"
            >
              Remove
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Price Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Subtotal</p>
          <p className="font-semibold">{formatCurrency(subtotal)}</p>
        </div>

        {addonsTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">Add-ons</p>
            <p className="font-semibold">{formatCurrency(addonsTotal)}</p>
          </div>
        )}

        {selectedDelivery && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <p className="text-muted-foreground">Delivery · {selectedDelivery.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(deliveryUnitPrice)} × {deliveryQuantity}
              </p>
            </div>
            <p className="font-semibold">{formatCurrency(deliveryFee)}</p>
          </div>
        )}

        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">Discount</p>
            <p className="font-semibold text-green-600">-{formatCurrency(discount)}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Total */}
      <div className="flex items-center justify-between">
        <p className="text-base md:text-lg font-bold">Total</p>
        <p className="text-xl md:text-2xl font-bold text-primary">{formatCurrency(total)}</p>
      </div>

      {showCheckoutButton && onCheckout && (
        <Button
          size="lg"
          className="w-full transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20"
          onClick={onCheckout}
        >
          Proceed to Checkout
        </Button>
      )}
    </Card>
  )
}
