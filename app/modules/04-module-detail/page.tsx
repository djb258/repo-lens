'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { logEnhancedORBTEvent } from '@/lib/enhanced-orbt'
import { logBartonEvent, BartonPrinciple } from '@/lib/barton'
import { Severity, Status } from '@/lib/diagnostics'

interface ModuleDetail {
  id: string
  name: string
  filename: string
  doctrineNumber: string
  description: string
  purpose: string
  structure: {
    imports: string[]
    exports: string[]
    dependencies: string[]
    components: string[]
  }
  orbtStatus: {
    operating: {
      status: 'green' | 'yellow' | 'red'
      description: string
      lastTested: Date
    }
    repair: {
      status: 'green' | 'yellow' | 'red'
      description: string
      lastModified: Date
      errorCount: number
      fixHistory: Array<{
        id: string
        date: Date
        description: string
        resolved: boolean
      }>
    }
    blueprint: {
      status: 'green' | 'yellow' | 'red'
      description: string
      blueprintId: string
      moduleNumber: string
    }
    training: {
      status: 'green' | 'yellow' | 'red'
      description: string
      usageInstructions: string
      testInstructions: string
      extensionGuide: string
    }
  }
  visualSchematic: {
    type: 'flow' | 'dependency' | 'component'
    data: any
    description: string
  }
  metadata: {
    createdAt: Date
    lastModified: Date
    author: string
    version: string
    size: number
    complexity: number
  }
  errors: Array<{
    id: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    location: string
    timestamp: Date
    resolved: boolean
  }>
}

