// README: Premium order UI refresh (2025-11-14). Revert by resetting this file to the previous commit or running `git checkout -- app/order/page.tsx`.
"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { OrderHeader } from "@/components/order/header"
import { ServiceCategory } from "@/components/order/service-category"
import { AddonsSection } from "@/components/order/addons-section"
import { DeliveryOptions } from "@/components/checkout/delivery-options"
import { FloatingSummary } from "@/components/order/floating-summary"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Shirt, Sparkles, Truck } from "lucide-react"

export default function OrderPage() {
  const router = useRouter()
  const cart = useStore((state) => state.cart)
  const serviceCategories = useStore((state) => state.serviceCategories)
  const deliveryOptionsCatalog = useStore((state) => state.deliveryOptionsCatalog)
  const preferredDeliveryOption = useStore((state) => state.preferredDeliveryOption)
  const setPreferredDeliveryOption = useStore((state) => state.setPreferredDeliveryOption)
  const deliveryFee = useStore((state) => state.getDeliveryFee())
  const [activeSection, setActiveSection] = useState<"services" | "addons" | "delivery">("services")
  const [activeServiceCategoryId, setActiveServiceCategoryId] = useState<string | null>(serviceCategories[0]?.id ?? null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const shouldReduceMotion = useReducedMotion()

  const navTabs = useMemo(
    () => [
      {
        id: "services" as const,
        label: "Services",
        description: "Wash, fold & press",
        icon: Shirt,
      },
      {
        id: "addons" as const,
        label: "Boosters",
        description: "Fabric extras",
        icon: Sparkles,
      },
      {
        id: "delivery" as const,
        label: "Delivery",
        description: "Pickup & drop",
        icon: Truck,
      },
    ],
    [],
  )

  useEffect(() => {
    if (!preferredDeliveryOption && deliveryOptionsCatalog[0]) {
      setPreferredDeliveryOption(deliveryOptionsCatalog[0].id)
    }
  }, [preferredDeliveryOption, deliveryOptionsCatalog, setPreferredDeliveryOption])

  useEffect(() => {
    if (
      serviceCategories.length > 0 &&
      (!activeServiceCategoryId || !serviceCategories.some((category) => category.id === activeServiceCategoryId))
    ) {
      setActiveServiceCategoryId(serviceCategories[0].id)
    }
  }, [serviceCategories, activeServiceCategoryId])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-32 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute inset-x-4 bottom-0 h-80 rounded-[40px] bg-gradient-to-t from-sky-500/15 via-transparent to-transparent blur-3xl" />
      </div>

      <OrderHeader />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-36 pt-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between"
        >
          <div className="space-y-3">
            <Badge
              variant="outline"
              className="w-max rounded-full border-cyan-300/50 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200"
            >
              build & relax
            </Badge>
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">Craft your perfect care ritual</h2>
              <p className="max-w-xl text-sm text-slate-300 md:text-base">
                Choose your service mix, boost fabrics with add-ons, and lock in a delivery slot — all in a single,
                thumb-friendly flow.
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-[72px] z-10 w-full md:max-w-sm"
          >
            <label className="group relative flex w-full items-center rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-200 backdrop-blur-xl focus-within:border-cyan-300/60 focus-within:text-white focus:outline-none">
              <Search className="mr-3 h-4 w-4 text-cyan-200 transition-colors group-focus-within:text-cyan-100" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search services or add-ons"
                className="h-auto flex-1 border-0 bg-transparent p-0 text-sm text-white placeholder:text-slate-400 focus-visible:ring-0"
                aria-label="Search services"
              />
            </label>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-lg shadow-cyan-500/5 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-4"
        >
          <div className="flex w-full gap-2 overflow-x-auto pb-1 md:gap-3" role="tablist" aria-label="Order builder sections">
            {navTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeSection === tab.id
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveSection(tab.id)}
                  className="relative flex min-w-[140px] flex-1 items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left text-sm md:min-w-[180px] md:px-4 md:py-3"
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  animate={{
                    backgroundColor: isActive ? "rgba(34,211,238,0.18)" : "rgba(148,163,184,0.12)",
                    borderColor: isActive ? "rgba(165,243,252,0.65)" : "rgba(255,255,255,0)",
                    color: isActive ? "#ecfeff" : "#cbd5f5",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold">{tab.label}</span>
                      <span className="text-[11px] text-slate-300/80">{tab.description}</span>
                    </span>
                  </div>
                  {isActive && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-cyan-400/30 via-sky-500/25 to-blue-500/20"
                      transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
          {activeSection === "services" && (
            <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 text-xs text-slate-200">
              <span className="px-2 text-slate-300">View</span>
              <Button
                type="button"
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-xl px-3"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                Grid
              </Button>
              <Button
                type="button"
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-xl px-3"
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                List
              </Button>
            </div>
          )}
        </motion.div>

        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {activeSection === "services" && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {serviceCategories.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-3xl border border-white/10 bg-white/5 p-3 shadow-md shadow-cyan-500/10 backdrop-blur-xl md:gap-3"
                    >
                      {serviceCategories.map((category) => (
                        <motion.button
                          key={category.id}
                          type="button"
                          onClick={() => setActiveServiceCategoryId(category.id)}
                          className="snap-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
                          aria-pressed={activeServiceCategoryId === category.id}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                          animate={{
                            backgroundColor:
                              activeServiceCategoryId === category.id ? "rgba(56,189,248,0.25)" : "rgba(148,163,184,0.12)",
                            color: activeServiceCategoryId === category.id ? "#ecfeff" : "#cbd5f5",
                            borderColor:
                              activeServiceCategoryId === category.id ? "rgba(165,243,252,0.5)" : "rgba(148,163,184,0.18)",
                          }}
                          transition={{ type: "spring", stiffness: 260, damping: 26 }}
                        >
                          {category.name}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {serviceCategories
                    .filter((category) => !activeServiceCategoryId || category.id === activeServiceCategoryId)
                    .map((category) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <ServiceCategory category={category} viewMode={viewMode} />
                      </motion.div>
                    ))}
                </motion.div>
              )}

              {activeSection === "addons" && (
                <motion.div
                  key="addons"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <AddonsSection />
                </motion.div>
              )}

              {activeSection === "delivery" && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <DeliveryOptions />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden xl:block">
            {cart.length > 0 && (
              <FloatingSummary deliveryFee={deliveryFee} onCheckout={() => router.push("/checkout")} />
            )}
          </div>
        </div>
      </div>

      {cart.length > 0 && (
        <FloatingSummary
          deliveryFee={deliveryFee}
          onCheckout={() => router.push("/checkout")}
          showCheckoutButton={true}
        />
      )}
    </div>
  )
}
