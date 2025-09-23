#!/usr/bin/env node

/**
 * Fix Invalid Property Names
 * Fixes properties with invalid names like ___name, ____name created by previous scripts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PropertyNameFixer {
  constructor(projectRoot = '.') {
    this.projectRoot = projectRoot;
  }

  async getTS2339Errors() {
    try {
      execSync('npx tsc --noEmit', {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const errorLines = error.stdout ? error.stdout.split('\n') : [];
      return errorLines.filter(line => line.includes('TS2339'));
    }
  }

  parseError(errorLine) {
    // Pattern for TS2339: Property 'propertyName' does not exist on type 'TypeName'
    const pattern = /^(.+?)\((\d+),(\d+)\):\s*error\s+TS2339:\s*Property\s+'([^']+)'\s*does not exist on type/;
    const match = errorLine.match(pattern);

    if (match) {
      return {
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        property: match[4]
      };
    }
    return null;
  }

  async fixInvalidPropertyNames() {
    const errorLines = await this.getTS2339Errors();
    const fixedFiles = new Set();

    for (const errorLine of errorLines) {
      const error = this.parseError(errorLine);
      if (error && error.property.match(/^_{3,}/)) { // Properties starting with 3+ underscores
        this.fixPropertyInFile(error);
        fixedFiles.add(error.file);
      }
    }

    return fixedFiles.size;
  }

  fixPropertyInFile(error) {
    const fullPath = path.resolve(this.projectRoot, error.file);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');
    const invalidProperty = error.property;

    // Try to determine the correct property name by removing extra underscores
    const correctedProperty = invalidProperty.replace(/^_{3,}/, '');

    if (correctedProperty) {
      // Replace all instances of the invalid property name
      const regex = new RegExp(`\\b${invalidProperty.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const newContent = content.replace(regex, correctedProperty);

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`Fixed property ${invalidProperty} -> ${correctedProperty} in ${error.file}`);
        return true;
      }
    }

    return false;
  }

  async run() {
    console.log('Fixing invalid property names created by previous scripts...');

    const fixedCount = await this.fixInvalidPropertyNames();
    console.log(`Fixed property names in ${fixedCount} files`);

    // Check remaining TS2339 errors
    const remainingErrors = await this.getTS2339Errors();
    console.log(`Remaining TS2339 errors: ${remainingErrors.length}`);

    if (remainingErrors.length > 0 && remainingErrors.length <= 10) {
      console.log('Remaining errors:');
      remainingErrors.slice(0, 5).forEach(error => console.log(`  ${error}`));
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new PropertyNameFixer(process.argv[2] || '.');
  fixer.run().catch(console.error);
}

module.exports = PropertyNameFixer;