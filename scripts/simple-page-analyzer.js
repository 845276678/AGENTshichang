#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');

/**
 * 简化版页面分析器 - 专注核心功能检查
 */
class SimplePageAnalyzer {
  constructor() {
    this.messageId = 0;
  }

  async analyzeKeyFeatures(url) {
    console.log(`\n🔍 分析关键功能: ${url}`);

    const { chrome, port } = await this.startChrome(url);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const tabs = await this.getTabs(port);
      const targetTab = tabs.find(tab => tab.url.includes(new URL(url).hostname));

      if (!targetTab) {
        throw new Error('未找到目标页面标签');
      }

      const ws = await this.connectToTab(targetTab.id, port);

      await this.sendCommand(ws, 'Runtime.enable');

      // 分步骤获取信息，避免数据过大
      const analysis = {
        url,
        timestamp: new Date().toISOString(),
        basicInfo: await this.getBasicInfo(ws),
        authElements: await this.getAuthElements(ws),
        navigationLinks: await this.getNavigationLinks(ws),
        contentKeywords: await this.getContentKeywords(ws)
      };

      ws.close();
      chrome.kill();

      return analysis;

    } catch (error) {
      chrome.kill();
      throw error;
    }
  }

  async getBasicInfo(ws) {
    const result = await this.sendCommand(ws, 'Runtime.evaluate', {
      expression: `
        ({
          title: document.title,
          url: window.location.href,
          readyState: document.readyState,
          hasNextJS: typeof window.__NEXT_DATA__ !== 'undefined'
        })
      `,
      returnByValue: true
    });
    return result.result.value;
  }

  async getAuthElements(ws) {
    const result = await this.sendCommand(ws, 'Runtime.evaluate', {
      expression: `
        ({
          loginButton: !!document.querySelector('[href*="login"], button:contains("登录"), a:contains("登录"), [class*="login"]'),
          registerButton: !!document.querySelector('[href*="register"], button:contains("注册"), a:contains("注册"), [class*="register"]'),
          signInButton: !!document.querySelector('[class*="sign-in"], button:contains("Sign")'),
          userProfile: !!document.querySelector('[class*="profile"], [class*="avatar"], [data-testid*="user"]'),
          loginForm: !!document.querySelector('form[action*="login"], form[action*="auth"]'),
          emailInput: !!document.querySelector('input[type="email"], input[name="email"]'),
          passwordInput: !!document.querySelector('input[type="password"]'),
          hasNextAuth: typeof window.__NEXT_AUTH__ !== 'undefined',
          sessionStorage: Object.keys(sessionStorage).filter(key => key.includes('auth')).length,
          localStorage: Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('token')).length
        })
      `,
      returnByValue: true
    });
    return result.result.value;
  }

  async getNavigationLinks(ws) {
    const result = await this.sendCommand(ws, 'Runtime.evaluate', {
      expression: `
        ({
          hasNavigation: !!document.querySelector('nav, [role="navigation"]'),
          marketplaceLink: !!document.querySelector('[href*="marketplace"]'),
          businessPlanLink: !!document.querySelector('[href*="business-plan"]'),
          loginLink: !!document.querySelector('[href*="login"]'),
          registerLink: !!document.querySelector('[href*="register"]'),
          navLinks: Array.from(document.querySelectorAll('nav a, [role="navigation"] a')).slice(0, 10).map(a => ({
            text: a.textContent.trim().substring(0, 50),
            href: a.href.includes(window.location.hostname) ? a.pathname : 'external'
          })).filter(link => link.text)
        })
      `,
      returnByValue: true
    });
    return result.result.value;
  }

  async getContentKeywords(ws) {
    const result = await this.sendCommand(ws, 'Runtime.evaluate', {
      expression: `
        ({
          mainHeading: document.querySelector('h1') ? document.querySelector('h1').textContent.trim().substring(0, 100) : null,
          hasCreativeKeywords: document.body.textContent.toLowerCase().includes('创意') || document.body.textContent.toLowerCase().includes('creative'),
          hasBiddingKeywords: document.body.textContent.toLowerCase().includes('竞价') || document.body.textContent.toLowerCase().includes('bidding'),
          hasBusinessPlanKeywords: document.body.textContent.toLowerCase().includes('商业计划') || document.body.textContent.toLowerCase().includes('business plan'),
          hasMarketplaceKeywords: document.body.textContent.toLowerCase().includes('marketplace') || document.body.textContent.toLowerCase().includes('市场'),
          buttonCount: document.querySelectorAll('button').length,
          formCount: document.querySelectorAll('form').length,
          inputCount: document.querySelectorAll('input').length
        })
      `,
      returnByValue: true
    });
    return result.result.value;
  }

  // Chrome启动相关方法（简化版）
  async startChrome(url) {
    const args = [
      '--remote-debugging-port=9222',
      '--disable-web-security',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--headless',
      url
    ];

    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (!fs.existsSync(chromePath)) {
      throw new Error('未找到Chrome浏览器');
    }

    const chrome = spawn(chromePath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    return new Promise((resolve, reject) => {
      chrome.on('error', reject);
      setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:9222/json/version');
          const version = await response.json();
          resolve({ chrome, port: 9222, version });
        } catch (error) {
          reject(new Error(`Chrome启动失败: ${error.message}`));
        }
      }, 2000);
    });
  }

  async getTabs(port = 9222) {
    const response = await fetch(`http://localhost:${port}/json`);
    return await response.json();
  }

  async connectToTab(tabId, port = 9222) {
    const WebSocket = require('ws');
    const tabs = await this.getTabs(port);
    const tab = tabs.find(t => t.id === tabId);

    if (!tab) throw new Error(`未找到标签页: ${tabId}`);

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    return new Promise((resolve, reject) => {
      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
    });
  }

  async sendCommand(ws, method, params = {}) {
    const id = ++this.messageId;
    const message = { id, method, params };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`命令超时: ${method}`)), 10000);

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

  generateReport(analysis) {
    const lines = [];

    lines.push('# 🔍 AI智能体商城 - 关键功能分析');
    lines.push('');
    lines.push(`**分析URL**: ${analysis.url}`);
    lines.push(`**分析时间**: ${analysis.timestamp}`);
    lines.push('');

    // 基本信息
    lines.push('## 📋 基本信息');
    lines.push(`- **页面标题**: ${analysis.basicInfo.title}`);
    lines.push(`- **页面状态**: ${analysis.basicInfo.readyState}`);
    lines.push(`- **Next.js应用**: ${analysis.basicInfo.hasNextJS ? '✅ 是' : '❌ 否'}`);
    lines.push('');

    // 认证系统
    lines.push('## 🔐 认证系统检查');
    const auth = analysis.authElements;
    lines.push(`- **登录按钮**: ${auth.loginButton ? '✅ 发现' : '❌ 未找到'}`);
    lines.push(`- **注册按钮**: ${auth.registerButton ? '✅ 发现' : '❌ 未找到'}`);
    lines.push(`- **登录表单**: ${auth.loginForm ? '✅ 存在' : '❌ 不在当前页'}`);
    lines.push(`- **邮箱输入框**: ${auth.emailInput ? '✅ 存在' : '❌ 不在当前页'}`);
    lines.push(`- **密码输入框**: ${auth.passwordInput ? '✅ 存在' : '❌ 不在当前页'}`);
    lines.push(`- **用户档案**: ${auth.userProfile ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **Next-Auth**: ${auth.hasNextAuth ? '✅ 已集成' : '⚪ 未检测到'}`);
    lines.push(`- **认证存储**: Session(${auth.sessionStorage}) / Local(${auth.localStorage})`);
    lines.push('');

    // 导航分析
    lines.push('## 🧭 导航分析');
    const nav = analysis.navigationLinks;
    lines.push(`- **导航栏**: ${nav.hasNavigation ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **Marketplace链接**: ${nav.marketplaceLink ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **Business Plan链接**: ${nav.businessPlanLink ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **登录链接**: ${nav.loginLink ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **注册链接**: ${nav.registerLink ? '✅ 存在' : '❌ 未找到'}`);

    if (nav.navLinks.length > 0) {
      lines.push('\n**主要导航项**:');
      nav.navLinks.forEach(link => {
        lines.push(`- ${link.text} → ${link.href}`);
      });
    }
    lines.push('');

    // 内容分析
    lines.push('## 📝 内容功能分析');
    const content = analysis.contentKeywords;
    if (content.mainHeading) {
      lines.push(`- **主标题**: ${content.mainHeading}`);
    }
    lines.push(`- **创意相关内容**: ${content.hasCreativeKeywords ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **竞价相关内容**: ${content.hasBiddingKeywords ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **商业计划内容**: ${content.hasBusinessPlanKeywords ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **市场相关内容**: ${content.hasMarketplaceKeywords ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **交互元素**: 按钮(${content.buttonCount}) / 表单(${content.formCount}) / 输入框(${content.inputCount})`);
    lines.push('');

    // 问题总结
    lines.push('## ⚠️ 关键发现');
    const issues = [];
    const suggestions = [];

    // 认证问题
    if (!auth.loginButton && !auth.registerButton) {
      issues.push('主页未发现明显的登录/注册入口');
    }
    if (!auth.loginForm && (auth.loginButton || auth.registerButton)) {
      suggestions.push('登录/注册需要跳转到专门页面，考虑添加模态框或内联表单');
    }

    // 导航问题
    if (!nav.marketplaceLink) {
      issues.push('未发现marketplace页面的导航链接');
    }
    if (!nav.businessPlanLink) {
      issues.push('未发现business-plan页面的导航链接');
    }

    // 内容问题
    if (!content.hasCreativeKeywords && !content.hasBiddingKeywords) {
      issues.push('主页缺少核心功能（创意竞价）的介绍内容');
    }

    if (issues.length > 0) {
      lines.push('**发现的问题**:');
      issues.forEach(issue => lines.push(`- ❌ ${issue}`));
      lines.push('');
    }

    if (suggestions.length > 0) {
      lines.push('**优化建议**:');
      suggestions.forEach(suggestion => lines.push(`- 💡 ${suggestion}`));
      lines.push('');
    }

    return lines.join('\n');
  }
}

// 直接运行
if (require.main === module) {
  const url = process.argv[2] || 'https://aijiayuan.top/';

  const analyzer = new SimplePageAnalyzer();

  analyzer.analyzeKeyFeatures(url)
    .then(analysis => {
      console.log('\n✅ 关键功能分析完成！');

      const report = analyzer.generateReport(analysis);

      // 保存报告
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = `./key-features-analysis-${timestamp}.md`;
      fs.writeFileSync(reportFile, report);

      console.log(`📄 分析报告已保存: ${reportFile}`);
      console.log('\n📊 分析报告:');
      console.log('=' .repeat(60));
      console.log(report);

    })
    .catch(error => {
      console.error('❌ 分析失败:', error.message);
      process.exit(1);
    });
}

module.exports = SimplePageAnalyzer;