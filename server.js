// 璁剧疆UTF-8缂栫爜鏀寔锛岃В鍐充腑鏂囦贡鐮侀棶棰?
process.env.LANG = 'zh_CN.UTF-8'
process.env.LC_ALL = 'zh_CN.UTF-8'

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || process.env.WEB_PORT || 8080;

console.log('馃殌 Starting server...');
console.log(`馃實 Environment: ${process.env.NODE_ENV}`);
console.log(`馃攲 Port: ${port}`);
console.log(`馃彔 Hostname: ${hostname}`);

// Comprehensive startup validation
console.log('馃攳 Running startup checks...');

// 妫€鏌ュ叧閿幆澧冨彉閲?
const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
if (missingEnvs.length > 0) {
  console.error('鉂?Missing required environment variables:', missingEnvs);
  process.exit(1);
}

// 妫€鏌ext.js鏋勫缓鏂囦欢
const fs = require('fs');
const path = require('path');

const buildManifestPath = path.join(process.cwd(), '.next', 'build-manifest.json');
if (!fs.existsSync(buildManifestPath)) {
  console.error('鉂?Next.js build manifest not found. Run `npm run build` first.');
  process.exit(1);
}

console.log('鉁?Build manifest found');

// 妫€鏌risma
try {
  console.log('馃梽锔? Checking Prisma...');
  const { PrismaClient } = require('@prisma/client');
  console.log('鉁?Prisma Client loaded successfully');

  // Test Prisma instantiation
  const testPrisma = new PrismaClient();
  console.log('鉁?Prisma Client instantiated successfully');

  // Don't connect here, just validate it can be created
  testPrisma.$disconnect().catch(() => {}); // Ignore disconnect errors

} catch (error) {
  console.error('鉂?Prisma Client failed to load:', error.message);
  if (!dev) {
    console.error('馃挕 Try running: npm run db:generate');
    console.error('馃挕 Or check DATABASE_URL configuration');
    process.exit(1);
  }
}

const app = next({ dev, hostname: dev ? hostname : undefined, port });
const handle = app.getRequestHandler();

// WebSocket澶勭悊鍣?- 鐪熷疄AI浜や簰鐗堟湰
const activeConnections = new Map(); // 瀛樺偍娲昏穬鐨刉ebSocket杩炴帴

function handleBiddingWebSocket(ws, ideaId, query) {
  console.log(`馃敆 澶勭悊WebSocket杩炴帴: ideaId=${ideaId}`, {
    query,
    readyState: ws.readyState
  });

  // 灏嗚繛鎺ュ瓨鍌ㄥ埌娲昏穬杩炴帴涓?
  const connectionId = `${ideaId}_${Date.now()}`;
  activeConnections.set(connectionId, { ws, ideaId, connectedAt: Date.now() });

  // 鍙戦€佸垵濮嬬姸鎬?
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
    console.log(`馃摛 鍙戦€佸垵濮嬪寲娑堟伅缁欒繛鎺?${connectionId}`);
  } catch (error) {
    console.error(`鉂?鍙戦€佸垵濮嬪寲娑堟伅澶辫触:`, error);
  }

  // 澶勭悊瀹㈡埛绔秷鎭?
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('鏀跺埌瀹㈡埛绔秷鎭?', message.type);

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
          console.log('鏈煡娑堟伅绫诲瀷:', message.type);
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
    console.log(`馃攲 WebSocket杩炴帴鍏抽棴: ideaId=${ideaId}, code=${code}, reason=${reason}`);
    activeConnections.delete(connectionId);

    // 閫氱煡鍏朵粬杩炴帴瑙備紬鏁伴噺鍙樺寲
    broadcastViewerCount(ideaId);
  });

  ws.on('error', (error) => {
    console.error('鉂?WebSocket閿欒:', {
      ideaId,
      connectionId,
      error: error.message,
      stack: error.stack
    });
    activeConnections.delete(connectionId);
  });

  // 鍙戦€亀elcome娑堟伅纭杩炴帴
  setTimeout(() => {
    try {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify({
          type: 'welcome',
          payload: {
            message: `娆㈣繋杩炴帴AI绔炰环绯荤粺锛乮deaId: ${ideaId}`,
            timestamp: Date.now()
          }
        }));
        console.log(`馃憢 鍙戦€佹杩庢秷鎭粰杩炴帴 ${connectionId}`);
      }
    } catch (error) {
      console.error('鉂?鍙戦€佹杩庢秷鎭け璐?', error);
    }
  }, 1000);
}

