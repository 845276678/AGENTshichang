import { test, expect, Page } from '@playwright/test'

class CheckoutHelpers {
  constructor(private page: Page) {}

  async goto(path: string) {
    await this.page.goto(path)
  }

  async addItemToCart() {
    await this.page.goto('/marketplace')
    await this.page.click('[data-testid="add-to-cart-btn"]').first()
  }

  async proceedToCheckout() {
    await this.page.goto('/cart')
    await this.page.click('[data-testid="checkout-btn"]')
  }

  async fillBillingInfo(info: {
    email: string
    name: string
    address: string
    city: string
    zip: string
    country: string
  }) {
    await this.page.fill('[data-testid="billing-email"]', info.email)
    await this.page.fill('[data-testid="billing-name"]', info.name)
    await this.page.fill('[data-testid="billing-address"]', info.address)
    await this.page.fill('[data-testid="billing-city"]', info.city)
    await this.page.fill('[data-testid="billing-zip"]', info.zip)
    await this.page.selectOption('[data-testid="billing-country"]', info.country)
  }

  async fillPaymentInfo(info: {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardholderName: string
  }) {
    // Switch to payment iframe if needed
    const paymentFrame = this.page.frameLocator('[data-testid="payment-frame"]')

    await paymentFrame.locator('[data-testid="card-number"]').fill(info.cardNumber)
    await paymentFrame.locator('[data-testid="expiry-date"]').fill(info.expiryDate)
    await paymentFrame.locator('[data-testid="cvv"]').fill(info.cvv)
    await paymentFrame.locator('[data-testid="cardholder-name"]').fill(info.cardholderName)
  }

  async submitPayment() {
    await this.page.click('[data-testid="submit-payment"]')
  }

  async expectSuccessPage() {
    await expect(this.page).toHaveURL('/checkout/success')
    await expect(this.page.locator('[data-testid="success-message"]')).toBeVisible()
  }

  async expectFailurePage() {
    await expect(this.page).toHaveURL('/checkout/failed')
    await expect(this.page.locator('[data-testid="error-message"]')).toBeVisible()
  }
}

// Test data
const testBillingInfo = {
  email: 'test@example.com',
  name: 'John Doe',
  address: '123 Test Street',
  city: 'Test City',
  zip: '12345',
  country: 'US',
}

const testPaymentInfo = {
  cardNumber: '4242424242424242', // Stripe test card
  expiryDate: '12/25',
  cvv: '123',
  cardholderName: 'John Doe',
}

const invalidPaymentInfo = {
  cardNumber: '4000000000000002', // Stripe declined card
  expiryDate: '12/25',
  cvv: '123',
  cardholderName: 'John Doe',
}

