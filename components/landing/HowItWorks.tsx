"use client"

import { motion } from "framer-motion"
import { Package, Truck, Home } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Schedule Pickup",
    description: "Book a convenient time slot and we'll collect your laundry from your doorstep.",
    icon: Package,
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: 2,
    title: "We Wash & Care",
    description: "Professional cleaning with eco-friendly detergents and careful handling of your garments.",
    icon: Truck,
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: 3,
    title: "Fast Delivery",
    description: "Get your fresh, folded laundry delivered back to you within 24-48 hours.",
    icon: Home,
    color: "from-cyan-500 to-blue-600",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-background to-primary/5"
      aria-label="How it works section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How it Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to fresh, clean laundry delivered to your door
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative"
              >
                <div className="relative flex h-full flex-col gap-6 rounded-2xl border border-primary/10 bg-card p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl md:flex-row md:items-start">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-500 text-white font-bold text-lg shadow-lg">
                    {step.id}
                  </div>

                  {/* Icon */}
                  <motion.div
                    className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-md`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="h-8 w-8" aria-hidden="true" />
                  </motion.div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

