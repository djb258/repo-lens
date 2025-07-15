'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import React from 'react'
import { 
  DiagnosticEvent, 
  Severity, 
  diagnosticLogger, 
  Module,
  Altitude,
  Submodule,
  Action,
  Diagnostics,
  Status
} from '@/lib/diagnostics'

const DiagnosticDashboard = React.memo(function DiagnosticDashboard() {
  const [diagnosticEvents, setDiagnosticEvents] = useState<DiagnosticEvent[]>([])
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL')
  const [selectedModule, setSelectedModule] = useState<Module | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState<DiagnosticEvent | null>(null)

  useEffect(() => {
    const updateEvents = () => {
      try {
        const events = diagnosticLogger.getDiagnosticEvents()
        setDiagnosticEvents((prevEvents: DiagnosticEvent[]) => {
          if (JSON.stringify(prevEvents) !== JSON.stringify(events)) {
            return events
          }
          return prevEvents
        })
      } catch (error) {
        console.error('Error updating diagnostic events:', error)
        setDiagnosticEvents([])
      }
    }

    updateEvents()
    
    // Update every 5 seconds (reduced from 2 seconds for better performance)
    const interval = setInterval(updateEvents, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const filteredEvents = useMemo(() => {
    if (diagnosticEvents.length === 0) return []
    
    let filtered = diagnosticEvents

    // Filter by severity
    if (selectedSeverity !== 'ALL') {
      filtered = filtered.filter((event: DiagnosticEvent) => event.severity === selectedSeverity)
    }

    // Filter by module
    if (selectedModule !== 'ALL') {
      filtered = filtered.filter((event: DiagnosticEvent) => 
        event.diagnostic_code.includes(`${selectedModule}.`)
      )
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      filtered = filtered.filter((event: DiagnosticEvent) =>
        event.diagnostic_code.toLowerCase().includes(lowerSearchTerm) ||
        event.message.toLowerCase().includes(lowerSearchTerm) ||
        event.status.toLowerCase().includes(lowerSearchTerm)
      )
    }

    return filtered
  }, [diagnosticEvents, selectedSeverity, selectedModule, searchTerm])


  const severityStats = useMemo(() => {
    const stats = {
      [Severity.GREEN]: 0,
      [Severity.YELLOW]: 0,
      [Severity.ORANGE]: 0,
      [Severity.RED]: 0,
    }

    diagnosticEvents.forEach((event: DiagnosticEvent) => {
      stats[event.severity as keyof typeof stats]++
    })

    return stats
  }, [diagnosticEvents])

  const moduleStats = useMemo(() => {
    const stats: Record<string, number> = {}
    
    diagnosticEvents.forEach((event: DiagnosticEvent) => {
      const module = event.diagnostic_code.split('.')[1]
      if (module) {
        stats[module] = (stats[module] || 0) + 1
      }
    })

    return stats
  }, [diagnosticEvents])

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.GREEN:
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case Severity.YELLOW:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case Severity.ORANGE:
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
      case Severity.RED:
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case Severity.GREEN:
        return '✅'
      case Severity.YELLOW:
        return '⚠️'
      case Severity.ORANGE:
        return '🚨'
      case Severity.RED:
        return '🔥'
      default:
        return 'ℹ️'
    }
  }

  const clearAllEvents = useCallback(() => {
    const eventCount = diagnosticEvents.length
    diagnosticLogger.clearLog()
    setDiagnosticEvents([])
    
    // Log the clearing action
    Diagnostics.success(
      Altitude.SYSTEM,
      Module.UI,
      Submodule.DIAGNOSTIC_LOG,
      Action.DELETE,
      'All diagnostic events cleared by user',
      { clearedCount: eventCount }
    )
  }, [diagnosticEvents.length])

  const exportEvents = useCallback(() => {
    const dataStr = JSON.stringify(diagnosticEvents, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `diagnostic-events-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [diagnosticEvents])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          🔍 Diagnostic Dashboard - BP-039
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={exportEvents}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Export
          </button>
          <button
            onClick={clearAllEvents}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {severityStats[Severity.GREEN]}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Healthy</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {severityStats[Severity.YELLOW]}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Warnings</div>
        </div>
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {severityStats[Severity.ORANGE]}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Critical</div>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {severityStats[Severity.RED]}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">Escalated</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Severity
          </label>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as Severity | 'ALL')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Severities</option>
            <option value={Severity.GREEN}>Green</option>
            <option value={Severity.YELLOW}>Yellow</option>
            <option value={Severity.ORANGE}>Orange</option>
            <option value={Severity.RED}>Red</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Module
          </label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value as Module | 'ALL')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Modules</option>
            {Object.values(Module).filter(module => typeof module === 'string').map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search diagnostic codes, messages..."
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Module Statistics */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Module Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(moduleStats).map(([module, count]) => (
            <div key={module} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{module}</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Diagnostic Events ({filteredEvents.length})
        </h3>
        
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p>No diagnostic events match the current filters</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredEvents.map((event, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setShowDetails(event)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getSeverityIcon(event.severity)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {event.diagnostic_code}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {event.message}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Status: {event.status}</span>
                  {event.module_path && <span>Path: {event.module_path}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Event Details
              </h3>
              <button
                onClick={() => setShowDetails(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <strong>Blueprint ID:</strong> {showDetails.blueprint_id}
              </div>
              <div>
                <strong>Diagnostic Code:</strong> {showDetails.diagnostic_code}
              </div>
              <div>
                <strong>Severity:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(showDetails.severity)}`}>
                  {showDetails.severity}
                </span>
              </div>
              <div>
                <strong>Status:</strong> {showDetails.status}
              </div>
              <div>
                <strong>Message:</strong> {showDetails.message}
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date(showDetails.timestamp).toLocaleString()}
              </div>
              {showDetails.url && (
                <div>
                  <strong>URL:</strong> {showDetails.url}
                </div>
              )}
              {showDetails.module_path && (
                <div>
                  <strong>Module Path:</strong> {showDetails.module_path}
                </div>
              )}
              {showDetails.function_name && (
                <div>
                  <strong>Function:</strong> {showDetails.function_name}
                </div>
              )}
              {showDetails.line_number && (
                <div>
                  <strong>Line:</strong> {showDetails.line_number}
                </div>
              )}
              {showDetails.details && (
                <div>
                  <strong>Details:</strong>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                    {JSON.stringify(showDetails.details, null, 2)}
                  </pre>
                </div>
              )}
              {showDetails.stack_trace && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                    {showDetails.stack_trace}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default DiagnosticDashboard     