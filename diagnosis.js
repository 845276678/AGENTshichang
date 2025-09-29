#!/usr/bin/env node

// Production diagnosis script for 502 errors
console.log('🔍 Starting production environment diagnosis...\n');

// 1. Check environment variables
console.log('1️⃣ Environment Variables:');
const requiredEnvs = [
  'NODE_ENV',
  'PORT',
  'WEB_PORT',
  'HOSTNAME',
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DEEPSEEK_API_KEY',
  'ZHIPU_API_KEY',
  'DASHSCOPE_API_KEY'
];

requiredEnvs.forEach(env => {
  const value = process.env[env];
  const status = value ? '✅' : '❌';
  const displayValue = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET'].includes(env) && value
    ? value.slice(0, 20) + '...'
    : value || 'NOT SET';
  console.log(`  ${status} ${env}: ${displayValue}`);
});

console.log('\n2️⃣ Node.js Environment:');
console.log(`  📦 Node Version: ${process.version}`);
console.log(`  🏗️  Platform: ${process.platform}`);
console.log(`  💽 Architecture: ${process.arch}`);
console.log(`  📂 Working Directory: ${process.cwd()}`);

// 3. Check critical files
console.log('\n3️⃣ Critical Files:');
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'package.json',
  'next.config.js',
  'server.js',
  'prisma/schema.prisma',
  '.next/build-manifest.json'
];

criticalFiles.forEach(file => {
  try {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  } catch (error) {
    console.log(`  ❌ ${file} (Error: ${error.message})`);
  }
});

// 4. Check Prisma
console.log('\n4️⃣ Prisma Status:');
try {
  const { PrismaClient } = require('@prisma/client');
  console.log('  ✅ Prisma Client can be imported');

  // Try to create client (don't connect yet)
  try {
    const prisma = new PrismaClient();
    console.log('  ✅ Prisma Client can be instantiated');

    // Try basic connection test
    prisma.$connect().then(() => {
      console.log('  ✅ Prisma database connection successful');
      prisma.$disconnect();
    }).catch(error => {
      console.log(`  ❌ Prisma database connection failed: ${error.message}`);
    });

  } catch (clientError) {
    console.log(`  ❌ Failed to create Prisma Client: ${clientError.message}`);
  }
} catch (importError) {
  console.log(`  ❌ Failed to import Prisma Client: ${importError.message}`);
}

// 5. Check Next.js build
console.log('\n5️⃣ Next.js Build Status:');
try {
  const buildManifest = require('./.next/build-manifest.json');
  console.log('  ✅ Build manifest exists');
  console.log(`  📄 Pages: ${Object.keys(buildManifest.pages || {}).length}`);
} catch (error) {
  console.log(`  ❌ Build manifest missing or invalid: ${error.message}`);
}

// 6. Check WebSocket server capability
console.log('\n6️⃣ WebSocket Server Check:');
try {
  const { WebSocketServer } = require('ws');
  console.log('  ✅ WebSocket library available');
} catch (error) {
  console.log(`  ❌ WebSocket library missing: ${error.message}`);
}

// 7. Network connectivity test
console.log('\n7️⃣ Network Test:');
const http = require('http');
const port = process.env.PORT || process.env.WEB_PORT || 4000;

const testServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server OK');
});

testServer.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(`  ❌ Cannot bind to port ${port}: ${err.message}`);
  } else {
    console.log(`  ✅ Can bind to port ${port}`);
    testServer.close();
  }
});

console.log('\n🎯 Diagnosis complete. Check for ❌ markers above.\n');