// README: Ensures Supabase profiles stay in sync after auth. Revert via `git rm app/api/auth/profile/route.ts`.
import { NextResponse } from "next/server"

import { createSupabaseRouteHandlerClient } from "@/lib/supabase-server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(request: Request) {
  const { supabase, response } = createSupabaseRouteHandlerClient(request)

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("[DHOPA] Profile sync session error:", sessionError.message)
    return NextResponse.json({ error: "Session lookup failed" }, { status: 500 })
  }

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdminClient()

  const payload = {
    id: session.user.id,
    email: session.user.email ?? null,
    name: (session.user.user_metadata?.full_name as string | undefined) ?? session.user.email ?? "DHOPA user",
    phone: session.user.phone ?? (session.user.user_metadata?.phone as string | undefined) ?? null,
  }

  const { error } = await supabaseAdmin.from("profiles").upsert(payload, { onConflict: "id" })

  if (error) {
    console.error("[DHOPA] Profile upsert failed:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

