// Check WebSocket server status
const { execSync } = require('child_process');

console.log('=== WebSocket Server Status ===\n');

try {
  // Check if port 8080 is in use
  const result = execSync('netstat -ano | findstr :8080', { encoding: 'utf-8' });
  console.log('Port 8080 status:');
  console.log(result);

  // Extract PID
  const lines = result.split('\n').filter(line => line.includes('LISTENING'));
  if (lines.length > 0) {
    const match = lines[0].match(/\s+(\d+)\s*$/);
    if (match) {
      const pid = match[1];
      console.log(`\nWebSocket server is running on PID: ${pid}`);
      console.log('✅ Server is RUNNING');
    }
  }
} catch (error) {
  console.log('❌ Port 8080 is NOT in use');
  console.log('WebSocket server is NOT running');
}

console.log('\n=== Service Status ===');
console.log('Next.js dev server (port 4000): Check with "netstat -ano | findstr :4000"');
console.log('WebSocket server (port 8080): See above');
