// README: Premium floating summary & mobile drawer refresh (2025-11-14). Revert via `git checkout -- components/order/floating-summary.tsx`.
"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Tag, ShoppingBag } from "lucide-react"
import { useStore } from "@/lib/store"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { getServiceItemFinalPrice, getAddonFinalPrice, getDeliveryOptionFinalPrice, formatCurrency } from "@/lib/utils"

interface FloatingSummaryProps {
  deliveryFee?: number
  onCheckout?: () => void
  showCheckoutButton?: boolean
}

export function FloatingSummary({ deliveryFee = 0, onCheckout, showCheckoutButton }: FloatingSummaryProps) {
  const { cart, selectedAddons, removeFromCart, getCartTotal, getAddonsTotal, updateAddonQuantity } = useStore()
  const deliveryOptions = useStore((state) => state.deliveryOptionsCatalog)
  const preferredDeliveryOption = useStore((state) => state.preferredDeliveryOption)
  const selectedDelivery = deliveryOptions.find((option) => option.id === preferredDeliveryOption)
  const [discountCode, setDiscountCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [discountApplied, setDiscountApplied] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const hasItems = cart.length > 0
  const showButton = showCheckoutButton ?? true
  const useDrawer = showCheckoutButton !== undefined && showCheckoutButton && Boolean(onCheckout)

  const subtotal = getCartTotal()
  const addonsTotal = getAddonsTotal()
  const deliveryUnitPrice = selectedDelivery ? getDeliveryOptionFinalPrice(selectedDelivery) : 0
  const deliveryQuantity = selectedDelivery ? selectedDelivery.quantity ?? 1 : 0
  const total = subtotal + addonsTotal + deliveryFee - discount
  const summaryItems = useMemo(
    () =>
      cart.map((item) => {
        const finalPrice = getServiceItemFinalPrice(item)
        return {
          id: item.id,
          name: item.name,
          finalPrice,
          quantity: item.quantity,
          originalPrice: item.price,
          hasDiscount: item.discount && finalPrice !== item.price,
        }
      }),
    [cart],
  )

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

  if (!hasItems) {
    return null
  }

  const desktopSummary = (
    <Card className="sticky top-24 space-y-4 rounded-3xl border border-white/10 bg-white/[0.08] p-6 text-slate-100 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/70">Order summary</p>
          <h3 className="text-xl font-semibold text-white md:text-2xl">Laundry basket</h3>
        </div>
        <Badge variant="outline" className="rounded-full border-cyan-200/40 bg-cyan-400/10 text-cyan-100">
          {cart.length} items
        </Badge>
      </div>

      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
        {summaryItems.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-3 text-sm">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{item.name}</p>
              <p className="text-xs text-slate-300">
                {formatCurrency(item.finalPrice)} × {item.quantity}
                {item.hasDiscount && (
                  <span className="ml-2 line-through text-slate-500">{formatCurrency(item.originalPrice)}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">{formatCurrency(item.finalPrice * item.quantity)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-slate-200 transition hover:bg-rose-500/20 hover:text-rose-100 focus-visible:ring-2 focus-visible:ring-rose-200/80"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedAddons.length > 0 && (
        <>
          <Separator className="border-white/10" />
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <span>Add-ons</span>
              <Badge className="bg-white/10 text-cyan-100">+{selectedAddons.length}</Badge>
            </div>
            {selectedAddons.map((addon) => {
              const finalPrice = getAddonFinalPrice(addon)
              const quantity = addon.quantity ?? 0
              const hasDiscount = addon.discount && finalPrice !== addon.price
              return (
                <div key={addon.id} className="flex items-center justify-between gap-2 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white">
                  <div>
                    <p className="font-medium">{addon.name}</p>
                    <p className="text-xs text-slate-300">
                      {formatCurrency(finalPrice)} × {quantity}
                      {hasDiscount && <span className="ml-2 line-through text-slate-500">{formatCurrency(addon.price)}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{formatCurrency(finalPrice * quantity)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-slate-200 transition hover:bg-rose-500/20 hover:text-rose-100 focus-visible:ring-2 focus-visible:ring-rose-200/80"
                      onClick={() => updateAddonQuantity(addon.id, 0)}
                      aria-label={`Remove ${addon.name}`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <Separator className="border-white/10" />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Tag className="h-4 w-4" aria-hidden="true" />
          Discount code
        </div>
        {!discountApplied ? (
          <div className="flex gap-2">
            <Input
              placeholder="FIRST10 / SAVE20"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="bg-white/10 text-sm text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-200/70"
            />
            <Button
              variant="outline"
              onClick={applyDiscount}
              disabled={!discountCode}
              className="border-cyan-200/40 bg-cyan-400/10 text-cyan-100 transition hover:border-cyan-200/70 hover:bg-cyan-400/20 hover:text-white disabled:hover:bg-cyan-400/10"
            >
              Apply
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-300/40 bg-emerald-400/15 px-3 py-2 text-sm text-emerald-100">
            <span>{discountCode.toUpperCase()} applied</span>
            <Button variant="ghost" size="sm" className="text-emerald-100 hover:text-emerald-50" onClick={removeDiscount}>
              Remove
            </Button>
          </div>
        )}
      </div>

      <Separator className="border-white/10" />

      <div className="space-y-2 text-sm text-slate-300">
        <div className="flex items-center justify-between">
          <span>Services subtotal</span>
          <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
        </div>
        {addonsTotal > 0 && (
          <div className="flex items-center justify-between">
            <span>Add-ons</span>
            <span className="font-semibold text-white">{formatCurrency(addonsTotal)}</span>
          </div>
        )}
        {selectedDelivery && (
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span>Delivery · {selectedDelivery.name}</span>
              <span className="text-xs text-slate-400">
                {formatCurrency(deliveryUnitPrice)} × {deliveryQuantity}
              </span>
            </div>
            <span className="font-semibold text-white">{formatCurrency(deliveryFee)}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-200">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>

      <Separator className="border-white/10" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/70">Total due</p>
          <p className="text-2xl font-semibold text-white md:text-3xl">{formatCurrency(total)}</p>
        </div>
        {showButton && onCheckout ? (
          <Button
            size="lg"
            className="rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 px-6 text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-400/40 focus-visible:ring-2 focus-visible:ring-cyan-200/80"
            onClick={onCheckout}
          >
            Proceed to checkout
          </Button>
        ) : null}
      </div>
    </Card>
  )

  if (!useDrawer) {
    return desktopSummary
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/40 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-500 shadow-[0_25px_50px_-12px_rgba(56,189,248,0.45)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:bottom-8 md:right-8"
        whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
        aria-expanded={drawerOpen}
        aria-controls="order-summary-drawer"
      >
        <ShoppingBag className="h-6 w-6 text-white" aria-hidden="true" />
        <span className="absolute -top-2 right-0 flex h-6 min-w-[32px] items-center justify-center rounded-full bg-white/90 px-2 text-xs font-semibold text-slate-900 shadow-md shadow-cyan-500/30">
          {formatCurrency(total)}
        </span>
      </motion.button>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="order-summary-drawer"
              role="dialog"
              aria-modal="true"
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-white/10 bg-slate-950/95 px-5 pt-6 pb-8 shadow-[0_-30px_80px_-40px_rgba(14,165,233,0.7)] backdrop-blur-xl md:px-6"
              initial={{ y: shouldReduceMotion ? 0 : 420 }}
              animate={{ y: 0 }}
              exit={{ y: shouldReduceMotion ? 0 : 420 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
            >
              <div className="mx-auto h-1 w-12 rounded-full bg-white/20" />
              <div className="mt-4 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/70">Order summary</p>
                    <h3 className="text-xl font-semibold text-white">Your basket</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDrawerOpen(false)}
                    className="h-9 w-9 rounded-full text-slate-200 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close summary"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>

                <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
                  {summaryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-3 text-sm text-white"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-slate-300">
                          {formatCurrency(item.finalPrice)} × {item.quantity}
                          {item.hasDiscount && (
                            <span className="ml-2 line-through text-slate-500">{formatCurrency(item.originalPrice)}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(item.finalPrice * item.quantity)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full text-slate-200 transition hover:bg-rose-500/20 hover:text-rose-100"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Tag className="h-4 w-4" aria-hidden="true" />
                    Discount code
                  </div>
                  {!discountApplied ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="FIRST10 / SAVE20"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className="bg-white/10 text-sm text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                      />
                      <Button
                        variant="outline"
                        onClick={applyDiscount}
                        disabled={!discountCode}
                        className="border-cyan-200/40 bg-cyan-400/10 text-cyan-100 transition hover:border-cyan-200/70 hover:bg-cyan-400/20 hover:text-white disabled:hover:bg-cyan-400/10"
                      >
                        Apply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-300/40 bg-emerald-400/15 px-3 py-2 text-sm text-emerald-100">
                      <span>{discountCode.toUpperCase()} applied</span>
                      <Button variant="ghost" size="sm" className="text-emerald-100 hover:text-emerald-50" onClick={removeDiscount}>
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Services</span>
                    <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Add-ons</span>
                      <span className="font-semibold text-white">{formatCurrency(addonsTotal)}</span>
                    </div>
                  )}
                  {selectedDelivery && (
                    <div className="flex items-center justify-between">
                      <span>Delivery</span>
                      <span className="font-semibold text-white">{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-200">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/70">Total due</p>
                    <p className="text-2xl font-semibold text-white">{formatCurrency(total)}</p>
                  </div>
                  {onCheckout && (
                    <Button
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 px-6 text-white shadow-lg shadow-cyan-500/25"
                      onClick={onCheckout}
                    >
                      Checkout
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
