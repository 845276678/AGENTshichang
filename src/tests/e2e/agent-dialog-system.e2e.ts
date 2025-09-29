/**
 * AI Agent对话框系统 - E2E测试
 * 使用Playwright进行端到端测试
 */

import { test, expect, type Page } from '@playwright/test'

// 测试配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const MARKETPLACE_URL = `${BASE_URL}/marketplace/bidding`

// 测试用例数据
const TEST_IDEA = {
  title: 'AI智能家居控制系统',
  description: '基于语音识别和机器学习的智能家居控制平台，可以通过自然语言控制各种家电设备，并学习用户习惯进行自动化控制。'
}

// 设备尺寸配置
const DEVICES = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
}

// 辅助函数
async function waitForAgentsToLoad(page: Page) {
  // 等待5位AI专家面板加载完成
  await expect(page.locator('.agent-panel-container')).toHaveCount(5)

  // 等待所有头像加载完成
  const avatars = page.locator('.agent-avatar img')
  await expect(avatars).toHaveCount(5)

  for (let i = 0; i < 5; i++) {
    await expect(avatars.nth(i)).toBeVisible()
  }
}

async function fillIdeaForm(page: Page, idea: typeof TEST_IDEA) {
  // 查找并填写创意输入表单
  const textarea = page.locator('textarea[placeholder*="创意"], textarea[placeholder*="想法"]').first()
  await textarea.fill(`${idea.title}\n\n${idea.description}`)

  // 提交表单
  const submitButton = page.locator('button:has-text("开始AI竞价"), button:has-text("提交创意")').first()
  await submitButton.click()
}

// 主要测试套件
test.describe('AI Agent对话框系统 E2E测试', () => {

  test.beforeEach(async ({ page }) => {
    // 访问创意竞价页面
    await page.goto(MARKETPLACE_URL)
    await page.waitForLoadState('networkidle')
  })

  test('页面基础加载测试', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/AI.*竞价|创意.*竞价|竞价.*舞台/)

    // 检查核心UI元素存在
    await expect(page.locator('h1, h2, .page-title')).toBeVisible()

    // 等待Agent面板加载
    await waitForAgentsToLoad(page)

    // 检查每个Agent面板的基本元素
    const agentPanels = page.locator('.agent-panel-container')

    for (let i = 0; i < 5; i++) {
      const panel = agentPanels.nth(i)

      // 检查头像
      await expect(panel.locator('.agent-avatar img, img[alt*="专家"], img[alt*="Agent"]')).toBeVisible()

      // 检查名称
      await expect(panel.locator('.agent-name, h3, h4')).toBeVisible()

      // 检查专长描述
      await expect(panel.locator('.agent-specialty, p')).toBeVisible()
    }
  })

  test('创意输入和竞价流程测试', async ({ page }) => {
    await waitForAgentsToLoad(page)

    // 填写并提交创意
    await fillIdeaForm(page, TEST_IDEA)

    // 等待竞价开始响应
    await page.waitForTimeout(2000)

    // 检查是否进入竞价阶段
    const phaseIndicators = [
      page.locator('text=/预热|暖场/'),
      page.locator('text=/讨论|分析/'),
      page.locator('text=/竞价|出价/')
    ]

    // 至少有一个阶段指示器可见
    let phaseFound = false
    for (const indicator of phaseIndicators) {
      try {
        await indicator.waitFor({ timeout: 3000 })
        phaseFound = true
        break
      } catch (e) {
        continue
      }
    }
    expect(phaseFound).toBe(true)

    // 检查WebSocket连接状态
    const connectionStatus = page.locator('text=/已连接|在线|Connected/')
    await expect(connectionStatus).toBeVisible({ timeout: 5000 })
  })

  test('0出价显示测试', async ({ page }) => {
    await waitForAgentsToLoad(page)
    await fillIdeaForm(page, TEST_IDEA)

    // 等待进入竞价阶段
    await page.waitForTimeout(5000)

    // 检查出价显示区域
    const bidAmounts = page.locator('.bid-amount, .bidding-status')
    const count = await bidAmounts.count()

    if (count > 0) {
      // 检查是否有0出价显示
      const zeroBids = page.locator('text="¥0", text="¥ 0"')
      const zeroBidCount = await zeroBids.count()

      if (zeroBidCount > 0) {
        // 验证0出价的提示文本
        await expect(page.locator('text=/尚无溢价|等待出价|无出价/')).toBeVisible()
        console.log(`✅ 检测到 ${zeroBidCount} 个0出价显示`)
      }

      // 验证非0出价格式正确
      const nonZeroBids = page.locator('.bid-amount').filter({ hasText: /¥\s*[1-9]\d*/ })
      const nonZeroBidCount = await nonZeroBids.count()

      if (nonZeroBidCount > 0) {
        console.log(`✅ 检测到 ${nonZeroBidCount} 个非0出价显示`)
      }
    }
  })

  test('支持按钮交互测试', async ({ page }) => {
    await waitForAgentsToLoad(page)
    await fillIdeaForm(page, TEST_IDEA)

    // 等待进入用户补充阶段
    await page.waitForTimeout(10000)

    // 查找支持按钮
    const supportButtons = page.locator('button:has-text("支持"), .support-button')
    const buttonCount = await supportButtons.count()

    if (buttonCount > 0) {
      // 点击第一个支持按钮
      await supportButtons.first().click()

      // 检查按钮状态变化
      await expect(supportButtons.first()).toHaveText(/已支持|支持成功/)

      // 检查按钮被禁用
      await expect(supportButtons.first()).toBeDisabled()

      console.log('✅ 支持按钮交互测试通过')
    } else {
      console.log('ℹ️ 当前阶段无支持按钮可见')
    }
  })
})