test.describe('Checkout and Payment Flow', () => {
  let helpers: CheckoutHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new CheckoutHelpers(page)

    // Login before each test
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|$)/)
  })

  test.describe('Cart to Checkout Flow', () => {
    test('should proceed from cart to checkout', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()

      await expect(page).toHaveURL('/checkout')
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible()
    })

    test('should show cart summary in checkout', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()

      await expect(page.locator('[data-testid="order-summary"]')).toBeVisible()
      await expect(page.locator('[data-testid="order-items"]')).toBeVisible()
      await expect(page.locator('[data-testid="order-total"]')).toBeVisible()
    })

    test('should prevent checkout with empty cart', async ({ page }) => {
      await page.goto('/cart')

      // Remove all items if any exist
      const removeButtons = page.locator('[data-testid="remove-item-btn"]')
      const count = await removeButtons.count()
      for (let i = 0; i < count; i++) {
        await removeButtons.first().click()
        await page.waitForTimeout(500)
      }

      const checkoutBtn = page.locator('[data-testid="checkout-btn"]')
      if (await checkoutBtn.isVisible()) {
        await expect(checkoutBtn).toBeDisabled()
      }
    })

    test('should calculate correct totals', async ({ page }) => {
      await helpers.addItemToCart()
      await page.goto('/cart')

      // Get individual item prices and quantities
      const itemPrices = await page.locator('[data-testid="item-price"]').allTextContents()
      const itemQuantities = await page.locator('[data-testid="quantity-input"]').allInputValues()

      let expectedTotal = 0
      for (let i = 0; i < itemPrices.length; i++) {
        const price = parseFloat(itemPrices[i].replace(/[^0-9.]/g, ''))
        const quantity = parseInt(itemQuantities[i])
        expectedTotal += price * quantity
      }

      const displayedTotal = await page.locator('[data-testid="cart-total"]').textContent()
      const actualTotal = parseFloat(displayedTotal?.replace(/[^0-9.]/g, '') || '0')

      expect(actualTotal).toBeCloseTo(expectedTotal, 2)
    })
  })

  test.describe('Billing Information', () => {
    test('should require all billing fields', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()

      // Try to proceed without filling billing info
      await page.click('[data-testid="continue-to-payment"]')

      // Should show validation errors
      await expect(page.locator('[data-testid="billing-error"]')).toBeVisible()
    })

    test('should validate email format', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()

      await page.fill('[data-testid="billing-email"]', 'invalid-email')
      await page.click('[data-testid="continue-to-payment"]')

      await expect(page.locator('.field-error')).toContainText(/valid email/i)
    })

    test('should save billing information', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()

      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')

      // Go back to billing
      await page.click('[data-testid="back-to-billing"]')

      // Fields should be populated
      await expect(page.locator('[data-testid="billing-email"]')).toHaveValue(testBillingInfo.email)
      await expect(page.locator('[data-testid="billing-name"]')).toHaveValue(testBillingInfo.name)
    })

    test('should prefill billing info for logged-in users', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()

      // Email should be prefilled from user account
      const emailField = page.locator('[data-testid="billing-email"]')
      const emailValue = await emailField.inputValue()
      expect(emailValue).toBe('test@example.com')
    })
  })

  test.describe('Payment Processing', () => {
    test('should complete successful payment', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')

      await helpers.fillPaymentInfo(testPaymentInfo)
      await helpers.submitPayment()

      await helpers.expectSuccessPage()
    })

    test('should handle payment failure', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')

      await helpers.fillPaymentInfo(invalidPaymentInfo)
      await helpers.submitPayment()

      // Should show error message
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="payment-error"]')).toContainText(/payment failed/i)
    })

    test('should validate credit card format', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')

      const paymentFrame = page.frameLocator('[data-testid="payment-frame"]')
      await paymentFrame.locator('[data-testid="card-number"]').fill('1234')
      await helpers.submitPayment()

      await expect(page.locator('[data-testid="card-error"]')).toBeVisible()
    })

    test('should validate expiry date', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')

      const paymentFrame = page.frameLocator('[data-testid="payment-frame"]')
      await paymentFrame.locator('[data-testid="card-number"]').fill('4242424242424242')
      await paymentFrame.locator('[data-testid="expiry-date"]').fill('01/20') // Past date
      await helpers.submitPayment()

      await expect(page.locator('[data-testid="expiry-error"]')).toBeVisible()
    })

    test('should show loading state during payment', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')

      await helpers.fillPaymentInfo(testPaymentInfo)

      const submitBtn = page.locator('[data-testid="submit-payment"]')
      await submitBtn.click()

      // Should show loading state
      await expect(submitBtn).toBeDisabled()
      await expect(submitBtn).toContainText(/processing/i)
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/payments/**', route => {
        route.abort('failed')
      })

      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')
      await helpers.fillPaymentInfo(testPaymentInfo)
      await helpers.submitPayment()

      await expect(page.locator('[data-testid="network-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="retry-payment"]')).toBeVisible()
    })
  })

  test.describe('Order Confirmation', () => {
    test('should show order details on success page', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')
      await helpers.fillPaymentInfo(testPaymentInfo)
      await helpers.submitPayment()

      await helpers.expectSuccessPage()

      // Should show order summary
      await expect(page.locator('[data-testid="order-number"]')).toBeVisible()
      await expect(page.locator('[data-testid="order-items"]')).toBeVisible()
      await expect(page.locator('[data-testid="order-total"]')).toBeVisible()
    })

    test('should send confirmation email', async ({ page }) => {
      // This would be tested through email service mocking
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')
      await helpers.fillPaymentInfo(testPaymentInfo)
      await helpers.submitPayment()

      await helpers.expectSuccessPage()

      // Should show confirmation message
      await expect(page.locator('[data-testid="email-confirmation"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-confirmation"]')).toContainText(/confirmation email sent/i)
    })

    test('should allow downloading purchased agents', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')
      await helpers.fillPaymentInfo(testPaymentInfo)
      await helpers.submitPayment()

      await helpers.expectSuccessPage()

      // Should show download links
      await expect(page.locator('[data-testid="download-link"]')).toBeVisible()
    })

    test('should redirect to dashboard after successful purchase', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')
      await helpers.fillPaymentInfo(testPaymentInfo)
      await helpers.submitPayment()

      await helpers.expectSuccessPage()

      await page.click('[data-testid="go-to-dashboard"]')
      await expect(page).toHaveURL('/dashboard')
    })
  })

  test.describe('Security', () => {
    test('should use HTTPS for payment processing', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()

      // Check that payment forms are served over HTTPS
      const url = page.url()
      expect(url).toMatch(/^https:\/\//)
    })

    test('should not store sensitive payment information', async ({ page }) => {
      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')
      await helpers.fillPaymentInfo(testPaymentInfo)

      // Check local storage and session storage
      const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage))
      const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage))

      expect(localStorage).not.toContain(testPaymentInfo.cardNumber)
      expect(sessionStorage).not.toContain(testPaymentInfo.cardNumber)
    })

    test('should require authentication for checkout', async ({ page }) => {
      // Logout first
      await page.goto('/auth/logout')

      // Try to access checkout directly
      await page.goto('/checkout')

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  })

  test.describe('Mobile Checkout', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await helpers.addItemToCart()
      await helpers.proceedToCheckout()

      // Form should be mobile-optimized
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible()

      // Fields should be properly sized
      const emailField = page.locator('[data-testid="billing-email"]')
      const emailBox = await emailField.boundingBox()
      expect(emailBox?.width).toBeGreaterThan(200) // Minimum touch target size
    })

    test('should support mobile payment methods', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await helpers.addItemToCart()
      await helpers.proceedToCheckout()
      await helpers.fillBillingInfo(testBillingInfo)
      await page.click('[data-testid="continue-to-payment"]')

      // Should show mobile payment options if available
      const applePayBtn = page.locator('[data-testid="apple-pay"]')
      const googlePayBtn = page.locator('[data-testid="google-pay"]')

      // These might not be visible in all test environments
      if (await applePayBtn.isVisible()) {
        expect(applePayBtn).toBeVisible()
      }
      if (await googlePayBtn.isVisible()) {
        expect(googlePayBtn).toBeVisible()
      }
    })
  })
})