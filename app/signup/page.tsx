"use client"

import { motion } from "framer-motion"

import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e6f7ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(106,205,255,0.35),transparent_55%),radial-gradient(circle_at_85%_20%,rgba(71,171,255,0.3),transparent_55%),radial-gradient(circle_at_35%_85%,rgba(158,224,255,0.35),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 backdrop-blur-[120px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl rounded-[32px] border border-white/40 bg-white/60 p-8 shadow-2xl shadow-cyan-400/30 backdrop-blur-xl md:p-10"
        >
          <SignupForm />
        </motion.div>
      </div>
    </div>
  )
}

