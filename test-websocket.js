// 测试WebSocket连接的简单脚本
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4000/api/bidding/demo-idea-001');

ws.on('open', function open() {
  console.log('✅ WebSocket连接建立成功');

  // 发送测试消息
  ws.send(JSON.stringify({
    type: 'client.init',
    payload: {
      ideaId: 'demo-idea-001',
      userId: 'test-user',
      timestamp: Date.now()
    }
  }));
});

ws.on('message', function incoming(data) {
  const message = JSON.parse(data.toString());
  console.log('📨 收到服务器消息:', message.type);
  console.log('📄 消息内容:', JSON.stringify(message, null, 2));
});

ws.on('close', function close() {
  console.log('🔌 WebSocket连接已关闭');
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket错误:', err);
});

// 5秒后发送心跳测试
setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'heartbeat',
      timestamp: Date.now()
    }));
    console.log('💓 发送心跳包');
  }
}, 5000);

// 10秒后关闭连接
setTimeout(() => {
  ws.close();
  process.exit(0);
}, 10000);