import { NextRequest, NextResponse } from 'next/server'
import { callDeepSeekAPI } from '@/lib/ai/deepseek-client'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ideaContent,
      userRequest,
      technicalStack = ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      conversationHistory = []
    } = body

    // 构建系统提示词
    const systemPrompt = `你是一个专业的前端开发工程师，专注于 MVP（最小可行产品）快速开发。

技术栈：${technicalStack.join(', ')}

你的任务是根据用户的创意和需求，生成高质量的前端代码。

要求：
1. 代码必须是完整可运行的
2. 使用最佳实践和现代化的开发模式
3. 包含必要的类型定义（TypeScript）
4. 使用 Tailwind CSS 进行样式设计
5. 代码要有良好的可读性和注释
6. 遵循 Next.js 14 App Router 规范

创意背景：${ideaContent}

请根据用户的具体请求生成代码。`

    // 构建用户消息
    const userMessage = `请生成以下功能的前端代码：

${userRequest}

要求：
- 生成完整的 React 组件代码
- 使用 TypeScript 类型定义
- 包含必要的状态管理
- 使用 Tailwind CSS 样式
- 添加适当的注释说明

请直接输出代码，不要添加额外的解释文字。`

    // 调用 DeepSeek API 生成代码
    const aiResponse = await callDeepSeekAPI(
      [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversationHistory.slice(-5).map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ],
      {
        temperature: 0.7,
        max_tokens: 4000
      }
    )

    // 提取生成的代码
    let generatedCode = aiResponse.content

    // 清理代码（移除markdown代码块标记）
    generatedCode = generatedCode
      .replace(/```typescript\n/g, '')
      .replace(/```tsx\n/g, '')
      .replace(/```jsx\n/g, '')
      .replace(/```\n/g, '')
      .replace(/```$/g, '')
      .trim()

    // 生成代码说明
    const explanation = `已为您生成 ${userRequest} 的代码实现。

代码特点：
- 使用 React 18 和 Next.js 14 最新特性
- TypeScript 类型安全
- Tailwind CSS 响应式设计
- 组件化架构

您可以：
1. 复制代码到您的项目
2. 根据需要进行调整
3. 继续请求其他功能的实现`

    return NextResponse.json({
      success: true,
      code: generatedCode,
      explanation,
      metadata: {
        technicalStack,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('代码生成失败:', error)

    return NextResponse.json(
      {
        success: false,
        error: '代码生成失败，请稍后重试',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
