/**
 * MVP前端可视化工作坊 - AI代码生成API
 *
 * POST /api/mvp-visualization/generate
 *
 * 功能：
 * 1. 根据frontendRequirements生成初始HTML和CSS代码
 * 2. 使用DeepSeek API进行代码生成
 * 3. 更新会话，保存生成的代码
 * 4. 返回生成的代码和AI说明消息
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callDeepSeekAPI, type Message } from '@/lib/ai/deepseek-client'
import type {
  GenerateInitialCodeRequest,
  GenerateInitialCodeResponse,
  GeneratedCode,
  MVPConversationMessage,
  FrontendRequirements
} from '@/types/mvp-visualization'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body: GenerateInitialCodeRequest = await request.json()
    const { sessionId, frontendRequirements } = body

    // 参数验证
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: '缺少会话ID' },
        { status: 400 }
      )
    }

    console.log(`🎨 开始生成MVP代码 - 会话: ${sessionId}`)

    // 获取会话数据
    const session = await prisma.mVPVisualizationSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      )
    }

    // 如果提供了新的frontendRequirements（手动输入），更新会话
    let requirements: FrontendRequirements
    if (frontendRequirements) {
      requirements = frontendRequirements
      await prisma.mVPVisualizationSession.update({
        where: { id: sessionId },
        data: {
          frontendRequirements: frontendRequirements as any
        }
      })
      console.log('📝 已更新frontendRequirements（手动输入）')
    } else {
      requirements = session.frontendRequirements as FrontendRequirements
    }

    // 构建AI Prompt
    const systemPrompt = `你是一位专业的前端开发专家，擅长根据需求快速生成高质量的HTML和CSS代码。

你的任务：
1. 根据用户提供的前端设计需求，生成完整的HTML结构和CSS样式
2. 代码必须简洁、语义化、响应式
3. 使用现代CSS特性（Flexbox、Grid等）
4. 确保代码可以直接在浏览器中运行
5. 不要使用外部框架（如Bootstrap、Tailwind），纯HTML+CSS

输出格式：
你必须返回两部分内容，使用特殊分隔符：

===HTML===
[HTML代码内容]

===CSS===
[CSS代码内容]

===说明===
[简要说明实现的功能和设计要点]`

    const userPrompt = `请根据以下前端设计需求生成MVP原型代码：

**页面结构**：
${requirements.pageStructure}

**核心交互**：
${requirements.coreInteractions.map((interaction, i) => `${i + 1}. ${interaction}`).join('\n')}

**视觉风格**：
- 配色方案：${requirements.visualStyle.colorScheme}
- 字体风格：${requirements.visualStyle.typography}
- 布局方式：${requirements.visualStyle.layout}

**目标设备**：
${requirements.targetDevices.join('、')}

**参考案例**：
${requirements.referenceExamples}

请生成完整的HTML和CSS代码，确保：
1. HTML结构清晰，使用语义化标签
2. CSS样式美观，符合视觉风格描述
3. 响应式设计，适配目标设备
4. 代码简洁可读，易于后续修改

请按照指定格式返回代码。`

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    // 调用DeepSeek API
    console.log('🤖 调用DeepSeek API生成代码...')
    const startTime = Date.now()

    const aiResponse = await callDeepSeekAPI(messages, {
      temperature: 0.7,
      max_tokens: 6000 // 增加token限制以生成完整代码
    })

    const generationTime = Date.now() - startTime
    console.log(`✅ 代码生成完成，耗时: ${generationTime}ms`)

    // 解析AI返回的代码
    const { html, css, explanation } = parseGeneratedCode(aiResponse.content)

    if (!html || !css) {
      return NextResponse.json(
        { success: false, error: 'AI生成的代码格式不正确，请重试' },
        { status: 500 }
      )
    }

    // 创建GeneratedCode对象
    const generatedCode: GeneratedCode = {
      html,
      css,
      generatedAt: new Date().toISOString(),
      model: 'deepseek-chat',
      generationTime
    }

    // 创建AI说明消息
    const aiMessage: MVPConversationMessage = {
      role: 'assistant',
      content: `我已经根据您的需求生成了初始的MVP原型代码！

${explanation || '代码已生成，您可以在预览区域查看效果。'}

接下来您可以：
1. 在右侧预览区查看实际效果
2. 切换不同设备模式（桌面/平板/手机）查看响应式效果
3. 如果需要调整，请告诉我具体的修改需求

我们有5轮对话的机会来优化界面，请随时提出您的想法！`,
      timestamp: new Date().toISOString(),
      round: 1,
      type: 'initial',
      code: generatedCode
    }

    // 更新会话
    const conversationHistory = session.conversationHistory as any[]
    conversationHistory.push(aiMessage)

    await prisma.mVPVisualizationSession.update({
      where: { id: sessionId },
      data: {
        generatedHTML: html,
        generatedCSS: css,
        conversationHistory: conversationHistory,
        currentRound: 1
      }
    })

    console.log('💾 会话已更新，代码已保存')

    // 返回响应
    const response: GenerateInitialCodeResponse = {
      success: true,
      code: generatedCode,
      aiMessage,
      currentRound: 1
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ MVP代码生成失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '代码生成失败，请重试'
      },
      { status: 500 }
    )
  }
}

/**
 * 解析AI生成的代码
 * 提取HTML、CSS和说明部分
 */
function parseGeneratedCode(content: string): {
  html: string
  css: string
  explanation: string
} {
  // 使用正则表达式提取各部分
  const htmlMatch = content.match(/===HTML===\s*([\s\S]*?)\s*===CSS===/i)
  const cssMatch = content.match(/===CSS===\s*([\s\S]*?)\s*===说明===/i)
  const explanationMatch = content.match(/===说明===\s*([\s\S]*?)$/i)

  // 如果匹配失败，尝试备用解析策略
  if (!htmlMatch || !cssMatch) {
    console.warn('⚠️ 使用备用解析策略')

    // 尝试直接提取代码块
    const htmlCodeBlock = content.match(/```html\s*([\s\S]*?)\s*```/i)
    const cssCodeBlock = content.match(/```css\s*([\s\S]*?)\s*```/i)

    return {
      html: htmlCodeBlock?.[1]?.trim() || '',
      css: cssCodeBlock?.[1]?.trim() || '',
      explanation: '代码已生成'
    }
  }

  return {
    html: htmlMatch[1].trim(),
    css: cssMatch[1].trim(),
    explanation: explanationMatch?.[1]?.trim() || ''
  }
}
