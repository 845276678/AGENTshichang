// Docker健康检查脚本 - 简化版
const http = require('http')

const options = {
  hostname: 'localhost',
  port: process.env.PORT || process.env.WEB_PORT || 4000,
  path: '/',
  method: 'HEAD',
  timeout: 5000
}

console.log(`Health check: http://localhost:${options.port}${options.path}`)

const req = http.request(options, (res) => {
  console.log(`Health check response: ${res.statusCode}`)
  if (res.statusCode >= 200 && res.statusCode < 400) {
    console.log('✅ Health check passed')
    process.exit(0)
  } else {
    console.log(`❌ Health check failed with status: ${res.statusCode}`)
    process.exit(1)
  }
})

req.on('timeout', () => {
  console.log('❌ Health check timed out')
  req.destroy()
  process.exit(1)
})

req.on('error', (err) => {
  console.log(`❌ Health check failed: ${err.message}`)
  process.exit(1)
})

req.setTimeout(options.timeout)
req.end()