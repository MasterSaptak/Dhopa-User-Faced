"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Share2, Download } from "lucide-react"
import type { Order } from "@/lib/types"

interface InvoiceProps {
  order: Order
}

export function Invoice({ order }: InvoiceProps) {
  const shareOnWhatsApp = () => {
    const message = `
*DHOPA Laundry Invoice*

Order #: ${order.order_number}
Date: ${new Date(order.created_at).toLocaleDateString()}

*Items:*
${order.items.map((item) => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join("\n")}

${order.addons.length > 0 ? `\n*Add-ons:*\n${order.addons.map((addon) => `${addon.name} - ₹${addon.price}`).join("\n")}` : ""}

Subtotal: ₹${order.subtotal}
${order.discount > 0 ? `Discount: -₹${order.discount}` : ""}
${order.delivery_fee > 0 ? `Delivery: ₹${order.delivery_fee}` : ""}

*Total: ₹${order.total}*

Payment: ${order.payment_method === "cash" ? "Cash on Delivery" : "Online"}
Pickup: ${order.delivery_date} at ${order.delivery_time}

Thank you for choosing DHOPA!
    `.trim()

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const downloadInvoice = () => {
    const invoiceContent = `
DHOPA LAUNDRY
Invoice

Order Number: ${order.order_number}
Date: ${new Date(order.created_at).toLocaleDateString()}
Status: ${order.status}

ITEMS:
${order.items.map((item) => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join("\n")}

${order.addons.length > 0 ? `ADD-ONS:\n${order.addons.map((addon) => `${addon.name} - ₹${addon.price}`).join("\n")}\n` : ""}

SUMMARY:
Subtotal: ₹${order.subtotal}
${order.discount > 0 ? `Discount: -₹${order.discount}\n` : ""}
${order.delivery_fee > 0 ? `Delivery Fee: ₹${order.delivery_fee}\n` : ""}
Total: ₹${order.total}

Payment Method: ${order.payment_method === "cash" ? "Cash on Delivery" : "Online"}
Pickup Schedule: ${order.delivery_date} at ${order.delivery_time}

Thank you for choosing DHOPA!
    `.trim()

    const blob = new Blob([invoiceContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `DHOPA-Invoice-${order.order_number}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="glass p-8 space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-3xl font-bold">Order Confirmed!</h2>
        <p className="text-muted-foreground">Your laundry order has been placed successfully</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order Number</span>
          <span className="font-bold">{order.order_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pickup Schedule</span>
          <span className="font-semibold">
            {order.delivery_date} at {order.delivery_time}
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="font-bold">Items</h3>
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>
              {item.name} x{item.quantity}
            </span>
            <span className="font-semibold">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {order.addons.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-bold">Add-ons</h3>
            {order.addons.map((addon, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{addon.name}</span>
                <span className="font-semibold">₹{addon.price}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">₹{order.subtotal}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-semibold text-green-600">-₹{order.discount}</span>
          </div>
        )}
        {order.delivery_fee > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-semibold">₹{order.delivery_fee}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between text-lg">
          <span className="font-bold">Total</span>
          <span className="font-bold text-primary">₹{order.total}</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment Method</span>
          <span className="font-semibold">{order.payment_method === "cash" ? "Cash on Delivery" : "Online"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Points Earned</span>
          <span className="font-semibold text-primary">+{order.points_earned} points</span>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1 bg-transparent" onClick={shareOnWhatsApp}>
          <Share2 className="w-4 h-4 mr-2" />
          Share on WhatsApp
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent" onClick={downloadInvoice}>
          <Download className="w-4 h-4 mr-2" />
          Download Invoice
        </Button>
      </div>
    </Card>
  )
}