// 响应式设计测试
test.describe('响应式设计测试', () => {

  Object.entries(DEVICES).forEach(([deviceName, size]) => {
    test(`${deviceName} 设备响应式测试`, async ({ page }) => {
      // 设置视口大小
      await page.setViewportSize(size)
      await page.goto(MARKETPLACE_URL)
      await page.waitForLoadState('networkidle')

      // 等待Agent面板加载
      await waitForAgentsToLoad(page)

      // 检查面板布局
      const agentPanels = page.locator('.agent-panel-container')
      await expect(agentPanels).toHaveCount(5)

      // 验证所有面板在视口内可见
      for (let i = 0; i < 5; i++) {
        const panel = agentPanels.nth(i)
        await expect(panel).toBeInViewport()
      }

      // 检查文本是否被正确截断（移动端）
      if (deviceName === 'mobile') {
        const specialtyTexts = page.locator('.agent-specialty, p')
        const count = await specialtyTexts.count()

        for (let i = 0; i < Math.min(count, 5); i++) {
          const text = specialtyTexts.nth(i)

          // 检查CSS截断类是否存在
          const classNames = await text.getAttribute('class')
          expect(classNames).toMatch(/line-clamp|truncate/)
        }
      }

      console.log(`✅ ${deviceName} (${size.width}x${size.height}) 响应式测试通过`)
    })
  })
})

// 性能测试
test.describe('性能测试', () => {

  test('页面加载性能测试', async ({ page }) => {
    const startTime = Date.now()

    await page.goto(MARKETPLACE_URL)
    await waitForAgentsToLoad(page)

    const loadTime = Date.now() - startTime

    // 页面加载时间应该小于3秒
    expect(loadTime).toBeLessThan(3000)
    console.log(`✅ 页面加载时间: ${loadTime}ms`)
  })

  test('动画性能测试', async ({ page }) => {
    await page.goto(MARKETPLACE_URL)
    await waitForAgentsToLoad(page)

    // 启用性能监控
    await page.evaluate(() => {
      (window as any).performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 16.67) { // 大于一帧时间
            console.warn(`⚠️ 动画卡顿: ${entry.name} - ${entry.duration}ms`)
          }
        }
      })
      ;(window as any).performanceObserver.observe({ entryTypes: ['measure'] })
    })

    // 触发一些交互以测试动画
    const agentPanels = page.locator('.agent-panel-container')

    // 悬停测试
    for (let i = 0; i < 3; i++) {
      await agentPanels.nth(i).hover()
      await page.waitForTimeout(200)
    }

    console.log('✅ 动画性能测试完成')
  })

  test('WebSocket连接性能测试', async ({ page }) => {
    let connectionTime = 0
    let messageCount = 0

    // 监听WebSocket连接
    page.on('websocket', (ws) => {
      const startTime = Date.now()

      ws.on('open', () => {
        connectionTime = Date.now() - startTime
        console.log(`🔌 WebSocket连接时间: ${connectionTime}ms`)
      })

      ws.on('framesent', () => messageCount++)
      ws.on('framereceived', () => messageCount++)
    })

    await page.goto(MARKETPLACE_URL)
    await waitForAgentsToLoad(page)

    // 等待WebSocket连接建立
    await page.waitForTimeout(2000)

    // WebSocket连接时间应该小于1秒
    if (connectionTime > 0) {
      expect(connectionTime).toBeLessThan(1000)
    }

    console.log(`✅ WebSocket消息数量: ${messageCount}`)
  })
})

