import { test, expect } from "@playwright/test"

test.describe("Order Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should complete full order placement flow", async ({ page }) => {
    // Navigate to login
    await page.click("text=Login")
    await expect(page).toHaveURL(/\/auth\/login/)

    // Login with demo credentials
    await page.fill('input[type="email"]', "test@example.com")
    await page.fill('input[type="password"]', "password123")
    await page.click('button[type="submit"]')

    // Should redirect to order page or home
    await page.waitForURL(/\/(customer\/order|$)/)

    // Navigate to order page if not already there
    if (!page.url().includes("/order")) {
      await page.goto("/customer/order")
    }

    // Wait for catalog to load
    await page.waitForSelector('[data-testid="service-item"]', { timeout: 10000 })

    // Add items to cart
    const firstItem = page.locator('[data-testid="service-item"]').first()
    await firstItem.locator('button[aria-label="Increase quantity"]').click()

    // Verify cart has items
    await expect(page.locator('[data-testid="cart-count"]')).toContainText("1")

    // Proceed to checkout
    await page.click("text=Checkout")
    await expect(page).toHaveURL(/\/customer\/checkout/)

    // Fill delivery details
    await page.selectOption('select[name="delivery-type"]', "pickup")
    await page.fill('input[name="pickup-date"]', "2024-12-31")
    await page.fill('input[name="pickup-time"]', "10:00")

    // Select payment method
    await page.click("text=Cash")

    // Place order
    await page.click('button:has-text("Place Order")')

    // Should redirect to success page
    await expect(page).toHaveURL(/\/customer\/checkout\/success/, { timeout: 15000 })

    // Verify success message
    await expect(page.locator("text=Order Confirmed")).toBeVisible()

    // Verify order details are displayed
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
  })

  test("should show price sync indicator", async ({ page }) => {
    await page.goto("/customer/order")

    // Look for price sync badge
    const priceBadge = page.locator("text=/Prices synced/i")
    await expect(priceBadge).toBeVisible({ timeout: 10000 })
  })

  test("should handle offline mode", async ({ page, context }) => {
    await page.goto("/customer/order")

    // Simulate offline
    await context.setOffline(true)

    // Should show offline indicator
    await expect(page.locator("text=/Offline Mode/i")).toBeVisible({ timeout: 5000 })

    // Go back online
    await context.setOffline(false)

    // Should show back online message
    await expect(page.locator("text=/Back Online/i")).toBeVisible({ timeout: 5000 })
  })
})
