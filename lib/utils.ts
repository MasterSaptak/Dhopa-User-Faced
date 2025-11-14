import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Discount, ServiceItem, Addon, DeliveryOption } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDiscountedPrice(price: number, discount?: Discount): number {
  if (!discount) return price
  if (discount.type === "flat") {
    return Math.max(0, price - discount.value)
  }
  return Math.max(0, price - (price * discount.value) / 100)
}

export function getServiceItemFinalPrice(item: Pick<ServiceItem, "price" | "discount">): number {
  return calculateDiscountedPrice(item.price, item.discount)
}

export function getAddonFinalPrice(addon: Pick<Addon, "price" | "discount">): number {
  return calculateDiscountedPrice(addon.price, addon.discount)
}

export function getDeliveryOptionFinalPrice(option: Pick<DeliveryOption, "price" | "discount">): number {
  return calculateDiscountedPrice(option.price, option.discount)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })
    .format(value)
    .replace("₹", "₹")
}
