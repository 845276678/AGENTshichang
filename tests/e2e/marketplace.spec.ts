import { test, expect, Page } from '@playwright/test'

class MarketplaceHelpers {
  constructor(private page: Page) {}

  async goto(path: string) {
    await this.page.goto(path)
  }

  async searchAgents(query: string) {
    await this.page.fill('[data-testid="search-input"]', query)
    await this.page.press('[data-testid="search-input"]', 'Enter')
  }

  async filterByCategory(category: string) {
    await this.page.click(`[data-testid="category-filter-${category}"]`)
  }

  async sortBy(option: string) {
    await this.page.selectOption('[data-testid="sort-select"]', option)
  }

  async addToCart(agentId: string) {
    await this.page.click(`[data-testid="add-to-cart-${agentId}"]`)
  }

  async viewAgentDetails(agentId: string) {
    await this.page.click(`[data-testid="agent-card-${agentId}"]`)
  }

  async expectAgentVisible(agentName: string) {
    await expect(this.page.locator(`text=${agentName}`).first()).toBeVisible()
  }

  async expectAgentNotVisible(agentName: string) {
    await expect(this.page.locator(`text=${agentName}`)).not.toBeVisible()
  }
}

test.describe('Marketplace Flow', () => {
  let helpers: MarketplaceHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new MarketplaceHelpers(page)
  })

  test.describe('Agent Discovery', () => {
    test('should display featured agents on homepage', async ({ page }) => {
      await helpers.goto('/')

      // Check for featured agents section
      await expect(page.locator('[data-testid="featured-agents"]')).toBeVisible()
      await expect(page.locator('[data-testid="agent-card"]').first()).toBeVisible()
    })

    test('should show all agents in marketplace', async ({ page }) => {
      await helpers.goto('/marketplace')

      // Should show agent grid
      await expect(page.locator('[data-testid="agents-grid"]')).toBeVisible()
      await expect(page.locator('[data-testid="agent-card"]')).toHaveCount({ min: 1 })
    })

    test('should display agent details correctly', async ({ page }) => {
      await helpers.goto('/marketplace')

      // Click on first agent
      await page.click('[data-testid="agent-card"]').first()

      // Should show agent details page
      await expect(page.locator('[data-testid="agent-name"]')).toBeVisible()
      await expect(page.locator('[data-testid="agent-description"]')).toBeVisible()
      await expect(page.locator('[data-testid="agent-price"]')).toBeVisible()
      await expect(page.locator('[data-testid="agent-features"]')).toBeVisible()
      await expect(page.locator('[data-testid="agent-requirements"]')).toBeVisible()
    })

    test('should show agent ratings and reviews', async ({ page }) => {
      await helpers.goto('/agents/agent-1')

      await expect(page.locator('[data-testid="agent-rating"]')).toBeVisible()
      await expect(page.locator('[data-testid="reviews-section"]')).toBeVisible()
      await expect(page.locator('[data-testid="review-item"]')).toHaveCount({ min: 0 })
    })
  })

  test.describe('Search and Filter', () => {
    test('should search agents by name', async ({ page }) => {
      await helpers.goto('/marketplace')
      await helpers.searchAgents('AI Assistant')

      // Should show search results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
      await helpers.expectAgentVisible('AI Assistant')
    })

    test('should search agents by description', async ({ page }) => {
      await helpers.goto('/marketplace')
      await helpers.searchAgents('data analysis')

      // Should find agents with matching description
      await expect(page.locator('[data-testid="agent-card"]')).toHaveCount({ min: 1 })
    })

    test('should filter by category', async ({ page }) => {
      await helpers.goto('/marketplace')

      // Filter by AI Assistant category
      await helpers.filterByCategory('ai-assistant')

      // Should show only AI Assistant agents
      await expect(page.locator('[data-testid="category-badge"]')).toContainText('AI Assistant')
    })

    test('should filter by price range', async ({ page }) => {
      await helpers.goto('/marketplace')

      // Set price filter
      await page.fill('[data-testid="min-price"]', '0')
      await page.fill('[data-testid="max-price"]', '50')
      await page.click('[data-testid="apply-price-filter"]')

      // Should show only agents within price range
      const prices = await page.locator('[data-testid="agent-price"]').allTextContents()
      prices.forEach(price => {
        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''))
        expect(numericPrice).toBeLessThanOrEqual(50)
      })
    })

    test('should sort agents by price', async ({ page }) => {
      await helpers.goto('/marketplace')
      await helpers.sortBy('price-low-to-high')

      await page.waitForTimeout(1000) // Wait for sorting

      const prices = await page.locator('[data-testid="agent-price"]').allTextContents()
      const numericPrices = prices.map(p => parseFloat(p.replace(/[^0-9.]/g, '')))

      // Check if prices are sorted low to high
      for (let i = 1; i < numericPrices.length; i++) {
        expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i - 1])
      }
    })

    test('should sort agents by rating', async ({ page }) => {
      await helpers.goto('/marketplace')
      await helpers.sortBy('rating-high-to-low')

      await page.waitForTimeout(1000) // Wait for sorting

      const ratings = await page.locator('[data-testid="agent-rating-value"]').allTextContents()
      const numericRatings = ratings.map(r => parseFloat(r))

      // Check if ratings are sorted high to low
      for (let i = 1; i < numericRatings.length; i++) {
        expect(numericRatings[i]).toBeLessThanOrEqual(numericRatings[i - 1])
      }
    })

    test('should show no results message for invalid search', async ({ page }) => {
      await helpers.goto('/marketplace')
      await helpers.searchAgents('nonexistent-agent-xyz')

      await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
      await expect(page.locator('[data-testid="no-results"]')).toContainText(/no agents found/i)
    })

    test('should clear filters', async ({ page }) => {
      await helpers.goto('/marketplace')

      // Apply filters
      await helpers.searchAgents('AI')
      await helpers.filterByCategory('ai-assistant')

      // Clear filters
      await page.click('[data-testid="clear-filters"]')

      // Should show all agents again
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('')
      await expect(page.locator('[data-testid="agent-card"]')).toHaveCount({ min: 1 })
    })
  })

  test.describe('Agent Categories', () => {
    test('should display category overview', async ({ page }) => {
      await helpers.goto('/categories')

      await expect(page.locator('[data-testid="categories-grid"]')).toBeVisible()
      await expect(page.locator('[data-testid="category-card"]')).toHaveCount({ min: 1 })
    })

    test('should navigate to category page', async ({ page }) => {
      await helpers.goto('/categories')

      await page.click('[data-testid="category-card"]').first()

      // Should navigate to category agents page
      await expect(page).toHaveURL(/\/categories\/[\w-]+/)
      await expect(page.locator('[data-testid="category-title"]')).toBeVisible()
      await expect(page.locator('[data-testid="agent-card"]')).toHaveCount({ min: 0 })
    })

    test('should show category agent count', async ({ page }) => {
      await helpers.goto('/categories')

      const categoryCards = page.locator('[data-testid="category-card"]')
      const firstCard = categoryCards.first()

      await expect(firstCard.locator('[data-testid="agent-count"]')).toBeVisible()
      await expect(firstCard.locator('[data-testid="agent-count"]')).toContainText(/\d+ agents?/)
    })
  })

  test.describe('Shopping Cart', () => {
    test('should add agent to cart', async ({ page }) => {
      await helpers.goto('/marketplace')

      // Add first agent to cart
      await page.click('[data-testid="add-to-cart-btn"]').first()

      // Should show success message
      await expect(page.locator('[data-testid="cart-success"]')).toBeVisible()

      // Cart icon should show item count
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1')
    })

    test('should view cart contents', async ({ page }) => {
      await helpers.goto('/marketplace')

      // Add agent to cart
      await page.click('[data-testid="add-to-cart-btn"]').first()

      // Go to cart
      await page.click('[data-testid="cart-icon"]')

      await expect(page).toHaveURL('/cart')
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
    })

    test('should update cart item quantity', async ({ page }) => {
      await helpers.goto('/cart')

      // Assuming there's an item in cart
      const quantityInput = page.locator('[data-testid="quantity-input"]').first()
      await quantityInput.fill('2')

      // Total should update
      await expect(page.locator('[data-testid="cart-total"]')).toContainText(/\$[\d.]+/)
    })

    test('should remove item from cart', async ({ page }) => {
      await helpers.goto('/cart')

      const initialItems = await page.locator('[data-testid="cart-item"]').count()

      // Remove first item
      await page.click('[data-testid="remove-item-btn"]').first()

      // Should have one less item
      await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(initialItems - 1)
    })

    test('should show empty cart message', async ({ page }) => {
      await helpers.goto('/cart')

      // Remove all items
      const removeButtons = page.locator('[data-testid="remove-item-btn"]')
      const count = await removeButtons.count()

      for (let i = 0; i < count; i++) {
        await removeButtons.first().click()
        await page.waitForTimeout(500)
      }

      await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible()
      await expect(page.locator('[data-testid="empty-cart"]')).toContainText(/cart is empty/i)
    })
  })

  test.describe('Agent Interaction', () => {
    test('should show agent preview', async ({ page }) => {
      await helpers.goto('/agents/agent-1')

      // Click preview button if available
      const previewBtn = page.locator('[data-testid="preview-agent"]')
      if (await previewBtn.isVisible()) {
        await previewBtn.click()
        await expect(page.locator('[data-testid="agent-preview"]')).toBeVisible()
      }
    })

    test('should download agent after purchase', async ({ page }) => {
      // This would require completing a purchase flow first
      await helpers.goto('/dashboard/my-agents')

      const downloadBtn = page.locator('[data-testid="download-agent"]').first()
      if (await downloadBtn.isVisible()) {
        await downloadBtn.click()
        // Verify download initiated
        await expect(page.locator('[data-testid="download-status"]')).toBeVisible()
      }
    })

    test('should submit agent review', async ({ page }) => {
      await helpers.goto('/agents/agent-1')

      // Submit review (assuming user is logged in and has purchased)
      const reviewBtn = page.locator('[data-testid="write-review"]')
      if (await reviewBtn.isVisible()) {
        await reviewBtn.click()

        await page.fill('[data-testid="review-rating"]', '5')
        await page.fill('[data-testid="review-comment"]', 'Great agent!')
        await page.click('[data-testid="submit-review"]')

        await expect(page.locator('[data-testid="review-success"]')).toBeVisible()
      }
    })
  })

  test.describe('Pagination', () => {
    test('should paginate through agents', async ({ page }) => {
      await helpers.goto('/marketplace')

      // Check if pagination exists
      const pagination = page.locator('[data-testid="pagination"]')
      if (await pagination.isVisible()) {
        const nextBtn = page.locator('[data-testid="next-page"]')
        if (await nextBtn.isVisible()) {
          await nextBtn.click()

          // Should load next page
          await expect(page).toHaveURL(/page=2/)
          await expect(page.locator('[data-testid="agent-card"]')).toHaveCount({ min: 1 })
        }
      }
    })

    test('should show correct page information', async ({ page }) => {
      await helpers.goto('/marketplace')

      const pageInfo = page.locator('[data-testid="page-info"]')
      if (await pageInfo.isVisible()) {
        await expect(pageInfo).toContainText(/page \d+ of \d+/i)
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await helpers.goto('/marketplace')

      // Mobile menu should be visible
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible()

      // Agent cards should stack vertically
      const agentCards = page.locator('[data-testid="agent-card"]')
      if ((await agentCards.count()) > 1) {
        const firstCard = agentCards.first()
        const secondCard = agentCards.nth(1)

        const firstCardBox = await firstCard.boundingBox()
        const secondCardBox = await secondCard.boundingBox()

        expect(secondCardBox?.y).toBeGreaterThan(firstCardBox?.y + firstCardBox?.height - 10)
      }
    })

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await helpers.goto('/marketplace')

      // Should show appropriate number of columns
      await expect(page.locator('[data-testid="agents-grid"]')).toBeVisible()
      await expect(page.locator('[data-testid="agent-card"]')).toHaveCount({ min: 1 })
    })
  })
})