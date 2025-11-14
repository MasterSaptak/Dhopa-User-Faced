import jsPDF from "jspdf"

interface InvoiceData {
  invoiceNumber: string
  orderNumber: string
  date: string
  customer: {
    name: string
    email?: string
    phone?: string
    address?: string
  }
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    configuration?: string
    total: number
  }>
  addons: Array<{
    name: string
    price: number
  }>
  pricing: {
    subtotal: number
    addonsTotal: number
    configurationTotal: number
    deliveryFee: number
    discount: number
    tax: number
    total: number
  }
  paymentMethod: string
  deliveryType: string
  loyaltyPointsEarned: number
}

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF()

  // Set font
  doc.setFont("helvetica")

  // Header - Company Logo and Name
  doc.setFontSize(24)
  doc.setTextColor(6, 182, 212) // Cyan color
  doc.text("DHOPA", 20, 25)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("Laundry & Dry Cleaning Services", 20, 32)

  // Invoice Title
  doc.setFontSize(20)
  doc.setTextColor(0, 0, 0)
  doc.text("INVOICE", 150, 25)

  // Invoice Details
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Invoice: ${data.invoiceNumber}`, 150, 32)
  doc.text(`Order: ${data.orderNumber}`, 150, 38)
  doc.text(`Date: ${new Date(data.date).toLocaleDateString("en-IN")}`, 150, 44)

  // Customer Details
  let yPos = 55
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text("Bill To:", 20, yPos)

  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  yPos += 7
  doc.text(data.customer.name, 20, yPos)

  if (data.customer.email) {
    yPos += 5
    doc.text(data.customer.email, 20, yPos)
  }

  if (data.customer.phone) {
    yPos += 5
    doc.text(data.customer.phone, 20, yPos)
  }

  if (data.customer.address) {
    yPos += 5
    const addressLines = doc.splitTextToSize(data.customer.address, 80)
    doc.text(addressLines, 20, yPos)
    yPos += addressLines.length * 5
  }

  // Items Table Header
  yPos += 15
  doc.setFillColor(6, 182, 212)
  doc.rect(20, yPos, 170, 8, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text("Item", 25, yPos + 5)
  doc.text("Qty", 110, yPos + 5)
  doc.text("Price", 135, yPos + 5)
  doc.text("Total", 165, yPos + 5)

  // Items
  yPos += 12
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(9)

  data.items.forEach((item) => {
    if (yPos > 260) {
      doc.addPage()
      yPos = 20
    }

    const itemName = item.configuration ? `${item.name} (${item.configuration})` : item.name

    const nameLines = doc.splitTextToSize(itemName, 80)
    doc.text(nameLines, 25, yPos)
    doc.text(item.quantity.toString(), 110, yPos)
    doc.text(`₹${item.unitPrice.toFixed(2)}`, 135, yPos)
    doc.text(`₹${item.total.toFixed(2)}`, 165, yPos)

    yPos += nameLines.length * 5 + 3
  })

  // Add-ons
  if (data.addons.length > 0) {
    yPos += 5
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text("Add-ons:", 25, yPos)
    yPos += 6

    doc.setFontSize(9)
    doc.setTextColor(60, 60, 60)

    data.addons.forEach((addon) => {
      doc.text(addon.name, 30, yPos)
      doc.text(`₹${addon.price.toFixed(2)}`, 165, yPos)
      yPos += 5
    })
  }

  // Totals Section
  yPos += 10
  doc.setDrawColor(200, 200, 200)
  doc.line(20, yPos, 190, yPos)
  yPos += 8

  const totalsX = 130
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)

  doc.text("Subtotal:", totalsX, yPos)
  doc.text(`₹${data.pricing.subtotal.toFixed(2)}`, 175, yPos, { align: "right" })
  yPos += 6

  if (data.pricing.configurationTotal > 0) {
    doc.text("Configuration:", totalsX, yPos)
    doc.text(`₹${data.pricing.configurationTotal.toFixed(2)}`, 175, yPos, { align: "right" })
    yPos += 6
  }

  if (data.pricing.addonsTotal > 0) {
    doc.text("Add-ons:", totalsX, yPos)
    doc.text(`₹${data.pricing.addonsTotal.toFixed(2)}`, 175, yPos, { align: "right" })
    yPos += 6
  }

  if (data.pricing.deliveryFee > 0) {
    doc.text("Delivery Fee:", totalsX, yPos)
    doc.text(`₹${data.pricing.deliveryFee.toFixed(2)}`, 175, yPos, { align: "right" })
    yPos += 6
  }

  if (data.pricing.discount > 0) {
    doc.setTextColor(220, 38, 38) // Red for discount
    doc.text("Discount:", totalsX, yPos)
    doc.text(`-₹${data.pricing.discount.toFixed(2)}`, 175, yPos, { align: "right" })
    doc.setTextColor(60, 60, 60)
    yPos += 6
  }

  doc.text("Tax (5% GST):", totalsX, yPos)
  doc.text(`₹${data.pricing.tax.toFixed(2)}`, 175, yPos, { align: "right" })
  yPos += 8

  // Total
  doc.setFillColor(6, 182, 212)
  doc.rect(125, yPos - 3, 65, 10, "F")

  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text("TOTAL:", totalsX, yPos + 4)
  doc.text(`₹${data.pricing.total.toFixed(2)}`, 175, yPos + 4, { align: "right" })

  // Payment & Delivery Info
  yPos += 20
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  doc.text(`Payment Method: ${data.paymentMethod.toUpperCase()}`, 20, yPos)
  doc.text(`Delivery Type: ${data.deliveryType}`, 20, yPos + 6)
  doc.text(`Loyalty Points Earned: ${data.loyaltyPointsEarned}`, 20, yPos + 12)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("Thank you for choosing DHOPA!", 105, 280, { align: "center" })
  doc.text("www.dhopa.com | support@dhopa.com | +91 1234567890", 105, 285, { align: "center" })

  return doc
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}

export function getPDFBlob(doc: jsPDF): Blob {
  return doc.output("blob")
}

export function getPDFDataURL(doc: jsPDF): string {
  return doc.output("dataurlstring")
}
