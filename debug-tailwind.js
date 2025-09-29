#!/usr/bin/env node

// Check for any development scripts or CDN references
const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for Tailwind CDN references...\n');

function searchInFile(filePath, content) {
  const lines = content.split('\n');
  const matches = [];

  lines.forEach((line, index) => {
    if (line.includes('cdn.tailwindcss.com') ||
        line.includes('tailwindcss.com/docs') ||
        line.includes('tailwind') && line.includes('script')) {
      matches.push({
        line: index + 1,
        content: line.trim()
      });
    }
  });

  return matches;
}

function searchDirectory(dir, extensions = ['.js', '.ts', '.tsx', '.jsx', '.html', '.json']) {
  try {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        searchDirectory(fullPath, extensions);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const matches = searchInFile(fullPath, content);

            if (matches.length > 0) {
              console.log(`📄 ${path.relative(process.cwd(), fullPath)}:`);
              matches.forEach(match => {
                console.log(`  Line ${match.line}: ${match.content}`);
              });
              console.log('');
            }
          } catch (err) {
            // Skip files that can't be read
          }
        }
      }
    });
  } catch (err) {
    // Skip directories that can't be read
  }
}

console.log('Searching src/ directory...');
searchDirectory(path.join(process.cwd(), 'src'));

console.log('Searching public/ directory...');
searchDirectory(path.join(process.cwd(), 'public'));

console.log('Checking root configuration files...');
const rootFiles = ['next.config.js', 'tailwind.config.js', 'postcss.config.js'];
rootFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const matches = searchInFile(file, content);
    if (matches.length > 0) {
      console.log(`📄 ${file}:`);
      matches.forEach(match => {
        console.log(`  Line ${match.line}: ${match.content}`);
      });
      console.log('');
    }
  } catch (err) {
    // File doesn't exist
  }
});

console.log('✅ Search complete. If no results above, the CDN reference might be:');
console.log('   1. Added by a browser extension');
console.log('   2. Injected by development tools');
console.log('   3. Coming from a cached service worker');
console.log('   4. Added dynamically by client-side JavaScript');