#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Chrome DevTools MCP 连接器
 * 用于生产环境网站检查和调试
 */
class ChromeDevToolsMCP {
  constructor() {
    this.processes = new Map();
    this.messageId = 0;
  }

  /**
   * 启动Chrome DevTools协议连接
   */
  async startChrome(url, options = {}) {
    const {
      headless = true,
      port = 9222,
      userDataDir = null
    } = options;

    const args = [
      `--remote-debugging-port=${port}`,
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ];

    if (headless) {
      args.push('--headless');
    }

    if (userDataDir) {
      args.push(`--user-data-dir=${userDataDir}`);
    }

    if (url) {
      args.push(url);
    }

    // 尝试使用系统Chrome
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'chrome', // PATH中的chrome
      'google-chrome'
    ];

    let chromePath = null;
    for (const path of chromePaths) {
      try {
        if (fs.existsSync(path) || path === 'chrome' || path === 'google-chrome') {
          chromePath = path;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!chromePath) {
      throw new Error('未找到Chrome浏览器，请确保已安装Chrome');
    }

    console.log(`启动Chrome: ${chromePath}`);
    console.log(`调试端口: ${port}`);
    console.log(`目标URL: ${url || '无'}`);

    const chrome = spawn(chromePath, args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    return new Promise((resolve, reject) => {
      chrome.on('error', reject);

      // 等待Chrome启动
      setTimeout(async () => {
        try {
          const response = await fetch(`http://localhost:${port}/json/version`);
          const version = await response.json();
          console.log('Chrome版本:', version.Browser);
          resolve({ chrome, port, version });
        } catch (error) {
          reject(new Error(`Chrome启动失败: ${error.message}`));
        }
      }, 2000);
    });
  }

  /**
   * 获取所有标签页
   */
  async getTabs(port = 9222) {
    try {
      const response = await fetch(`http://localhost:${port}/json`);
      return await response.json();
    } catch (error) {
      throw new Error(`获取标签页失败: ${error.message}`);
    }
  }

  /**
   * 连接到特定标签页的WebSocket
   */
  async connectToTab(tabId, port = 9222) {
    const WebSocket = require('ws');
    const tabs = await this.getTabs(port);
    const tab = tabs.find(t => t.id === tabId);

    if (!tab) {
      throw new Error(`未找到标签页: ${tabId}`);
    }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    return new Promise((resolve, reject) => {
      ws.on('open', () => {
        console.log(`已连接到标签页: ${tab.title}`);
        resolve(ws);
      });

      ws.on('error', reject);
    });
  }

  /**
   * 发送DevTools Protocol命令
   */
  async sendCommand(ws, method, params = {}) {
    const id = ++this.messageId;
    const message = {
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`命令超时: ${method}`));
      }, 30000);

      const handler = (data) => {
        const response = JSON.parse(data);
        if (response.id === id) {
          clearTimeout(timeout);
          ws.off('message', handler);

          if (response.error) {
            reject(new Error(`命令失败: ${response.error.message}`));
          } else {
            resolve(response.result);
          }
        }
      };