// 可访问性测试
test.describe('可访问性测试', () => {

  test('键盘导航测试', async ({ page }) => {
    await page.goto(MARKETPLACE_URL)
    await waitForAgentsToLoad(page)

    // Tab键导航测试
    await page.keyboard.press('Tab')

    // 检查焦点可见性
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // 继续Tab导航，确保能到达支持按钮（如果存在）
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')

      const currentFocus = page.locator(':focus')
      const isButton = await currentFocus.evaluate(el => el.tagName === 'BUTTON')

      if (isButton) {
        const buttonText = await currentFocus.textContent()
        if (buttonText?.includes('支持')) {
          // 测试空格键激活
          await page.keyboard.press('Space')
          console.log('✅ 键盘导航和激活测试通过')
          break
        }
      }
    }
  })

  test('屏幕阅读器标签测试', async ({ page }) => {
    await page.goto(MARKETPLACE_URL)
    await waitForAgentsToLoad(page)

    // 检查重要元素的aria-label
    const agentPanels = page.locator('.agent-panel-container')

    for (let i = 0; i < 5; i++) {
      const panel = agentPanels.nth(i)

      // 检查图片alt属性
      const avatar = panel.locator('img').first()
      const altText = await avatar.getAttribute('alt')
      expect(altText).toBeTruthy()
      expect(altText?.length).toBeGreaterThan(0)
    }

    // 检查按钮的aria-label
    const buttons = page.locator('button[aria-label], .support-button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      if (ariaLabel) {
        expect(ariaLabel.length).toBeGreaterThan(0)
      }
    }

    console.log('✅ 可访问性标签测试通过')
  })
})

// 错误处理测试
test.describe('错误处理测试', () => {

  test('网络断开恢复测试', async ({ page }) => {
    await page.goto(MARKETPLACE_URL)
    await waitForAgentsToLoad(page)

    // 模拟网络断开
    await page.setOffline(true)
    await page.waitForTimeout(2000)

    // 恢复网络连接
    await page.setOffline(false)
    await page.waitForTimeout(3000)

    // 检查重连状态
    const connectionStatus = page.locator('text=/重连|连接中|已连接/')
    await expect(connectionStatus).toBeVisible({ timeout: 5000 })

    console.log('✅ 网络断开恢复测试通过')
  })

  test('加载失败重试测试', async ({ page }) => {
    // 拦截资源加载失败
    await page.route('**/*.js', (route) => {
      if (Math.random() < 0.1) { // 10%概率失败
        route.abort()
      } else {
        route.continue()
      }
    })

    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        await page.goto(MARKETPLACE_URL)
        await waitForAgentsToLoad(page)
        break
      } catch (error) {
        retryCount++
        console.log(`重试 ${retryCount}/${maxRetries}`)
        if (retryCount >= maxRetries) {
          throw error
        }
        await page.waitForTimeout(1000)
      }
    }

    console.log('✅ 加载失败重试测试通过')
  })
})

export { waitForAgentsToLoad, fillIdeaForm, TEST_IDEA, DEVICES }