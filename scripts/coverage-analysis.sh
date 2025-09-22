#!/bin/bash

# Test Coverage Analysis Script
# This script runs tests with coverage and provides detailed analysis

set -e

echo "🧪 Running Test Coverage Analysis"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create coverage directory if it doesn't exist
mkdir -p coverage

echo -e "${BLUE}📊 Running unit and integration tests with coverage...${NC}"
npm run test:coverage

echo -e "${BLUE}📈 Generating coverage reports...${NC}"

# Check if coverage directory exists and has reports
if [ ! -d "coverage" ]; then
    echo -e "${RED}❌ Coverage directory not found!${NC}"
    exit 1
fi

# Display coverage summary
echo -e "${GREEN}📋 Coverage Summary:${NC}"
if [ -f "coverage/coverage-summary.json" ]; then
    node -e "
        const fs = require('fs');
        const summary = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
        const total = summary.total;

        console.log('');
        console.log('Overall Coverage:');
        console.log('================');
        console.log('Lines:     ', total.lines.pct + '%');
        console.log('Functions: ', total.functions.pct + '%');
        console.log('Branches:  ', total.branches.pct + '%');
        console.log('Statements:', total.statements.pct + '%');
        console.log('');

        // Check thresholds
        const thresholds = {
            lines: 75,
            functions: 75,
            branches: 70,
            statements: 75
        };

        let allPassed = true;
        Object.keys(thresholds).forEach(key => {
            const current = total[key].pct;
            const threshold = thresholds[key];
            const status = current >= threshold ? '✅' : '❌';
            const color = current >= threshold ? '' : '';

            console.log(\`\${status} \${key.padEnd(12)}: \${current}% (threshold: \${threshold}%)\`);

            if (current < threshold) {
                allPassed = false;
            }
        });

        console.log('');
        if (allPassed) {
            console.log('🎉 All coverage thresholds met!');
        } else {
            console.log('⚠️  Some coverage thresholds not met.');
            process.exit(1);
        }
    "
else
    echo -e "${YELLOW}⚠️  Coverage summary not found. Check test execution.${NC}"
fi

# Find files with low coverage
echo -e "${BLUE}🔍 Analyzing file-level coverage...${NC}"
if [ -f "coverage/lcov.info" ]; then
    echo -e "${YELLOW}Files with less than 70% line coverage:${NC}"

    # Parse lcov.info to find low coverage files
    node -e "
        const fs = require('fs');
        const lcov = fs.readFileSync('coverage/lcov.info', 'utf8');

        const files = lcov.split('end_of_record').slice(0, -1);
        const lowCoverageFiles = [];

        files.forEach(fileData => {
            const lines = fileData.split('\n');
            let fileName = '';
            let linesFound = 0;
            let linesHit = 0;

            lines.forEach(line => {
                if (line.startsWith('SF:')) {
                    fileName = line.substring(3).replace(process.cwd(), '.');
                }
                if (line.startsWith('LF:')) {
                    linesFound = parseInt(line.substring(3));
                }
                if (line.startsWith('LH:')) {
                    linesHit = parseInt(line.substring(3));
                }
            });

            if (linesFound > 0) {
                const coverage = (linesHit / linesFound) * 100;
                if (coverage < 70 && fileName.includes('src/')) {
                    lowCoverageFiles.push({
                        file: fileName,
                        coverage: coverage.toFixed(1)
                    });
                }
            }
        });

        if (lowCoverageFiles.length === 0) {
            console.log('✅ All files meet the 70% coverage threshold!');
        } else {
            lowCoverageFiles
                .sort((a, b) => parseFloat(a.coverage) - parseFloat(b.coverage))
                .forEach(item => {
                    console.log(\`❌ \${item.file}: \${item.coverage}%\`);
                });

            console.log(\`\nFound \${lowCoverageFiles.length} files with low coverage.\`);
        }
    "
fi

# Check for untested files
echo -e "${BLUE}🔍 Looking for untested files...${NC}"
find src -name "*.ts" -o -name "*.tsx" | grep -v ".d.ts" | grep -v "__tests__" | grep -v ".test." | grep -v ".spec." | while read file; do
    if ! grep -q "$file" coverage/lcov.info 2>/dev/null; then
        echo -e "${RED}📄 Untested file: $file${NC}"
    fi
done

# Generate badge (if badge generator is available)
if command -v coverage-badges &> /dev/null; then
    echo -e "${BLUE}🏅 Generating coverage badges...${NC}"
    coverage-badges -o coverage/badges
fi

# HTML Report Information
echo -e "${GREEN}📊 Coverage Reports Generated:${NC}"
echo "📁 HTML Report: coverage/lcov-report/index.html"
echo "📁 LCOV Report: coverage/lcov.info"
echo "📁 JSON Summary: coverage/coverage-summary.json"
echo ""
echo "To view the HTML report:"
echo "  npm run coverage:serve"
echo "  # or open coverage/lcov-report/index.html in your browser"

echo ""
echo -e "${GREEN}✅ Coverage analysis complete!${NC}"