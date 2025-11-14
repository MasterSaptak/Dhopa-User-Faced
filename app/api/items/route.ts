import { NextResponse } from "next/server"
import { serviceCategories } from "@/lib/services-data"

export async function GET() {
  try {
    // Flatten all items from all categories
    const items = serviceCategories.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        category: category.name,
        category_id: category.id,
      })),
    )

    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}
