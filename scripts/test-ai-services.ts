import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import { AIServiceFactory } from '../src/lib/ai-services'

async function testAIServices() {
  console.log('🔍 测试AI服务状态...\n')

  // 测试所有可用服务
  const availableServices = await AIServiceFactory.getAvailableServices()
  console.log('📊 AI服务状态:')

  for (const service of availableServices) {
    console.log(`  ${service.provider}: ${service.isHealthy ? '✅ 健康' : '❌ 不可用'}`)
    if (service.modelInfo) {
      console.log(`    模型: ${service.modelInfo.model}`)
    }
  }

  // 测试健康的服务
  const healthyServices = await AIServiceFactory.getHealthyServices()
  console.log(`\n💚 健康的服务: ${healthyServices.join(', ') || '无'}`)

  // 尝试获取平衡服务
  try {
    const service = await AIServiceFactory.getBalancedService()
    console.log(`\n🎯 选择的服务: ${service.getModelInfo().provider}`)

    // 测试生成一个简单的内容
    const response = await service.chat('请生成一个简单的产品创意标题', {
      temperature: 0.7,
      maxTokens: 100
    })

    console.log(`\n📝 测试生成结果:`)
    console.log(`内容: ${response.content}`)
    console.log(`Token使用: ${response.usage.totalTokens}`)

  } catch (error) {
    console.error(`\n❌ AI服务测试失败:`, error)
  }
}

testAIServices().catch(console.error)