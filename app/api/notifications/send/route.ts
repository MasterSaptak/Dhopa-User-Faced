import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, title, message, orderId } = body

    if (!customerId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Fetch customer FCM token
    const { data: customer, error } = await supabase
      .from("customers")
      .select("fcm_token, email")
      .eq("id", customerId)
      .single()

    if (error || !customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Send push notification via FCM (if token exists)
    if (customer.fcm_token && process.env.FCM_SERVER_KEY) {
      try {
        const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `key=${process.env.FCM_SERVER_KEY}`,
          },
          body: JSON.stringify({
            to: customer.fcm_token,
            notification: {
              title,
              body: message,
              icon: "/icon-192.png",
              badge: "/icon-192.png",
              click_action: orderId ? `${process.env.NEXTAUTH_URL}/customer/history` : undefined,
            },
            data: {
              orderId,
            },
          }),
        })

        if (!fcmResponse.ok) {
          console.error("[v0] FCM push failed:", await fcmResponse.text())
        }
      } catch (fcmError) {
        console.error("[v0] FCM error:", fcmError)
      }
    }

    // Send email notification via Resend (if configured)
    if (customer.email && process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "DHOPA <noreply@dhopa.com>",
            to: customer.email,
            subject: title,
            html: `
              <h2>${title}</h2>
              <p>${message}</p>
              ${orderId ? `<p><a href="${process.env.NEXTAUTH_URL}/customer/history">View Order</a></p>` : ""}
            `,
          }),
        })
      } catch (emailError) {
        console.error("[v0] Email notification error:", emailError)
      }
    }

    // Send WhatsApp notification (placeholder)
    // In production, integrate with WhatsApp Business API

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Notification send error:", error)
    return NextResponse.json({ error: error.message || "Failed to send notification" }, { status: 500 })
  }
}
