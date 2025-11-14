"use client"

import { useOfflineSync } from "@/hooks/use-offline-sync"
import { WifiOff, Cloud, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function OfflineIndicator() {
  const { isOnline, isSyncing, unsyncedCount, syncDraftOrders } = useOfflineSync()

  if (isOnline && unsyncedCount === 0 && !isSyncing) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <Badge
        variant="outline"
        className={`${
          isOnline ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
        } backdrop-blur-xl shadow-lg px-4 py-2`}
      >
        {!isOnline && (
          <>
            <WifiOff className="mr-2 h-4 w-4" />
            Offline Mode
            {unsyncedCount > 0 && ` - ${unsyncedCount} orders pending`}
          </>
        )}

        {isOnline && isSyncing && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Syncing orders...
          </>
        )}

        {isOnline && !isSyncing && unsyncedCount > 0 && (
          <>
            <Cloud className="mr-2 h-4 w-4" />
            {unsyncedCount} orders pending
            <Button size="sm" variant="ghost" className="ml-2 h-6 text-xs" onClick={syncDraftOrders}>
              Sync Now
            </Button>
          </>
        )}
      </Badge>
    </div>
  )
}
