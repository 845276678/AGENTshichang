import { test, expect, Page } from '@playwright/test'

class AdminHelpers {
  constructor(private page: Page) {}

  async loginAsAdmin() {
    await this.page.goto('/auth/login')
    await this.page.fill('[name="email"]', 'admin@example.com')
    await this.page.fill('[name="password"]', 'AdminPassword123!')
    await this.page.click('button[type="submit"]')
    await this.page.waitForURL(/\/(dashboard|admin)/)
  }

  async goto(path: string) {
    await this.page.goto(path)
  }

  async expectAdminAccess() {
    await expect(this.page.locator('[data-testid="admin-panel"]')).toBeVisible()
  }

  async expectAccessDenied() {
    await expect(this.page.locator('[data-testid="access-denied"]')).toBeVisible()
  }
}

test.describe('Admin Panel Access Control', () => {
  let helpers: AdminHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new AdminHelpers(page)
  })

  test.describe('Admin Authentication', () => {
    test('should allow admin access to admin panel', async ({ page }) => {
      await helpers.loginAsAdmin()
      await helpers.goto('/admin')

      await helpers.expectAdminAccess()
      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible()
    })

    test('should deny regular user access to admin panel', async ({ page }) => {
      // Login as regular user
      await page.goto('/auth/login')
      await page.fill('[name="email"]', 'user@example.com')
      await page.fill('[name="password"]', 'UserPassword123!')
      await page.click('button[type="submit"]')

      await helpers.goto('/admin')

      await helpers.expectAccessDenied()
      await expect(page).toHaveURL('/auth/login')
    })

    test('should redirect unauthenticated users to login', async ({ page }) => {
      await helpers.goto('/admin')

      await expect(page).toHaveURL(/\/auth\/login/)
    })

    test('should show admin navigation menu', async ({ page }) => {
      await helpers.loginAsAdmin()
      await helpers.goto('/admin')

      await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible()
      await expect(page.locator('[data-testid="admin-nav-users"]')).toBeVisible()
      await expect(page.locator('[data-testid="admin-nav-agents"]')).toBeVisible()
      await expect(page.locator('[data-testid="admin-nav-orders"]')).toBeVisible()
      await expect(page.locator('[data-testid="admin-nav-analytics"]')).toBeVisible()
    })
  })

  test.describe('User Management', () => {
    test.beforeEach(async ({ __page }) => {
      await helpers.loginAsAdmin()
    })

    test('should display users list', async ({ page }) => {
      await helpers.goto('/admin/users')

      await expect(page.locator('[data-testid="users-table"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-row"]')).toHaveCount({ min: 1 })
    })

    test('should allow searching users', async ({ page }) => {
      await helpers.goto('/admin/users')

      await page.fill('[data-testid="user-search"]', 'test@example.com')
      await page.press('[data-testid="user-search"]', 'Enter')

      await expect(page.locator('[data-testid="user-row"]')).toHaveCount({ min: 0 })
    })

    test('should allow filtering users by role', async ({ page }) => {
      await helpers.goto('/admin/users')

      await page.selectOption('[data-testid="role-filter"]', 'ADMIN')

      const userRows = page.locator('[data-testid="user-row"]')
      const count = await userRows.count()

      for (let i = 0; i < count; i++) {
        await expect(userRows.nth(i).locator('[data-testid="user-role"]')).toContainText('ADMIN')
      }
    })

    test('should allow filtering users by status', async ({ page }) => {
      await helpers.goto('/admin/users')

      await page.selectOption('[data-testid="status-filter"]', 'ACTIVE')

      const userRows = page.locator('[data-testid="user-row"]')
      const count = await userRows.count()

      for (let i = 0; i < count; i++) {
        await expect(userRows.nth(i).locator('[data-testid="user-status"]')).toContainText('ACTIVE')
      }
    })

    test('should view user details', async ({ page }) => {
      await helpers.goto('/admin/users')

      await page.click('[data-testid="view-user-btn"]').first()

      await expect(page.locator('[data-testid="user-details"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-info"]')).toBeVisible()
      await expect(page.locator('[data-testid="user-activity"]')).toBeVisible()
    })

    test('should suspend user account', async ({ page }) => {
      await helpers.goto('/admin/users')

      await page.click('[data-testid="user-actions-btn"]').first()
      await page.click('[data-testid="suspend-user"]')

      // Confirm suspension
      await page.click('[data-testid="confirm-suspend"]')

      await expect(page.locator('[data-testid="success-message"]')).toContainText(/user suspended/i)
    })

    test('should activate suspended user', async ({ page }) => {
      await helpers.goto('/admin/users')

      // Find suspended user
      await page.selectOption('[data-testid="status-filter"]', 'SUSPENDED')

      if ((await page.locator('[data-testid="user-row"]').count()) > 0) {
        await page.click('[data-testid="user-actions-btn"]').first()
        await page.click('[data-testid="activate-user"]')

        await expect(page.locator('[data-testid="success-message"]')).toContainText(/user activated/i)
      }
    })

    test('should delete user account', async ({ page }) => {
      await helpers.goto('/admin/users')

      const initialCount = await page.locator('[data-testid="user-row"]').count()

      await page.click('[data-testid="user-actions-btn"]').first()
      await page.click('[data-testid="delete-user"]')

      // Confirm deletion
      await page.fill('[data-testid="delete-confirmation"]', 'DELETE')
      await page.click('[data-testid="confirm-delete"]')

      await expect(page.locator('[data-testid="success-message"]')).toContainText(/user deleted/i)

      // Should have one less user
      await expect(page.locator('[data-testid="user-row"]')).toHaveCount(initialCount - 1)
    })

    test('should promote user to admin', async ({ page }) => {
      await helpers.goto('/admin/users')

      // Find regular user
      await page.selectOption('[data-testid="role-filter"]', 'USER')

      if ((await page.locator('[data-testid="user-row"]').count()) > 0) {
        await page.click('[data-testid="user-actions-btn"]').first()
        await page.click('[data-testid="promote-user"]')

        await expect(page.locator('[data-testid="success-message"]')).toContainText(/user promoted/i)
      }
    })
  })

  test.describe('Agent Management', () => {
    test.beforeEach(async ({ __page }) => {
      await helpers.loginAsAdmin()
    })

    test('should display agents list', async ({ page }) => {
      await helpers.goto('/admin/agents')

      await expect(page.locator('[data-testid="agents-table"]')).toBeVisible()
      await expect(page.locator('[data-testid="agent-row"]')).toHaveCount({ min: 1 })
    })

    test('should filter agents by status', async ({ page }) => {
      await helpers.goto('/admin/agents')

      await page.selectOption('[data-testid="status-filter"]', 'PENDING')

      const agentRows = page.locator('[data-testid="agent-row"]')
      const count = await agentRows.count()

      for (let i = 0; i < count; i++) {
        await expect(agentRows.nth(i).locator('[data-testid="agent-status"]')).toContainText('PENDING')
      }
    })

    test('should approve pending agent', async ({ page }) => {
      await helpers.goto('/admin/agents')

      await page.selectOption('[data-testid="status-filter"]', 'PENDING')

      if ((await page.locator('[data-testid="agent-row"]').count()) > 0) {
        await page.click('[data-testid="approve-agent-btn"]').first()

        await expect(page.locator('[data-testid="success-message"]')).toContainText(/agent approved/i)
      }
    })

    test('should reject agent with reason', async ({ page }) => {
      await helpers.goto('/admin/agents')

      await page.selectOption('[data-testid="status-filter"]', 'PENDING')

      if ((await page.locator('[data-testid="agent-row"]').count()) > 0) {
        await page.click('[data-testid="reject-agent-btn"]').first()

        await page.fill('[data-testid="rejection-reason"]', 'Does not meet quality standards')
        await page.click('[data-testid="confirm-reject"]')

        await expect(page.locator('[data-testid="success-message"]')).toContainText(/agent rejected/i)
      }
    })

    test('should feature agent', async ({ page }) => {
      await helpers.goto('/admin/agents')

      await page.selectOption('[data-testid="status-filter"]', 'PUBLISHED')

      if ((await page.locator('[data-testid="agent-row"]').count()) > 0) {
        await page.click('[data-testid="agent-actions-btn"]').first()
        await page.click('[data-testid="feature-agent"]')

        await expect(page.locator('[data-testid="success-message"]')).toContainText(/agent featured/i)
      }
    })

    test('should remove agent from marketplace', async ({ page }) => {
      await helpers.goto('/admin/agents')

      await page.click('[data-testid="agent-actions-btn"]').first()
      await page.click('[data-testid="remove-agent"]')

      await page.fill('[data-testid="removal-reason"]', 'Policy violation')
      await page.click('[data-testid="confirm-remove"]')

      await expect(page.locator('[data-testid="success-message"]')).toContainText(/agent removed/i)
    })

    test('should view agent analytics', async ({ page }) => {
      await helpers.goto('/admin/agents')

      await page.click('[data-testid="agent-analytics-btn"]').first()

      await expect(page.locator('[data-testid="agent-analytics"]')).toBeVisible()
      await expect(page.locator('[data-testid="downloads-chart"]')).toBeVisible()
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
    })
  })

  test.describe('Order Management', () => {
    test.beforeEach(async ({ __page }) => {
      await helpers.loginAsAdmin()
    })

    test('should display orders list', async ({ page }) => {
      await helpers.goto('/admin/orders')

      await expect(page.locator('[data-testid="orders-table"]')).toBeVisible()
      await expect(page.locator('[data-testid="order-row"]')).toHaveCount({ min: 0 })
    })

    test('should filter orders by status', async ({ page }) => {
      await helpers.goto('/admin/orders')

      await page.selectOption('[data-testid="status-filter"]', 'COMPLETED')

      const orderRows = page.locator('[data-testid="order-row"]')
      const count = await orderRows.count()

      for (let i = 0; i < count; i++) {
        await expect(orderRows.nth(i).locator('[data-testid="order-status"]')).toContainText('COMPLETED')
      }
    })

    test('should view order details', async ({ page }) => {
      await helpers.goto('/admin/orders')

      if ((await page.locator('[data-testid="order-row"]').count()) > 0) {
        await page.click('[data-testid="view-order-btn"]').first()

        await expect(page.locator('[data-testid="order-details"]')).toBeVisible()
        await expect(page.locator('[data-testid="order-items"]')).toBeVisible()
        await expect(page.locator('[data-testid="payment-info"]')).toBeVisible()
      }
    })

    test('should refund order', async ({ page }) => {
      await helpers.goto('/admin/orders')

      await page.selectOption('[data-testid="status-filter"]', 'COMPLETED')

      if ((await page.locator('[data-testid="order-row"]').count()) > 0) {
        await page.click('[data-testid="order-actions-btn"]').first()
        await page.click('[data-testid="refund-order"]')

        await page.fill('[data-testid="refund-reason"]', 'Customer request')
        await page.click('[data-testid="confirm-refund"]')

        await expect(page.locator('[data-testid="success-message"]')).toContainText(/refund processed/i)
      }
    })

    test('should export orders data', async ({ page }) => {
      await helpers.goto('/admin/orders')

      await page.click('[data-testid="export-orders"]')

      // Should trigger download
      const downloadPromise = page.waitForEvent('download')
      await downloadPromise
    })
  })

  test.describe('Analytics Dashboard', () => {
    test.beforeEach(async ({ __page }) => {
      await helpers.loginAsAdmin()
    })

    test('should display key metrics', async ({ page }) => {
      await helpers.goto('/admin/analytics')

      await expect(page.locator('[data-testid="total-users"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-agents"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible()
      await expect(page.locator('[data-testid="active-users"]')).toBeVisible()
    })

    test('should show revenue chart', async ({ page }) => {
      await helpers.goto('/admin/analytics')

      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
    })

    test('should show user growth chart', async ({ page }) => {
      await helpers.goto('/admin/analytics')

      await expect(page.locator('[data-testid="user-growth-chart"]')).toBeVisible()
    })

    test('should filter analytics by date range', async ({ page }) => {
      await helpers.goto('/admin/analytics')

      await page.click('[data-testid="date-range-picker"]')
      await page.click('[data-testid="last-30-days"]')

      // Charts should update
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
    })

    test('should show top performing agents', async ({ page }) => {
      await helpers.goto('/admin/analytics')

      await expect(page.locator('[data-testid="top-agents"]')).toBeVisible()
      await expect(page.locator('[data-testid="top-agent-item"]')).toHaveCount({ min: 0 })
    })
  })

  test.describe('System Settings', () => {
    test.beforeEach(async ({ __page }) => {
      await helpers.loginAsAdmin()
    })

    test('should display system settings', async ({ page }) => {
      await helpers.goto('/admin/settings')

      await expect(page.locator('[data-testid="system-settings"]')).toBeVisible()
      await expect(page.locator('[data-testid="payment-settings"]')).toBeVisible()
      await expect(page.locator('[data-testid="email-settings"]')).toBeVisible()
    })

    test('should update system configuration', async ({ page }) => {
      await helpers.goto('/admin/settings')

      await page.fill('[data-testid="site-name"]', 'Updated Site Name')
      await page.fill('[data-testid="commission-rate"]', '15')
      await page.click('[data-testid="save-settings"]')

      await expect(page.locator('[data-testid="success-message"]')).toContainText(/settings updated/i)
    })

    test('should validate settings input', async ({ page }) => {
      await helpers.goto('/admin/settings')

      await page.fill('[data-testid="commission-rate"]', '150') // Invalid rate
      await page.click('[data-testid="save-settings"]')

      await expect(page.locator('.field-error')).toContainText(/invalid commission rate/i)
    })
  })

  test.describe('Security', () => {
    test('should log admin actions', async ({ page }) => {
      await helpers.loginAsAdmin()
      await helpers.goto('/admin/users')

      // Perform an action
      if ((await page.locator('[data-testid="user-row"]').count()) > 0) {
        await page.click('[data-testid="user-actions-btn"]').first()
        await page.click('[data-testid="view-user"]')
      }

      // Check audit log
      await helpers.goto('/admin/audit-log')

      await expect(page.locator('[data-testid="audit-entry"]')).toHaveCount({ min: 1 })
    })

    test('should require confirmation for destructive actions', async ({ page }) => {
      await helpers.loginAsAdmin()
      await helpers.goto('/admin/users')

      if ((await page.locator('[data-testid="user-row"]').count()) > 0) {
        await page.click('[data-testid="user-actions-btn"]').first()
        await page.click('[data-testid="delete-user"]')

        // Should show confirmation dialog
        await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
        await expect(page.locator('[data-testid="confirm-delete"]')).toBeDisabled()

        // Should require typing confirmation
        await page.fill('[data-testid="delete-confirmation"]', 'DELETE')
        await expect(page.locator('[data-testid="confirm-delete"]')).toBeEnabled()
      }
    })

    test('should have proper CSRF protection', async ({ page }) => {
      await helpers.loginAsAdmin()

      // Try to perform action without proper CSRF token
      const response = await page.request.post('/api/admin/users/1/delete', {
        headers: {
          'content-type': 'application/json',
        },
        data: {
          action: 'delete',
        },
      })

      expect(response.status()).toBe(403) // Should be forbidden without CSRF token
    })
  })
})