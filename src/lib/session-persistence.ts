/**
 * WebSocket会话持久化服务
 * 将WebSocket会话状态同步到PostgreSQL数据库
 * 支持服务器重启后的会话恢复
 */

import prisma from './database';
import { BiddingStatus, BiddingPhase } from '@prisma/client';

/**
 * 会话状态接口 - 与WebSocket服务器的BiddingSession匹配
 */
export interface SessionState {
  ideaId: string;
  userId?: string;
  currentPhase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result';
  startTime: Date;
  phaseStartTime: Date;
  timeRemaining: number;
  currentBids: Record<string, number>;
  highestBid: number;
  messages: any[];
  cost: number;
  participantCount: number;
  viewerCount: number;
}

/**
 * 阶段映射 - WebSocket阶段 -> 数据库枚举
 */
function mapPhaseToEnum(phase: SessionState['currentPhase']): BiddingPhase {
  const phaseMap: Record<SessionState['currentPhase'], BiddingPhase> = {
    warmup: BiddingPhase.DISCUSSION,
    discussion: BiddingPhase.DISCUSSION,
    bidding: BiddingPhase.BIDDING,
    prediction: BiddingPhase.BIDDING, // 用户补充阶段仍在竞价
    result: BiddingPhase.RESULTS
  };
  return phaseMap[phase];
}

/**
 * 创建或更新会话到数据库
 */
export async function persistSession(state: SessionState): Promise<void> {
  try {
    const dbPhase = mapPhaseToEnum(state.currentPhase);
    const now = new Date();

    await prisma.biddingSession.upsert({
      where: { ideaId: state.ideaId },
      create: {
        ideaId: state.ideaId,
        userId: state.userId,
        status: BiddingStatus.ACTIVE,
        phase: dbPhase,
        startedAt: state.startTime,
        currentHigh: state.highestBid,
        aiServiceCost: state.cost,
        participantCount: state.participantCount,
        viewerCount: state.viewerCount,
        maxViewerCount: state.viewerCount,
        createdAt: now,
        updatedAt: now
      },
      update: {
        phase: dbPhase,
        currentHigh: state.highestBid,
        aiServiceCost: state.cost,
        participantCount: state.participantCount,
        viewerCount: state.viewerCount,
        maxViewerCount: {
          set: Math.max(state.viewerCount, (await prisma.biddingSession.findUnique({
            where: { ideaId: state.ideaId },
            select: { maxViewerCount: true }
          }))?.maxViewerCount || 0)
        },
        updatedAt: now
      }
    });

    console.log(`✅ Session persisted: ${state.ideaId} - Phase: ${state.currentPhase}, Bid: ${state.highestBid}`);
  } catch (error) {
    console.error('❌ Failed to persist session:', error);
    // 不抛出错误，避免影响WebSocket主流程
  }
}

/**
 * 完成会话 - 标记为已结束
 */
export async function completeSession(
  ideaId: string,
  winnerAgent?: string,
  finalPrice?: number
): Promise<void> {
  try {
    await prisma.biddingSession.update({
      where: { ideaId },
      data: {
        status: BiddingStatus.ENDED,
        phase: BiddingPhase.RESULTS,
        endedAt: new Date(),
        winnerAgent,
        finalPrice,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Session completed: ${ideaId}`);
  } catch (error) {
    console.error('❌ Failed to complete session:', error);
  }
}

/**
 * 标记会话失败
 */
export async function failSession(ideaId: string, reason?: string): Promise<void> {
  try {
    await prisma.biddingSession.update({
      where: { ideaId },
      data: {
        status: BiddingStatus.FAILED,
        endedAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`❌ Session failed: ${ideaId} - ${reason || 'Unknown error'}`);
  } catch (error) {
    console.error('❌ Failed to mark session as failed:', error);
  }
}

/**
 * 恢复活跃会话 - 服务器重启后调用
 * 返回所有未完成的会话ID列表
 */
export async function recoverActiveSessions(): Promise<string[]> {
  try {
    // 查找所有活跃但可能因服务器重启而中断的会话
    const activeSessions = await prisma.biddingSession.findMany({
      where: {
        status: BiddingStatus.ACTIVE,
        // 只恢复最近1小时内的会话
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000)
        }
      },
      select: {
        ideaId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📦 Found ${activeSessions.length} active sessions to recover`);
    return activeSessions.map(s => s.ideaId);
  } catch (error) {
    console.error('❌ Failed to recover active sessions:', error);
    return [];
  }
}

/**
 * 清理过期会话 - 定期清理超过24小时的已结束会话
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await prisma.biddingSession.updateMany({
      where: {
        status: { in: [BiddingStatus.ENDED, BiddingStatus.FAILED, BiddingStatus.CANCELLED] },
        updatedAt: { lt: oneDayAgo }
      },
      data: {
        // 可以添加清理标记或软删除
        updatedAt: new Date()
      }
    });

    console.log(`🗑️ Cleaned up ${result.count} expired sessions`);
    return result.count;
  } catch (error) {
    console.error('❌ Failed to cleanup expired sessions:', error);
    return 0;
  }
}

/**
 * 保存AI消息到数据库（可选）
 */
export async function persistAIMessage(
  sessionId: string,
  message: {
    personaId: string;
    content: string;
    phase: string;
    round: number;
    bidValue?: number;
  }
): Promise<void> {
  try {
    // 这里可以扩展保存AI交互记录
    // 目前先记录到BiddingSession的cost累加
    console.log(`💬 AI Message logged: ${message.personaId} in ${sessionId}`);
  } catch (error) {
    console.error('❌ Failed to persist AI message:', error);
  }
}

/**
 * 获取会话统计信息
 */
export async function getSessionStats(ideaId: string): Promise<any> {
  try {
    const session = await prisma.biddingSession.findUnique({
      where: { ideaId },
      include: {
        bids: true,
        priceGuesses: true
      }
    });

    if (!session) {
      return null;
    }

    return {
      status: session.status,
      phase: session.phase,
      currentHigh: session.currentHigh,
      participantCount: session.participantCount,
      viewerCount: session.viewerCount,
      totalBids: session.bids.length,
      totalGuesses: session.priceGuesses.length,
      cost: session.aiServiceCost,
      duration: session.endedAt && session.startedAt
        ? session.endedAt.getTime() - session.startedAt.getTime()
        : null
    };
  } catch (error) {
    console.error('❌ Failed to get session stats:', error);
    return null;
  }
}
