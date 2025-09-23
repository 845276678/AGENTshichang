const fs = require('fs')

// 补充的图标映射
const additionalIconMappings = {
  '_Calendar': 'Calendar',
  '_Lightbulb': 'Lightbulb',
  '_Zap': 'Zap',
  '_Eye': 'Eye',
  '_Moon': 'Moon',
  '_Clock': 'Clock',
  '_Activity': 'Activity',
  '_FileText': 'FileText',
  '_AlertCircle': 'AlertCircle',
  '_Award': 'Award',
  '_Palette': 'Palette',
  '_MessageCircle': 'MessageCircle',
  '_BookOpen': 'BookOpen',
  '_Github': 'Github',
  '_Twitter': 'Twitter',
  '_Linkedin': 'Linkedin',
  '_Sparkles': 'Sparkles',
  '_Database': 'Database',
  '_Globe': 'Globe',
  '_Star': 'Star',
  '_Filter': 'Filter',
  '_SortAsc': 'SortAsc',
  '_Music': 'Music',
  '_Camera': 'Camera'
}

// 获取所有需要修复的文件
const { execSync } = require('child_process')
const filesToFix = execSync('grep -r "_Calendar\\|_Lightbulb\\|_Zap\\|_Eye\\|_Moon\\|_Clock\\|_Activity\\|_FileText\\|_AlertCircle\\|_Award\\|_Palette\\|_MessageCircle\\|_BookOpen\\|_Github\\|_Twitter\\|_Linkedin\\|_Sparkles\\|_Database\\|_Globe\\|_Star\\|_Filter\\|_SortAsc\\|_Music\\|_Camera" src/ --include="*.ts" --include="*.tsx" | grep -v "prisma"', { encoding: 'utf8' })
  .split('\n')
  .filter(line => line.trim())
  .map(line => line.split(':')[0])
  .filter((file, index, arr) => arr.indexOf(file) === index)

console.log('补充修复剩余图标错误...\n')

let totalFixed = 0
let filesModified = 0

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`检查文件: ${filePath}`)

    let content = fs.readFileSync(filePath, 'utf8')
    let originalContent = content
    let fileFixed = 0

    // 替换所有错误的图标名称
    Object.entries(additionalIconMappings).forEach(([wrongIcon, correctIcon]) => {
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
console.log(`补充修复完成！`)
console.log(`修复的文件数: ${filesModified}`)
console.log(`修复的图标数: ${totalFixed}`)
console.log('='.repeat(50))