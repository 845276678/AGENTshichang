#!/usr/bin/env node

const ChromeDevToolsMCP = require('./chrome-devtools-mcp.js');
const fs = require('fs');

/**
 * 竞价系统功能测试
 * 专门用于测试创意提交和AI对话框功能
 */
class BiddingSystemTester extends ChromeDevToolsMCP {

  /**
   * 测试竞价系统完整流程
   */
  async testBiddingSystem(baseUrl) {
    console.log(`\n🚀 开始测试竞价系统功能: ${baseUrl}`);

    const { chrome, port } = await this.startChrome(baseUrl + '/marketplace/bidding', {
      headless: false,  // 使用可视化模式以便观察
      userDataDir: './chrome-test-data'
    });

    try {
      // 等待页面加载
      await new Promise(resolve => setTimeout(resolve, 5000));

      const tabs = await this.getTabs(port);
      console.log(`🔍 找到 ${tabs.length} 个标签页:`);
      tabs.forEach((tab, index) => {
        console.log(`${index + 1}. ${tab.title} - ${tab.url}`);
      });

      const targetTab = tabs.find(tab =>
        tab.url.includes('marketplace') ||
        tab.url.includes('bidding') ||
        tab.url.includes('aijiayuan.top')
      ) || tabs[0]; // 如果没找到特定页面，使用第一个标签页

      if (!targetTab) {
        throw new Error('未找到竞价页面标签');
      }

      const ws = await this.connectToTab(targetTab.id, port);

      // 启用必要的域
      await this.sendCommand(ws, 'Runtime.enable');
      await this.sendCommand(ws, 'Page.enable');
      await this.sendCommand(ws, 'Network.enable');
      await this.sendCommand(ws, 'DOM.enable');

      console.log('📝 开始提交测试创意...');

      // 测试创意数据
      const testIdea = {
        title: '智能化宠物健康监测系统',
        description: '开发一款结合IoT传感器和AI分析的宠物健康监测设备，能够24小时监测宠物的体温、心率、活动量等生命体征，并通过手机App为宠物主人提供健康报告和异常预警。设备小巧便携，可穿戴式设计，适合各种大小的宠物。',
        category: 'TECH'
      };

      // 1. 填写创意表单
      await this.fillIdeaForm(ws, testIdea);

      // 2. 等待竞价开始
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 3. 监控AI对话框
      const dialogueResults = await this.monitorAIDialogue(ws);

      // 4. 检查竞价结果
      const biddingResults = await this.checkBiddingResults(ws);

      // 5. 验证对话框完整性
      const dialogueIntegrity = await this.validateDialogueIntegrity(ws);

      const results = {
        url: baseUrl,
        timestamp: new Date().toISOString(),
        testIdea,
        dialogueResults,
        biddingResults,
        dialogueIntegrity,
        status: 'completed'
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
   * 填写创意表单
   */
  async fillIdeaForm(ws, idea) {
    console.log('📋 填写创意表单...');

    try {
      // 填写标题
      await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          const titleInput = document.querySelector('input[name="title"], input[placeholder*="标题"], #idea-title');
          if (titleInput) {
            titleInput.value = '${idea.title}';
            titleInput.dispatchEvent(new Event('input', { bubbles: true }));
            titleInput.dispatchEvent(new Event('change', { bubbles: true }));
            'title-filled';
          } else {
            'title-input-not-found';
          }
        `,
        returnByValue: true
      });

      // 填写描述
      await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          const descTextarea = document.querySelector('textarea[name="description"], textarea[placeholder*="描述"], #idea-description');
          if (descTextarea) {
            descTextarea.value = '${idea.description}';
            descTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            descTextarea.dispatchEvent(new Event('change', { bubbles: true }));
            'description-filled';
          } else {
            'description-input-not-found';
          }
        `,
        returnByValue: true
      });

      // 选择分类
      await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          const categorySelect = document.querySelector('select[name="category"], #idea-category');
          if (categorySelect) {
            categorySelect.value = '${idea.category}';
            categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
            'category-selected';
          } else {
            'category-select-not-found';
          }
        `,
        returnByValue: true
      });

      // 点击提交按钮
      await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          const submitBtn = document.querySelector('button[type="submit"], button:contains("提交"), button:contains("开始竞价")');
          if (submitBtn) {
            submitBtn.click();
            'form-submitted';
          } else {
            'submit-button-not-found';
          }
        `,
        returnByValue: true
      });

      console.log('✅ 创意表单提交成功');

    } catch (error) {
      console.error('❌ 创意表单填写失败:', error.message);
      throw error;
    }
  }

  /**
   * 监控AI对话框内容
   */
  async monitorAIDialogue(ws) {
    console.log('🤖 开始监控AI对话框...');

    const dialogueMessages = [];
    const startTime = Date.now();
    const maxWaitTime = 60000; // 最多等待60秒

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const result = await this.sendCommand(ws, 'Runtime.evaluate', {
          expression: `
            // 查找AI对话框消息
            const messages = [];

            // 尝试多种选择器来找到AI消息
            const selectors = [
              '.bidding-message',
              '.ai-message',
              '.agent-message',
              '[data-agent-id]',
              '.dialogue-content .message',
              '.chat-message',
              '.bid-comment'
            ];

            selectors.forEach(selector => {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => {
                const agentName = el.getAttribute('data-agent-name') ||
                                el.querySelector('.agent-name')?.textContent ||
                                el.querySelector('.message-author')?.textContent ||
                                'Unknown Agent';

                const content = el.querySelector('.message-content')?.textContent ||
                               el.querySelector('.bid-content')?.textContent ||
                               el.textContent ||
                               '';

                const timestamp = el.getAttribute('data-timestamp') ||
                                 el.querySelector('.message-time')?.textContent ||
                                 Date.now();

                if (content.trim() && content.length > 10) {
                  messages.push({
                    agentName: agentName.trim(),
                    content: content.trim(),
                    timestamp,
                    isComplete: content.length > 20 && !content.includes('...') && !content.includes('加载中')
                  });
                }
              });
            });

            // 检查对话框容器是否存在
            const dialogueContainer = document.querySelector('.bidding-dialogue, .ai-dialogue, .chat-container');
            const isDialogueVisible = dialogueContainer ? getComputedStyle(dialogueContainer).display !== 'none' : false;

            // 检查是否有加载中的状态
            const loadingElements = document.querySelectorAll('.loading, .spinner, [data-loading="true"]');
            const isLoading = loadingElements.length > 0;

            ({
              messages: messages,
              dialogueVisible: isDialogueVisible,
              isLoading: isLoading,
              totalMessages: messages.length,
              completeMessages: messages.filter(m => m.isComplete).length
            });
          `,
          returnByValue: true
        });

        const data = result.result.value;
        console.log(`💬 检测到 ${data.totalMessages} 条消息，其中 ${data.completeMessages} 条完整`);

        if (data.messages.length > dialogueMessages.length) {
          const newMessages = data.messages.slice(dialogueMessages.length);
          newMessages.forEach(msg => {
            console.log(`🤖 ${msg.agentName}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
          });
        }

        dialogueMessages.length = 0;
        dialogueMessages.push(...data.messages);

        // 如果所有消息都完整且不再加载，结束监控
        if (data.totalMessages >= 5 && data.completeMessages === data.totalMessages && !data.isLoading) {
          console.log('✅ AI对话监控完成，所有消息接收完整');
          break;
        }

      } catch (error) {
        console.error('❌ 监控AI对话时出错:', error.message);
      }

      // 等待2秒后继续检查
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return {
      messages: dialogueMessages,
      totalDuration: Date.now() - startTime,
      isComplete: dialogueMessages.length > 0 && dialogueMessages.every(m => m.isComplete)
    };
  }

  /**
   * 检查竞价结果
   */
  async checkBiddingResults(ws) {
    console.log('💰 检查竞价结果...');

    try {
      const result = await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          // 查找竞价结果相关元素
          const bids = [];

          const bidElements = document.querySelectorAll('.bid, .bid-item, .agent-bid, [data-bid-amount]');

          bidElements.forEach(el => {
            const agentName = el.querySelector('.agent-name')?.textContent ||
                             el.getAttribute('data-agent-name') ||
                             'Unknown Agent';

            const bidAmount = el.querySelector('.bid-amount')?.textContent ||
                             el.getAttribute('data-bid-amount') ||
                             '0';

            const bidComment = el.querySelector('.bid-comment, .bid-reason')?.textContent || '';

            bids.push({
              agentName: agentName.trim(),
              amount: bidAmount.replace(/[^0-9]/g, ''),
              comment: bidComment.trim(),
              element: el.className
            });
          });

          // 检查是否有获胜者
          const winnerElement = document.querySelector('.winner, .highest-bid, .bid-winner');
          const winner = winnerElement ? winnerElement.textContent : null;

          // 检查竞价状态
          const statusElement = document.querySelector('.bidding-status, .auction-status');
          const status = statusElement ? statusElement.textContent : 'unknown';

          ({
            bids: bids,
            winner: winner,
            status: status.trim(),
            totalBids: bids.length
          });
        `,
        returnByValue: true
      });

      const data = result.result.value;
      console.log(`📊 检测到 ${data.totalBids} 个竞价，状态: ${data.status}`);

      if (data.winner) {
        console.log(`🏆 获胜者: ${data.winner}`);
      }

      return data;

    } catch (error) {
      console.error('❌ 检查竞价结果失败:', error.message);
      return { error: error.message };
    }
  }

  /**
   * 验证对话框内容完整性
   */
  async validateDialogueIntegrity(ws) {
    console.log('🔍 验证对话框内容完整性...');

    try {
      const result = await this.sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          const integrity = {
            truncatedMessages: [],
            missingElements: [],
            visualIssues: [],
            contentIssues: []
          };

          // 检查截断的消息
          const messages = document.querySelectorAll('.message, .ai-message, .bid-comment');
          messages.forEach((msg, index) => {
            const text = msg.textContent;
            if (text.includes('...') || text.includes('更多') || text.length < 10) {
              integrity.truncatedMessages.push({
                index,
                content: text.substring(0, 50),
                issues: text.includes('...') ? '文本截断' : '内容过短'
              });
            }
          });

          // 检查缺失的UI元素
          const expectedElements = [
            { selector: '.bidding-dialogue, .ai-dialogue', name: '对话框容器' },
            { selector: '.agent-avatar, .agent-icon', name: 'Agent头像' },
            { selector: '.bid-amount, .price', name: '竞价金额' },
            { selector: '.message-content, .bid-content', name: '消息内容' }
          ];

          expectedElements.forEach(item => {
            const element = document.querySelector(item.selector);
            if (!element) {
              integrity.missingElements.push(item.name);
            }
          });

          // 检查视觉问题
          const visibleMessages = Array.from(messages).filter(msg => {
            const style = getComputedStyle(msg);
            return style.display !== 'none' && style.visibility !== 'hidden';
          });

          if (visibleMessages.length !== messages.length) {
            integrity.visualIssues.push('部分消息不可见');
          }

          // 检查内容质量
          visibleMessages.forEach((msg, index) => {
            const text = msg.textContent;
            if (text.includes('undefined') || text.includes('null') || text.includes('[object Object]')) {
              integrity.contentIssues.push({
                index,
                issue: '内容渲染错误',
                content: text.substring(0, 30)
              });
            }
          });

          // 计算完整性评分
          const totalChecks = 4;
          let passedChecks = 0;

          if (integrity.truncatedMessages.length === 0) passedChecks++;
          if (integrity.missingElements.length === 0) passedChecks++;
          if (integrity.visualIssues.length === 0) passedChecks++;
          if (integrity.contentIssues.length === 0) passedChecks++;

          integrity.score = (passedChecks / totalChecks) * 100;
          integrity.status = integrity.score >= 75 ? 'good' : integrity.score >= 50 ? 'acceptable' : 'poor';

          integrity;
        `,
        returnByValue: true
      });

      const data = result.result.value;

      console.log(`📊 对话框完整性评分: ${data.score}% (${data.status})`);

      if (data.truncatedMessages.length > 0) {
        console.log(`⚠️ 发现 ${data.truncatedMessages.length} 条截断消息`);
      }

      if (data.missingElements.length > 0) {
        console.log(`⚠️ 缺失UI元素: ${data.missingElements.join(', ')}`);
      }

      return data;

    } catch (error) {
      console.error('❌ 验证对话框完整性失败:', error.message);
      return { error: error.message, score: 0, status: 'error' };
    }
  }

  /**
   * 生成竞价测试报告
   */
  generateBiddingReport(results) {
    const report = [];
    report.push('# 竞价系统功能测试报告');
    report.push(`\n**测试时间**: ${results.timestamp}`);
    report.push(`**测试URL**: ${results.url}`);
    report.push(`**测试状态**: ${results.status}\n`);

    // 测试创意信息
    report.push('## 📝 测试创意');
    report.push(`- **标题**: ${results.testIdea.title}`);
    report.push(`- **分类**: ${results.testIdea.category}`);
    report.push(`- **描述**: ${results.testIdea.description.substring(0, 100)}...\n`);

    // AI对话框测试结果
    report.push('## 🤖 AI对话框测试');
    if (results.dialogueResults.messages) {
      report.push(`- **消息总数**: ${results.dialogueResults.messages.length}`);
      report.push(`- **完整消息**: ${results.dialogueResults.messages.filter(m => m.isComplete).length}`);
      report.push(`- **监控时长**: ${Math.round(results.dialogueResults.totalDuration / 1000)}秒`);
      report.push(`- **完整性**: ${results.dialogueResults.isComplete ? '✅ 完整' : '⚠️ 不完整'}\n`);

      if (results.dialogueResults.messages.length > 0) {
        report.push('### AI消息示例:');
        results.dialogueResults.messages.slice(0, 3).forEach((msg, index) => {
          report.push(`${index + 1}. **${msg.agentName}**: ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}`);
        });
        report.push('');
      }
    }

    // 竞价结果
    report.push('## 💰 竞价结果');
    if (results.biddingResults.bids) {
      report.push(`- **参与竞价**: ${results.biddingResults.totalBids} 个Agent`);
      report.push(`- **竞价状态**: ${results.biddingResults.status}`);
      if (results.biddingResults.winner) {
        report.push(`- **获胜者**: ${results.biddingResults.winner}`);
      }
      report.push('');

      if (results.biddingResults.bids.length > 0) {
        report.push('### 竞价详情:');
        results.biddingResults.bids.forEach((bid, index) => {
          report.push(`${index + 1}. **${bid.agentName}**: ${bid.amount}积分 - ${bid.comment.substring(0, 100)}`);
        });
        report.push('');
      }
    }

    // 对话框完整性评估
    report.push('## 🔍 对话框完整性评估');
    if (results.dialogueIntegrity) {
      report.push(`- **完整性评分**: ${results.dialogueIntegrity.score}% (${results.dialogueIntegrity.status})`);

      if (results.dialogueIntegrity.truncatedMessages?.length > 0) {
        report.push(`- **截断消息**: ${results.dialogueIntegrity.truncatedMessages.length} 条`);
      }

      if (results.dialogueIntegrity.missingElements?.length > 0) {
        report.push(`- **缺失元素**: ${results.dialogueIntegrity.missingElements.join(', ')}`);
      }

      if (results.dialogueIntegrity.visualIssues?.length > 0) {
        report.push(`- **视觉问题**: ${results.dialogueIntegrity.visualIssues.join(', ')}`);
      }

      if (results.dialogueIntegrity.contentIssues?.length > 0) {
        report.push(`- **内容问题**: ${results.dialogueIntegrity.contentIssues.length} 个`);
      }
      report.push('');
    }

    // 总结建议
    report.push('## 📋 测试总结与建议');
    const issues = [];

    if (results.dialogueResults.messages.length === 0) {
      issues.push('❌ 未检测到AI消息，可能存在对话框加载问题');
    }

    if (results.dialogueIntegrity.score < 75) {
      issues.push('⚠️ 对话框完整性评分较低，建议检查消息渲染逻辑');
    }

    if (results.biddingResults.totalBids === 0) {
      issues.push('❌ 未检测到竞价结果，可能存在竞价逻辑问题');
    }

    if (issues.length === 0) {
      report.push('✅ **竞价系统运行正常，所有功能测试通过**');
    } else {
      report.push('⚠️ **发现以下问题需要关注**:');
      issues.forEach(issue => report.push(`   ${issue}`));
    }

    return report.join('\n');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const url = process.argv[2] || 'https://aijiayuan.top';

  const tester = new BiddingSystemTester();

  console.log('🚀 启动竞价系统功能测试...');

  tester.testBiddingSystem(url)
    .then(results => {
      console.log('\n✅ 竞价系统测试完成！');

      // 保存结果到文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsFile = `./bidding-test-${timestamp}.json`;
      const reportFile = `./bidding-test-${timestamp}.md`;

      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
      console.log(`详细结果已保存到: ${resultsFile}`);

      const report = tester.generateBiddingReport(results);
      fs.writeFileSync(reportFile, report);
      console.log(`测试报告已保存到: ${reportFile}`);

      console.log('\n📊 测试报告预览:');
      console.log('='.repeat(50));
      console.log(report.split('\n').slice(0, 30).join('\n'));
      console.log('\n... (完整报告请查看文件)');
    })
    .catch(error => {
      console.error('❌ 竞价系统测试失败:', error.message);
      process.exit(1);
    });
}

module.exports = BiddingSystemTester;