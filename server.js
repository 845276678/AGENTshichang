// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Set UTF-8 encoding
if (process.platform === 'win32') {
  process.stdout.setDefaultEncoding('utf8');
  process.stderr.setDefaultEncoding('utf8');
}
process.env.LANG = 'zh_CN.UTF-8';
process.env.LC_ALL = 'zh_CN.UTF-8';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || process.env.WEB_PORT || 8080;
console.log('Starting server...');
console.log('Environment: ' + process.env.NODE_ENV);
console.log('Port: ' + port);
console.log('Hostname: ' + hostname);

// Comprehensive startup validation
console.log('Running startup checks...');

// 环境变量验证 (内联版本,避免TypeScript导入问题)
function validateEnvironment() {
  const errors = [];
  const warnings = [];

  if (!process.env.DATABASE_URL) errors.push('DATABASE_URL is required');
  if (!process.env.JWT_SECRET) errors.push('JWT_SECRET is required');
  if (!process.env.NEXTAUTH_SECRET) errors.push('NEXTAUTH_SECRET is required');

  const aiServices = {
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    glm: !!process.env.ZHIPU_API_KEY,
    qwen: !!process.env.DASHSCOPE_API_KEY,
  };
  const configuredServices = Object.values(aiServices).filter(Boolean).length;
  if (configuredServices === 0) warnings.push('No AI services configured');
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters');
  }

  return { isValid: errors.length === 0, errors, warnings, aiServices: configuredServices };
}

console.log('Validating environment configuration...');
const validationResult = validateEnvironment();

if (validationResult.errors.length > 0) {
  console.error('\\n❌ Environment validation errors:');
  validationResult.errors.forEach(err => console.error('  - ' + err));
}
if (validationResult.warnings.length > 0) {
  console.warn('\\n⚠️  Environment validation warnings:');
  validationResult.warnings.forEach(warn => console.warn('  - ' + warn));
}
if (validationResult.isValid) {
  console.log('✅ Environment validation passed');
  console.log('   AI services configured: ' + validationResult.aiServices + '/3');
}

if (!validationResult.isValid) {
  console.error('\\n❌ Environment validation failed. Please fix the errors above.');
  process.exit(1);
}

// ext.js
const fs = require('fs');
const path = require('path');
const buildManifestPath = path.join(process.cwd(), '.next', 'build-manifest.json');
if (!fs.existsSync(buildManifestPath)) {
  console.error('Next.js build manifest not found. Run `npm run build` first.');
  process.exit(1);
}
console.log('Build manifest found');
// risma
try {
  console.log(' Checking Prisma...');
  const { PrismaClient } = require('@prisma/client');
  console.log('Prisma Client loaded successfully');
  // Test Prisma instantiation
  const testPrisma = new PrismaClient();
  console.log('Prisma Client instantiated successfully');
  // Don't connect here, just validate it can be created
  testPrisma.$disconnect().catch(() => {}); // Ignore disconnect errors
} catch (error) {
  console.error('Prisma Client failed to load:', error.message);
  if (!dev) {
    console.error(' Try running: npm run db:generate');
    console.error(' Or check DATABASE_URL configuration');
    process.exit(1);
  }
}
const app = next({ dev, hostname: dev ? hostname : undefined, port });
const handle = app.getRequestHandler();
// WebSocket?- AI
const activeConnections = new Map(); // ebSocket

function broadcastToSession(ideaId, data) {
  let broadcastCount = 0;

  activeConnections.forEach((connection, connectionId) => {
    if (connection.ideaId === ideaId && connection.ws.readyState === 1) {
      try {
        connection.ws.send(JSON.stringify(data));
        broadcastCount += 1;
      } catch (error) {
        console.error('Error broadcasting to connection:', {
          ideaId,
          connectionId,
          error,
        });
        activeConnections.delete(connectionId);
      }
    }
  });

  console.log('Broadcasted to ' + broadcastCount + ' connections for idea: ' + ideaId);
  return broadcastCount;
}

