/**
 * 性能基准测试脚本
 * 测试AI Agent对话框系统的性能指标
 */

import { performance } from 'perf_hooks'

// 性能测试配置
interface PerformanceConfig {
  iterations: number
  warmupIterations: number
  timeout: number
  memoryThreshold: number // MB
  renderTimeThreshold: number // ms
}

const DEFAULT_CONFIG: PerformanceConfig = {
  iterations: 100,
  warmupIterations: 10,
  timeout: 30000,
  memoryThreshold: 50,
  renderTimeThreshold: 5
}

// 性能指标
interface PerformanceMetrics {
  averageRenderTime: number
  minRenderTime: number
  maxRenderTime: number
  p95RenderTime: number
  memoryUsage: number
  operationsPerSecond: number
  errorRate: number
}

// 内存使用情况
interface MemoryUsage {
  used: number
  total: number
  external: number
  rss: number
}

class PerformanceTester {
  private config: PerformanceConfig
  private results: number[] = []
  private errors: number = 0

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 运行性能测试
   */
  async runTest<T>(
    testName: string,
    testFunction: () => Promise<T> | T,
    config?: Partial<PerformanceConfig>
  ): Promise<PerformanceMetrics> {
    const testConfig = { ...this.config, ...config }

    console.log(`🧪 开始性能测试: ${testName}`)
    console.log(`配置: ${testConfig.iterations} 次迭代, ${testConfig.warmupIterations} 次预热`)

    // 预热
    console.log('⏳ 预热中...')
    for (let i = 0; i < testConfig.warmupIterations; i++) {
      try {
        await testFunction()
      } catch (error) {
        console.warn(`预热迭代 ${i} 失败:`, error)
      }
    }

    // 正式测试
    console.log('🚀 正式测试开始...')
    this.results = []
    this.errors = 0

    const startMemory = this.getMemoryUsage()

    for (let i = 0; i < testConfig.iterations; i++) {
      const startTime = performance.now()

      try {
        await testFunction()
        const endTime = performance.now()
        const duration = endTime - startTime

        this.results.push(duration)

        if (i % 10 === 0) {
          console.log(`进度: ${i}/${testConfig.iterations} (${((i / testConfig.iterations) * 100).toFixed(1)}%)`)
        }
      } catch (error) {
        this.errors++
        console.error(`测试迭代 ${i} 失败:`, error)
      }
    }

    const endMemory = this.getMemoryUsage()

    // 计算指标
    const metrics = this.calculateMetrics(startMemory, endMemory)

    console.log('📊 测试结果:')
    console.log(`  平均耗时: ${metrics.averageRenderTime.toFixed(2)}ms`)
    console.log(`  最小耗时: ${metrics.minRenderTime.toFixed(2)}ms`)
    console.log(`  最大耗时: ${metrics.maxRenderTime.toFixed(2)}ms`)
    console.log(`  P95耗时: ${metrics.p95RenderTime.toFixed(2)}ms`)
    console.log(`  内存增长: ${(metrics.memoryUsage).toFixed(2)}MB`)
    console.log(`  操作/秒: ${metrics.operationsPerSecond.toFixed(2)}`)
    console.log(`  错误率: ${(metrics.errorRate * 100).toFixed(2)}%`)

    // 性能警告
    if (metrics.averageRenderTime > testConfig.renderTimeThreshold) {
      console.warn(`⚠️ 平均渲染时间 ${metrics.averageRenderTime.toFixed(2)}ms 超过阈值 ${testConfig.renderTimeThreshold}ms`)
    }

    if (metrics.memoryUsage > testConfig.memoryThreshold) {
      console.warn(`⚠️ 内存使用 ${metrics.memoryUsage.toFixed(2)}MB 超过阈值 ${testConfig.memoryThreshold}MB`)
    }

    if (metrics.errorRate > 0.05) {
      console.warn(`⚠️ 错误率 ${(metrics.errorRate * 100).toFixed(2)}% 过高`)
    }

    return metrics
  }

  /**
   * 计算性能指标
   */
  private calculateMetrics(startMemory: MemoryUsage, endMemory: MemoryUsage): PerformanceMetrics {
    const sortedResults = [...this.results].sort((a, b) => a - b)
    const validResults = sortedResults.length

    const averageRenderTime = validResults > 0 ? sortedResults.reduce((a, b) => a + b, 0) / validResults : 0
    const minRenderTime = validResults > 0 ? sortedResults[0] : 0
    const maxRenderTime = validResults > 0 ? sortedResults[validResults - 1] : 0
    const p95Index = Math.floor(validResults * 0.95)
    const p95RenderTime = validResults > 0 ? sortedResults[p95Index] : 0

    const memoryUsage = (endMemory.used - startMemory.used) / (1024 * 1024) // Convert to MB
    const totalTime = validResults > 0 ? sortedResults.reduce((a, b) => a + b, 0) : 1
    const operationsPerSecond = validResults > 0 ? (validResults * 1000) / totalTime : 0
    const errorRate = validResults > 0 ? this.errors / (validResults + this.errors) : 0

    return {
      averageRenderTime,
      minRenderTime,
      maxRenderTime,
      p95RenderTime,
      memoryUsage,
      operationsPerSecond,
      errorRate
    }
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): MemoryUsage {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      return {
        used: usage.heapUsed,
        total: usage.heapTotal,
        external: usage.external,
        rss: usage.rss
      }
    }

