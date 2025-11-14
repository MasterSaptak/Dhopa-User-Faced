"use client"

import { LandingHeader } from "@/components/landing/Header"
import { Hero } from "@/components/landing/Hero"
import { Products } from "@/components/landing/Products"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { PricingSnapshot } from "@/components/landing/PricingSnapshot"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1" role="main" aria-label="DHOPA landing content">
        <Hero />
        <Products />
        <HowItWorks />
        <PricingSnapshot />
      </main>
      <Footer />
    </div>
  )
}

