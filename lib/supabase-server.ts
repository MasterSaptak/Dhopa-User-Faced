import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

const ensureSupabaseEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured")
  }

  return { supabaseUrl, supabaseKey }
}

export function getSupabaseServerClient() {
  const { supabaseUrl, supabaseKey } = ensureSupabaseEnv()
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      /**
       * Server components cannot modify cookies, so we provide no-op setters.
       */
      set() {},
      remove() {},
    },
  })
}

export function createSupabaseRouteHandlerClient(request: NextRequest) {
  const { supabaseUrl, supabaseKey } = ensureSupabaseEnv()
  const response = NextResponse.next()

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })

  return { supabase, response }
}

export function createSupabaseMiddlewareClient(request: NextRequest, response: NextResponse) {
  const { supabaseUrl, supabaseKey } = ensureSupabaseEnv()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })
}

