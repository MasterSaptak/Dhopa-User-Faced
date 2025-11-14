"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  User,
  Addon,
  Order,
  LoyaltyPoints,
  DraftOrder,
  ConfiguredOrderItem,
  ServiceCategory,
  DeliveryOption,
  ServiceItem,
} from "./types"
import { serviceCategories as defaultCategories, addonsData as defaultAddons, deliveryOptions as defaultDelivery } from "./services-data"
import { getServiceItemFinalPrice, getAddonFinalPrice, getDeliveryOptionFinalPrice } from "./utils"

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_PASS || "dhopa-admin"
const clone = <T,>(data: T): T => JSON.parse(JSON.stringify(data))

interface AppState {
  user: User | null
  loyaltyPoints: LoyaltyPoints | null
  cart: ConfiguredOrderItem[]
  selectedAddons: Addon[]
  serviceCategories: ServiceCategory[]
  addonsCatalog: Addon[]
  deliveryOptionsCatalog: DeliveryOption[]
  preferredDeliveryOption: string | null
  orders: Order[]
  draftOrders: DraftOrder[]
  isOnline: boolean
  isAdmin: boolean
  setUser: (user: User | null) => void
  setLoyaltyPoints: (points: LoyaltyPoints | null) => void
  setServiceCategories: (categories: ServiceCategory[]) => void
  addServiceCategory: (category: ServiceCategory) => void
  updateServiceCategory: (categoryId: string, updates: Partial<ServiceCategory>) => void
  addServiceItem: (categoryId: string, item: ServiceItem) => void
  updateServiceItem: (categoryId: string, itemId: string, updates: Partial<ServiceItem>) => void
  deleteServiceItem: (categoryId: string, itemId: string) => void
  setAddonsCatalog: (addons: Addon[]) => void
  updateAddonCatalog: (addonId: string, updates: Partial<Addon>) => void
  setDeliveryOptionsCatalog: (options: DeliveryOption[]) => void
  updateDeliveryOption: (optionId: string, updates: Partial<DeliveryOption>) => void
  setPreferredDeliveryOption: (id: string) => void
  addToCart: (item: ConfiguredOrderItem) => void
  updateCartItem: (itemId: string, quantity: number, configuration?: any) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  updateAddonQuantity: (addonId: string, quantity: number) => void
  updateDeliveryQuantity: (optionId: string, quantity: number) => void
  addOrder: (order: Order) => void
  getCartTotal: () => number
  getAddonsTotal: () => number
  getDeliveryFee: () => number
  updateLoyaltyPoints: (points: number) => void
  saveDraft: () => void
  loadDraft: (draftId: string) => void
  deleteDraft: (draftId: string) => void
  syncDrafts: () => Promise<void>
  setOnlineStatus: (status: boolean) => void
  loginAdmin: (password: string) => boolean
  logoutAdmin: () => void
  logoutUser: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      loyaltyPoints: { id: "", user_id: "", points: 0, tier: "Bronze" },
      cart: [],
      selectedAddons: [],
      serviceCategories: clone(defaultCategories),
      addonsCatalog: clone(defaultAddons),
      deliveryOptionsCatalog: clone(defaultDelivery).map((option, index) => ({
        ...option,
        quantity: index === 0 ? 1 : 0,
      })),
      orders: [],
      draftOrders: [],
      isOnline: true,
      isAdmin: false,
      preferredDeliveryOption: defaultDelivery[0]?.id ?? null,

      setUser: (user) =>
        set((state) => {
          if (!user) {
            return { user: null }
          }

          const previousId = state.user?.id
          const nextId = user.id

          if (nextId && previousId !== nextId) {
            const resetDelivery = clone(defaultDelivery).map((option, index) => ({
              ...option,
              quantity: index === 0 ? 1 : 0,
            }))

            return {
              user,
              cart: [],
              selectedAddons: [],
              orders: [],
              loyaltyPoints: null,
              draftOrders: [],
              preferredDeliveryOption: resetDelivery[0]?.id ?? null,
              deliveryOptionsCatalog: resetDelivery,
            }
          }

          return { user }
        }),

      setLoyaltyPoints: (points) => set({ loyaltyPoints: points }),

