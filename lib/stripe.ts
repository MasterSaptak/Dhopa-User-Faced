import Stripe from "stripe"

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient
  }

  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
  })

  return stripeClient
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

export function getPublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
}
