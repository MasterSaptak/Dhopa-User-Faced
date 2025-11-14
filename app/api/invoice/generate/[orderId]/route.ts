import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"
import { generateInvoicePDF, getPDFBlob } from "@/lib/pdf-generator"
import { cookies } from "next/headers"

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Fetch order with all details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        customers (*),
        order_items (*),
        order_addons (*)
      `)
      .eq("id", params.orderId)
      .eq("customer_id", userId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase.from("invoices").select("*").eq("order_id", order.id).single()

    let invoiceNumber = existingInvoice?.invoice_number
    let pdfUrl = existingInvoice?.pdf_url

    // Generate invoice number if it doesn't exist
    if (!invoiceNumber) {
      invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${order.order_number.slice(-6)}`
    }

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber,
      orderNumber: order.order_number,
      date: order.created_at,
      customer: {
        name: order.customers?.full_name || "Customer",
        email: order.customers?.email,
        phone: order.customers?.phone,
        address: order.delivery_address || order.customers?.address,
      },
      items: order.order_items.map((item: any) => {
        const config = []
        if (item.starch) config.push("Starch")
        if (item.dettol) config.push("Dettol")
        if (item.express) config.push("Express")
        if (item.spot_remove) config.push("Spot Remove")

        return {
          name: item.item_name,
          quantity: item.quantity,
          unitPrice: Number.parseFloat(item.unit_price),
          configuration: config.length > 0 ? config.join(", ") : undefined,
          total: Number.parseFloat(item.line_total),
        }
      }),
      addons: order.order_addons.map((addon: any) => ({
        name: addon.addon_name,
        price: Number.parseFloat(addon.price),
      })),
      pricing: {
        subtotal: Number.parseFloat(order.subtotal),
        addonsTotal: Number.parseFloat(order.addons_total || 0),
        configurationTotal: Number.parseFloat(order.configuration_total || 0),
        deliveryFee: Number.parseFloat(order.delivery_fee || 0),
        discount: Number.parseFloat(order.discount_amount || 0),
        tax: Number.parseFloat(order.tax_amount || 0),
        total: Number.parseFloat(order.total),
      },
      paymentMethod: order.payment_method,
      deliveryType: order.delivery_type,
      loyaltyPointsEarned: order.points_earned,
    }

    // Generate PDF
    const pdfDoc = generateInvoicePDF(invoiceData)
    const pdfBlob = getPDFBlob(pdfDoc)

    // Upload to Supabase Storage if not already uploaded
    if (!pdfUrl) {
      const fileName = `${userId}/${invoiceNumber}.pdf`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        })

      if (uploadError) {
        console.error("[v0] PDF upload error:", uploadError)
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(fileName)

        pdfUrl = urlData.publicUrl

        // Update or create invoice record
        if (existingInvoice) {
          await supabase.from("invoices").update({ pdf_url: pdfUrl }).eq("id", existingInvoice.id)
        } else {
          await supabase.from("invoices").insert({
            invoice_number: invoiceNumber,
            order_id: order.id,
            customer_id: userId,
            pdf_url: pdfUrl,
            amount: Number.parseFloat(order.total),
          })
        }

        // Update order with invoice URL
        await supabase.from("orders").update({ invoice_url: pdfUrl }).eq("id", order.id)
      }
    }

    // Return PDF as download
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("[v0] Invoice generation error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate invoice" }, { status: 500 })
  }
}
