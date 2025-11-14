import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register"
import { OfflineIndicator } from "@/components/offline/offline-indicator"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-secondary",
  display: "swap",
})

export const metadata: Metadata = {
  title: "DHOPA - Premium Laundry Service",
  description: "Professional laundry and dry cleaning service at your doorstep",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DHOPA",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "DHOPA",
    title: "DHOPA - Premium Laundry Service",
    description: "Professional laundry and dry cleaning service at your doorstep",
  },
}

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} font-sans antialiased text-foreground`}
      >
        <div className="relative min-h-screen overflow-hidden bg-[#e6f7ff]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(152,206,255,0.35),transparent_60%),radial-gradient(circle_at_85%_15%,rgba(116,194,255,0.3),transparent_55%),radial-gradient(circle_at_50%_85%,rgba(180,226,255,0.4),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 backdrop-blur-[110px]" />
          <main className="relative z-10 flex min-h-screen flex-col">
            {children}
          </main>
          <Analytics />
          <OfflineIndicator />
          <ServiceWorkerRegister />
          <Toaster />
        </div>
      </body>
    </html>
  )
}
