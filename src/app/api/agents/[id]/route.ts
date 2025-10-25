import { NextRequest, NextResponse } from 'next/server'
import { mockAgents } from '@/lib/agents-mock-data'

export const dynamic = 'force-dynamic'


// GET /api/agents/[id] - Get a specific agent by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent ID is required'
        },
        { status: 400 }
      )
    }

    // Find the agent
    const agent = mockAgents.find(a => a.id === id)

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent not found'
        },
        { status: 404 }
      )
    }

    // Get related agents (same category, excluding current agent)
    const relatedAgents = mockAgents
      .filter(a => a.id !== id && a.category === agent.category)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)

    // Get similar agents by tags
    const agentTags = agent.tags.map(tag => tag.toLowerCase())
    const similarAgents = mockAgents
      .filter(a => 
        a.id !== id && 
        a.category !== agent.category &&
        a.tags.some(tag => agentTags.includes(tag.toLowerCase()))
      )
      .sort((a, b) => {
        // Sort by number of matching tags
        const aMatches = a.tags.filter(tag => agentTags.includes(tag.toLowerCase())).length
        const bMatches = b.tags.filter(tag => agentTags.includes(tag.toLowerCase())).length
        return bMatches - aMatches
      })
      .slice(0, 4)

    return NextResponse.json({
      success: true,
      data: {
        agent,
        relatedAgents,
        similarAgents
      }
    })
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// PUT /api/agents/[id] - Update an agent (for future use)
export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: _id } = params
    // const body = await request.json()
    
    // TODO: Validate request body
    // TODO: Check authentication and permissions
    // TODO: Update agent in database
    
    return NextResponse.json(
      {
        success: false,
        error: 'Agent update not implemented yet'
      },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id] - Delete an agent (for future use)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: _id } = params
    
    // TODO: Check authentication and permissions
    // TODO: Delete agent from database
    
    return NextResponse.json(
      {
        success: false,
        error: 'Agent deletion not implemented yet'
      },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}