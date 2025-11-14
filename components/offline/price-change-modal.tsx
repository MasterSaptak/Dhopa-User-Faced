"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface PriceChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  oldPrice: number
  newPrice: number
  items: any[]
}

export function PriceChangeModal({ isOpen, onClose, onAccept, oldPrice, newPrice, items }: PriceChangeModalProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const priceDiff = newPrice - oldPrice
  const isPriceIncrease = priceDiff > 0

  const handleAccept = async () => {
    setIsAccepting(true)
    await onAccept()
    setIsAccepting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-slate-800 bg-slate-900/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <DialogTitle className="text-slate-100">Price Update</DialogTitle>
              <DialogDescription className="text-slate-400">
                Prices have changed since you created this order
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Previous Total</span>
              <span className="text-lg font-semibold text-slate-300">₹{oldPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">Updated Total</span>
              <span className="text-lg font-semibold text-slate-100">₹{newPrice.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Difference</span>
                <span className={`text-lg font-bold ${isPriceIncrease ? "text-red-400" : "text-green-400"}`}>
                  {isPriceIncrease ? "+" : ""}₹{Math.abs(priceDiff).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            <p>
              This order was created while offline. Prices may have changed in the meantime. Please review the updated
              total before proceeding.
            </p>
          </div>

          {items && items.length > 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <p className="text-xs font-semibold text-slate-400 mb-2">Order Items ({items.length})</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-slate-500">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-slate-400">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isAccepting}>
            Edit Order
          </Button>
          <Button onClick={handleAccept} disabled={isAccepting}>
            {isAccepting ? "Processing..." : "Accept & Proceed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
