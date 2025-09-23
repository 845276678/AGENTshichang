const fs = require('fs');
const path = require('path');

function getAllTsFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          traverse(fullPath);
        }
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 移除所有三个下划线前缀
    content = content.replace(/___/g, '');

    // 修复 Lucide icon 导入中的下划线前缀
    content = content.replace(/import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]lucide-react['"]/g, (match, imports) => {
      const cleanImports = imports.replace(/_([A-Z][a-zA-Z0-9]*)/g, '$1');
      return match.replace(imports, cleanImports);
    });

    // 修复组件导入中的下划线前缀
    content = content.replace(/import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]@\/components\/ui['"]/g, (match, imports) => {
      const cleanImports = imports.replace(/_([A-Z][a-zA-Z0-9]*)/g, '$1');
      return match.replace(imports, cleanImports);
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

console.log('🚀 开始清理下划线前缀...');

const srcFiles = getAllTsFiles('src');
const testFiles = getAllTsFiles('tests');
const allFiles = [...srcFiles, ...testFiles];

console.log(`📁 找到 ${allFiles.length} 个文件`);

let cleanedCount = 0;
allFiles.forEach(file => {
  if (cleanFile(file)) {
    cleanedCount++;
  }
});

console.log(`✅ 清理了 ${cleanedCount} 个文件`);
console.log('🎉 完成！');