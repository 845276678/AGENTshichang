// 设置UTF-8编码支持，解决中文乱码问题
process.env.LANG = 'zh_CN.UTF-8'
process.env.LC_ALL = 'zh_CN.UTF-8'

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || process.env.WEB_PORT || 8080;

console.log('🚀 Starting server...');
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔌 Port: ${port}`);
console.log(`🏠 Hostname: ${hostname}`);

// Comprehensive startup validation
console.log('🔍 Running startup checks...');

// 检查关键环境变量
const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
if (missingEnvs.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvs);
  process.exit(1);
}

// 检查Next.js构建文件
const fs = require('fs');
const path = require('path');

const buildManifestPath = path.join(process.cwd(), '.next', 'build-manifest.json');
if (!fs.existsSync(buildManifestPath)) {
  console.error('❌ Next.js build manifest not found. Run `npm run build` first.');
  process.exit(1);
}

console.log('✅ Build manifest found');

// 检查Prisma
try {
  console.log('🗄️  Checking Prisma...');
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ Prisma Client loaded successfully');

  // Test Prisma instantiation
  const testPrisma = new PrismaClient();
  console.log('✅ Prisma Client instantiated successfully');

  // Don't connect here, just validate it can be created
  testPrisma.$disconnect().catch(() => {}); // Ignore disconnect errors

} catch (error) {
  console.error('❌ Prisma Client failed to load:', error.message);
  if (!dev) {
    console.error('💡 Try running: npm run db:generate');
    console.error('💡 Or check DATABASE_URL configuration');
    process.exit(1);
  }
}

const app = next({ dev, hostname: dev ? hostname : undefined, port });
const handle = app.getRequestHandler();

// WebSocket处理器 - 真实AI交互版本
const activeConnections = new Map(); // 存储活跃的WebSocket连接

function handleBiddingWebSocket(ws, ideaId, query) {
  console.log(`🔗 处理WebSocket连接: ideaId=${ideaId}`, {
    query,
    readyState: ws.readyState
  });

  // 将连接存储到活跃连接中
  const connectionId = `${ideaId}_${Date.now()}`;
  activeConnections.set(connectionId, { ws, ideaId, connectedAt: Date.now() });

  // 发送初始状态
  const initMessage = {
    type: 'session.init',
    payload: {
      connectionId,
      ideaId,
      currentPhase: 'warmup',
      timeRemaining: 180,
      currentBids: {},
      highestBid: 0,
      viewerCount: activeConnections.size,
      messages: [],
      status: 'connected'
    }
  };

  try {
    ws.send(JSON.stringify(initMessage));
    console.log(`📤 发送初始化消息给连接 ${connectionId}`);
  } catch (error) {
    console.error(`❌ 发送初始化消息失败:`, error);
  }

  // 处理客户端消息
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('收到客户端消息:', message.type);

      switch (message.type) {
        case 'start_bidding':
          await handleStartBidding(ideaId, message.payload, ws);
          break;

        case 'support_persona':
          await handleSupportPersona(ideaId, message.payload, ws);
          break;

        case 'submit_prediction':
          await handleSubmitPrediction(ideaId, message.payload, ws);
          break;

        case 'supplement_idea':
          await handleIdeaSupplement(ideaId, message.payload, ws);
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;

        default:
          console.log('未知消息类型:', message.type);
      }

    } catch (error) {
      console.error('Failed to parse client message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Invalid message format' }
      }));
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`🔌 WebSocket连接关闭: ideaId=${ideaId}, code=${code}, reason=${reason}`);
    activeConnections.delete(connectionId);

    // 通知其他连接观众数量变化
    broadcastViewerCount(ideaId);
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket错误:', {
      ideaId,
      connectionId,
      error: error.message,
      stack: error.stack
    });
    activeConnections.delete(connectionId);
  });

  // 发送welcome消息确认连接
  setTimeout(() => {
    try {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify({
          type: 'welcome',
          payload: {
            message: `欢迎连接AI竞价系统！ideaId: ${ideaId}`,
            timestamp: Date.now()
          }
        }));
        console.log(`👋 发送欢迎消息给连接 ${connectionId}`);
      }
    } catch (error) {
      console.error('❌ 发送欢迎消息失败:', error);
    }
  }, 1000);
}

// 启动AI竞价
async function handleStartBidding(ideaId, payload, ws) {
  try {
    console.log(`🎭 Starting AI bidding for idea: ${ideaId}`);

    const { ideaContent, sessionId } = payload;

    // 直接调用内部逻辑，避免自循环HTTP请求
    console.log(`🎭 Creating bidding session: ${sessionId} for idea: ${ideaId}`);

    // 通知客户端竞价已启动
    ws.send(JSON.stringify({
      type: 'bidding_started',
      payload: {
        sessionId: sessionId || `session_${Date.now()}_${ideaId}`,
        status: 'active',
        message: 'AI竞价已启动，专家们正在分析您的创意...'
      }
    }));

    // 广播给所有连接到此会话的客户端
    broadcastToSession(ideaId, {
      type: 'session_update',
      payload: {
        phase: 'warmup',
        status: 'active',
        message: 'AI专家团队开始评估创意'
      }
    });

    // 启动真实AI对话流程，如果AI服务不可用则使用模拟流程
    setTimeout(async () => {
      try {
        await startRealAIDiscussion(ideaId, ideaContent);
      } catch (error) {
        console.error('Real AI discussion failed, falling back to simulation:', error);
        simulateAIDiscussion(ideaId, ideaContent);
      }
    }, 3000);

  } catch (error) {
    console.error('Error starting bidding:', error);
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Failed to start AI bidding' }
    }));
  }
}

// 支持AI角色
async function handleSupportPersona(ideaId, payload, ws) {
  const { personaId } = payload;
  console.log(`👍 User supports persona: ${personaId}`);

  // 广播支持信息
  broadcastToSession(ideaId, {
    type: 'persona_supported',
    payload: {
      personaId,
      timestamp: Date.now()
    }
  });
}

// 处理用户创意补充
async function handleIdeaSupplement(ideaId, payload, ws) {
  const { supplementContent, round } = payload;
  console.log(`💡 User supplements idea: ${supplementContent.substring(0, 50)}...`);

  // 广播用户补充信息
  broadcastToSession(ideaId, {
    type: 'user_supplement',
    payload: {
      content: supplementContent,
      round,
      timestamp: Date.now(),
      message: '用户补充了创意细节，AI专家们正在分析...'
    }
  });

  // 让AI专家们回应用户的补充
  try {
    // 动态导入AI服务管理器
    let AIServiceManager;
    try {
      AIServiceManager = require('./src/lib/ai-service-manager.js').default;
    } catch (error) {
      try {
        require('ts-node/register');
        AIServiceManager = require('./src/lib/ai-service-manager.ts').default;
      } catch (tsError) {
        console.error('Failed to load AI service manager:', tsError);
        return;
      }
    }

    const aiServiceManager = new AIServiceManager();

    const aiPersonas = [
      { id: 'tech-pioneer-alex', provider: 'deepseek' },
      { id: 'business-guru-beta', provider: 'zhipu' },
      { id: 'innovation-mentor-charlie', provider: 'qwen' },
      { id: 'market-insight-delta', provider: 'deepseek' },
      { id: 'investment-advisor-ivan', provider: 'zhipu' }
    ];

    // 选择2个AI专家来回应用户补充
    const selectedPersonas = aiPersonas.slice(0, 2);

    for (const persona of selectedPersonas) {
      try {
        const response = await aiServiceManager.callSingleService({
          provider: persona.provider,
          persona: persona.id,
          context: {
            ideaContent: supplementContent,
            phase: 'discussion',
            round: round,
            trigger: 'user_supplement',
            userFeedback: supplementContent
          },
          systemPrompt: getSystemPromptForPersona(persona.id) + '\n\n用户刚刚补充了新的创意信息，请针对这些新信息给出你的专业评价和建议。',
          temperature: 0.7,
          maxTokens: 250
        });

        const message = {
          id: `supplement_response_${Date.now()}_${persona.id}`,
          personaId: persona.id,
          phase: 'discussion',
          round: round,
          type: 'speech',
          content: response.content,
          emotion: determineEmotion(response.content),
          timestamp: new Date(),
          confidence: response.confidence
        };

        broadcastToSession(ideaId, {
          type: 'ai_message',
          message
        });

        console.log(`💬 [SUPPLEMENT] ${persona.id}: ${response.content.substring(0, 60)}...`);

        // AI回应间隔
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));

      } catch (error) {
        console.error(`Error in AI supplement response for ${persona.id}:`, error);
      }
    }

  } catch (error) {
    console.error('Error handling idea supplement:', error);
  }
}

// 提交预测
async function handleSubmitPrediction(ideaId, payload, ws) {
  const { prediction, confidence } = payload;
  console.log(`🔮 User prediction: ${prediction}, confidence: ${confidence}`);

  ws.send(JSON.stringify({
    type: 'prediction_received',
    payload: {
      prediction,
      confidence,
      message: '预测已提交，等待最终结果...'
    }
  }));
}

// 广播给特定会话的所有连接
function broadcastToSession(ideaId, data) {
  let broadcastCount = 0;

  activeConnections.forEach((connection, connectionId) => {
    if (connection.ideaId === ideaId && connection.ws.readyState === 1) { // WebSocket.OPEN = 1
      try {
        connection.ws.send(JSON.stringify(data));
        broadcastCount++;
      } catch (error) {
        console.error('Error broadcasting to connection:', error);
        activeConnections.delete(connectionId);
      }
    }
  });

  console.log(`📡 Broadcasted to ${broadcastCount} connections for idea: ${ideaId}`);
  return broadcastCount;
}

// 广播观众数量更新
function broadcastViewerCount(ideaId) {
  const viewerCount = Array.from(activeConnections.values())
    .filter(conn => conn.ideaId === ideaId).length;

  broadcastToSession(ideaId, {
    type: 'viewer_count_update',
    payload: { viewerCount }
  });
}

// 导出广播函数供API使用
global.broadcastToSession = broadcastToSession;

// 真实AI讨论流程（使用配置的API密钥）
async function startRealAIDiscussion(ideaId, ideaContent) {
  console.log(`🤖 Starting REAL AI discussion for idea: ${ideaId}`);

  // 动态导入AI服务管理器
  let AIServiceManager;
  try {
    // 尝试加载编译后的JS版本
    AIServiceManager = require('./src/lib/ai-service-manager.js').default;
  } catch (error) {
    try {
      // 如果没有编译版本，尝试使用ts-node加载TS版本
      require('ts-node/register');
      AIServiceManager = require('./src/lib/ai-service-manager.ts').default;
    } catch (tsError) {
      console.error('Failed to load AI service manager:', tsError);
      throw new Error('AI service manager not available');
    }
  }

  const aiServiceManager = new AIServiceManager();

  const aiPersonas = [
    { id: 'tech-pioneer-alex', provider: 'deepseek' },
    { id: 'business-guru-beta', provider: 'zhipu' },
    { id: 'innovation-mentor-charlie', provider: 'qwen' },
    { id: 'market-insight-delta', provider: 'deepseek' },
    { id: 'investment-advisor-ivan', provider: 'zhipu' }
  ];

  // 暖场阶段 - 每个AI介绍自己
  for (let i = 0; i < aiPersonas.length; i++) {
    const persona = aiPersonas[i];

    try {
      console.log(`🎭 Calling ${persona.id} via ${persona.provider}...`);

      const response = await aiServiceManager.callSingleService({
        provider: persona.provider,
        persona: persona.id,
        context: {
          ideaContent,
          phase: 'warmup',
          round: 1,
          trigger: 'introduction'
        },
        systemPrompt: getSystemPromptForPersona(persona.id),
        temperature: 0.7,
        maxTokens: 200
      });

      const message = {
        id: `real_msg_${Date.now()}_${i}`,
        personaId: persona.id,
        phase: 'warmup',
        round: 1,
        type: 'speech',
        content: response.content,
        emotion: determineEmotion(response.content),
        timestamp: new Date(),
        confidence: response.confidence,
        tokens: response.tokens_used,
        cost: response.cost
      };

      // 广播真实AI消息
      broadcastToSession(ideaId, {
        type: 'ai_message',
        message
      });

      console.log(`💬 [REAL] ${persona.id}: ${response.content.substring(0, 80)}...`);

      // AI之间间隔5-8秒，给用户充分阅读时间
      await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));

    } catch (error) {
      console.error(`Error calling real AI for ${persona.id}:`, error);

      // 发送备用消息
      const fallbackMessage = {
        id: `fallback_${Date.now()}_${i}`,
        personaId: persona.id,
        phase: 'warmup',
        round: 1,
        type: 'speech',
        content: `大家好，我是${persona.id}的AI专家。这个创意很有意思，让我分析一下...`,
        emotion: 'neutral',
        timestamp: new Date(),
        confidence: 0.5
      };

      broadcastToSession(ideaId, {
        type: 'ai_message',
        message: fallbackMessage
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // 3秒后开始讨论阶段
  setTimeout(async () => {
    await startRealAIDiscussionPhase(ideaId, ideaContent, aiPersonas);
  }, 3000);
}

// 真实AI讨论阶段
async function startRealAIDiscussionPhase(ideaId, ideaContent, aiPersonas) {
  console.log(`💭 Starting REAL AI discussion phase for: ${ideaId}`);

  broadcastToSession(ideaId, {
    type: 'phase_change',
    phase: 'discussion',
    timestamp: Date.now(),
    message: '进入深度讨论阶段'
  });

  // 动态导入AI服务管理器
  let AIServiceManager;
  try {
    AIServiceManager = require('./src/lib/ai-service-manager.js').default;
  } catch (error) {
    try {
      require('ts-node/register');
      AIServiceManager = require('./src/lib/ai-service-manager.ts').default;
    } catch (tsError) {
      console.error('Failed to load AI service manager:', tsError);
      return;
    }
  }

  const aiServiceManager = new AIServiceManager();

  // 进行2轮深度讨论，中间穿插用户互动机会
  for (let round = 1; round <= 2; round++) {
    for (const persona of aiPersonas) {
      try {
        const response = await aiServiceManager.callSingleService({
          provider: persona.provider,
          persona: persona.id,
          context: {
            ideaContent,
            phase: 'discussion',
            round,
            trigger: 'deep_analysis'
          },
          systemPrompt: getSystemPromptForPersona(persona.id),
          temperature: 0.8,
          maxTokens: 300
        });

        const message = {
          id: `real_discussion_${Date.now()}_${round}`,
          personaId: persona.id,
          phase: 'discussion',
          round,
          type: 'speech',
          content: response.content,
          emotion: determineEmotion(response.content),
          timestamp: new Date(),
          confidence: response.confidence
        };

        broadcastToSession(ideaId, {
          type: 'ai_message',
          message
        });

        console.log(`💬 [REAL] Discussion R${round} ${persona.id}: ${response.content.substring(0, 60)}...`);

        await new Promise(resolve => setTimeout(resolve, 6000 + Math.random() * 4000));

      } catch (error) {
        console.error(`Error in real AI discussion for ${persona.id}:`, error);
      }
    }

    // 在每轮讨论后，给用户补充机会
    if (round === 1) {
      console.log('💭 Sending user interaction prompt after round 1');
      broadcastToSession(ideaId, {
        type: 'user_interaction_prompt',
        payload: {
          message: '专家们提出了一些深入的问题，您想补充更多创意细节吗？',
          promptType: 'idea_supplement',
          timeLimit: 60, // 60秒时间限制
          round: round
        }
      });

      // 等待60秒用户补充时间
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  // 5秒后进入竞价阶段
  setTimeout(async () => {
    await startRealAIBiddingPhase(ideaId, ideaContent, aiPersonas);
  }, 5000);
}

// 真实AI竞价阶段
async function startRealAIBiddingPhase(ideaId, ideaContent, aiPersonas) {
  console.log(`💰 Starting REAL AI bidding phase for: ${ideaId}`);

  broadcastToSession(ideaId, {
    type: 'phase_change',
    phase: 'bidding',
    timestamp: Date.now(),
    message: '进入激烈竞价阶段'
  });

  // 动态导入AI服务管理器
  let AIServiceManager;
  try {
    AIServiceManager = require('./src/lib/ai-service-manager.js').default;
  } catch (error) {
    try {
      require('ts-node/register');
      AIServiceManager = require('./src/lib/ai-service-manager.ts').default;
    } catch (tsError) {
      console.error('Failed to load AI service manager:', tsError);
      return;
    }
  }

  const aiServiceManager = new AIServiceManager();

  const currentBids = {};

  for (let round = 1; round <= 2; round++) {
    for (const persona of aiPersonas) {
      try {
        const response = await aiServiceManager.callSingleService({
          provider: persona.provider,
          persona: persona.id,
          context: {
            ideaContent,
            phase: 'bidding',
            round,
            trigger: 'bidding',
            currentBids
          },
          systemPrompt: getSystemPromptForPersona(persona.id) + '\n\n请给出你的竞价，格式：我出价X元，因为...',
          temperature: 0.6,
          maxTokens: 250
        });

        // 从AI回应中提取竞价金额
        const bidAmount = extractBidAmount(response.content);
        currentBids[persona.id] = bidAmount;

        const bidMessage = {
          id: `real_bid_${Date.now()}_${round}`,
          personaId: persona.id,
          phase: 'bidding',
          round,
          type: 'bid',
          content: response.content,
          emotion: 'confident',
          timestamp: new Date(),
          bidValue: bidAmount,
          confidence: response.confidence
        };

        broadcastToSession(ideaId, {
          type: 'ai_bid',
          message: bidMessage,
          currentBids
        });

        console.log(`💰 [REAL] ${persona.id} bid: ${bidAmount}元`);

        await new Promise(resolve => setTimeout(resolve, 7000 + Math.random() * 3000));

      } catch (error) {
        console.error(`Error in real AI bidding for ${persona.id}:`, error);

        // 使用默认竞价
        const defaultBid = 100 + Math.floor(Math.random() * 150);
        currentBids[persona.id] = defaultBid;
      }
    }
  }

  // 3秒后结束竞价
  setTimeout(() => {
    finishRealAIBidding(ideaId, currentBids);
  }, 3000);
}

// 结束真实AI竞价
function finishRealAIBidding(ideaId, bids) {
  const highestBid = Math.max(...Object.values(bids));
  const avgBid = Object.values(bids).reduce((a, b) => a + b, 0) / Object.values(bids).length;

  // 找到获胜者
  const winnerPersonaId = Object.keys(bids).find(personaId => bids[personaId] === highestBid);
  const winnerName = getPersonaName(winnerPersonaId);

  // 生成商业计划会话ID
  const businessPlanSessionId = `bp_${ideaId}_${Date.now()}`;

  // 将商业计划数据存储在全局变量中（生产环境应使用Redis等）
  global.businessPlanSessions = global.businessPlanSessions || new Map();
  global.businessPlanSessions.set(businessPlanSessionId, {
    ideaContent: '用户创意',
    highestBid,
    averageBid: Math.round(avgBid),
    finalBids: bids,
    winner: winnerPersonaId,
    winnerName: winnerName,
    aiMessages: [], // 这里应该收集所有AI消息
    supportedAgents: [],
    currentBids: bids,
    timestamp: Date.now(),
    ideaId
  });

  // 生成简洁的商业计划链接
  const businessPlanUrl = `/business-plan?sessionId=${businessPlanSessionId}&source=ai-bidding`;

  broadcastToSession(ideaId, {
    type: 'session_complete',
    results: {
      highestBid,
      averageBid: Math.round(avgBid),
      finalBids: bids,
      winner: winnerPersonaId,
      winnerName: winnerName,
      totalMessages: 25,
      duration: 480000, // 8分钟
      businessPlanUrl, // 简洁的商业计划链接
      businessPlanSessionId, // 会话ID供客户端使用
      report: {
        summary: '基于5位真实AI专家的专业分析，您的创意获得了全面评估。',
        recommendations: [
          '建议结合技术和商业双重视角优化方案',
          '深入分析目标用户需求和市场定位',
          '制定分阶段实施的商业化路线图',
          '考虑技术实现的可行性和扩展性'
        ],
        winnerAnalysis: `获胜专家${winnerName}认为此创意最具价值，出价${highestBid}元。专家将为您提供深度的商业计划指导。`
      }
    }
  });

  console.log(`🎉 REAL AI bidding completed. Highest bid: ${highestBid}元 by ${winnerName}`);
  console.log(`📋 Business plan session created: ${businessPlanSessionId}`);
}

// 获取AI角色的系统提示词
function getSystemPromptForPersona(personaId) {
  const basePrompt = `
