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

  const {
    data: { session },
    error: sessionError,
  } = await authClient.auth.getSession()

  if (sessionError) {
    console.error("[DHOPA] Failed to fetch Supabase session:", sessionError.message)
    const errorResponse = NextResponse.json({ error: "Session lookup failed" }, { status: 500 })
    mergeResponseCookies(response, errorResponse)
    return errorResponse
  }

  if (!session?.user) {
    const unauthorized = NextResponse.json({ error: "Authentication required" }, { status: 401 })
    mergeResponseCookies(response, unauthorized)
    return unauthorized
  }

  try {
    const body = await request.json()
    const {
      items,
      addons,
      deliveryType,
      deliveryDate,
      deliveryTime,
      pickupDate,
      pickupTime,
      deliveryAddress,
      zoneId,
      specialInstructions,
      paymentMethod,
      discountCode,
    } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    const userId = session.user.id

    const supabaseAdmin = getSupabaseAdminClient()

    // Fetch current prices from database (authoritative source)
    const itemIds = items.map((item: any) => item.id)
    const addonIds = addons?.map((addon: any) => addon.id) || []

    const [itemsResult, addonsResult, customerResult] = await Promise.all([
      supabaseAdmin.from("items").select("*").in("id", itemIds).eq("is_active", true),
      addonIds.length > 0
        ? supabaseAdmin.from("add_ons").select("*").in("id", addonIds).eq("is_active", true)
        : Promise.resolve({ data: [], error: null }),
      supabaseAdmin.from("customers").select("*").eq("id", userId).single(),
    ])

    if (itemsResult.error) throw itemsResult.error
    if (addonsResult.error) throw addonsResult.error
    if (customerResult.error) {
      // Customer profile doesn't exist - create it
      const { error: createError } = await supabaseAdmin
        .from("customers")
        .insert({ id: userId, full_name: "Customer", loyalty_points: 0 })

      if (createError) throw createError
    }

    const customer = customerResult.data

    // Build pricing items with server prices
    const pricingItems = items.map((item: any) => {
      const dbItem = itemsResult.data?.find((i: any) => i.id === item.id)
      if (!dbItem) throw new Error(`Item ${item.id} not found or inactive`)

      return {
        id: item.id,
        name: dbItem.name,
        quantity: item.quantity,
        base_price: Number.parseFloat(dbItem.base_price),
        configuration: item.configuration,
      }
    })

    const pricingAddons = (addons || []).map((addon: any) => {
      const dbAddon = addonsResult.data?.find((a: any) => a.id === addon.id)
      if (!dbAddon) throw new Error(`Addon ${addon.id} not found or inactive`)

      return {
        id: addon.id,
        name: dbAddon.name,
        price: Number.parseFloat(dbAddon.price),
      }
    })

    // Calculate pricing with server-side validation
    const pricing = calculateOrderPricing(
      pricingItems,
      pricingAddons,
      deliveryType || "pickup",
      discountCode,
      customer?.loyalty_tier,
      zoneId,
    )

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`

    // Create order in transaction
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: userId,
        status: "pending",
        payment_status: "pending",
        delivery_type: deliveryType || "pickup",
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        delivery_address: deliveryAddress,
        delivery_zone_id: zoneId,
        special_instructions: specialInstructions,
        subtotal: pricing.subtotal,
        addons_total: pricing.addons_total,
        configuration_total: pricing.configuration_total,
        delivery_fee: pricing.delivery_fee,
        discount_amount: pricing.discount,
        discount_code: pricing.discount_code,
        tax_amount: pricing.tax,
        total: pricing.total,
        payment_method: paymentMethod || "cash",
        points_earned: pricing.points_earned,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Insert order items
    const orderItemsData = pricingItems.map((item: any) => ({
      order_id: order.id,
      item_id: item.id,
      item_name: item.name,
      quantity: item.quantity,
      unit_price: item.base_price,
      starch: item.configuration?.starch || false,
      dettol: item.configuration?.dettol || false,
      express: item.configuration?.express || false,
      spot_remove: item.configuration?.spotRemove || false,
      configuration_cost: item.configuration
        ? (item.configuration.starch ? 10 : 0) +
          (item.configuration.dettol ? 15 : 0) +
          (item.configuration.express ? 50 : 0) +
          (item.configuration.spotRemove ? 20 : 0)
        : 0,
      line_total:
        (item.base_price +
          (item.configuration
            ? (item.configuration.starch ? 10 : 0) +
              (item.configuration.dettol ? 15 : 0) +
              (item.configuration.express ? 50 : 0) +
              (item.configuration.spotRemove ? 20 : 0)
            : 0)) *
        item.quantity,
    }))

    const { error: itemsInsertError } = await supabaseAdmin.from("order_items").insert(orderItemsData)

    if (itemsInsertError) throw itemsInsertError

    // Insert order add-ons
    if (pricingAddons.length > 0) {
      const orderAddonsData = pricingAddons.map((addon: any) => ({
        order_id: order.id,
        addon_id: addon.id,
        addon_name: addon.name,
        price: addon.price,
      }))

      const { error: addonsInsertError } = await supabaseAdmin.from("order_addons").insert(orderAddonsData)

      if (addonsInsertError) throw addonsInsertError
    }

    // Create invoice using RPC
    const { data: invoiceId, error: invoiceError } = await supabaseAdmin.rpc("create_invoice_with_revenue", {
      p_order_id: order.id,
      p_customer_id: userId,
      p_amount: pricing.total,
    })

    if (invoiceError) {
      console.warn("[v0] Invoice creation failed:", invoiceError)
      // Continue even if invoice fails
    } else {
      // Update order with invoice ID
      await supabaseAdmin.from("orders").update({ invoice_id: invoiceId }).eq("id", order.id)
    }

    const success = NextResponse.json({
      success: true,
      order: {
        ...order,
        invoice_id: invoiceId,
      },
    })
    mergeResponseCookies(response, success)
    return success
  } catch (error: any) {
    console.error("[v0] Order creation error:", error)
    const failure = NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 })
    mergeResponseCookies(response, failure)
    return failure
  }
}
