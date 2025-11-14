import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getStripeClient } from "@/lib/stripe"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Verify user authentication
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, customers (*)")
      .eq("id", orderId)
      .eq("customer_id", userId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if order is already paid
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 })
    }

    const stripe = getStripeClient()

    // Create or retrieve payment intent
    let paymentIntent

    if (order.stripe_payment_intent_id) {
      // Retrieve existing payment intent
      paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id)
    } else {
      // Create new payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number.parseFloat(order.total) * 100), // Convert to paise/cents
        currency: "inr",
        metadata: {
          orderId: order.id,
          orderNumber: order.order_number,
          customerId: userId,
        },
        description: `DHOPA Order ${order.order_number}`,
        receipt_email: order.customers?.email,
      })

      // Update order with payment intent ID
      await supabase.from("orders").update({ stripe_payment_intent_id: paymentIntent.id }).eq("id", orderId)
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    console.error("[v0] Payment intent creation error:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment intent" }, { status: 500 })
  }
}
