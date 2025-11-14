"use client"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { InvoiceDownloadButton } from "./invoice-download-button"

interface InvoicePreviewProps {
  order: any
}

export function InvoicePreview({ order }: InvoicePreviewProps) {
  const subtotal = Number.parseFloat(order.subtotal || 0)
  const addonsTotal = Number.parseFloat(order.addons_total || 0)
  const configTotal = Number.parseFloat(order.configuration_total || 0)
  const deliveryFee = Number.parseFloat(order.delivery_fee || 0)
  const discount = Number.parseFloat(order.discount_amount || 0)
  const tax = Number.parseFloat(order.tax_amount || 0)
  const total = Number.parseFloat(order.total || 0)

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-1">Invoice</h2>
            <p className="text-sm text-slate-400">Order #{order.order_number}</p>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            {order.payment_status === "paid" ? "Paid" : "Pending"}
          </Badge>
        </div>

        <Separator className="bg-slate-800 mb-6" />

        {/* Items */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-slate-300">Items</h3>
          {order.order_items?.map((item: any, index: number) => {
            const configs = []
            if (item.starch) configs.push("Starch")
            if (item.dettol) configs.push("Dettol")
            if (item.express) configs.push("Express")
            if (item.spot_remove) configs.push("Spot Remove")

            return (
              <div key={index} className="flex items-start justify-between text-sm">
                <div className="flex-1">
                  <p className="text-slate-200">{item.item_name}</p>
                  {configs.length > 0 && <p className="text-xs text-slate-500">{configs.join(", ")}</p>}
                  <p className="text-xs text-slate-500">
                    ₹{Number.parseFloat(item.unit_price).toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="text-slate-200 font-medium">₹{Number.parseFloat(item.line_total).toFixed(2)}</p>
              </div>
            )
          })}
        </div>

        {/* Add-ons */}
        {order.order_addons?.length > 0 && (
          <>
            <Separator className="bg-slate-800 mb-4" />
            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-semibold text-slate-300">Add-ons</h3>
              {order.order_addons.map((addon: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <p className="text-slate-400">{addon.addon_name}</p>
                  <p className="text-slate-200">₹{Number.parseFloat(addon.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator className="bg-slate-800 mb-4" />

        {/* Pricing Breakdown */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-slate-200">₹{subtotal.toFixed(2)}</span>
          </div>

          {configTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Configuration</span>
              <span className="text-slate-200">₹{configTotal.toFixed(2)}</span>
            </div>
          )}

          {addonsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Add-ons Total</span>
              <span className="text-slate-200">₹{addonsTotal.toFixed(2)}</span>
            </div>
          )}

          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Delivery Fee</span>
              <span className="text-slate-200">₹{deliveryFee.toFixed(2)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Discount</span>
              <span className="text-red-400">-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Tax (5% GST)</span>
            <span className="text-slate-200">₹{tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator className="bg-slate-800 mb-4" />

        {/* Total */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-semibold text-slate-100">Total</span>
          <span className="text-2xl font-bold text-cyan-400">₹{total.toFixed(2)}</span>
        </div>

        {/* Download Button */}
        <InvoiceDownloadButton orderId={order.id} orderNumber={order.order_number} className="w-full" size="lg" />

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-2 text-xs text-slate-500">
          <p>Payment Method: {order.payment_method?.toUpperCase()}</p>
          <p>Delivery Type: {order.delivery_type}</p>
          <p>Loyalty Points Earned: {order.points_earned}</p>
        </div>
      </div>
    </Card>
  )
}
