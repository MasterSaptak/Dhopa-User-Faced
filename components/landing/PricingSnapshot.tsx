"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Info } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getPricingSnapshot } from "@/lib/pricingAdapter"
import { cn } from "@/lib/utils"

export function PricingSnapshot() {
  const pricingData = getPricingSnapshot()

  if (pricingData.length === 0) {
    return (
      <section
        id="pricing"
        className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-primary/5 to-background"
        aria-label="Pricing section"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">Pricing information coming soon</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="pricing"
      className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-primary/5 to-background"
      aria-label="Pricing section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 space-y-4 text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Student-friendly rates wired directly to the live DHOPA catalog. Click any card to preview the full price sheet.
          </p>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Admin-friendly • Powered by `lib/services-data.ts`
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" data-test-id="pricing-grid">
          {/* Admin note: cards read from lib/services-data.ts via lib/pricingAdapter.ts */}
          <AnimatePresence>
            {pricingData.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      data-test-id={`pricing-card-${category.id}`}
                      className={cn(
                        "w-full text-left bg-card rounded-2xl p-6 border border-primary/10 shadow-md",
                        "hover:shadow-xl hover:border-primary/20 transition-all duration-300",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      )}
                    >
                      <div className="mb-4 flex items-start justify-between gap-2">
                        <h3 className="text-xl font-bold text-foreground">{category.name}</h3>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex h-8 w-8 cursor-help items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                              <Info className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Tap to view full pricing</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-white">
                            View live pricing sourced from the DHOPA catalog
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{category.exampleItem}</p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{category.examplePrice}
                          <span className="text-sm font-normal text-muted-foreground ml-1">starting</span>
                        </p>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <div className="space-y-6">
                      <DialogTitle className="text-2xl font-bold text-foreground">{category.name}</DialogTitle>
                      <div className="space-y-3">
                        {category.fullPricing.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-lg border border-primary/10 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                              )}
                            </div>
                            <p className="text-lg font-bold text-primary ml-4">₹{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

