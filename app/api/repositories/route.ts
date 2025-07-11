import { NextRequest, NextResponse } from 'next/server'
import { getRepositories } from '@/lib/github'
import { Diagnostics, Altitude, Module, Submodule, Action } from '@/lib/diagnostics'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: API route called - fetching repositories')
    console.log('🔍 DEBUG: Environment check - GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'Present' : 'Missing')
    console.log('🔍 DEBUG: Environment check - GITHUB_USERNAME:', process.env.GITHUB_USERNAME || 'Missing')
    
    // Log API call start
    Diagnostics.success(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.REPO_FETCH,
      Action.START,
      'Starting repository fetch',
      { endpoint: '/api/repositories' }
    )

    const repositories = await getRepositories()
    
    console.log(`🔍 DEBUG: API route returning ${repositories.length} repositories`)

    // Log successful API call
    Diagnostics.success(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.REPO_FETCH,
      Action.COMPLETE,
      `Successfully fetched ${repositories.length} repositories`,
      { count: repositories.length }
    )

    return NextResponse.json(repositories)
  } catch (error: any) {
    console.error('❌ DEBUG: API route error:', error.message)
    
    // Log API error
    Diagnostics.error(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.REPO_FETCH,
      Action.FAIL,
      'Failed to fetch repositories via API',
      error,
      { endpoint: '/api/repositories' }
    )

    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
} 