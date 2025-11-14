import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export const runtime = "edge"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase.from("items").select("*").eq("id", params.id).eq("is_active", true).single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error("[v0] Item fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}
