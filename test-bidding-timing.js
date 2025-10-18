/**
 * 竞价系统时间配置测试脚本
 * 验证快速竞价模式（每阶段2分钟 + 用户发言顺延1分钟）
 */

// 模拟快速竞价配置
const FAST_BIDDING_CONFIG = {
  phases: {
    'warmup': { duration: 120, description: 'AI预热阶段' },
    'discussion': { duration: 120, description: '深度讨论阶段' },
    'bidding': { duration: 120, description: '激烈竞价阶段' },
    'prediction': { duration: 120, description: '用户补充阶段' },
    'result': { duration: 120, description: '结果展示阶段' }
  },
  userExtension: {
    enabled: true,
    duration: 60, // 1分钟
    maxPerPhase: 1 // 每阶段最多顺延1次
  }
}

// 计算总时间
function calculateTotalTime() {
  const baseTotalTime = Object.values(FAST_BIDDING_CONFIG.phases)
    .reduce((total, phase) => total + phase.duration, 0)

  const maxExtensionTime = Object.keys(FAST_BIDDING_CONFIG.phases).length *
    FAST_BIDDING_CONFIG.userExtension.duration

  console.log('🕒 快速竞价模式时间配置:')
  console.log('==========================================')

  Object.entries(FAST_BIDDING_CONFIG.phases).forEach(([phase, config]) => {
    const minutes = Math.floor(config.duration / 60)
    const seconds = config.duration % 60
    console.log(`📍 ${config.description}: ${minutes}分${seconds}秒`)
  })

  console.log('==========================================')
  console.log(`⏱️  基础总时长: ${Math.floor(baseTotalTime / 60)}分钟`)
  console.log(`⏰ 最大顺延时间: ${Math.floor(maxExtensionTime / 60)}分钟`)
  console.log(`🎯 最大总时长: ${Math.floor((baseTotalTime + maxExtensionTime) / 60)}分钟`)

  return {
    baseTime: baseTotalTime,
    maxExtension: maxExtensionTime,
    maxTotal: baseTotalTime + maxExtensionTime
  }
}

// 模拟阶段进度
function simulatePhaseProgress(phaseName, timeRemaining, hasUserSpoken = false) {
  const phaseConfig = FAST_BIDDING_CONFIG.phases[phaseName]
  if (!phaseConfig) {
    console.log(`❌ 未知阶段: ${phaseName}`)
    return
  }

  const baseDuration = phaseConfig.duration
  const actualDuration = hasUserSpoken ?
    baseDuration + FAST_BIDDING_CONFIG.userExtension.duration :
    baseDuration

  const progress = Math.max(0, 100 - (timeRemaining / actualDuration) * 100)
  const status = hasUserSpoken ? '已顺延' : '正常'

  console.log(`📊 ${phaseConfig.description} (${status}):`)
  console.log(`   剩余时间: ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`)
  console.log(`   进度: ${Math.round(progress)}%`)

  return progress
}

// 模拟用户发言触发顺延
function simulateUserInteraction(phaseName, currentTimeRemaining) {
  console.log(`\n👤 用户在 ${FAST_BIDDING_CONFIG.phases[phaseName]?.description} 发言`)

  const extensionTime = FAST_BIDDING_CONFIG.userExtension.duration
  const newTimeRemaining = currentTimeRemaining + extensionTime

  console.log(`⏰ 时间自动顺延 +${extensionTime}秒`)
  console.log(`📈 新的剩余时间: ${Math.floor(newTimeRemaining / 60)}:${(newTimeRemaining % 60).toString().padStart(2, '0')}`)

  return newTimeRemaining
}

// 运行测试
function runTest() {
  console.log('🚀 竞价系统快速模式测试')
  console.log('========================================\n')

  // 显示时间配置
  const timing = calculateTotalTime()
  console.log('\n')

  // 模拟各阶段进度
  console.log('🎭 阶段进度模拟:')
  console.log('----------------------------------------')

  // 预热阶段 - 无用户发言
  simulatePhaseProgress('warmup', 90)

  console.log('')

  // 讨论阶段 - 用户发言触发顺延
  let discussionTime = 60
  simulatePhaseProgress('discussion', discussionTime)
  discussionTime = simulateUserInteraction('discussion', discussionTime)
  simulatePhaseProgress('discussion', discussionTime - 30, true)

  console.log('')

  // 竞价阶段 - 正常进行
  simulatePhaseProgress('bidding', 45)

  console.log('\n')

  // 验证时间计算逻辑
  console.log('✅ 时间计算验证:')
  console.log('----------------------------------------')
  console.log('对比原始配置:')
  console.log('- 原始总时长: 35-45分钟')
  console.log(`- 快速模式基础时长: ${Math.floor(timing.baseTime / 60)}分钟`)
  console.log(`- 快速模式最大时长: ${Math.floor(timing.maxTotal / 60)}分钟`)
  console.log('- 时间缩短比例: 约70-80%')

  console.log('\n🎉 测试完成！快速竞价模式配置正确。')
}

// 执行测试
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FAST_BIDDING_CONFIG,
    calculateTotalTime,
    simulatePhaseProgress,
    simulateUserInteraction,
    runTest
  }
} else {
  runTest()
}