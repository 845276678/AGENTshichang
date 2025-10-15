#!/usr/bin/env node

/**
 * AI智能体商城 - 生产环境专项检查脚本
 * 在通用站点检查的基础上补充项目特定的接口、鉴权与服务验证。
 */

const fs = require('fs');
const path = require('path');
const ProductionSiteChecker = require('./production-site-checker');

class AIAgentMarketplaceChecker extends ProductionSiteChecker {
  constructor() {
    super();
    this.projectEndpoints = [
      { path: '/api/health/simple' },
      { path: '/api/health' },
      { path: '/api/agents' },
      {
        path: '/api/agents/featured',
        optional: true,
        allowMissing: true,
        note: '功能尚未在生产环境启用，允许缺失'
      },
      {
        path: '/api/user/profile',
        okStatuses: [200, 401],
        note: '匿名访问返回 401 视为正常'
      },
      { path: '/api/auth/session' },
      {
        path: '/api/search',
        optional: true,
        allowMissing: true,
        note: '搜索 API 未上线，忽略缺失'
      },
      { path: '/api/categories' }
    ];
  }

  /**
   * 入口：执行项目专项检查。
   */
  async checkAIAgentMarketplace(url) {
    console.log(`\n🤖 AI智能体商城 - 生产环境检查`);
    console.log(`目标 URL: ${url}`);
    console.log('='.repeat(60));

    const results = await this.checkProductionSite(url);

    results.checks.projectSpecific = await this.projectSpecificChecks(url);
    results.summary = this.generateProjectSummary(results.checks);

    return results;
  }

