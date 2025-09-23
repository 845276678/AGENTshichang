#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 智能TypeScript错误修复脚本 v2.0
 * 修复由自动化脚本产生的错误
 */

class SmartTypeScriptErrorFixer {
  constructor() {
    this.fixedFiles = new Set();
  }

  /**
   * 获取所有TypeScript文件
   */
  getAllTsFiles(dir = 'src', extensions = ['.ts', '.tsx']) {
    const files = [];

    function traverse(currentDir) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
            traverse(fullPath);
          }
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }

    traverse(dir);
    return files;
  }

  /**
   * 修复过度添加下划线前缀的错误
   */
  fixOverPrefixedVariables(content) {
    let fixed = false;

    // 修复解构中的过度前缀，如果变量在代码中被使用，移除前缀
    const destructuringRegex = /const\s*\{\s*([^}]+)\s*\}\s*=/g;
    let match;

    while ((match = destructuringRegex.exec(content)) !== null) {
      const variables = match[1];
      const newVariables = [];
      const variableList = variables.split(',').map(v => v.trim());

      for (let variable of variableList) {
        // 处理重命名格式 prop: newName
        const renameMatch = variable.match(/^(\w+):\s*___(\w+)(?:\s*=.*)?$/);
        if (renameMatch) {
          const [, prop, varName] = renameMatch;
          const cleanVarName = varName;

          // 检查这个变量是否在代码中被使用
          const usageRegex = new RegExp(`\\b${cleanVarName}\\b`);
          const restOfFile = content.substring(match.index + match[0].length);

          if (usageRegex.test(restOfFile)) {
            // 被使用，移除前缀
            variable = variable.replace(`___${varName}`, cleanVarName);
            fixed = true;
          }
        }
        // 处理简单变量格式
        else if (variable.startsWith('___')) {
          const cleanVar = variable.replace(/^___/, '');
          const cleanVarName = cleanVar.split('=')[0].trim().split(':')[0].trim();

          // 检查这个变量是否在代码中被使用
          const usageRegex = new RegExp(`\\b${cleanVarName}\\b`);
          const restOfFile = content.substring(match.index + match[0].length);

          if (usageRegex.test(restOfFile)) {
            // 被使用，移除前缀
            variable = cleanVar;
            fixed = true;
          }
        }

        newVariables.push(variable);
      }

      if (fixed) {
        const newDestructuring = `const { ${newVariables.join(', ')} } =`;
        content = content.replace(match[0], newDestructuring);
      }
    }

    return { content, fixed };
  }

  /**
   * 修复引用错误的变量名
   */
  fixVariableReferences(content) {
    let fixed = false;

    // 修复类似 Cannot find name 'searchParams'. Did you mean '___searchParams'? 的错误
    const errorPatterns = [
      // 从 ___varName 恢复到 varName
      { from: /(\b)___(\w+)(\b)/g, to: '$1$2$3' },
    ];

    errorPatterns.forEach(pattern => {
      const newContent = content.replace(pattern.from, pattern.to);
      if (newContent !== content) {
        content = newContent;
        fixed = true;
      }
    });

    return { content, fixed };
  }

  /**
   * 修复测试文件中的导入问题
   */
  fixTestImports(content) {
    let fixed = false;

    // 修复 @testing-library/react 导入
    if (content.includes(`import { render } from '@testing-library/react'`)) {
      content = content.replace(
        `import { render } from '@testing-library/react'`,
        `import { render, screen, waitFor } from '@testing-library/react'`
      );
      fixed = true;
    }

    // 修复 userEvent 导入和使用
    if (content.includes('___userEvent')) {
      content = content.replace(/___userEvent/g, 'userEvent');
      fixed = true;
    }

    // 修复 container 变量
    if (content.includes('___container')) {
      content = content.replace(/___container/g, 'container');
      fixed = true;
    }

    return { content, fixed };
  }

  /**
   * 修复exactOptionalPropertyTypes问题
   */
  fixExactOptionalProps(content) {
    let fixed = false;

    // 修复测试中的 image: undefined 问题
    if (content.includes('image: undefined')) {
      content = content.replace(/image: undefined/g, 'image: \'\'');
      fixed = true;
    }

    return { content, fixed };
  }

  /**
   * 修复单个文件
   */
  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let newContent = content;
      let fileFixed = false;

      // 应用各种修复
      const fixes = [
        this.fixOverPrefixedVariables(newContent),
        this.fixVariableReferences(newContent),
        this.fixTestImports(newContent),
        this.fixExactOptionalProps(newContent)
      ];

      for (const fix of fixes) {
        if (fix.fixed) {
          newContent = fix.content;
          fileFixed = true;
        }
      }

      // 如果有修复，写回文件
      if (fileFixed) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        this.fixedFiles.add(filePath);
        console.log(`✅ Fixed: ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  /**
   * 运行类型检查并获取错误
   */
  getTypeScriptErrors() {
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
      return [];
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : error.stderr.toString();
      const lines = output.split('\n');
      const errors = lines.filter(line => line.includes('error TS'));
      return errors;
    }
  }

  /**
   * 主修复流程
   */
  async run() {
    console.log('🚀 开始智能TypeScript错误修复...\n');

    // 获取初始错误数量
    const initialErrors = this.getTypeScriptErrors();
    console.log(`📊 初始错误数量: ${initialErrors.length}\n`);

    // 获取所有TypeScript文件
    const allFiles = [
      ...this.getAllTsFiles('src'),
      ...this.getAllTsFiles('tests')
    ];

    console.log(`📁 找到 ${allFiles.length} 个TypeScript文件\n`);

    // 修复每个文件
    for (const file of allFiles) {
      this.fixFile(file);
    }

    // 获取修复后的错误数量
    const finalErrors = this.getTypeScriptErrors();

    console.log('\n📈 修复摘要:');
    console.log(`- 修复的文件数量: ${this.fixedFiles.size}`);
    console.log(`- 初始错误数量: ${initialErrors.length}`);
    console.log(`- 剩余错误数量: ${finalErrors.length}`);
    console.log(`- 修复的错误数量: ${initialErrors.length - finalErrors.length}`);

    if (finalErrors.length > 0) {
      console.log('\n⚠️  仍需手动修复的错误:');
      finalErrors.slice(0, 10).forEach(error => console.log(`  ${error}`));
      if (finalErrors.length > 10) {
        console.log(`  ... 还有 ${finalErrors.length - 10} 个错误`);
      }
    } else {
      console.log('\n🎉 所有TypeScript错误已修复！');
    }

    return {
      fixedFiles: Array.from(this.fixedFiles),
      initialErrorCount: initialErrors.length,
      finalErrorCount: finalErrors.length,
      fixedErrorCount: initialErrors.length - finalErrors.length
    };
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const fixer = new SmartTypeScriptErrorFixer();
  fixer.run().catch(console.error);
}

module.exports = SmartTypeScriptErrorFixer;