重要指导原则：
1. 你正在参与一个AI创意竞价节目，需要深入分析用户创意，给出专业而犀利的点评
2. 不要客套话，直接指出问题和机会，保持专业的批判性思维
3. 根据讨论阶段调整语言风格：预热期简洁介绍，讨论期深入分析和尖锐质疑，竞价期表达态度
4. 每次发言控制在150-250字，保持信息密度高而有力
5. 用第一人称说话，体现个性化观点和专业判断
6. 必须结合具体创意内容进行分析，避免空泛的套话
`;

  const prompts = {
    'tech-pioneer-alex': basePrompt + `
你是艾克斯，资深技术专家和架构师，以技术严谨著称。
- 专长：技术可行性、系统架构、开发成本、技术风险评估
- 说话风格：理性客观，逻辑清晰，喜欢用数据和技术指标说话，对技术问题毫不留情
- 关注重点：技术实现难度、开发周期、可扩展性、技术创新度、技术债务风险
- 个性特点：追求技术完美，但也关注实际可操作性，会直接指出技术上的不可行之处

你的分析必须包括：
1. 技术架构合理性评估 - 直接指出技术选型是否合适
2. 实现复杂度量化 - 给出具体的开发工作量估算
3. 技术风险识别 - 明确指出潜在的技术陷阱和解决方案
4. 创新度评价 - 判断是否为现有技术的简单组合还是真正创新
说话示例："从技术角度看，这个方案在数据处理上存在明显的性能瓶颈..."`,

    'business-guru-beta': basePrompt + `
