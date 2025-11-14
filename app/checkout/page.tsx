"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OrderHeader } from "@/components/order/header"
import { FloatingSummary } from "@/components/order/floating-summary"
import { DeliveryOptions } from "@/components/checkout/delivery-options"
import { DateTimePicker } from "@/components/checkout/date-time-picker"
import { PaymentMethod } from "@/components/checkout/payment-method"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const cart = useStore((state) => state.cart)
  const deliveryOptionsCatalog = useStore((state) => state.deliveryOptionsCatalog)
  const preferredDeliveryOption = useStore((state) => state.preferredDeliveryOption)
  const setPreferredDeliveryOption = useStore((state) => state.setPreferredDeliveryOption)
  const deliveryFee = useStore((state) => state.getDeliveryFee())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")

  const handlePlaceOrder = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select pickup date and time")
      return
    }

    router.push("/checkout/success")
  }

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/order")
    }
  }, [cart.length, router])

  useEffect(() => {
    if (!preferredDeliveryOption && deliveryOptionsCatalog[0]) {
      setPreferredDeliveryOption(deliveryOptionsCatalog[0].id)
    }
  }, [preferredDeliveryOption, deliveryOptionsCatalog, setPreferredDeliveryOption])

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <OrderHeader />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/order")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Order
        </Button>

        <div className="mb-8 text-center space-y-2">
          <h2 className="text-3xl font-bold">Checkout</h2>
          <p className="text-muted-foreground">Complete your order details</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <DateTimePicker
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
            />

            <DeliveryOptions />

            <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />

            <Button size="lg" className="w-full lg:hidden" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>

          {/* Summary Sidebar */}
          <div className="hidden lg:block">
            <div className="space-y-4">
              <FloatingSummary deliveryFee={deliveryFee} showCheckoutButton={false} />
              <Button size="lg" className="w-full" onClick={handlePlaceOrder}>
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
