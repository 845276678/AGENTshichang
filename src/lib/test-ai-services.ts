// AI服务集成测试脚本
import AIServiceFactory, { AIProvider } from './ai-services'

interface TestResult {
  provider: AIProvider
  service: string
  success: boolean
  error?: string
  response?: string
  usage?: any
}

async function testAIServices(): Promise<TestResult[]> {
  const results: TestResult[] = []

  const providers = Object.values(AIProvider)
  const testPrompt = '你好，请简单介绍一下自己。'

  console.log('🤖 开始测试AI服务集成...\n')

  for (const provider of providers) {
    console.log(`测试 ${provider} 服务...`)

    try {
      const service = AIServiceFactory.getService(provider)
      const modelInfo = service.getModelInfo()

      // 健康检查
      const isHealthy = await service.healthCheck()
      if (!isHealthy) {
        results.push({
          provider,
          service: modelInfo.model,
          success: false,
          error: '服务健康检查失败'
        })
        continue
      }

      // 实际调用测试
      const response = await service.chat(testPrompt, {
        temperature: 0.7,
        maxTokens: 100
      })

      results.push({
        provider,
        service: modelInfo.model,
        success: true,
        response: response.content.substring(0, 50) + '...',
        usage: response.usage
      })

      console.log(`✅ ${provider} 测试成功`)

    } catch (error) {
      results.push({
        provider,
        service: 'Unknown',
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      })

      console.log(`❌ ${provider} 测试失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  return results
}

// 测试负载均衡
async function testLoadBalancing(): Promise<void> {
  console.log('\n🔄 测试负载均衡...')

  try {
    const healthyServices = await AIServiceFactory.getHealthyServices()
    console.log(`可用服务: ${healthyServices.join(', ')}`)

    if (healthyServices.length > 0) {
      const balancedService = await AIServiceFactory.getBalancedService()
      const response = await balancedService.chat('测试负载均衡', { maxTokens: 50 })
      console.log(`✅ 负载均衡测试成功: ${response.content.substring(0, 30)}...`)
    } else {
      console.log('❌ 没有可用的健康服务')
    }
  } catch (error) {
    console.log(`❌ 负载均衡测试失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 测试所有服务信息
async function testServiceInfo(): Promise<void> {
  console.log('\n📊 获取所有服务信息...')

  try {
    const availableServices = await AIServiceFactory.getAvailableServices()

    console.log('\n服务状态汇总:')
    console.log('=' .repeat(80))

    availableServices.forEach((service, index) => {
      const status = service.isHealthy ? '🟢 健康' : '🔴 不可用'
      console.log(`${index + 1}. ${service.provider} - ${status}`)

      if (service.modelInfo) {
        console.log(`   模型: ${service.modelInfo.model}`)
        console.log(`   提供商: ${service.modelInfo.provider}`)
        console.log(`   最大令牌: ${service.modelInfo.maxTokens}`)
        console.log(`   功能: ${service.modelInfo.capabilities.join(', ')}`)
      }
      console.log()
    })
  } catch (error) {
    console.log(`❌ 获取服务信息失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  console.log('🚀 AI服务集成测试开始...\n')

  testAIServices()
    .then(async (results) => {
      console.log('\n📋 测试结果汇总:')
      console.log('=' .repeat(60))

      let successCount = 0
      const totalCount = results.length

      results.forEach((result, index) => {
        const status = result.success ? '✅ 成功' : '❌ 失败'
        console.log(`${index + 1}. ${result.provider} (${result.service}): ${status}`)

        if (result.response) {
          console.log(`   响应: ${result.response}`)
        }

        if (result.usage) {
          console.log(`   令牌使用: ${result.usage.totalTokens} (输入: ${result.usage.promptTokens}, 输出: ${result.usage.completionTokens})`)
        }

        if (result.error) {
          console.log(`   错误: ${result.error}`)
        }

        if (result.success) {successCount++}
        console.log()
      })

      console.log('=' .repeat(60))
      console.log(`🎯 测试总结: ${successCount}/${totalCount} 个服务可用`)

      // 继续测试其他功能
      await testLoadBalancing()
      await testServiceInfo()

      if (successCount === totalCount) {
        console.log('\n🎉 所有AI服务测试通过！AI服务集成完成。')
        process.exit(0)
      } else {
        console.log(`\n⚠️  有 ${totalCount - successCount} 个服务不可用，请检查配置。`)

        console.log('\n💡 配置提示:')
        console.log('请确保在环境变量中设置以下API密钥:')
        console.log('- BAIDU_API_KEY 和 BAIDU_SECRET_KEY (百度文心)')
        console.log('- XUNFEI_APP_ID, XUNFEI_API_SECRET 和 XUNFEI_API_KEY (讯飞星火)')
        console.log('- DASHSCOPE_API_KEY (阿里通义千问)')
        console.log('- TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY (腾讯混元)')
        console.log('- ZHIPU_API_KEY (智谱GLM)')

        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('💥 测试运行失败:', error)
      process.exit(1)
    })
}

export { testAIServices, testLoadBalancing, testServiceInfo }
export default testAIServices