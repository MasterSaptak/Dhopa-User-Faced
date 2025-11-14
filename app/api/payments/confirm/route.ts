import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentIntentId } = body

    if (!orderId || !paymentIntentId) {
      return NextResponse.json({ error: "Order ID and Payment Intent ID are required" }, { status: 400 })
    }

    // Verify user authentication
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Update order payment status
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_id: paymentIntentId,
        status: "processing",
      })
      .eq("id", orderId)
      .eq("customer_id", userId)
      .select()
      .single()

    if (updateError) throw updateError

    // Increment customer loyalty points
    const { error: loyaltyError } = await supabase.rpc("increment_loyalty", {
      p_customer_id: userId,
      p_points: order.points_earned,
      p_amount_spent: Number.parseFloat(order.total),
    })

    if (loyaltyError) {
      console.warn("[v0] Loyalty increment failed:", loyaltyError)
      // Continue even if loyalty fails
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error("[v0] Payment confirmation error:", error)
    return NextResponse.json({ error: error.message || "Failed to confirm payment" }, { status: 500 })
  }
}
