import { NextRequest, NextResponse } from 'next/server'
import { categories, mockAgents } from '@/lib/agents-mock-data'

// GET /api/categories - Get all categories with agent counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    if (includeStats) {
      // Calculate real agent counts for each category
      const categoriesWithCounts = categories.map(category => {
        const agentCount = mockAgents.filter(agent => 
          agent.category.toLowerCase() === category.name.toLowerCase()
        ).length
        
        return {
          ...category,
          count: agentCount
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          categories: categoriesWithCounts,
          totalAgents: mockAgents.length,
          totalCategories: categories.length
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        categories
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}