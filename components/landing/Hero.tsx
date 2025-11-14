"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section
      id="hero"
      data-test-id="hero-section"
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-cyan-50/50"
      aria-label="Hero section"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Student-Friendly Laundry Service</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground"
            >
              Simple, affordable laundry{" "}
              <span className="bg-gradient-to-r from-primary via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                built for students
              </span>
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0"
            >
              Pick-up, wash, and doorstep delivery — transparent pricing and student-friendly plans.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="group" data-test-id="hero-cta-primary">
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" data-test-id="hero-cta-secondary">
                <Link href="#pricing">See Pricing</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" data-test-id="hero-cta-order">
                <Link href="/dashboard">Place Your Order</Link>
              </Button>
            </motion.div>

            {/* Metrics Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                <span>Fast pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                <span>Student friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                <span>Low prices</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="relative aspect-square w-full max-w-md rounded-[2.5rem] border border-primary/10 bg-white/80 p-10 shadow-[0_30px_70px_-40px_rgba(14,116,233,0.75)] backdrop-blur-3xl">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-cyan-200/40 via-transparent to-blue-200/50" />
              <motion.div
                className="relative z-10 mx-auto flex h-full w-full items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative h-48 w-48">
                  <Image
                    src="/placeholder.svg"
                    alt="Illustration of cat washing clothes"
                    fill
                    sizes="(max-width: 768px) 60vw, 24rem"
                    className="object-contain drop-shadow-lg"
                    priority
                  />
                </div>
              </motion.div>
              {[...Array(6)].map((_, index) => (
                <motion.span
                  key={index}
                  className="absolute rounded-full bg-primary/20"
                  style={{
                    width: `${24 + index * 8}px`,
                    height: `${24 + index * 8}px`,
                    left: `${10 + index * 12}%`,
                    top: `${15 + (index % 3) * 28}%`,
                  }}
                  animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -25, 0] }}
                  transition={{ duration: 2.4 + index * 0.4, repeat: Infinity, delay: index * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

