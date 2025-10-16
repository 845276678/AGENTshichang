// Production server with built-in env loading (no dotenv dependency)
// This is a fallback version that loads .env.local manually

// Manual environment variable loading (alternative to dotenv)
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = value;
            }
          }
        }
      });
      console.log('Environment variables loaded from .env.local');
    }
  } catch (error) {
    console.warn('Could not load .env.local file:', error.message);
  }
}

// Load environment variables
loadEnvFile();

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

// Continue with rest of server.js content...
// [The rest would be identical to the current server.js]

console.log('✅ Fallback server ready - using manual env loading instead of dotenv');
console.log('This version does not require the dotenv package');

// For now, require the original server
// This is just a reference - we'll use the original server.js
require('./server.js');