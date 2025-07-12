import { NextRequest, NextResponse } from 'next/server'
import { logEnhancedORBTEvent } from '@/lib/enhanced-orbt'
import { logBartonEvent, BartonPrinciple } from '@/lib/barton'
import { Severity, Status } from '@/lib/diagnostics'

interface ErrorEntry {
  id: string
  timestamp: Date
  severity: 'critical' | 'error' | 'warning' | 'info'
  orbtCode?: string
  message: string
  repoId?: string
  moduleId?: string
  fileId?: string
  doctrineNumber?: string
  stackTrace?: string
  suggestedResolution?: string
  occurrenceCount: number
  escalationLevel: 'none' | 'auto' | 'mantis' | 'human'
  resolutionStatus: 'open' | 'in-progress' | 'resolved' | 'stale'
  lastOccurrence: Date
  category: 'orbt' | 'barton' | 'github' | 'module' | 'system' | 'file'
}

interface DiagnosticSummary {
  totalErrors: number
  criticalErrors: number
  warningErrors: number
  resolvedErrors: number
  meanTimeToResolve: number
  errorTrend: 'increasing' | 'decreasing' | 'stable'
  topRepos: Array<{ repoId: string; errorCount: number }>
  topModules: Array<{ moduleId: string; errorCount: number }>
  orbtViolations: number
  escalationCount: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  try {
    // Log API access
    logEnhancedORBTEvent(
      '10.API.error-log.request',
      Severity.GREEN,
      Status.SUCCESS,
      'Error log API request',
      { params: Object.fromEntries(searchParams.entries()) },
      BartonPrinciple.UNIVERSAL_MONITORING
    )

    // Generate sample error data
    const errors: ErrorEntry[] = generateSampleErrors()
    
    // Apply filters
    const filteredErrors = applyFilters(errors, searchParams)
    
    // Generate summary
    const summary = generateDiagnosticSummary(filteredErrors)
    
    // Create diagnostics
    const diagnostics = [
      {
        bartonId: `error-log-${Date.now()}`,
        sessionId: 'api-session',
        timestamp: new Date(),
        severity: summary.criticalErrors > 0 ? 'error' : summary.warningErrors > 0 ? 'warning' : 'info',
        category: 'system',
        message: `Error log summary generated: ${summary.totalErrors} total errors`,
        context: {
          totalErrors: summary.totalErrors,
          criticalErrors: summary.criticalErrors,
          resolvedErrors: summary.resolvedErrors,
          escalationCount: summary.escalationCount
        }
      }
    ]

    // Log successful response
    logBartonEvent(
      BartonPrinciple.UNIVERSAL_MONITORING,
      '10.API.error-log.success',
      Severity.GREEN,
      Status.SUCCESS,
      'Error log API response generated successfully',
      { 
        totalErrors: summary.totalErrors,
        criticalErrors: summary.criticalErrors,
        filteredCount: filteredErrors.length
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        errors: filteredErrors,
        summary,
        diagnostics
      },
      error: null,
      diagnostics,
      timestamp: new Date()
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    logEnhancedORBTEvent(
      '10.API.error-log.error',
      Severity.RED,
      Status.FAILED_FETCH,
      `Error log API error: ${errorMessage}`,
      { error: errorMessage },
      BartonPrinciple.UNIVERSAL_MONITORING
    )

    return NextResponse.json({
      success: false,
      error: errorMessage,
      data: null,
      diagnostics: [{
        bartonId: `error-log-error-${Date.now()}`,
        sessionId: 'api-session',
        timestamp: new Date(),
        severity: 'error',
        category: 'api',
        message: `Error log API failed: ${errorMessage}`,
        context: { error: errorMessage }
      }],
      timestamp: new Date()
    }, { status: 500 })
  }
}

function generateSampleErrors(): ErrorEntry[] {
  const baseErrors: ErrorEntry[] = [
    {
      id: 'error-1',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      severity: 'critical',
      orbtCode: '10.ORBT.operating.missing',
      message: 'Missing operating logic in component file',
      repoId: 'repo-lens',
      moduleId: '05-file-detail',
      fileId: 'page.tsx',
      doctrineNumber: '39.5.1',
      occurrenceCount: 3,
      escalationLevel: 'human',
      resolutionStatus: 'open',
      lastOccurrence: new Date(Date.now() - 1800000), // 30 minutes ago
      category: 'orbt',
      suggestedResolution: 'Add function definitions or class declarations to provide operating logic'
    },
    {
      id: 'error-2',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      severity: 'warning',
      orbtCode: '10.ORBT.repair.vague',
      message: 'Vague TODO comment detected',
      repoId: 'repo-lens',
      moduleId: '01-github-index',
      fileId: 'page.tsx',
      doctrineNumber: '39.1.1',
      occurrenceCount: 2,
      escalationLevel: 'auto',
      resolutionStatus: 'in-progress',
      lastOccurrence: new Date(Date.now() - 3600000), // 1 hour ago
      category: 'orbt',
      suggestedResolution: 'Make TODO comment more specific with actionable details'
    },
    {
      id: 'error-3',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      severity: 'error',
      message: 'GitHub API rate limit exceeded',
      repoId: 'repo-lens',
      moduleId: '01-github-index',
      fileId: 'api/route.ts',
      doctrineNumber: '39.1.2',
      occurrenceCount: 1,
      escalationLevel: 'mantis',
      resolutionStatus: 'resolved',
      lastOccurrence: new Date(Date.now() - 10800000),
      category: 'github',
      suggestedResolution: 'Implement exponential backoff and caching for API requests'
    },
    {
      id: 'error-4',
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      severity: 'info',
      message: 'Module diagnostic tracking initialized',
      repoId: 'repo-lens',
      moduleId: '02-repo-overview',
      fileId: 'page.tsx',
      doctrineNumber: '39.2.1',
      occurrenceCount: 1,
      escalationLevel: 'none',
      resolutionStatus: 'resolved',
      lastOccurrence: new Date(Date.now() - 14400000),
      category: 'barton'
    },
    {
      id: 'error-5',
      timestamp: new Date(Date.now() - 18000000), // 5 hours ago
      severity: 'critical',
      orbtCode: '10.ORBT.training.missing',
      message: 'No training stubs found in utility file',
      repoId: 'repo-lens',
      moduleId: 'shared',
      fileId: 'utils.ts',
      doctrineNumber: '39.0.1',
      occurrenceCount: 4,
      escalationLevel: 'human',
      resolutionStatus: 'open',
      lastOccurrence: new Date(Date.now() - 900000), // 15 minutes ago
      category: 'orbt',
      suggestedResolution: 'Add inline comments or documentation blocks to explain functionality'
    },
    {
      id: 'error-6',
      timestamp: new Date(Date.now() - 21600000), // 6 hours ago
      severity: 'warning',
      message: 'TypeScript compilation warning',
      repoId: 'repo-lens',
      moduleId: '05-file-detail',
      fileId: 'page.tsx',
      doctrineNumber: '39.5.1',
      occurrenceCount: 2,
      escalationLevel: 'auto',
      resolutionStatus: 'stale',
      lastOccurrence: new Date(Date.now() - 7200000), // 2 hours ago
      category: 'file',
      suggestedResolution: 'Fix TypeScript type annotations and remove unused imports'
    },
    {
      id: 'error-7',
      timestamp: new Date(Date.now() - 25200000), // 7 hours ago
      severity: 'error',
      message: 'Database connection timeout',
      repoId: 'repo-lens',
      moduleId: 'system',
      fileId: 'database.ts',
      doctrineNumber: '39.0.2',
      occurrenceCount: 1,
      escalationLevel: 'mantis',
      resolutionStatus: 'resolved',
      lastOccurrence: new Date(Date.now() - 25200000),
      category: 'system',
      suggestedResolution: 'Implement connection pooling and retry logic'
    },
    {
      id: 'error-8',
      timestamp: new Date(Date.now() - 28800000), // 8 hours ago
      severity: 'info',
      message: 'Performance monitoring enabled',
      repoId: 'repo-lens',
      moduleId: 'shared',
      fileId: 'performance.ts',
      doctrineNumber: '39.0.3',
      occurrenceCount: 1,
      escalationLevel: 'none',
      resolutionStatus: 'resolved',
      lastOccurrence: new Date(Date.now() - 28800000),
      category: 'barton'
    }
  ]

  // Add some recent errors for live updates
  const recentErrors: ErrorEntry[] = [
    {
      id: 'error-recent-1',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      severity: 'warning',
      message: 'Memory usage above threshold',
      repoId: 'repo-lens',
      moduleId: 'system',
      fileId: 'monitor.ts',
      doctrineNumber: '39.0.4',
      occurrenceCount: 1,
      escalationLevel: 'auto',
      resolutionStatus: 'open',
      lastOccurrence: new Date(Date.now() - 300000),
      category: 'system',
      suggestedResolution: 'Optimize memory usage and implement garbage collection'
    },
    {
      id: 'error-recent-2',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      severity: 'error',
      orbtCode: '10.ORBT.build.missing',
      message: 'Missing build logic in component',
      repoId: 'repo-lens',
      moduleId: '03-visual-architecture',
      fileId: 'diagram.tsx',
      doctrineNumber: '39.3.1',
      occurrenceCount: 1,
      escalationLevel: 'mantis',
      resolutionStatus: 'open',
      lastOccurrence: new Date(Date.now() - 600000),
      category: 'orbt',
      suggestedResolution: 'Add import statements or dependency declarations'
    }
  ]

  return [...recentErrors, ...baseErrors]
}

function applyFilters(errors: ErrorEntry[], searchParams: URLSearchParams): ErrorEntry[] {
  let filtered = [...errors]

  const repoId = searchParams.get('repoId')
  const moduleId = searchParams.get('moduleId')
  const fileId = searchParams.get('fileId')
  const severity = searchParams.get('severity')
  const category = searchParams.get('category')
  const resolutionStatus = searchParams.get('resolutionStatus')
  const search = searchParams.get('search')

  if (repoId) {
    filtered = filtered.filter(error => error.repoId === repoId)
  }

  if (moduleId) {
    filtered = filtered.filter(error => error.moduleId === moduleId)
  }

  if (fileId) {
    filtered = filtered.filter(error => error.fileId === fileId)
  }

  if (severity) {
    filtered = filtered.filter(error => error.severity === severity)
  }

  if (category) {
    filtered = filtered.filter(error => error.category === category)
  }

  if (resolutionStatus) {
    filtered = filtered.filter(error => error.resolutionStatus === resolutionStatus)
  }

  if (search) {
    const query = search.toLowerCase()
    filtered = filtered.filter(error =>
      error.message.toLowerCase().includes(query) ||
      error.orbtCode?.toLowerCase().includes(query) ||
      error.repoId?.toLowerCase().includes(query) ||
      error.moduleId?.toLowerCase().includes(query) ||
      error.fileId?.toLowerCase().includes(query)
    )
  }

  return filtered
}

function generateDiagnosticSummary(errors: ErrorEntry[]): DiagnosticSummary {
  const criticalErrors = errors.filter(e => e.severity === 'critical').length
  const warningErrors = errors.filter(e => e.severity === 'warning').length
  const resolvedErrors = errors.filter(e => e.resolutionStatus === 'resolved').length
  const orbtViolations = errors.filter(e => e.category === 'orbt').length
  const escalationCount = errors.filter(e => e.escalationLevel !== 'none').length

  // Calculate top repos
  const repoCounts = errors.reduce((acc, error) => {
    if (error.repoId) {
      acc[error.repoId] = (acc[error.repoId] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const topRepos = Object.entries(repoCounts)
    .map(([repoId, errorCount]) => ({ repoId, errorCount }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 5)

  // Calculate top modules
  const moduleCounts = errors.reduce((acc, error) => {
    if (error.moduleId) {
      acc[error.moduleId] = (acc[error.moduleId] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const topModules = Object.entries(moduleCounts)
    .map(([moduleId, errorCount]) => ({ moduleId, errorCount }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 5)

  // Calculate MTTR (simplified)
  const resolvedErrorTimes = errors
    .filter(e => e.resolutionStatus === 'resolved')
    .map(e => e.lastOccurrence.getTime() - e.timestamp.getTime())
  
  const meanTimeToResolve = resolvedErrorTimes.length > 0 
    ? resolvedErrorTimes.reduce((sum, time) => sum + time, 0) / resolvedErrorTimes.length / (1000 * 60 * 60) // Convert to hours
    : 0

  // Determine error trend (simplified)
  const recentErrors = errors.filter(e => 
    e.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
  ).length
  const olderErrors = errors.filter(e => 
    e.timestamp.getTime() <= Date.now() - 24 * 60 * 60 * 1000
  ).length

  let errorTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  if (recentErrors > olderErrors * 0.5) {
    errorTrend = 'increasing'
  } else if (recentErrors < olderErrors * 0.3) {
    errorTrend = 'decreasing'
  }

  return {
    totalErrors: errors.length,
    criticalErrors,
    warningErrors,
    resolvedErrors,
    meanTimeToResolve,
    errorTrend,
    topRepos,
    topModules,
    orbtViolations,
    escalationCount
  }
} 