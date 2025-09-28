#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');

/**
 * AI智能体商城 - 页面结构和用户流程分析器
 */
class PageAnalyzer {
  constructor() {
    this.messageId = 0;
    this.analysisResults = {};
  }

  async analyzePageStructure(url) {
    console.log(`\n🔍 开始分析页面结构: ${url}`);

    const { chrome, port } = await this.startChrome(url);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const tabs = await this.getTabs(port);
      const targetTab = tabs.find(tab => tab.url.includes(new URL(url).hostname));

      if (!targetTab) {
        throw new Error('未找到目标页面标签');
      }

      const ws = await this.connectToTab(targetTab.id, port);

      // 启用必要的域
      await this.sendCommand(ws, 'Runtime.enable');
      await this.sendCommand(ws, 'DOM.enable');
      await this.sendCommand(ws, 'Page.enable');

      const analysis = {
        url,
        timestamp: new Date().toISOString(),
        pageInfo: {},
        userInterface: {},
        authentication: {},
        navigation: {},
        content: {}
      };

      // 1. 获取基本页面信息
      const pageInfo = await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          ({
            title: document.title,
            url: window.location.href,
            readyState: document.readyState,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            hasNextJS: typeof window.__NEXT_DATA__ !== 'undefined',
            nextData: typeof window.__NEXT_DATA__ !== 'undefined' ? JSON.stringify(window.__NEXT_DATA__) : null
          })
        `,
        returnByValue: true
      });

      analysis.pageInfo = pageInfo.result.value;

      // 2. 分析页面元素和用户界面
      const uiElements = await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          ({
            // 登录/注册相关元素
            loginButton: !!document.querySelector('[data-testid="login-button"], [class*="login"], [href*="login"], button:contains("登录"), a:contains("登录")'),
            registerButton: !!document.querySelector('[data-testid="register-button"], [class*="register"], [href*="register"], button:contains("注册"), a:contains("注册")'),
            signInButton: !!document.querySelector('[class*="sign-in"], [data-testid="sign-in"], button:contains("Sign"), a:contains("Sign")'),
            userProfile: !!document.querySelector('[class*="profile"], [data-testid="user-profile"], [class*="avatar"]'),

            // 导航元素
            navigation: !!document.querySelector('nav, [role="navigation"], [class*="nav"]'),
            header: !!document.querySelector('header, [role="banner"], [class*="header"]'),
            footer: !!document.querySelector('footer, [role="contentinfo"], [class*="footer"]'),

            // 创意竞价相关
            creativeBidding: !!document.querySelector('[class*="bidding"], [class*="creative"], [data-testid*="bid"]'),
            marketplaceLink: !!document.querySelector('[href*="marketplace"], a:contains("Marketplace"), a:contains("市场")'),
            businessPlanLink: !!document.querySelector('[href*="business-plan"], a:contains("Business"), a:contains("商业")'),

            // 表单元素
            forms: document.querySelectorAll('form').length,
            inputs: document.querySelectorAll('input').length,
            buttons: document.querySelectorAll('button').length
          })
        `,
        returnByValue: true
      });

      analysis.userInterface = uiElements.result.value;

      // 3. 检查认证状态和相关元素
      const authCheck = await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          ({
            // 检查Next-Auth相关
            hasNextAuth: typeof window.__NEXT_AUTH__ !== 'undefined',
            sessionStorage: Object.keys(sessionStorage).filter(key => key.includes('auth') || key.includes('session')),
            localStorage: Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('session') || key.includes('token')),

            // 检查登录表单
            loginForm: !!document.querySelector('form[action*="login"], form[action*="auth"], form[action*="sign-in"]'),
            emailInput: !!document.querySelector('input[type="email"], input[name="email"], input[placeholder*="email"]'),
            passwordInput: !!document.querySelector('input[type="password"], input[name="password"]'),

            // 检查用户状态指示器
            userMenu: !!document.querySelector('[class*="user-menu"], [data-testid="user-menu"]'),
            logoutButton: !!document.querySelector('[data-testid="logout"], button:contains("登出"), a:contains("退出")'),

            // 页面URL分析
            isAuthPage: window.location.pathname.includes('login') || window.location.pathname.includes('register') || window.location.pathname.includes('auth')
          })
        `,
        returnByValue: true
      });

      analysis.authentication = authCheck.result.value;

      // 4. 分析页面导航和链接
      const navigationAnalysis = await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          ({
            allLinks: Array.from(document.querySelectorAll('a')).map(a => ({
              text: a.textContent.trim(),
              href: a.href,
              isInternal: a.href.includes(window.location.hostname)
            })).filter(link => link.text && link.href),

            mainNavLinks: Array.from(document.querySelectorAll('nav a, [role="navigation"] a, [class*="nav"] a')).map(a => ({
              text: a.textContent.trim(),
              href: a.href
            })).filter(link => link.text),

            importantPages: {
              marketplace: Array.from(document.querySelectorAll('a')).find(a => a.href.includes('marketplace')),
              businessPlan: Array.from(document.querySelectorAll('a')).find(a => a.href.includes('business-plan')),
              login: Array.from(document.querySelectorAll('a')).find(a => a.href.includes('login') || a.textContent.includes('登录')),
              register: Array.from(document.querySelectorAll('a')).find(a => a.href.includes('register') || a.textContent.includes('注册'))
            }
          })
        `,
        returnByValue: true
      });

      analysis.navigation = navigationAnalysis.result.value;

      // 5. 内容分析
      const contentAnalysis = await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          ({
            mainHeading: document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : null,
            allHeadings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
              tag: h.tagName,
              text: h.textContent.trim()
            })),

            // 检查创意竞价相关内容
            creativeBiddingContent: {
              hasCreativeSection: !!document.querySelector('[class*="creative"], [data-testid*="creative"]'),
              hasBiddingSection: !!document.querySelector('[class*="bidding"], [data-testid*="bidding"]'),
              hasMarketplaceContent: !!document.querySelector('[class*="marketplace"], [data-testid*="marketplace"]')
            },

            // 检查主要功能区域
            mainSections: Array.from(document.querySelectorAll('section, [class*="section"], main > div')).length,
            hasCallToAction: !!document.querySelector('[class*="cta"], [class*="call-to-action"], button[class*="primary"]'),

            // 页面文本内容关键词
            bodyText: document.body.textContent.toLowerCase(),
            hasCreativeKeywords: document.body.textContent.toLowerCase().includes('创意') || document.body.textContent.toLowerCase().includes('creative'),
            hasBiddingKeywords: document.body.textContent.toLowerCase().includes('竞价') || document.body.textContent.toLowerCase().includes('bidding'),
            hasBusinessPlanKeywords: document.body.textContent.toLowerCase().includes('商业计划') || document.body.textContent.toLowerCase().includes('business plan')
          })
        `,
        returnByValue: true
      });

      analysis.content = contentAnalysis.result.value;

      ws.close();
      chrome.kill();

      return analysis;

    } catch (error) {
      chrome.kill();
      throw error;
    }
  }

  // Chrome DevTools相关方法（从之前的脚本复制）
  async startChrome(url, options = {}) {
    const { headless = true, port = 9222 } = options;

    const args = [
      `--remote-debugging-port=${port}`,
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ];

    if (headless) args.push('--headless');
    if (url) args.push(url);

    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'chrome',
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
      throw new Error('未找到Chrome浏览器');
    }

    const chrome = spawn(chromePath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    return new Promise((resolve, reject) => {
      chrome.on('error', reject);
      setTimeout(async () => {
        try {
          const response = await fetch(`http://localhost:${port}/json/version`);
          const version = await response.json();
          resolve({ chrome, port, version });
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
      const timeout = setTimeout(() => reject(new Error(`命令超时: ${method}`)), 30000);

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

  generateAnalysisReport(analysis) {
    const lines = [];

    lines.push('# 📊 AI智能体商城 - 页面结构分析报告');
    lines.push('');
    lines.push(`**分析URL**: ${analysis.url}`);
    lines.push(`**分析时间**: ${analysis.timestamp}`);
    lines.push('');

    // 页面基本信息
    lines.push('## 🏠 页面基本信息');
    lines.push(`- **页面标题**: ${analysis.pageInfo.title}`);
    lines.push(`- **页面状态**: ${analysis.pageInfo.readyState}`);
    lines.push(`- **视口尺寸**: ${analysis.pageInfo.viewport.width}x${analysis.pageInfo.viewport.height}`);
    lines.push(`- **Next.js应用**: ${analysis.pageInfo.hasNextJS ? '是' : '否'}`);
    lines.push('');

    // 用户界面分析
    lines.push('## 🎨 用户界面元素');
    const ui = analysis.userInterface;
    lines.push(`- **登录按钮**: ${ui.loginButton ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **注册按钮**: ${ui.registerButton ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **用户档案**: ${ui.userProfile ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **导航栏**: ${ui.navigation ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **Marketplace链接**: ${ui.marketplaceLink ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **Business Plan链接**: ${ui.businessPlanLink ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **表单数量**: ${ui.forms}个`);
    lines.push(`- **输入框数量**: ${ui.inputs}个`);
    lines.push(`- **按钮数量**: ${ui.buttons}个`);
    lines.push('');

    // 认证系统分析
    lines.push('## 🔐 认证系统分析');
    const auth = analysis.authentication;
    lines.push(`- **Next-Auth集成**: ${auth.hasNextAuth ? '✅ 已集成' : '⚪ 未检测到'}`);
    lines.push(`- **登录表单**: ${auth.loginForm ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **邮箱输入**: ${auth.emailInput ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **密码输入**: ${auth.passwordInput ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **用户菜单**: ${auth.userMenu ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **登出按钮**: ${auth.logoutButton ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **认证页面**: ${auth.isAuthPage ? '是' : '否'}`);

    if (auth.sessionStorage.length > 0) {
      lines.push(`- **会话存储**: ${auth.sessionStorage.join(', ')}`);
    }
    if (auth.localStorage.length > 0) {
      lines.push(`- **本地存储**: ${auth.localStorage.join(', ')}`);
    }
    lines.push('');

    // 导航结构
    lines.push('## 🧭 导航结构');
    if (analysis.navigation.mainNavLinks.length > 0) {
      lines.push('**主导航链接**:');
      analysis.navigation.mainNavLinks.forEach(link => {
        lines.push(`- [${link.text}](${link.href})`);
      });
    }
    lines.push('');

    lines.push('**重要页面链接**:');
    const importantPages = analysis.navigation.importantPages;
    Object.entries(importantPages).forEach(([key, page]) => {
      if (page) {
        lines.push(`- **${key}**: [${page.textContent?.trim() || '链接'}](${page.href})`);
      } else {
        lines.push(`- **${key}**: ❌ 未找到`);
      }
    });
    lines.push('');

    // 内容分析
    lines.push('## 📝 页面内容分析');
    const content = analysis.content;
    if (content.mainHeading) {
      lines.push(`- **主标题**: ${content.mainHeading}`);
    }

    lines.push('**功能内容检查**:');
    lines.push(`- **创意相关内容**: ${content.hasCreativeKeywords ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **竞价相关内容**: ${content.hasBiddingKeywords ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **商业计划内容**: ${content.hasBusinessPlanKeywords ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **创意功能区**: ${content.creativeBiddingContent.hasCreativeSection ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **竞价功能区**: ${content.creativeBiddingContent.hasBiddingSection ? '✅ 存在' : '❌ 未找到'}`);
    lines.push(`- **市场功能区**: ${content.creativeBiddingContent.hasMarketplaceContent ? '✅ 存在' : '❌ 未找到'}`);
    lines.push('');

    // 问题和建议
    lines.push('## ⚠️ 发现的问题和建议');
    const issues = [];
    const suggestions = [];

    // 认证系统问题
    if (!auth.loginButton && !auth.registerButton) {
      issues.push('未找到明显的登录/注册入口');
    }
    if (!auth.loginForm && !auth.isAuthPage) {
      issues.push('当前页面没有登录表单，可能需要跳转到专门的认证页面');
    }

    // 导航问题
    if (!importantPages.marketplace) {
      issues.push('未找到marketplace页面链接');
    }
    if (!importantPages.businessPlan) {
      issues.push('未找到business-plan页面链接');
    }

    // 内容问题
    if (!content.hasCreativeKeywords && !content.hasBiddingKeywords) {
      issues.push('主页缺少创意竞价相关内容');
    }

    // 建议
    if (ui.marketplaceLink && !content.creativeBiddingContent.hasCreativeSection) {
      suggestions.push('建议在主页添加创意竞价功能的入口或介绍');
    }
    if (!auth.userProfile && (auth.loginButton || auth.registerButton)) {
      suggestions.push('建议添加用户登录状态的可视化指示器');
    }

    if (issues.length > 0) {
      issues.forEach(issue => lines.push(`- ❌ ${issue}`));
      lines.push('');
    }

    if (suggestions.length > 0) {
      lines.push('**优化建议**:');
      suggestions.forEach(suggestion => lines.push(`- 💡 ${suggestion}`));
      lines.push('');
    }

    lines.push('---');
    lines.push(`*报告生成时间: ${new Date().toLocaleString('zh-CN')}*`);

    return lines.join('\n');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const url = process.argv[2];

  if (!url) {
    console.error('使用方法: node page-analyzer.js <URL>');
    console.error('示例: node page-analyzer.js https://aijiayuan.top/');
    process.exit(1);
  }

  const analyzer = new PageAnalyzer();

  analyzer.analyzePageStructure(url)
    .then(analysis => {
      console.log('\n✅ 页面结构分析完成！');
      console.log('=' .repeat(60));

      // 保存详细结果
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsFile = `./page-analysis-${timestamp}.json`;
      const reportFile = `./page-analysis-${timestamp}.md`;

      fs.writeFileSync(resultsFile, JSON.stringify(analysis, null, 2));
      console.log(`📁 详细分析结果已保存: ${resultsFile}`);

      const report = analyzer.generateAnalysisReport(analysis);
      fs.writeFileSync(reportFile, report);
      console.log(`📄 分析报告已保存: ${reportFile}`);

      console.log('\n📊 页面结构分析报告:');
      console.log('=' .repeat(60));
      console.log(report);

    })
    .catch(error => {
      console.error('❌ 分析失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = PageAnalyzer;