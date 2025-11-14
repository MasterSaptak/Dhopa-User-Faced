"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { OrderHeader } from "@/components/order/header"
import { ServiceCategory } from "@/components/order/service-category"
import { AddonsSection } from "@/components/order/addons-section"
import { DeliveryOptions } from "@/components/checkout/delivery-options"
import { FloatingSummary } from "@/components/order/floating-summary"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shirt, Sparkles, Truck } from "lucide-react"

export default function OrderPage() {
  const router = useRouter()
  const cart = useStore((state) => state.cart)
  const serviceCategories = useStore((state) => state.serviceCategories)
  const deliveryOptionsCatalog = useStore((state) => state.deliveryOptionsCatalog)
  const preferredDeliveryOption = useStore((state) => state.preferredDeliveryOption)
  const setPreferredDeliveryOption = useStore((state) => state.setPreferredDeliveryOption)
  const deliveryFee = useStore((state) => state.getDeliveryFee())
  const [activeSection, setActiveSection] = useState<"services" | "addons" | "delivery">("services")
  const [activeServiceCategoryId, setActiveServiceCategoryId] = useState<string | null>(
    serviceCategories[0]?.id ?? null,
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <OrderHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center space-y-2">
          <h2 className="text-3xl font-bold">Build Your Laundry Order</h2>
          <p className="text-muted-foreground">Pick services, add-ons, and delivery preferences in one place.</p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <Button
            variant={activeSection === "services" ? "default" : "outline"}
            onClick={() => setActiveSection("services")}
            className="transition-all hover:scale-105 active:scale-95"
          >
            <Shirt className="h-4 w-4" />
            Washing & Ironing
          </Button>
          <Button
            variant={activeSection === "addons" ? "default" : "outline"}
            onClick={() => setActiveSection("addons")}
            className="transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            Add-ons
          </Button>
          <Button
            variant={activeSection === "delivery" ? "default" : "outline"}
            onClick={() => setActiveSection("delivery")}
            className="transition-all hover:scale-105 active:scale-95"
          >
            <Truck className="h-4 w-4" />
            Delivery
          </Button>
        </div>

        <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {activeSection === "services" && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  {serviceCategories.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/70 p-3 shadow-lg shadow-primary/10 backdrop-blur-md md:justify-start"
                    >
                      {serviceCategories.map((category) => (
                        <Button
                          key={category.id}
                          variant={activeServiceCategoryId === category.id ? "default" : "outline"}
                          size="sm"
                          className="rounded-full transition-all hover:scale-105 active:scale-95"
                          onClick={() => setActiveServiceCategoryId(category.id)}
                        >
                          {category.name}
                        </Button>
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
                        <ServiceCategory category={category} />
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
                  transition={{ duration: 0.35, ease: "easeOut" }}
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
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <DeliveryOptions />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden xl:block">{cart.length > 0 && <FloatingSummary deliveryFee={deliveryFee} onCheckout={() => router.push("/checkout")} />}</div>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <FloatingSummary
              deliveryFee={deliveryFee}
              onCheckout={() => router.push("/checkout")}
              showCheckoutButton={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}
