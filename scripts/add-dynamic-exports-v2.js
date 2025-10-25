#!/usr/bin/env node
/**
 * 批量为所有API路由添加 export const dynamic = 'force-dynamic'
 * 修复版：正确处理多行import语句
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 查找所有API route文件
const apiRoutes = glob.sync('src/app/api/**/route.ts', {
  cwd: process.cwd(),
  absolute: true
});

console.log(`找到 ${apiRoutes.length} 个API路由文件`);

let updatedCount = 0;
let skippedCount = 0;
let errorCount = 0;

apiRoutes.forEach((filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 检查是否已经有 dynamic export
    if (content.includes("export const dynamic = 'force-dynamic'") ||
        content.includes('export const dynamic = "force-dynamic"')) {
      skippedCount++;
      return;
    }

    // 找到所有import语句结束的位置
    // 策略：找到文件开头的所有import块，在它们全部结束后插入
    const lines = content.split('\n');
    let insertIndex = 0;
    let inImport = false;
    let foundAnyImport = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      // 检测import语句开始
      if (trimmed.startsWith('import ')) {
        inImport = true;
        foundAnyImport = true;
        insertIndex = i + 1;
      }
      // 检测多行import结束
      else if (inImport && trimmed.includes('}') && trimmed.includes('from')) {
        inImport = false;
        insertIndex = i + 1;
      }
      // 检测单行import
      else if (trimmed.startsWith('import ') && trimmed.includes('from')) {
        insertIndex = i + 1;
        foundAnyImport = true;
      }
      // 如果遇到非import非空行，且之前找到过import，则停止
      else if (!inImport && trimmed.length > 0 &&
               !trimmed.startsWith('//') &&
               !trimmed.startsWith('/*') &&
               !trimmed.startsWith('*') &&
               foundAnyImport) {
        // 确保在这行之前插入
        break;
      }
    }

    // 如果没找到import，在文件开头插入
    if (!foundAnyImport) {
      insertIndex = 0;
    }

    // 插入 dynamic export，确保前后有空行
    const dynamicExport = "export const dynamic = 'force-dynamic'";

    // 检查插入位置前后是否已有空行
    const needsBlankLineBefore = insertIndex > 0 && lines[insertIndex - 1].trim() !== '';
    const needsBlankLineAfter = insertIndex < lines.length && lines[insertIndex].trim() !== '';

    if (needsBlankLineBefore) {
      lines.splice(insertIndex, 0, '');
      insertIndex++;
    }

    lines.splice(insertIndex, 0, dynamicExport);

    if (needsBlankLineAfter) {
      lines.splice(insertIndex + 1, 0, '');
    }

    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');

    updatedCount++;
    console.log(`✅ 已更新: ${path.relative(process.cwd(), filePath)}`);
  } catch (error) {
    errorCount++;
    console.error(`❌ 错误: ${path.relative(process.cwd(), filePath)} - ${error.message}`);
  }
});

console.log('\n=== 执行完成 ===');
console.log(`✅ 更新: ${updatedCount} 个文件`);
console.log(`⏭️  跳过: ${skippedCount} 个文件（已有动态标记）`);
console.log(`❌ 错误: ${errorCount} 个文件`);
