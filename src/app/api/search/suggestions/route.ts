import { NextRequest, NextResponse } from 'next/server'
import { mockAgents, categories } from '@/lib/agents-mock-data'

// GET /api/search/suggestions - Get search suggestions based on query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: []
        }
      })
    }

    const queryLower = query.toLowerCase()
    const suggestions = new Set<string>()

    // Add matching agent names
    mockAgents.forEach(agent => {
      if (agent.name.toLowerCase().includes(queryLower) && suggestions.size < limit) {
        suggestions.add(agent.name)
      }
    })

    // Add matching categories
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(queryLower) && suggestions.size < limit) {
        suggestions.add(category.name)
      }
    })

    // Add matching tags
    const tagCounts = new Map<string, number>()
    mockAgents.forEach(agent => {
      agent.tags.forEach(tag => {
        const tagLower = tag.toLowerCase()
        if (tagLower.includes(queryLower)) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        }
      })
    })

    // Sort tags by frequency and add to suggestions
    Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([tag, count]) => {
        if (suggestions.size < limit) {
          suggestions.add(tag)
        }
      })

    // Add partial matches for agent descriptions
    if (suggestions.size < limit) {
      mockAgents.forEach(agent => {
        if (agent.description.toLowerCase().includes(queryLower) && suggestions.size < limit) {
          // Extract relevant phrase from description
          const words = agent.description.split(' ')
          const queryWords = query.split(' ')
          const relevantPhrase = queryWords[0] // Simplified for now
          if (relevantPhrase && !suggestions.has(relevantPhrase)) {
            suggestions.add(relevantPhrase)
          }
        }
      })
    }

    const suggestionArray = Array.from(suggestions).slice(0, limit)

    return NextResponse.json({
      success: true,
      data: {
        suggestions: suggestionArray,
        query,
        total: suggestionArray.length
      }
    })
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}