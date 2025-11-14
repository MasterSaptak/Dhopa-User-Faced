"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import { useState } from "react"
import type { Order } from "@/lib/types"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"

interface OrderCardProps {
  order: Order
}

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
}

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const { clearCart, addToCart } = useStore()

  const handleReorder = () => {
    clearCart()
    order.items.forEach((item) => {
      addToCart(item)
    })
    router.push("/order")
  }

  return (
    <Card className="glass p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold">Order #{order.order_number}</h3>
            <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
          <p className="text-sm text-muted-foreground">
            {order.items.length} item{order.items.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="text-right space-y-2">
          <p className="text-2xl font-bold text-primary">₹{order.total}</p>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleReorder}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reorder
          </Button>
        </div>
      </div>

      <Separator />

      <Button variant="ghost" className="w-full justify-between" onClick={() => setExpanded(!expanded)}>
        <span>{expanded ? "Hide" : "Show"} Details</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {expanded && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {order.addons.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Add-ons</h4>
                <div className="space-y-2">
                  {order.addons.map((addon, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{addon.name}</span>
                      <span className="font-semibold">₹{addon.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-semibold text-green-600">-₹{order.discount}</span>
                </div>
              )}
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-semibold">₹{order.delivery_fee}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">₹{order.total}</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Payment Method</p>
                <p className="font-semibold">{order.payment_method === "cash" ? "Cash on Delivery" : "Online"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Points Earned</p>
                <p className="font-semibold text-primary">+{order.points_earned}</p>
              </div>
              {order.delivery_date && (
                <div>
                  <p className="text-muted-foreground mb-1">Pickup Date</p>
                  <p className="font-semibold">{order.delivery_date}</p>
                </div>
              )}
              {order.delivery_time && (
                <div>
                  <p className="text-muted-foreground mb-1">Pickup Time</p>
                  <p className="font-semibold">{order.delivery_time}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
