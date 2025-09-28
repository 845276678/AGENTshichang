#!/usr/bin/env node

/**
 * AI智能体商城 - 生产环境专用检查脚本
 * 基于项目特点定制的检查工具
 */

const ProductionSiteChecker = require('./production-site-checker');

class AIAgentMarketplaceChecker extends ProductionSiteChecker {
  constructor() {
    super();
    this.projectEndpoints = [
      '/api/health/simple',
      '/api/health',
      '/api/agents',
      '/api/agents/featured',
      '/api/user/profile',
      '/api/auth/session',
      '/api/search',
      '/api/categories'
    ];
  }

  /**
   * AI智能体商城专项检查
   */
  async checkAIAgentMarketplace(url) {
    console.log(`\n🤖 AI智能体商城 - 生产环境检查`);
    console.log(`目标URL: ${url}`);
    console.log('=' .repeat(60));

    const results = await this.checkProductionSite(url);

    // 添加项目特定检查
    results.checks.projectSpecific = await this.projectSpecificChecks(url);

    // 重新生成摘要
    results.summary = this.generateProjectSummary(results.checks);

    return results;
  }

  /**
   * 项目特定检查
   */
  async projectSpecificChecks(url) {
    console.log('执行项目特定检查...');

    const checks = {
      coreAPIs: {},
      authentication: {},
      agentSystem: {},
      fileUpload: {}
    };

    // 1. 核心API检查
    for (const endpoint of this.projectEndpoints) {
      try {
        const apiUrl = `${url.replace(/\/$/, '')}${endpoint}`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          timeout: 10000
        });

        checks.coreAPIs[endpoint] = {
          status: response.status,
          available: response.ok,
          responseTime: response.headers.get('x-response-time'),
          contentType: response.headers.get('content-type')
        };

        // 特殊处理一些端点
        if (endpoint === '/api/agents' && response.ok) {
          try {
            const data = await response.json();
            checks.agentSystem.agentsAPI = {
              working: true,
              dataStructure: Array.isArray(data) ? 'array' : 'object',
              count: Array.isArray(data) ? data.length : 'unknown'
            };
          } catch (e) {
            checks.agentSystem.agentsAPI = { working: false, error: e.message };
          }
        }

      } catch (error) {
        checks.coreAPIs[endpoint] = {
          error: error.message,
          available: false
        };
      }
    }

    // 2. 认证系统检查
    try {
      const authResponse = await fetch(`${url}/api/auth/session`, {
        method: 'GET',
        timeout: 5000
      });

      checks.authentication = {
        sessionEndpoint: authResponse.status,
        available: authResponse.status !== 500,
        nextAuthWorking: authResponse.headers.get('content-type')?.includes('json')
      };
    } catch (error) {
      checks.authentication = { error: error.message };
    }

    // 3. 文件上传系统检查
    try {
      const uploadResponse = await fetch(`${url}/api/upload/check`, {
        method: 'GET',
        timeout: 5000
      });

      checks.fileUpload = {
        available: uploadResponse.status !== 404,
        status: uploadResponse.status
      };
    } catch (error) {
      checks.fileUpload = { error: error.message };
    }

    return checks;
  }

  /**
   * 生成项目专用摘要
   */
  generateProjectSummary(checks) {
    const summary = super.generateSummary(checks);

    // 添加项目特定的评估
    if (checks.projectSpecific) {
      const project = checks.projectSpecific;

      // 核心API状态
      const workingAPIs = Object.values(project.coreAPIs || {}).filter(api => api.available);
      const totalAPIs = Object.keys(project.coreAPIs || {}).length;

      if (workingAPIs.length === totalAPIs && totalAPIs > 0) {
        summary.successes.push(`所有${totalAPIs}个核心API正常工作`);
      } else if (workingAPIs.length > totalAPIs * 0.7) {
        summary.warnings.push(`${workingAPIs.length}/${totalAPIs}个核心API正常，部分API可能有问题`);
      } else {
        summary.issues.push(`仅${workingAPIs.length}/${totalAPIs}个核心API正常工作`);
      }

      // 智能体系统检查
      if (project.agentSystem?.agentsAPI?.working) {
        summary.successes.push('智能体系统API正常');
      } else {
        summary.issues.push('智能体系统API异常');
      }

      // 认证系统检查
      if (project.authentication?.nextAuthWorking) {
        summary.successes.push('NextAuth认证系统正常');
      } else {
        summary.warnings.push('认证系统可能存在问题');
      }
    }

    // 重新评估整体状态
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
   * 生成项目专用报告
   */
  generateProjectReport(results) {
    const report = this.generateReport(results);

    // 添加项目特定部分
    const projectSection = this.generateProjectSection(results.checks.projectSpecific);

    return report.replace(
      '## 详细检查结果',
      `## AI智能体商城专项检查结果\n\n${projectSection}\n\n## 详细检查结果`
    );
  }

  /**
   * 生成项目特定报告部分
   */
  generateProjectSection(projectChecks) {
    if (!projectChecks) return '未执行项目特定检查';

    const lines = [];

    // 核心API状态
    lines.push('### 核心API状态');
    if (projectChecks.coreAPIs) {
      Object.entries(projectChecks.coreAPIs).forEach(([endpoint, result]) => {
        const status = result.available ? '✅' : '❌';
        const timing = result.responseTime ? ` (${result.responseTime})` : '';
        lines.push(`- **${endpoint}**: ${status} ${result.status || result.error}${timing}`);
      });
    }
    lines.push('');

    // 智能体系统
    lines.push('### 智能体系统');
    if (projectChecks.agentSystem?.agentsAPI) {
      const agent = projectChecks.agentSystem.agentsAPI;
      if (agent.working) {
        lines.push(`- **智能体API**: ✅ 正常工作`);
        lines.push(`- **数据结构**: ${agent.dataStructure}`);
        if (agent.count !== 'unknown') {
          lines.push(`- **智能体数量**: ${agent.count}`);
        }
      } else {
        lines.push(`- **智能体API**: ❌ ${agent.error || '异常'}`);
      }
    } else {
      lines.push('- **智能体API**: ⚪ 未检查');
    }
    lines.push('');

    // 认证系统
    lines.push('### 认证系统');
    if (projectChecks.authentication) {
      const auth = projectChecks.authentication;
      if (auth.nextAuthWorking) {
        lines.push('- **NextAuth**: ✅ 正常工作');
      } else {
        lines.push(`- **NextAuth**: ⚠️ 可能异常 (状态: ${auth.sessionEndpoint})`);
      }
    }
    lines.push('');

    // 文件上传
    lines.push('### 文件上传系统');
    if (projectChecks.fileUpload) {
      const upload = projectChecks.fileUpload;
      if (upload.available) {
        lines.push('- **文件上传**: ✅ 系统可用');
      } else {
        lines.push(`- **文件上传**: ⚪ 未配置或不可用 (${upload.status})`);
      }
    }
    lines.push('');

    return lines.join('\n');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const url = process.argv[2];

  if (!url) {
    console.error('使用方法: node ai-marketplace-checker.js <URL>');
    console.error('示例: node ai-marketplace-checker.js https://your-ai-marketplace.com');
    process.exit(1);
  }

  const checker = new AIAgentMarketplaceChecker();

  checker.checkAIAgentMarketplace(url)
    .then(results => {
      console.log('\n✅ AI智能体商城检查完成！');
      console.log('=' .repeat(60));

      // 保存详细结果
      const fs = require('fs');
      const path = require('path');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsFile = path.join(__dirname, `ai-marketplace-check-${timestamp}.json`);
      const reportFile = path.join(__dirname, `ai-marketplace-check-${timestamp}.md`);

      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
      console.log(`📁 详细结果已保存: ${resultsFile}`);

      // 生成并保存专项报告
      const report = checker.generateProjectReport(results);
      fs.writeFileSync(reportFile, report);
      console.log(`📄 专项报告已保存: ${reportFile}`);

      // 控制台输出报告
      console.log('\n📊 AI智能体商城检查报告:');
      console.log('=' .repeat(60));
      console.log(report);

    })
    .catch(error => {
      console.error('❌ 检查失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = AIAgentMarketplaceChecker;