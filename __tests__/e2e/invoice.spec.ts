import { test, expect } from "@playwright/test"

test.describe("Invoice Generation", () => {
  test("should generate and download invoice", async ({ page }) => {
    // Login and create an order first
    await page.goto("/login")
    await page.fill("#identifier", "test@example.com")
    await page.fill("#password", "password123")
    await page.click('button:has-text("Login")')

    // Go to order history
    await page.goto("/customer/history")
    await page.waitForSelector('[data-testid="order-card"]', { timeout: 10000 })

    // Click on first order
    const firstOrder = page.locator('[data-testid="order-card"]').first()
    await firstOrder.click()

    // Wait for order details
    await expect(page.locator('[data-testid="invoice-preview"]')).toBeVisible()

    // Start download
    const downloadPromise = page.waitForEvent("download")
    await page.click('button:has-text("Download Invoice")')

    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/Invoice-.*\.pdf/)
  })
})
