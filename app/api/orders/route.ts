import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-server"

function mergeResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
}

export async function GET(request: NextRequest) {
  const { supabase, response } = createSupabaseRouteHandlerClient(request)

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

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
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    const supabaseAdmin = getSupabaseAdminClient()

    let query = supabaseAdmin
      .from("orders")
      .select(
        `
          *,
          order_items (*),
          order_addons (*)
        `,
        { count: "exact" },
      )
      .eq("customer_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: orders, error, count } = await query

    if (error) {
      throw error
    }

    const jsonResponse = NextResponse.json({
      orders: orders ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })

    mergeResponseCookies(response, jsonResponse)
    return jsonResponse
  } catch (error) {
    console.error("[DHOPA] Orders fetch error:", error)
    const failure = NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    mergeResponseCookies(response, failure)
    return failure
  }
}

export async function POST(request: NextRequest) {
  const { supabase: authClient, response } = createSupabaseRouteHandlerClient(request)

  try {
    const {
      data: { session },
      error: sessionError,
    } = await authClient.auth.getSession()

    if (sessionError) {
      throw sessionError
    }

    if (!session?.user) {
      const unauthorized = NextResponse.json({ error: "Authentication required" }, { status: 401 })
      mergeResponseCookies(response, unauthorized)
      return unauthorized
    }

    const body = await request.json()
    const {
      items = [],
      addons = [],
      delivery_option,
      delivery_date,
      delivery_time,
      special_instructions,
      payment_method,
      discount_code,
    } = body

    if (!Array.isArray(items) || items.length === 0) {
      const invalid = NextResponse.json({ error: "Items are required to place an order" }, { status: 400 })
      mergeResponseCookies(response, invalid)
      return invalid
    }

    const subtotal = items.reduce((sum: number, item: any) => {
      const basePrice = Number(item.price) || 0
      const quantity = Number(item.quantity) || 1

      let configurationCost = 0
      if (item.configuration) {
        if (item.configuration.starch) configurationCost += 10
        if (item.configuration.dettol) configurationCost += 15
        if (item.configuration.express) configurationCost += 50
        if (item.configuration.spotRemove) configurationCost += 20
      }

      return sum + (basePrice + configurationCost) * quantity
    }, 0)

    const addonsTotal = addons.reduce((sum: number, addon: any) => {
      const price = Number(addon.price) || 0
      const quantity = Number(addon.quantity) || 1
      return sum + price * quantity
    }, 0)

    let deliveryFee = 0
    if (delivery_option === "express") deliveryFee = 100
    else if (delivery_option === "standard") deliveryFee = 50

    let discount = 0
    if (discount_code === "FIRST10") discount = subtotal * 0.1
    else if (discount_code === "SAVE20") discount = subtotal * 0.2

    const tax = (subtotal + addonsTotal + deliveryFee - discount) * 0.05
    const total = subtotal + addonsTotal + deliveryFee - discount + tax
    const pointsEarned = Math.floor(total / 10)

    const supabaseAdmin = getSupabaseAdminClient()
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`

    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: session.user.id,
        status: "pending",
        payment_status: "pending",
        delivery_type: delivery_option ?? "pickup",
        delivery_date,
        delivery_time,
        special_instructions,
        subtotal,
        addons_total: addonsTotal,
        configuration_total: subtotal - items.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0),
        delivery_fee: deliveryFee,
        discount_amount: discount,
        discount_code,
        tax_amount: tax,
        total,
        payment_method: payment_method ?? "cash",
        points_earned: pointsEarned,
      })
      .select()
      .single()

    if (orderError) {
      throw orderError
    }

    const orderItemsData = items.map((item: any) => {
      const basePrice = Number(item.price) || 0
      const quantity = Number(item.quantity) || 1
      const configuration = item.configuration ?? {}

      const configurationCost =
        (configuration.starch ? 10 : 0) +
        (configuration.dettol ? 15 : 0) +
        (configuration.express ? 50 : 0) +
        (configuration.spotRemove ? 20 : 0)

      return {
        order_id: orderRecord.id,
        item_id: item.id,
        item_name: item.name,
        quantity,
        unit_price: basePrice,
        starch: Boolean(configuration.starch),
        dettol: Boolean(configuration.dettol),
        express: Boolean(configuration.express),
        spot_remove: Boolean(configuration.spotRemove),
        configuration_cost: configurationCost,
        line_total: (basePrice + configurationCost) * quantity,
      }
    })

    if (orderItemsData.length > 0) {
      const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItemsData)
      if (itemsError) throw itemsError
    }

    if (addons.length > 0) {
      const orderAddonsData = addons.map((addon: any) => ({
        order_id: orderRecord.id,
        addon_id: addon.id,
        addon_name: addon.name,
        price: Number(addon.price) || 0,
        quantity: Number(addon.quantity) || 1,
      }))

      const { error: addonsError } = await supabaseAdmin.from("order_addons").insert(orderAddonsData)
      if (addonsError) throw addonsError
    }

    const responsePayload = {
      order: {
        ...orderRecord,
        items: orderItemsData,
        addons,
        delivery_option: delivery_option ?? "pickup",
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
        payment_method: payment_method ?? "cash",
        points_earned: pointsEarned,
      },
      success: true,
    }

    const success = NextResponse.json(responsePayload, { status: 201 })
    mergeResponseCookies(response, success)
    return success
  } catch (error) {
    console.error("[DHOPA] Order creation error:", error)
    const failure = NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    mergeResponseCookies(response, failure)
    return failure
  }
}
