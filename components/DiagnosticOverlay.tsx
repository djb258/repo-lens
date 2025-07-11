'use client'

import { useState, useEffect } from 'react'
import { 
  DiagnosticEvent, 
  Severity, 
  diagnosticLogger, 
  Module,
  Altitude,
  Submodule,
  Action,
  Diagnostics
} from '@/lib/diagnostics'

interface DiagnosticOverlayProps {
  modulePath?: string
  className?: string
  children: React.ReactNode
}

export default function DiagnosticOverlay({ 
  modulePath, 
  className = '', 
  children 
}: DiagnosticOverlayProps) {
  const [diagnosticEvents, setDiagnosticEvents] = useState<DiagnosticEvent[]>([])
  const [showOverlay, setShowOverlay] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<DiagnosticEvent | null>(null)

  useEffect(() => {
    // Get diagnostic events for this module
    const events = diagnosticLogger.getDiagnosticEvents()
    const moduleEvents = modulePath 
      ? events.filter(event => 
          event.module_path === modulePath ||
          event.diagnostic_code.includes(modulePath)
        )
      : events

    setDiagnosticEvents(moduleEvents)

    // Check if there are any RED severity events (escalated)
    const hasEscalatedEvents = moduleEvents.some(event => event.severity === Severity.RED)
    if (hasEscalatedEvents) {
      setShowOverlay(true)
    }
  }, [modulePath])

  // Get the highest severity event for this module
  const getHighestSeverityEvent = (): DiagnosticEvent | null => {
    if (diagnosticEvents.length === 0) return null

    const severityOrder = [Severity.RED, Severity.ORANGE, Severity.YELLOW, Severity.GREEN]
    
    for (const severity of severityOrder) {
      const event = diagnosticEvents.find(e => e.severity === severity)
      if (event) return event
    }

    return null
  }

  const highestSeverityEvent = getHighestSeverityEvent()

  if (!highestSeverityEvent) {
    return <div className={className}>{children}</div>
  }

  const getSeverityStyles = (severity: Severity) => {
    switch (severity) {
      case Severity.GREEN:
        return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
      case Severity.YELLOW:
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20'
      case Severity.ORANGE:
        return 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20'
      case Severity.RED:
        return 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20'
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

  const getSeverityText = (severity: Severity) => {
    switch (severity) {
      case Severity.GREEN:
        return 'Healthy'
      case Severity.YELLOW:
        return 'Warning'
      case Severity.ORANGE:
        return 'Critical'
      case Severity.RED:
        return 'Escalated'
      default:
        return 'Info'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main content */}
      <div className={className}>{children}</div>

      {/* Diagnostic indicator */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className={`
            inline-flex items-center px-2 py-1 rounded text-xs font-medium
            ${getSeverityStyles(highestSeverityEvent.severity)}
            hover:opacity-80 transition-opacity cursor-pointer
          `}
          title={`${getSeverityText(highestSeverityEvent.severity)}: ${highestSeverityEvent.message}`}
        >
          <span className="mr-1">{getSeverityIcon(highestSeverityEvent.severity)}</span>
          <span className="text-xs">
            {highestSeverityEvent.diagnostic_code}
          </span>
        </button>
      </div>

      {/* Diagnostic overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-20">
          <div className={`
            w-full h-full border-2 rounded-lg p-4
            ${getSeverityStyles(highestSeverityEvent.severity)}
          `}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">
                {getSeverityIcon(highestSeverityEvent.severity)} 
                {getSeverityText(highestSeverityEvent.severity)} - {highestSeverityEvent.diagnostic_code}
              </h3>
              <button
                onClick={() => setShowOverlay(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm">{highestSeverityEvent.message}</p>
              
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div><strong>Blueprint:</strong> {highestSeverityEvent.blueprint_id}</div>
                <div><strong>Status:</strong> {highestSeverityEvent.status}</div>
                <div><strong>Time:</strong> {new Date(highestSeverityEvent.timestamp).toLocaleString()}</div>
              </div>

              {diagnosticEvents.length > 1 && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-1">
                    {diagnosticEvents.length} diagnostic events for this module:
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {diagnosticEvents.map((event, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedEvent(event)}
                        className={`
                          block w-full text-left p-2 rounded text-xs
                          ${getSeverityStyles(event.severity)}
                          hover:opacity-80 transition-opacity
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span>{event.diagnostic_code}</span>
                          <span>{getSeverityIcon(event.severity)}</span>
                        </div>
                        <div className="text-xs truncate">{event.message}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent && (
                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  <h4 className="font-medium mb-2">Event Details:</h4>
                  <div className="space-y-1">
                    <div><strong>Code:</strong> {selectedEvent.diagnostic_code}</div>
                    <div><strong>Message:</strong> {selectedEvent.message}</div>
                    <div><strong>Status:</strong> {selectedEvent.status}</div>
                    <div><strong>Time:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}</div>
                    {selectedEvent.details && (
                      <div><strong>Details:</strong> <pre className="text-xs mt-1">{JSON.stringify(selectedEvent.details, null, 2)}</pre></div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => {
                    // Log a diagnostic event for viewing details
                    Diagnostics.success(
                      Altitude.COMPONENT,
                      Module.UI,
                      Submodule.DIAGNOSTIC_LOG,
                      Action.READ,
                      `Viewed diagnostic details for ${highestSeverityEvent.diagnostic_code}`,
                      { modulePath, eventCount: diagnosticEvents.length }
                    )
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Log View
                </button>
                <button
                  onClick={() => {
                    // Clear diagnostic events for this module
                    diagnosticLogger.clearLog()
                    setDiagnosticEvents([])
                    setShowOverlay(false)
                  }}
                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for components to easily add diagnostic tracking
export function useDiagnosticOverlay(modulePath?: string) {
  const [hasDiagnostics, setHasDiagnostics] = useState(false)
  const [diagnosticCount, setDiagnosticCount] = useState(0)

  useEffect(() => {
    const checkDiagnostics = () => {
      const events = diagnosticLogger.getDiagnosticEvents()
      const moduleEvents = modulePath 
        ? events.filter(event => 
            event.module_path === modulePath ||
            event.diagnostic_code.includes(modulePath)
          )
        : events

      setHasDiagnostics(moduleEvents.length > 0)
      setDiagnosticCount(moduleEvents.length)
    }

    checkDiagnostics()
    
    // Check every 5 seconds for new diagnostic events
    const interval = setInterval(checkDiagnostics, 5000)
    
    return () => clearInterval(interval)
  }, [modulePath])

  return {
    hasDiagnostics,
    diagnosticCount,
    DiagnosticWrapper: ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <DiagnosticOverlay modulePath={modulePath} className={className}>
        {children}
      </DiagnosticOverlay>
    )
  }
} 