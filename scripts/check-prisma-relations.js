/**
 * 检查Prisma create操作是否缺失必需的关系字段
 */

const fs = require('fs');
const path = require('path');

// 从schema中提取的必需关系字段（非可选）
const requiredRelations = {
  'BusinessPlanReport': ['userId', 'sessionId'],
  'CreditTransaction': ['userId', 'balanceBefore', 'balanceAfter'],
  'IdeaDiscussion': ['ideaId', 'userId', 'aiAgentType', 'aiAgentName'],
  'DiscussionMessage': ['discussionId', 'content', 'messageType', 'roundNumber', 'senderType'],
  'Idea': ['userId', 'title', 'description'],
  'CartItem': ['userId'],
  'Order': ['userId'],
  'BiddingSession': ['ideaId'],
  'BiddingMessage': ['sessionId', 'userId'],
};

function findCreateCalls(dir, results = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      findCreateCalls(filepath, results);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filepath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // 匹配 prisma.xxx.create 或 tx.xxx.create
        const match = line.match(/(prisma|tx)\.(\w+)\.create/);
        if (match) {
          const modelName = match[2].charAt(0).toUpperCase() + match[2].slice(1);

          // 获取create调用的完整代码块
          let blockStart = index;
          let blockEnd = index;
          let braceCount = 0;
          let foundStart = false;

          for (let i = index; i < Math.min(index + 30, lines.length); i++) {
            const currentLine = lines[i];

            if (currentLine.includes('create({')) foundStart = true;
            if (foundStart) {
              braceCount += (currentLine.match(/{/g) || []).length;
              braceCount -= (currentLine.match(/}/g) || []).length;
              blockEnd = i;
              if (braceCount === 0) break;
            }
          }

          const codeBlock = lines.slice(blockStart, blockEnd + 1).join('\n');

          results.push({
            file: filepath,
            line: index + 1,
            model: modelName,
            code: codeBlock.trim()
          });
        }
      });
    }
  }

  return results;
}

// 检查create调用是否包含必需字段
function checkRequiredFields(creates) {
  const issues = [];

  for (const create of creates) {
    const requiredFields = requiredRelations[create.model];

    if (requiredFields) {
      const missingFields = requiredFields.filter(field => {
        // 检查字段是否在代码中
        const fieldPattern = new RegExp(`\\b${field}\\s*:`);
        return !fieldPattern.test(create.code);
      });

      if (missingFields.length > 0) {
        issues.push({
          file: create.file,
          line: create.line,
          model: create.model,
          missingFields,
          code: create.code.split('\n').slice(0, 10).join('\n') // 只显示前10行
        });
      }
    }
  }

  return issues;
}

// 运行检查
console.log('🔍 开始检查Prisma create操作...\n');

const creates = findCreateCalls('src');
console.log(`✅ 找到 ${creates.length} 个create操作\n`);

const issues = checkRequiredFields(creates);

if (issues.length === 0) {
  console.log('✅ 没有发现缺失必需字段的问题！');
} else {
  console.log(`⚠️  发现 ${issues.length} 个潜在问题:\n`);

  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}:${issue.line}`);
    console.log(`   Model: ${issue.model}`);
    console.log(`   缺失字段: ${issue.missingFields.join(', ')}`);
    console.log(`   代码预览:\n${issue.code}\n`);
  });
}

console.log(`\n✅ 检查完成`);