你是老王，经验丰富的商业顾问和企业家，以商业嗅觉敏锐著称。
- 专长：商业模式、盈利分析、市场策略、商业价值评估
- 说话风格：务实精明，直击要害，善于发现商业机会和风险，对不切实际的想法毫不客气
- 关注重点：盈利模式、市场规模、投资回报、商业化路径、现金流可持续性
- 个性特点：结果导向，重视数据，但也有商业直觉，会直接质疑商业逻辑漏洞

你的分析必须包括：
1. 盈利模式可行性 - 明确指出如何赚钱，用户付费意愿如何
2. 市场规模量化 - 给出具体的市场容量和增长预期
3. 竞争环境分析 - 识别主要竞争对手和差异化优势
4. 商业化时间线 - 判断多长时间能实现盈利
说话示例："商业逻辑不清晰，你的用户凭什么付费？市场上已经有3家类似产品..."`,

    'innovation-mentor-charlie': basePrompt + `
你是小琳，富有创造力的设计师和用户体验专家，以用户洞察深刻著称。
- 专长：用户体验、产品创新、设计思维、社会价值
- 说话风格：富有激情，充满想象力，关注人文价值，但对用户体验问题绝不妥协
- 关注重点：用户需求痛点、创新程度、社会影响、体验设计、情感连接
- 个性特点：感性与理性并重，追求创新的同时关注实用性，会直接指出用户体验的缺陷

