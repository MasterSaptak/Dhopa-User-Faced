import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase-server"

function mergeResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const supabaseAdmin = getSupabaseAdminClient()

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        `
          *,
          order_items (*),
          order_addons (*)
        `,
      )
      .eq("id", params.id)
      .eq("customer_id", session.user.id)
      .single()

    if (orderError) {
      throw orderError
    }

    if (!order) {
      const notFound = NextResponse.json({ error: "Order not found" }, { status: 404 })
      mergeResponseCookies(response, notFound)
      return notFound
    }

    const success = NextResponse.json({ order })
    mergeResponseCookies(response, success)
    return success
  } catch (error) {
    console.error("[DHOPA] Order fetch error:", error)
    const failure = NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
    mergeResponseCookies(response, failure)
    return failure
  }
}
