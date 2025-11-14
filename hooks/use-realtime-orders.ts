"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Order } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function useRealtimeOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    // Fetch initial orders
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items (*), order_addons (*)")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Failed to fetch orders:", error)
      } else {
        setOrders(data || [])
      }
      setLoading(false)
    }

    fetchOrders()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`orders:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("[v0] Order updated:", payload)

          // Fetch full order details with items and addons
          const { data: updatedOrder, error } = await supabase
            .from("orders")
            .select("*, order_items (*), order_addons (*)")
            .eq("id", payload.new.id)
            .single()

          if (error) {
            console.error("[v0] Failed to fetch updated order:", error)
            return
          }

          // Update orders list
          setOrders((prev) => {
            const index = prev.findIndex((o) => o.id === updatedOrder.id)
            if (index !== -1) {
              const newOrders = [...prev]
              newOrders[index] = updatedOrder
              return newOrders
            }
            return [updatedOrder, ...prev]
          })

          // Show toast notification for status changes
          const oldStatus = (payload.old as any).status
          const newStatus = (payload.new as any).status

          if (oldStatus !== newStatus) {
            const statusMessages: Record<string, string> = {
              processing: "Your order is being processed",
              ready: "Your order is ready for pickup/delivery",
              completed: "Your order has been completed",
              cancelled: "Your order has been cancelled",
            }

            toast({
              title: "Order Status Updated",
              description: statusMessages[newStatus] || `Status: ${newStatus}`,
            })

            // Request permission and send push notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("DHOPA - Order Update", {
                body: statusMessages[newStatus] || `Status: ${newStatus}`,
                icon: "/icon-192.png",
                badge: "/icon-192.png",
              })
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("[v0] New order created:", payload)

          // Fetch full order details
          const { data: newOrder, error } = await supabase
            .from("orders")
            .select("*, order_items (*), order_addons (*)")
            .eq("id", payload.new.id)
            .single()

          if (error) {
            console.error("[v0] Failed to fetch new order:", error)
            return
          }

          setOrders((prev) => [newOrder, ...prev])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, toast])

  return { orders, loading }
}
