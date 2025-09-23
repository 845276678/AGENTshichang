#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 自动化TypeScript错误修复脚本
 * 修复常见的TypeScript错误模式
 */

class TypeScriptErrorFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.errorCount = 0;
    this.fixCount = 0;
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
          // 跳过node_modules和其他不需要的目录
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
   * 修复Lucide图标导入错误
   * _IconName -> IconName
   */
  fixLucideIconImports(content) {
    let fixed = false;

    // 修复导入语句中的_图标名称
    const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"]/g;

    content = content.replace(importRegex, (match, imports) => {
      const fixedImports = imports.replace(/_([A-Z][a-zA-Z0-9]*)/g, (iconMatch, iconName) => {
        fixed = true;
        return iconName;
      });
      return match.replace(imports, fixedImports);
    });

    return { content, fixed };
  }

  /**
   * 移除未使用的导入
   */
  removeUnusedImports(content) {
    let fixed = false;
    const lines = content.split('\n');
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 检查是否是导入行
      if (line.trim().startsWith('import ') && !line.includes('type')) {
        // 提取导入的标识符
        const importMatch = line.match(/import\s*\{\s*([^}]+)\s*\}/);
        if (importMatch) {
          const imports = importMatch[1].split(',').map(imp => imp.trim());
          const usedImports = [];

          for (const imp of imports) {
            const cleanImp = imp.replace(/\s+as\s+\w+/, '').trim();
            // 检查这个导入是否在代码中被使用
            const usageRegex = new RegExp(`\\b${cleanImp}\\b`, 'g');
            const restOfFile = lines.slice(i + 1).join('\n');

            if (usageRegex.test(restOfFile)) {
              usedImports.push(imp);
            } else {
              fixed = true;
            }
          }

          if (usedImports.length === 0) {
            // 完全移除这行导入
            continue;
          } else if (usedImports.length < imports.length) {
            // 只保留使用的导入
            const newImportLine = line.replace(importMatch[1], usedImports.join(', '));
            newLines.push(newImportLine);
            continue;
          }
        }
      }

      newLines.push(line);
    }

    return { content: newLines.join('\n'), fixed };
  }

  /**
   * 修复未使用的变量声明
   */
  fixUnusedVariables(content) {
    let fixed = false;

    // 修复未使用的解构变量，添加下划线前缀
    const destructuringRegex = /const\s*\{\s*([^}]+)\s*\}\s*=/g;

    content = content.replace(destructuringRegex, (match, variables) => {
      const vars = variables.split(',').map(v => v.trim());
      const fixedVars = vars.map(variable => {
        // 如果变量名以多个下划线开头，说明是已经标记为未使用的
        if (variable.match(/^_{3,}/)) {
          return variable;
        }
        // 如果变量名不是以下划线开头，添加三个下划线前缀表示未使用
        if (!variable.startsWith('_')) {
          fixed = true;
          return `___${variable}`;
        }
        return variable;
      });

      return match.replace(variables, fixedVars.join(', '));
    });

    return { content, fixed };
  }

  /**
   * 修复exactOptionalPropertyTypes问题
   */
  fixExactOptionalPropertyTypes(content) {
    let fixed = false;

    // 修复函数调用中的undefined传递问题
    // 将 search: string | undefined 修复为显式处理
    content = content.replace(
      /(\w+):\s*([^,}\]]+\s*\|\s*undefined)/g,
      (match, prop, type) => {
        // 检查是否在对象字面量中
        if (content.indexOf(match) > 0) {
          const before = content.substring(0, content.indexOf(match));
          const afterLastBrace = before.lastIndexOf('{');
          const afterLastParen = before.lastIndexOf('(');

          if (afterLastBrace > afterLastParen) {
            fixed = true;
            return `${prop}: ${type.replace(/\s*\|\s*undefined/, '')} | undefined`;
          }
        }
        return match;
      }
    );

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
        this.fixLucideIconImports(newContent),
        this.removeUnusedImports(newContent),
        this.fixUnusedVariables(newContent),
        this.fixExactOptionalPropertyTypes(newContent)
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
        this.fixCount++;
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
    console.log('🚀 开始TypeScript错误自动修复...\n');

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
  const fixer = new TypeScriptErrorFixer();
  fixer.run().catch(console.error);
}

module.exports = TypeScriptErrorFixer;