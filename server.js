const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || process.env.WEB_PORT || 4000;
const app = next({ dev, hostname: dev ? hostname : undefined, port });
const handle = app.getRequestHandler();

// WebSocket处理器
function handleBiddingWebSocket(ws, ideaId, query) {
  console.log(`WebSocket连接建立: ideaId=${ideaId}`);

  // 发送初始状态
  ws.send(JSON.stringify({
    type: 'session.init',
    payload: {
      ideaId,
      currentPhase: 'warmup',
      timeRemaining: 120,
      currentBids: {},
      highestBid: 50,
      viewerCount: 1,
      messages: []
    }
  }));

  // 处理客户端消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('收到客户端消息:', message.type);

      // 简单回复确认
      ws.send(JSON.stringify({
        type: 'ack',
        payload: { received: message.type, timestamp: Date.now() }
      }));
    } catch (error) {
      console.error('Failed to parse client message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket连接关闭: ideaId=${ideaId}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
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
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready on ws://${hostname}:${port}/api/bidding`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
    console.log(`> Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  });
});