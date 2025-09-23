#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * 精准修复TypeScript错误脚本
 */

// 需要批量修复的模式
const fixes = [
  // 移除过度添加的下划线前缀
  { from: /___(\w+)/g, to: '$1' },

  // 修复解构赋值语法
  { from: /const\s*\{\s*([^}]*___[^}]*)\s*\}/g, replaceFunction: (match, content) => {
    const cleanContent = content.replace(/___(\w+)/g, '$1');
    return `const { ${cleanContent} }`;
  }},

  // 修复测试文件的导入
  {
    from: /import\s*\{\s*render\s*\}\s*from\s*['"]@testing-library\/react['"]/g,
    to: "import { render, screen, waitFor } from '@testing-library/react'"
  },

  // 修复 exactOptionalPropertyTypes 错误
  { from: /image:\s*undefined/g, to: "image: ''" },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    fixes.forEach(fix => {
      if (fix.replaceFunction) {
        const newContent = content.replace(fix.from, fix.replaceFunction);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      } else {
        const newContent = content.replace(fix.from, fix.to);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function getAllTsFiles() {
  const output = execSync('find src tests -type f \\( -name "*.ts" -o -name "*.tsx" \\) 2>/dev/null || dir /s /b src\\*.ts src\\*.tsx tests\\*.ts tests\\*.tsx 2>nul', { encoding: 'utf8', shell: true });
  return output.split('\n').filter(line => line.trim().length > 0);
}

console.log('🚀 开始精准修复TypeScript错误...');

try {
  const files = getAllTsFiles();
  console.log(`📁 找到 ${files.length} 个TypeScript文件`);

  let fixedCount = 0;
  files.forEach(file => {
    if (fixFile(file)) {
      fixedCount++;
    }
  });

  console.log(`✅ 修复了 ${fixedCount} 个文件`);

  // 运行类型检查
  console.log('\n📊 运行类型检查...');
  try {
    execSync('npm run type-check', { stdio: 'inherit' });
    console.log('🎉 所有TypeScript错误已修复！');
  } catch (error) {
    console.log('⚠️  仍有一些错误需要处理');
  }

} catch (error) {
  console.error('❌ 脚本执行失败:', error.message);
}