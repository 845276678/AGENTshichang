#!/usr/bin/env node

/**
 * Worker启动脚本
 *
 * 启动所有BullMQ Workers来处理后台任务
 * 使用方法:
 *   npm run worker:start
 *   或
 *   node scripts/start-workers.js
 */

import {
  publishWorker,
  verifyWorker,
  trendWorker,
  competitorWorker
} from '../src/workers'

// Workers列表
const workers = [
  { name: 'PublishWorker', instance: publishWorker },
  { name: 'VerifyWorker', instance: verifyWorker },
  { name: 'TrendWorker', instance: trendWorker },
  { name: 'CompetitorWorker', instance: competitorWorker }
]

/**
 * 启动所有Workers
 */
async function startWorkers() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                 BullMQ Workers Starting                   ║
║                                                           ║
║  社交媒体自动发布和市场数据采集系统                          ║
╚═══════════════════════════════════════════════════════════╝
  `)

  console.log('[Workers] Starting all workers...\n')

  // 检查Workers是否正在运行
  workers.forEach(({ name, instance }) => {
    const isRunning = instance.isRunning()
    console.log(`[${name}] Status: ${isRunning ? '✓ Running' : '✗ Not Running'}`)
  })

  console.log(`\n[Workers] All workers started successfully!`)
  console.log('[Workers] Waiting for jobs...\n')

  // 显示指标信息（每30秒）
  setInterval(() => {
    console.log('\n[Metrics] Worker Statistics:')
    workers.forEach(({ name, instance }) => {
      const metrics = instance.getMetrics()
      console.log(`  ${name}:`)
      console.log(`    - Jobs Processed: ${metrics.jobsProcessed}`)
      console.log(`    - Jobs Failed: ${metrics.jobsFailed}`)
      console.log(`    - Avg Processing Time: ${metrics.avgProcessingTime.toFixed(2)}ms`)
    })
  }, 30000)
}

/**
 * 优雅关闭Workers
 */
async function shutdownWorkers() {
  console.log('\n[Workers] Shutting down workers gracefully...')

  await Promise.all(
    workers.map(async ({ name, instance }) => {
      console.log(`[${name}] Shutting down...`)
      await instance.shutdown()
      console.log(`[${name}] Shut down successfully`)
    })
  )

  console.log('[Workers] All workers shut down successfully')
  process.exit(0)
}

// 处理进程信号
process.on('SIGTERM', shutdownWorkers)
process.on('SIGINT', shutdownWorkers)
process.on('uncaughtException', (error) => {
  console.error('[Workers] Uncaught Exception:', error)
  shutdownWorkers()
})
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Workers] Unhandled Rejection at:', promise, 'reason:', reason)
  shutdownWorkers()
})

// 启动Workers
startWorkers().catch((error) => {
  console.error('[Workers] Failed to start workers:', error)
  process.exit(1)
})
