#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 生产环境网站综合检查工具
 * 包含健康检查、性能检查、安全检查等
 */
class ProductionSiteChecker {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
  }

  /**
   * 基础健康检查 - 使用项目现有的健康检查API
   */
  async healthCheck(baseUrl) {
    console.log('执行健康检查...');

    const healthEndpoints = [
      '/api/health/simple',
      '/api/health',
      '/health',
      '/_health'
    ];

    const results = {};

    for (const endpoint of healthEndpoints) {
      try {
        const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`;
        console.log(`检查: ${url}`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Production-Site-Checker/1.0'
          },
          timeout: 10000
        });

        results[endpoint] = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          available: response.ok
        };

        if (response.ok) {
          try {
            const data = await response.text();
            results[endpoint].data = data;

            // 尝试解析JSON
            if (response.headers.get('content-type')?.includes('application/json')) {
              results[endpoint].json = JSON.parse(data);
            }
          } catch (e) {
            results[endpoint].parseError = e.message;
          }
        }

      } catch (error) {
        results[endpoint] = {
          error: error.message,
          available: false
        };
      }
    }

    return results;
  }

  /**
   * 网站基础可用性检查
   */
  async basicAvailabilityCheck(url) {
    console.log('执行基础可用性检查...');

    const checks = {
      mainPage: null,
      responseTime: null,
      httpStatus: null,
      headers: null,
      ssl: null
    };

    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Production-Site-Checker/1.0'
        },
        timeout: 15000
      });
      const responseTime = Date.now() - startTime;

      checks.responseTime = responseTime;
      checks.httpStatus = {
        code: response.status,
        text: response.statusText,
        ok: response.ok
      };

      checks.headers = Object.fromEntries(response.headers.entries());

      // SSL检查（仅适用于HTTPS）
      if (url.startsWith('https://')) {
        checks.ssl = {
          protocol: 'https',
          secure: true
        };
      }

      // 获取页面内容进行基础检查
      const content = await response.text();
      checks.mainPage = {
        size: content.length,
        hasTitle: /<title.*?>(.*?)<\/title>/i.test(content),
        hasDoctype: /<!doctype/i.test(content),
        hasErrors: /error|exception|fatal/i.test(content)
      };

    } catch (error) {
      checks.error = error.message;
    }

    return checks;
  }

  /**
   * 数据库连接检查（通过API）
   */
  async databaseCheck(baseUrl) {
    console.log('执行数据库连接检查...');

    try {
      // 尝试访问需要数据库的API端点
      const testEndpoints = [
        '/api/agents',
        '/api/agents/featured',
        '/api/user/profile'
      ];

      const results = {};

      for (const endpoint of testEndpoints) {
        try {
          const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`;
          const response = await fetch(url, {
            method: 'GET',
            timeout: 10000
          });

          results[endpoint] = {
            status: response.status,
            available: response.status !== 500,
            responseTime: response.headers.get('x-response-time') || 'unknown'
          };

          // 检查是否有数据库错误
          if (response.status === 500) {
            const text = await response.text();
            results[endpoint].databaseError = /database|connection|timeout/i.test(text);
          }

        } catch (error) {
          results[endpoint] = {
            error: error.message,
            available: false
          };
        }
      }

      return results;

    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * 资源加载检查
   */
  async resourceCheck(url) {
    console.log('执行资源加载检查...');

    try {
      const response = await fetch(url);
      const html = await response.text();

      // 提取资源链接
      const resources = {
        stylesheets: [],
        scripts: [],
        images: [],
        failures: []
      };

      // CSS文件
      const cssMatches = html.match(/<link[^>]*href=["']([^"']*\.css[^"']*)/gi) || [];
      for (const match of cssMatches) {
        const href = match.match(/href=["']([^"']*)/)[1];
        const fullUrl = new URL(href, url).href;
        resources.stylesheets.push(fullUrl);
      }

      // JS文件
      const jsMatches = html.match(/<script[^>]*src=["']([^"']*\.js[^"']*)/gi) || [];
      for (const match of jsMatches) {
        const src = match.match(/src=["']([^"']*)/)[1];
        const fullUrl = new URL(src, url).href;
        resources.scripts.push(fullUrl);
      }

      // 图片文件
      const imgMatches = html.match(/<img[^>]*src=["']([^"']*)/gi) || [];
      for (const match of imgMatches) {
        const src = match.match(/src=["']([^"']*)/)[1];
        const fullUrl = new URL(src, url).href;
        resources.images.push(fullUrl);
      }

      // 检查关键资源的可用性（最多检查5个）
      const criticalResources = [
        ...resources.stylesheets.slice(0, 3),
        ...resources.scripts.slice(0, 2)
      ];

      for (const resourceUrl of criticalResources) {
        try {
          const resourceResponse = await fetch(resourceUrl, {
            method: 'HEAD',
            timeout: 5000
          });

          if (!resourceResponse.ok) {
            resources.failures.push({
              url: resourceUrl,
              status: resourceResponse.status,
              type: resourceUrl.includes('.css') ? 'stylesheet' : 'script'
            });
          }
        } catch (error) {
          resources.failures.push({
            url: resourceUrl,
            error: error.message,
            type: resourceUrl.includes('.css') ? 'stylesheet' : 'script'
          });
        }
      }

      return resources;

    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * 执行完整的生产环境检查
   */
  async checkProductionSite(url) {
    console.log(`\n开始检查生产环境网站: ${url}`);
    console.log('=' .repeat(60));

    const results = {
      url,
      timestamp: new Date().toISOString(),
      checks: {},
      summary: {}
    };

    try {
      // 1. 基础可用性检查
      console.log('1/4 基础可用性检查...');
      results.checks.availability = await this.basicAvailabilityCheck(url);

      // 2. 健康检查API
      console.log('2/4 健康检查API...');
      results.checks.health = await this.healthCheck(url);

      // 3. 数据库连接检查
      console.log('3/4 数据库连接检查...');
      results.checks.database = await this.databaseCheck(url);

      // 4. 资源加载检查
      console.log('4/4 资源加载检查...');
      results.checks.resources = await this.resourceCheck(url);

      // 生成摘要
      results.summary = this.generateSummary(results.checks);
      results.duration = Date.now() - this.startTime;

      return results;

    } catch (error) {
      results.error = error.message;
      return results;
    }
  }

  /**
   * 生成检查摘要
   */
  generateSummary(checks) {
    const summary = {
      overall: 'unknown',
      issues: [],
      warnings: [],
      successes: []
    };

    // 检查基础可用性
    if (checks.availability) {
      if (checks.availability.httpStatus?.ok) {
        summary.successes.push('网站基础可用性正常');
      } else {
        summary.issues.push(`HTTP状态异常: ${checks.availability.httpStatus?.code || '未知'}`);
      }

      if (checks.availability.responseTime > 5000) {
        summary.warnings.push(`响应时间较慢: ${checks.availability.responseTime}ms`);
      }
    }

    // 检查健康API
    const healthAPIs = Object.values(checks.health || {});
    const workingHealthAPIs = healthAPIs.filter(api => api.available);

    if (workingHealthAPIs.length > 0) {
      summary.successes.push(`${workingHealthAPIs.length}个健康检查API正常工作`);
    } else {
      summary.warnings.push('未发现可用的健康检查API');
    }

    // 检查数据库连接
    if (checks.database && !checks.database.error) {
      const dbAPIs = Object.values(checks.database);
      const workingDBAPIs = dbAPIs.filter(api => api.available);

      if (workingDBAPIs.length > 0) {
        summary.successes.push(`${workingDBAPIs.length}个数据库相关API正常`);
      } else {
        summary.issues.push('数据库连接可能存在问题');
      }
    }

    // 检查资源加载
    if (checks.resources && checks.resources.failures) {
      if (checks.resources.failures.length === 0) {
        summary.successes.push('关键资源加载正常');
      } else {
        summary.warnings.push(`${checks.resources.failures.length}个资源加载失败`);
      }
    }

    // 确定整体状态
    if (summary.issues.length === 0) {
      summary.overall = summary.warnings.length === 0 ? 'excellent' : 'good';
    } else {
      summary.overall = 'poor';
    }

    return summary;
  }

  /**
   * 生成可读的报告
   */
  generateReport(results) {
    const lines = [];

    lines.push('# 生产环境网站检查报告');
    lines.push('');
    lines.push(`**检查URL**: ${results.url}`);
    lines.push(`**检查时间**: ${results.timestamp}`);
    lines.push(`**检查耗时**: ${results.duration}ms`);
    lines.push('');

    // 总体状态
    const statusEmoji = {
      excellent: '🟢',
      good: '🟡',
      poor: '🔴',
      unknown: '⚪'
    };

    lines.push('## 总体状态');
    lines.push(`${statusEmoji[results.summary.overall]} **${results.summary.overall.toUpperCase()}**`);
    lines.push('');

    // 成功项目
    if (results.summary.successes.length > 0) {
      lines.push('### ✅ 正常项目');
      results.summary.successes.forEach(success => {
        lines.push(`- ${success}`);
      });
      lines.push('');
    }

    // 警告项目
    if (results.summary.warnings.length > 0) {
      lines.push('### ⚠️ 警告项目');
      results.summary.warnings.forEach(warning => {
        lines.push(`- ${warning}`);
      });
      lines.push('');
    }

    // 问题项目
    if (results.summary.issues.length > 0) {
      lines.push('### ❌ 问题项目');
      results.summary.issues.forEach(issue => {
        lines.push(`- ${issue}`);
      });
      lines.push('');
    }

    // 详细检查结果
    lines.push('## 详细检查结果');
    lines.push('');

    // 基础可用性
    if (results.checks.availability) {
      lines.push('### 基础可用性检查');
      const avail = results.checks.availability;

      if (avail.httpStatus) {
        lines.push(`- **HTTP状态**: ${avail.httpStatus.code} ${avail.httpStatus.text}`);
      }

      if (avail.responseTime) {
        lines.push(`- **响应时间**: ${avail.responseTime}ms`);
      }

      if (avail.mainPage) {
        lines.push(`- **页面大小**: ${avail.mainPage.size} bytes`);
        lines.push(`- **包含标题**: ${avail.mainPage.hasTitle ? '是' : '否'}`);
        lines.push(`- **包含DOCTYPE**: ${avail.mainPage.hasDoctype ? '是' : '否'}`);
      }

      lines.push('');
    }

    // 健康检查API
    lines.push('### 健康检查API');
    if (results.checks.health) {
      Object.entries(results.checks.health).forEach(([endpoint, result]) => {
        const status = result.available ? '✅' : '❌';
        lines.push(`- **${endpoint}**: ${status} ${result.status || result.error || ''}`);
      });
    } else {
      lines.push('- 未执行健康检查');
    }
    lines.push('');

    // 资源检查
    if (results.checks.resources && !results.checks.resources.error) {
      lines.push('### 资源加载检查');
      const res = results.checks.resources;
      lines.push(`- **样式表**: ${res.stylesheets?.length || 0}个`);
      lines.push(`- **脚本文件**: ${res.scripts?.length || 0}个`);
      lines.push(`- **图片文件**: ${res.images?.length || 0}个`);
      lines.push(`- **加载失败**: ${res.failures?.length || 0}个`);

      if (res.failures && res.failures.length > 0) {
        lines.push('');
        lines.push('**失败的资源**:');
        res.failures.forEach(failure => {
          lines.push(`- ${failure.url} (${failure.status || failure.error})`);
        });
      }
      lines.push('');
    }

    lines.push('---');
    lines.push(`*报告生成时间: ${new Date().toLocaleString('zh-CN')}*`);

    return lines.join('\n');
  }
}

// 导出类
module.exports = ProductionSiteChecker;

// 如果直接运行此脚本
if (require.main === module) {
  const url = process.argv[2];

  if (!url) {
    console.error('使用方法: node production-site-checker.js <URL>');
    console.error('示例: node production-site-checker.js https://your-website.com');
    process.exit(1);
  }

  const checker = new ProductionSiteChecker();

  checker.checkProductionSite(url)
    .then(results => {
      console.log('\n✅ 检查完成！');
      console.log('=' .repeat(60));

      // 保存详细结果
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsFile = path.join(__dirname, `production-check-${timestamp}.json`);
      const reportFile = path.join(__dirname, `production-check-${timestamp}.md`);

      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
      console.log(`📁 详细结果已保存: ${resultsFile}`);

      // 生成并保存报告
      const report = checker.generateReport(results);
      fs.writeFileSync(reportFile, report);
      console.log(`📄 检查报告已保存: ${reportFile}`);

      // 控制台输出报告
      console.log('\n📊 检查报告预览:');
      console.log('=' .repeat(60));
      console.log(report);

    })
    .catch(error => {
      console.error('❌ 检查失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}