import { NextRequest, NextResponse } from 'next/server';
import { checkTroubleshootingCapabilities } from '@/lib/troubleshooting/self-diagnostics';

export async function GET(request: NextRequest) {
  try {
    const results = await checkTroubleshootingCapabilities();
    
    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      data: null,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 