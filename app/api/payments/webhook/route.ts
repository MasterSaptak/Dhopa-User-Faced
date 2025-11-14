import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { headers } from "next/headers"
import { getStripeClient } from "@/lib/stripe"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured")
    }

    const stripe = getStripeClient()
    const supabase = getSupabaseAdminClient()

    // Verify webhook signature
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("[v0] Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("[v0] Stripe webhook event:", event.type)

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId
        const customerId = paymentIntent.metadata.customerId

        if (!orderId || !customerId) {
          console.error("[v0] Missing metadata in payment intent")
          break
        }

        // Update order payment status
        const { data: order, error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            payment_id: paymentIntent.id,
            status: "processing",
          })
          .eq("id", orderId)
          .select()
          .single()

        if (updateError) {
          console.error("[v0] Order update failed:", updateError)
          break
        }

        // Increment loyalty points
        const { error: loyaltyError } = await supabase.rpc("increment_loyalty", {
          p_customer_id: customerId,
          p_points: order.points_earned,
          p_amount_spent: Number.parseFloat(order.total),
        })

        if (loyaltyError) {
          console.warn("[v0] Loyalty increment failed:", loyaltyError)
        }

        console.log("[v0] Payment succeeded for order:", orderId)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (!orderId) {
          console.error("[v0] Missing orderId in payment intent")
          break
        }

        // Update order payment status
        await supabase
          .from("orders")
          .update({
            payment_status: "failed",
          })
          .eq("id", orderId)

        console.log("[v0] Payment failed for order:", orderId)
        break
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (!orderId) break

        await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "cancelled",
          })
          .eq("id", orderId)

        console.log("[v0] Payment canceled for order:", orderId)
        break
      }

      default:
        console.log("[v0] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[v0] Webhook handler error:", error)
    return NextResponse.json({ error: error.message || "Webhook handler failed" }, { status: 500 })
  }
}
