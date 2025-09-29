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
  console.log(`WebSocket连接建立: ideaId=${ideaId}`);

  // 将连接存储到活跃连接中
  const connectionId = `${ideaId}_${Date.now()}`;
  activeConnections.set(connectionId, { ws, ideaId, connectedAt: Date.now() });

  // 发送初始状态
  ws.send(JSON.stringify({
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
  }));

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

  ws.on('close', () => {
    console.log(`WebSocket连接关闭: ideaId=${ideaId}`);
    activeConnections.delete(connectionId);

    // 通知其他连接观众数量变化
    broadcastViewerCount(ideaId);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    activeConnections.delete(connectionId);
  });
}

// 启动AI竞价
async function handleStartBidding(ideaId, payload, ws) {
  try {
    console.log(`🎭 Starting AI bidding for idea: ${ideaId}`);

    const { ideaContent, sessionId } = payload;

    // 调用竞价API启动AI对话
    const response = await fetch(`http://localhost:${port}/api/bidding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ideaId,
        ideaContent,
        sessionId: sessionId || `session_${Date.now()}`
      })
    });

    if (response.ok) {
      const result = await response.json();

      // 通知客户端竞价已启动
      ws.send(JSON.stringify({
        type: 'bidding_started',
        payload: {
          sessionId: result.sessionId,
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

    } else {
      throw new Error('Failed to start bidding session');
    }

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

app.prepare().then(() => {
  console.log('✅ Next.js app prepared successfully');

  const server = createServer(async (req, res) => {
    try {
      // Add CORS headers for better compatibility
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const parsedUrl = parse(req.url, true);

      // Add request logging in production for debugging
      if (!dev) {
        console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Error occurred handling', req.url, err);

      // Better error response
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Internal Server Error',
          message: dev ? err.message : 'An error occurred',
          timestamp: new Date().toISOString()
        }));
      }
    }
  });

  // 创建WebSocket服务器
  const wss = new WebSocketServer({
    server
  });

  wss.on('connection', (ws, req) => {
    const url = parse(req.url, true);
    console.log(`WebSocket连接请求路径: ${url.pathname}`);

    // 检查是否是竞价WebSocket路径
    if (url.pathname.startsWith('/api/bidding/')) {
      const pathParts = url.pathname.split('/');
      const ideaId = pathParts[pathParts.length - 1] || 'default';

      console.log(`新的WebSocket连接: ideaId=${ideaId}`);

      // 处理WebSocket连接
      handleBiddingWebSocket(ws, ideaId, url.query);
    } else {
      console.log('非竞价WebSocket连接，关闭');
      ws.close(1002, 'Path not supported');
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
    console.log(`🔑 AI Services: DeepSeek(${process.env.DEEPSEEK_API_KEY ? '✅' : '❌'}), Zhipu(${process.env.ZHIPU_API_KEY ? '✅' : '❌'}), Dashscope(${process.env.DASHSCOPE_API_KEY ? '✅' : '❌'})`);
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