const fs = require('fs');
const path = require('path');

function findTSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('generated')) {
      findTSFiles(filePath, fileList);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function extractImports(content) {
  const imports = [];

  // Match import statements like: import { A, B, C } from 'module'
  const namedImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = namedImportRegex.exec(content)) !== null) {
    const importedNames = match[1].split(',').map(name => name.trim());
    const module = match[2];

    importedNames.forEach(name => {
      imports.push({ name, module, type: 'named' });
    });
  }

  // Match default imports like: import Something from 'module'
  const defaultImportRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = defaultImportRegex.exec(content)) !== null) {
    imports.push({ name: match[1], module: match[2], type: 'default' });
  }

  return imports;
}

function checkUsage(content, importName) {
  // Remove import statements to avoid false positives
  const contentWithoutImports = content.replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '');

  // Create regex to find usage of the import
  const usageRegex = new RegExp(`\\b${importName}\\b`, 'g');
  const matches = contentWithoutImports.match(usageRegex);

  return matches ? matches.length : 0;
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = extractImports(content);
    const unusedImports = [];

    imports.forEach(imp => {
      const usageCount = checkUsage(content, imp.name);
      if (usageCount === 0) {
        unusedImports.push(imp);
      }
    });

    return unusedImports;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return [];
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const tsFiles = findTSFiles(srcDir);

console.log('Analyzing TypeScript/JavaScript files for unused imports...\n');

let totalUnusedImports = 0;
const results = [];

tsFiles.forEach(filePath => {
  const unusedImports = analyzeFile(filePath);

  if (unusedImports.length > 0) {
    totalUnusedImports += unusedImports.length;
    results.push({
      file: filePath,
      unusedImports
    });
  }
});

// Output results
if (results.length === 0) {
  console.log('✅ No unused imports found!');
} else {
  console.log(`❌ Found ${totalUnusedImports} unused imports in ${results.length} files:\n`);

  results.forEach(result => {
    console.log(`📁 ${result.file.replace(__dirname + '\\', '')}`);
    result.unusedImports.forEach(imp => {
      console.log(`   └─ ${imp.name} from '${imp.module}'`);
    });
    console.log('');
  });
}