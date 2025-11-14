import { NextResponse } from "next/server"
import { addonsData } from "@/lib/services-data"

export async function GET() {
  try {
    return NextResponse.json({ addons: addonsData })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addons" }, { status: 500 })
  }
}
