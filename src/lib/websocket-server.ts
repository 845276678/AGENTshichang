// 真实WebSocket服务器实现
// 处理创意竞价的实时WebSocket连接

import { WebSocket } from 'ws';
import { AI_PERSONAS, PHASE_STRATEGIES } from './ai-persona-system';
import { AIServiceManager, SYSTEM_PROMPTS } from './ai-service-manager';

// 初始化AI服务管理器
const aiServiceManager = new AIServiceManager();

// 生产环境会话数据存储
interface BiddingSession {
  id: string;
  ideaId: string;
  ideaContent?: string; // 添加创意内容字段
  currentPhase: 'warmup' | 'discussion' | 'bidding' | 'prediction' | 'result';
  startTime: Date;
  phaseStartTime: Date;
  timeRemaining: number;
  participants: Set<string>;
  currentBids: Record<string, number>;
  highestBid: number;
  messages: any[];
  cost: number;
  clients: Set<WebSocket>;
}

const activeSessions = new Map<string, BiddingSession>();

// 创建或获取会话
function getOrCreateSession(ideaId: string): BiddingSession {
  if (!activeSessions.has(ideaId)) {
    const session: BiddingSession = {
      id: ideaId,
      ideaId,
      currentPhase: 'warmup',
      startTime: new Date(),
      phaseStartTime: new Date(),
      timeRemaining: 60, // 1分钟预热
      participants: new Set(),
      currentBids: {},
      highestBid: 50,
      messages: [],
      cost: 0,
      clients: new Set()
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
    broadcastToSession(session, {
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

        // 设置下一阶段的时长（调整为更合理的时间）
        const phaseDurations = {
          warmup: 1 * 60,      // 1分钟预热
          discussion: 3 * 60,   // 3分钟讨论
          bidding: 4 * 60,      // 4分钟竞价
          prediction: 2 * 60,   // 2分钟用户补充
          result: 2 * 60        // 2分钟结果展示
        };

        session.timeRemaining = phaseDurations[nextPhase];

        // 广播阶段切换
        broadcastToSession(session, {
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

    // 生成AI对话
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
  setTimeout(() => {
    generateAIDialogue(session, true);
  }, 2000);
}

// 生成AI对话 - 使用真实AI服务
async function generateAIDialogue(session: BiddingSession, isPhaseStart = false) {
  const persona = AI_PERSONAS[Math.floor(Math.random() * AI_PERSONAS.length)];

  let content = '';
  let type = 'speech';
  let emotion = 'neutral';
  let bidValue: number | undefined;

  try {
    // 构建对话上下文
    const context = {
      ideaContent: session.ideaContent || '未提供创意内容',
      phase: session.currentPhase,
      round: Math.floor(session.messages.length / 5) + 1,
      previousContext: session.messages.slice(-3).map((m: any) => ({
        personaId: m.personaId,
        content: m.content
      })),
      isPhaseStart
    };

    // 调用真实AI服务
    const aiResponse = await aiServiceManager.callSingleService({
      provider: persona.primaryModel as any,
      persona: persona.id,
      context,
      systemPrompt: SYSTEM_PROMPTS[persona.id as keyof typeof SYSTEM_PROMPTS] || '',
      temperature: 0.7,
      maxTokens: 200
    });

    content = aiResponse.content;

    // 根据阶段调整类型和情绪
    switch (session.currentPhase) {
      case 'warmup':
        emotion = 'excited';
        break;
      case 'discussion':
        emotion = 'confident';
        break;
      case 'bidding':
        // 竞价阶段可能会出价
        if (Math.random() > 0.7) {
          type = 'bid';
          const currentBid = session.currentBids[persona.id] || 50;
          bidValue = currentBid + Math.floor(Math.random() * 30) + 10;
          session.currentBids[persona.id] = bidValue;
          session.highestBid = Math.max(session.highestBid, bidValue);
          content = `出价 ${bidValue} 积分！${content}`;
        }
        emotion = 'excited';
        break;
      case 'prediction':
        emotion = 'worried';
        break;
      case 'result':
        emotion = 'happy';
        break;
    }

    const message = {
      messageId: Date.now().toString() + Math.random(),
      personaId: persona.id,
      phase: session.currentPhase,
      round: context.round,
      content,
      emotion,
      bidValue,
      timestamp: Date.now(),
      cost: aiResponse.cost,
      tokens: aiResponse.tokens_used
    };

    session.messages.push(message);
    session.cost += aiResponse.cost;

    // 广播消息
    if (type === 'bid') {
      broadcastToSession(session, {
        type: 'bid.placed',
        payload: message
      });
    } else {
      broadcastToSession(session, {
        type: 'persona.speech',
        payload: message
      });
    }

    // 更新成本状态
    broadcastToSession(session, {
      type: 'cost.update',
      payload: {
        totalCost: session.cost,
        thresholdReached: session.cost > 0.35
      }
    });
  } catch (error) {
    console.error('AI对话生成失败:', error);
    // 失败时使用备用模板
    content = generateFallbackMessage(persona, session.currentPhase, isPhaseStart);

    const message = {
      messageId: Date.now().toString() + Math.random(),
      personaId: persona.id,
      phase: session.currentPhase,
      round: Math.floor(session.messages.length / 5) + 1,
      content,
      emotion,
      bidValue,
      timestamp: Date.now(),
      cost: 0,
      tokens: 0
    };

    session.messages.push(message);

    broadcastToSession(session, {
      type: 'persona.speech',
      payload: message
    });
  }
}

// AI消息生成函数 - 备用模板(当AI服务失败时使用)
function generateFallbackMessage(persona: any, phase: string, isPhaseStart: boolean): string {
  if (isPhaseStart) {
    return `大家好！我是${persona.name},很高兴参与这次创意竞价！${persona.catchPhrase}`;
  }

  const templates: Record<string, string[]> = {
    warmup: [
      `这个创意很有潜力，我从${persona.specialty}的角度来分析...`,
      `让我先了解一下创意的核心价值点`,
      `${persona.catchPhrase}`,
      `基于我的经验，这类项目通常需要考虑...`
    ],
    discussion: [
      `我想了解一下技术实现的可行性如何？`,
      `目标用户群体定位是否清晰？`,
      `商业模式的核心竞争优势在哪里？`,
      `市场规模和竞争格局怎样？`,
      `这个创意的差异化价值体现在哪？`
    ],
    bidding: [
      `基于我的专业判断，这个创意值得投入！`,
      `我看好这个项目的潜力！`,
      `这个方向很有前景！`,
      `值得继续深入探索！`
    ],
    prediction: [
      `我预测最终价格会在...`,
      `根据讨论情况，估值应该...`,
      `综合各方面因素考虑...`
    ],
    result: [
      `恭喜！这是个不错的结果！`,
      `期待看到项目的后续发展！`,
      `很高兴能参与这次竞价！`
    ]
  };

  const phaseTemplates = templates[phase] || templates.warmup;
  return phaseTemplates[Math.floor(Math.random() * phaseTemplates.length)];
}

// 保留旧的模板函数作为兼容
function generateWarmupMessage(persona: any, isPhaseStart: boolean): string {
  return generateFallbackMessage(persona, 'warmup', isPhaseStart);
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
function broadcastToSession(session: BiddingSession, message: any) {
  const messageStr = JSON.stringify(message);

  session.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(messageStr);
      } catch (error) {
        console.error('Failed to send message to client:', error);
        session.clients.delete(ws);
      }
    } else {
      session.clients.delete(ws);
    }
  });
}

// 结束会话
function endSession(session: BiddingSession) {
  // 发送结果消息
  broadcastToSession(session, {
    type: 'stage.ended',
    payload: {
      finalPrice: session.highestBid,
      winner: findWinner(session),
      totalCost: session.cost,
      timestamp: Date.now()
    }
  });

  // 清理会话数据
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
export function handleBiddingWebSocket(ws: WebSocket, ideaId: string, query: any) {
  console.log(`WebSocket连接建立: ideaId=${ideaId}`);

  const session = getOrCreateSession(ideaId);
  session.clients.add(ws);

  // 发送当前状态
  ws.send(JSON.stringify({
    type: 'session.init',
    payload: {
      ideaId,
      currentPhase: session.currentPhase,
      timeRemaining: session.timeRemaining,
      currentBids: session.currentBids,
      highestBid: session.highestBid,
      viewerCount: session.clients.size,
      messages: session.messages.slice(-10)
    }
  }));

  // 处理客户端消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleClientMessage(session, ws, message);
    } catch (error) {
      console.error('Failed to parse client message:', error);
    }
  });

  // 处理连接关闭
  ws.on('close', () => {
    session.clients.delete(ws);
    console.log(`WebSocket连接关闭: ideaId=${ideaId}`);
  });

  // 处理错误
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    session.clients.delete(ws);
  });
}

