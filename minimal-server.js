#!/usr/bin/env node

// 最小化服务器启动脚本 - 用于诊断502错误
console.log('🔍 Starting minimal server for 502 diagnosis...');

const http = require('http');
const port = process.env.PORT || process.env.WEB_PORT || 4000;

// 1. 最基本的HTTP服务器测试
console.log('1️⃣ Testing basic HTTP server...');

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });

  if (req.url === '/favicon.ico') {
    res.end('');
    return;
  }

  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Server Diagnostic</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1>✅ Server is running!</h1>
      <p>Time: ${new Date().toISOString()}</p>
      <p>Port: ${port}</p>
      <p>Node: ${process.version}</p>
      <p>Platform: ${process.platform}</p>
      <p>Working Dir: ${process.cwd()}</p>
    </body>
    </html>
  `);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on http://0.0.0.0:${port}`);
  console.log('If you can see this, the basic server works');
  console.log('Now testing Next.js...');

  // Test Next.js loading after basic server works
  setTimeout(() => {
    console.log('2️⃣ Testing Next.js import...');
    try {
      const next = require('next');
      console.log('✅ Next.js imported successfully');

      console.log('3️⃣ Testing Prisma import...');
      try {
        const { PrismaClient } = require('@prisma/client');
        console.log('✅ Prisma imported successfully');

        console.log('4️⃣ All components loaded - 502 error likely in Next.js app.prepare()');
      } catch (prismaError) {
        console.error('❌ Prisma import failed:', prismaError.message);
      }
    } catch (nextError) {
      console.error('❌ Next.js import failed:', nextError.message);
    }
  }, 1000);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});