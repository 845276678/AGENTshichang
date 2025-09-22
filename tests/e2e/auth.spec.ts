import { test, expect, Page } from '@playwright/test'

// Test data
const testUser = {
  email: 'test-user@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
}

const adminUser = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
  name: 'Admin User',
}

class AuthHelpers {
  constructor(private page: Page) {}

  async goto(path: string) {
    await this.page.goto(path)
  }

  async login(email: string, password: string) {
    await this.page.goto('/auth/login')
    await this.page.fill('[name="email"]', email)
    await this.page.fill('[name="password"]', password)
    await this.page.click('button[type="submit"]')
  }

  async register(userData: {
    email: string
    password: string
    confirmPassword?: string
    name: string
  }) {
    await this.page.goto('/auth/register')
    await this.page.fill('[name="email"]', userData.email)
    await this.page.fill('[name="password"]', userData.password)
    await this.page.fill('[name="confirmPassword"]', userData.confirmPassword || userData.password)
    await this.page.fill('[name="name"]', userData.name)
    await this.page.click('button[type="submit"]')
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="logout-button"]')
  }

  async expectLoggedIn() {
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible()
  }

  async expectLoggedOut() {
    await expect(this.page.locator('[data-testid="login-button"]')).toBeVisible()
  }
}

test.describe('Authentication Flow', () => {
  let authHelpers: AuthHelpers

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page)
  })

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await authHelpers.login(testUser.email, testUser.password)

      // Should redirect to dashboard or home page
      await expect(page).toHaveURL(/\/(dashboard|$)/)
      await authHelpers.expectLoggedIn()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await authHelpers.login('invalid@example.com', 'wrongpassword')

      await expect(page.locator('.error-message')).toContainText(/invalid credentials/i)
      await expect(page).toHaveURL('/auth/login')
    })

    test('should validate email format', async ({ page }) => {
      await authHelpers.goto('/auth/login')
      await page.fill('[name="email"]', 'invalid-email')
      await page.fill('[name="password"]', 'password123')
      await page.click('button[type="submit"]')

      await expect(page.locator('.field-error')).toContainText(/valid email/i)
    })

    test('should validate password length', async ({ page }) => {
      await authHelpers.goto('/auth/login')
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', '123')
      await page.click('button[type="submit"]')

      await expect(page.locator('.field-error')).toContainText(/at least 6 characters/i)
    })

    test('should show loading state during login', async ({ page }) => {
      await authHelpers.goto('/auth/login')
      await page.fill('[name="email"]', testUser.email)
      await page.fill('[name="password"]', testUser.password)

      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      await expect(submitButton).toBeDisabled()
      await expect(submitButton).toContainText(/logging in/i)
    })

    test('should remember login with remember me checkbox', async ({ page }) => {
      await authHelpers.goto('/auth/login')
      await page.fill('[name="email"]', testUser.email)
      await page.fill('[name="password"]', testUser.password)
      await page.check('[name="rememberMe"]')
      await page.click('button[type="submit"]')

      await authHelpers.expectLoggedIn()

      // Refresh page and should still be logged in
      await page.reload()
      await authHelpers.expectLoggedIn()
    })
  })

  test.describe('Registration', () => {
    test('should register new user with valid data', async ({ page }) => {
      const newUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'NewPassword123!',
        name: 'New User',
      }

      await authHelpers.register(newUser)

      // Should show success message or redirect to verification page
      await expect(page.locator('.success-message')).toBeVisible()
      await expect(page.locator('.success-message')).toContainText(/registration successful/i)
    })

    test('should validate password confirmation match', async ({ page }) => {
      await authHelpers.goto('/auth/register')
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'password123')
      await page.fill('[name="confirmPassword"]', 'differentpassword')
      await page.fill('[name="name"]', 'Test User')
      await page.click('button[type="submit"]')

      await expect(page.locator('.field-error')).toContainText(/passwords must match/i)
    })

    test('should show error for existing email', async ({ page }) => {
      await authHelpers.register({
        email: testUser.email, // Already exists
        password: 'NewPassword123!',
        name: 'Test User',
      })

      await expect(page.locator('.error-message')).toContainText(/email already exists/i)
    })

    test('should validate email format in registration', async ({ page }) => {
      await authHelpers.goto('/auth/register')
      await page.fill('[name="email"]', 'invalid-email-format')
      await page.fill('[name="password"]', 'password123')
      await page.fill('[name="confirmPassword"]', 'password123')
      await page.fill('[name="name"]', 'Test User')
      await page.click('button[type="submit"]')

      await expect(page.locator('.field-error')).toContainText(/valid email/i)
    })

    test('should validate password strength', async ({ page }) => {
      await authHelpers.goto('/auth/register')
      await page.fill('[name="email"]', 'test@example.com')
      await page.fill('[name="password"]', 'weak')

      // Should show password strength indicator
      await expect(page.locator('.password-strength')).toBeVisible()
      await expect(page.locator('.password-strength')).toContainText(/weak/i)
    })
  })

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      await authHelpers.login(testUser.email, testUser.password)
      await authHelpers.expectLoggedIn()

      await authHelpers.logout()
      await authHelpers.expectLoggedOut()

      // Should redirect to login page or home
      await expect(page).toHaveURL(/\/(auth\/login|$)/)
    })

    test('should clear session data on logout', async ({ page }) => {
      await authHelpers.login(testUser.email, testUser.password)
      await authHelpers.logout()

      // Try to access protected page
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL('/auth/login')
    })
  })

  test.describe('Password Reset', () => {
    test('should show forgot password form', async ({ page }) => {
      await authHelpers.goto('/auth/login')
      await page.click('text=Forgot Password')

      await expect(page).toHaveURL('/auth/forgot-password')
      await expect(page.locator('[name="email"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toContainText(/send reset link/i)
    })

    test('should send password reset email', async ({ page }) => {
      await page.goto('/auth/forgot-password')
      await page.fill('[name="email"]', testUser.email)
      await page.click('button[type="submit"]')

      await expect(page.locator('.success-message')).toContainText(/reset link sent/i)
    })

    test('should validate email in forgot password', async ({ page }) => {
      await page.goto('/auth/forgot-password')
      await page.fill('[name="email"]', 'invalid-email')
      await page.click('button[type="submit"]')

      await expect(page.locator('.field-error')).toContainText(/valid email/i)
    })
  })

  test.describe('Session Management', () => {
    test('should maintain session across page navigation', async ({ page }) => {
      await authHelpers.login(testUser.email, testUser.password)

      // Navigate to different pages
      await page.goto('/marketplace')
      await authHelpers.expectLoggedIn()

      await page.goto('/dashboard')
      await authHelpers.expectLoggedIn()

      await page.goto('/agents')
      await authHelpers.expectLoggedIn()
    })

    test('should handle expired session gracefully', async ({ page }) => {
      await authHelpers.login(testUser.email, testUser.password)

      // Simulate session expiration by clearing cookies
      await page.context().clearCookies()

      // Try to access protected page
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL('/auth/login')
    })

    test('should redirect to intended page after login', async ({ page }) => {
      // Try to access protected page without login
      await page.goto('/dashboard/profile')

      // Should redirect to login with redirect parameter
      await expect(page).toHaveURL(/\/auth\/login.*redirect/)

      // Login
      await authHelpers.login(testUser.email, testUser.password)

      // Should redirect back to intended page
      await expect(page).toHaveURL('/dashboard/profile')
    })
  })

  test.describe('Social Login', () => {
    test('should show social login buttons', async ({ page }) => {
      await authHelpers.goto('/auth/login')

      await expect(page.locator('[data-testid="google-login"]')).toBeVisible()
      await expect(page.locator('[data-testid="github-login"]')).toBeVisible()
    })

    test('should handle social login click', async ({ page }) => {
      await authHelpers.goto('/auth/login')

      // Mock the popup window for OAuth
      await page.route('**/api/auth/signin/google', route => {
        route.fulfill({ status: 200, body: 'OK' })
      })

      await page.click('[data-testid="google-login"]')

      // Should show loading state
      await expect(page.locator('[data-testid="google-login"]')).toBeDisabled()
    })
  })

  test.describe('Form Accessibility', () => {
    test('should have proper form labels and accessibility', async ({ page }) => {
      await authHelpers.goto('/auth/login')

      // Check for proper labels
      await expect(page.locator('label[for="email"]')).toBeVisible()
      await expect(page.locator('label[for="password"]')).toBeVisible()

      // Check for accessible form controls
      await expect(page.locator('[name="email"]')).toHaveAttribute('aria-label')
      await expect(page.locator('[name="password"]')).toHaveAttribute('aria-label')
    })

    test('should support keyboard navigation', async ({ page }) => {
      await authHelpers.goto('/auth/login')

      // Tab through form elements
      await page.keyboard.press('Tab')
      await expect(page.locator('[name="email"]')).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.locator('[name="password"]')).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.locator('[name="rememberMe"]')).toBeFocused()

      await page.keyboard.press('Tab')
      await expect(page.locator('button[type="submit"]')).toBeFocused()
    })

    test('should announce errors to screen readers', async ({ page }) => {
      await authHelpers.goto('/auth/login')
      await page.click('button[type="submit"]')

      // Error messages should have proper ARIA attributes
      await expect(page.locator('.field-error')).toHaveAttribute('role', 'alert')
      await expect(page.locator('.field-error')).toHaveAttribute('aria-live', 'polite')
    })
  })
})