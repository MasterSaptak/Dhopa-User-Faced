import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { calculateOrderPricing } from "@/lib/pricing"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, addons, deliveryType, discountCode, zoneId } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items data" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Fetch current prices from database
    const itemIds = items.map((item: any) => item.id)
    const addonIds = addons?.map((addon: any) => addon.id) || []

    const [itemsResult, addonsResult] = await Promise.all([
      supabase.from("items").select("id, base_price").in("id", itemIds),
      addonIds.length > 0
        ? supabase.from("add_ons").select("id, price").in("id", addonIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (itemsResult.error) throw itemsResult.error
    if (addonsResult.error) throw addonsResult.error

    // Build pricing items with server-side prices
    const pricingItems = items.map((item: any) => {
      const dbItem = itemsResult.data?.find((i: any) => i.id === item.id)
      if (!dbItem) throw new Error(`Item ${item.id} not found`)

      return {
        id: item.id,
        quantity: item.quantity,
        base_price: Number.parseFloat(dbItem.base_price),
        configuration: item.configuration,
      }
    })

    const pricingAddons = (addons || []).map((addon: any) => {
      const dbAddon = addonsResult.data?.find((a: any) => a.id === addon.id)
      if (!dbAddon) throw new Error(`Addon ${addon.id} not found`)

      return {
        id: addon.id,
        price: Number.parseFloat(dbAddon.price),
      }
    })

    // Get customer tier for discount calculation
    let customerTier = undefined
    try {
      const cookieStore = await cookies()
      const userId = cookieStore.get("user_id")?.value

      if (userId) {
        const { data: customer } = await supabase.from("customers").select("loyalty_tier").eq("id", userId).single()

        customerTier = customer?.loyalty_tier
      }
    } catch (e) {
      // Customer not found or not logged in - continue without tier
    }

    // Calculate pricing
    const pricing = calculateOrderPricing(
      pricingItems,
      pricingAddons,
      deliveryType || "pickup",
      discountCode,
      customerTier,
      zoneId,
    )

    return NextResponse.json({
      pricing,
      success: true,
    })
  } catch (error: any) {
    console.error("[v0] Order calculation error:", error)
    return NextResponse.json({ error: error.message || "Failed to calculate order" }, { status: 500 })
  }
}
