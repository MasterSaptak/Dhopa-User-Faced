"use client"

import { useState } from "react"
import { OrderHeader } from "@/components/order/header"
import { OrderCard } from "@/components/history/order-card"
import { OrderFilters } from "@/components/history/order-filters"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ShoppingBag } from "lucide-react"

export default function HistoryPage() {
  const router = useRouter()
  const orders = useStore((state) => state.orders)
  const [filter, setFilter] = useState("all")

  const filteredOrders = filter === "all" ? orders : orders.filter((order) => order.status === filter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <OrderHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center space-y-2">
          <h2 className="text-3xl font-bold">Order History</h2>
          <p className="text-muted-foreground">View and track all your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="max-w-md mx-auto text-center space-y-6 py-12">
            <div className="glass rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No Orders Yet</h3>
              <p className="text-muted-foreground">Start your first laundry order today!</p>
            </div>
            <Button size="lg" onClick={() => router.push("/order")}>
              Place Your First Order
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <OrderFilters selected={filter} onSelect={setFilter} />
            </div>

            {/* Orders List */}
            <div className="lg:col-span-3 space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 glass rounded-2xl">
                  <p className="text-muted-foreground">No orders found with this filter</p>
                </div>
              ) : (
                filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
