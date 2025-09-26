// 模拟WebSocket服务器端点
// 在真实生产环境中，这将是一个独立的WebSocket服务

import { NextRequest } from 'next/server';
import { WebSocket, WebSocketServer } from 'ws';
import { AI_PERSONAS, PHASE_STRATEGIES } from '@/lib/ai-persona-system';

// 模拟会话数据存储
interface BiddingSession {
  id: string;
  ideaId: string;
  currentPhase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result';
  startTime: Date;
  phaseStartTime: Date;
  timeRemaining: number;
  participants: Set<string>;
  currentBids: Record<string, number>;
  highestBid: number;
  messages: any[];
  cost: number;
}

const activeSessions = new Map<string, BiddingSession>();
const connectedClients = new Map<string, WebSocket>();

// 创建或获取会话
function getOrCreateSession(ideaId: string): BiddingSession {
  if (!activeSessions.has(ideaId)) {
    const session: BiddingSession = {
      id: ideaId,
      ideaId,
      currentPhase: 'warmup',
      startTime: new Date(),
      phaseStartTime: new Date(),
      timeRemaining: 120, // 2分钟预热
      participants: new Set(),
      currentBids: {},
      highestBid: 50,
      messages: [],
      cost: 0
    };

    activeSessions.set(ideaId, session);
    startSessionTimer(session);
  }

  return activeSessions.get(ideaId)!;
}

// 启动会话计时器
function startSessionTimer(session: BiddingSession) {
  const timer = setInterval(() => {
    session.timeRemaining -= 1;

    // 广播时间更新
    broadcastToSession(session.ideaId, {
      type: 'timer.update',
      payload: {
        remaining: session.timeRemaining,
        phase: session.currentPhase
      }
    });

    // 阶段切换逻辑
    if (session.timeRemaining <= 0) {
      const phases = ['warmup', 'discussion', 'bidding', 'prediction', 'result'];
      const currentIndex = phases.indexOf(session.currentPhase);

      if (currentIndex < phases.length - 1) {
        const nextPhase = phases[currentIndex + 1] as any;
        session.currentPhase = nextPhase;
        session.phaseStartTime = new Date();

        // 设置下一阶段的时长
        const phaseDurations = {
          warmup: 2 * 60,
          discussion: 12 * 60,
          bidding: 20 * 60,
          prediction: 4 * 60,
          result: 5 * 60
        };

        session.timeRemaining = phaseDurations[nextPhase];

        // 广播阶段切换
        broadcastToSession(session.ideaId, {
          type: 'stage.started',
          payload: {
            phase: nextPhase,
            duration: session.timeRemaining,
            timestamp: Date.now()
          }
        });

        // 启动该阶段的AI对话
        startPhaseDialogue(session);
      } else {
        // 会话结束
        clearInterval(timer);
        endSession(session);
      }
    }

    // 随机生成AI对话
    if (Math.random() < getDialogueProbability(session.currentPhase)) {
      generateAIDialogue(session);
    }

  }, 1000);
}

// 获取对话概率（不同阶段不同频率）
function getDialogueProbability(phase: string): number {
  switch (phase) {
    case 'warmup': return 0.05;
    case 'discussion': return 0.1;
    case 'bidding': return 0.15;
    case 'prediction': return 0.08;
    case 'result': return 0.03;
    default: return 0.05;
  }
}

// 启动阶段对话
function startPhaseDialogue(session: BiddingSession) {
  // 立即发送阶段开始消息
  setTimeout(() => {
    generateAIDialogue(session, true);
  }, 2000);
}

// 生成AI对话
function generateAIDialogue(session: BiddingSession, isPhaseStart = false) {
  const persona = AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];

  let content = '';
  let type = 'speech';
  let emotion = 'neutral';
  let bidValue: number | undefined;

  // 根据阶段生成不同内容
  switch (session.currentPhase) {
    case 'warmup':
      content = generateWarmupMessage(persona, isPhaseStart);
      emotion = 'excited';
      break;
    case 'discussion':
      content = generateDiscussionMessage(persona, isPhaseStart);
      emotion = 'confident';
      break;
    case 'bidding':
      if (Math.random() > 0.7) {
        type = 'bid';
        const currentBid = session.currentBids[persona.id] || 50;
        bidValue = currentBid + Math.floor(Math.random() * 30) + 10;
        session.currentBids[persona.id] = bidValue;
        session.highestBid = Math.max(session.highestBid, bidValue);
        content = `出价 ${bidValue} 积分！${generateBiddingMessage(persona)}`;
      } else {
        content = generateBiddingMessage(persona);
      }
      emotion = 'excited';
      break;
    case 'prediction':
      content = generatePredictionMessage(persona);
      emotion = 'worried';
      break;
    case 'result':
      content = generateResultMessage(persona);
      emotion = 'happy';
      break;
  }

  const message = {
    messageId: Date.now().toString() + Math.random(),
    personaId: persona.id,
    phase: session.currentPhase,
    round: Math.floor(session.messages.length / 5) + 1,
    content,
    emotion,
    bidValue,
    timestamp: Date.now(),
    cost: Math.random() * 0.02, // 模拟API成本
    tokens: 50 + Math.floor(Math.random() * 100)
  };

  session.messages.push(message);
  session.cost += message.cost || 0;

  // 广播消息
  if (type === 'bid') {
    broadcastToSession(session.ideaId, {
      type: 'bid.placed',
      payload: message
    });
  } else {
    broadcastToSession(session.ideaId, {
      type: 'persona.speech',
      payload: message
    });
  }

  // 更新成本状态
  broadcastToSession(session.ideaId, {
    type: 'cost.update',
    payload: {
      totalCost: session.cost,
      thresholdReached: session.cost > 0.35
    }
  });
}

