#!/usr/bin/env node

/**
 * Batch TypeScript Error Fixer
 * Fixes common TypeScript strict mode errors using regex patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BatchTSFixer {
  constructor(projectRoot = '.') {
    this.projectRoot = projectRoot;
    this.fixPatterns = [
      // Remove unused imports from import statements
      {
        name: 'unused-imports',
        pattern: /^(\s*)(.*?)(?:,\s*)?([\w]+)(?:,\s*)?(.*)from\s+/gm,
        replacement: (match, indent, before, unused, after, importPath) => {
          // This needs more sophisticated logic
          return match;
        }
      },

      // Fix unused useState setters
      {
        name: 'unused-setters',
        pattern: /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\(/g,
        replacement: 'const [$1] = useState('
      },

      // Comment out unused parameters in function definitions
      {
        name: 'unused-params',
        pattern: /(\w+:\s*\w+)\s*{\s*\/\/ TS6133/g,
        replacement: '/* $1 */'
      },

      // Add underscore prefix to mark unused variables as intentionally unused
      {
        name: 'prefix-unused',
        pattern: /const\s+(\w+)\s*=/g,
        replacement: (match, varName) => {
          // Only apply if this variable is reported as unused
          return match; // For now, return unchanged
        }
      }
    ];
  }

  async getErrorList() {
    try {
      const result = execSync('npx tsc --noEmit', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      return error.stdout ? error.stdout.split('\n') : [];
    }
  }

  parseErrors(errorLines) {
    const errors = [];
    const errorPattern = /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*'([^']+)'\s*is declared but its value is never read/;

    for (const line of errorLines) {
      const match = line.match(errorPattern);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[4],
          unusedIdentifier: match[5],
          fullLine: line
        });
      }
    }

    return errors;
  }

  async fixUnusedImports() {
    const errorLines = await this.getErrorList();
    const errors = this.parseErrors(errorLines);
    const fileGroups = {};

    // Group errors by file
    errors.forEach(error => {
      if (!fileGroups[error.file]) {
        fileGroups[error.file] = [];
      }
      fileGroups[error.file].push(error);
    });

    // Process each file
    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
      const fullPath = path.resolve(this.projectRoot, filePath);
      if (!fs.existsSync(fullPath)) continue;

      let content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      // Process errors in reverse line order to avoid line number shifts
      const sortedErrors = fileErrors.sort((a, b) => b.line - a.line);

      for (const error of sortedErrors) {
        if (error.code === 'TS6133') {
          content = this.fixUnusedIdentifier(content, error);
        }
      }

      if (content !== fs.readFileSync(fullPath, 'utf8')) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed unused identifiers in ${filePath}`);
      }
    }
  }

  fixUnusedIdentifier(content, error) {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;
    const line = lines[lineIndex];
    const identifier = error.unusedIdentifier;

    // Fix import statements
    if (line.includes('import') && line.includes(identifier)) {
      // Remove from named imports
      let newLine = line.replace(new RegExp(`\\b${identifier}\\b,?\\s*`, 'g'), '');
      newLine = newLine.replace(/,\s*}/, ' }'); // Clean up trailing commas
      newLine = newLine.replace(/{\s*,/, '{ '); // Clean up leading commas
      newLine = newLine.replace(/{\s*}/, '{}'); // Clean up empty imports

      // Remove entire import if empty
      if (newLine.match(/import\s*{\s*}\s*from/)) {
        newLine = '';
      }

      lines[lineIndex] = newLine;
    }

    // Fix useState destructuring
    else if (line.includes('useState') && identifier.startsWith('set')) {
      lines[lineIndex] = line.replace(
        new RegExp(`\\[([^,]+),\\s*${identifier}\\]`),
        '[$1]'
      );
    }

    // Comment out unused variables
    else if (line.includes('const') || line.includes('let') || line.includes('var')) {
      if (identifier === 'request' || identifier === 'previousValue' || identifier === 'body') {
        lines[lineIndex] = line.replace(/^(\s*)/, '$1// ');
      } else {
        // For parameters, prefix with underscore
        lines[lineIndex] = line.replace(
          new RegExp(`\\b${identifier}\\b`),
          `_${identifier}`
        );
      }
    }

    return lines.join('\n');
  }

  async run() {
    console.log('Starting batch TypeScript error fixes...');
    await this.fixUnusedImports();

    // Get final error count
    const finalErrors = await this.getErrorList();
    const ts6133Count = finalErrors.filter(line => line.includes('TS6133')).length;
    console.log(`Remaining TS6133 errors: ${ts6133Count}`);
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new BatchTSFixer(process.argv[2] || '.');
  fixer.run().catch(console.error);
}

module.exports = BatchTSFixer;