// 鍚姩AI绔炰环
async function handleStartBidding(ideaId, payload, ws) {
  try {
    console.log(`馃幁 Starting AI bidding for idea: ${ideaId}`);

    const { ideaContent, sessionId } = payload;

    // 鐩存帴璋冪敤鍐呴儴閫昏緫锛岄伩鍏嶈嚜寰幆HTTP璇锋眰
    console.log(`馃幁 Creating bidding session: ${sessionId} for idea: ${ideaId}`);

    // 閫氱煡瀹㈡埛绔珵浠峰凡鍚姩
    ws.send(JSON.stringify({
      type: 'bidding_started',
      payload: {
        sessionId: sessionId || `session_${Date.now()}_${ideaId}`,
        status: 'active',
        message: 'AI绔炰环宸插惎鍔紝涓撳浠鍦ㄥ垎鏋愭偍鐨勫垱鎰?..'
      }
    }));

    // 骞挎挱缁欐墍鏈夎繛鎺ュ埌姝や細璇濈殑瀹㈡埛绔?
    broadcastToSession(ideaId, {
      type: 'session_update',
      payload: {
        phase: 'warmup',
        status: 'active',
        message: 'AI涓撳鍥㈤槦寮€濮嬭瘎浼板垱鎰?
      }
    });

    // 鍚姩鐪熷疄AI瀵硅瘽娴佺▼锛屽鏋淎I鏈嶅姟涓嶅彲鐢ㄥ垯浣跨敤妯℃嫙娴佺▼
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

// 鏀寔AI瑙掕壊
async function handleSupportPersona(ideaId, payload, ws) {
  const { personaId } = payload;
  console.log(`馃憤 User supports persona: ${personaId}`);

  // 骞挎挱鏀寔淇℃伅
  broadcastToSession(ideaId, {
    type: 'persona_supported',
    payload: {
      personaId,
      timestamp: Date.now()
    }
  });
}

// 澶勭悊鐢ㄦ埛鍒涙剰琛ュ厖
async function handleIdeaSupplement(ideaId, payload, ws) {
  const { supplementContent, round } = payload;
  console.log(`馃挕 User supplements idea: ${supplementContent.substring(0, 50)}...`);

  // 骞挎挱鐢ㄦ埛琛ュ厖淇℃伅
  broadcastToSession(ideaId, {
    type: 'user_supplement',
    payload: {
      content: supplementContent,
      round,
      timestamp: Date.now(),
      message: '鐢ㄦ埛琛ュ厖浜嗗垱鎰忕粏鑺傦紝AI涓撳浠鍦ㄥ垎鏋?..'
    }
  });

  // 璁〢I涓撳浠洖搴旂敤鎴风殑琛ュ厖
  try {
    // 鍔ㄦ€佸鍏I鏈嶅姟绠＄悊鍣?
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

    // 閫夋嫨2涓狝I涓撳鏉ュ洖搴旂敤鎴疯ˉ鍏?
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
          systemPrompt: getSystemPromptForPersona(persona.id) + '\n\n鐢ㄦ埛鍒氬垰琛ュ厖浜嗘柊鐨勫垱鎰忎俊鎭紝璇烽拡瀵硅繖浜涙柊淇℃伅缁欏嚭浣犵殑涓撲笟璇勪环鍜屽缓璁€?,
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

        console.log(`馃挰 [SUPPLEMENT] ${persona.id}: ${response.content.substring(0, 60)}...`);

        // AI鍥炲簲闂撮殧
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));

      } catch (error) {
        console.error(`Error in AI supplement response for ${persona.id}:`, error);
      }
    }

  } catch (error) {
    console.error('Error handling idea supplement:', error);
  }
}

// 鎻愪氦棰勬祴
async function handleSubmitPrediction(ideaId, payload, ws) {
  const { prediction, confidence } = payload;
  console.log(`馃敭 User prediction: ${prediction}, confidence: ${confidence}`);

  ws.send(JSON.stringify({
    type: 'prediction_received',
    payload: {
      prediction,
      confidence,
      message: '棰勬祴宸叉彁浜わ紝绛夊緟鏈€缁堢粨鏋?..'
    }
  }));
}

// 骞挎挱缁欑壒瀹氫細璇濈殑鎵€鏈夎繛鎺?
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

  console.log(`馃摗 Broadcasted to ${broadcastCount} connections for idea: ${ideaId}`);
  return broadcastCount;
}

// 骞挎挱瑙備紬鏁伴噺鏇存柊
function broadcastViewerCount(ideaId) {
  const viewerCount = Array.from(activeConnections.values())
    .filter(conn => conn.ideaId === ideaId).length;

  broadcastToSession(ideaId, {
    type: 'viewer_count_update',
    payload: { viewerCount }
  });
}

// 瀵煎嚭骞挎挱鍑芥暟渚汚PI浣跨敤
global.broadcastToSession = broadcastToSession;

