#!/usr/bin/env node

/**
 * Final TypeScript TS6133 Error Fixer
 * Aggressively fixes all remaining TS6133 errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FinalTSFixer {
  constructor(projectRoot = '.') {
    this.projectRoot = projectRoot;
  }

  async getTS6133Errors() {
    try {
      execSync('npx tsc --noEmit', {
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

  async fixAllErrors() {
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
      this.fixFileAggressive(filePath, errors);
    }
  }

  fixFileAggressive(filePath, errors) {
    const fullPath = path.resolve(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');
    let lines = content.split('\n');

    // Sort errors by line number in reverse order
    const sortedErrors = errors.sort((a, b) => b.line - a.line);

    let modified = false;
    for (const error of sortedErrors) {
      const lineIndex = error.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) continue;

      const line = lines[lineIndex];
      const identifier = error.identifier;

      // Strategy 1: If it's an import, remove it
      if (line.trim().startsWith('import') && line.includes(identifier)) {
        const newLine = this.removeFromImport(line, identifier);
        if (newLine !== line) {
          lines[lineIndex] = newLine;
          modified = true;
          continue;
        }
      }

      // Strategy 2: Add underscore prefix to mark as intentionally unused
      const newLine = line.replace(
        new RegExp(`\\b${identifier}\\b(?!\\w)`, 'g'),
        `_${identifier}`
      );

      if (newLine !== line) {
        lines[lineIndex] = newLine;
        modified = true;
      }
    }

    if (modified) {
      // Clean up empty import lines
      lines = lines.map(line => {
        if (line.match(/^import\s*{\s*}\s*from/)) {
          return '';
        }
        return line;
      });

      fs.writeFileSync(fullPath, lines.join('\n'));
      console.log(`Fixed ${errors.length} errors in ${filePath}`);
    }
  }

  removeFromImport(importLine, identifier) {
    // Handle named imports
    if (importLine.includes(`{ ${identifier}`) || importLine.includes(`${identifier},`) || importLine.includes(`, ${identifier}`)) {
      // Remove the specific import
      let newLine = importLine
        .replace(new RegExp(`\\s*,?\\s*${identifier}\\s*,?\\s*`, 'g'), ' ')
        .replace(/{\s*,/, '{ ')
        .replace(/,\s*}/, ' }')
        .replace(/{\s*}/, '{}');

      // If import becomes empty, remove the entire line
      if (newLine.includes('import {}')) {
        return '';
      }

      return newLine;
    }

    // Handle default import
    if (importLine.includes(`import ${identifier}`)) {
      return '';
    }

    return importLine;
  }

  async run() {
    console.log('Running final aggressive TS6133 fixes...');

    let previousCount = (await this.getTS6133Errors()).length;
    console.log(`Starting with ${previousCount} TS6133 errors`);

    // Run up to 3 iterations to catch cascade effects
    for (let i = 0; i < 3; i++) {
      await this.fixAllErrors();
      const currentCount = (await this.getTS6133Errors()).length;

      console.log(`After iteration ${i + 1}: ${currentCount} errors remaining`);

      if (currentCount === 0 || currentCount === previousCount) {
        break;
      }
      previousCount = currentCount;
    }

    const finalErrors = await this.getTS6133Errors();
    console.log(`Final TS6133 errors: ${finalErrors.length}`);

    if (finalErrors.length > 0 && finalErrors.length <= 10) {
      console.log('Remaining errors:');
      finalErrors.forEach(error => console.log(`  ${error}`));
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new FinalTSFixer(process.argv[2] || '.');
  fixer.run();
}

module.exports = FinalTSFixer;