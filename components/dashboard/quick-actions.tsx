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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 * index, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <Link
            href={action.href}
            className="group relative z-10 isolate block h-full w-full overflow-hidden rounded-2xl border border-sky-500/25 bg-slate-950/80 shadow-[0_20px_50px_-25px_rgba(14,116,233,0.4)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-[0_25px_60px_-25px_rgba(14,116,233,0.5)]"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10 flex h-full min-h-[120px] flex-col gap-4 p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-gradient-to-br ${action.accent} text-white shadow-md shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-105`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-sky-50 leading-tight">{action.title}</h3>
                  <p className="mt-1 text-xs text-sky-200/70 leading-relaxed">{action.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-end pt-1">
                <span className="inline-flex items-center text-xs font-medium text-sky-300/80 transition-colors group-hover:text-sky-200">
                  Go now
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

