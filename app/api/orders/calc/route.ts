import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-server"
import { calculateOrderPricing } from "@/lib/pricing"

function mergeResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
}

export async function POST(request: NextRequest) {
  const { supabase: authClient, response } = createSupabaseRouteHandlerClient(request)

  try {
    const body = await request.json()
    const { items, addons, deliveryType, discountCode, zoneId } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items data" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdminClient()

    // Fetch current prices from database
    const itemIds = items.map((item: any) => item.id)
    const addonIds = addons?.map((addon: any) => addon.id) || []

    const [itemsResult, addonsResult] = await Promise.all([
      supabaseAdmin.from("items").select("id, base_price").in("id", itemIds),
      addonIds.length > 0
        ? supabaseAdmin.from("add_ons").select("id, price").in("id", addonIds)
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

    const {
      data: { session },
    } = await authClient.auth.getSession()

    if (session?.user) {
      const { data: customer } = await supabaseAdmin
        .from("customers")
        .select("loyalty_tier")
        .eq("id", session.user.id)
        .maybeSingle()

      customerTier = customer?.loyalty_tier
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

    const success = NextResponse.json({
      pricing,
      success: true,
    })
    mergeResponseCookies(response, success)
    return success
  } catch (error: any) {
    console.error("[v0] Order calculation error:", error)
    const failure = NextResponse.json({ error: error.message || "Failed to calculate order" }, { status: 500 })
    mergeResponseCookies(response, failure)
    return failure
  }
}
