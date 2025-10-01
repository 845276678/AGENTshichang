// 测试增强版人设系统
import {
  AI_PERSONAS,
  generateBiddingRound,
  calculatePersonaScore,
  generatePersonaComment
} from './src/lib/ai-persona-enhanced.js'

console.log('=== 测试增强版AI人设系统 ===\n')

// 测试创意1: 技术型项目
const techIdea = '开发一个基于AI的代码自动审查工具，帮助团队提升代码质量'
console.log('测试创意1 (技术型):', techIdea)
console.log('---')

// 第一轮评估
console.log('\n第一轮评估:')
const round1Tech = generateBiddingRound(AI_PERSONAS, techIdea, 'technology', 1)
round1Tech.forEach(result => {
  const persona = AI_PERSONAS.find(p => p.id === result.personaId)
  console.log(`${persona.name} (${persona.age}岁): 评分 ${result.score}/10`)
  console.log(`  评论: ${result.comment}`)
  console.log(`  背景: ${persona.background}`)
  console.log(`  冲突对象: ${persona.conflicts.join(', ')}`)
  console.log('')
})

// 测试创意2: 艺术型项目
const artIdea = '创建一个让用户通过画画来记录心情的治愈系APP，注重美感和用户体验'
console.log('\n测试创意2 (艺术型):', artIdea)
console.log('---')

// 第一轮评估
console.log('\n第一轮评估:')
const round1Art = generateBiddingRound(AI_PERSONAS, artIdea, 'art', 1)
round1Art.forEach(result => {
  const persona = AI_PERSONAS.find(p => p.id === result.personaId)
  console.log(`${persona.name}: 评分 ${result.score}/10`)
  console.log(`  评论: ${result.comment}`)
  console.log('')
})

// 测试创意3: 商业型项目
const businessIdea = '建立一个二手奢侈品交易平台，快速变现，低成本高回报'
console.log('\n测试创意3 (商业型):', businessIdea)
console.log('---')

// 第一轮评估
console.log('\n第一轮评估:')
const round1Business = generateBiddingRound(AI_PERSONAS, businessIdea, 'business', 1)
round1Business.forEach(result => {
  const persona = AI_PERSONAS.find(p => p.id === result.personaId)
  console.log(`${persona.name}: 评分 ${result.score}/10`)
  console.log(`  评论: ${result.comment}`)

  // 显示评估标准
  console.log(`  主要评估维度: ${persona.evaluationCriteria.primary}`)
  console.log('')
})

// 测试冲突对话
console.log('\n=== 测试角色冲突 ===')
console.log('老王 vs 小琳 关于商业项目的争论:')

// 老王的观点
const wangScore = calculatePersonaScore(
  AI_PERSONAS.find(p => p.id === 'business-tycoon-wang'),
  businessIdea,
  'business',
  new Map()
)
console.log(`老王: "这个项目能赚钱，我给${wangScore}分！现金流快速回正才是关键！"`)

// 小琳的观点（受老王高分影响）
const linScore = calculatePersonaScore(
  AI_PERSONAS.find(p => p.id === 'artistic-lin'),
  businessIdea,
  'business',
  new Map([['business-tycoon-wang', wangScore]])
)
console.log(`小琳: "老王你太功利了！产品要有温度，我只给${linScore}分。"`)

console.log('\n测试完成！')