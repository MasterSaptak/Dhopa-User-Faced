export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  address?: string
  role?: "customer" | "admin" | "staff"
}

export interface LoyaltyPoints {
  id: string
  user_id: string
  points: number
  tier: "Bronze" | "Silver" | "Gold"
}

export interface Discount {
  type: "flat" | "percent"
  value: number
  note?: string
}

export interface ServiceItem {
  id: string
  name: string
  price: number
  category: string
  description?: string
  discount?: Discount
  icon?: string
  image?: string
}

export interface ServiceCategory {
  id: string
  name: string
  description?: string
  items: ServiceItem[]
}

export interface OrderItem extends ServiceItem {
  quantity: number
}

export interface Addon {
  id: string
  name: string
  price: number
  description?: string
  discount?: Discount
  quantity?: number
  icon?: string
  image?: string
}

export interface DeliveryOption {
  id: string
  name: string
  price: number
  description?: string
  discount?: Discount
  quantity?: number
  icon?: string
  image?: string
}

export interface ItemConfiguration {
  starch?: boolean
  dettol?: boolean
  express?: boolean
  spotRemove?: boolean
}

export interface ConfiguredOrderItem extends OrderItem {
  configuration?: ItemConfiguration
}

export interface DraftOrder {
  id: string
  items: ConfiguredOrderItem[]
  addons: Addon[]
  created_at: string
  synced: boolean
}

export interface Order {
  id: string
  user_id: string
  client_id?: string
  order_number: string
  status: "pending" | "processing" | "completed" | "cancelled"
  items: ConfiguredOrderItem[]
  addons: Addon[]
  delivery_option?: string
  delivery_date?: string
  delivery_time?: string
  special_instructions?: string
  pricing_breakdown: {
    subtotal: number
    addons_total: number
    delivery_fee: number
    discount: number
    tax: number
    total: number
  }
  subtotal: number
  discount: number
  delivery_fee: number
  total: number
  payment_method: string
  points_earned: number
  invoice_id?: string
  created_at: string
}