  /**
   * 项目自定义接口、鉴权和上传等检查。
   */
  async projectSpecificChecks(url) {
    console.log('执行项目特定检查...');

    const checks = {
      coreAPIs: {},
      authentication: {},
      agentSystem: {},
      fileUpload: {}
    };

    const baseUrl = url.replace(/\/$/, '');

    for (const endpointConfig of this.projectEndpoints) {
      const config = typeof endpointConfig === 'string'
        ? { path: endpointConfig }
        : endpointConfig;

      const {
        path: apiPath,
        okStatuses = [200],
        optional = false,
        allowMissing = false,
        note
      } = config;

      try {
        const apiUrl = `${baseUrl}${apiPath}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'AI-Agent-Marketplace-Checker/1.0'
          },
          timeout: 10000
        });

        const statusOk = okStatuses.includes(response.status);
        const missingAllowed = allowMissing && response.status === 404;

        const apiResult = {
          status: response.status,
          statusText: response.statusText,
          available: statusOk,
          optional,
          skipped: !statusOk && missingAllowed,
          note: note || undefined,
          expectedStatuses: okStatuses,
          allowMissing,
          responseTime: response.headers.get('x-response-time'),
          contentType: response.headers.get('content-type')
        };

        if (!statusOk && !missingAllowed) {
          apiResult.error = `Unexpected status ${response.status}`;
        }

        checks.coreAPIs[apiPath] = apiResult;

        if (apiPath === '/api/agents' && statusOk) {
          try {
            const data = await response.json();
            checks.agentSystem.agentsAPI = {
              working: true,
              dataStructure: Array.isArray(data) ? 'array' : 'object',
              count: Array.isArray(data) ? data.length : 'unknown'
            };
          } catch (parseError) {
            checks.agentSystem.agentsAPI = {
              working: false,
              error: parseError.message
            };
          }
        }
      } catch (error) {
        checks.coreAPIs[apiPath] = {
          error: error.message,
          available: false,
          optional,
          skipped: false,
          note: note || undefined,
          expectedStatuses: okStatuses,
          allowMissing
        };
      }
    }

    // NextAuth session 检查（匿名状态允许 401）
    try {
      const authResponse = await fetch(`${baseUrl}/api/auth/session`, {
        method: 'GET',
        headers: {
          'User-Agent': 'AI-Agent-Marketplace-Checker/1.0'
        },
        timeout: 5000
      });

      checks.authentication = {
        sessionEndpoint: authResponse.status,
        available: authResponse.status < 500,
        nextAuthWorking: authResponse.headers.get('content-type')?.includes('json'),
        requiresLogin: authResponse.status === 401
      };
    } catch (error) {
      checks.authentication = { error: error.message };
    }

    // 上传接口允许缺失
    try {
      const uploadResponse = await fetch(`${baseUrl}/api/upload/check`, {
        method: 'GET',
        headers: {
          'User-Agent': 'AI-Agent-Marketplace-Checker/1.0'
        },
        timeout: 5000
      });

      checks.fileUpload = {
        available: uploadResponse.status >= 200 && uploadResponse.status < 400,
        status: uploadResponse.status,
        skipped: uploadResponse.status === 404,
        note: uploadResponse.status === 404 ? '上传接口未启用（已忽略）' : undefined
      };
    } catch (error) {
      checks.fileUpload = {
        error: error.message,
        available: false,
        skipped: false
      };
    }

    return checks;
  }

  /**
   * 将通用摘要与项目特定结果整合。
   */
  generateProjectSummary(checks) {
    const summary = super.generateSummary(checks);

    const project = checks.projectSpecific;
    if (project) {
      const coreEntries = Object.entries(project.coreAPIs || {});
      const requiredEntries = coreEntries.filter(([, api]) => !api.optional);
      const optionalEntries = coreEntries.filter(([, api]) => api.optional);
      const workingRequired = requiredEntries.filter(([, api]) => api.available);

      if (requiredEntries.length > 0) {
        if (workingRequired.length === requiredEntries.length) {
          summary.successes.push(`所有${requiredEntries.length}个核心 API 正常工作`);
        } else if (workingRequired.length >= Math.ceil(requiredEntries.length * 0.7)) {
          summary.warnings.push(`${workingRequired.length}/${requiredEntries.length} 个核心 API 正常，部分接口需要关注`);
        } else {
          summary.issues.push(`${workingRequired.length}/${requiredEntries.length} 个核心 API 正常工作`);
        }
      }

      const ignoredOptional = optionalEntries
        .filter(([, api]) => api.skipped)
        .map(([key]) => key);
      if (ignoredOptional.length > 0) {
        summary.successes.push(`可选接口已按配置忽略: ${ignoredOptional.join(', ')}`);
      }

      const optionalProblems = optionalEntries.filter(([, api]) => !api.available && !api.skipped);
      if (optionalProblems.length > 0) {
        summary.warnings.push(`可选接口状态异常: ${optionalProblems.map(([key]) => key).join(', ')}`);
      }

      if (project.agentSystem?.agentsAPI?.working) {
        summary.successes.push('智能体系统 API 正常');
      } else {
        summary.issues.push('智能体系统 API 异常');
      }

      if (project.authentication?.nextAuthWorking) {
        summary.successes.push('NextAuth 认证系统响应正常');
        if (project.authentication.requiresLogin) {
          summary.successes.push('匿名会话返回 401（预期行为）');
        }
      } else if (project.authentication?.error) {
        summary.issues.push(`认证系统检查失败: ${project.authentication.error}`);
      } else {
        summary.warnings.push('认证系统可能存在问题');
      }

      if (project.fileUpload?.skipped) {
        summary.successes.push('上传接口未启用（已忽略）');
      } else if (project.fileUpload && !project.fileUpload.available && !project.fileUpload.error) {
        summary.warnings.push('上传接口返回非 2xx 状态');
      } else if (project.fileUpload?.error) {
        summary.warnings.push(`上传接口检查失败: ${project.fileUpload.error}`);
      }
    }

    if (summary.issues.length === 0) {
      summary.overall = summary.warnings.length === 0 ? 'excellent' : 'good';
    } else if (summary.issues.length <= 2) {
      summary.overall = 'fair';
    } else {
      summary.overall = 'poor';
    }

    return summary;
  }

  /**
   * 将项目专项结果注入通用报告。
   */
  generateProjectReport(results) {
    const baseReport = super.generateReport(results);
    const projectSection = this.generateProjectSection(results.checks.projectSpecific);

    return baseReport.replace(
      '## 详细检查结果',
      `## AI智能体商城专项检查结果\n\n${projectSection}\n\n## 详细检查结果`
    );
  }

  /**
   * 项目专项报告内容。
   */
  generateProjectSection(projectChecks) {
    if (!projectChecks) {
      return '未执行项目特定检查';
    }

    const lines = [];

    lines.push('### 核心 API 状态');
    if (projectChecks.coreAPIs) {
      Object.entries(projectChecks.coreAPIs).forEach(([endpoint, result]) => {
        const icon = result.available ? '✅' : result.skipped ? '⚪' : '❌';
        const timing = result.responseTime ? ` (${result.responseTime})` : '';
        const statusText = result.status
          ? `${result.status}${result.statusText ? ` ${result.statusText}` : ''}`
          : result.error || '请求失败';

        const meta = [];
        if (result.optional) meta.push('可选');
        if (result.skipped) meta.push('允许缺失');
        if (Array.isArray(result.expectedStatuses)) {
          meta.push(`期望状态: ${result.expectedStatuses.join('/')}`);
        }
        if (result.note) meta.push(result.note);
        if (result.error && result.status) meta.push(result.error);

        const metaSuffix = meta.length > 0 ? `（${meta.join(' | ')}）` : '';

        lines.push(`- **${endpoint}**: ${icon} ${statusText}${timing}${metaSuffix}`);
      });
    }
    lines.push('');

    lines.push('### 智能体系统');
    if (projectChecks.agentSystem?.agentsAPI) {
      const agent = projectChecks.agentSystem.agentsAPI;
      if (agent.working) {
        lines.push('- **智能体 API**: ✅ 正常工作');
        lines.push(`- **数据结构**: ${agent.dataStructure}`);
        if (agent.count !== 'unknown') {
          lines.push(`- **智能体数量**: ${agent.count}`);
        }
      } else {
        lines.push(`- **智能体 API**: ❌ ${agent.error || '异常'}`);
      }
    } else {
      lines.push('- **智能体 API**: ⚪ 未检查');
    }
    lines.push('');

    lines.push('### 认证系统');
    if (projectChecks.authentication) {
      const auth = projectChecks.authentication;
      if (auth.nextAuthWorking) {
        const authMeta = auth.requiresLogin ? '（匿名返回 401）' : '';
        lines.push(`- **NextAuth**: ✅ 响应正常${authMeta}`);
      } else if (auth.error) {
        lines.push(`- **NextAuth**: ❌ 检查失败 - ${auth.error}`);
      } else {
        lines.push(`- **NextAuth**: ⚠️ 可能存在异常（状态: ${auth.sessionEndpoint}）`);
      }
    }
    lines.push('');

    lines.push('### 文件上传系统');
    if (projectChecks.fileUpload) {
      const upload = projectChecks.fileUpload;
      if (upload.available) {
        lines.push('- **上传接口**: ✅ 系统可用');
      } else if (upload.skipped) {
        lines.push('- **上传接口**: ⚪ 未启用（已忽略）');
      } else if (upload.error) {
        lines.push(`- **上传接口**: ❌ 检查失败 - ${upload.error}`);
      } else {
        lines.push(`- **上传接口**: ⚠️ 返回状态 ${upload.status}`);
      }
      if (upload.note) {
        lines.push(`  - 说明：${upload.note}`);
      }
    }
    lines.push('');

    return lines.join('\n');
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    save: true,
    summary: false,
    quiet: false
  };

  let url = null;

  for (const arg of args) {
    if (arg.startsWith('--')) {
      switch (arg) {
        case '--no-save':
          options.save = false;
          break;
        case '--summary':
          options.summary = true;
          options.quiet = true;
          break;
        case '--quiet':
          options.quiet = true;
          break;
        default:
          console.error(`未知参数: ${arg}`);
          process.exit(1);
      }
    } else if (!url) {
      url = arg;
    } else {
      console.error(`无法解析的参数: ${arg}`);
      process.exit(1);
    }
  }

  if (!url) {
    console.error('使用方法: node ai-marketplace-checker.js <URL> [--summary] [--no-save] [--quiet]');
    console.error('示例: node ai-marketplace-checker.js https://your-ai-marketplace.com --summary --no-save');
    process.exit(1);
  }

  const checker = new AIAgentMarketplaceChecker();
  const originalConsole = {
    log: console.log,
    warn: console.warn
  };

  if (options.quiet) {
    console.log = () => {};
    console.warn = () => {};
  }

  const restoreConsole = () => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
  };

