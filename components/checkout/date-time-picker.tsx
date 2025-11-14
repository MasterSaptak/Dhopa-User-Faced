"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateTimePickerProps {
  selectedDate: Date | undefined
  selectedTime: string
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
}

const timeSlots = [
  "09:00 AM - 11:00 AM",
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
  "05:00 PM - 07:00 PM",
]

export function DateTimePicker({ selectedDate, selectedTime, onDateChange, onTimeChange }: DateTimePickerProps) {
  return (
    <Card className="glass p-6 space-y-6">
      <h3 className="text-xl font-bold">Pickup Schedule</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Date</Label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-lg border glass"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Select Time Slot</Label>
          <Select value={selectedTime} onValueChange={onTimeChange}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Choose a time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  )
}
