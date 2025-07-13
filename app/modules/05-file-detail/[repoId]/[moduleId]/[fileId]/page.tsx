'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileStructure, 
  ModuleViewData, 
  BartonDiagnostic, 
  DoctrineNumbering,
  ORBTCycle 
} from '@/app/modules/types'
import { Severity, Status } from '@/lib/diagnostics'
import { logEnhancedORBTEvent } from '@/lib/enhanced-orbt'
import { logBartonEvent, BartonPrinciple } from '@/lib/barton'

interface FileDetailViewProps {
  params: {
    repoId: string
    moduleId: string
    fileId: string
  }
}

interface FileContent {
  content: string
  encoding: string
  size: number
  sha: string
  url: string
}

interface ORBTViolation {
  type: 'operating' | 'repair' | 'build' | 'training'
  severity: 'green' | 'yellow' | 'red' | 'gray'
  message: string
  lineNumber?: number
  suggestion?: string
}

interface ErrorReference {
  id: string
  timestamp: Date
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  count: number
}

export default function FileDetailViewPage({ params }: FileDetailViewProps) {
  const router = useRouter()
  const { repoId, moduleId, fileId } = params
  
  const [fileData, setFileData] = useState<FileStructure | null>(null)
  const [fileContent, setFileContent] = useState<FileContent | null>(null)
  const [moduleData, setModuleData] = useState<ModuleViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orbtViolations, setOrbtViolations] = useState<ORBTViolation[]>([])
  const [errorReferences, setErrorReferences] = useState<ErrorReference[]>([])
  const [humanSummary, setHumanSummary] = useState<string>('')
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<number>>(new Set())
  const [diagnostics, setDiagnostics] = useState<BartonDiagnostic[]>([])

  // ORBT and Barton doctrine compliance
  const [orbtCycle, setOrbtCycle] = useState<ORBTCycle>({
    observe: { status: 'pending', data: null, diagnostics: [] },
    report: { status: 'pending', findings: [], diagnostics: [] },
    build: { status: 'pending', output: null, diagnostics: [] },
    test: { status: 'pending', results: [], diagnostics: [] }
  })

  useEffect(() => {
    const loadFileDetail = async () => {
      try {
        setLoading(true)
        
        // Log ORBT event for file detail view access
        logEnhancedORBTEvent(
          '10.FILE.detail.load',
          Severity.GREEN,
          Status.SUCCESS,
          `Loading file detail view for ${fileId}`,
          { repoId, moduleId, fileId },
          BartonPrinciple.UNIVERSAL_MONITORING
        )

        // Fetch file data from API
        const fileResponse = await fetch(`/api/modules/file-detail?repoId=${repoId}&moduleId=${moduleId}&fileId=${fileId}`)
        if (!fileResponse.ok) {
          throw new Error(`Failed to load file: ${fileResponse.statusText}`)
        }
        
        const fileResult = await fileResponse.json()
        setFileData(fileResult.data.file)
        setFileContent(fileResult.data.content)
        setModuleData(fileResult.data.module)
        setOrbtViolations(fileResult.data.orbtViolations)
        setErrorReferences(fileResult.data.errorReferences)
        setHumanSummary(fileResult.data.humanSummary)
        setDiagnostics(fileResult.data.diagnostics)
        setOrbtCycle(fileResult.data.orbtCycle)

        // Log successful load
        logBartonEvent(
          BartonPrinciple.UNIVERSAL_MONITORING,
          '10.FILE.detail.success',
          Severity.GREEN,
          Status.SUCCESS,
          `File detail loaded successfully: ${fileId}`,
          { fileSize: fileResult.data.content?.size, violations: fileResult.data.orbtViolations.length }
        )

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        
        // Log error
        logEnhancedORBTEvent(
          '10.FILE.detail.error',
          Severity.RED,
          Status.FAILED_FETCH,
          `Failed to load file detail: ${errorMessage}`,
          { repoId, moduleId, fileId, error: errorMessage },
          BartonPrinciple.UNIVERSAL_MONITORING
        )
      } finally {
        setLoading(false)
      }
    }

    loadFileDetail()
  }, [repoId, moduleId, fileId])

  const toggleCodeBlock = (startLine: number) => {
    const newCollapsed = new Set(collapsedBlocks)
    if (newCollapsed.has(startLine)) {
      newCollapsed.delete(startLine)
    } else {
      newCollapsed.add(startLine)
    }
    setCollapsedBlocks(newCollapsed)
  }

  const getFileTypeIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'ts': case 'tsx': return '🔷'
      case 'js': case 'jsx': return '🟡'
      case 'py': return '🐍'
      case 'java': return '☕'
      case 'cpp': case 'c': return '⚙️'
      case 'md': return '📝'
      case 'json': return '📄'
      case 'yaml': case 'yml': return '⚙️'
      case 'css': case 'scss': return '🎨'
      case 'html': return '🌐'
      default: return '📄'
    }
  }

  const getOrbtStatusColor = () => {
    const redViolations = orbtViolations.filter(v => v.severity === 'red').length
    const yellowViolations = orbtViolations.filter(v => v.severity === 'yellow').length
    
    if (redViolations > 0) return 'red'
    if (yellowViolations > 0) return 'yellow'
    return 'green'
  }

  const getOrbtStatusText = () => {
    const color = getOrbtStatusColor()
    switch (color) {
      case 'red': return 'Critical Issues'
      case 'yellow': return 'Warnings'
      case 'green': return 'Compliant'
      default: return 'Unknown'
    }
  }

  const renderCodeWithViolations = () => {
    if (!fileContent?.content) return null

    const lines = fileContent.content.split('\n')
    const blocks: JSX.Element[] = []
    let currentBlock: JSX.Element[] = []
    let blockStartLine = 1

    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const violations = orbtViolations.filter(v => v.lineNumber === lineNumber)
      const isCollapsed = collapsedBlocks.has(blockStartLine)
      
      // Check if this line should start a new collapsible block
      const shouldStartNewBlock = line.length > 100 || violations.length > 0 || line.trim().startsWith('//')
      
      if (shouldStartNewBlock && currentBlock.length > 0) {
        // End current block
        blocks.push(
          <div key={`block-${blockStartLine}`} className="mb-2">
            {currentBlock.length > 10 && (
              <button
                onClick={() => toggleCodeBlock(blockStartLine)}
                className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {isCollapsed ? '▶' : '▼'} Block {blockStartLine}-{blockStartLine + currentBlock.length - 1} 
                ({currentBlock.length} lines)
              </button>
            )}
            {!isCollapsed && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                {currentBlock}
              </div>
            )}
          </div>
        )
        currentBlock = []
        blockStartLine = lineNumber
      }

      // Add line to current block
      const lineViolations = violations.map(v => (
        <span
          key={v.type}
          className={`inline-block px-1 mx-1 text-xs rounded ${
            v.severity === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            v.severity === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}
          title={v.message}
        >
          {v.type.toUpperCase()}
        </span>
      ))

      currentBlock.push(
        <div
          key={lineNumber}
          className={`flex text-sm font-mono ${
            violations.length > 0 ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' : ''
          }`}
        >
          <div className="w-16 px-2 py-1 text-gray-500 dark:text-gray-400 text-right select-none">
            {lineNumber}
          </div>
          <div className="flex-1 px-2 py-1 text-gray-900 dark:text-gray-100">
            <span className="whitespace-pre">{line}</span>
            {lineViolations.length > 0 && (
              <div className="mt-1">
                {lineViolations}
              </div>
            )}
          </div>
        </div>
      )
    })

    // Add final block
    if (currentBlock.length > 0) {
      blocks.push(
        <div key={`block-${blockStartLine}`} className="mb-2">
          {currentBlock.length > 10 && (
            <button
              onClick={() => toggleCodeBlock(blockStartLine)}
              className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {collapsedBlocks.has(blockStartLine) ? '▶' : '▼'} Block {blockStartLine}-{blockStartLine + currentBlock.length - 1} 
              ({currentBlock.length} lines)
            </button>
          )}
          {!collapsedBlocks.has(blockStartLine) && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              {currentBlock}
            </div>
          )}
        </div>
      )
    }

    return blocks
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !fileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              File Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error || 'The requested file could not be loaded.'}
            </p>
            <Link
              href={`/modules/04-module-detail/${repoId}/${moduleId}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Module
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/modules" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                🧠 Repo Lens
              </Link>
              <span className="text-gray-400">/</span>
              <Link href={`/modules/02-repo-overview/${repoId}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                {repoId}
              </Link>
              <span className="text-gray-400">/</span>
              <Link href={`/modules/04-module-detail/${repoId}/${moduleId}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                {moduleId}
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {fileData.name}
              </h1>
              <span className="text-2xl">{getFileTypeIcon(fileData.name)}</span>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                getOrbtStatusColor() === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                getOrbtStatusColor() === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {getOrbtStatusText()}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>File ID: {fileData.doctrineNumbering?.fullPath || 'N/A'}</span>
              <span>Size: {(fileData.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* File Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📋 File Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Full Path:</span>
                    <p className="text-gray-900 dark:text-white font-mono">{fileData.path}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">File Type:</span>
                    <p className="text-gray-900 dark:text-white">{fileData.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Parent Module:</span>
                    <Link 
                      href={`/modules/04-module-detail/${repoId}/${moduleId}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {moduleData?.name || moduleId}
                    </Link>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Last Modified:</span>
                    <p className="text-gray-900 dark:text-white">
                      {fileData.lastModified ? new Date(fileData.lastModified).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Human-Readable Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📖 What This File Does
                </h2>
              </div>
              <div className="p-6">
                {humanSummary ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300">{humanSummary}</p>
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 italic">
                    No human-readable summary available. This file may need documentation or analysis.
                  </div>
                )}
              </div>
            </div>

            {/* Raw Code Viewer */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  💻 Source Code
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {fileContent?.content ? `${fileContent.content.split('\n').length} lines` : 'No content available'}
                </p>
              </div>
              <div className="p-6">
                {fileContent?.content ? (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden">
                    {renderCodeWithViolations()}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 italic">
                    File content could not be loaded.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ORBT Compliance Checker */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🔍 ORBT Compliance
                </h3>
              </div>
              <div className="p-6">
                {orbtViolations.length > 0 ? (
                  <div className="space-y-3">
                    {orbtViolations.map((violation, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          violation.severity === 'red' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700' :
                          violation.severity === 'yellow' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700' :
                          'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            violation.severity === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            violation.severity === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {violation.type.toUpperCase()}
                          </span>
                          {violation.lineNumber && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Line {violation.lineNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {violation.message}
                        </p>
                        {violation.suggestion && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            💡 {violation.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-green-600 dark:text-green-400 text-center py-4">
                    ✅ No ORBT violations detected
                  </div>
                )}
              </div>
            </div>

            {/* Error References */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ⚠️ Error References
                </h3>
              </div>
              <div className="p-6">
                {errorReferences.length > 0 ? (
                  <div className="space-y-3">
                    {errorReferences.map((errorRef) => (
                      <div key={errorRef.id} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            errorRef.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            errorRef.severity === 'error' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            errorRef.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {errorRef.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {errorRef.count}x
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {errorRef.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(errorRef.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    <Link
                      href={`/modules/06-error-log/${repoId}?file=${fileId}`}
                      className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      View Full Error Log
                    </Link>
                  </div>
                ) : (
                  <div className="text-green-600 dark:text-green-400 text-center py-4">
                    ✅ No errors found for this file
                  </div>
                )}
              </div>
            </div>

            {/* Color Legend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🎨 ORBT Legend
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Green - Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Yellow - Warning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Red - Critical</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Gray - Unknown</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  🧭 Navigation
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href={`/modules/02-repo-overview/${repoId}`}
                  className="block w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📋</span>
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Back to Repo</span>
                  </div>
                </Link>
                
                <Link
                  href={`/modules/04-module-detail/${repoId}/${moduleId}`}
                  className="block w-full text-left p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📁</span>
                    <span className="text-green-700 dark:text-green-300 font-medium">Back to Module</span>
                  </div>
                </Link>
                
                <Link
                  href={`/modules/03-visual-architecture/${repoId}`}
                  className="block w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📊</span>
                    <span className="text-purple-700 dark:text-purple-300 font-medium">View Architecture</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 