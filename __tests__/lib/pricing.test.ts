import { describe, it, expect } from "vitest"
import {
  calculateConfigurationCost,
  calculateItemTotal,
  calculateSubtotal,
  calculateAddonsTotal,
  validateAndApplyDiscount,
  calculateTax,
  calculateLoyaltyPoints,
  calculateOrderPricing,
} from "@/lib/pricing"

describe("Pricing Calculations", () => {
  describe("calculateConfigurationCost", () => {
    it("should return 0 for no configuration", () => {
      expect(calculateConfigurationCost()).toBe(0)
      expect(calculateConfigurationCost({})).toBe(0)
    })

    it("should calculate starch cost", () => {
      expect(calculateConfigurationCost({ starch: true })).toBe(10)
    })

    it("should calculate dettol cost", () => {
      expect(calculateConfigurationCost({ dettol: true })).toBe(15)
    })

    it("should calculate express cost", () => {
      expect(calculateConfigurationCost({ express: true })).toBe(50)
    })

    it("should calculate spot remove cost", () => {
      expect(calculateConfigurationCost({ spotRemove: true })).toBe(20)
    })

    it("should calculate combined configuration costs", () => {
      expect(
        calculateConfigurationCost({
          starch: true,
          dettol: true,
          express: true,
          spotRemove: true,
        }),
      ).toBe(95) // 10 + 15 + 50 + 20
    })
  })

  describe("calculateItemTotal", () => {
    it("should calculate item total without configuration", () => {
      const item = {
        id: "1",
        quantity: 2,
        base_price: 50,
      }
      expect(calculateItemTotal(item)).toBe(100)
    })

    it("should calculate item total with configuration", () => {
      const item = {
        id: "1",
        quantity: 2,
        base_price: 50,
        configuration: { starch: true, express: true },
      }
      // (50 + 10 + 50) * 2 = 220
      expect(calculateItemTotal(item)).toBe(220)
    })
  })

  describe("calculateSubtotal", () => {
    it("should calculate subtotal for multiple items", () => {
      const items = [
        { id: "1", quantity: 2, base_price: 50 },
        { id: "2", quantity: 1, base_price: 100, configuration: { starch: true } },
      ]
      // (50 * 2) + ((100 + 10) * 1) = 210
      expect(calculateSubtotal(items)).toBe(210)
    })

    it("should return 0 for empty items", () => {
      expect(calculateSubtotal([])).toBe(0)
    })
  })

  describe("calculateAddonsTotal", () => {
    it("should calculate addons total", () => {
      const addons = [
        { id: "1", price: 50 },
        { id: "2", price: 100 },
      ]
      expect(calculateAddonsTotal(addons)).toBe(150)
    })

    it("should return 0 for empty addons", () => {
      expect(calculateAddonsTotal([])).toBe(0)
    })
  })

  describe("validateAndApplyDiscount", () => {
    it("should return 0 discount for no code", () => {
      const result = validateAndApplyDiscount(undefined, 1000)
      expect(result.discount).toBe(0)
      expect(result.code).toBeNull()
    })

    it("should return 0 discount for invalid code", () => {
      const result = validateAndApplyDiscount("INVALID", 1000)
      expect(result.discount).toBe(0)
      expect(result.code).toBeNull()
    })

    it("should apply FIRST10 discount (10%)", () => {
      const result = validateAndApplyDiscount("FIRST10", 1000)
      expect(result.discount).toBe(100)
      expect(result.code).toBe("FIRST10")
    })

    it("should apply LOYAL20 discount (20%)", () => {
      const result = validateAndApplyDiscount("LOYAL20", 1000)
      expect(result.discount).toBe(200)
      expect(result.code).toBe("LOYAL20")
    })

    it("should apply tier-based discount for Silver", () => {
      const result = validateAndApplyDiscount("FIRST10", 1000, "Silver")
      // 10% base + 5% Silver = 150
      expect(result.discount).toBe(150)
    })

    it("should apply tier-based discount for Gold", () => {
      const result = validateAndApplyDiscount("FIRST10", 1000, "Gold")
      // 10% base + 10% Gold = 200
      expect(result.discount).toBe(200)
    })
  })

  describe("calculateTax", () => {
    it("should calculate 5% GST", () => {
      expect(calculateTax(1000)).toBe(50)
      expect(calculateTax(500)).toBe(25)
    })
  })

  describe("calculateLoyaltyPoints", () => {
    it("should calculate 1 point per rupee", () => {
      expect(calculateLoyaltyPoints(1000)).toBe(1000)
      expect(calculateLoyaltyPoints(1234.56)).toBe(1234)
    })

    it("should floor decimal points", () => {
      expect(calculateLoyaltyPoints(999.99)).toBe(999)
    })
  })

  describe("calculateOrderPricing", () => {
    it("should calculate complete order pricing", () => {
      const items = [{ id: "1", quantity: 2, base_price: 50, configuration: { starch: true } }]
      const addons = [{ id: "a1", price: 100 }]

      const result = calculateOrderPricing(items, addons, "delivery", "FIRST10", "Silver")

      // Subtotal: (50 + 10) * 2 = 120
      // Config: 10 * 2 = 20
      // Addons: 100
      // Delivery: 50
      // Discount: 10% of 120 = 12, + 5% Silver = 6, total = 18
      // Taxable: 120 + 100 + 50 - 18 = 252
      // Tax: 252 * 0.05 = 12.6
      // Total: 252 + 12.6 = 264.6

      expect(result.subtotal).toBe(120)
      expect(result.configuration_total).toBe(20)
      expect(result.addons_total).toBe(100)
      expect(result.delivery_fee).toBe(50)
      expect(result.discount).toBe(18)
      expect(result.tax).toBe(12.6)
      expect(result.total).toBe(264.6)
      expect(result.points_earned).toBe(264)
    })
  })
})
