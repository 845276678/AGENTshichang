import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') })

import DeepSeekService from '../src/lib/ai-services/deepseek.service'

async function testDeepSeekSpecific() {
  console.log('🔍 专门测试DeepSeek服务...\n')

  try {
    console.log('环境变量检查:')
    console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '已设置' : '未设置')
    console.log('DEEPSEEK_BASE_URL:', process.env.DEEPSEEK_BASE_URL || '未设置')
    console.log('DEEPSEEK_MODEL:', process.env.DEEPSEEK_MODEL || '未设置')
    console.log('')

    // 创建服务实例
    const service = new DeepSeekService()
    console.log('✅ DeepSeek服务实例创建成功')

    // 获取模型信息
    const modelInfo = service.getModelInfo()
    console.log('📋 模型信息:', modelInfo)
    console.log('')

    // 测试健康检查
    console.log('⚕️ 执行健康检查...')
    const isHealthy = await service.healthCheck()
    console.log('健康状态:', isHealthy ? '✅ 健康' : '❌ 不健康')
    console.log('')

    if (isHealthy) {
      // 如果健康，测试实际调用
      console.log('💬 测试实际API调用...')
      const response = await service.chat('Hello, please respond with a simple greeting in Chinese.')
      console.log('AI响应:', response.content)
      console.log('Token使用:', response.usage)
    }

  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

testDeepSeekSpecific().catch(console.error)