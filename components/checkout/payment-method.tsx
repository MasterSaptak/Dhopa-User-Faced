"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Banknote, CreditCard } from "lucide-react"

interface PaymentMethodProps {
  selected: string
  onSelect: (value: string) => void
}

export function PaymentMethod({ selected, onSelect }: PaymentMethodProps) {
  return (
    <Card className="glass p-6 space-y-4">
      <h3 className="text-xl font-bold">Payment Method</h3>
      <RadioGroup value={selected} onValueChange={onSelect}>
        <div className="flex items-center space-x-3 p-4 rounded-lg hover:bg-accent/50 transition-colors">
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-3">
              <Banknote className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">Pay when your order is delivered</p>
              </div>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 p-4 rounded-lg hover:bg-accent/50 transition-colors opacity-50">
          <RadioGroupItem value="online" id="online" disabled />
          <Label htmlFor="online" className="flex-1 cursor-not-allowed">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Online Payment</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </Card>
  )
}
