"use client"

import { motion } from "framer-motion"
import { WashingMachine, Shirt, Sparkles } from "lucide-react"

const products = [
  {
    id: "washing",
    name: "Washing & Folding",
    description: "Freshly washed, dried, and neatly folded apparel for daily comfort.",
    icon: WashingMachine,
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: "dry-ironing",
    name: "Dry Ironing",
    description: "Crisp, wrinkle-free finish for all your garments.",
    icon: Shirt,
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "steam-ironing",
    name: "Steam Ironing",
    description: "Premium steam press for delicate and formal wear.",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-600",
  },
]

export function Products() {
  return (
    <section
      id="products"
      className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-background to-primary/5"
      aria-label="Products section"
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
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional laundry services tailored for students and busy professionals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {products.map((product, index) => {
            const Icon = product.icon
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="relative bg-card rounded-2xl p-8 border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <motion.div
                    className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${product.color} text-white shadow-md`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="h-8 w-8" aria-hidden="true" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{product.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