// 鐪熷疄AI璁ㄨ娴佺▼锛堜娇鐢ㄩ厤缃殑API瀵嗛挜锛?
async function startRealAIDiscussion(ideaId, ideaContent) {
  console.log(`馃 Starting REAL AI discussion for idea: ${ideaId}`);

  // 鍔ㄦ€佸鍏I鏈嶅姟绠＄悊鍣?
  let AIServiceManager;
  try {
    // 灏濊瘯鍔犺浇缂栬瘧鍚庣殑JS鐗堟湰
    AIServiceManager = require('./src/lib/ai-service-manager.cjs').default;
  } catch (error) {
    try {
      // 濡傛灉娌℃湁缂栬瘧鐗堟湰锛屽皾璇曚娇鐢╰s-node鍔犺浇TS鐗堟湰
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

  // 鏆栧満闃舵 - 姣忎釜AI浠嬬粛鑷繁
  for (let i = 0; i < aiPersonas.length; i++) {
    const persona = aiPersonas[i];

    try {
      console.log(`馃幁 Calling ${persona.id} via ${persona.provider}...`);

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

      // 骞挎挱鐪熷疄AI娑堟伅
      broadcastToSession(ideaId, {
        type: 'ai_message',
        message
      });

      console.log(`馃挰 [REAL] ${persona.id}: ${response.content.substring(0, 80)}...`);

      // AI涔嬮棿闂撮殧5-8绉掞紝缁欑敤鎴峰厖鍒嗛槄璇绘椂闂?
      await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));

    } catch (error) {
      console.error(`Error calling real AI for ${persona.id}:`, error);

      // 鍙戦€佸鐢ㄦ秷鎭?
      const fallbackMessage = {
        id: `fallback_${Date.now()}_${i}`,
        personaId: persona.id,
        phase: 'warmup',
        round: 1,
        type: 'speech',
        content: `澶у濂斤紝鎴戞槸${persona.id}鐨凙I涓撳銆傝繖涓垱鎰忓緢鏈夋剰鎬濓紝璁╂垜鍒嗘瀽涓€涓?..`,
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

  // 3绉掑悗寮€濮嬭璁洪樁娈?
  setTimeout(async () => {
    await startRealAIDiscussionPhase(ideaId, ideaContent, aiPersonas);
  }, 3000);
}

// 鐪熷疄AI璁ㄨ闃舵
async function startRealAIDiscussionPhase(ideaId, ideaContent, aiPersonas) {
  console.log(`馃挱 Starting REAL AI discussion phase for: ${ideaId}`);

  broadcastToSession(ideaId, {
    type: 'phase_change',
    phase: 'discussion',
    timestamp: Date.now(),
    message: '杩涘叆娣卞害璁ㄨ闃舵'
  });

  // 鍔ㄦ€佸鍏I鏈嶅姟绠＄悊鍣?
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

  // 杩涜2杞繁搴﹁璁猴紝涓棿绌挎彃鐢ㄦ埛浜掑姩鏈轰細
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

        console.log(`馃挰 [REAL] Discussion R${round} ${persona.id}: ${response.content.substring(0, 60)}...`);

        await new Promise(resolve => setTimeout(resolve, 6000 + Math.random() * 4000));

      } catch (error) {
        console.error(`Error in real AI discussion for ${persona.id}:`, error);
      }
    }

    // 鍦ㄦ瘡杞璁哄悗锛岀粰鐢ㄦ埛琛ュ厖鏈轰細
    if (round === 1) {
      console.log('馃挱 Sending user interaction prompt after round 1');
      broadcastToSession(ideaId, {
        type: 'user_interaction_prompt',
        payload: {
          message: '涓撳浠彁鍑轰簡涓€浜涙繁鍏ョ殑闂锛屾偍鎯宠ˉ鍏呮洿澶氬垱鎰忕粏鑺傚悧锛?,
          promptType: 'idea_supplement',
          timeLimit: 60, // 60绉掓椂闂撮檺鍒?
          round: round
        }
      });

      // 绛夊緟60绉掔敤鎴疯ˉ鍏呮椂闂?
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }

  // 5绉掑悗杩涘叆绔炰环闃舵
  setTimeout(async () => {
    await startRealAIBiddingPhase(ideaId, ideaContent, aiPersonas);
  }, 5000);
}

// 鐪熷疄AI绔炰环闃舵
async function startRealAIBiddingPhase(ideaId, ideaContent, aiPersonas) {
  console.log(`馃挵 Starting REAL AI bidding phase for: ${ideaId}`);

  broadcastToSession(ideaId, {
    type: 'phase_change',
    phase: 'bidding',
    timestamp: Date.now(),
    message: '杩涘叆婵€鐑堢珵浠烽樁娈?
  });

  // 鍔ㄦ€佸鍏I鏈嶅姟绠＄悊鍣?
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
          systemPrompt: getSystemPromptForPersona(persona.id) + '\n\n璇风粰鍑轰綘鐨勭珵浠凤紝鏍煎紡锛氭垜鍑轰环X鍏冿紝鍥犱负...',
          temperature: 0.6,
          maxTokens: 250
        });

        // 浠嶢I鍥炲簲涓彁鍙栫珵浠烽噾棰?
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

        console.log(`馃挵 [REAL] ${persona.id} bid: ${bidAmount}鍏僠);

        await new Promise(resolve => setTimeout(resolve, 7000 + Math.random() * 3000));

      } catch (error) {
        console.error(`Error in real AI bidding for ${persona.id}:`, error);

        // 浣跨敤榛樿绔炰环
        const defaultBid = 100 + Math.floor(Math.random() * 150);
        currentBids[persona.id] = defaultBid;
      }
    }
  }

  // 3绉掑悗缁撴潫绔炰环
  setTimeout(() => {
    finishRealAIBidding(ideaId, currentBids);
  }, 3000);
}

// 缁撴潫鐪熷疄AI绔炰环
function finishRealAIBidding(ideaId, bids) {
  const highestBid = Math.max(...Object.values(bids));
  const avgBid = Object.values(bids).reduce((a, b) => a + b, 0) / Object.values(bids).length;

  // 鎵惧埌鑾疯儨鑰?
  const winnerPersonaId = Object.keys(bids).find(personaId => bids[personaId] === highestBid);
  const winnerName = getPersonaName(winnerPersonaId);

  // 鐢熸垚鍟嗕笟璁″垝浼氳瘽ID
  const businessPlanSessionId = `bp_${ideaId}_${Date.now()}`;

  // 灏嗗晢涓氳鍒掓暟鎹瓨鍌ㄥ湪鍏ㄥ眬鍙橀噺涓紙鐢熶骇鐜搴斾娇鐢≧edis绛夛級
  global.businessPlanSessions = global.businessPlanSessions || new Map();
  global.businessPlanSessions.set(businessPlanSessionId, {
    ideaContent: '鐢ㄦ埛鍒涙剰',
    highestBid,
    averageBid: Math.round(avgBid),
    finalBids: bids,
    winner: winnerPersonaId,
    winnerName: winnerName,
    aiMessages: [], // 杩欓噷搴旇鏀堕泦鎵€鏈堿I娑堟伅
    supportedAgents: [],
    currentBids: bids,
    timestamp: Date.now(),
    ideaId
  });

  // 鐢熸垚绠€娲佺殑鍟嗕笟璁″垝閾炬帴
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
      duration: 480000, // 8鍒嗛挓
      businessPlanUrl, // 绠€娲佺殑鍟嗕笟璁″垝閾炬帴
      businessPlanSessionId, // 浼氳瘽ID渚涘鎴风浣跨敤
      report: {
        summary: '鍩轰簬5浣嶇湡瀹濧I涓撳鐨勪笓涓氬垎鏋愶紝鎮ㄧ殑鍒涙剰鑾峰緱浜嗗叏闈㈣瘎浼般€?,
        recommendations: [
          '寤鸿缁撳悎鎶€鏈拰鍟嗕笟鍙岄噸瑙嗚浼樺寲鏂规',
          '娣卞叆鍒嗘瀽鐩爣鐢ㄦ埛闇€姹傚拰甯傚満瀹氫綅',
          '鍒跺畾鍒嗛樁娈靛疄鏂界殑鍟嗕笟鍖栬矾绾垮浘',
          '鑰冭檻鎶€鏈疄鐜扮殑鍙鎬у拰鎵╁睍鎬?
        ],
        winnerAnalysis: `鑾疯儨涓撳${winnerName}璁や负姝ゅ垱鎰忔渶鍏蜂环鍊硷紝鍑轰环${highestBid}鍏冦€備笓瀹跺皢涓烘偍鎻愪緵娣卞害鐨勫晢涓氳鍒掓寚瀵笺€俙
      }
    }
  });

  console.log(`馃帀 REAL AI bidding completed. Highest bid: ${highestBid}鍏?by ${winnerName}`);
  console.log(`馃搵 Business plan session created: ${businessPlanSessionId}`);
}

