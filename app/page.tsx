"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import {
  ShoppingBag,
  MapPin,
  History,
  Gift,
  MessagesSquare,
  Clock4,
  Sparkles,
  Wand2,
  Droplets,
  SunMedium,
  Leaf,
  SprayCan,
  WashingMachine,
  Shirt,
  CalendarCheck,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { WaterHeader } from "@/components/dashboard/water-header"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { getTierByPoints, getPointsToNextTier, getNextTier } from "@/lib/loyalty"

const QUICK_ACTIONS = [
  {
    id: "place-order",
    title: "Place order",
    description: "Fresh wash, dry & steam services",
    href: "/order",
    icon: ShoppingBag,
    accent: "from-cyan-500/80 to-blue-600/70",
  },
  {
    id: "track-order",
    title: "Track order",
    description: "See laundry care progress live",
    href: "/orders",
    icon: MapPin,
    accent: "from-sky-500/80 to-cyan-500/70",
  },
  {
    id: "history",
    title: "My history",
    description: "Invoices & past wash cycles",
    href: "/history",
    icon: History,
    accent: "from-blue-500/80 to-indigo-500/70",
  },
  {
    id: "offers",
    title: "Offers & support",
    description: "Tier deals & chat with team",
    href: "/offers",
    icon: Gift,
    accent: "from-cyan-400/80 to-teal-500/70",
  },
] as const

const PROACTIVE_OFFERS = [
  {
    id: "double-points",
    heading: "Weekend splash bonus",
    blurb: "Earn 2× loyalty points on all orders placed before Sunday midnight.",
    tag: "All tiers",
  },
  {
    id: "gold-upgrade",
    heading: "Express upgrade",
    blurb: "Gold members enjoy free express delivery on your next two pickups.",
    tag: "Gold tier",
  },
  {
    id: "refer-friends",
    heading: "Refer & sparkle",
    blurb: "Refer a friend and both of you get ₹150 off + 100 bonus points.",
    tag: "Share & earn",
  },
] as const

const SERVICE_SPOTLIGHT = [
  {
    id: "wash-fold",
    title: "Wash & Fold Perfection",
    blurb: "Sorted by colour, softened with allergen-free rinse, and folded with precision.",
    icon: WashingMachine,
    badge: "Most loved",
    accent: "from-cyan-400/70 to-blue-500/70",
  },
  {
    id: "steam-press",
    title: "Steam Press Finish",
    blurb: "Wrinkle-free garments with fabric-safe steam technology and cedar-infused freshness.",
    icon: Shirt,
    badge: "Premium touch",
    accent: "from-sky-500/70 to-indigo-500/70",
  },
  {
    id: "eco-care",
    title: "Eco Bubble Bath",
    blurb: "Plant-powered detergents and smart water dosing keep garments gentle on skin.",
    icon: Leaf,
    badge: "Eco friendly",
    accent: "from-emerald-400/70 to-cyan-500/70",
  },
] as const

const CARE_RITUALS = [
  {
    id: "quick-pickup",
    title: "Pickups in 30 min",
    description: "Riders are dispatched from the closest hub with insulated laundry pods.",
    icon: CalendarCheck,
  },
  {
    id: "water-saved",
    title: "178L water saved",
    description: "Smart load balancing and rinse reuse saved this week alone.",
    icon: Droplets,
  },
  {
    id: "sun-kissed",
    title: "Sun-kissed dry rooms",
    description: "UV-safe rooms finish drying without harsh heat for fabric longevity.",
    icon: SunMedium,
  },
  {
    id: "soap-switch",
    title: "Zero-residue soaps",
    description: "Medical-grade hypoallergenic soap base for sensitive households.",
    icon: SprayCan,
  },
] as const

const PANEL_BASE =
  "relative overflow-hidden rounded-3xl border border-sky-500/25 bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-blue-900/80 text-sky-100 shadow-[0_35px_80px_-35px_rgba(14,116,233,0.55)] backdrop-blur-2xl"

