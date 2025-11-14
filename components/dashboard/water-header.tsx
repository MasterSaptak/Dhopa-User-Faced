"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface WaterHeaderProps {
  name?: string | null
  tierLabel?: string
}

export function WaterHeader({ name, tierLabel }: WaterHeaderProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-sky-500/25 bg-gradient-to-br from-sky-700 via-blue-800 to-slate-950 px-6 py-8 text-sky-50 shadow-[0_45px_90px_-40px_rgba(14,116,233,0.6)] sm:px-10 sm:py-12 lg:px-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl"
          animate={{ y: [0, -20, 0], opacity: [0.55, 0.75, 0.55] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl"
          animate={{ y: [0, 30, 0], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_90%_10%,rgba(59,130,246,0.28),transparent_60%)]"
          animate={{ opacity: [0.55, 0.75, 0.55] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </div>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-xs uppercase tracking-[0.28em] text-sky-100">
            <Sparkles className="h-4 w-4" />
            <span>Dhopa Care</span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-sky-50 sm:text-4xl lg:text-5xl">
            Hey, <span className="text-sky-100">{name ?? "DHOPA friend"}</span> 👋
          </h1>
          <p className="text-base text-sky-200/80 sm:text-lg">
            Thanks for making laundry day a splash! You&apos;re rocking the{" "}
            <span className="font-semibold text-sky-50">{tierLabel ?? "Bronze"}</span> tier—keep earning those points to
            unlock fresh rewards.
          </p>
        </div>

        <motion.div
          className="relative flex h-40 w-full max-w-[220px] items-center justify-center rounded-3xl border border-sky-400/30 bg-slate-950/40 backdrop-blur-2xl sm:h-48 lg:h-52"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-300/25 via-transparent to-blue-500/20" />
          <div className="absolute inset-0">
            <motion.div
              className="absolute -inset-16 rounded-full border border-sky-200/20"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-cyan-100/25"
              animate={{ rotate: [0, -14, 14, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2 text-white">
            <motion.span
              className="text-5xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              🧼
            </motion.span>
            <span className="text-xs uppercase tracking-[0.32em] text-cyan-100">Stay Fresh</span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