// AI消息生成函数
function generateWarmupMessage(persona: any, isPhaseStart: boolean): string {
  if (isPhaseStart) {
    return `大家好！我是${persona.name}，很高兴参与这次创意竞价！${persona.catchPhrase}`;
  }

  const templates = [
    `这个创意很有潜力，我从${persona.specialty}的角度来分析...`,
    `让我先了解一下创意的核心价值点`,
    `${persona.catchPhrase}`,
    `基于我的经验，这类项目通常需要考虑...`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateDiscussionMessage(persona: any, isPhaseStart: boolean): string {
  if (isPhaseStart) {
    return `现在进入深度讨论阶段，让我们来详细分析这个创意！`;
  }

  const templates = [
    `我想了解一下技术实现的可行性如何？`,
    `目标用户群体定位是否清晰？`,
    `商业模式的核心竞争优势在哪里？`,
    `市场规模和竞争格局怎样？`,
    `这个创意的差异化价值体现在哪？`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateBiddingMessage(persona: any): string {
  const templates = [
    `这个价格完全无法体现真正的价值！`,
    `我看好这个项目，愿意投入更多！`,
    `从投资回报角度，这个估值太保守了！`,
    `各位，让我们理性竞价！`,
    `基于市场分析，我认为还有上升空间！`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generatePredictionMessage(persona: any): string {
  const price = Math.floor(Math.random() * 200) + 200;
  const templates = [
    `根据我的分析，最终价格应该在${price}积分左右`,
    `市场热度很高，价格可能超出预期`,
    `理性来看，当前估值比较合理`,
    `还有惊喜吗？让我们拭目以待！`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateResultMessage(persona: any): string {
  const templates = [
    `恭喜！这个结果很公平地体现了创意价值`,
    `很棒的竞价过程，期待项目成功！`,
    `市场给出了合理的定价`,
    `感谢大家的参与，下次见！`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// 广播到会话中的所有客户端
function broadcastToSession(ideaId: string, message: any) {
  for (const [clientId, ws] of connectedClients) {
    if (clientId.includes(ideaId) && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send message to client:', error);
        connectedClients.delete(clientId);
      }
    }
  }
}

// 结束会话
function endSession(session: BiddingSession) {
  // 发送结果消息
  broadcastToSession(session.ideaId, {
    type: 'stage.ended',
    payload: {
      finalPrice: session.highestBid,
      winner: findWinner(session),
      totalCost: session.cost,
      timestamp: Date.now()
    }
  });

  // 清理会话数据（保留一段时间用于查询）
  setTimeout(() => {
    activeSessions.delete(session.ideaId);
  }, 30 * 60 * 1000); // 30分钟后清理
}

// 找到获胜者
function findWinner(session: BiddingSession): string {
  let winner = '';
  let highest = 0;

  for (const [personaId, bid] of Object.entries(session.currentBids)) {
    if (bid > highest) {
      highest = bid;
      winner = personaId;
    }
  }

  return winner;
}

// WebSocket连接处理
export function handleBiddingWebSocket(request: NextRequest, ideaId: string) {
  // 注意：这是一个模拟实现
  // 在真实的Next.js环境中，WebSocket需要在自定义服务器中实现

  console.log('WebSocket connection request for idea:', ideaId);

  // 返回连接信息（实际实现需要升级协议）
  return new Response(JSON.stringify({
    message: 'WebSocket endpoint ready',
    ideaId,
    supportedEvents: [
      'client.init',
      'user.reaction',
      'user.support',
      'user.prediction',
      'user.message',
      'heartbeat'
    ]
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// 导出用于测试的函数
export {
  getOrCreateSession,
  generateAIDialogue,
  broadcastToSession,
  activeSessions
};