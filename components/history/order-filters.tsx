"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface OrderFiltersProps {
  selected: string
  onSelect: (value: string) => void
}

export function OrderFilters({ selected, onSelect }: OrderFiltersProps) {
  return (
    <Card className="glass p-6 space-y-4">
      <h3 className="text-lg font-bold">Filter Orders</h3>
      <RadioGroup value={selected} onValueChange={onSelect}>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all" className="cursor-pointer">
            All Orders
          </Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="pending" id="pending" />
          <Label htmlFor="pending" className="cursor-pointer">
            Pending
          </Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="processing" id="processing" />
          <Label htmlFor="processing" className="cursor-pointer">
            Processing
          </Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="completed" id="completed" />
          <Label htmlFor="completed" className="cursor-pointer">
            Completed
          </Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="cancelled" id="cancelled" />
          <Label htmlFor="cancelled" className="cursor-pointer">
            Cancelled
          </Label>
        </div>
      </RadioGroup>
    </Card>
  )
}
