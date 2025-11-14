import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { cookies } from "next/headers"

// Mock orders storage (replace with Supabase when integrated)
const ordersStore: any[] = []

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    const supabase = getSupabaseAdminClient()

    let query = supabase
      .from("orders")
      .select("*, order_items (*), order_addons (*)", { count: "exact" })
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: orders, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      items,
      addons,
      delivery_option,
      delivery_date,
      delivery_time,
      special_instructions,
      payment_method,
      discount_code,
      client_id,
    } = body

    // Server-side pricing calculation (authoritative)
    const subtotal = items.reduce((sum: number, item: any) => {
      let itemPrice = item.price

      // Add configuration costs
      if (item.configuration) {
        if (item.configuration.starch) itemPrice += 10
        if (item.configuration.dettol) itemPrice += 15
        if (item.configuration.express) itemPrice += 50
        if (item.configuration.spotRemove) itemPrice += 20
      }

      return sum + itemPrice * item.quantity
    }, 0)

    const addonsTotal = addons.reduce((sum: number, addon: any) => sum + addon.price, 0)

    let deliveryFee = 0
    if (delivery_option === "express") deliveryFee = 100
    else if (delivery_option === "standard") deliveryFee = 50

    // Apply discount
    let discount = 0
    if (discount_code === "FIRST10") discount = subtotal * 0.1
    else if (discount_code === "SAVE20") discount = subtotal * 0.2

    const tax = (subtotal + addonsTotal + deliveryFee - discount) * 0.05 // 5% tax
    const total = subtotal + addonsTotal + deliveryFee - discount + tax

    // Calculate loyalty points (1 point per ₹10)
    const pointsEarned = Math.floor(total / 10)

    // Generate order
    const order = {
      id: `order_${Date.now()}`,
      user_id: client_id || "demo_user",
      client_id: client_id,
      order_number: `ORD${Date.now().toString().slice(-8)}`,
      status: "pending",
      items,
      addons,
      delivery_option,
      delivery_date,
      delivery_time,
      special_instructions,
      pricing_breakdown: {
        subtotal,
        addons_total: addonsTotal,
        delivery_fee: deliveryFee,
        discount,
        tax,
        total,
      },
      subtotal,
      discount,
      delivery_fee: deliveryFee,
      total,
      payment_method,
      points_earned: pointsEarned,
      created_at: new Date().toISOString(),
    }

    ordersStore.push(order)

    return NextResponse.json({ order, success: true })
  } catch (error) {
    console.error("[v0] Order creation error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