    // 浏览器环境
    const performanceMemory = (performance as any).memory
    if (performanceMemory) {
      return {
        used: performanceMemory.usedJSHeapSize,
        total: performanceMemory.totalJSHeapSize,
        external: 0,
        rss: 0
      }
    }

    return { used: 0, total: 0, external: 0, rss: 0 }
  }
}

// 具体测试用例
export class AgentDialogPerformanceTests {
  private tester = new PerformanceTester()

  /**
   * 组件渲染性能测试
   */
  async testComponentRendering(): Promise<PerformanceMetrics> {
    return this.tester.runTest('AgentDialogPanel渲染性能', () => {
      // 模拟组件渲染
      const mockProps = {
        agent: {
          id: 'test-agent',
          name: '测试专家',
          specialty: '测试专长描述',
          avatar: '/test-avatar.png'
        },
        state: {
          id: 'test-agent',
          phase: 'speaking',
          emotion: 'excited',
          confidence: Math.random(),
          lastActivity: new Date(),
          speakingIntensity: Math.random(),
          isSupported: false
        },
        isActive: Math.random() > 0.5,
        currentBid: Math.floor(Math.random() * 200)
      }

      // 模拟DOM操作
      const element = {
        innerHTML: JSON.stringify(mockProps),
        style: { transform: 'scale(1.05)', opacity: '1' },
        classList: { add: () => {}, remove: () => {} }
      }

      // 模拟动画计算
      for (let i = 0; i < 10; i++) {
        Math.sin(i * 0.1) * Math.cos(i * 0.1)
      }

      return element
    })
  }

  /**
   * 状态管理性能测试
   */
  async testStateManagement(): Promise<PerformanceMetrics> {
    const stateManager = new Map()

    return this.tester.runTest('状态管理性能', () => {
      const agentId = `agent-${Math.floor(Math.random() * 5)}`
      const updates = {
        phase: 'speaking',
        emotion: 'excited',
        confidence: Math.random(),
        lastActivity: Date.now(),
        currentMessage: `测试消息 ${Math.random()}`
      }

      // 模拟状态更新
      const currentState = stateManager.get(agentId) || {}
      const newState = { ...currentState, ...updates }
      stateManager.set(agentId, newState)

      // 模拟状态验证
      const isValid = (
        typeof newState.confidence === 'number' &&
        newState.confidence >= 0 &&
        newState.confidence <= 1
      )

      return { agentId, newState, isValid }
    })
  }

  /**
   * 消息缓冲性能测试
   */
  async testMessageBuffering(): Promise<PerformanceMetrics> {
    const buffer = new Map()
    let messageId = 0

    return this.tester.runTest('消息缓冲性能', () => {
      // 生成模拟消息
      const message = {
        id: `msg-${messageId++}`,
        type: ['agent_thinking', 'agent_speaking', 'agent_bidding'][Math.floor(Math.random() * 3)],
        personaId: `agent-${Math.floor(Math.random() * 5)}`,
        payload: {
          phase: 'speaking',
          emotion: 'excited',
          confidence: Math.random(),
          message: `测试消息内容 ${Math.random()}`
        },
        timestamp: Date.now(),
        priority: Math.floor(Math.random() * 4) + 1
      }

      // 模拟缓冲区操作
      buffer.set(message.id, message)

      // 模拟去重逻辑
      const agentMessages = Array.from(buffer.values())
        .filter(msg => msg.personaId === message.personaId)
        .sort((a, b) => b.timestamp - a.timestamp)

      if (agentMessages.length > 3) {
        agentMessages.slice(3).forEach(msg => buffer.delete(msg.id))
      }

      // 模拟批处理
      if (buffer.size > 10) {
        const batch = Array.from(buffer.values()).slice(0, 5)
        batch.forEach(msg => buffer.delete(msg.id))
      }

      return { bufferSize: buffer.size, messageCount: messageId }
    })
  }