// 鑾峰彇AI瑙掕壊鐨勭郴缁熸彁绀鸿瘝
function getSystemPromptForPersona(personaId) {
  const basePrompt = `
閲嶈鎸囧鍘熷垯锛?
1. 浣犳鍦ㄥ弬涓庝竴涓狝I鍒涙剰绔炰环鑺傜洰锛岄渶瑕佹繁鍏ュ垎鏋愮敤鎴峰垱鎰忥紝缁欏嚭涓撲笟鑰岀妧鍒╃殑鐐硅瘎
2. 涓嶈瀹㈠璇濓紝鐩存帴鎸囧嚭闂鍜屾満浼氾紝淇濇寔涓撲笟鐨勬壒鍒ゆ€ф€濈淮
3. 鏍规嵁璁ㄨ闃舵璋冩暣璇█椋庢牸锛氶鐑湡绠€娲佷粙缁嶏紝璁ㄨ鏈熸繁鍏ュ垎鏋愬拰灏栭攼璐ㄧ枒锛岀珵浠锋湡琛ㄨ揪鎬佸害
4. 姣忔鍙戣█鎺у埗鍦?50-250瀛楋紝淇濇寔淇℃伅瀵嗗害楂樿€屾湁鍔?
5. 鐢ㄧ涓€浜虹О璇磋瘽锛屼綋鐜颁釜鎬у寲瑙傜偣鍜屼笓涓氬垽鏂?
6. 蹇呴』缁撳悎鍏蜂綋鍒涙剰鍐呭杩涜鍒嗘瀽锛岄伩鍏嶇┖娉涚殑濂楄瘽
`;

  const prompts = {
    'tech-pioneer-alex': basePrompt + `
浣犳槸鑹惧厠鏂紝璧勬繁鎶€鏈笓瀹跺拰鏋舵瀯甯堬紝浠ユ妧鏈弗璋ㄨ憲绉般€?
- 涓撻暱锛氭妧鏈彲琛屾€с€佺郴缁熸灦鏋勩€佸紑鍙戞垚鏈€佹妧鏈闄╄瘎浼?
- 璇磋瘽椋庢牸锛氱悊鎬у瑙傦紝閫昏緫娓呮櫚锛屽枩娆㈢敤鏁版嵁鍜屾妧鏈寚鏍囪璇濓紝瀵规妧鏈棶棰樻涓嶇暀鎯?
- 鍏虫敞閲嶇偣锛氭妧鏈疄鐜伴毦搴︺€佸紑鍙戝懆鏈熴€佸彲鎵╁睍鎬с€佹妧鏈垱鏂板害銆佹妧鏈€哄姟椋庨櫓
- 涓€х壒鐐癸細杩芥眰鎶€鏈畬缇庯紝浣嗕篃鍏虫敞瀹為檯鍙搷浣滄€э紝浼氱洿鎺ユ寚鍑烘妧鏈笂鐨勪笉鍙涔嬪

浣犵殑鍒嗘瀽蹇呴』鍖呮嫭锛?
1. 鎶€鏈灦鏋勫悎鐞嗘€ц瘎浼?- 鐩存帴鎸囧嚭鎶€鏈€夊瀷鏄惁鍚堥€?
2. 瀹炵幇澶嶆潅搴﹂噺鍖?- 缁欏嚭鍏蜂綋鐨勫紑鍙戝伐浣滈噺浼扮畻
3. 鎶€鏈闄╄瘑鍒?- 鏄庣‘鎸囧嚭娼滃湪鐨勬妧鏈櫡闃卞拰瑙ｅ喅鏂规
4. 鍒涙柊搴﹁瘎浠?- 鍒ゆ柇鏄惁涓虹幇鏈夋妧鏈殑绠€鍗曠粍鍚堣繕鏄湡姝ｅ垱鏂?
璇磋瘽绀轰緥锛?浠庢妧鏈搴︾湅锛岃繖涓柟妗堝湪鏁版嵁澶勭悊涓婂瓨鍦ㄦ槑鏄剧殑鎬ц兘鐡堕..."`,

    'business-guru-beta': basePrompt + `
浣犳槸鑰佺帇锛岀粡楠屼赴瀵岀殑鍟嗕笟椤鹃棶鍜屼紒涓氬锛屼互鍟嗕笟鍡呰鏁忛攼钁楃О銆?
- 涓撻暱锛氬晢涓氭ā寮忋€佺泩鍒╁垎鏋愩€佸競鍦虹瓥鐣ャ€佸晢涓氫环鍊艰瘎浼?
- 璇磋瘽椋庢牸锛氬姟瀹炵簿鏄庯紝鐩村嚮瑕佸锛屽杽浜庡彂鐜板晢涓氭満浼氬拰椋庨櫓锛屽涓嶅垏瀹為檯鐨勬兂娉曟涓嶅姘?
- 鍏虫敞閲嶇偣锛氱泩鍒╂ā寮忋€佸競鍦鸿妯°€佹姇璧勫洖鎶ャ€佸晢涓氬寲璺緞銆佺幇閲戞祦鍙寔缁€?
- 涓€х壒鐐癸細缁撴灉瀵煎悜锛岄噸瑙嗘暟鎹紝浣嗕篃鏈夊晢涓氱洿瑙夛紝浼氱洿鎺ヨ川鐤戝晢涓氶€昏緫婕忔礊

浣犵殑鍒嗘瀽蹇呴』鍖呮嫭锛?
1. 鐩堝埄妯″紡鍙鎬?- 鏄庣‘鎸囧嚭濡備綍璧氶挶锛岀敤鎴蜂粯璐规剰鎰垮浣?
2. 甯傚満瑙勬ā閲忓寲 - 缁欏嚭鍏蜂綋鐨勫競鍦哄閲忓拰澧為暱棰勬湡
3. 绔炰簤鐜鍒嗘瀽 - 璇嗗埆涓昏绔炰簤瀵规墜鍜屽樊寮傚寲浼樺娍
4. 鍟嗕笟鍖栨椂闂寸嚎 - 鍒ゆ柇澶氶暱鏃堕棿鑳藉疄鐜扮泩鍒?
璇磋瘽绀轰緥锛?鍟嗕笟閫昏緫涓嶆竻鏅帮紝浣犵殑鐢ㄦ埛鍑粈涔堜粯璐癸紵甯傚満涓婂凡缁忔湁3瀹剁被浼间骇鍝?.."`,

    'innovation-mentor-charlie': basePrompt + `
浣犳槸灏忕惓锛屽瘜鏈夊垱閫犲姏鐨勮璁″笀鍜岀敤鎴蜂綋楠屼笓瀹讹紝浠ョ敤鎴锋礊瀵熸繁鍒昏憲绉般€?
- 涓撻暱锛氱敤鎴蜂綋楠屻€佷骇鍝佸垱鏂般€佽璁℃€濈淮銆佺ぞ浼氫环鍊?
- 璇磋瘽椋庢牸锛氬瘜鏈夋縺鎯咃紝鍏呮弧鎯宠薄鍔涳紝鍏虫敞浜烘枃浠峰€硷紝浣嗗鐢ㄦ埛浣撻獙闂缁濅笉濡ュ崗
- 鍏虫敞閲嶇偣锛氱敤鎴烽渶姹傜棝鐐广€佸垱鏂扮▼搴︺€佺ぞ浼氬奖鍝嶃€佷綋楠岃璁°€佹儏鎰熻繛鎺?
- 涓€х壒鐐癸細鎰熸€т笌鐞嗘€у苟閲嶏紝杩芥眰鍒涙柊鐨勫悓鏃跺叧娉ㄥ疄鐢ㄦ€э紝浼氱洿鎺ユ寚鍑虹敤鎴蜂綋楠岀殑缂洪櫡

浣犵殑鍒嗘瀽蹇呴』鍖呮嫭锛?
1. 鐢ㄦ埛闇€姹傜湡瀹炴€?- 璐ㄧ枒鏄惁涓轰吉闇€姹傛垨杩囧害璁捐
2. 鐢ㄦ埛浣撻獙娴佺▼ - 鍒嗘瀽浣跨敤璺緞涓殑鎽╂摝鐐?
3. 鍒涙柊浠峰€艰瘎浼?- 鍒ゆ柇鏄惁鐪熸瑙ｅ喅浜嗙敤鎴烽棶棰?
4. 绀句細浠峰€艰础鐚?- 璇勪及瀵圭ぞ浼氱殑绉瀬褰卞搷
璇磋瘽绀轰緥锛?鐢ㄦ埛鐪熺殑闇€瑕佽繖涔堝鏉傜殑鍔熻兘鍚楋紵鎴戠湅鍒扮殑鏄负浜嗗垱鏂拌€屽垱鏂?.."`,

    'market-insight-delta': basePrompt + `
浣犳槸闃夸鸡锛屾晱閿愮殑甯傚満鍒嗘瀽甯堝拰钀ラ攢涓撳锛屼互甯傚満鍒ゆ柇绮惧噯钁楃О銆?
- 涓撻暱锛氬競鍦哄垎鏋愩€佺珵浜夌爺绌躲€佽秼鍔块娴嬨€佽惀閿€绛栫暐
- 璇磋瘽椋庢牸锛氭暟鎹┍鍔紝瀹㈣鐞嗘€э紝鍠勪簬寮曠敤甯傚満鏁版嵁鍜屾渚嬶紝瀵瑰競鍦洪娴嬭礋璐?
- 鍏虫敞閲嶇偣锛氬競鍦洪渶姹傘€佺珵浜夋牸灞€銆佸彂灞曡秼鍔裤€佺洰鏍囩敤鎴枫€佽惀閿€鍙鎬?
- 涓€х壒鐐癸細涓ヨ皑缁嗚嚧锛屽枩娆㈢敤鏁版嵁璇磋瘽锛屼絾涔熻兘娲炲療甯傚満鏈轰細锛屼細鐩存帴鎸囧嚭甯傚満瀹氫綅閿欒

浣犵殑鍒嗘瀽蹇呴』鍖呮嫭锛?
1. 鐩爣甯傚満鍑嗙‘鎬?- 璐ㄧ枒鐢ㄦ埛鐢诲儚鏄惁娓呮櫚鍑嗙‘
2. 绔炰簤鏍煎眬鍒嗘瀽 - 璇嗗埆鐩存帴鍜岄棿鎺ョ珵浜夊鎵?
3. 甯傚満鏃舵満璇勪及 - 鍒ゆ柇鏄惁涓鸿繘鍏ュ競鍦虹殑鏈€浣虫椂鏈?
4. 钀ラ攢绛栫暐鍙鎬?- 璇勪及鎺ㄥ箍鏂规鐨勭幇瀹炴€?
璇磋瘽绀轰緥锛?鏍规嵁鏈€鏂扮殑琛屼笟鏁版嵁锛岃繖涓粏鍒嗗競鍦虹殑澧為暱鐜囧彧鏈?%锛岃繙浣庝簬浣犵殑棰勬湡..."`,

    'investment-advisor-ivan': basePrompt + `
浣犳槸鏉庡崥锛岃皑鎱庣殑鎶曡祫涓撳鍜岃储鍔￠【闂紝浠ラ闄╂帶鍒朵弗鏍艰憲绉般€?
- 涓撻暱锛氭姇璧勪环鍊艰瘎浼般€侀闄╁垎鏋愩€佽储鍔″缓妯°€佸洖鎶ラ鏈?
- 璇磋瘽椋庢牸锛氳皑鎱庣悊鎬э紝閲嶈椋庨櫓鎺у埗锛屼絾涔熻兘璇嗗埆楂樹环鍊兼満浼氾紝瀵硅储鍔℃暟鎹姹備弗鏍?
- 鍏虫敞閲嶇偣锛氭姇璧勯闄┿€佸洖鎶ラ鏈熴€佽祫閲戦渶姹傘€侀€€鍑虹瓥鐣ャ€佽储鍔″仴搴峰害
- 涓€х壒鐐癸細淇濆畧涓甫鏈夋礊瀵熷姏锛屾棦璋ㄦ厧鍙堟暍浜庢姇璧勪紭璐ㄩ」鐩紝浼氱洿鎺ユ寚鍑鸿储鍔￠闄?

浣犵殑鍒嗘瀽蹇呴』鍖呮嫭锛?
1. 璧勯噾闇€姹傚悎鐞嗘€?- 璇勪及鍚姩璧勯噾鍜岃繍钀ヨ祫閲戦绠?
2. 鎶曡祫鍥炴姤鐜囬娴?- 缁欏嚭鍏蜂綋鐨凴OI鍜屽洖鏀舵湡
3. 椋庨櫓鍥犵礌璇嗗埆 - 鏄庣‘鎸囧嚭涓昏鎶曡祫椋庨櫓鐐?
4. 閫€鍑虹瓥鐣ヨ瘎浼?- 鍒嗘瀽鏈潵鐨勫彉鐜拌矾寰?
璇磋瘽绀轰緥锛?浠庢姇璧勮搴︾湅锛岃繖涓」鐩殑璧勯噾鍥炴敹鏈熻繃闀匡紝椋庨櫓鏀剁泭姣斾笉鍖归厤..."`
  };

  return prompts[personaId] || `浣犳槸${personaId}锛岃淇濇寔涓撲笟鎬у拰瑙掕壊涓€鑷存€э紝瀵圭敤鎴峰垱鎰忚繘琛屾繁鍏ュ垎鏋愬拰鐘€鍒╃偣璇勩€俙;
}

// 浠嶢I鍝嶅簲涓彁鍙栫珵浠烽噾棰?
function extractBidAmount(content) {
  const patterns = [
    /(\d+)鍏?,
    /鍑轰环\s*(\d+)/,
    /浠锋牸\s*(\d+)/,
    /浼板€糪s*(\d+)/,
    /(\d+)\s*鍧?,
    /鎴戠殑鍑轰环鏄?\s*(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const amount = parseInt(match[1]);
      return Math.min(Math.max(amount, 80), 500); // 闄愬埗鍦?0-500涔嬮棿
    }
  }

  // 榛樿闅忔満鍊?
  return Math.floor(Math.random() * 200) + 120;
}

// 浠庡洖搴斿唴瀹瑰垽鏂儏缁?
function determineEmotion(content) {
  if (content.includes('婵€鍔?) || content.includes('澶') || content.includes('鎯婅壋') || content.includes('鍏村')) return 'excited';
  if (content.includes('鎷呭績') || content.includes('椋庨櫓') || content.includes('鎸戞垬') || content.includes('鍥伴毦')) return 'worried';
  if (content.includes('鑷俊') || content.includes('纭俊') || content.includes('鑲畾') || content.includes('鐩镐俊')) return 'confident';
  if (content.includes('闂') || content.includes('涓嶅お') || content.includes('鎬€鐤?)) return 'worried';
  return 'neutral';
}

// 妯℃嫙AI璁ㄨ娴佺▼锛堝湪鐪熷疄AI API閰嶇疆涔嬪墠浣跨敤锛?
function simulateAIDiscussion(ideaId, ideaContent) {
  console.log(`馃幁 Starting simulated AI discussion for idea: ${ideaId}`);

  const aiPersonas = [
    {
      id: 'tech-pioneer-alex',
      name: '鎶€鏈厛閿嬭壘鍏嬫柉',
      responses: [
        '浠庢妧鏈搴︽潵鐪嬶紝杩欎釜鍒涙剰鍏锋湁寰堝己鐨勫彲瀹炵幇鎬с€?,
        '鎴戣涓哄彲浠ラ噰鐢ㄥ井鏈嶅姟鏋舵瀯鏉ュ疄鐜拌繖涓柟妗堛€?,
        '鎶€鏈鏉傚害涓瓑锛屽紑鍙戝懆鏈熷ぇ绾﹂渶瑕?涓湀銆?
      ]
    },
    {
      id: 'business-guru-beta',
      name: '鍟嗕笟鏅哄泭璐濆',
      responses: [
        '杩欎釜鍒涙剰鐨勫晢涓氭ā寮忓緢鏈夋綔鍔涳紝鐩爣甯傚満寰堟槑纭€?,
        '鎴戝缓璁噰鐢ㄨ闃呭埗鐨勭泩鍒╂ā寮忋€?,
        '棰勮18涓湀鍐呭彲浠ユ敹鍥炴姇璧勬垚鏈€?
      ]
    },
    {
      id: 'innovation-mentor-charlie',
      name: '鍒涙柊瀵煎笀鏌ョ悊',
      responses: [
        '杩欎釜鍒涙剰鐨勭敤鎴蜂綋楠岃璁″緢閲嶈锛岄渶瑕佹敞閲嶄氦浜掔粏鑺傘€?,
        '寤鸿鍔犲叆鏇村涓€у寲鍏冪礌鏉ユ彁鍗囩敤鎴风矘鎬с€?,
        '浠庡垱鏂拌搴︾湅锛岃繖涓柟妗堢‘瀹炴湁鐙壒涔嬪銆?
      ]
    },
    {
      id: 'market-insight-delta',
      name: '甯傚満娲炲療榛涙媺',
      responses: [
        '甯傚満璋冪爺鏄剧ず锛岀敤鎴峰杩欑被浜у搧鐨勯渶姹傚湪澧為暱銆?,
        '绔炲搧鍒嗘瀽琛ㄦ槑鎴戜滑鏈夋槑鏄剧殑宸紓鍖栦紭鍔裤€?,
        '寤鸿閲嶇偣鍏虫敞涓€浜岀嚎鍩庡競鐨勫勾杞荤敤鎴风兢浣撱€?
      ]
    },
    {
      id: 'investment-advisor-ivan',
      name: '鎶曡祫椤鹃棶浼婁竾',
      responses: [
        '浠庢姇璧勮搴︾湅锛岃繖涓」鐩殑椋庨櫓鏄彲鎺х殑銆?,
        '寤鸿鍒嗛樁娈垫姇璧勶紝鍏堝仛MVP楠岃瘉甯傚満鍙嶉銆?,
        '棰勬湡鎶曡祫鍥炴姤鐜囧湪15-25%涔嬮棿銆?
      ]
    }
  ];

  let messageIndex = 0;
  const totalMessages = aiPersonas.length * 3; // 姣忎釜AI鍙?鏉℃秷鎭?

  const sendNextMessage = () => {
    if (messageIndex >= totalMessages) {
      // 璁ㄨ缁撴潫锛岃繘鍏ョ珵浠烽樁娈?
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

    // 骞挎挱AI娑堟伅
    broadcastToSession(ideaId, {
      type: 'ai_message',
      message
    });

    console.log(`馃挰 ${persona.name}: ${response}`);

    messageIndex++;
    setTimeout(sendNextMessage, 3000 + Math.random() * 2000); // 3-5绉掗棿闅?
  };

  // 寮€濮嬪彂閫佹秷鎭?
  setTimeout(sendNextMessage, 1000);
}

// 妯℃嫙AI绔炰环闃舵
function startSimulatedBidding(ideaId) {
  console.log(`馃挵 Starting simulated bidding for idea: ${ideaId}`);

  broadcastToSession(ideaId, {
    type: 'phase_change',
    phase: 'bidding',
    timestamp: Date.now(),
    message: '杩涘叆婵€鐑堢珵浠烽樁娈?
  });

  const bids = {
    'tech-pioneer-alex': 150,
    'business-guru-beta': 200,
    'innovation-mentor-charlie': 120,
    'market-insight-delta': 180,
    'investment-advisor-ivan': 160
  };

  const personaNames = {
    'tech-pioneer-alex': '鎶€鏈厛閿嬭壘鍏嬫柉',
    'business-guru-beta': '鍟嗕笟鏅哄泭璐濆',
    'innovation-mentor-charlie': '鍒涙柊瀵煎笀鏌ョ悊',
    'market-insight-delta': '甯傚満娲炲療榛涙媺',
    'investment-advisor-ivan': '鎶曡祫椤鹃棶浼婁竾'
  };

  let bidIndex = 0;
  const personaIds = Object.keys(bids);

  const sendNextBid = () => {
    if (bidIndex >= personaIds.length) {
      // 绔炰环缁撴潫
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
      content: `鎴戝嚭浠?{bidAmount}鍏冿紝鍥犱负杩欎釜鍒涙剰鍏锋湁寰堝ソ鐨?{bidIndex % 2 === 0 ? '鎶€鏈环鍊? : '鍟嗕笟娼滃姏'}銆俙,
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

    console.log(`馃挵 ${personaNames[personaId]} bid: ${bidAmount}鍏僠);

    bidIndex++;
    setTimeout(sendNextBid, 4000 + Math.random() * 2000); // 4-6绉掗棿闅?
  };

  setTimeout(sendNextBid, 2000);
}

// 缁撴潫妯℃嫙绔炰环
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
      duration: 300000, // 5鍒嗛挓
      report: {
        summary: '鍩轰簬5浣岮I涓撳鐨勪笓涓氬垎鏋愶紝鎮ㄧ殑鍒涙剰鑾峰緱浜嗙患鍚堣瘎浼般€?,
        recommendations: [
          '寤鸿杩涗竴姝ュ畬鍠勬妧鏈柟妗堢粏鑺?,
          '娣卞叆璋冪爺鐩爣甯傚満鐢ㄦ埛闇€姹?,
          '鍒跺畾璇︾粏鐨勫晢涓氬寲瀹炴柦璁″垝'
        ]
      }
    }
  });

  console.log(`馃帀 Simulated bidding completed. Highest bid: ${highestBid}鍏僠);
}

// 鏍规嵁personaId鑾峰彇瀵瑰簲鐨勪腑鏂囧悕绉?
function getPersonaName(personaId) {
  const personaNames = {
    'tech-pioneer-alex': '鑹惧厠鏂?,
    'business-guru-beta': '鑰佺帇',
    'innovation-mentor-charlie': '灏忕惓',
    'market-insight-delta': '闃夸鸡',
    'investment-advisor-ivan': '鏉庡崥'
  };
  return personaNames[personaId] || personaId;
}

app.prepare().then(() => {
  console.log('鉁?Next.js app prepared successfully');

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

      // 娣诲姞WebSocket鍋ュ悍妫€鏌ョ鐐?
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
      console.error('鉂?Error occurred handling', req.url, err);

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

  // 鍒涘缓WebSocket鏈嶅姟鍣?
  const wss = new WebSocketServer({
    server,
    perMessageDeflate: false, // 绂佺敤鍘嬬缉浠ラ伩鍏峑eabur浠ｇ悊闂
    clientTracking: true // 鍚敤瀹㈡埛绔窡韪?
  });

  // 鐩戝惉鏈嶅姟鍣ㄧ殑upgrade浜嬩欢锛岀‘淇漌ebSocket鍗囩骇姝ｇ‘澶勭悊
  server.on('upgrade', (request, socket, head) => {
    console.log('馃攧 HTTP鍗囩骇鍒癢ebSocket:', {
      url: request.url,
      headers: request.headers
    });

    // 楠岃瘉WebSocket鍗囩骇璇锋眰
    if (request.url.startsWith('/api/bidding/')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      console.warn('鉂?鎷掔粷WebSocket鍗囩骇: 涓嶆敮鎸佺殑璺緞', request.url);
      socket.destroy();
    }
  });

  wss.on('connection', (ws, req) => {
    const url = parse(req.url, true);
    console.log(`馃攲 WebSocket杩炴帴璇锋眰:`, {
      path: url.pathname,
      query: url.query,
      host: req.headers.host,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']
    });

    // 妫€鏌ユ槸鍚︽槸绔炰环WebSocket璺緞
    if (url.pathname.startsWith('/api/bidding/')) {
      const pathParts = url.pathname.split('/');
      const ideaId = pathParts[pathParts.length - 1] || 'default';

      console.log(`鉁?鎺ュ彈WebSocket杩炴帴: ideaId=${ideaId}, path=${url.pathname}`);

      // 澶勭悊WebSocket杩炴帴
      handleBiddingWebSocket(ws, ideaId, url.query);
    } else {
      console.warn(`鉂?鎷掔粷WebSocket杩炴帴: 涓嶆敮鎸佺殑璺緞 ${url.pathname}`);
      ws.close(1002, `Path not supported: ${url.pathname}`);
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('鉂?Server failed to start:', err);
      process.exit(1);
    }
    console.log(`鉁?Server ready on http://${hostname}:${port}`);
    console.log(`馃攲 WebSocket server ready on ws://${hostname}:${port}/api/bidding`);
    console.log(`馃實 Environment: ${process.env.NODE_ENV}`);
    console.log(`馃捑 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

    // 璇︾粏鐨凙I鏈嶅姟鐘舵€佹鏌?
    console.log(`馃攽 AI Services Status:`);
    console.log(`  DeepSeek: ${process.env.DEEPSEEK_API_KEY ? '鉁?Configured' : '鉂?Missing API Key'}`);
    console.log(`  Zhipu GLM: ${process.env.ZHIPU_API_KEY ? '鉁?Configured' : '鉂?Missing API Key'}`);
    console.log(`  Qwen (Dashscope): ${process.env.DASHSCOPE_API_KEY ? '鉁?Configured' : '鉂?Missing API Key'}`);

    if (process.env.DEEPSEEK_API_KEY && process.env.ZHIPU_API_KEY && process.env.DASHSCOPE_API_KEY) {
      console.log(`馃 Real AI services enabled - AI agents will use actual APIs`);
    } else {
      console.log(`馃幁 Fallback mode - AI agents will use simulated responses`);
    }

    console.log(`馃摗 Health check: http://${hostname}:${port}/api/health`);
  });

  // 浼橀泤鍏抽棴澶勭悊
  process.on('SIGTERM', () => {
    console.log('馃洃 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('鉁?Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('馃洃 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('鉁?Server closed');
      process.exit(0);
    });
  });
}).catch((error) => {
  console.error('鉂?Failed to prepare Next.js app:', error);
  console.error('馃挕 This might be a Prisma or configuration issue');
  process.exit(1);
});
