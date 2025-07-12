'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export default function VisualArchitecturePage() {
  const router = useRouter()
  const [architectureData, setArchitectureData] = useState<ArchitectureData | null>(null)
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const loadArchitectureData = async () => {
      try {
        setLoading(true)
        
        logEnhancedORBTEvent(
          '20.ARCHITECTURE.load',
          Severity.GREEN,
          Status.SUCCESS,
          'Loading visual architecture data',
          {},
          BartonPrinciple.UNIVERSAL_MONITORING
        )

        const response = await fetch('/api/modules/visual-architecture')
        const data = await response.json()

        if (data.success) {
          setArchitectureData(data.data)
        } else {
          throw new Error(data.error || 'Failed to load architecture data')
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        
        logEnhancedORBTEvent(
          '20.ARCHITECTURE.error',
          Severity.RED,
          Status.FAILED_FETCH,
          `Architecture load failed: ${errorMessage}`,
          { error: errorMessage },
          BartonPrinciple.UNIVERSAL_MONITORING
        )
      } finally {
        setLoading(false)
      }
    }

    loadArchitectureData()
  }, [])

  const handleNodeClick = (node: ArchitectureNode) => {
    if (!node.clickable) return

    setSelectedNode(node)
    
    logBartonEvent(
      BartonPrinciple.UNIVERSAL_MONITORING,
      '20.ARCHITECTURE.node.click',
      Severity.GREEN,
      Status.SUCCESS,
      `Architecture node clicked: ${node.label}`,
      { nodeId: node.id, doctrineNumber: node.doctrineNumber }
    )

    // Navigate to module detail if route exists
    if (node.route) {
      router.push(node.route)
    }
  }

  const getNodeColor = (node: ArchitectureNode) => {
    switch (node.color) {
      case 'green': return 'fill-green-500 stroke-green-700'
      case 'yellow': return 'fill-yellow-500 stroke-yellow-700'
      case 'red': return 'fill-red-500 stroke-red-700'
      default: return 'fill-gray-500 stroke-gray-700'
    }
  }

  const getNodeTextColor = (node: ArchitectureNode) => {
    switch (node.color) {
      case 'green': return 'text-green-900'
      case 'yellow': return 'text-yellow-900'
      case 'red': return 'text-red-900'
      default: return 'text-gray-900'
    }
  }

  const getOrbtStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-green-600'
      case 'yellow': return 'text-yellow-600'
      case 'red': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5))

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

  if (error || !architectureData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Architecture Load Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error || 'Failed to load visual architecture data.'}
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Visual Architecture
              </h1>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Module 3
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  🔍-
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  🔍+
                </button>
              </div>
              <Link
                href="/modules/06-error-log"
                className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800"
              >
                ⚠️ {architectureData.metadata.totalErrors} Errors
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Architecture Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Repository:</span>
              <p className="text-gray-900 dark:text-white font-medium">{architectureData.metadata.repoId}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Modules:</span>
              <p className="text-gray-900 dark:text-white font-medium">{architectureData.metadata.totalModules}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">ORBT Compliance:</span>
              <p className="text-gray-900 dark:text-white font-medium">{architectureData.metadata.orbtCompliance}%</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
              <p className="text-gray-900 dark:text-white font-medium">
                {architectureData.metadata.lastUpdated.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Architecture Diagram */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              📊 Application Architecture
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Operating</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Review</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Error</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div 
              className="relative"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center',
                minHeight: '600px',
                padding: '40px'
              }}
            >
              {/* SVG Architecture Diagram */}
              <svg
                width="100%"
                height="600"
                viewBox="0 0 1200 600"
                className="w-full h-full"
              >
                {/* Background Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Render Nodes */}
                {architectureData.nodes.map((node) => (
                  <g key={node.id}>
                    {/* Node Background */}
                    <rect
                      x={node.position.x}
                      y={node.position.y}
                      width={node.size.width}
                      height={node.size.height}
                      rx="8"
                      className={`${getNodeColor(node)} cursor-pointer transition-all duration-200 hover:opacity-80`}
                      onClick={() => handleNodeClick(node)}
                    />
                    
                    {/* Node Label */}
                    <text
                      x={node.position.x + node.size.width / 2}
                      y={node.position.y + 20}
                      textAnchor="middle"
                      className={`text-sm font-medium ${getNodeTextColor(node)} pointer-events-none`}
                    >
                      {node.label}
                    </text>
                    
                    {/* Doctrine Number */}
                    <text
                      x={node.position.x + node.size.width / 2}
                      y={node.position.y + 35}
                      textAnchor="middle"
                      className="text-xs text-gray-600 dark:text-gray-400 pointer-events-none"
                    >
                      {node.doctrineNumber}
                    </text>
                    
                    {/* Error Count Badge */}
                    {node.errorCount > 0 && (
                      <circle
                        cx={node.position.x + node.size.width - 10}
                        cy={node.position.y + 10}
                        r="8"
                        className="fill-red-500 stroke-white stroke-2"
                      />
                    )}
                    
                    {/* Click Indicator */}
                    {node.clickable && (
                      <text
                        x={node.position.x + node.size.width / 2}
                        y={node.position.y + node.size.height - 5}
                        textAnchor="middle"
                        className="text-xs text-blue-600 dark:text-blue-400 pointer-events-none"
                      >
                        Click to view
                      </text>
                    )}
                  </g>
                ))}

                {/* Render Edges */}
                {architectureData.edges.map((edge) => {
                  const sourceNode = architectureData.nodes.find(n => n.id === edge.source)
                  const targetNode = architectureData.nodes.find(n => n.id === edge.target)
                  
                  if (!sourceNode || !targetNode) return null
                  
                  const startX = sourceNode.position.x + sourceNode.size.width / 2
                  const startY = sourceNode.position.y + sourceNode.size.height / 2
                  const endX = targetNode.position.x + targetNode.size.width / 2
                  const endY = targetNode.position.y + targetNode.size.height / 2
                  
                  return (
                    <g key={edge.id}>
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#6b7280"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                      {edge.label && (
                        <text
                          x={(startX + endX) / 2}
                          y={(startY + endY) / 2 - 5}
                          textAnchor="middle"
                          className="text-xs text-gray-600 dark:text-gray-400 pointer-events-none"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Arrow Marker */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Node Details Panel */}
        {selectedNode && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📋 {selectedNode.label} Details
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Module Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="text-gray-900 dark:text-white ml-2 capitalize">{selectedNode.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Doctrine Number:</span>
                    <span className="text-gray-900 dark:text-white ml-2 font-mono">{selectedNode.doctrineNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Error Count:</span>
                    <span className={`ml-2 font-medium ${
                      selectedNode.errorCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {selectedNode.errorCount}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedNode.description}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">ORBT Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Operating:</span>
                    <span className={`font-medium ${getOrbtStatusColor(selectedNode.orbtStatus.operating)}`}>
                      {selectedNode.orbtStatus.operating.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Repair:</span>
                    <span className={`font-medium ${getOrbtStatusColor(selectedNode.orbtStatus.repair)}`}>
                      {selectedNode.orbtStatus.repair.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Blueprint:</span>
                    <span className={`font-medium ${getOrbtStatusColor(selectedNode.orbtStatus.blueprint)}`}>
                      {selectedNode.orbtStatus.blueprint.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Training:</span>
                    <span className={`font-medium ${getOrbtStatusColor(selectedNode.orbtStatus.training)}`}>
                      {selectedNode.orbtStatus.training.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {selectedNode.clickable && selectedNode.route && (
                  <div className="mt-4">
                    <Link
                      href={selectedNode.route}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      🔍 View Module Details
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 