      setServiceCategories: (categories) => set({ serviceCategories: categories }),

      addServiceCategory: (category) =>
        set((state) => ({
          serviceCategories: [...state.serviceCategories, category],
        })),

      updateServiceCategory: (categoryId, updates) =>
        set((state) => ({
          serviceCategories: state.serviceCategories.map((category) =>
            category.id === categoryId ? { ...category, ...updates } : category,
          ),
        })),

      addServiceItem: (categoryId, item) =>
        set((state) => ({
          serviceCategories: state.serviceCategories.map((category) =>
            category.id === categoryId ? { ...category, items: [...category.items, item] } : category,
          ),
        })),

      updateServiceItem: (categoryId, itemId, updates) =>
        set((state) => {
          const serviceCategories = state.serviceCategories.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  items: category.items.map((item) =>
                    item.id === itemId ? { ...item, ...updates, category: item.category } : item,
                  ),
                }
              : category,
          )
          const cart = state.cart.map((item) =>
            item.id === itemId ? { ...item, ...updates, category: item.category } : item,
          )
          return { serviceCategories, cart }
        }),

      deleteServiceItem: (categoryId, itemId) =>
        set((state) => {
          const serviceCategories = state.serviceCategories.map((category) =>
            category.id === categoryId
              ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
              : category,
          )
          const cart = state.cart.filter((item) => item.id !== itemId)
          return { serviceCategories, cart }
        }),

      setAddonsCatalog: (addons) => set({ addonsCatalog: addons }),

      updateAddonCatalog: (addonId, updates) =>
        set((state) => ({
          addonsCatalog: state.addonsCatalog.map((addon) => (addon.id === addonId ? { ...addon, ...updates } : addon)),
          selectedAddons: state.selectedAddons.map((addon) =>
            addon.id === addonId ? { ...addon, ...updates, quantity: addon.quantity ?? 1 } : addon,
          ),
        })),

      setDeliveryOptionsCatalog: (options) => set({ deliveryOptionsCatalog: options }),

      updateDeliveryOption: (optionId, updates) =>
        set((state) => ({
          deliveryOptionsCatalog: state.deliveryOptionsCatalog.map((option) =>
            option.id === optionId ? { ...option, ...updates, quantity: updates.quantity ?? option.quantity } : option,
          ),
        })),

      setPreferredDeliveryOption: (id) =>
        set((state) => ({
          preferredDeliveryOption: id,
          deliveryOptionsCatalog: state.deliveryOptionsCatalog.map((option) =>
            option.id === id
              ? { ...option, quantity: option.quantity && option.quantity > 0 ? option.quantity : 1 }
              : option,
          ),
        })),

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find((i) => i.id === item.id)
          if (existingItem) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity, configuration: item.configuration }
                  : i,
              ),
            }
          }
          return { cart: [...state.cart, item] }
        }),

      updateCartItem: (itemId, quantity, configuration) =>
        set((state) => ({
          cart:
            quantity === 0
              ? state.cart.filter((i) => i.id !== itemId)
              : state.cart.map((i) =>
                  i.id === itemId ? { ...i, quantity, ...(configuration && { configuration }) } : i,
                ),
        })),

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.id !== itemId),
        })),

      clearCart: () =>
        set((state) => ({
          cart: [],
          selectedAddons: [],
          deliveryOptionsCatalog: state.deliveryOptionsCatalog.map((option) =>
            option.id === state.preferredDeliveryOption ? { ...option, quantity: 1 } : { ...option, quantity: 0 },
          ),
        })),

      updateAddonQuantity: (addonId, quantity) =>
        set((state) => {
          const base = state.addonsCatalog.find((addon) => addon.id === addonId)
          if (!base) return state

          if (quantity <= 0) {
            return {
              selectedAddons: state.selectedAddons.filter((addon) => addon.id !== addonId),
            }
          }

          const existing = state.selectedAddons.find((addon) => addon.id === addonId)
          if (existing) {
            return {
              selectedAddons: state.selectedAddons.map((addon) =>
                addon.id === addonId ? { ...addon, quantity } : addon,
              ),
            }
          }

          return {
            selectedAddons: [...state.selectedAddons, { ...base, quantity }],
          }
        }),

      updateDeliveryQuantity: (optionId, quantity) =>
        set((state) => ({
          deliveryOptionsCatalog: state.deliveryOptionsCatalog.map((option) =>
            option.id === optionId ? { ...option, quantity: Math.max(1, quantity) } : option,
          ),
        })),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      getCartTotal: () => {
        const state = get()
        return state.cart.reduce((sum, item) => {
          let itemPrice = getServiceItemFinalPrice(item)

          // Add configuration costs
          if (item.configuration) {
            if (item.configuration.starch) itemPrice += 10
            if (item.configuration.dettol) itemPrice += 15
            if (item.configuration.express) itemPrice += 50
            if (item.configuration.spotRemove) itemPrice += 20
          }

          return sum + itemPrice * item.quantity
        }, 0)
      },

      getAddonsTotal: () => {
        const state = get()
        return state.selectedAddons.reduce(
          (sum, addon) => sum + getAddonFinalPrice(addon) * (addon.quantity ?? 1),
          0,
        )
      },

      getDeliveryFee: () => {
        const state = get()
        if (!state.preferredDeliveryOption) return 0
        const option = state.deliveryOptionsCatalog.find((opt) => opt.id === state.preferredDeliveryOption)
        return option ? getDeliveryOptionFinalPrice(option) * (option.quantity ?? 1) : 0
      },

      updateLoyaltyPoints: (points) =>
        set((state) => {
          if (!state.loyaltyPoints) return state
          const newPoints = state.loyaltyPoints.points + points
          const { getTierByPoints } = require("./loyalty")
          const newTier = getTierByPoints(newPoints)
          return {
            loyaltyPoints: {
              ...state.loyaltyPoints,
              points: newPoints,
              tier: newTier.name,
            },
          }
        }),

      saveDraft: () =>
        set((state) => {
          const draft: DraftOrder = {
            id: `draft_${Date.now()}`,
            items: state.cart,
            addons: state.selectedAddons,
            created_at: new Date().toISOString(),
            synced: false,
          }
          return {
            draftOrders: [...state.draftOrders, draft],
          }
        }),

      loadDraft: (draftId) =>
        set((state) => {
          const draft = state.draftOrders.find((d) => d.id === draftId)
          if (draft) {
            return {
              cart: draft.items,
              selectedAddons: draft.addons,
            }
          }
          return state
        }),

      deleteDraft: (draftId) =>
        set((state) => ({
          draftOrders: state.draftOrders.filter((d) => d.id !== draftId),
        })),

      syncDrafts: async () => {
        const state = get()
        const unsyncedDrafts = state.draftOrders.filter((d) => !d.synced)

        for (const draft of unsyncedDrafts) {
          try {
            // Attempt to sync with server
            const response = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: draft.items,
                addons: draft.addons,
                payment_method: "COD",
              }),
            })

            if (response.ok) {
              // Mark as synced
              set((state) => ({
                draftOrders: state.draftOrders.map((d) => (d.id === draft.id ? { ...d, synced: true } : d)),
              }))
            }
          } catch (error) {
            console.error("[v0] Failed to sync draft:", error)
          }
        }
      },

      setOnlineStatus: (status) => {
        set({ isOnline: status })
        if (status) {
          // Auto-sync when coming online
          get().syncDrafts()
        }
      },

      loginAdmin: (password) => {
        if (password === ADMIN_SECRET) {
          set({ isAdmin: true })
          return true
        }
        return false
      },

      logoutAdmin: () => set({ isAdmin: false }),

      logoutUser: () =>
        set((state) => {
          const nextPreferred = state.deliveryOptionsCatalog[0]?.id ?? null
          return {
            user: null,
            cart: [],
            selectedAddons: [],
            preferredDeliveryOption: nextPreferred,
            deliveryOptionsCatalog: state.deliveryOptionsCatalog.map((option) =>
              option.id === nextPreferred ? { ...option, quantity: 1 } : { ...option, quantity: 0 },
            ),
            isAdmin: false,
          }
        }),
    }),
    {
      name: "dhopa-storage",
    },
  ),
)

