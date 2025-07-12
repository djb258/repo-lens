'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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

interface FilterState {
  repoId?: string
  moduleId?: string
  fileId?: string
  severity?: string
  category?: string
  resolutionStatus?: string
  dateRange?: { start: Date; end: Date }
  searchQuery?: string
}

export default function ErrorLogPage() {
  const [errors, setErrors] = useState<ErrorEntry[]>([])
  const [summary, setSummary] = useState<DiagnosticSummary | null>(null)
  const [filters, setFilters] = useState<FilterState>({})
  const [loading, setLoading] = useState(true)
  const [liveUpdates, setLiveUpdates] = useState(true)
  const [selectedError, setSelectedError] = useState<ErrorEntry | null>(null)
  const [diagnostics, setDiagnostics] = useState<any[]>([])

  // Load error data
  const loadErrorData = useCallback(async () => {
    try {
      setLoading(true)
      
      logEnhancedORBTEvent(
        '10.ERROR_LOG.load',
        Severity.GREEN,
        Status.SUCCESS,
        'Loading error log data',
        { filters },
        BartonPrinciple.UNIVERSAL_MONITORING
      )

      const queryParams = new URLSearchParams()
      if (filters.repoId) queryParams.append('repoId', filters.repoId)
      if (filters.moduleId) queryParams.append('moduleId', filters.moduleId)
      if (filters.fileId) queryParams.append('fileId', filters.fileId)
      if (filters.severity) queryParams.append('severity', filters.severity)
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.resolutionStatus) queryParams.append('resolutionStatus', filters.resolutionStatus)
      if (filters.searchQuery) queryParams.append('search', filters.searchQuery)

      const response = await fetch(`/api/modules/error-log?${queryParams.toString()}`)
      const data = await response.json()

      if (data.success) {
        setErrors(data.data.errors)
        setSummary(data.data.summary)
        setDiagnostics(data.data.diagnostics)
      } else {
        throw new Error(data.error || 'Failed to load error data')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      logEnhancedORBTEvent(
        '10.ERROR_LOG.error',
        Severity.RED,
        Status.FAILED_FETCH,
        `Error log load failed: ${errorMessage}`,
        { error: errorMessage },
        BartonPrinciple.UNIVERSAL_MONITORING
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Live updates simulation
  useEffect(() => {
    if (!liveUpdates) return

    const interval = setInterval(() => {
      // Simulate new errors coming in
      if (Math.random() > 0.8) { // 20% chance of new error
        const newError: ErrorEntry = {
          id: `error-${Date.now()}`,
          timestamp: new Date(),
          severity: Math.random() > 0.7 ? 'critical' : 'warning',
          message: `Simulated error ${Date.now()}`,
          repoId: 'test-repo',
          moduleId: 'test-module',
          fileId: 'test-file.ts',
          occurrenceCount: 1,
          escalationLevel: 'none',
          resolutionStatus: 'open',
          lastOccurrence: new Date(),
          category: 'system'
        }
        
        setErrors(prev => [newError, ...prev])
        
        // Highlight new error
        setTimeout(() => {
          const element = document.getElementById(`error-${newError.id}`)
          if (element) {
            element.classList.add('animate-pulse', 'bg-yellow-100', 'dark:bg-yellow-900/20')
            setTimeout(() => {
              element.classList.remove('animate-pulse', 'bg-yellow-100', 'dark:bg-yellow-900/20')
            }, 3000)
          }
        }, 100)
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [liveUpdates])

  // Initial load
  useEffect(() => {
    loadErrorData()
  }, [loadErrorData])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400'
      case 'error': return 'text-orange-600 dark:text-orange-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'info': return 'text-blue-600 dark:text-blue-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'error': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getEscalationColor = (level: string) => {
    switch (level) {
      case 'human': return 'text-red-600 dark:text-red-400'
      case 'mantis': return 'text-orange-600 dark:text-orange-400'
      case 'auto': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getResolutionStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600 dark:text-green-400'
      case 'in-progress': return 'text-blue-600 dark:text-blue-400'
      case 'open': return 'text-red-600 dark:text-red-400'
      case 'stale': return 'text-gray-600 dark:text-gray-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handleErrorClick = (error: ErrorEntry) => {
    setSelectedError(error)
    
    logBartonEvent(
      BartonPrinciple.UNIVERSAL_MONITORING,
      '10.ERROR_LOG.error.click',
      Severity.GREEN,
      Status.SUCCESS,
      'Error detail viewed',
      { errorId: error.id, severity: error.severity }
    )
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const exportSummary = () => {
    const data = {
      summary,
      errors: errors.slice(0, 100), // Export first 100 errors
      exportDate: new Date().toISOString(),
      filters
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `error-log-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredErrors = errors.filter(error => {
    if (filters.severity && error.severity !== filters.severity) return false
    if (filters.category && error.category !== filters.category) return false
    if (filters.resolutionStatus && error.resolutionStatus !== filters.resolutionStatus) return false
    if (filters.repoId && error.repoId !== filters.repoId) return false
    if (filters.moduleId && error.moduleId !== filters.moduleId) return false
    if (filters.fileId && error.fileId !== filters.fileId) return false
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      return (
        error.message.toLowerCase().includes(query) ||
        error.orbtCode?.toLowerCase().includes(query) ||
        error.repoId?.toLowerCase().includes(query) ||
        error.moduleId?.toLowerCase().includes(query) ||
        error.fileId?.toLowerCase().includes(query)
      )
    }
    return true
  })

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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Error Log & Diagnostic View
              </h1>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                Module 6
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLiveUpdates(!liveUpdates)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  liveUpdates 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                {liveUpdates ? '🟢 Live' : '⚫ Offline'}
              </button>
              <button
                onClick={exportSummary}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
              >
                📊 Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Diagnostic Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Errors</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalErrors}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🚨</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.criticalErrors}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.resolvedErrors}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">MTTR (hours)</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summary.meanTimeToResolve.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search errors..."
                value={filters.searchQuery || ''}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Severity
              </label>
              <select
                value={filters.severity || ''}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="orbt">ORBT</option>
                <option value="barton">Barton</option>
                <option value="github">GitHub</option>
                <option value="module">Module</option>
                <option value="system">System</option>
                <option value="file">File</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.resolutionStatus || ''}
                onChange={(e) => handleFilterChange('resolutionStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="stale">Stale</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Error Feed ({filteredErrors.length} errors)
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? 'Loading...' : 'Last updated: ' + new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredErrors.map((error) => (
              <div
                key={error.id}
                id={`error-${error.id}`}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={() => handleErrorClick(error)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSeverityBg(error.severity)}`}>
                        {error.severity.toUpperCase()}
                      </span>
                      {error.orbtCode && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {error.orbtCode}
                        </span>
                      )}
                      {error.escalationLevel !== 'none' && (
                        <span className={`text-xs font-medium ${getEscalationColor(error.escalationLevel)}`}>
                          ⚡ {error.escalationLevel.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-900 dark:text-white mb-2">
                      {error.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{error.timestamp.toLocaleString()}</span>
                      {error.repoId && (
                        <Link
                          href={`/modules/02-repo-overview/${error.repoId}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📁 {error.repoId}
                        </Link>
                      )}
                      {error.moduleId && (
                        <Link
                          href={`/modules/04-module-detail/${error.repoId}/${error.moduleId}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📦 {error.moduleId}
                        </Link>
                      )}
                      {error.fileId && (
                        <Link
                          href={`/modules/05-file-detail/${error.repoId}/${error.moduleId}/${error.fileId}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📄 {error.fileId}
                        </Link>
                      )}
                      <span>🔄 {error.occurrenceCount} occurrences</span>
                      <span className={`${getResolutionStatusColor(error.resolutionStatus)}`}>
                        {error.resolutionStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {error.lastOccurrence.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredErrors.length === 0 && !loading && (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No errors found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {Object.keys(filters).length > 0 
                  ? 'Try adjusting your filters to see more results.'
                  : 'All systems are running smoothly!'
                }
              </p>
            </div>
          )}
        </div>

        {/* Error Detail Modal */}
        {selectedError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Error Details
                  </h3>
                  <button
                    onClick={() => setSelectedError(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Error Information</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Message:</span>
                      <span className="text-gray-900 dark:text-white">{selectedError.message}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Severity:</span>
                      <span className={`font-medium ${getSeverityColor(selectedError.severity)}`}>
                        {selectedError.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <span className="text-gray-900 dark:text-white">{selectedError.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Occurrences:</span>
                      <span className="text-gray-900 dark:text-white">{selectedError.occurrenceCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Escalation:</span>
                      <span className={`font-medium ${getEscalationColor(selectedError.escalationLevel)}`}>
                        {selectedError.escalationLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedError.orbtCode && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">ORBT Code</h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <code className="text-sm font-mono text-blue-800 dark:text-blue-200">
                        {selectedError.orbtCode}
                      </code>
                    </div>
                  </div>
                )}
                
                {selectedError.suggestedResolution && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Resolution</h4>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {selectedError.suggestedResolution}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedError.stackTrace && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Stack Trace</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {selectedError.stackTrace}
                      </pre>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  {selectedError.fileId && (
                    <Link
                      href={`/modules/05-file-detail/${selectedError.repoId}/${selectedError.moduleId}/${selectedError.fileId}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition-colors"
                    >
                      View File
                    </Link>
                  )}
                  <button
                    onClick={() => setSelectedError(null)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 