// 处理客户端消息
function handleClientMessage(session: BiddingSession, ws: WebSocket, message: any) {
  switch (message.type) {
    case 'start.bidding':
      // 开始竞价 - 接收创意内容
      if (message.payload && message.payload.ideaContent) {
        session.ideaContent = message.payload.ideaContent;
        console.log('收到创意内容:', session.ideaContent);

        // 确认启动
        ws.send(JSON.stringify({
          type: 'bidding.started',
          payload: {
            ideaId: session.ideaId,
            phase: session.currentPhase,
            timestamp: Date.now()
          }
        }));

        // 立即开始第一轮AI对话
        generateAIDialogue(session, true);
      }
      break;

    case 'user.supplement':
      // 处理用户补充创意
      if (message.payload && message.payload.content) {
        const supplementContent = message.payload.content;
        console.log('收到用户补充:', supplementContent);

        // 将补充内容添加到创意内容中
        session.ideaContent = (session.ideaContent || '') + '\n\n用户补充：' + supplementContent;

        // 广播补充已接收
        broadcastToSession(session, {
          type: 'user.supplement.received',
          payload: {
            content: supplementContent,
            timestamp: Date.now()
          }
        });

        // 触发新一轮AI讨论
        setTimeout(() => {
          generateAIDialogue(session);
        }, 1000);
      }
      break;

    case 'user.reaction':
      // 处理用户反应
      broadcastToSession(session, {
        type: 'user.reaction.received',
        payload: {
          messageId: message.payload.messageId,
          reactionType: message.payload.reactionType,
          timestamp: Date.now()
        }
      });
      break;

    case 'user.support':
      // 处理用户支持
      broadcastToSession(session, {
        type: 'user.support.received',
        payload: {
          personaId: message.payload.personaId,
          timestamp: Date.now()
        }
      });
      break;

    case 'user.prediction':
      // 处理用户预测
      broadcastToSession(session, {
        type: 'user.prediction.received',
        payload: {
          prediction: message.payload.prediction,
          timestamp: Date.now()
        }
      });
      break;

    case 'heartbeat':
      // 心跳响应
      ws.send(JSON.stringify({
        type: 'heartbeat.pong',
        timestamp: Date.now()
      }));
      break;

    default:
      console.log('Unknown message type:', message.type);
  }
}

// 导出用于测试的函数
export {
  getOrCreateSession,
  generateAIDialogue,
  broadcastToSession,
  activeSessions
};