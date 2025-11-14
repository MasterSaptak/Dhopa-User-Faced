"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon: LucideIcon
  accent: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 * index, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={action.href}
            className="group relative block h-full overflow-hidden rounded-3xl border border-sky-500/25 bg-slate-950/80 shadow-[0_25px_60px_-30px_rgba(14,116,233,0.5)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/15 via-transparent to-blue-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col justify-between gap-6 rounded-3xl bg-slate-950/70 p-5">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/30 bg-gradient-to-br ${action.accent} text-white shadow-lg shadow-cyan-500/30 transition-transform duration-300 group-hover:scale-110`}
                >
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-sky-50">{action.title}</h3>
                  <p className="text-sm text-sky-200/75">{action.description}</p>
                </div>
              </div>
              <span className="inline-flex items-center text-sm font-semibold text-sky-200 transition-colors group-hover:text-sky-50">
                Go now →
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

