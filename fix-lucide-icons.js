const fs = require('fs')
const path = require('path')

// 图标名称映射：错误的 -> 正确的
const iconMappings = {
  '_Shield': 'Shield',
  '_Code': 'Code',
  '_Rocket': 'Rocket',
  '_User': 'User',
  '_BarChart3': 'BarChart3',
  '_Users': 'Users',
  '_TrendingUp': 'TrendingUp',
  '_TestTube': 'TestTube',
  '_AlertTriangle': 'AlertTriangle',
  '_Target': 'Target',
  '_Heart': 'Heart',
  '_DollarSign': 'DollarSign'
}

// 需要修复的文件列表（从grep结果得出）
const filesToFix = [
  'src/app/business-plan/page.tsx',
  'src/app/business-plan/[id]/page.tsx',
  'src/app/categories/[id]/page.tsx',
  'src/app/ideas/submit/page.tsx',
  'src/app/ideas/[id]/page.tsx',
  'src/app/ideas/[id]/workbench/page.tsx',
  'src/app/marketplace/page.tsx',
  'src/app/page.tsx',
  'src/app/purchase/[id]/page.tsx',
  'src/components/admin/AdminLayout.tsx',
  'src/components/collaboration/DocumentGeneration.tsx',
  'src/components/creative/AgentPersonalityCard.tsx',
  'src/components/creative/CreativeChallengeCard.tsx',
  'src/components/dashboard/DashboardOverview.tsx',
  'src/components/dashboard/QuickStatsInsights.tsx'
]

console.log('开始修复图标导入错误...\n')

let totalFixed = 0
let filesModified = 0

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`检查文件: ${filePath}`)

    let content = fs.readFileSync(filePath, 'utf8')
    let originalContent = content
    let fileFixed = 0

    // 替换所有错误的图标名称
    Object.entries(iconMappings).forEach(([wrongIcon, correctIcon]) => {
      const regex = new RegExp(`\\b${wrongIcon.replace('_', '_')}\\b`, 'g')
      const matches = content.match(regex)
      if (matches) {
        content = content.replace(regex, correctIcon)
        fileFixed += matches.length
        console.log(`  ✅ ${wrongIcon} -> ${correctIcon} (${matches.length}次)`)
      }
    })

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content)
      totalFixed += fileFixed
      filesModified++
      console.log(`  📁 已修复 ${fileFixed} 个图标\n`)
    } else {
      console.log(`  ⚪ 无需修复\n`)
    }
  } else {
    console.log(`  ❌ 文件不存在: ${filePath}\n`)
  }
})

console.log('='.repeat(50))
console.log(`修复完成！`)
console.log(`修复的文件数: ${filesModified}`)
console.log(`修复的图标数: ${totalFixed}`)
console.log('='.repeat(50))