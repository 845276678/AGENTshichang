import {
  AI_PERSONAS,
  generateBiddingRound,
  calculatePersonaScore,
  generatePersonaComment
} from './src/lib/ai-persona-enhanced'

const logRound = ({ label, idea, phase, theme }) => {
  console.log(`\n=== ${label} ===`)
  const results = generateBiddingRound({
    ideaContent: idea,
    round: 1,
    phase,
    theme,
    previousBids: {}
  })

  results.forEach(result => {
    console.log(
      `${result.persona.name} -> score ${result.score.toFixed(1)} / bid ¥${result.bidAmount}`
    )
    console.log(`  comment: ${result.comment}`)
  })
}

console.log('=== Enhanced AI Persona smoke test ===')

logRound({
  label: 'Tech idea (discussion)',
  idea: 'Build an AI-powered code review assistant that highlights risky changes before merge.',
  phase: 'discussion',
  theme: 'technology'
})

logRound({
  label: 'Product idea (discussion)',
  idea: 'A mood journaling app that lets users paint their feelings and receive daily reflections.',
  phase: 'discussion',
  theme: 'product'
})

logRound({
  label: 'Business idea (bidding)',
  idea: 'Launch a concierge-driven marketplace for verified second-hand luxury goods.',
  phase: 'bidding',
  theme: 'market'
})

console.log('\n=== Persona conflict sample ===')

const businessIdea = 'Launch a concierge-driven marketplace for verified second-hand luxury goods.'
const wang = AI_PERSONAS.find(p => p.id === 'business-guru-beta')
const lin = AI_PERSONAS.find(p => p.id === 'innovation-mentor-charlie')

if (wang && lin) {
  const wangScore = calculatePersonaScore(wang, businessIdea, 'market', new Map())
  const wangComment = generatePersonaComment(wang, wangScore, businessIdea)
  console.log(`Wang score: ${wangScore.toFixed(1)} -> ${wangComment}`)

  const linScore = calculatePersonaScore(
    lin,
    businessIdea,
    'product',
    new Map([[wang.id, wangScore]])
  )
  const linComment = generatePersonaComment(lin, linScore, businessIdea)
  console.log(`Lin score: ${linScore.toFixed(1)} -> ${linComment}`)
} else {
  console.warn('Personas not found in AI_PERSONAS list')
}

console.log('\nSmoke test finished.')