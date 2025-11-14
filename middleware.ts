import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get auth token from cookie (demo mode)
  const authToken = request.cookies.get("dhopa-auth")?.value

  // Protected customer routes
  if (request.nextUrl.pathname.startsWith("/customer")) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Protected admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Additional role check would go here when Supabase is integrated
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/customer/:path*", "/admin/:path*"],
}
