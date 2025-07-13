import { NextRequest, NextResponse } from 'next/server'
import { contextPersistence } from '../../../lib/context-persistence'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (action) {
      case 'summary':
        if (!owner || !repo) {
          return NextResponse.json({ error: 'Owner and repo parameters required' }, { status: 400 })
        }
        const summary = contextPersistence.getContextSummary({ owner, repo })
        return NextResponse.json({ summary })

      case 'history':
        if (!owner || !repo) {
          return NextResponse.json({ error: 'Owner and repo parameters required' }, { status: 400 })
        }
        const history = contextPersistence.getRepositoryHistory(owner, repo, limit)
        return NextResponse.json({ history })

      case 'recent':
        const recent = contextPersistence.getRecentRepositories(limit)
        return NextResponse.json({ recent })

      case 'notes':
        if (!owner || !repo) {
          return NextResponse.json({ error: 'Owner and repo parameters required' }, { status: 400 })
        }
        const notes = contextPersistence.getCustomNotes(`${owner}/${repo}`)
        return NextResponse.json({ notes })

      case 'preferences':
        const preferences = contextPersistence.getUserPreferences()
        return NextResponse.json({ preferences })

      case 'export':
        const exportData = contextPersistence.exportContext()
        return NextResponse.json({ data: exportData })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Context persistence API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'add-conversation':
        const { sessionId, userQuery, assistantResponse, repoContext, userPreferences, metadata } = data
        contextPersistence.addConversationContext({
          sessionId,
          timestamp: new Date(),
          userQuery,
          assistantResponse,
          repoContext,
          userPreferences,
          metadata
        })
        return NextResponse.json({ success: true })

      case 'add-note':
        const { repoPath, content, tags } = data
        const noteId = contextPersistence.addCustomNote(repoPath, content, tags || [])
        return NextResponse.json({ success: true, noteId })

      case 'update-preferences':
        contextPersistence.updateUserPreferences(data.preferences)
        return NextResponse.json({ success: true })

      case 'import':
        const success = contextPersistence.importContext(data.contextJson)
        return NextResponse.json({ success })

      case 'clear':
        contextPersistence.clearContext()
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Context persistence API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 