  /**
   * 动画计算性能测试
   */
  async testAnimationCalculations(): Promise<PerformanceMetrics> {
    return this.tester.runTest('动画计算性能', () => {
      const time = Date.now() * 0.001 // 转换为秒

      // 模拟各种动画计算
      const results = {
        // 脉冲动画
        pulse: Math.sin(time * 2) * 0.5 + 0.5,

        // 旋转动画
        rotation: (time * 360) % 360,

        // 缓动函数
        easeInOut: (t: number) => {
          const x = Math.sin(time + t) * 0.5 + 0.5
          return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
        },

        // 弹簧动画
        spring: Math.exp(-time * 2) * Math.sin(time * 10),

        // 贝塞尔曲线
        bezier: Math.pow(1 - time % 1, 3) * 0 + 3 * Math.pow(1 - time % 1, 2) * (time % 1) * 0.25 + 3 * (1 - time % 1) * Math.pow(time % 1, 2) * 0.75 + Math.pow(time % 1, 3) * 1
      }

      // 模拟DOM样式更新
      const styles = {
        transform: `translateY(${results.spring * 10}px) rotate(${results.rotation}deg)`,
        opacity: results.pulse,
        scale: 1 + results.spring * 0.1
      }

      return { results, styles, timestamp: time }
    })
  }

  /**
   * 响应式布局计算性能测试
   */
  async testResponsiveCalculations(): Promise<PerformanceMetrics> {
    return this.tester.runTest('响应式布局计算性能', () => {
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 }    // Mobile
      ]

      const results = viewports.map(viewport => {
        // 模拟断点检测
        const breakpoint = viewport.width >= 1024 ? 'desktop' :
                          viewport.width >= 768 ? 'tablet' : 'mobile'

        // 模拟网格计算
        const columns = breakpoint === 'desktop' ? 5 :
                       breakpoint === 'tablet' ? 3 : 2

        const itemWidth = (viewport.width - (columns - 1) * 16) / columns
        const itemHeight = breakpoint === 'mobile' ? 260 : 320

        // 模拟字体缩放
        const fontScale = breakpoint === 'mobile' ? 0.875 :
                         breakpoint === 'tablet' ? 0.9 : 1

        return {
          viewport,
          breakpoint,
          columns,
          itemWidth,
          itemHeight,
          fontScale
        }
      })

      return results
    })
  }

  /**
   * 运行所有性能测试
   */
  async runAllTests(): Promise<Record<string, PerformanceMetrics>> {
    console.log('🚀 开始运行所有性能测试...\n')

    const results: Record<string, PerformanceMetrics> = {}

    try {
      results.componentRendering = await this.testComponentRendering()
      console.log('')

      results.stateManagement = await this.testStateManagement()
      console.log('')

      results.messageBuffering = await this.testMessageBuffering()
      console.log('')

      results.animationCalculations = await this.testAnimationCalculations()
      console.log('')

      results.responsiveCalculations = await this.testResponsiveCalculations()
      console.log('')

      // 生成性能报告
      this.generatePerformanceReport(results)

    } catch (error) {
      console.error('❌ 性能测试过程中发生错误:', error)
      throw error
    }

    return results
  }

  /**
   * 生成性能报告
   */
  private generatePerformanceReport(results: Record<string, PerformanceMetrics>): void {
    console.log('📋 性能测试综合报告')
    console.log('=' .repeat(50))

    let totalScore = 100
    const issues: string[] = []

    Object.entries(results).forEach(([testName, metrics]) => {
      console.log(`\n${testName}:`)
      console.log(`  平均耗时: ${metrics.averageRenderTime.toFixed(2)}ms`)
      console.log(`  P95耗时: ${metrics.p95RenderTime.toFixed(2)}ms`)
      console.log(`  内存增长: ${metrics.memoryUsage.toFixed(2)}MB`)
      console.log(`  操作/秒: ${metrics.operationsPerSecond.toFixed(2)}`)

      // 评分逻辑
      if (metrics.averageRenderTime > 5) {
        totalScore -= 10
        issues.push(`${testName}: 平均耗时过高`)
      }

      if (metrics.memoryUsage > 10) {
        totalScore -= 10
        issues.push(`${testName}: 内存使用过高`)
      }

      if (metrics.errorRate > 0.01) {
        totalScore -= 20
        issues.push(`${testName}: 错误率过高`)
      }
    })

    console.log('\n' + '='.repeat(50))
    console.log(`🏆 综合性能评分: ${Math.max(0, totalScore)}/100`)

    if (issues.length > 0) {
      console.log('\n⚠️ 需要关注的问题:')
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`)
      })
    } else {
      console.log('\n✅ 所有测试均通过性能标准！')
    }

    // 性能建议
    console.log('\n💡 性能优化建议:')
    console.log('  1. 使用React.memo减少不必要的重渲染')
    console.log('  2. 实施虚拟滚动处理大量数据')
    console.log('  3. 优化动画使用GPU加速')
    console.log('  4. 实施消息缓冲减少频繁更新')
    console.log('  5. 使用Web Workers处理复杂计算')
  }
}

// 导出性能测试函数
export async function runPerformanceTests(): Promise<void> {
  const tests = new AgentDialogPerformanceTests()
  await tests.runAllTests()
}

// 如果直接运行此文件
if (require.main === module) {
  runPerformanceTests().catch(console.error)
}

export { PerformanceTester, AgentDialogPerformanceTests }
export default { runPerformanceTests, PerformanceTester, AgentDialogPerformanceTests }