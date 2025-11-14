import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export const runtime = "edge"
export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()

    // Fetch items and add-ons in parallel
    const [itemsResult, addonsResult] = await Promise.all([
      supabase.from("items").select("*").eq("is_active", true).order("display_order", { ascending: true }),
      supabase.from("add_ons").select("*").eq("is_active", true).order("display_order", { ascending: true }),
    ])

    if (itemsResult.error) throw itemsResult.error
    if (addonsResult.error) throw addonsResult.error

    // Group items by category
    const itemsByCategory = itemsResult.data.reduce((acc: any, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {})

    return NextResponse.json({
      items: itemsResult.data,
      itemsByCategory,
      addons: addonsResult.data,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Catalog fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 })
  }
}
