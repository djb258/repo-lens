import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    
    // Verify webhook signature
    if (process.env.GITHUB_WEBHOOK_SECRET) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')}`
      
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    const payload = JSON.parse(body)
    
    // Handle push events
    if (payload.ref === 'refs/heads/main' || payload.ref === 'refs/heads/master') {
      const { repository, commits } = payload
      
      // Check if any wiki or diagram files were modified
      const wikiFiles = commits.flatMap((commit: any) => 
        commit.modified?.filter((file: string) => 
          file === 'REPO_WIKI.md' || file === 'WIKI_MAP.mmd'
        ) || []
      )
      
      if (wikiFiles.length > 0) {
        console.log(`Wiki files updated in ${repository.full_name}:`, wikiFiles)
        // Here you could trigger additional processing, caching, or notifications
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'GitHub webhook endpoint' })
} 