export default function ModuleDetailPage() {
  const searchParams = useSearchParams()
  const moduleId = searchParams.get('id') || 'default'
  
  const [moduleDetail, setModuleDetail] = useState<ModuleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'orbt' | 'structure' | 'schematic' | 'errors'>('overview')

  useEffect(() => {
    const loadModuleDetail = async () => {
      try {
        setLoading(true)
        
        logEnhancedORBTEvent(
          '20.MODULE_DETAIL.load',
          Severity.GREEN,
          Status.SUCCESS,
          `Loading module detail for ${moduleId}`,
          { moduleId },
          BartonPrinciple.UNIVERSAL_MONITORING
        )

        const response = await fetch(`/api/modules/module-detail?id=${moduleId}`)
        const data = await response.json()

        if (data.success) {
          setModuleDetail(data.data)
        } else {
          throw new Error(data.error || 'Failed to load module detail')
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        logEnhancedORBTEvent(
          '20.MODULE_DETAIL.error',
          Severity.RED,
          Status.FAILED_FETCH,
          `Module detail load failed: ${errorMessage}`,
          { moduleId, error: errorMessage },
          BartonPrinciple.UNIVERSAL_MONITORING
        )
      } finally {
        setLoading(false)
      }
    }

    loadModuleDetail()
  }, [moduleId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'yellow': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'red': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'low': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !moduleDetail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Module Detail Load Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error || 'Failed to load module detail.'}
            </p>
            <Link
              href="/modules"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Modules
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
              <Link href="/modules/03-visual-architecture" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Visual Architecture
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {moduleDetail.name}
              </h1>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Module 4
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                {moduleDetail.doctrineNumber}
              </span>
              <Link
                href="/modules/06-error-log"
                className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800"
              >
                ⚠️ {moduleDetail.errors.length} Errors
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📋 Module Information
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Filename:</span>
                  <p className="text-gray-900 dark:text-white font-mono">{moduleDetail.filename}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Doctrine Number:</span>
                  <p className="text-gray-900 dark:text-white font-mono">{moduleDetail.doctrineNumber}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Version:</span>
                  <p className="text-gray-900 dark:text-white">{moduleDetail.metadata.version}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Author:</span>
                  <p className="text-gray-900 dark:text-white">{moduleDetail.metadata.author}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🎯 Purpose & Description
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Purpose:</span>
                  <p className="text-gray-900 dark:text-white">{moduleDetail.purpose}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Description:</span>
                  <p className="text-gray-900 dark:text-white">{moduleDetail.description}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📊 Metrics
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Size:</span>
                  <p className="text-gray-900 dark:text-white">{moduleDetail.metadata.size} bytes</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Complexity:</span>
                  <p className="text-gray-900 dark:text-white">{moduleDetail.metadata.complexity}/10</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <p className="text-gray-900 dark:text-white">
                    {moduleDetail.metadata.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Modified:</span>
                  <p className="text-gray-900 dark:text-white">
                    {moduleDetail.metadata.lastModified.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📋' },
                { id: 'orbt', label: 'ORBT Status', icon: '🔧' },
                { id: 'structure', label: 'Structure', icon: '🏗️' },
                { id: 'schematic', label: 'Schematic', icon: '📊' },
                { id: 'errors', label: 'Errors', icon: '⚠️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🎯 Human-Readable Overview
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {moduleDetail.purpose}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                      {moduleDetail.description}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🔗 Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={`/modules/05-file-detail?file=${moduleDetail.filename}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🔍 View File Content
                    </Link>
                    <Link
                      href="/modules/06-error-log"
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ⚠️ View Errors
                    </Link>
                    <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      🧪 Run Tests
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ORBT Status Tab */}
            {activeTab === 'orbt' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Operating */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      🔧 Operating
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(moduleDetail.orbtStatus.operating.status)}`}>
                          {moduleDetail.orbtStatus.operating.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {moduleDetail.orbtStatus.operating.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last tested: {moduleDetail.orbtStatus.operating.lastTested.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Repair */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      🔨 Repair
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(moduleDetail.orbtStatus.repair.status)}`}>
                          {moduleDetail.orbtStatus.repair.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {moduleDetail.orbtStatus.repair.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Errors: {moduleDetail.orbtStatus.repair.errorCount}
                      </p>
                    </div>
                  </div>

                  {/* Blueprint */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      📋 Blueprint
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(moduleDetail.orbtStatus.blueprint.status)}`}>
                          {moduleDetail.orbtStatus.blueprint.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {moduleDetail.orbtStatus.blueprint.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {moduleDetail.orbtStatus.blueprint.blueprintId}.{moduleDetail.orbtStatus.blueprint.moduleNumber}
                      </p>
                    </div>
                  </div>

                  {/* Training */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      📚 Training
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(moduleDetail.orbtStatus.training.status)}`}>
                          {moduleDetail.orbtStatus.training.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {moduleDetail.orbtStatus.training.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Training Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                    📖 Usage Instructions
                  </h4>
                  <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                    <div>
                      <strong>How to use:</strong>
                      <p className="mt-1">{moduleDetail.orbtStatus.training.usageInstructions}</p>
                    </div>
                    <div>
                      <strong>How to test:</strong>
                      <p className="mt-1">{moduleDetail.orbtStatus.training.testInstructions}</p>
                    </div>
                    <div>
                      <strong>How to extend:</strong>
                      <p className="mt-1">{moduleDetail.orbtStatus.training.extensionGuide}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Structure Tab */}
            {activeTab === 'structure' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      📥 Imports
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      {moduleDetail.structure.imports.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {moduleDetail.structure.imports.map((import_, index) => (
                            <li key={index} className="font-mono text-gray-700 dark:text-gray-300">
                              {import_}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No imports</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      📤 Exports
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      {moduleDetail.structure.exports.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {moduleDetail.structure.exports.map((export_, index) => (
                            <li key={index} className="font-mono text-gray-700 dark:text-gray-300">
                              {export_}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No exports</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      🔗 Dependencies
                    </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    {moduleDetail.structure.dependencies.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {moduleDetail.structure.dependencies.map((dependency, index) => (
                          <li key={index} className="font-mono text-gray-700 dark:text-gray-300">
                            {dependency}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No dependencies</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      🧩 Components
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    {moduleDetail.structure.components.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {moduleDetail.structure.components.map((component, index) => (
                          <li key={index} className="font-mono text-gray-700 dark:text-gray-300">
                            {component}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No components</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Schematic Tab */}
            {activeTab === 'schematic' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    📊 Visual Schematic
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {moduleDetail.visualSchematic.description}
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Interactive schematic for {moduleDetail.visualSchematic.type} visualization
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Schematic data: {JSON.stringify(moduleDetail.visualSchematic.data, null, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Errors Tab */}
            {activeTab === 'errors' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    ⚠️ Module Errors
                  </h4>
                  
                  {moduleDetail.errors.length > 0 ? (
                    <div className="space-y-3">
                      {moduleDetail.errors.map((error) => (
                        <div key={error.id} className="bg-red-50 dark:bg-red-900 rounded-lg p-4 border border-red-200 dark:border-red-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(error.severity)}`}>
                                  {error.severity.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {error.timestamp.toLocaleDateString()}
                                </span>
                                {error.resolved && (
                                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    RESOLVED
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900 dark:text-white mb-1">
                                {error.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {error.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <div className="flex items-center">
                        <span className="text-green-600 dark:text-green-400 text-2xl mr-3">✅</span>
                        <div>
                          <p className="text-green-800 dark:text-green-200 font-medium">
                            No errors found
                          </p>
                          <p className="text-green-600 dark:text-green-300 text-sm">
                            This module is operating without any issues.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 