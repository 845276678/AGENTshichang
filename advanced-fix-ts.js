#!/usr/bin/env node

/**
 * Advanced TypeScript Error Fixer
 * Fixes remaining TS6133 errors with better pattern matching
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AdvancedTSFixer {
  constructor(projectRoot = '.') {
    this.projectRoot = projectRoot;
  }

  async getTS6133Errors() {
    try {
      const result = execSync('npx tsc --noEmit', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const errorLines = error.stdout ? error.stdout.split('\n') : [];
      return errorLines.filter(line => line.includes('TS6133'));
    }
  }

  parseError(errorLine) {
    const pattern = /^(.+?)\((\d+),(\d+)\):\s*error\s+TS6133:\s*'([^']+)'\s*is declared but its value is never read/;
    const match = errorLine.match(pattern);

    if (match) {
      return {
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        identifier: match[4]
      };
    }
    return null;
  }

  fixFile(filePath, errors) {
    const fullPath = path.resolve(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) return false;

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Sort errors by line number in reverse order
    const sortedErrors = errors.sort((a, b) => b.line - a.line);

    for (const error of sortedErrors) {
      const oldContent = content;
      content = this.fixIdentifier(content, error);
      if (content !== oldContent) {
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content);
      return true;
    }
    return false;
  }

  fixIdentifier(content, error) {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;
    const line = lines[lineIndex];
    const identifier = error.identifier;

    // Fix function parameters - replace with underscore prefix
    if (line.includes('export async function') || line.includes('function')) {
      if (identifier === 'request' || identifier === '_request') {
        lines[lineIndex] = line.replace(/\brequest\b/, '_request');
      } else if (identifier === 'id' || identifier === '_id') {
        lines[lineIndex] = line.replace(/\bid\b/, '_id');
      } else {
        lines[lineIndex] = line.replace(new RegExp(`\\b${identifier}\\b`), `_${identifier}`);
      }
    }

    // Fix destructuring parameters
    else if (line.includes('const {') && line.includes('} = ')) {
      lines[lineIndex] = line.replace(new RegExp(`\\b${identifier}\\b`), `_${identifier}`);
    }

    // Fix variable declarations
    else if (line.includes('const ') || line.includes('let ') || line.includes('var ')) {
      if (identifier === 'body' || identifier === 'id' || identifier === 'request') {
        lines[lineIndex] = line.replace(new RegExp(`\\b${identifier}\\b`), `_${identifier}`);
      }
    }

    return lines.join('\n');
  }

  async run() {
    console.log('Running advanced TypeScript error fixes...');

    const errorLines = await this.getTS6133Errors();
    const errorsByFile = {};

    // Parse and group errors by file
    for (const errorLine of errorLines) {
      const error = this.parseError(errorLine);
      if (error) {
        if (!errorsByFile[error.file]) {
          errorsByFile[error.file] = [];
        }
        errorsByFile[error.file].push(error);
      }
    }

    // Fix each file
    for (const [filePath, errors] of Object.entries(errorsByFile)) {
      if (this.fixFile(filePath, errors)) {
        console.log(`Fixed ${errors.length} errors in ${filePath}`);
      }
    }

    // Check final count
    const finalErrors = await this.getTS6133Errors();
    console.log(`Remaining TS6133 errors: ${finalErrors.length}`);

    if (finalErrors.length > 0) {
      console.log('Remaining errors:');
      finalErrors.slice(0, 5).forEach(line => console.log(`  ${line}`));
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new AdvancedTSFixer(process.argv[2] || '.');
  fixer.run().catch(console.error);
}

module.exports = AdvancedTSFixer;