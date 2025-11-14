"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { PaymentElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

const getSiteOrigin = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_SITE_URL || ""
}

interface PaymentFormProps {
  orderId: string
  amount: number
  onSuccess: () => void
}

function PaymentForm({ orderId, amount, onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(undefined)

    try {
      const siteOrigin = getSiteOrigin()
      const returnUrl =
        siteOrigin && orderId ? `${siteOrigin}/customer/checkout/success?orderId=${orderId}` : undefined

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          ...(returnUrl ? { return_url: returnUrl } : {}),
        },
        redirect: "if_required",
      })

      if (error) {
        setErrorMessage(error.message)
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm payment on server
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
          }),
        })

        if (response.ok) {
          onSuccess()
        } else {
          setErrorMessage("Payment confirmation failed")
          setIsProcessing(false)
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Payment failed")
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-500">{errorMessage}</p>
        </div>
      )}

      <Button type="submit" disabled={!stripe || isProcessing} className="w-full" size="lg">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₹${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  )
}

export function StripePayment({ orderId, amount, onSuccess }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    // Create payment intent
    fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setError(data.error || "Failed to initialize payment")
        }
      })
      .catch((err) => {
        setError("Failed to initialize payment")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-6">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!clientSecret) {
    return null
  }

  const appearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#06b6d4",
      colorBackground: "#0f172a",
      colorText: "#f1f5f9",
      borderRadius: "0.5rem",
    },
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentForm orderId={orderId} amount={amount} onSuccess={onSuccess} />
    </Elements>
  )
}
