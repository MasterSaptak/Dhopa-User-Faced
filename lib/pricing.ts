interface ItemConfiguration {
  starch?: boolean
  dettol?: boolean
  express?: boolean
  spotRemove?: boolean
}

interface OrderItem {
  id: string
  quantity: number
  base_price: number
  configuration?: ItemConfiguration
}

interface Addon {
  id: string
  price: number
}

interface DiscountCode {
  code: string
  percentage: number
  fixed?: number
}

// Configuration costs
const CONFIG_COSTS = {
  starch: 10,
  dettol: 15,
  express: 50,
  spotRemove: 20,
}

// Valid discount codes
const DISCOUNT_CODES: Record<string, DiscountCode> = {
  FIRST10: { code: "FIRST10", percentage: 10 },
  LOYAL20: { code: "LOYAL20", percentage: 20 },
  WEEKEND15: { code: "WEEKEND15", percentage: 15 },
  SAVE50: { code: "SAVE50", percentage: 0, fixed: 50 },
}

const toCurrency = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculateConfigurationCost(config?: ItemConfiguration): number {
  if (!config) return 0

  let cost = 0
  if (config.starch) cost += CONFIG_COSTS.starch
  if (config.dettol) cost += CONFIG_COSTS.dettol
  if (config.express) cost += CONFIG_COSTS.express
  if (config.spotRemove) cost += CONFIG_COSTS.spotRemove

  return cost
}

export function calculateItemTotal(item: OrderItem): number {
  const configCost = calculateConfigurationCost(item.configuration)
  return (item.base_price + configCost) * item.quantity
}

export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
}

export function calculateAddonsTotal(addons: Addon[]): number {
  return addons.reduce((sum, addon) => sum + addon.price, 0)
}

export function calculateDeliveryFee(deliveryType: string, zoneId?: string): number {
  // This will be fetched from delivery_zones table in production
  if (deliveryType === "pickup") return 0
  if (deliveryType === "delivery") return 50
  return 0
}

export function validateAndApplyDiscount(
  code: string | undefined,
  subtotal: number,
  customerTier?: string,
): { discount: number; code: string | null } {
  if (!code) return { discount: 0, code: null }

  const discountInfo = DISCOUNT_CODES[code.toUpperCase()]
  if (!discountInfo) return { discount: 0, code: null }

  let discount = 0
  if (discountInfo.fixed) {
    discount = discountInfo.fixed
  } else {
    discount = subtotal * (discountInfo.percentage / 100)
  }

  // Apply tier-based discounts
  if (customerTier === "Silver") {
    discount += subtotal * 0.05 // Additional 5%
  } else if (customerTier === "Gold") {
    discount += subtotal * 0.1 // Additional 10%
  }

  return { discount: toCurrency(discount), code: discountInfo.code }
}

export function calculateTax(amount: number): number {
  // 5% GST
  return toCurrency(amount * 0.05)
}

export function calculateLoyaltyPoints(total: number): number {
  // 1 point per ₹1 spent
  return Math.floor(total)
}

export interface PricingBreakdown {
  subtotal: number
  addons_total: number
  configuration_total: number
  delivery_fee: number
  discount: number
  discount_code: string | null
  tax: number
  total: number
  points_earned: number
}

export function calculateOrderPricing(
  items: OrderItem[],
  addons: Addon[],
  deliveryType: string,
  discountCode?: string,
  customerTier?: string,
  zoneId?: string,
): PricingBreakdown {
  const subtotal = calculateSubtotal(items)
  const addons_total = calculateAddonsTotal(addons)
  const configuration_total = items.reduce(
    (sum, item) => sum + calculateConfigurationCost(item.configuration) * item.quantity,
    0,
  )
  const delivery_fee = calculateDeliveryFee(deliveryType, zoneId)

  const { discount, code } = validateAndApplyDiscount(discountCode, subtotal, customerTier)

  const taxableAmount = subtotal + addons_total + delivery_fee - discount
  const tax = calculateTax(taxableAmount)
  const total = toCurrency(taxableAmount + tax)
  const points_earned = calculateLoyaltyPoints(total)

  return {
    subtotal: toCurrency(subtotal),
    addons_total: toCurrency(addons_total),
    configuration_total: toCurrency(configuration_total),
    delivery_fee: toCurrency(delivery_fee),
    discount,
    discount_code: code,
    tax,
    total,
    points_earned,
  }
}
