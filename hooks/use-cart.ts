"use client"

import { useStore } from "@/lib/store"

export function useCart() {
  const cart = useStore((state) => state.cart)
  const addToCart = useStore((state) => state.addToCart)
  const updateCartItem = useStore((state) => state.updateCartItem)
  const removeFromCart = useStore((state) => state.removeFromCart)
  const clearCart = useStore((state) => state.clearCart)
  const getCartTotal = useStore((state) => state.getCartTotal)

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cart,
    itemCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
  }
}
