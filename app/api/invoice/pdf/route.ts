import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id } = body

    if (!order_id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Redirect to new generate endpoint
    return NextResponse.json({
      pdf_url: `/api/invoice/generate/${order_id}`,
      success: true,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 })
  }
}
