"use client"

import { useEffect, useState } from "react"
import { offlineStorage, type DraftOrder } from "@/lib/offline-storage"
import { useToast } from "@/hooks/use-toast"

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [unsyncedCount, setUnsyncedCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initializeAndSync = async () => {
      try {
        await offlineStorage.init()
        setIsInitialized(true)
        console.log("[v0] Offline storage initialized")

        setIsOnline(navigator.onLine)

        await checkUnsyncedDrafts()

        if (navigator.onLine) {
          await syncDraftOrders()
        }
      } catch (error) {
        console.error("[v0] Failed to initialize offline storage:", error)
      }
    }

    initializeAndSync()

    const handleOnline = () => {
      console.log("[v0] Connection restored")
      setIsOnline(true)
      toast({
        title: "Back Online",
        description: "Syncing pending orders...",
      })
      syncDraftOrders()
    }

    const handleOffline = () => {
      console.log("[v0] Connection lost")
      setIsOnline(false)
      toast({
        title: "Offline Mode",
        description: "Orders will be saved locally and synced when you reconnect.",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const checkUnsyncedDrafts = async () => {
    if (!isInitialized) {
      console.log("[v0] Skipping unsynced check - not initialized yet")
      return
    }

    try {
      const drafts = await offlineStorage.getUnsyncedDrafts()
      setUnsyncedCount(drafts.length)
    } catch (error) {
      console.error("[v0] Failed to check unsynced drafts:", error)
    }
  }

  const syncDraftOrders = async () => {
    if (!isInitialized || !navigator.onLine || isSyncing) return

    setIsSyncing(true)

    try {
      const drafts = await offlineStorage.getUnsyncedDrafts()
      console.log(`[v0] Syncing ${drafts.length} draft orders`)

      for (const draft of drafts) {
        try {
          const calcResponse = await fetch("/api/orders/calc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: draft.items,
              addons: draft.addons,
              deliveryType: draft.deliveryType,
            }),
          })

          if (!calcResponse.ok) {
            console.error("[v0] Price calculation failed for draft:", draft.id)
            continue
          }

          const calcData = await calcResponse.json()
          const serverTotal = calcData.pricing.total

          if (Math.abs(serverTotal - draft.clientTotal) > 0.01) {
            console.warn("[v0] Price mismatch detected:", {
              client: draft.clientTotal,
              server: serverTotal,
            })

            toast({
              title: "Price Updated",
              description: `Order total changed from ₹${draft.clientTotal.toFixed(
                2,
              )} to ₹${serverTotal.toFixed(2)}. Please review and confirm.`,
              duration: 10000,
            })

            continue
          }

          const createResponse = await fetch("/api/orders/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: draft.items,
              addons: draft.addons,
              deliveryType: draft.deliveryType,
              specialInstructions: draft.specialInstructions,
              paymentMethod: "cash",
            }),
          })

          if (createResponse.ok) {
            await offlineStorage.markDraftSynced(draft.id)
            await offlineStorage.deleteDraftOrder(draft.id)
            console.log("[v0] Draft order synced:", draft.id)
          } else {
            console.error("[v0] Failed to sync draft:", draft.id)
          }
        } catch (error) {
          console.error("[v0] Error syncing draft:", draft.id, error)
        }
      }

      await checkUnsyncedDrafts()

      if (drafts.length > 0) {
        toast({
          title: "Sync Complete",
          description: `${drafts.length} orders synced successfully.`,
        })
      }
    } catch (error) {
      console.error("[v0] Sync error:", error)
      toast({
        title: "Sync Failed",
        description: "Failed to sync orders. Will retry automatically.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const saveDraftOrder = async (draft: Omit<DraftOrder, "id" | "createdAt" | "synced">) => {
    if (!isInitialized) {
      throw new Error("Offline storage not initialized")
    }

    try {
      const draftOrder: DraftOrder = {
        ...draft,
        id: `draft_${Date.now()}`,
        createdAt: new Date().toISOString(),
        synced: false,
      }

      await offlineStorage.saveDraftOrder(draftOrder)
      await checkUnsyncedDrafts()

      toast({
        title: "Order Saved Offline",
        description: "Your order will be synced when you reconnect.",
      })

      return draftOrder.id
    } catch (error) {
      console.error("[v0] Failed to save draft order:", error)
      throw error
    }
  }

  return {
    isOnline,
    isSyncing,
    unsyncedCount,
    isInitialized,
    syncDraftOrders,
    saveDraftOrder,
  }
}
