import { NextRequest, NextResponse } from 'next/server'
import { mockAgents, priceRanges } from '@/lib/agents-mock-data'

export const dynamic = 'force-dynamic'


// GET /api/agents - Get all agents with optional filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const priceRange = searchParams.get('priceRange') || ''
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const sortBy = searchParams.get('sortBy') || 'popular'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const featured = searchParams.get('featured') === 'true'
    const trending = searchParams.get('trending') === 'true'

    let filtered = [...mockAgents]

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchLower) ||
        agent.description.toLowerCase().includes(searchLower) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        agent.category.toLowerCase().includes(searchLower) ||
        agent.author.name.toLowerCase().includes(searchLower)
      )
    }

    if (category) {
      filtered = filtered.filter(agent => 
        agent.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (priceRange) {
      const range = priceRanges.find(r => r.id === priceRange)
      if (range) {
        filtered = filtered.filter(agent => 
          agent.price >= range.min && agent.price <= range.max
        )
      }
    }

    if (minRating > 0) {
      filtered = filtered.filter(agent => agent.rating >= minRating)
    }

    if (featured) {
      filtered = filtered.filter(agent => agent.featured === true)
    }

    if (trending) {
      filtered = filtered.filter(agent => agent.trending === true)
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'downloads':
        filtered.sort((a, b) => b.downloads - a.downloads)
        break
      default:
        break
    }

    // Apply pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAgents = filtered.slice(startIndex, endIndex)

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        agents: paginatedAgents,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          search,
          category,
          priceRange,
          minRating,
          sortBy,
          featured,
          trending
        }
      }
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// POST /api/agents - Create a new agent (for future use)
export async function POST(_request: NextRequest) {
  try {
    // const body = await request.json()
    
    // TODO: Validate request body
    // TODO: Check authentication and permissions
    // TODO: Create agent in database
    
    return NextResponse.json(
      {
        success: false,
        error: 'Agent creation not implemented yet'
      },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}