import { NextRequest, NextResponse } from 'next/server'
import { logEnhancedORBTEvent } from '@/lib/enhanced-orbt'
import { logBartonEvent, BartonPrinciple } from '@/lib/barton'
import { Severity, Status } from '@/lib/diagnostics'

interface ArchitectureNode {
  id: string
  label: string
  type: 'module' | 'component' | 'service' | 'utility'
  position: { x: number; y: number }
  size: { width: number; height: number }
  color: 'green' | 'yellow' | 'red' | 'gray'
  doctrineNumber: string
  description: string
  orbtStatus: {
    operating: 'green' | 'yellow' | 'red'
    repair: 'green' | 'yellow' | 'red'
    blueprint: 'green' | 'yellow' | 'red'
    training: 'green' | 'yellow' | 'red'
  }
  errorCount: number
  clickable: boolean
  route?: string
}

interface ArchitectureEdge {
  id: string
  source: string
  target: string
  type: 'dependency' | 'import' | 'export' | 'reference'
  label?: string
}

interface ArchitectureData {
  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
  metadata: {
    repoId: string
    lastUpdated: Date
    totalModules: number
    totalErrors: number
    orbtCompliance: number
  }
}

export async function GET(request: NextRequest) {
  try {
    // Log API access
    logEnhancedORBTEvent(
      '20.API.visual-architecture.request',
      Severity.GREEN,
      Status.SUCCESS,
      'Visual architecture API request',
      {},
      BartonPrinciple.UNIVERSAL_MONITORING
    )

    // Generate architecture data with ORBT compliance
    const architectureData = generateArchitectureData()
    
    // Create diagnostics
    const diagnostics = [
      {
        bartonId: `visual-architecture-${Date.now()}`,
        sessionId: 'api-session',
        timestamp: new Date(),
        severity: architectureData.metadata.totalErrors > 0 ? 'warning' : 'info',
        category: 'orbt',
        message: `Visual architecture generated with ${architectureData.metadata.totalModules} modules`,
        context: {
          totalModules: architectureData.metadata.totalModules,
          totalErrors: architectureData.metadata.totalErrors,
          orbtCompliance: architectureData.metadata.orbtCompliance
        }
      }
    ]

    // Log successful response
    logBartonEvent(
      BartonPrinciple.UNIVERSAL_MONITORING,
      '20.API.visual-architecture.success',
      Severity.GREEN,
      Status.SUCCESS,
      'Visual architecture API response generated successfully',
      { 
        totalModules: architectureData.metadata.totalModules,
        totalErrors: architectureData.metadata.totalErrors,
        orbtCompliance: architectureData.metadata.orbtCompliance
      }
    )

    return NextResponse.json({
      success: true,
      data: architectureData,
      error: null,
      diagnostics,
      timestamp: new Date()
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    logEnhancedORBTEvent(
      '20.API.visual-architecture.error',
      Severity.RED,
      Status.FAILED_FETCH,
      `Visual architecture API error: ${errorMessage}`,
      { error: errorMessage },
      BartonPrinciple.UNIVERSAL_MONITORING
    )

    return NextResponse.json({
      success: false,
      error: errorMessage,
      data: null,
      diagnostics: [{
        bartonId: `visual-architecture-error-${Date.now()}`,
        sessionId: 'api-session',
        timestamp: new Date(),
        severity: 'error',
        category: 'api',
        message: `Visual architecture API failed: ${errorMessage}`,
        context: { error: errorMessage }
      }],
      timestamp: new Date()
    }, { status: 500 })
  }
}

function generateArchitectureData(): ArchitectureData {
  const nodes: ArchitectureNode[] = [
    // Core Modules
    {
      id: 'github-index',
      label: 'GitHub Index',
      type: 'module',
      position: { x: 100, y: 100 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.01.01',
      description: 'Live index of all GitHub repositories with auto-update functionality',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: true,
      route: '/modules/01-github-index'
    },
    {
      id: 'repo-overview',
      label: 'Repo Overview',
      type: 'module',
      position: { x: 300, y: 100 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.02.01',
      description: 'Repository-level index of app components and structure',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: true,
      route: '/modules/02-repo-overview'
    },
    {
      id: 'visual-architecture',
      label: 'Visual Architecture',
      type: 'module',
      position: { x: 500, y: 100 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.03.01',
      description: 'Interactive SVG diagram of application architecture',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: true,
      route: '/modules/03-visual-architecture'
    },
    {
      id: 'file-detail',
      label: 'File Detail',
      type: 'module',
      position: { x: 700, y: 100 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.05.01',
      description: 'Individual file examination with ORBT compliance analysis',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: true,
      route: '/modules/05-file-detail'
    },
    {
      id: 'error-log',
      label: 'Error Log',
      type: 'module',
      position: { x: 900, y: 100 },
      size: { width: 120, height: 80 },
      color: 'yellow',
      doctrineNumber: 'BP-039.06.01',
      description: 'Centralized error monitoring and diagnostic system',
      orbtStatus: {
        operating: 'green',
        repair: 'yellow',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 2,
      clickable: true,
      route: '/modules/06-error-log'
    },

    // Services
    {
      id: 'github-api',
      label: 'GitHub API',
      type: 'service',
      position: { x: 100, y: 250 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.30.01',
      description: 'GitHub API integration service with rate limiting',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: false
    },
    {
      id: 'orbt-system',
      label: 'ORBT System',
      type: 'service',
      position: { x: 300, y: 250 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.30.02',
      description: 'ORBT doctrine enforcement and compliance tracking',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: false
    },
    {
      id: 'barton-doctrine',
      label: 'Barton Doctrine',
      type: 'service',
      position: { x: 500, y: 250 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.30.03',
      description: 'Barton doctrine implementation and diagnostic tracking',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: false
    },

    // Utilities
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      type: 'utility',
      position: { x: 100, y: 400 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.00.01',
      description: 'Universal diagnostic tracking and logging system',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: false
    },
    {
      id: 'type-system',
      label: 'Type System',
      type: 'utility',
      position: { x: 300, y: 400 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.00.02',
      description: 'TypeScript type definitions and validation',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: false
    },
    {
      id: 'shared-components',
      label: 'Shared Components',
      type: 'utility',
      position: { x: 500, y: 400 },
      size: { width: 120, height: 80 },
      color: 'green',
      doctrineNumber: 'BP-039.00.03',
      description: 'Reusable UI components and utilities',
      orbtStatus: {
        operating: 'green',
        repair: 'green',
        blueprint: 'green',
        training: 'green'
      },
      errorCount: 0,
      clickable: false
    },

    // Components with issues
    {
      id: 'test-system',
      label: 'Test System',
      type: 'component',
      position: { x: 700, y: 400 },
      size: { width: 120, height: 80 },
      color: 'yellow',
      doctrineNumber: 'BP-039.20.01',
      description: 'Comprehensive test suite and validation system',
      orbtStatus: {
        operating: 'green',
        repair: 'yellow',
        blueprint: 'green',
        training: 'yellow'
      },
      errorCount: 1,
      clickable: true,
      route: '/modules/test'
    },
    {
      id: 'legacy-modules',
      label: 'Legacy Modules',
      type: 'component',
      position: { x: 900, y: 400 },
      size: { width: 120, height: 80 },
      color: 'red',
      doctrineNumber: 'BP-039.20.02',
      description: 'Deprecated modules requiring cleanup',
      orbtStatus: {
        operating: 'red',
        repair: 'red',
        blueprint: 'yellow',
        training: 'red'
      },
      errorCount: 3,
      clickable: false
    }
  ]

  const edges: ArchitectureEdge[] = [
    // Module dependencies
    { id: 'edge-1', source: 'github-index', target: 'github-api', type: 'dependency', label: 'API' },
    { id: 'edge-2', source: 'repo-overview', target: 'github-api', type: 'dependency', label: 'Data' },
    { id: 'edge-3', source: 'file-detail', target: 'repo-overview', type: 'dependency', label: 'Navigation' },
    { id: 'edge-4', source: 'error-log', target: 'orbt-system', type: 'dependency', label: 'Compliance' },
    { id: 'edge-5', source: 'error-log', target: 'barton-doctrine', type: 'dependency', label: 'Tracking' },
    
    // Service connections
    { id: 'edge-6', source: 'orbt-system', target: 'diagnostics', type: 'dependency', label: 'Logging' },
    { id: 'edge-7', source: 'barton-doctrine', target: 'diagnostics', type: 'dependency', label: 'Events' },
    { id: 'edge-8', source: 'github-api', target: 'type-system', type: 'dependency', label: 'Types' },
    
    // Utility connections
    { id: 'edge-9', source: 'shared-components', target: 'type-system', type: 'dependency', label: 'Props' },
    { id: 'edge-10', source: 'test-system', target: 'diagnostics', type: 'dependency', label: 'Validation' },
    
    // Error connections
    { id: 'edge-11', source: 'legacy-modules', target: 'error-log', type: 'reference', label: 'Errors' },
    { id: 'edge-12', source: 'test-system', target: 'error-log', type: 'reference', label: 'Issues' }
  ]

  // Calculate metadata
  const totalModules = nodes.length
  const totalErrors = nodes.reduce((sum, node) => sum + node.errorCount, 0)
  const orbtCompliance = calculateOrbtCompliance(nodes)

  return {
    nodes,
    edges,
    metadata: {
      repoId: 'repo-lens',
      lastUpdated: new Date(),
      totalModules,
      totalErrors,
      orbtCompliance
    }
  }
}

function calculateOrbtCompliance(nodes: ArchitectureNode[]): number {
  let totalChecks = 0
  let passedChecks = 0

  nodes.forEach(node => {
    // Check each ORBT status
    Object.values(node.orbtStatus).forEach(status => {
      totalChecks++
      if (status === 'green') {
        passedChecks++
      }
    })
  })

  return totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100
} 