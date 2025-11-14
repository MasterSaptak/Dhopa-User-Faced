"use client"

import { useStore } from "@/lib/store"

export type UserRole = "customer" | "admin" | "staff"

export function usePermissions() {
  const user = useStore((state) => state.user)

  const role: UserRole = (user?.role as UserRole) || "customer"

  const isAdmin = role === "admin"
  const isStaff = role === "staff" || isAdmin
  const isCustomer = role === "customer"

  const canAccessAdminPanel = isAdmin
  const canManageOrders = isStaff
  const canViewAllOrders = isStaff
  const canEditPricing = isAdmin

  return {
    role,
    isAdmin,
    isStaff,
    isCustomer,
    canAccessAdminPanel,
    canManageOrders,
    canViewAllOrders,
    canEditPricing,
  }
}
