import { NextRequest, NextResponse } from 'next/server'
import { getRepositories } from '@/lib/github'
import { Diagnostics, Altitude, Module, Submodule, Action } from '@/lib/diagnostics'
import dotenv from 'dotenv'

// Ensure environment variables are loaded
dotenv.config()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: API route called - fetching repositories')
    console.log('🔍 DEBUG: Starting getRepositories() function')
    console.log('🔍 DEBUG: GitHub token available:', !!process.env.GITHUB_TOKEN)
    console.log('🔍 DEBUG: Making GitHub API call...')
    
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
    
    console.log(`🔍 DEBUG: GitHub API response received: ${repositories.length} repos`)
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