import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { createSupabaseMiddlewareClient } from "@/lib/supabase-server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createSupabaseMiddlewareClient(request, response)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthenticated = Boolean(session)
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/customer") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const isAdmin = session?.user?.app_metadata?.role === "admin" || session?.user?.user_metadata?.role === "admin"

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/customer/:path*", "/admin/:path*"],
}
