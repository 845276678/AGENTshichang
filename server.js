// UTF-8?
process.env.LANG = 'zh_CN.UTF-8'
process.env.LC_ALL = 'zh_CN.UTF-8'
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
// ?
const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
if (missingEnvs.length > 0) {
  console.error('Missing required environment variables:', missingEnvs);
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

  ws.send(JSON.stringify({
    type: 'prediction_received',
    payload: {
      prediction,
      confidence,
      message: "Session status update from the AI bidding system."
    },
  }));
}

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

  console.log(`Broadcasted to ${broadcastCount} connections for idea: ${ideaId}`);
  return broadcastCount;
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
          maxTokens: 250
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
    finishRealAIBidding(ideaId, currentBids);
  }, 3000);
}
// AI
function finishRealAIBidding(ideaId, bids) {
  const highestBid = Math.max(...Object.values(bids));
  const avgBid = Object.values(bids).reduce((a, b) => a + b, 0) / Object.values(bids).length;
  // ?
  const winnerPersonaId = Object.keys(bids).find(personaId => bids[personaId] === highestBid);
  const winnerName = getPersonaName(winnerPersonaId);
  // ID
  const businessPlanSessionId = `bp_${ideaId}_${Date.now()}`;
  // edis
  global.businessPlanSessions = global.businessPlanSessions || new Map();
  global.businessPlanSessions.set(businessPlanSessionId, {
    ideaContent: '',
    highestBid,
    averageBid: Math.round(avgBid),
    finalBids: bids,
    winner: winnerPersonaId,
    winnerName: winnerName,
    aiMessages: [], // I
    supportedAgents: [],
    currentBids: bids,
    timestamp: Date.now(),
    ideaId
  });
  // 
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
      duration: 480000, // 8
      businessPlanUrl, // 
      businessPlanSessionId, // ID
      report: {
        summary: 'Based on insights from five expert agents, your idea received a strong positive evaluation.',
        recommendations: [
          'Combine technical and business insights to refine the solution.',
          'Clarify target users and market positioning in the proposal.',
          'Map out a realistic commercialization roadmap.',
          'Validate technical feasibility and long-term scalability.'
        ],
        winnerAnalysis: 'Winning agent ' + winnerName + ' offered the top bid of ' + highestBid + ' credits and will deliver a concise business plan overview.'
      }
    }
  });
  console.log(` REAL AI bidding completed. Highest bid: ${highestBid}?by ${winnerName}`);
  console.log(` Business plan session created: ${businessPlanSessionId}`);
}
// AI
function getSystemPromptForPersona(personaId) {
  const basePrompt = `
?
1. I
2. 
3. 
4. ?50-250?
5. ?
6. 
`;
  const prompts = {
    'tech-pioneer-alex': basePrompt + `
?
- ?
- ?
- 
- 
?
1. ?- ?
2. ?- 
3. ?- 
4. ?- ?
?..."`,
    'business-guru-beta': basePrompt + `
?
- ?
- ?
- ?
- 
?
1. ?- ?
2.  - 
3.  - 
4.  - ?
?3?.."`,
    'innovation-mentor-charlie': basePrompt + `
?
- ?
- 
- ?
- 
?
1. ?- 
2.  - ?
3. ?- ?
4. ?- 
??.."`,
    'market-insight-delta': basePrompt + `
?
- 
- ?
- ?
- 
?
1. ?- 
2.  - ?
3.  - ?
4. ?- ?
??%..."`,
    'investment-advisor-ivan': basePrompt + `
?
- ?
- ?
- 
- ?
?
1. ?- ?
2. ?- OI
3.  - ?
4. ?- ?
?..."`
  };
  return prompts[personaId] || personaId;
}
// I?
// Extract bid amount from AI message content
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
      // ?
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
// AI
function startSimulatedBidding(ideaId) {
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
      // 
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
      duration: 300000, // 5
      report: {
        summary: 'Based on five simulated agents, the idea earned a strong overall score.',
        recommendations: [
          'Further refine the technical architecture for clarity.',
          'Document the target market segments and core customer needs.',
          'Outline the commercialization plan with concrete milestones.'
        ]
      }
    }
  });
  console.log('Simulated bidding completed. Highest bid: ' + highestBid + ' credits');
}
// personaId?
function getPersonaName(personaId) {
  const personaNames = {
    'tech-pioneer-alex': 'Tech Pioneer Alex',
    'business-guru-beta': 'Business Strategist Beta',
    'innovation-mentor-charlie': 'Innovation Mentor Charlie',
    'market-insight-delta': 'Market Insight Delta',
    'investment-advisor-ivan': 'Investment Advisor Ivan'
  };
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