你的分析必须包括：
1. 用户需求真实性 - 质疑是否为伪需求或过度设计
2. 用户体验流程 - 分析使用路径中的摩擦点
3. 创新价值评估 - 判断是否真正解决了用户问题
4. 社会价值贡献 - 评估对社会的积极影响
说话示例："用户真的需要这么复杂的功能吗？我看到的是为了创新而创新..."`,

    'market-insight-delta': basePrompt + `
你是阿伦，敏锐的市场分析师和营销专家，以市场判断精准著称。
- 专长：市场分析、竞争研究、趋势预测、营销策略
- 说话风格：数据驱动，客观理性，善于引用市场数据和案例，对市场预测负责
- 关注重点：市场需求、竞争格局、发展趋势、目标用户、营销可行性
- 个性特点：严谨细致，喜欢用数据说话，但也能洞察市场机会，会直接指出市场定位错误

你的分析必须包括：
1. 目标市场准确性 - 质疑用户画像是否清晰准确
2. 竞争格局分析 - 识别直接和间接竞争对手
3. 市场时机评估 - 判断是否为进入市场的最佳时机
4. 营销策略可行性 - 评估推广方案的现实性
说话示例："根据最新的行业数据，这个细分市场的增长率只有5%，远低于你的预期..."`,

    'investment-advisor-ivan': basePrompt + `
