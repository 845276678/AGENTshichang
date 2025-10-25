import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getUserFromToken } from '@/lib/auth-helper'

export const dynamic = 'force-dynamic'


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await getUserFromToken(req)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const ideaId = params?.id
    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        userId: authResult.user.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true
      }
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea does not exist or access is denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true, idea })
  } catch (error) {
    console.error('Failed to load idea detail:', error)
    return NextResponse.json({ error: 'Failed to load idea details' }, { status: 500 })
  }
}
