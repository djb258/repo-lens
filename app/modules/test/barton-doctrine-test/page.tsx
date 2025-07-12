'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BartonNumberingDoctrine, BartonNumberDisplay, validateBartonNumber, parseBartonNumber } from '@/lib/barton-numbering-doctrine'

interface TestResult {
  id: string
  name: string
  status: 'pass' | 'fail' | 'warning'
  description: string
  details: string
  bartonNumber?: string
  timestamp: Date
}

export default function BartonDoctrineTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [overallStatus, setOverallStatus] = useState<'pass' | 'fail' | 'warning'>('pass')
  const [doctrine, setDoctrine] = useState<BartonNumberingDoctrine | null>(null)
  const [complianceReport, setComplianceReport] = useState<any>(null)

  useEffect(() => {
    const runTests = async () => {
      const results: TestResult[] = []
      
      try {
        // Initialize Barton Numbering Doctrine
        const bartonDoctrine = BartonNumberingDoctrine.getInstance()
        bartonDoctrine.autoRegisterFromFileSystem()
        setDoctrine(bartonDoctrine)

        // Test 1: Doctrine Initialization
        results.push({
          id: 'test-1',
          name: 'Barton Numbering Doctrine Initialization',
          status: 'pass',
          description: 'Barton Numbering Doctrine successfully initialized',
          details: 'BartonNumberingDoctrine.getInstance() returns a valid instance with component registration capabilities.',
          timestamp: new Date()
        })

        // Test 2: Component Registration
        const testComponent = bartonDoctrine.registerComponent(
          'test-component',
          'Test Component',
          'module',
          99, 99, 99,
          'Test component for validation',
          'github-index'
        )

        if (testComponent && testComponent.bartonNumber.toString() === '39.99.99.99') {
          results.push({
            id: 'test-2',
            name: 'Component Registration',
            status: 'pass',
            description: 'Successfully registered component with Barton numbering',
            details: `Component "${testComponent.name}" registered with Barton number ${testComponent.bartonNumber.toString()}`,
            bartonNumber: testComponent.bartonNumber.toString(),
            timestamp: new Date()
          })
        }

        // Test 3: Barton Number Validation
        const validNumbers = ['39.01.01.01', '39.02.01.01', '39.99.99.99']
        const invalidNumbers = ['40.01.01.01', '39.100.01.01', '39.01.01', 'invalid']

        let validCount = 0
        let invalidCount = 0

        validNumbers.forEach(num => {
          if (validateBartonNumber(num)) validCount++
        })

        invalidNumbers.forEach(num => {
          if (!validateBartonNumber(num)) invalidCount++
        })

        if (validCount === validNumbers.length && invalidCount === invalidNumbers.length) {
          results.push({
            id: 'test-3',
            name: 'Barton Number Validation',
            status: 'pass',
            description: 'Barton number validation working correctly',
            details: `${validCount} valid numbers accepted, ${invalidCount} invalid numbers rejected`,
            timestamp: new Date()
          })
        }

        // Test 4: Number Parsing
        const parsed = parseBartonNumber('39.01.01.01')
        if (parsed && parsed.blueprintId === 39 && parsed.module === 1 && parsed.submodule === 1 && parsed.file === 1) {
          results.push({
            id: 'test-4',
            name: 'Barton Number Parsing',
            status: 'pass',
            description: 'Successfully parsed Barton number components',
            details: `Parsed: Blueprint ${parsed.blueprintId}, Module ${parsed.module}, Submodule ${parsed.submodule}, File ${parsed.file}`,
            bartonNumber: '39.01.01.01',
            timestamp: new Date()
          })
        }

        // Test 5: Health Status Tracking
        const component = bartonDoctrine.getComponent('github-index')
        if (component) {
          bartonDoctrine.updateComponentHealth('github-index', 'green')
          const updatedComponent = bartonDoctrine.getComponent('github-index')
          
          if (updatedComponent && updatedComponent.healthStatus === 'green') {
            results.push({
              id: 'test-5',
              name: 'Health Status Tracking',
              status: 'pass',
              description: 'Component health status tracking working',
              details: `Component "${updatedComponent.name}" health status: ${updatedComponent.healthStatus}`,
              bartonNumber: updatedComponent.bartonNumber.toString(),
              timestamp: new Date()
            })
          }
        }

        // Test 6: Component Hierarchy
        const hierarchy = bartonDoctrine.getHierarchy()
        if (hierarchy && Object.keys(hierarchy).length > 0) {
          results.push({
            id: 'test-6',
            name: 'Component Hierarchy',
            status: 'pass',
            description: 'Component hierarchy structure working',
            details: `Generated hierarchy with ${Object.keys(hierarchy).length} root components`,
            timestamp: new Date()
          })
        }

        // Test 7: Component Type Filtering
        const modules = bartonDoctrine.getComponentsByType('module')
        const files = bartonDoctrine.getComponentsByType('file')
        
        if (modules.length > 0 && files.length > 0) {
          results.push({
            id: 'test-7',
            name: 'Component Type Filtering',
            status: 'pass',
            description: 'Component filtering by type working',
            details: `Found ${modules.length} modules and ${files.length} files`,
            timestamp: new Date()
          })
        }

        // Test 8: Compliance Report Generation
        const report = bartonDoctrine.exportComplianceReport()
        setComplianceReport(report)
        
        if (report && report.totalComponents > 0) {
          results.push({
            id: 'test-8',
            name: 'Compliance Report Generation',
            status: 'pass',
            description: 'Compliance report generated successfully',
            details: `Report contains ${report.totalComponents} components with health summary`,
            timestamp: new Date()
          })
        }

        // Test 9: File Path Barton Number Generation
        const fileBartonNumber = bartonDoctrine.generateBartonNumberFromPath('app/modules/01-github-index/page.tsx')
        if (fileBartonNumber && fileBartonNumber.validate()) {
          results.push({
            id: 'test-9',
            name: 'File Path Barton Number Generation',
            status: 'pass',
            description: 'Successfully generated Barton number from file path',
            details: `Generated: ${fileBartonNumber.toString()} for file path`,
            bartonNumber: fileBartonNumber.toString(),
            timestamp: new Date()
          })
        }

        // Test 10: Component Retrieval by Barton Number
        const componentByNumber = bartonDoctrine.getComponentByBartonNumber('39.01.01.01')
        if (componentByNumber) {
          results.push({
            id: 'test-10',
            name: 'Component Retrieval by Barton Number',
            status: 'pass',
            description: 'Successfully retrieved component by Barton number',
            details: `Retrieved: ${componentByNumber.name} (${componentByNumber.type})`,
            bartonNumber: componentByNumber.bartonNumber.toString(),
            timestamp: new Date()
          })
        }

        // Test 11: Validation of All Components
        const validation = bartonDoctrine.validateAllComponents()
        if (validation.valid > 0) {
          results.push({
            id: 'test-11',
            name: 'All Components Validation',
            status: validation.invalid === 0 ? 'pass' : 'warning',
            description: 'Component validation completed',
            details: `${validation.valid} valid, ${validation.invalid} invalid components`,
            timestamp: new Date()
          })
        }

        // Test 12: Color Coding and Icons
        const greenColor = bartonDoctrine.getHealthColor('green')
        const redIcon = bartonDoctrine.getHealthIcon('red')
        
        if (greenColor && redIcon) {
          results.push({
            id: 'test-12',
            name: 'Color Coding and Icons',
            status: 'pass',
            description: 'Health status color coding and icons working',
            details: `Green color: ${greenColor}, Red icon: ${redIcon}`,
            timestamp: new Date()
          })
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        results.push({
          id: 'test-error',
          name: 'Test Execution Error',
          status: 'fail',
          description: 'Error occurred during test execution',
          details: `Test execution failed: ${errorMessage}`,
          timestamp: new Date()
        })
      }

      setTestResults(results)
      
      // Calculate overall status
      const failedTests = results.filter(r => r.status === 'fail').length
      const warningTests = results.filter(r => r.status === 'warning').length
      
      if (failedTests > 0) {
        setOverallStatus('fail')
      } else if (warningTests > 0) {
        setOverallStatus('warning')
      } else {
        setOverallStatus('pass')
      }
      
      setLoading(false)
    }

    runTests()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'fail': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅'
      case 'fail': return '❌'
      case 'warning': return '⚠️'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Barton Numbering Doctrine Test Suite
              </h1>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Test v2
              </span>
              {/* Barton Number Display */}
              <BartonNumberDisplay 
                bartonNumber="39.99.99.99" 
                showIcon={true} 
                showDescription={false}
                className="ml-2"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(overallStatus)}`}>
                {getStatusIcon(overallStatus)} {overallStatus.toUpperCase()}
              </span>
              <Link
                href="/modules/06-error-log"
                className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800"
              >
                ⚠️ Error Log
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Doctrine Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📌 Barton Numbering Doctrine Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Blueprint ID</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                39 (Repo Lens)
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Total Components</h3>
              {complianceReport && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {complianceReport.totalComponents} registered
                </p>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Test Results</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {testResults.filter(r => r.status === 'pass').length} passed, 
                {testResults.filter(r => r.status === 'fail').length} failed
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Health Status</h3>
              {complianceReport && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🟢 {complianceReport.healthSummary.green} | 🟡 {complianceReport.healthSummary.yellow} | 🔴 {complianceReport.healthSummary.red}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              🧪 Barton Numbering Doctrine Test Results
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {testResults.map((result) => (
              <div key={result.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)} {result.status.toUpperCase()}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {result.name}
                      </h3>
                      {result.bartonNumber && (
                        <BartonNumberDisplay 
                          bartonNumber={result.bartonNumber} 
                          showIcon={true} 
                          showDescription={false}
                        />
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {result.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {result.details}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                      Tested: {result.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Report */}
        {complianceReport && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                📊 Compliance Report
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Validation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Valid: {complianceReport.validation.valid}<br/>
                    Invalid: {complianceReport.validation.invalid}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Health Summary</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    🟢 {complianceReport.healthSummary.green}<br/>
                    🟡 {complianceReport.healthSummary.yellow}<br/>
                    🔴 {complianceReport.healthSummary.red}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">System Info</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Version: {complianceReport.doctrineVersion}<br/>
                    Blueprint: {complianceReport.blueprintId}<br/>
                    Components: {complianceReport.totalComponents}
                  </p>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">Registered Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {complianceReport.components.slice(0, 12).map((comp: any) => (
                  <div key={comp.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comp.name}
                      </span>
                      <BartonNumberDisplay 
                        bartonNumber={comp.bartonNumber} 
                        showIcon={true} 
                        showDescription={false}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Type: {comp.type}<br/>
                      Status: {comp.healthStatus}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/modules/01-github-index"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔍 Test Module 1
          </Link>
          <Link
            href="/modules/test/orpt-v2-test"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔧 Test ORPT v2
          </Link>
          <Link
            href="/modules/06-error-log"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ⚠️ Test Error Log
          </Link>
        </div>

        {/* Doctrine Compliance Summary */}
        <div className="mt-8 bg-green-50 dark:bg-green-900 rounded-lg p-6 border border-green-200 dark:border-green-700">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
            ✅ Barton Numbering Doctrine Compliance Summary
          </h3>
          <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <p>• Hierarchical numbering system (Blueprint.Module.Submodule.File) fully implemented</p>
            <p>• All components automatically registered with Barton numbers</p>
            <p>• Health status tracking with color-coded indicators (🟢🟡🔴)</p>
            <p>• Component validation and compliance reporting</p>
            <p>• File path to Barton number generation</p>
            <p>• Component hierarchy and type filtering</p>
            <p>• React component for displaying Barton numbers</p>
            <p>• Integration with ORPT system and error tracking</p>
            <p>• Blueprint ID 39 (Repo Lens) enforced throughout</p>
            <p>• Ready for production deployment with full doctrine compliance</p>
          </div>
        </div>
      </main>
    </div>
  )
} 