      ws.on('message', handler);
      ws.send(JSON.stringify(message));
    });
  }

  /**
   * 生产环境网站检查
   */
  async checkProductionSite(url) {
    console.log(`\n开始检查生产环境网站: ${url}`);

    const { chrome, port } = await this.startChrome(url, { headless: true });

    try {
      // 等待页面加载
      await new Promise(resolve => setTimeout(resolve, 3000));

      const tabs = await this.getTabs(port);
      const targetTab = tabs.find(tab => tab.url.includes(new URL(url).hostname));

      if (!targetTab) {
        throw new Error('未找到目标页面标签');
      }

      const ws = await this.connectToTab(targetTab.id, port);

      // 启用必要的域
      await this.sendCommand(ws, 'Runtime.enable');
      await this.sendCommand(ws, 'Network.enable');
      await this.sendCommand(ws, 'Page.enable');
      await this.sendCommand(ws, 'Console.enable');

      // 收集检查结果
      const results = {
        url,
        timestamp: new Date().toISOString(),
        checks: {}
      };

      // 1. 页面加载性能
      const performanceMetrics = await this.sendCommand(ws, 'Performance.getMetrics');
      results.checks.performance = {
        metrics: performanceMetrics.metrics,
        status: 'success'
      };

      // 2. 控制台错误检查
      const consoleErrors = [];
      ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.method === 'Console.messageAdded') {
          const { level, text, source } = message.params.message;
          if (level === 'error') {
            consoleErrors.push({ text, source, timestamp: Date.now() });
          }
        }
      });

      // 3. 网络请求检查
      const networkRequests = [];
      ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.method === 'Network.responseReceived') {
          const { response } = message.params;
          if (response.status >= 400) {
            networkRequests.push({
              url: response.url,
              status: response.status,
              statusText: response.statusText
            });
          }
        }
      });

      // 4. 页面资源检查
      const resources = await this.sendCommand(ws, 'Page.getResourceTree');
      results.checks.resources = {
        mainFrame: resources.frameTree.frame,
        subFrames: resources.frameTree.childFrames || [],
        status: 'success'
      };

      // 5. JavaScript执行检查
      try {
        const jsResult = await this.sendCommand(ws, 'Runtime.evaluate', {
          expression: `
            ({
              title: document.title,
              url: window.location.href,
              readyState: document.readyState,
              errors: window.onerror ? 'error handler exists' : 'no error handler',
              viewport: {
                width: window.innerWidth,
                height: window.innerHeight
              }
            })
          `,
          returnByValue: true
        });

        results.checks.javascript = {
          result: jsResult.result.value,
          status: 'success'
        };
      } catch (error) {
        results.checks.javascript = {
          error: error.message,
          status: 'failed'
        };
      }

      // 等待收集错误信息
      await new Promise(resolve => setTimeout(resolve, 2000));

      results.checks.console = {
        errors: consoleErrors,
        status: consoleErrors.length === 0 ? 'success' : 'warning'
      };

      results.checks.network = {
        failedRequests: networkRequests,
        status: networkRequests.length === 0 ? 'success' : 'warning'
      };

      ws.close();
      chrome.kill();

      return results;

    } catch (error) {
      chrome.kill();
      throw error;
    }
  }

  /**
   * 生成检查报告
   */
  generateReport(results) {
    const report = [];
    report.push('# 生产环境网站检查报告');
    report.push(`\n**检查时间**: ${results.timestamp}`);
    report.push(`**检查URL**: ${results.url}\n`);

    // 性能指标
    if (results.checks.performance?.status === 'success') {
      report.push('## 性能指标');
      const metrics = results.checks.performance.metrics;
      metrics.forEach(metric => {
        report.push(`- **${metric.name}**: ${metric.value}`);
      });
      report.push('');
    }

    // JavaScript检查
    if (results.checks.javascript) {
      report.push('## JavaScript状态');
      if (results.checks.javascript.status === 'success') {
        const js = results.checks.javascript.result;
        report.push(`- **页面标题**: ${js.title}`);
        report.push(`- **当前URL**: ${js.url}`);
        report.push(`- **文档状态**: ${js.readyState}`);
        report.push(`- **视口大小**: ${js.viewport.width}x${js.viewport.height}`);
      } else {
        report.push(`- **错误**: ${results.checks.javascript.error}`);
      }
      report.push('');
    }

    // 控制台错误
    report.push('## 控制台检查');
    if (results.checks.console?.errors?.length > 0) {
      report.push('⚠️ **发现控制台错误**:');
      results.checks.console.errors.forEach((error, index) => {
        report.push(`${index + 1}. ${error.text} (来源: ${error.source})`);
      });
    } else {
      report.push('✅ 未发现控制台错误');
    }
    report.push('');

    // 网络请求
    report.push('## 网络请求检查');
    if (results.checks.network?.failedRequests?.length > 0) {
      report.push('⚠️ **发现失败的网络请求**:');
      results.checks.network.failedRequests.forEach((req, index) => {
        report.push(`${index + 1}. ${req.status} ${req.statusText} - ${req.url}`);
      });
    } else {
      report.push('✅ 所有网络请求正常');
    }
    report.push('');

    // 页面资源
    if (results.checks.resources?.status === 'success') {
      report.push('## 页面资源');
      const frame = results.checks.resources.mainFrame;
      report.push(`- **主框架URL**: ${frame.url}`);
      report.push(`- **MIME类型**: ${frame.mimeType}`);
      report.push(`- **安全状态**: ${frame.securityOrigin}`);

      if (results.checks.resources.subFrames.length > 0) {
        report.push(`- **子框架数量**: ${results.checks.resources.subFrames.length}`);
      }
      report.push('');
    }

    // 总结
    const hasErrors = (results.checks.console?.errors?.length > 0) ||
                     (results.checks.network?.failedRequests?.length > 0) ||
                     (results.checks.javascript?.status === 'failed');

    report.push('## 检查总结');
    if (hasErrors) {
      report.push('⚠️ **检查发现问题，请查看上述详细信息**');
    } else {
      report.push('✅ **网站运行正常，未发现明显问题**');
    }

    return report.join('\n');
  }
}

// 导出类
module.exports = ChromeDevToolsMCP;

// 如果直接运行此脚本
if (require.main === module) {
  const url = process.argv[2];
  if (!url) {
    console.error('使用方法: node chrome-devtools-mcp.js <URL>');
    process.exit(1);
  }

  const mcp = new ChromeDevToolsMCP();

  mcp.checkProductionSite(url)
    .then(results => {
      console.log('\n检查完成！');

      // 保存结果到文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsFile = `./production-check-${timestamp}.json`;
      const reportFile = `./production-check-${timestamp}.md`;

      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
      console.log(`详细结果已保存到: ${resultsFile}`);

      const report = mcp.generateReport(results);
      fs.writeFileSync(reportFile, report);
      console.log(`报告已保存到: ${reportFile}`);

      console.log('\n报告预览:');
      console.log('='.repeat(50));
      console.log(report);
    })
    .catch(error => {
      console.error('检查失败:', error.message);
      process.exit(1);
    });
}