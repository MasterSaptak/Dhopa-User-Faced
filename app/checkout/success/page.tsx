"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OrderHeader } from "@/components/order/header"
import { Invoice } from "@/components/checkout/invoice"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import type { Order } from "@/lib/types"
import { CatLoader } from "@/components/cat-loader"

export default function SuccessPage() {
  const router = useRouter()
  const { cart, selectedAddons, user, clearCart, addOrder, getCartTotal, getAddonsTotal, updateLoyaltyPoints } =
    useStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const createOrder = () => {
      const subtotal = getCartTotal()
      const addonsTotal = getAddonsTotal()
      const deliveryFee = 0
      const discount = 0
      const total = subtotal + addonsTotal + deliveryFee - discount
      const pointsEarned = Math.floor(total / 10)

      const newOrder: Order = {
        id: crypto.randomUUID(),
        user_id: user?.id || "",
        order_number: `DHP${Date.now().toString().slice(-8)}`,
        status: "pending",
        items: cart,
        addons: selectedAddons,
        delivery_option: "standard",
        delivery_date: new Date(Date.now() + 86400000 * 3).toLocaleDateString(),
        delivery_time: "09:00 AM - 11:00 AM",
        subtotal,
        discount,
        delivery_fee: deliveryFee,
        total,
        payment_method: "cash",
        points_earned: pointsEarned,
        created_at: new Date().toISOString(),
      }

      setOrder(newOrder)
      addOrder(newOrder)
      updateLoyaltyPoints(pointsEarned)
      clearCart()
      setLoading(false)
    }

    setTimeout(createOrder, 1500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <CatLoader />
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <OrderHeader />

      <div className="container mx-auto px-4 py-8">
        <Invoice order={order} />

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 max-w-2xl mx-auto">
          <Button variant="outline" className="bg-transparent" onClick={() => router.push("/history")}>
            View Order History
          </Button>
          <Button onClick={() => router.push("/order")}>Place Another Order</Button>
        </div>
      </div>
    </div>
  )
}