  checker.checkAIAgentMarketplace(url)
    .then(results => {
      if (options.quiet) {
        restoreConsole();
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let resultsFile = null;
      let reportFile = null;

      if (options.save) {
        resultsFile = path.join(__dirname, `ai-marketplace-check-${timestamp}.json`);
        reportFile = path.join(__dirname, `ai-marketplace-check-${timestamp}.md`);

        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        const report = checker.generateProjectReport(results);
        fs.writeFileSync(reportFile, report);
      }

      if (options.summary) {
        console.log('--- AI智能体商城检查摘要 ---');
        console.log(`总体状态: ${results.summary.overall.toUpperCase()}`);
        if (results.summary.successes.length > 0) {
          console.log(`成功项:`);
          results.summary.successes.forEach(item => console.log(`  • ${item}`));
        }
        if (results.summary.warnings.length > 0) {
          console.log(`警告项:`);
          results.summary.warnings.forEach(item => console.log(`  • ${item}`));
        }
        if (results.summary.issues.length > 0) {
          console.log(`问题项:`);
          results.summary.issues.forEach(item => console.log(`  • ${item}`));
        }
        if (options.save && resultsFile && reportFile) {
          console.log(`结果文件: ${resultsFile}`);
          console.log(`报告文件: ${reportFile}`);
        }
      } else {
        console.log('\n✅ AI智能体商城检查完成！');
        console.log('='.repeat(60));

        if (options.save && resultsFile && reportFile) {
          console.log(`📁 详细结果已保存: ${resultsFile}`);
          console.log(`📄 专项报告已保存: ${reportFile}`);
        }

        const report = checker.generateProjectReport(results);
        console.log('\n📊 AI智能体商城检查报告:');
        console.log('='.repeat(60));
        console.log(report);
      }
    })
    .catch(error => {
      if (options.quiet) {
        restoreConsole();
      }
      console.error('❌ 检查失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = AIAgentMarketplaceChecker;
