/**
 * Pricing Adapter
 * Maps existing pricing data structure to landing page pricing snapshot format
 */

import { serviceCategories, addonsData, deliveryOptions } from "./services-data"

export interface PricingCategory {
  id: string
  name: string
  exampleItem: string
  examplePrice: number
  fullPricing: Array<{ name: string; price: number; description?: string }>
}

/**
 * Get pricing snapshot for landing page
 * Returns condensed pricing data with examples and full pricing details
 */
export function getPricingSnapshot(): PricingCategory[] {
  const CATEGORY_SOURCES = [
    { id: "washing", label: "Washing & Folding", matchId: "washing-folding" },
    { id: "dry-ironing", label: "Dry Ironing", matchId: "dry-ironing" },
    { id: "steam-ironing", label: "Steam Ironing", matchId: "steam-ironing" },
  ] as const

  const categories: PricingCategory[] = CATEGORY_SOURCES.flatMap((entry) => {
    const category = serviceCategories.find((cat) => cat.id === entry.matchId)
    if (!category || category.items.length === 0) return []

    const exampleItem = category.items[0]

    return [
      {
        id: entry.id,
        name: entry.label,
        exampleItem: exampleItem.name,
        examplePrice: exampleItem.price,
        fullPricing: category.items.map((item) => ({
          name: item.name,
          price: item.price,
          description: item.description,
        })),
      } satisfies PricingCategory,
    ]
  })

  if (addonsData.length > 0) {
    const exampleAddon = addonsData[0]
    categories.push({
      id: "addons",
      name: "Add-ons",
      exampleItem: exampleAddon.name,
      examplePrice: exampleAddon.price,
      fullPricing: addonsData.map((addon) => ({
        name: addon.name,
        price: addon.price,
        description: addon.description,
      })),
    })
  }

  if (deliveryOptions.length > 0) {
    const exampleDelivery = deliveryOptions[0]
    categories.push({
      id: "delivery",
      name: "Delivery",
      exampleItem: exampleDelivery.name,
      examplePrice: exampleDelivery.price,
      fullPricing: deliveryOptions.map((option) => ({
        name: option.name,
        price: option.price,
        description: option.description,
      })),
    })
  }

  return categories
}

/**
 * Get full pricing details for a specific category
 */
export function getCategoryPricing(categoryId: string): PricingCategory | null {
  const snapshot = getPricingSnapshot()
  return snapshot.find((cat) => cat.id === categoryId) || null
}

