import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const authResult = await getUserFromToken(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    const user = authResult.user

    const { title, description, category } = await req.json()

    if (!title?.trim() || !description?.trim() || !category) {
      return NextResponse.json({ error: '标题、描述和分类不能为空' }, { status: 400 })
    }

    // 检查用户积分和提交限制
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!userData) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 简单的提交限制检查（这里可以添加更复杂的逻辑）
    const todaySubmissions = await prisma.idea.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const isFreeSubmission = todaySubmissions < 3
    const submissionCost = isFreeSubmission ? 0 : 50

    if (!isFreeSubmission && userData.credits < submissionCost) {
      return NextResponse.json({ error: '积分不足' }, { status: 400 })
    }

    // 创建创意
    const idea = await prisma.idea.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category as any,
        userId: user.id,
        status: 'PENDING'
      }
    })

    // 计算奖励积分
    const baseReward = 10
    const qualityBonus = Math.floor(description.length / 100) * 5 // 根据描述长度给奖励
    const earnedCredits = baseReward + qualityBonus

    // 更新用户积分
    const newCredits = userData.credits - submissionCost + earnedCredits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: newCredits }
    })

    // 记录积分交易
    if (submissionCost > 0) {
      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -submissionCost,
          type: 'RESEARCH_COST',
          description: `创意提交 - ${title}`,
          relatedId: idea.id,
          balanceBefore: userData.credits,
          balanceAfter: userData.credits - submissionCost
        }
      })
    }

    // 奖励积分记录
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: earnedCredits,
        type: 'RESEARCH_COST', // 临时使用，实际项目中可以添加新的类型
        description: `创意提交奖励 - ${title}`,
        relatedId: idea.id,
        balanceBefore: userData.credits - submissionCost,
        balanceAfter: newCredits
      }
    })

    return NextResponse.json({
      success: true,
      idea: {
        id: idea.id,
        title: idea.title,
        category: idea.category
      },
      submissionResult: {
        cost: submissionCost,
        isFree: isFreeSubmission,
        earnedCredits,
        ideaId: idea.id
      }
    })

  } catch (error) {
    console.error('提交创意失败:', error)
    return NextResponse.json({ error: '提交创意失败' }, { status: 500 })
  }
}