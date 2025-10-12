#!/usr/bin/env node

/**
 * 生产环境DeepSeek MVP功能验证脚本
 * 验证DeepSeek API是否在生产环境正常工作
 */

const PRODUCTION_URL = 'https://aijiayuan.top'

async function verifyDeepSeekIntegration() {
  console.log('🔍 开始验证生产环境DeepSeek MVP功能...\n')

  // 测试1: 健康检查
  console.log('1️⃣ 测试：健康检查')
  try {
    const healthResponse = await fetch(`${PRODUCTION_URL}/api/health/simple`)
    const healthData = await healthResponse.json()
    console.log('   ✅ 健康检查通过:', healthData)
  } catch (error) {
    console.error('   ❌ 健康检查失败:', error.message)
  }

  // 测试2: 生成功能性MVP
  console.log('\n2️⃣ 测试：DeepSeek生成功能性MVP')
  try {
    const mvpRequest = {
      ideaTitle: '测试MVP生成',
      ideaDescription: '这是一个测试DeepSeek API生成功能性MVP的请求',
      targetUsers: ['测试用户'],
      coreFeatures: ['测试功能1', '测试功能2', '测试功能3'],
      industryType: '测试行业',
      designPreferences: {
        colorScheme: 'blue',
        style: 'modern'
      }
    }

    console.log('   📤 发送请求到:', `${PRODUCTION_URL}/api/business-plan/modules/mvp-prototype`)
    const startTime = Date.now()

    const mvpResponse = await fetch(`${PRODUCTION_URL}/api/business-plan/modules/mvp-prototype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mvpRequest)
    })

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    if (!mvpResponse.ok) {
      const errorText = await mvpResponse.text()
      console.error(`   ❌ API调用失败 (${mvpResponse.status}):`, errorText)
      return false
    }

    const mvpData = await mvpResponse.json()

    if (!mvpData.success) {
      console.error('   ❌ MVP生成失败:', mvpData.error)
      return false
    }

    const htmlCode = mvpData.data?.prototype?.htmlCode
    const htmlLength = htmlCode ? htmlCode.length : 0

    console.log('   ✅ MVP生成成功!')
    console.log(`   ⏱️  生成耗时: ${duration}秒`)
    console.log(`   📏 HTML代码长度: ${htmlLength} 字符`)
    console.log(`   🔧 元数据:`, {
      generatedAt: mvpData.data?.prototype?.metadata?.generatedAt,
      templateUsed: mvpData.data?.prototype?.metadata?.templateUsed,
      technologyStack: mvpData.data?.prototype?.metadata?.technologyStack
    })

    // 检查是否使用了DeepSeek (功能性代码长度通常更长)
    if (htmlLength > 5000) {
      console.log('   🤖 可能使用了DeepSeek生成 (代码较长且复杂)')
    } else {
      console.log('   📝 可能使用了模板降级 (代码较短)')
    }

  } catch (error) {
    console.error('   ❌ 测试失败:', error.message)
    return false
  }

  // 测试3: 修改功能测试
  console.log('\n3️⃣ 测试：修改现有MVP')
  try {
    const modifyRequest = {
      ideaTitle: '测试修改',
      ideaDescription: '测试修改功能',
      targetUsers: ['测试用户'],
      coreFeatures: ['功能1'],
      industryType: '测试',
      modificationContext: {
        currentVersion: 1,
        previousHtmlCode: '<html><body><h1>测试</h1></body></html>',
        modificationRequest: '修改标题为"新标题"',
        focusOnChanges: true
      }
    }

    const modifyResponse = await fetch(`${PRODUCTION_URL}/api/business-plan/modules/mvp-prototype`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modifyRequest)
    })

    if (!modifyResponse.ok) {
      console.error('   ❌ 修改测试失败')
      return false
    }

    const modifyData = await modifyResponse.json()
    const modifiedHtml = modifyData.data?.prototype?.htmlCode || ''

    if (modifiedHtml.includes('新标题')) {
      console.log('   ✅ 修改功能正常工作')
    } else {
      console.log('   ⚠️  修改功能可能未生效')
    }

  } catch (error) {
    console.error('   ❌ 修改测试失败:', error.message)
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ 验证完成！')
  console.log('='.repeat(60))
  console.log('\n💡 建议:')
  console.log('1. 访问 https://aijiayuan.top/business-plan/modular 测试完整流程')
  console.log('2. 在浏览器控制台查看详细的API调用日志')
  console.log('3. 检查Zeabur部署日志确认DeepSeek API调用情况')
  console.log('\n📚 文档: 查看 DEEPSEEK_MVP_INTEGRATION.md 了解更多信息')
}

// 运行验证
verifyDeepSeekIntegration().catch(error => {
  console.error('❌ 验证过程出错:', error)
  process.exit(1)
})
