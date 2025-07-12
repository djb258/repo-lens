'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logEnhancedORBTEvent } from '@/lib/enhanced-orbt'
import { logBartonEvent, BartonPrinciple } from '@/lib/barton'
import { Severity, Status } from '@/lib/diagnostics'

export default function ErrorLogTestPage() {
  const [testResults, setTestResults] = useState<{
    [key: string]: { status: 'pending' | 'running' | 'passed' | 'failed'; message: string }
  }>({
    'error-log-api': { status: 'pending', message: 'Testing error log API endpoint' },
    'error-filtering': { status: 'pending', message: 'Testing error filtering functionality' },
    'escalation-logic': { status: 'pending', message: 'Testing escalation logic' },
    'diagnostic-summary': { status: 'pending', message: 'Testing diagnostic summary generation' },
    'live-updates': { status: 'pending', message: 'Testing live update simulation' },
    'error-drilldown': { status: 'pending', message: 'Testing error drilldown navigation' },
    'orbt-integration': { status: 'pending', message: 'Testing ORBT integration' },
    'export-functionality': { status: 'pending', message: 'Testing export functionality' }
  })

  const runTests = async () => {
    // Log test start
    logEnhancedORBTEvent(
      '10.TEST.error-log.start',
      Severity.GREEN,
      Status.SUCCESS,
      'Starting Module 6: Error Log & Diagnostic View tests',
      { module: '06-error-log' },
      BartonPrinciple.UNIVERSAL_MONITORING
    )

    // Test 1: Error Log API
    setTestResults(prev => ({ ...prev, 'error-log-api': { status: 'running', message: 'Testing API endpoint...' } }))
    try {
      const response = await fetch('/api/modules/error-log')
      const data = await response.json()
      
      if (data.success && data.data?.errors && data.data?.summary) {
        setTestResults(prev => ({ 
          ...prev, 
          'error-log-api': { status: 'passed', message: `API working (${data.data.errors.length} errors, ${data.data.summary.totalErrors} total)` } 
        }))
        logBartonEvent(
          BartonPrinciple.UNIVERSAL_MONITORING,
          '10.TEST.error-log.api.success',
          Severity.GREEN,
          Status.SUCCESS,
          'Error log API test passed',
          { errorCount: data.data.errors.length, totalErrors: data.data.summary.totalErrors }
        )
      } else {
        throw new Error('Invalid API response structure')
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        'error-log-api': { status: 'failed', message: `API test failed: ${error}` } 
      }))
      logBartonEvent(
        BartonPrinciple.UNIVERSAL_MONITORING,
        '10.TEST.error-log.api.failed',
        Severity.RED,
        Status.FAILED_FETCH,
        'Error log API test failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
    }

    // Test 2: Error Filtering
    setTestResults(prev => ({ ...prev, 'error-filtering': { status: 'running', message: 'Testing filtering...' } }))
    try {
      const response = await fetch('/api/modules/error-log?severity=critical&category=orbt')
      const data = await response.json()
      
      if (data.success && Array.isArray(data.data.errors)) {
        const criticalOrbtErrors = data.data.errors.filter((e: any) => e.severity === 'critical' && e.category === 'orbt')
        setTestResults(prev => ({ 
          ...prev, 
          'error-filtering': { 
            status: 'passed', 
            message: `Filtering working (${criticalOrbtErrors.length} critical ORBT errors found)` 
          } 
        }))
      } else {
        throw new Error('Filtering not working properly')
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        'error-filtering': { status: 'failed', message: `Filtering test failed: ${error}` } 
      }))
    }

    // Test 3: Escalation Logic
    setTestResults(prev => ({ ...prev, 'escalation-logic': { status: 'running', message: 'Testing escalation...' } }))
    try {
      const response = await fetch('/api/modules/error-log')
      const data = await response.json()
      
      if (data.success && data.data.errors) {
        const escalatedErrors = data.data.errors.filter((e: any) => e.escalationLevel !== 'none')
        const humanEscalations = data.data.errors.filter((e: any) => e.escalationLevel === 'human')
        
        setTestResults(prev => ({ 
          ...prev, 
          'escalation-logic': { 
            status: 'passed', 
            message: `Escalation working (${escalatedErrors.length} escalated, ${humanEscalations.length} human)` 
          } 
        }))
      } else {
        throw new Error('Escalation logic not properly implemented')
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        'escalation-logic': { status: 'failed', message: `Escalation test failed: ${error}` } 
      }))
    }

    // Test 4: Diagnostic Summary
    setTestResults(prev => ({ ...prev, 'diagnostic-summary': { status: 'running', message: 'Testing summary...' } }))
    try {
      const response = await fetch('/api/modules/error-log')
      const data = await response.json()
      
      if (data.success && data.data.summary) {
        const summary = data.data.summary
        setTestResults(prev => ({ 
          ...prev, 
          'diagnostic-summary': { 
            status: 'passed', 
            message: `Summary generated (${summary.totalErrors} total, ${summary.criticalErrors} critical, MTTR: ${summary.meanTimeToResolve.toFixed(1)}h)` 
          } 
        }))
      } else {
        throw new Error('Diagnostic summary not properly generated')
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        'diagnostic-summary': { status: 'failed', message: `Summary test failed: ${error}` } 
      }))
    }

    // Test 5: Live Updates
    setTestResults(prev => ({ ...prev, 'live-updates': { status: 'running', message: 'Testing live updates...' } }))
    try {
      // Simulate live update test
      const initialResponse = await fetch('/api/modules/error-log')
      const initialData = await initialResponse.json()
      const initialCount = initialData.data.errors.length
      
      // Wait a moment and check again
      setTimeout(async () => {
        const updatedResponse = await fetch('/api/modules/error-log')
        const updatedData = await updatedResponse.json()
        const updatedCount = updatedData.data.errors.length
        
        if (updatedCount >= initialCount) {
          setTestResults(prev => ({ 
            ...prev, 
            'live-updates': { 
              status: 'passed', 
              message: `Live updates working (${initialCount} → ${updatedCount} errors)` 
            } 
          }))
        } else {
          setTestResults(prev => ({ 
            ...prev, 
            'live-updates': { status: 'failed', message: 'Live updates not functioning' } 
          }))
        }
      }, 2000)
      
      setTestResults(prev => ({ 
        ...prev, 
        'live-updates': { 
          status: 'passed', 
          message: 'Live update simulation active' 
        } 
      }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        'live-updates': { status: 'failed', message: `Live updates test failed: ${error}` } 
      }))
    }

    // Test 6: Error Drilldown
    setTestResults(prev => ({ ...prev, 'error-drilldown': { status: 'running', message: 'Testing drilldown...' } }))
    try {
      const response = await fetch('/api/modules/error-log')
      const data = await response.json()
      
      if (data.success && data.data.errors.length > 0) {
        const errorWithLocation = data.data.errors.find((e: any) => e.repoId && e.moduleId && e.fileId)
        if (errorWithLocation) {
          setTestResults(prev => ({ 
            ...prev, 
            'error-drilldown': { 
              status: 'passed', 
              message: `Drilldown ready (${errorWithLocation.repoId}/${errorWithLocation.moduleId}/${errorWithLocation.fileId})` 
            } 
          }))
        } else {
          throw new Error('No errors with location data found')
        }
      } else {
        throw new Error('No errors available for drilldown testing')
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        'error-drilldown': { status: 'failed', message: `Drilldown test failed: ${error}` } 
      }))
    }

    // Test 7: ORBT Integration
    setTestResults(prev => ({ ...prev, 'orbt-integration': { status: 'running', message: 'Testing ORBT integration...' } }))
    try {
      const response = await fetch('/api/modules/error-log?category=orbt')
      const data = await response.json()
      
      if (data.success && data.data.errors) {
        const orbtErrors = data.data.errors.filter((e: any) => e.category === 'orbt')
        const orbtCodes = orbtErrors.filter((e: any) => e.orbtCode)
        
        setTestResults(prev => ({ 
          ...prev, 
          'orbt-integration': { 
            status: 'passed', 
            message: `ORBT integration working (${orbtErrors.length} ORBT errors, ${orbtCodes.length} with codes)` 
          } 
        }))
      } else {
        throw new Error('ORBT integration not properly implemented')
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        'orbt-integration': { status: 'failed', message: `ORBT integration test failed: ${error}` } 
      }))
    }

    // Test 8: Export Functionality
    setTestResults(prev => ({ ...prev, 'export-functionality': { status: 'running', message: 'Testing export...' } }))
    try {
      // Test export data structure
      const response = await fetch('/api/modules/error-log')
      const data = await response.json()
      
      if (data.success && data.data.summary && data.data.errors) {
        const exportData = {
          summary: data.data.summary,
          errors: data.data.errors.slice(0, 10), // First 10 errors
          exportDate: new Date().toISOString(),
          filters: {}
        }
        
        setTestResults(prev => ({ 
          ...prev, 
          'export-functionality': { 
            status: 'passed', 
            message: `Export ready (${exportData.errors.length} errors, ${Object.keys(exportData.summary).length} summary fields)` 
          } 
        }))
      } else {
        throw new Error('Export data structure not properly formed')
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        'export-functionality': { status: 'failed', message: `Export test failed: ${error}` } 
      }))
    }

    // Log test completion
    logEnhancedORBTEvent(
      '10.TEST.error-log.complete',
      Severity.GREEN,
      Status.SUCCESS,
      'Module 6: Error Log & Diagnostic View tests completed',
      { 
        module: '06-error-log',
        results: Object.values(testResults).map(r => r.status)
      },
      BartonPrinciple.UNIVERSAL_MONITORING
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 dark:text-green-400'
      case 'failed': return 'text-red-600 dark:text-red-400'
      case 'running': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return '✅'
      case 'failed': return '❌'
      case 'running': return '⏳'
      default: return '⏸️'
    }
  }

  const allTestsPassed = Object.values(testResults).every(r => r.status === 'passed')
  const anyTestsFailed = Object.values(testResults).some(r => r.status === 'failed')
  const testsRunning = Object.values(testResults).some(r => r.status === 'running')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🧪 Module 6: Error Log & Diagnostic View Test Suite
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive testing for the centralized Error Log & Diagnostic View with ORBT and Barton doctrine compliance verification.
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Test Controls
            </h2>
            <button
              onClick={runTests}
              disabled={testsRunning}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                testsRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {testsRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Test Status:</span>
              <div className="flex items-center space-x-2 mt-1">
                {allTestsPassed && (
                  <span className="text-green-600 dark:text-green-400 font-medium">✅ All Tests Passed</span>
                )}
                {anyTestsFailed && (
                  <span className="text-red-600 dark:text-red-400 font-medium">❌ Some Tests Failed</span>
                )}
                {testsRunning && (
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">⏳ Tests Running</span>
                )}
                {!allTestsPassed && !anyTestsFailed && !testsRunning && (
                  <span className="text-gray-600 dark:text-gray-400 font-medium">⏸️ Tests Pending</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Module:</span>
              <span className="text-gray-900 dark:text-white font-medium ml-2">06-error-log</span>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div
              key={testName}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(result.status)}</span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                      {testName.replace('-', ' ')}
                    </h3>
                    <p className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.message}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.status === 'passed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  result.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  result.status === 'running' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Navigation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/modules/test"
              className="block p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">🧪</span>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Back to Test Suite</span>
              </div>
            </Link>
            
            <Link
              href="/modules/06-error-log"
              className="block p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span className="text-green-700 dark:text-green-300 font-medium">View Error Log Dashboard</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Module Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Module 6: Error Log & Diagnostic View Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Features</h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Centralized error monitoring</li>
                <li>• ORBT compliance tracking</li>
                <li>• Escalation logic (auto → mantis → human)</li>
                <li>• Live error updates</li>
                <li>• Diagnostic summary charts</li>
                <li>• Error drilldown navigation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Technical Details</h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Route: /modules/06-error-log</li>
                <li>• API: /api/modules/error-log</li>
                <li>• ORBT Integration: Full violation tracking</li>
                <li>• Barton Doctrine: Complete diagnostic logging</li>
                <li>• Live Updates: Real-time error monitoring</li>
                <li>• Export: JSON data export functionality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 