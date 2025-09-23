const fs = require('fs')
const path = require('path')

// 修复未使用变量的脚本
function fixUnusedVars() {
  const filesToFix = [
    'src/app/cart/page.tsx',
    'src/app/dashboard/activity/page.tsx',
    'src/app/ideas/[id]/discussion/page.tsx',
    'src/app/ideas/[id]/workbench/page.tsx',
    'src/app/purchase/[id]/page.tsx',
    'src/components/auth/AuthProvider.tsx',
    'src/components/creative/CreativeChallengeCard.tsx',
    'src/components/dashboard/RecentActivityFeed.tsx',
    'src/components/submission/SubmissionStatus.tsx',
    'src/lib/auth.ts'
  ]

  filesToFix.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8')

        // 将未使用的变量注释掉或删除
        content = content.replace(/const ___(\w+) = ([^;]+);?/g, (match, varName, value) => {
          return `// const ${varName} = ${value} // Unused variable`
        })

        fs.writeFileSync(filePath, content)
        console.log(`Fixed: ${filePath}`)
      }
    } catch (error) {
      console.error(`Error fixing ${filePath}:`, error.message)
    }
  })
}

fixUnusedVars()
console.log('Unused variable fixing completed!')