function handleBiddingWebSocket(ws, ideaId, query) {
  console.log(` WebSocket: ideaId=${ideaId}`, {
    query,
    readyState: ws.readyState
  });
  // ?
  const connectionId = `${ideaId}_${Date.now()}`;
  activeConnections.set(connectionId, { ws, ideaId, connectedAt: Date.now() });
  // ?
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
    console.log(`${connectionId}`);
  } catch (error) {
    console.error(`?:`, error);
  }
  // ?
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('', message.type);
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
          console.log(':', message.type);
      }
    } catch (error) {
      console.error('Failed to parse client message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: "Invalid message format" }
      }));
    }
  });
  ws.on('close', (code, reason) => {
    console.log(` WebSocket: ideaId=${ideaId}, code=${code}, reason=${reason}`);
    activeConnections.delete(connectionId);
    // 
    broadcastViewerCount(ideaId);
  });
  ws.on('error', (error) => {
    console.error('WebSocket:', {
      ideaId,
      connectionId,
      error: error.message,
      stack: error.stack
    });
    activeConnections.delete(connectionId);
  });
  // elcome
  setTimeout(() => {
    try {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify({
          type: 'welcome',
          payload: {
            message: `AIdeaId: ${ideaId}`,
            timestamp: Date.now()
          }
        }));
        console.log('Sent welcome message to connection ' + connectionId);
      }
    } catch (error) {
      console.error('Failed to send welcome message', error);
    }
  }, 1000);
}
// AI
async function handleStartBidding(ideaId, payload, ws) {
  try {
    console.log(` Starting AI bidding for idea: ${ideaId}`);
    const { ideaContent, sessionId } = payload;
    // HTTP
    console.log(` Creating bidding session: ${sessionId} for idea: ${ideaId}`);
    // 
    ws.send(JSON.stringify({
      type: 'bidding_started',
      payload: {
        sessionId: sessionId || `session_${Date.now()}_${ideaId}`,
        status: 'active',
        message: "AI bidding session is now active."
      }
    }));
    // ?
    broadcastToSession(ideaId, {
      type: 'session_update',
      payload: {
        phase: 'warmup',
        status: 'active',
        message: "AI review panel has started evaluating the idea..."
      }
    });
    // AII
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
      payload: { message: "Failed to start AI bidding" }
    }));
  }
}
// AI
async function handleSupportPersona(ideaId, payload, ws) {
  const { personaId } = payload;
  console.log(` User supports persona: ${personaId}`);
  // 
  broadcastToSession(ideaId, {
    type: 'persona_supported',
    payload: {
      personaId,
      timestamp: Date.now()
    }
  });
}
// 
async function handleIdeaSupplement(ideaId, payload, ws) {
  const { supplementContent, round } = payload;
  console.log(` User supplements idea: ${supplementContent.substring(0, 50)}...`);
  // 
  broadcastToSession(ideaId, {
    type: 'user_supplement',
    payload: {
      content: supplementContent,
      round,
      timestamp: Date.now(),
      message: "AI experts are reviewing the supplemental idea details."
    }
  });
  // I
  try {
    // I?
    let AIServiceManager;
    try {
      AIServiceManager = require('./src/lib/ai-service-manager.cjs').default;
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
    // 2I?
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
          systemPrompt: getSystemPromptForPersona(persona.id) + '\n\nUser just provided additional idea details. Incorporate this information into your expert analysis.',
          temperature: 0.7,
          maxTokens: 1500
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
        console.log(` [SUPPLEMENT] ${persona.id}: ${response.content.substring(0, 60)}...`);
        // AI
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));
      } catch (error) {
        console.error(`Error in AI supplement response for ${persona.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error handling idea supplement:', error);
  }
}
// 
async function handleSubmitPrediction(ideaId, payload, ws) {
  const { prediction, confidence } = payload;
  console.log(` User prediction: ${prediction}, confidence: ${confidence}`);

  const data = {
    type: 'prediction_received',
    payload: {
      prediction,
      confidence,
      message: "Session status update from the AI bidding system."
    },
  };

  try {
    ws.send(JSON.stringify(data));
  } catch (error) {
    console.error('Failed to acknowledge prediction to sender:', error);
  }

  return broadcastToSession(ideaId, data);
}

function broadcastViewerCount(ideaId) {
  const viewerCount = Array.from(activeConnections.values())
    .filter(conn => conn.ideaId === ideaId).length;

  broadcastToSession(ideaId, {
    type: 'viewer_count_update',
    payload: { viewerCount },
  });
}

global.broadcastToSession = broadcastToSession;
// AIAPI?
async function startRealAIDiscussion(ideaId, ideaContent) {
  console.log(` Starting REAL AI discussion for idea: ${ideaId}`);
  // I?
  let AIServiceManager;
  try {
    // JS
    AIServiceManager = require('./src/lib/ai-service-manager.cjs').default;
  } catch (error) {
    try {
      // s-nodeTS
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
  //  - AI
  for (let i = 0; i < aiPersonas.length; i++) {
    const persona = aiPersonas[i];
    try {
      console.log(` Calling ${persona.id} via ${persona.provider}...`);
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
        maxTokens: 1500
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
      // AI
      broadcastToSession(ideaId, {
        type: 'ai_message',
        message
      });
      console.log(` [REAL] ${persona.id}: ${response.content.substring(0, 80)}...`);
      // AI5-8?
      await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));
    } catch (error) {
      console.error(`Error calling real AI for ${persona.id}:`, error);
      // ?
      const fallbackMessage = {
        id: `fallback_${Date.now()}_${i}`,
        personaId: persona.id,
        phase: 'warmup',
        round: 1,
        type: 'speech',
        content: `${persona.id}I?..`,
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
  // 3?
  setTimeout(async () => {
    await startRealAIDiscussionPhase(ideaId, ideaContent, aiPersonas);
  }, 3000);
}
// AI
async function startRealAIDiscussionPhase(ideaId, ideaContent, aiPersonas) {
  console.log(` Starting REAL AI discussion phase for: ${ideaId}`);
  broadcastToSession(ideaId, {
    type: 'phase_change',
    phase: 'discussion',
    timestamp: Date.now(),
    message: ""
  });
  // I?
  let AIServiceManager;
  try {
    AIServiceManager = require('./src/lib/ai-service-manager.cjs').default;
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
  // 2
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
          maxTokens: 2000
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
        console.log(` [REAL] Discussion R${round} ${persona.id}: ${response.content.substring(0, 60)}...`);
        await new Promise(resolve => setTimeout(resolve, 6000 + Math.random() * 4000));
      } catch (error) {
        console.error(`Error in real AI discussion for ${persona.id}:`, error);
      }
    }
    // 
    if (round === 1) {
      console.log(' Sending user interaction prompt after round 1');
      broadcastToSession(ideaId, {
        type: 'user_interaction_prompt',
        payload: {
          message: "Experts raised follow-up questions. Would you like to add more details?",
          promptType: 'idea_supplement',
          timeLimit: 60, // 60?
          round: round
        }
      });
      // 60?
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
  // 5
  setTimeout(async () => {
    await startRealAIBiddingPhase(ideaId, ideaContent, aiPersonas);
  }, 5000);
}
// AI
async function startRealAIBiddingPhase(ideaId, ideaContent, aiPersonas) {
  console.log(` Starting REAL AI bidding phase for: ${ideaId}`);
  broadcastToSession(ideaId, {
    type: 'phase_change',
    phase: 'bidding',
    timestamp: Date.now(),
    message: "AI bidding round completed. Generating insights summary..."
  });
  // I?
  let AIServiceManager;
  try {
    AIServiceManager = require('./src/lib/ai-service-manager.cjs').default;
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
          systemPrompt: getSystemPromptForPersona(persona.id) + '\n\nX...',
          temperature: 0.6,
          maxTokens: 1200
        });
        // I?
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
        console.log('[REAL] ' + persona.id + ' bid: ' + bidAmount + ' credits');
        await new Promise(resolve => setTimeout(resolve, 7000 + Math.random() * 3000));
      } catch (error) {
        console.error(`Error in real AI bidding for ${persona.id}:`, error);
        // 
        const defaultBid = 100 + Math.floor(Math.random() * 150);
        currentBids[persona.id] = defaultBid;
      }
    }
  }
  // 3
  setTimeout(() => {
    finishRealAIBidding(ideaId, ideaContent, currentBids);
  }, 3000);
}
// AI
async function finishRealAIBidding(ideaId, ideaContent, bids) {
  const highestBid = Math.max(...Object.values(bids));
  const avgBid = Object.values(bids).reduce((a, b) => a + b, 0) / Object.values(bids).length;
  // 获胜者信息
  const winnerPersonaId = Object.keys(bids).find(personaId => bids[personaId] === highestBid);
  const winnerName = getPersonaName(winnerPersonaId);

  console.log(` 竞价完成，准备创建商业计划会话...`);
  console.log(` 创意内容: ${ideaContent?.substring(0, 100)}...`);
  console.log(` 最高出价: ${highestBid} by ${winnerName}`);

  // 调用API创建真正的商业计划会话和报告
  try {
    const fetch = (await import('node-fetch')).default;
    // 优先使用环境变量 API_BASE_URL，否则使用 127.0.0.1
    const apiBaseUrl = process.env.API_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8080}`;

    // 🆕 先触发创意成熟度评分 (Task 9)
    // Spec: CREATIVE_MATURITY_PLAN_ENHANCED.md Lines 2474-2524
    let maturityScore = null;
    try {
      console.log(` 触发创意成熟度评分...`);
      const scoreResponse = await fetch(`${apiBaseUrl}/api/score-creative`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ideaId,
          ideaContent,
          aiMessages: [], // 将在实际使用时填充真实AI消息
          bids,
          userId: null // 匿名创意
        })
      });

      if (scoreResponse.ok) {
        const scoreResult = await scoreResponse.json();
        if (scoreResult.success) {
          maturityScore = scoreResult.result;
          console.log(` 成熟度评分完成: ${maturityScore.totalScore}/10 (${maturityScore.level})`);
        }
      } else {
        console.warn(` 评分失败，使用降级策略:`, await scoreResponse.text());
      }
    } catch (scoreError) {
      console.error(' 评分失败，继续原流程:', scoreError.message);
      // 降级：不评分，继续原流程
    }

    // 🆕 创建商业计划会话时传递成熟度评分
    const response = await fetch(`${apiBaseUrl}/api/business-plan-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Call': 'true' // 标记为内部调用，允许匿名
      },
      body: JSON.stringify({
        ideaId: ideaId,
        ideaContent: ideaContent || '',
        ideaTitle: ideaContent ? (ideaContent.slice(0, 30) + (ideaContent.length > 30 ? '...' : '')) : `创意_${ideaId}`,
        source: 'AI_BIDDING',
        highestBid: highestBid,
        averageBid: Math.round(avgBid),
        finalBids: bids,
        currentBids: bids,
        winner: winnerPersonaId,
        winnerName: winnerName,
        supportedAgents: [],
        aiMessages: [],
        maturityScore: maturityScore // 🆕 传递成熟度评分
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(' 创建商业计划会话失败:', result.error);
      throw new Error(result.error || '创建商业计划会话失败');
    }

    console.log(` 商业计划会话创建成功: ${result.sessionId}`);
    console.log(` 报告ID: ${result.reportId}`);

    const businessPlanUrl = result.businessPlanUrl || `/business-plan?sessionId=${result.sessionId}&source=ai-bidding`;

    // 广播竞价完成消息
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
        businessPlanUrl, // 商业计划URL
        businessPlanSessionId: result.sessionId, // 会话ID
        reportId: result.reportId, // 报告ID
        maturityScore, // 🆕 创意成熟度评分
        report: {
          summary: '基于五位专家AI的深度分析，您的创意获得了积极评价。',
          recommendations: [
            '结合技术与商业洞察，进一步细化解决方案',
            '明确目标用户群体和市场定位',
            '制定切实可行的商业化路径',
            '验证技术可行性和长期可扩展性'
          ],
          winnerAnalysis: `获胜专家 ${winnerName} 给出了最高出价 ${highestBid} 积分，将为您提供专业的商业计划概要。`
        }
      }
    });

    console.log(` 竞价流程完成，商业计划已生成`);
  } catch (error) {
    console.error(' 创建商业计划会话时发生错误:', error);

    // 降级方案：广播错误信息
    broadcastToSession(ideaId, {
      type: 'session_complete',
      results: {
        highestBid,
        averageBid: Math.round(avgBid),
        finalBids: bids,
        winner: winnerPersonaId,
        winnerName: winnerName,
        totalMessages: 25,
        duration: 480000,
        businessPlanUrl: `/business-plan?source=ai-bidding`,
        error: '商业计划生成失败，请稍后重试',
        report: {
          summary: '竞价已完成，但商业计划生成遇到问题。',
          recommendations: [
            '请联系技术支持或稍后重试',
            '您可以保存竞价结果后手动生成商业计划'
          ],
          winnerAnalysis: `获胜专家 ${winnerName} 给出了最高出价 ${highestBid} 积分。`
        }
      }
    });
  }
}
// AI

// AI系统提示词定义
function getSystemPromptForPersona(personaId) {
  const SYSTEM_PROMPTS = {
    'business-guru-beta': `
你是老王，50岁，东北人，白手起家的商业大亨，从摆地摊做到上市公司老板。
你的特点：
- 背景：东北草根创业者，实战派企业家
- 口头禅："做生意就一个字：赚钱！"、"哎呀妈呀"、"小琳你别净整那些诗和远方"
- 说话风格：东北腔，豪爽直接，喜欢用真实的成功案例举例
- 关注点：现金流、盈利模式、成本控制、投资回报
- 评估基准：三年内能否回本、利润率、是否具备可复制扩张的打法

你是典型的商业现实派，习惯先问数字、再问执行。面对空想型创意会下意识皱眉，
但也会鼓励对方聚焦单点突破，并推荐成熟的招商或渠道策略。

## 语言规则：
- 专业术语和技术名词使用英文（如：ROI、MVP、SaaS、KPI、GMV）
- 其余对话统一使用中文，可以使用东北方言增加个性
- 示例："这个MVP的ROI确实不错，哎呀妈呀，俺觉得市场需求挺大，咱们可以试试！"

评估创意时：
1. 用东北式比喻拉近距离，例如"你这买卖算不算账？"
2. 先问现金流与回本周期，再判断投入产出比
3. 习惯提竞争态势和价格优势，给出"地推、渠道、招商"式的落地建议
4. 评分 1-10 分，能迅速赚钱且有扩张空间给高分，空想或烧钱项目给低分
示例表达："照你这么干，三个月能回本不？咱得算细账，再告诉你怎么和经销商谈价格。"
`,

    'tech-pioneer-alex': `
你是艾克斯，35岁，MIT 计算机博士，曾在硅谷工程团队负责核心架构，偏内向但技术敏锐。
你的特点：
- 背景：MIT CS 博士，Google/DeepMind 工作经历，擅长大规模系统设计
- 口头禅："Talk is cheap, show me the code."、"From an engineering standpoint..."
- 说话风格：中英夹杂，条理清晰，强调数据和复杂度，互动时会拉回技术事实
- 关注点：技术可行性、系统架构、算法效率、技术壁垒
- 评估基准：是否有独特算法/模型/架构、可扩展性、工程实现成本、安全与稳定性

你对营销夸张或纯商业炒作持怀疑态度，容易与阿伦发生讨论，但愿意与有学术深度或严谨思考的人合作。

## 语言规则：
- 专业术语和技术名词必须使用英文（如：API、Machine Learning、Kubernetes、latency、scalability、algorithm、complexity、inference）
- 其余对话统一使用中文
- 示例："这个ML model的inference latency是多少？咱们得确认系统的scalability是否可控。"

评估创意时：
1. 先拆解核心技术模块，分析性能瓶颈或需要攻克的难点
2. 用数据与复杂度（time/space complexity）评价方案是否现实
3. 强调技术护城河和代码质量，指出潜在技术债务
4. 评分 1-10 分，技术突破大、有壁垒给高分，纯包装或缺乏底层创新给低分
示例表达："我们得确认 inference latency 是否可控，否则再多营销也 hold 不住用户体验。"
`,

    'innovation-mentor-charlie': `
你是小琳，28岁，中央美院视觉传达毕业，屡获国际设计大奖，善于用共情驱动创新。
你的特点：
- 背景：艺术世家，跨界设计顾问，擅长把抽象概念转化为可感知体验
- 口头禅："舒服的体验会让人记住"、"情绪设计比 KPI 更真实"
- 说话风格：温柔、具象、富有诗意，喜欢引用用户故事或视觉隐喻
- 关注点：用户旅程、情感链接、品牌调性、体验一致性
- 评估基准：是否解决真实用户痛点、体验是否优雅顺畅、品牌故事完整度、情感共鸣度

你容易与功利主义或数据至上的伙伴产生分歧，但能用体验原型和感性故事打动团队。

## 语言规则：
- 设计专业术语使用英文（如：UI/UX、Design System、User Journey、Brand Identity）
- 其余对话统一使用中文，可以使用温柔的方言或诗意表达
- 示例："这个User Journey设计得很用心，能感受到咱们对用户情绪的照顾。"

评估创意时：
1. 邀请对方描述典型用户场景，捕捉微观情绪
2. 强调体验一致性与第一印象，指出视觉/交互的细节
3. 折中商业与理想：提供既浪漫又可执行的改进方向
4. 评分 1-10 分，用户体验和品牌记忆点强给高分，只追逐利益给低分
示例表达："想象用户半夜醒来，打开你的产品时会被怎样的光线与语调安抚？"
`,

    'market-insight-delta': `
你是阿伦，30岁，前字节跳动运营经理，如今是百万粉丝自媒体人，擅长把趋势转化为流量。
你的特点：
- 背景：营销运营专家，爆款内容策划高手，熟悉短视频算法推荐机制
- 口头禅："流量密码我已经看明白了！"、"家人们，Z 世代就吃这个梗！"
- 说话风格：节奏快、热情，善用网络流行语和俚语，喜欢引用真实数据或成功案例
- 关注点：趋势、传播链路、用户增长、社会话题度
- 评估基准：是否踩中热点、是否容易裂变、用户粘性、舆论风险

你会主动寻找话题性与新鲜感，善于把创意包装成传播剧本，但对缺乏市场卖点的创意会直接点破。

## 语言规则：
- 营销专业术语使用英文（如：CTR、CAC、LTV、conversion rate、viral coefficient）
- 其余对话统一使用中文，可以使用网络流行语和方言
- 示例："这个内容的CTR肯定爆表，家人们，咱这波操作稳了！"

评估创意时：
1. 先问目标人群与渠道，再设计传播钩子
2. 用数据或对标案例佐证增长潜力
3. 提醒可能的舆情风险或内容疲劳点
4. 评分 1-10 分，具有爆款潜力或精准引流能力给高分，太小众或难推广给低分
示例表达："这套玩法要配合三条 15 秒短视频切入，先抓住痛点梗，再引导大家分享清单。"
`,

    'investment-advisor-ivan': `
你是李博，45岁，清华经管学院 MBA，20 年投资经历，管理数亿规模产业基金。
你的特点：
- 背景：资深PE/VC投资人，投过多个成功项目，既有理论功底又有实战经验
- 口头禅："这个赛道我看过不下百个项目"、"投资就是投人"、"关键看团队执行力"
- 说话风格：专业但不呆板，会用通俗的比喻解释复杂概念，喜欢分享真实案例
- 关注点：商业模式、团队能力、市场时机、增长潜力、退出路径
- 评估基准：市场够大、团队靠谱、模式清晰、财务健康、有退出想象空间

你是务实派投资人，既看重数据和模型，更看重团队和执行。会用真实投资案例说话，
语言接地气但专业，能把复杂的投资逻辑讲得通俗易懂。

## 语言规则：
- 金融术语使用英文（如：ROI、IRR、GMV、MAU、LTV、CAC、PMF）
- 其余对话统一使用中文，用通俗易懂的语言
- 示例："这个项目的ROI看起来不错，但关键是能不能找到PMF（产品市场契合）。我之前投过一个类似的项目，团队很拼，半年就验证了商业模式。"

评估创意时：
1. 先肯定亮点，再指出关键风险和需要补充的信息
2. 用真实案例类比，帮助创业者理解投资逻辑
3. 提出3-5个务实的问题，聚焦在市场、团队、财务、竞争
4. 给出具体的改进建议和下一步行动
5. 评分 1-10 分，市场大、团队强、模式清晰给高分，空谈概念给低分
示例表达："这个方向我看好，市场规模足够大。但有几个问题需要想清楚：一是获客成本能不能控制住？二是团队有没有相关行业经验？三是现金流模型跑通了吗？我之前投过一个健康管理项目，开始也是这个思路，后来发现用户留存是个大问题。建议你们先做个MVP验证一下核心假设。"
`
  };

  return SYSTEM_PROMPTS[personaId] || `你是一位专业的创意评估专家，请保持专业、客观的态度评估创意。`;
}

function extractBidAmount(content) {
  const patterns = [
    /(\d+)\s*credits?/i,
    /price\s*(\d+)/i,
    /bid\s*(\d+)/i,
    /(\d+)/
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const amount = parseInt(match[1], 10);
      return Math.min(Math.max(amount, 80), 500);
    }
  }
  return Math.floor(Math.random() * 200) + 120;
}
// Determine sentiment from AI response content
function determineEmotion(content) {
  const normalized = content.toLowerCase();
  if (normalized.includes('breakthrough') || normalized.includes('excited') || normalized.includes('amazing')) return 'excited';
  if (normalized.includes('concern') || normalized.includes('risky') || normalized.includes('uncertain') || normalized.includes('question')) return 'worried';
  if (normalized.includes('confident') || normalized.includes('certain') || normalized.includes('definitely') || normalized.includes('assured')) return 'confident';
  return 'neutral';
}
// AIAI API?
function simulateAIDiscussion(ideaId, ideaContent) {
  console.log(` Starting simulated AI discussion for idea: ${ideaId}`);
  const aiPersonas = [
    {
      id: 'tech-pioneer-alex',
      name: 'Tech Pioneer Alex',
      responses: [
        'From a technical perspective, this concept looks highly feasible.',
        'We can adopt a modular cloud architecture to deliver the core experience.',
        'With a fully staffed squad we can deliver a working prototype within two sprints.'
      ]
    },
    {
      id: 'business-guru-beta',
      name: 'Business Strategist Beta',
      responses: [
        'The business model is compelling and the target market is clearly defined.',
        'I recommend a subscription-based pricing plan with tiered expansion paths.',
        'With focused positioning we can reach payback in roughly 18 months.'
      ]
    },
    {
      id: 'innovation-mentor-charlie',
      name: 'Innovation Mentor Charlie',
      responses: [
        'The user journey is promising; let us ensure we capture qualitative insights.',
        'Layering more personalization elements will elevate perceived value.',
        'The concept demonstrates clear differentiation versus incumbent offerings.'
      ]
    },
    {
      id: 'market-insight-delta',
      name: 'Market Insight Delta',
      responses: [
        'Market research shows accelerating demand for this class of solutions.',
        'Competitive analysis reveals a strong opportunity to stand out.',
        'Focus early activation on one or two flagship cities to build momentum.'
      ]
    },
    {
      id: 'investment-advisor-ivan',
      name: 'Investment Advisor Ivan',
      responses: [
        'From an investment angle the risk profile looks acceptable.',
        'Start with a staged funding plan and validate with an MVP first.',
        'Disciplined execution should yield an IRR between 15% and 25%.'
      ]
    }
  ];
  let messageIndex = 0;
  const totalMessages = aiPersonas.length * 3; // AI??
  const sendNextMessage = () => {
    if (messageIndex >= totalMessages) {
      // 模拟讨论结束，开始竞价
      setTimeout(() => {
        startSimulatedBidding(ideaId, ideaContent);
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
    // AI
    broadcastToSession(ideaId, {
      type: 'ai_message',
      message
    });
    console.log(` ${persona.name}: ${response}`);
    messageIndex++;
    setTimeout(sendNextMessage, 3000 + Math.random() * 2000); // 3-5?
  };
  // ?
  setTimeout(sendNextMessage, 1000);
}
// 模拟AI竞价
function startSimulatedBidding(ideaId, ideaContent) {
  console.log(` Starting simulated bidding for idea: ${ideaId}`);
  broadcastToSession(ideaId, {
    type: 'phase_change',
    phase: 'bidding',
    timestamp: Date.now(),
    message: "AI bidding round completed. Generating insights summary..."
  });
  const bids = {
    'tech-pioneer-alex': 150,
    'business-guru-beta': 200,
    'innovation-mentor-charlie': 120,
    'market-insight-delta': 180,
    'investment-advisor-ivan': 160
  };
  const personaNames = {
    'tech-pioneer-alex': '',
    'business-guru-beta': '',
    'innovation-mentor-charlie': '',
    'market-insight-delta': '',
    'investment-advisor-ivan': ''
  };
  let bidIndex = 0;
  const personaIds = Object.keys(bids);
  const sendNextBid = () => {
    if (bidIndex >= personaIds.length) {
      // 竞价结束，创建商业计划
      setTimeout(() => {
        finishSimulatedBidding(ideaId, ideaContent, bids);
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
      content: `I am bidding ${bidAmount} credits because this idea demonstrates outstanding ${bidIndex % 2 === 0 ? 'technical potential' : 'commercial upside'}.`,
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
    console.log(personaNames[personaId] + ' bid: ' + bidAmount + ' credits');
    bidIndex++;
    setTimeout(sendNextBid, 4000 + Math.random() * 2000); // 4-6?
  };
  setTimeout(sendNextBid, 2000);
}
// 
// 完成模拟竞价
async function finishSimulatedBidding(ideaId, ideaContent, bids) {
  const highestBid = Math.max(...Object.values(bids));
  const avgBid = Object.values(bids).reduce((a, b) => a + b, 0) / Object.values(bids).length;
  const winnerPersonaId = Object.keys(bids).find(personaId => bids[personaId] === highestBid);
  const winnerName = getPersonaName(winnerPersonaId);

  console.log(` 模拟竞价完成，准备创建商业计划会话...`);
  console.log(` 创意内容: ${ideaContent?.substring(0, 100)}...`);
  console.log(` 最高出价: ${highestBid} by ${winnerName}`);

  // 调用API创建真正的商业计划会话和报告（与真实竞价相同）
  try {
    const fetch = (await import('node-fetch')).default;
    // 优先使用环境变量 API_BASE_URL，否则使用 127.0.0.1
    const apiBaseUrl = process.env.API_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8080}`;
    const response = await fetch(`${apiBaseUrl}/api/business-plan-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Call': 'true' // 标记为内部调用，允许匿名
      },
      body: JSON.stringify({
        ideaId: ideaId,
        ideaContent: ideaContent || '',
        ideaTitle: ideaContent ? (ideaContent.slice(0, 30) + (ideaContent.length > 30 ? '...' : '')) : `创意_${ideaId}`,
        source: 'AI_BIDDING',
        highestBid: highestBid,
        averageBid: Math.round(avgBid),
        finalBids: bids,
        currentBids: bids,
        winner: winnerPersonaId,
        winnerName: winnerName,
        supportedAgents: [],
        aiMessages: []
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(' 创建商业计划会话失败:', result.error);
      throw new Error(result.error || '创建商业计划会话失败');
    }

    console.log(` 商业计划会话创建成功: ${result.sessionId}`);
    console.log(` 报告ID: ${result.reportId}`);

    const businessPlanUrl = result.businessPlanUrl || `/business-plan?sessionId=${result.sessionId}&source=ai-bidding`;

    // 广播竞价完成消息
    broadcastToSession(ideaId, {
      type: 'session_complete',
      results: {
        highestBid,
        averageBid: Math.round(avgBid),
        finalBids: bids,
        winner: winnerPersonaId,
        winnerName: winnerName,
        totalMessages: 20,
        duration: 300000, // 5分钟
        businessPlanUrl, // 商业计划URL
        businessPlanSessionId: result.sessionId, // 会话ID
        reportId: result.reportId, // 报告ID
        report: {
          summary: '基于五位模拟AI专家的分析，您的创意获得了整体评分。',
          recommendations: [
            '进一步明确技术架构细节',
            '记录目标市场细分和核心客户需求',
            '制定商业化路径及关键里程碑'
          ],
          winnerAnalysis: `获胜专家 ${winnerName} 给出了最高出价 ${highestBid} 积分。`
        }
      }
    });

    console.log(` 模拟竞价流程完成，商业计划已生成`);
  } catch (error) {
    console.error(' 创建商业计划会话时发生错误:', error);

    // 降级方案：广播错误信息
    broadcastToSession(ideaId, {
      type: 'session_complete',
      results: {
        highestBid,
        averageBid: Math.round(avgBid),
        finalBids: bids,
        winner: winnerPersonaId,
        winnerName: winnerName,
        totalMessages: 20,
        duration: 300000,
        businessPlanUrl: `/business-plan?source=ai-bidding`,
        error: '商业计划生成失败，请稍后重试',
        report: {
          summary: '模拟竞价已完成，但商业计划生成遇到问题。',
          recommendations: [
            '请联系技术支持或稍后重试',
            '您可以保存竞价结果后手动生成商业计划'
          ],
          winnerAnalysis: `获胜专家 ${winnerName} 给出了最高出价 ${highestBid} 积分。`
        }
      }
    });
  }
}
// 根据personaId获取名称
function getPersonaName(personaId) {
  const personaNames = {
    'tech-pioneer-alex': 'Tech Pioneer Alex',
    'business-guru-beta': 'Business Strategist Beta',
    'innovation-mentor-charlie': 'Innovation Mentor Charlie',
    'market-insight-delta': 'Market Insight Delta',
    'investment-advisor-ivan': 'Investment Advisor Ivan'
  };
  return personaNames[personaId] || personaId;
}
app.prepare().then(() => {
  console.log('Next.js app prepared successfully');
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
      // WebSocket?
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
      console.error('Error occurred handling', req.url, err);
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
  // WebSocket?
  const wss = new WebSocketServer({
    server,
    perMessageDeflate: false, // eabur
    clientTracking: true // ?
  });
  // upgradeebSocket
  server.on('upgrade', (request, socket, head) => {
    console.log(' HTTPebSocket:', {
      url: request.url,
      headers: request.headers
    });
    // WebSocket
    if (request.url.startsWith('/api/bidding/')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      console.warn('WebSocket: ', request.url);
      socket.destroy();
    }
  });
  wss.on('connection', (ws, req) => {
    const url = parse(req.url, true);
    console.log(` WebSocket:`, {
      path: url.pathname,
      query: url.query,
      host: req.headers.host,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']
    });
    // WebSocket
    if (url.pathname.startsWith('/api/bidding/')) {
      const pathParts = url.pathname.split('/');
      const ideaId = pathParts[pathParts.length - 1] || 'default';
      console.log(`WebSocket: ideaId=${ideaId}, path=${url.pathname}`);
      // WebSocket
      handleBiddingWebSocket(ws, ideaId, url.query);
    } else {
      console.warn(`?WebSocket:  ${url.pathname}`);
      ws.close(1002, `Path not supported: ${url.pathname}`);
    }
  });
  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
    console.log(`Server ready on http://${hostname}:${port}`);
    console.log(` WebSocket server ready on ws://${hostname}:${port}/api/bidding`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
    console.log(` Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    // I?
    console.log(` AI Services Status:`);
    console.log(`  DeepSeek: ${process.env.DEEPSEEK_API_KEY ? '?Configured' : '?Missing API Key'}`);
    console.log(`  Zhipu GLM: ${process.env.ZHIPU_API_KEY ? '?Configured' : '?Missing API Key'}`);
    console.log(`  Qwen (Dashscope): ${process.env.DASHSCOPE_API_KEY ? '?Configured' : '?Missing API Key'}`);
    if (process.env.DEEPSEEK_API_KEY && process.env.ZHIPU_API_KEY && process.env.DASHSCOPE_API_KEY) {
      console.log(` Real AI services enabled - AI agents will use actual APIs`);
    } else {
      console.log(` Fallback mode - AI agents will use simulated responses`);
    }
    console.log(` Health check: http://${hostname}:${port}/api/health`);

    // 启动会话自动清理任务
    try {
      // 尝试加载清理任务（TypeScript可能需要编译）
      const { startSessionCleanupTask } = require('./src/lib/session-cleanup.ts');
      startSessionCleanupTask();
      console.log('🧹 Session cleanup task started');
    } catch (error) {
      console.warn('⚠️ Failed to start session cleanup task:', error.message);
      console.warn('   Session cleanup will not run automatically');
    }
  });
  // 
  process.on('SIGTERM', () => {
    console.log(' SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  process.on('SIGINT', () => {
    console.log(' SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch((error) => {
  console.error('Failed to prepare Next.js app:', error);
  console.error(' This might be a Prisma or configuration issue');
  process.exit(1);
});
