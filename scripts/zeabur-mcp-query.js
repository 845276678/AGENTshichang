const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function loadToken() {
  const configPath = path.resolve('C:/Users/Administrator/Desktop/idea-pilot/mcp/zeabur/config.json');
  const raw = fs.readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw);
  const token = parsed?.mcpServers?.zeabur?.env?.ZEABUR_TOKEN;
  if (!token) throw new Error('Zeabur token not found in config');
  return token;
}

function encodeMessage(obj) {
  const json = JSON.stringify(obj);
  return `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`;
}

function createParser(onMessage) {
  let buffer = Buffer.alloc(0);
  return chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const separator = buffer.indexOf('\r\n\r\n');
      if (separator === -1) return;
      const header = buffer.slice(0, separator).toString();
      const match = /Content-Length: (\d+)/i.exec(header);
      if (!match) throw new Error('Invalid header: ' + header);
      const length = parseInt(match[1], 10);
      const messageEnd = separator + 4 + length;
      if (buffer.length < messageEnd) return;
      const body = buffer.slice(separator + 4, messageEnd).toString();
      buffer = buffer.slice(messageEnd);
      onMessage(JSON.parse(body));
    }
  };
}

async function main() {
  const token = loadToken();
  const command = 'npx --yes zeabur-mcp@latest';
  const child = spawn(command, {
    env: { ...process.env, ZEABUR_TOKEN: token },
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
  });

  const waiters = new Map();

  const handleMessage = message => {
    if (message.id !== undefined && waiters.has(message.id)) {
      waiters.get(message.id)(message);
      waiters.delete(message.id);
    } else {
      console.log('notification', JSON.stringify(message));
    }
  };

  const parser = createParser(handleMessage);
  child.stdout.on('data', parser);
  child.stderr.on('data', chunk => process.stderr.write(chunk.toString()));

  function sendRequest(id, method, params) {
    child.stdin.write(encodeMessage({ jsonrpc: '2.0', id, method, params }));
  }

  function notify(method, params) {
    child.stdin.write(encodeMessage({ jsonrpc: '2.0', method, params }));
  }

  function request(id, method, params) {
    return new Promise(resolve => {
      waiters.set(id, resolve);
      sendRequest(id, method, params);
    });
  }

  const initResp = await request(0, 'initialize', {
    clientInfo: { name: 'codex-cli', version: '0.0.1' },
    capabilities: {}
  });

  notify('notifications/initialized', {});

  const listTools = await request(2, 'tools/list', {});

  console.log(JSON.stringify({ initialize: initResp, listTools }, null, 2));

  child.stdin.end();
  if (!child.killed) child.kill();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});






