/**
 * MVP前端可视化工作坊 - 启动API
 *
 * POST /api/mvp-visualization/start
 *
 * 功能：
 * 1. 检测是否有关联的创意完善文档
 * 2. 读取refinedDocument.productDetails.frontendDesign
 * 3. 创建MVP工作坊会话
 * 4. 返回会话ID和前端需求
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  extractFrontendDesignFromRefinementDocument,
  validateFrontendRequirements
} from '@/lib/mvp-visualization/utils'
import type {
  StartMVPWorkshopRequest,
  StartMVPWorkshopResponse,
  FrontendRequirements
} from '@/types/mvp-visualization'

export async function POST(request: NextRequest) {
  try {
    const body: StartMVPWorkshopRequest = await request.json()
    const { userId, refinementDocumentId, manualRequirements, source } = body

    // 参数验证
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      )
    }

    if (!source) {
      return NextResponse.json(
        { success: false, error: '缺少数据来源标识' },
        { status: 400 }
      )
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, credits: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    let frontendRequirements: FrontendRequirements | null = null
    let needsManualInput = false
    let isFromBidding = source === 'from-bidding'

    // 场景1: 从创意完善工作坊传递（优先级最高）
    if (refinementDocumentId) {
      console.log(`📖 尝试从创意完善文档读取frontendDesign: ${refinementDocumentId}`)

      frontendRequirements = await extractFrontendDesignFromRefinementDocument(
        refinementDocumentId
      )

      if (frontendRequirements) {
        console.log('✅ 成功读取frontendDesign数据')
        console.log('📊 数据内容:', JSON.stringify(frontendRequirements, null, 2))
      } else {
        console.warn('⚠️ 无法从创意完善文档读取frontendDesign')
        needsManualInput = true
      }
    }

    // 场景2: 用户手动输入（备选方案）
    if (!frontendRequirements && manualRequirements) {
      console.log('📝 使用用户手动输入的frontendRequirements')
      frontendRequirements = manualRequirements

      // 验证手动输入的数据
      const validation = validateFrontendRequirements(frontendRequirements)
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: '前端需求数据不完整',
            errors: validation.errors
          },
          { status: 400 }
        )
      }
    }

    // 场景3: 既没有文档也没有手动输入
    if (!frontendRequirements) {
      console.log('⚠️ 需要用户手动输入前端需求')
      return NextResponse.json<StartMVPWorkshopResponse>({
        success: true,
        sessionId: '', // 暂不创建会话
        needsManualInput: true
      })
    }

    // 检查积分（非竞价来源需要扣费）
    const COST_CREDITS = 10
    if (!isFromBidding && user.credits < COST_CREDITS) {
      return NextResponse.json(
        {
          success: false,
          error: `积分不足，需要${COST_CREDITS}积分，当前余额${user.credits}积分`
        },
        { status: 400 }
      )
    }

    // 创建MVP工作坊会话
    console.log('💾 创建MVP工作坊会话...')
    const session = await prisma.mVPVisualizationSession.create({
      data: {
        userId,
        refinementDocumentId: refinementDocumentId || null,
        frontendRequirements: frontendRequirements as any, // Prisma Json类型
        generatedHTML: '',
        generatedCSS: '',
        conversationHistory: [],
        currentRound: 1,
        adjustmentHistory: [],
        creditsDeducted: isFromBidding ? 0 : COST_CREDITS,
        isFromBidding,
        status: 'IN_PROGRESS'
      }
    })

    console.log(`✅ MVP工作坊会话创建成功: ${session.id}`)

    // 扣除积分（如果需要）
    if (!isFromBidding) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { credits: { decrement: COST_CREDITS } }
        }),
        prisma.creditTransaction.create({
          data: {
            userId,
            amount: -COST_CREDITS,
            type: 'RESEARCH_COST', // 复用现有枚举
            description: 'MVP前端可视化工作坊',
            relatedId: session.id,
            balanceBefore: user.credits,
            balanceAfter: user.credits - COST_CREDITS
          }
        })
      ])
      console.log(`💰 已扣除${COST_CREDITS}积分`)
    } else {
      console.log('🎁 来自竞价，免费使用')
    }

    // 生成初始AI消息
    const initialMessage = {
      role: 'assistant' as const,
      content: `您好！欢迎来到MVP前端可视化工作坊。

我已经成功读取了您在创意完善工作坊中定义的前端设计需求：

**页面结构**：${frontendRequirements.pageStructure}
**核心交互**：${frontendRequirements.coreInteractions.join('、')}
**视觉风格**：${frontendRequirements.visualStyle.colorScheme}
**目标设备**：${frontendRequirements.targetDevices.join('、')}

接下来，我将根据这些需求为您生成初始的HTML和CSS代码。生成完成后，我们可以进行最多5轮对话来优化界面。

准备好了吗？请点击"生成初始代码"按钮开始！`,
      timestamp: new Date().toISOString(),
      round: 1,
      type: 'initial' as const
    }

    // 更新会话，添加初始消息
    await prisma.mVPVisualizationSession.update({
      where: { id: session.id },
      data: {
        conversationHistory: [initialMessage]
      }
    })

    // 返回响应
    const response: StartMVPWorkshopResponse = {
      success: true,
      sessionId: session.id,
      frontendRequirements,
      needsManualInput: false,
      initialMessage
    }

    console.log('✅ MVP工作坊启动成功')
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ MVP工作坊启动失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误'
      },
      { status: 500 }
    )
  }
}