const PANEL_CARD =
  "rounded-2xl border border-sky-500/25 bg-slate-950/80 text-sky-100 shadow-[0_25px_60px_-30px_rgba(14,116,233,0.5)] backdrop-blur-xl"

export default function HomePage() {
  const user = useStore((state) => state.user)
  const loyaltyPoints = useStore((state) => state.loyaltyPoints)
  const orders = useStore((state) => state.orders)

  const storePersist = (useStore as typeof useStore & {
    persist?: {
      hasHydrated?: () => boolean
      onFinishHydration?: (callback: () => void) => (() => void) | undefined
    }
  }).persist

  const [hasHydrated, setHasHydrated] = useState<boolean>(false)

  useEffect(() => {
    if (!storePersist) {
      setHasHydrated(true)
      return
    }

    if (storePersist.hasHydrated?.()) {
      setHasHydrated(true)
      return
    }

    if (!storePersist.onFinishHydration) {
      setHasHydrated(true)
      return
    }

    const unsub = storePersist.onFinishHydration(() => setHasHydrated(true))
    return () => {
      unsub?.()
    }
  }, [storePersist])

  const safeFormatDate = (value?: string, pattern = "dd MMM yyyy") => {
    if (!value) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return format(parsed, pattern)
  }

  const greetingName = useMemo(() => {
    if (user?.full_name) {
      return user.full_name.split(" ")[0]
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "there"
  }, [user?.email, user?.full_name])

  const activeOrder = useMemo(() => {
    return orders.find((order) => order.status !== "completed" && order.status !== "cancelled")
  }, [orders])

  const mostRecentCompleted = useMemo(() => {
    return orders.find((order) => order.status === "completed")
  }, [orders])

  const upcomingPickup = useMemo(() => {
    return orders.find((order) => order.status === "pending" || order.status === "processing")
  }, [orders])

  const pickupDateLabel = upcomingPickup
    ? safeFormatDate(upcomingPickup.pickup_date ?? upcomingPickup.created_at, "EEE · dd MMM")
    : null

  const loyaltyPointTotal = loyaltyPoints?.points ?? 0
  const loyaltyTier = getTierByPoints(loyaltyPointTotal)
  const nextTier = getNextTier(loyaltyTier)
  const pointsToNextTier = getPointsToNextTier(loyaltyPointTotal)
  const loyaltyProgress = nextTier
    ? Math.min(1, (loyaltyPointTotal - loyaltyTier.minPoints) / (nextTier.minPoints - loyaltyTier.minPoints))
    : 1

  if (!hasHydrated) {
    return null
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 left-10 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute inset-x-0 top-1/2 h-72 rounded-full bg-gradient-to-r from-cyan-400/10 via-transparent to-blue-500/10 blur-3xl" />
      </div>

      <WaterHeader name={greetingName} tierLabel={loyaltyPoints?.tier} />

      <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className={`${PANEL_BASE} h-full p-5`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-sky-200/75">Pickup status</p>
                  <h2 className="text-xl font-semibold text-sky-50">
                    {upcomingPickup ? "Laundry run confirmed" : "No pickup queued"}
                  </h2>
                  <p className="text-sm text-sky-200/75">
                    {upcomingPickup
                      ? `Rider arrives${pickupDateLabel ? ` ${pickupDateLabel}` : ""}${
                          upcomingPickup.pickup_time ? ` · ${upcomingPickup.pickup_time}` : ""
                        }. We’ll notify you when we’re en route.`
                      : "Book a pickup in two taps and we’ll dispatch the closest rider instantly."}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/30 bg-slate-950/50 text-sky-100">
                  <CalendarCheck className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-sky-200/75 sm:grid-cols-3">
                <div className="rounded-2xl border border-sky-500/25 bg-slate-950/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-200/65">Window</p>
                  <p className="mt-1 font-semibold text-sky-50">
                    {pickupDateLabel
                      ? `${pickupDateLabel}${upcomingPickup?.pickup_time ? ` · ${upcomingPickup.pickup_time}` : ""}`
                      : "Pick any 2 hr slot"}
                  </p>
                </div>
                <div className="rounded-2xl border border-sky-500/25 bg-slate-950/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-200/65">Tier perks</p>
                  <p className="mt-1 font-semibold text-sky-50">{loyaltyTier.name}</p>
                </div>
                <div className="rounded-2xl border border-sky-500/25 bg-slate-950/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-200/65">Care plan</p>
                  <p className="mt-1 font-semibold text-sky-50">Softener + crease guard</p>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className={`${PANEL_BASE} h-full p-5`}
            >
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs uppercase tracking-[0.32em] text-sky-200/75">Loyalty</p>
                  <h3 className="text-xl font-semibold text-sky-50">
                    {loyaltyTier.name} · <span className="text-sky-200">{loyaltyPointTotal} pts</span>
                  </h3>
                  <p className="text-sm text-sky-200/75">
                    {nextTier ? `${pointsToNextTier} pts to reach ${nextTier.name}` : "You’ve unlocked every tier perk"}
                  </p>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm text-sky-200/70">
                    <Gift className="h-4 w-4 text-sky-100" />
                    <span>
                      {nextTier ? `${nextTier.name} perks unlock next.` : "Enjoy priority care & express delivery."}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-sky-500/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(loyaltyProgress * 100)}%` }}
                      transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 shadow-[0_0_16px_rgba(56,189,248,0.35)]"
                    />
                  </div>
                  <div className="mt-3 grid gap-1 text-xs text-sky-200/70">
                    <span>Next reward: free stain shield add-on with your following wash.</span>
                    <span>Point booster live every weekend.</span>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          <QuickActions actions={QUICK_ACTIONS} />

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="grid gap-4 md:grid-cols-3"
          >
            {SERVICE_SPOTLIGHT.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * index, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative h-full overflow-hidden rounded-3xl border border-sky-500/25 bg-slate-950/80 p-5 text-sky-100 shadow-[0_30px_70px_-40px_rgba(14,116,233,0.55)] backdrop-blur-xl"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/15 via-transparent to-blue-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex h-full flex-col gap-4">
                    <span className="inline-flex w-fit items-center rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-sky-200">
                      {service.badge}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br ${service.accent}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-sky-50">{service.title}</h3>
                    </div>
                    <p className="text-sm text-sky-200/75">{service.blurb}</p>
                    <span className="mt-auto text-sm font-semibold text-sky-200/80">Explore details →</span>
                  </div>
                </motion.div>
              )
            })}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className={`${PANEL_BASE} p-5`}
          >
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-1 text-xs uppercase tracking-[0.28em] text-sky-100">
                  <Sparkles className="h-4 w-4" />
                  Highlights
                </div>
                <h2 className="text-xl font-semibold text-sky-50">Keep your flow effortless</h2>
                <p className="max-w-xl text-sm text-sky-200/80">
                  Pick up exactly where you left off. Your cart, loyalty points, and preferred delivery slots stay in
                  sync across devices.
                </p>
              </div>
              <Link
                href="/order"
                className="ripple-overlay inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-gradient-to-r from-cyan-500/40 to-blue-500/40 px-5 py-2 text-sm font-semibold text-sky-50 transition-transform hover:-translate-y-[2px]"
              >
                Continue order
                <Wand2 className="h-4 w-4" />
              </Link>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className={`${PANEL_BASE} p-5`}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-blue-600/20" />
            {activeOrder ? (
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.32em] text-sky-200/80">Ongoing order</p>
                  <h3 className="text-2xl font-semibold text-sky-50">Order #{activeOrder.order_number}</h3>
                  <p className="flex items-center gap-2 text-sm text-sky-200/80">
                    <OrderStatusBadge status={activeOrder.status} isRealtime />
                    {(() => {
                      const deliveryDateLabel = safeFormatDate(activeOrder.delivery_date, "dd MMM")
                      const createdDateFallback = safeFormatDate(activeOrder.created_at, "dd MMM")
                      if (deliveryDateLabel) {
                        return `Expected ${deliveryDateLabel}${activeOrder.delivery_time ? ` · ${activeOrder.delivery_time}` : ""}`
                      }
                      if (createdDateFallback) {
                        return `Placed ${createdDateFallback}`
                      }
                      return "We’ll keep you posted every step of the way"
                    })()}
                  </p>
                </div>
                <Link
                  href="/orders"
                  className="ripple-overlay inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-50 transition-transform hover:-translate-y-[2px]"
                >
                  Track status
                  <Clock4 className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="relative flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-sky-200/80">No active orders</p>
                  <h3 className="text-2xl font-semibold text-sky-50">Laundry day ready?</h3>
                  <p className="text-sm text-sky-200/80">
                    Place a quick order and earn extra loyalty points on your first wash this week.
                  </p>
                </div>
                <Link
                  href="/order"
                  className="ripple-overlay inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-gradient-to-r from-cyan-500/45 to-blue-600/45 px-4 py-2 text-sm font-semibold text-sky-50 transition-transform hover:-translate-y-[2px]"
                >
                  Start now
                </Link>
              </div>
            )}
          </motion.section>
        </div>

        <div className="flex flex-col gap-4">
          {mostRecentCompleted && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className={`${PANEL_BASE} p-5`}
            >
              <div className="absolute -top-10 right-4 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">Last order</p>
              <h4 className="mt-2 text-lg font-semibold text-sky-50">Order #{mostRecentCompleted.order_number}</h4>
              <p className="text-sm text-sky-200/80">
                {(() => {
                  const delivered = safeFormatDate(mostRecentCompleted.delivery_date)
                  const created = safeFormatDate(mostRecentCompleted.created_at)
                  if (delivered) return `Delivered on ${delivered}`
                  if (created) return `Completed on ${created}`
                  return "Completed recently"
                })()}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-semibold text-sky-50">
                  ₹{mostRecentCompleted.total.toFixed(0)}
                </span>
                <Link href={`/orders`} className="text-sm font-medium text-sky-200 underline underline-offset-4">
                  Reorder
                </Link>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className={`${PANEL_BASE} flex flex-col gap-3 p-5`}
          >
            <div className="flex items-center gap-3">
              <MessagesSquare className="h-5 w-5 text-sky-200" />
              <h4 className="text-lg font-semibold text-sky-50">Need help?</h4>
            </div>
            <p className="text-sm text-sky-200/80">
              Our DHOPA care team is active 8am–10pm. Ping us on WhatsApp for instant support.
            </p>
            <Link
              href="https://wa.me/919876543210"
              className="ripple-overlay inline-flex items-center justify-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-50 hover:-translate-y-[2px]"
            >
              Chat on WhatsApp
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`${PANEL_BASE} p-5`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-transparent to-blue-600/20" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.32em] text-sky-200/80">Offers & alerts</p>
            <h2 className="text-2xl font-semibold text-sky-50">Fresh rewards tailored for you</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROACTIVE_OFFERS.map((offer, idx) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * idx, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={`${PANEL_CARD} p-4`}
              >
                <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">{offer.tag}</p>
                <h3 className="mt-2 text-lg font-semibold text-sky-50">{offer.heading}</h3>
                <p className="mt-1 text-sm text-sky-200/75">{offer.blurb}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {CARE_RITUALS.map((ritual, idx) => {
          const Icon = ritual.icon
          return (
            <motion.div
              key={ritual.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * idx, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-sky-500/25 bg-slate-950/75 p-5 text-sky-100 shadow-[0_25px_60px_-32px_rgba(14,116,233,0.55)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/15 text-sky-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-sky-50">{ritual.title}</h3>
              </div>
              <p className="mt-3 text-sm text-sky-200/75">{ritual.description}</p>
            </motion.div>
          )
        })}
      </motion.section>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      >
        <Link
          href="/order"
          className="ripple-overlay fixed bottom-6 right-6 z-30 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_30px_60px_-20px_rgba(34,197,247,0.5)] transition-transform hover:-translate-y-1 md:bottom-10 md:right-10"
        >
          <ShoppingBag className="h-6 w-6" />
        </Link>
      </motion.div>
    </div>
  )
}
