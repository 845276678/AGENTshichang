// Full system status check
const { execSync } = require('child_process');

console.log('========================================');
console.log('   AI Agent Marketplace - System Status');
console.log('========================================\n');

// Check Next.js dev server (port 4000)
console.log('1️⃣  Next.js Dev Server (Port 4000)');
try {
  const result4000 = execSync('netstat -ano | findstr :4000', { encoding: 'utf-8' });
  const lines = result4000.split('\n').filter(line => line.includes('LISTENING'));
  if (lines.length > 0) {
    const match = lines[0].match(/\s+(\d+)\s*$/);
    const pid = match ? match[1] : 'Unknown';
    console.log(`   ✅ RUNNING (PID: ${pid})`);
    console.log('   URL: http://localhost:4000');
  }
} catch (error) {
  console.log('   ❌ NOT RUNNING');
}

console.log();

// Check WebSocket server (port 8080)
console.log('2️⃣  WebSocket Server (Port 8080)');
try {
  const result8080 = execSync('netstat -ano | findstr :8080', { encoding: 'utf-8' });
  const lines = result8080.split('\n').filter(line => line.includes('LISTENING'));
  if (lines.length > 0) {
    const match = lines[0].match(/\s+(\d+)\s*$/);
    const pid = match ? match[1] : 'Unknown';
    console.log(`   ✅ RUNNING (PID: ${pid})`);
    console.log('   WebSocket: ws://localhost:8080/api/bidding');
    console.log('   Health Check: http://localhost:8080/api/health');
  }
} catch (error) {
  console.log('   ❌ NOT RUNNING');
}

console.log();
console.log('========================================');
console.log('3️⃣  Environment Configuration');
console.log('========================================');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing');
console.log('   DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('   ZHIPU_API_KEY:', process.env.ZHIPU_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('   DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY ? '✅ Configured' : '❌ Missing');

console.log();
console.log('========================================');
console.log('4️⃣  Ready to Test');
console.log('========================================');
console.log('   1. Visit: http://localhost:4000');
console.log('   2. Login with your account');
console.log('   3. Navigate to: /marketplace/bidding');
console.log('   4. Test the AI bidding flow');
console.log('   5. Generate business plan');
console.log();