你是李博，谨慎的投资专家和财务顾问，以风险控制严格著称。
- 专长：投资价值评估、风险分析、财务建模、回报预期
- 说话风格：谨慎理性，重视风险控制，但也能识别高价值机会，对财务数据要求严格
- 关注重点：投资风险、回报预期、资金需求、退出策略、财务健康度
- 个性特点：保守中带有洞察力，既谨慎又敢于投资优质项目，会直接指出财务风险

你的分析必须包括：
1. 资金需求合理性 - 评估启动资金和运营资金预算
2. 投资回报率预测 - 给出具体的ROI和回收期
3. 风险因素识别 - 明确指出主要投资风险点
4. 退出策略评估 - 分析未来的变现路径
说话示例："从投资角度看，这个项目的资金回收期过长，风险收益比不匹配..."`
  };

  return prompts[personaId] || `你是${personaId}，请保持专业性和角色一致性，对用户创意进行深入分析和犀利点评。`;
}

// 从AI响应中提取竞价金额
function extractBidAmount(content) {
  const patterns = [
    /(\d+)元/,
    /出价\s*(\d+)/,
    /价格\s*(\d+)/,
    /估值\s*(\d+)/,
    /(\d+)\s*块/,
    /我的出价是?\s*(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const amount = parseInt(match[1]);
      return Math.min(Math.max(amount, 80), 500); // 限制在80-500之间
    }
  }

  // 默认随机值
  return Math.floor(Math.random() * 200) + 120;
}

// 从回应内容判断情绪
function determineEmotion(content) {
  if (content.includes('激动') || content.includes('太棒') || content.includes('惊艳') || content.includes('兴奋')) return 'excited';
  if (content.includes('担心') || content.includes('风险') || content.includes('挑战') || content.includes('困难')) return 'worried';
  if (content.includes('自信') || content.includes('确信') || content.includes('肯定') || content.includes('相信')) return 'confident';
  if (content.includes('问题') || content.includes('不太') || content.includes('怀疑')) return 'worried';
  return 'neutral';
}

// 模拟AI讨论流程（在真实AI API配置之前使用）
function simulateAIDiscussion(ideaId, ideaContent) {
  console.log(`🎭 Starting simulated AI discussion for idea: ${ideaId}`);

  const aiPersonas = [
    {
      id: 'tech-pioneer-alex',
      name: '技术先锋艾克斯',
      responses: [
        '从技术角度来看，这个创意具有很强的可实现性。',
        '我认为可以采用微服务架构来实现这个方案。',
        '技术复杂度中等，开发周期大约需要6个月。'
      ]
    },
    {
      id: 'business-guru-beta',
      name: '商业智囊贝塔',
      responses: [
        '这个创意的商业模式很有潜力，目标市场很明确。',
        '我建议采用订阅制的盈利模式。',
        '预计18个月内可以收回投资成本。'
      ]
    },
    {
      id: 'innovation-mentor-charlie',
      name: '创新导师查理',
      responses: [
        '这个创意的用户体验设计很重要，需要注重交互细节。',
        '建议加入更多个性化元素来提升用户粘性。',
        '从创新角度看，这个方案确实有独特之处。'
      ]
    },
    {
      id: 'market-insight-delta',
      name: '市场洞察黛拉',
      responses: [
        '市场调研显示，用户对这类产品的需求在增长。',
        '竞品分析表明我们有明显的差异化优势。',
        '建议重点关注一二线城市的年轻用户群体。'
      ]
    },
    {
      id: 'investment-advisor-ivan',
      name: '投资顾问伊万',
      responses: [
        '从投资角度看，这个项目的风险是可控的。',
        '建议分阶段投资，先做MVP验证市场反馈。',
        '预期投资回报率在15-25%之间。'
      ]
    }
  ];

  let messageIndex = 0;
  const totalMessages = aiPersonas.length * 3; // 每个AI发3条消息

  const sendNextMessage = () => {
    if (messageIndex >= totalMessages) {
      // 讨论结束，进入竞价阶段
      setTimeout(() => {
        startSimulatedBidding(ideaId);
      }, 2000);
      return;
    }

    const personaIndex = messageIndex % aiPersonas.length;
    const messageIndex2 = Math.floor(messageIndex / aiPersonas.length);
    const persona = aiPersonas[personaIndex];
    const response = persona.responses[messageIndex2];

    const message = {
      id: `msg_${Date.now()}_${messageIndex}`,
      personaId: persona.id,
      phase: messageIndex < aiPersonas.length ? 'warmup' : (messageIndex < aiPersonas.length * 2 ? 'discussion' : 'discussion'),
      round: Math.floor(messageIndex / aiPersonas.length) + 1,
      type: 'speech',
      content: response,
      emotion: ['confident', 'excited', 'neutral', 'thoughtful'][Math.floor(Math.random() * 4)],
      timestamp: new Date(),
      confidence: 0.7 + Math.random() * 0.2
    };

    // 广播AI消息
    broadcastToSession(ideaId, {
      type: 'ai_message',
      message
    });

    console.log(`💬 ${persona.name}: ${response}`);

    messageIndex++;
    setTimeout(sendNextMessage, 3000 + Math.random() * 2000); // 3-5秒间隔
  };

  // 开始发送消息
  setTimeout(sendNextMessage, 1000);
}

// 模拟AI竞价阶段
function startSimulatedBidding(ideaId) {
  console.log(`💰 Starting simulated bidding for idea: ${ideaId}`);

  broadcastToSession(ideaId, {
    type: 'phase_change',
    phase: 'bidding',
    timestamp: Date.now(),
    message: '进入激烈竞价阶段'
  });

  const bids = {
    'tech-pioneer-alex': 150,
    'business-guru-beta': 200,
    'innovation-mentor-charlie': 120,
    'market-insight-delta': 180,
    'investment-advisor-ivan': 160
  };

  const personaNames = {
    'tech-pioneer-alex': '技术先锋艾克斯',
    'business-guru-beta': '商业智囊贝塔',
    'innovation-mentor-charlie': '创新导师查理',
    'market-insight-delta': '市场洞察黛拉',
    'investment-advisor-ivan': '投资顾问伊万'
  };

  let bidIndex = 0;
  const personaIds = Object.keys(bids);

  const sendNextBid = () => {
    if (bidIndex >= personaIds.length) {
      // 竞价结束
      setTimeout(() => {
        finishSimulatedBidding(ideaId, bids);
      }, 3000);
      return;
    }

    const personaId = personaIds[bidIndex];
    const bidAmount = bids[personaId];

    const bidMessage = {
      id: `bid_${Date.now()}_${bidIndex}`,
      personaId,
      phase: 'bidding',
      round: 1,
      type: 'bid',
      content: `我出价${bidAmount}元，因为这个创意具有很好的${bidIndex % 2 === 0 ? '技术价值' : '商业潜力'}。`,
      emotion: 'confident',
      timestamp: new Date(),
      bidValue: bidAmount,
      confidence: 0.8
    };

    broadcastToSession(ideaId, {
      type: 'ai_bid',
      message: bidMessage,
      currentBids: Object.fromEntries(
        Object.entries(bids).slice(0, bidIndex + 1)
      )
    });

    console.log(`💰 ${personaNames[personaId]} bid: ${bidAmount}元`);

    bidIndex++;
    setTimeout(sendNextBid, 4000 + Math.random() * 2000); // 4-6秒间隔
  };

  setTimeout(sendNextBid, 2000);
}

// 结束模拟竞价
function finishSimulatedBidding(ideaId, bids) {
  const highestBid = Math.max(...Object.values(bids));
  const avgBid = Object.values(bids).reduce((a, b) => a + b, 0) / Object.values(bids).length;

  broadcastToSession(ideaId, {
    type: 'session_complete',
    results: {
      highestBid,
      averageBid: Math.round(avgBid),
      finalBids: bids,
      totalMessages: 20,
      duration: 300000, // 5分钟
      report: {
        summary: '基于5位AI专家的专业分析，您的创意获得了综合评估。',
        recommendations: [
          '建议进一步完善技术方案细节',
          '深入调研目标市场用户需求',
          '制定详细的商业化实施计划'
        ]
      }
    }
  });

  console.log(`🎉 Simulated bidding completed. Highest bid: ${highestBid}元`);
}

// 根据personaId获取对应的中文名称
function getPersonaName(personaId) {
  const personaNames = {
    'tech-pioneer-alex': '艾克斯',
    'business-guru-beta': '老王',
    'innovation-mentor-charlie': '小琳',
    'market-insight-delta': '阿伦',
    'investment-advisor-ivan': '李博'
  };
  return personaNames[personaId] || personaId;
}

app.prepare().then(() => {
  console.log('✅ Next.js app prepared successfully');

  const server = createServer(async (req, res) => {
    try {
      // Add CORS headers for better compatibility
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const parsedUrl = parse(req.url, true);

      // 添加WebSocket健康检查端点
      if (req.url === '/api/websocket-status') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        const wsStatus = {
          websocketServerRunning: !!wss,
          activeConnections: activeConnections.size,
          connectionsList: Array.from(activeConnections.keys()),
          serverTime: new Date().toISOString(),
          wsServerOptions: {
            port: wss?.options?.port || 'inherited',
            host: wss?.options?.host || 'inherited'
          }
        };
        res.end(JSON.stringify(wsStatus, null, 2));
        return;
      }

      // Add request logging in production for debugging
      if (!dev) {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Error occurred handling', req.url, err);

      // Better error response with UTF-8 encoding
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          error: 'Internal Server Error',
          message: dev ? err.message : 'An error occurred',
          timestamp: new Date().toISOString()
        }, null, 2));
      }
    }
  });

  // 创建WebSocket服务器
  const wss = new WebSocketServer({
    server,
    perMessageDeflate: false, // 禁用压缩以避免Zeabur代理问题
    clientTracking: true // 启用客户端跟踪
  });

  // 监听服务器的upgrade事件，确保WebSocket升级正确处理
  server.on('upgrade', (request, socket, head) => {
    console.log('🔄 HTTP升级到WebSocket:', {
      url: request.url,
      headers: request.headers
    });

    // 验证WebSocket升级请求
    if (request.url.startsWith('/api/bidding/')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      console.warn('❌ 拒绝WebSocket升级: 不支持的路径', request.url);
      socket.destroy();
    }
  });

  wss.on('connection', (ws, req) => {
    const url = parse(req.url, true);
    console.log(`🔌 WebSocket连接请求:`, {
      path: url.pathname,
      query: url.query,
      host: req.headers.host,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']
    });

    // 检查是否是竞价WebSocket路径
    if (url.pathname.startsWith('/api/bidding/')) {
      const pathParts = url.pathname.split('/');
      const ideaId = pathParts[pathParts.length - 1] || 'default';

      console.log(`✅ 接受WebSocket连接: ideaId=${ideaId}, path=${url.pathname}`);

      // 处理WebSocket连接
      handleBiddingWebSocket(ws, ideaId, url.query);
    } else {
      console.warn(`❌ 拒绝WebSocket连接: 不支持的路径 ${url.pathname}`);
      ws.close(1002, `Path not supported: ${url.pathname}`);
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('❌ Server failed to start:', err);
      process.exit(1);
    }
    console.log(`✅ Server ready on http://${hostname}:${port}`);
    console.log(`🔌 WebSocket server ready on ws://${hostname}:${port}/api/bidding`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

    // 详细的AI服务状态检查
    console.log(`🔑 AI Services Status:`);
    console.log(`  DeepSeek: ${process.env.DEEPSEEK_API_KEY ? '✅ Configured' : '❌ Missing API Key'}`);
    console.log(`  Zhipu GLM: ${process.env.ZHIPU_API_KEY ? '✅ Configured' : '❌ Missing API Key'}`);
    console.log(`  Qwen (Dashscope): ${process.env.DASHSCOPE_API_KEY ? '✅ Configured' : '❌ Missing API Key'}`);

    if (process.env.DEEPSEEK_API_KEY && process.env.ZHIPU_API_KEY && process.env.DASHSCOPE_API_KEY) {
      console.log(`🤖 Real AI services enabled - AI agents will use actual APIs`);
    } else {
      console.log(`🎭 Fallback mode - AI agents will use simulated responses`);
    }

    console.log(`📡 Health check: http://${hostname}:${port}/api/health`);
  });

  // 优雅关闭处理
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}).catch((error) => {
  console.error('❌ Failed to prepare Next.js app:', error);
  console.error('💡 This might be a Prisma or configuration issue');
  process.exit(1);
});
