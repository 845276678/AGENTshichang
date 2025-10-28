/**
 * Week 4 工作坊交互功能 E2E 测试
 *
 * 测试覆盖：
 * - 工作坊会话管理
 * - 表单填写和验证
 * - Agent对话系统
 * - 进度跟踪
 * - PDF报告生成
 * - 音效系统
 */

import { test, expect } from '@playwright/test'

// 测试配置
const WORKSHOP_TEST_CONFIG = {
  workshopId: 'demand-validation',
  userId: 'test-user-week4',
  apiTimeout: 10000,
  formTimeout: 5000,
  pdfTimeout: 15000
}

test.describe('Week 4 - 工作坊交互功能', () => {

  test.beforeEach(async ({ page }) => {
    // 设置页面超时
    page.setDefaultTimeout(10000)

    // 模拟用户登录状态（如果需要）
    await page.addInitScript(() => {
      localStorage.setItem('workshop-user', JSON.stringify({
        id: 'test-user-week4',
        name: 'Week4 测试用户',
        email: 'week4@test.com'
      }))
    })
  })

  test('🎯 完整工作坊流程测试', async ({ page }) => {
    console.log('🧪 开始完整工作坊流程测试...')

    // 1. 导航到工作坊页面
    await page.goto('/workshops/demand-validation')
    await page.waitForLoadState('networkidle')

    // 验证工作坊欢迎界面
    await expect(page.locator('h3, h1, h2').filter({ hasText: '需求验证实验室' })).toBeVisible()
    await expect(page.locator('text=通过科学方法验证您的创意是否解决真实需求')).toBeVisible()

    // 点击开始工作坊
    await page.click('button:has-text("开始工作坊")')
    await page.waitForLoadState('networkidle')

    console.log('✅ 步骤1: 工作坊启动成功')

    // 2. 验证会话创建和UI状态
    await expect(page.locator('[data-testid="workshop-progress"]')).toBeVisible()
    await expect(page.locator('text=步骤 1/4')).toBeVisible()

    // 验证标签页导航
    await expect(page.locator('[data-testid="tab-form"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-agents"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-report"]')).toBeDisabled()

    console.log('✅ 步骤2: 界面状态验证成功')

    // 3. 填写步骤1：目标客户定义
    await test.step('填写步骤1：目标客户定义', async () => {
      // 填写客户细分
      await page.fill('textarea[name="targetCustomer.segment"]',
        '25-35岁的职场白领，主要从事互联网、金融、咨询等行业，具有一定的消费能力和创新意识'
      )

      // 添加痛点
      await page.fill('input[placeholder="输入一个痛点..."]', '缺乏有效的创意验证方法')
      await page.click('button:has-text("+")')

      await page.fill('input[placeholder="输入一个痛点..."]', '担心投资风险过高')
      await page.click('button:has-text("+")')

      await page.fill('input[placeholder="输入一个痛点..."]', '缺乏专业的市场分析工具')
      await page.click('button:has-text("+")')

      // 填写当前解决方案
      await page.fill('textarea[name="targetCustomer.currentSolution"]',
        '目前主要依靠个人经验判断，偶尔会咨询朋友或同事的意见，缺乏系统性的验证流程'
      )

      // 设置切换成本
      await page.locator('input[type="range"][name="targetCustomer.switchingCost"]').fill('6')

      console.log('✅ 步骤3: 目标客户定义填写完成')
    })

    // 4. 进入下一步
    await page.click('button:has-text("下一步")')
    await page.waitForTimeout(1000)

    // 验证步骤切换
    await expect(page.locator('text=步骤2: 需求场景描述')).toBeVisible()
    console.log('✅ 步骤4: 步骤切换成功')

    // 5. 填写步骤2：需求场景描述
    await test.step('填写步骤2：需求场景描述', async () => {
      // 使用场景
      await page.fill('textarea[name="demandScenario.context"]',
        '当用户产生新的商业想法时，需要快速验证市场需求和可行性。通常在项目启动前或投资决策前使用，希望通过专业的工具和方法来降低决策风险。'
      )

      // 使用频率
      await page.selectOption('select[name="demandScenario.frequency"]', 'monthly')

      // 需求紧迫性
      await page.locator('input[type="range"][name="demandScenario.urgency"]').fill('7')

      // 付费意愿
      await page.locator('input[type="range"][name="demandScenario.willingnessToPay"]').fill('8')

      console.log('✅ 步骤5: 需求场景描述填写完成')
    })

    // 6. 继续下一步
    await page.click('button:has-text("下一步")')
    await page.waitForTimeout(1000)

    // 7. 填写步骤3：价值验证
    await test.step('填写步骤3：价值验证', async () => {
      await page.fill('textarea[name="valueProposition.coreValue"]',
        '通过系统化的需求验证流程，帮助用户在最短时间内以最低成本验证商业想法的市场潜力，提供专业的分析报告和可执行的建议。'
      )

      await page.fill('textarea[name="valueProposition.differentiation"]',
        '相比传统的市场调研，我们提供智能化的验证工具，结合AI分析和专家建议，能够在24小时内给出初步验证结果，成本仅为传统调研的1/10。'
      )

      await page.fill('textarea[name="valueProposition.measurementMetric"]',
        '验证准确率、时间节省比例、成本节约金额、用户满意度、后续转化率'
      )

      console.log('✅ 步骤6: 价值验证填写完成')
    })

    // 8. 进入最后一步
    await page.click('button:has-text("下一步")')
    await page.waitForTimeout(1000)

    // 9. 填写步骤4：验证计划
    await test.step('填写步骤4：验证计划', async () => {
      // 选择验证方法
      await page.check('input[value="interview"]')
      await page.check('input[value="survey"]')

      // 目标样本量
      await page.fill('input[name="validationPlan.targetSampleSize"]', '50')

      // 成功标准
      await page.fill('textarea[name="validationPlan.successCriteria"]',
        '80%的受访者表示有明确需求，60%愿意为解决方案付费，单次验证时间控制在2小时内，客户满意度达到4.5/5分以上。'
      )

      // 时间计划
      await page.fill('input[name="validationPlan.timeline"]', '4周内完成所有验证')

      console.log('✅ 步骤7: 验证计划填写完成')
    })

    // 10. 完成工作坊
    await page.click('button:has-text("完成工作坊")')

    // 等待工作坊完成处理
    await page.waitForTimeout(3000)
    await expect(page.locator('text=恭喜您完成了')).toBeVisible({
      timeout: WORKSHOP_TEST_CONFIG.apiTimeout
    })

    console.log('✅ 步骤8: 工作坊完成成功')

    // 11. 验证报告页面
    await expect(page.locator('[data-testid="tab-report"]')).not.toBeDisabled()
    await page.click('[data-testid="tab-report"]')

    await expect(page.locator('text=生成PDF报告')).toBeVisible()
    console.log('✅ 步骤9: 报告页面验证成功')
  })

  test('📊 进度跟踪功能测试', async ({ page }) => {
    console.log('🧪 开始进度跟踪功能测试...')

    // 设置拦截器监听会话保存请求
    await page.route('**/api/workshop/session/**', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: { id: 'test-session', progress: 25 }
          })
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/workshops/demand-validation')
    await page.click('button:has-text("开始工作坊")')
    await page.waitForLoadState('networkidle')

    // 填写部分表单触发自动保存
    await page.fill('textarea[name="targetCustomer.segment"]', '测试客户细分')

    // 切换到进度页面
    await page.click('[data-testid="tab-progress"]')

    // 验证进度组件显示
    await expect(page.locator('text=需求验证实验室')).toBeVisible()
    await expect(page.locator('text=总体进度')).toBeVisible()

    // 验证步骤状态
    await expect(page.locator('text=目标客户定义')).toBeVisible()
    await expect(page.locator('text=需求场景描述')).toBeVisible()
    await expect(page.locator('text=价值验证')).toBeVisible()
    await expect(page.locator('text=验证计划')).toBeVisible()

    console.log('✅ 进度跟踪功能验证成功')
  })

  test('🤖 Agent 对话系统测试', async ({ page }) => {
    console.log('🧪 开始Agent对话系统测试...')

    // 模拟Agent API响应
    await page.route('**/api/workshop/agent-chat', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            message: '根据您填写的客户细分信息，建议您进一步细化目标用户的年龄段和职业背景。',
            type: 'feedback',
            suggestions: [
              '明确具体的年龄区间',
              '详细描述职业特征',
              '补充收入水平信息'
            ]
          }
        })
      })
    })

    await page.goto('/workshops/demand-validation')
    await page.click('button:has-text("开始工作坊")')
    await page.waitForLoadState('networkidle')

    // 填写表单数据
    await page.fill('textarea[name="targetCustomer.segment"]', '互联网从业者')

    // 切换到Agent页面
    await page.click('[data-testid="tab-agents"]')

    // 验证Agent助手界面
    await expect(page.locator('text=AI助手')).toBeVisible()

    // 点击快捷操作
    const validateButton = page.locator('button:has-text("评价我的填写内容")')
    if (await validateButton.isVisible()) {
      await validateButton.click()
      await page.waitForTimeout(2000)

      // 验证Agent回复
      await expect(page.locator('text=根据您填写的客户细分信息')).toBeVisible()
    }

    console.log('✅ Agent对话系统验证成功')
  })

  test('📄 PDF报告生成测试', async ({ page }) => {
    console.log('🧪 开始PDF报告生成测试...')

    // 模拟PDF生成API
    await page.route('**/api/workshop/generate-pdf', async (route) => {
      // 创建模拟PDF内容
      const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n'

      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="需求验证实验室_完成报告_2024-10-13.pdf"'
        },
        body: Buffer.from(pdfContent)
      })
    })

    // 模拟已完成的工作坊会话
    await page.route('**/api/workshop/session**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-completed-session',
              workshopId: 'demand-validation',
              userId: 'test-user-week4',
              status: 'COMPLETED',
              progress: 100,
              formData: {
                targetCustomer: {
                  segment: '测试客户细分',
                  painPoints: ['痛点1', '痛点2'],
                  currentSolution: '测试解决方案',
                  switchingCost: 5
                }
              },
              completedSteps: [1, 2, 3, 4],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          })
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/workshops/demand-validation')
    await page.waitForLoadState('networkidle')

    // 直接进入报告页面（模拟已完成状态）
    await page.click('[data-testid="tab-report"]')

    // 填写PDF生成表单
    await page.fill('input[name="name"]', 'Week4 测试用户')
    await page.fill('input[name="email"]', 'week4@test.com')
    await page.fill('input[name="company"]', '测试公司')

    // 生成PDF
    const downloadPromise = page.waitForDownload({ timeout: WORKSHOP_TEST_CONFIG.pdfTimeout })
    await page.click('button:has-text("生成报告")')

    // 验证PDF生成成功
    await expect(page.locator('text=PDF报告生成成功')).toBeVisible({
      timeout: WORKSHOP_TEST_CONFIG.pdfTimeout
    })

    // 验证下载按钮出现
    await expect(page.locator('button:has-text("下载报告")')).toBeVisible()

    console.log('✅ PDF报告生成验证成功')
  })

  test('🔊 音效系统测试', async ({ page }) => {
    console.log('🧪 开始音效系统测试...')

    // 监听音效相关的Web Audio API调用
    await page.addInitScript(() => {
      window._audioContextCalls = []
      const originalAudioContext = window.AudioContext || window.webkitAudioContext

      if (originalAudioContext) {
        window.AudioContext = class extends originalAudioContext {
          constructor(...args) {
            super(...args)
            window._audioContextCalls.push('created')
          }

          createBufferSource() {
            const source = super.createBufferSource()
            const originalStart = source.start
            source.start = function(...args) {
              window._audioContextCalls.push('sound_played')
              return originalStart.apply(this, args)
            }
            return source
          }
        }
      }
    })

    await page.goto('/workshops/demand-validation')
    await page.click('button:has-text("开始工作坊")')
    await page.waitForLoadState('networkidle')

    // 触发表单保存音效
    await page.fill('textarea[name="targetCustomer.segment"]', '测试音效')
    await page.click('button:has-text("保存进度")')

    await page.waitForTimeout(1000)

    // 检查音效系统初始化
    const audioContextCalls = await page.evaluate(() => window._audioContextCalls || [])
    expect(audioContextCalls.length).toBeGreaterThan(0)

    console.log('✅ 音效系统验证成功', { calls: audioContextCalls })
  })

  test('💾 会话持久化测试', async ({ page }) => {
    console.log('🧪 开始会话持久化测试...')

    let sessionData = null

    // 拦截会话创建和更新请求
    await page.route('**/api/workshop/session**', async (route) => {
      const method = route.request().method()

      if (method === 'POST') {
        sessionData = {
          id: 'test-persist-session',
          workshopId: 'demand-validation',
          userId: 'test-user-week4',
          status: 'IN_PROGRESS',
          progress: 0,
          formData: {},
          completedSteps: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, data: sessionData })
        })
      } else if (method === 'PUT') {
        const requestBody = route.request().postDataJSON()
        sessionData = { ...sessionData, ...requestBody }

        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, data: sessionData })
        })
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, data: sessionData })
        })
      }
    })

    await page.goto('/workshops/demand-validation')
    await page.click('button:has-text("开始工作坊")')
    await page.waitForLoadState('networkidle')

    // 填写表单数据
    await page.fill('textarea[name="targetCustomer.segment"]', '持久化测试数据')

    // 等待自动保存触发
    await page.waitForTimeout(3000)

    // 验证数据已保存
    expect(sessionData).not.toBeNull()
    expect(sessionData.formData.targetCustomer?.segment).toBe('持久化测试数据')

    // 刷新页面验证会话恢复
    await page.reload()
    await page.waitForLoadState('networkidle')

    // 验证数据恢复
    const segmentValue = await page.inputValue('textarea[name="targetCustomer.segment"]')
    expect(segmentValue).toBe('持久化测试数据')

    console.log('✅ 会话持久化验证成功')
  })

  test('🚀 综合性能测试', async ({ page }) => {
    console.log('🧪 开始综合性能测试...')

    // 启用性能监控
    await page.addInitScript(() => {
      window.performanceMarks = []
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.performanceMarks.push({
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime
          })
        }
      })
      observer.observe({ entryTypes: ['measure'] })
    })

    const startTime = Date.now()

    // 完整工作坊流程性能测试
    await page.goto('/workshops/demand-validation')
    await page.click('button:has-text("开始工作坊")')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    console.log(`⏱️ 页面加载时间: ${loadTime}ms`)

    // 快速填写表单
    const formStartTime = Date.now()

    await page.fill('textarea[name="targetCustomer.segment"]', '性能测试客户')
    await page.fill('input[placeholder="输入一个痛点..."]', '性能痛点')
    await page.click('button:has-text("+")')

    const formTime = Date.now() - formStartTime
    console.log(`⏱️ 表单填写响应时间: ${formTime}ms`)

    // 验证性能指标
    expect(loadTime).toBeLessThan(5000) // 页面加载小于5秒
    expect(formTime).toBeLessThan(1000) // 表单响应小于1秒

    const performanceMarks = await page.evaluate(() => window.performanceMarks || [])
    console.log('📊 性能指标:', performanceMarks.slice(0, 5))

    console.log('✅ 综合性能测试完成')
  })
})

// 清理函数
test.afterEach(async ({ page }) => {
  // 清理localStorage
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
})