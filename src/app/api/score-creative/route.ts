// 创意成熟度评分 API
// Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md v4.1 (Task 6)

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MaturityScorer } from '@/lib/business-plan/maturity-scorer';
import { WeightConfigManager } from '@/lib/business-plan/weight-config-manager';
import type { AIMessage, BidRecord } from '@/types/maturity-score';

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

/**
 * POST /api/score-creative
 *
 * 为创意评分并保存结果
 * Spec: Lines 1792-1903 (计费时机与失败回滚)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, ideaContent, aiMessages, bids, userId } = body;

    // 1. 验证必要参数
    if (!ideaId) {
      return NextResponse.json(
        { error: 'ideaId is required' },
        { status: 400 }
      );
    }

    // 2. 检查是否已评分（幂等性保护）
    const existingScore = await prisma.creativeMaturityAdvice.findFirst({
      where: {
        ideaId,
        expiresAt: { gte: new Date() }
      }
    });

    if (existingScore) {
      console.log(`Idea ${ideaId} already scored, returning cached result`);
      return NextResponse.json({
        success: true,
        result: {
          totalScore: existingScore.maturityScore,
          level: existingScore.maturityLevel,
          dimensions: existingScore.dimensions,
          expertConsensus: existingScore.expertConsensus,
          confidence: existingScore.confidence,
          scoringReasons: existingScore.scoringReasons,
          validSignals: existingScore.validSignals,
          invalidSignals: existingScore.invalidSignals,
          scoringVersion: existingScore.scoringVersion,
          weakDimensions: existingScore.weakDimensions,
          cached: true
        }
      });
    }

    // 3. 获取当前激活的权重配置
    const weightManager = new WeightConfigManager();
    const config = await weightManager.getActiveWeightConfig(userId);

    // 4. 执行评分
    const scorer = new MaturityScorer(config.weights, config.thresholds);

    // 转换输入数据为标准格式
    const formattedMessages: AIMessage[] = (aiMessages || []).map((msg: any) => ({
      id: msg.id || `msg-${Date.now()}`,
      agentName: msg.agentName || msg.agent_name || 'Unknown',
      agentType: msg.agentType || msg.agent_type || 'Unknown',
      content: msg.content || '',
      phase: msg.phase || 'discussion',
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    }));

    const formattedBids: Record<string, number> = bids || {};

    const result = scorer.analyze(formattedMessages, formattedBids);

    // 5. 保存评分结果（默认7天后过期）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // +7天

    const savedAdvice = await prisma.creativeMaturityAdvice.create({
      data: {
        ideaId,
        userId: userId || null,
        maturityScore: result.totalScore,
        maturityLevel: result.level,
        dimensions: result.dimensions as any,
        confidence: result.confidence,
        expertAdvice: {}, // 将在后续任务中填充
        weakDimensions: result.weakDimensions,
        expertConsensus: result.expertConsensus as any,
        validSignals: result.validSignals as any,
        invalidSignals: result.invalidSignals as any,
        scoringReasons: result.scoringReasons as any,
        scoringVersion: result.scoringVersion,
        expiresAt,
        createdAt: new Date()
      }
    });

    console.log(`✅ Created maturity score for idea ${ideaId}: ${result.totalScore}/10 (${result.level})`);

    // 6. 返回评分结果
    return NextResponse.json({
      success: true,
      result: {
        ...result,
        adviceId: savedAdvice.id,
        expiresAt: savedAdvice.expiresAt
      }
    });

  } catch (error) {
    console.error('Scoring failed:', error);

    return NextResponse.json(
      {
        error: 'Failed to score creative maturity',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/score-creative?ideaId={ideaId}
 *
 * 获取已保存的评分结果
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');

    if (!ideaId) {
      return NextResponse.json(
        { error: 'ideaId query parameter is required' },
        { status: 400 }
      );
    }

    // 查找最新的有效评分
    const advice = await prisma.creativeMaturityAdvice.findFirst({
      where: {
        ideaId,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!advice) {
      return NextResponse.json(
        { error: 'No valid maturity score found for this idea' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      result: {
        totalScore: advice.maturityScore,
        level: advice.maturityLevel,
        dimensions: advice.dimensions,
        expertConsensus: advice.expertConsensus,
        confidence: advice.confidence,
        scoringReasons: advice.scoringReasons,
        validSignals: advice.validSignals,
        invalidSignals: advice.invalidSignals,
        scoringVersion: advice.scoringVersion,
        weakDimensions: advice.weakDimensions,
        expiresAt: advice.expiresAt,
        createdAt: advice.createdAt
      }
    });

  } catch (error) {
    console.error('Failed to fetch maturity score:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch maturity score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/score-creative?ideaId={ideaId}
 *
 * 立即删除评分数据（用户数据删除权）
 * Spec: Lines 2080-2110 (GDPR删除权)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ideaId = searchParams.get('ideaId');
    const userId = searchParams.get('userId');

    if (!ideaId || !userId) {
      return NextResponse.json(
        { error: 'ideaId and userId query parameters are required' },
        { status: 400 }
      );
    }

    // 验证权限（只有创意所有者可删除）
    const advice = await prisma.creativeMaturityAdvice.findFirst({
      where: { ideaId, userId }
    });

    if (!advice) {
      return NextResponse.json(
        { error: 'No maturity score found or unauthorized' },
        { status: 404 }
      );
    }

    // 删除评分数据
    await prisma.creativeMaturityAdvice.delete({
      where: { id: advice.id }
    });

    // 同时删除问卷草稿
    await prisma.questionnaireDraft.deleteMany({
      where: { ideaId, userId }
    });

    console.log(`🗑️ User ${userId} deleted maturity score for idea ${ideaId}`);

    return NextResponse.json({
      success: true,
      message: 'Maturity score data deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete maturity score:', error);

    return NextResponse.json(
      {
        error: 'Failed to delete maturity score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
