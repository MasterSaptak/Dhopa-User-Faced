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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-10%] top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute inset-x-10 bottom-0 h-80 rounded-[48px] bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent blur-3xl" />
      </div>

      <OrderHeader />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-6 w-fit rounded-full border border-cyan-200/40 bg-cyan-400/10 px-4 py-2 text-cyan-100 transition hover:border-cyan-200/70 hover:bg-cyan-400/20 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-200/80"
          onClick={() => router.push("/order")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Order
        </Button>

        <div className="mb-8 space-y-3 text-left md:text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
            Checkout flow
          </div>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">Confirm your pickup & delivery ritual</h2>
          <p className="text-sm text-slate-300 md:text-base">
            Lock in a pickup slot, choose how we return your garments, and review the care basket before completing payment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <DateTimePicker
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
            />

            <DeliveryOptions />

            <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />

            <Button
              size="lg"
              className="w-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45 focus-visible:ring-2 focus-visible:ring-cyan-200/80 lg:hidden"
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.08] p-6 text-slate-100 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
            <FloatingSummary deliveryFee={deliveryFee} showCheckoutButton={false} />
            <Button
              size="lg"
              className="w-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/45 focus-visible:ring-2 focus-visible:ring-cyan-200/80"
              onClick={handlePlaceOrder}
            >
                Place Order
              </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
