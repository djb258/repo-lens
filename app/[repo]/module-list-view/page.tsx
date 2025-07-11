import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, getRepository } from '@/lib/github'
import { getVisualFiles } from '@/lib/parseVisualFiles'
import { shouldEscalate } from '@/lib/mermaidEnhancer'
import AltitudeMarker from '@/components/AltitudeMarker'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FixThisButton from '@/components/FixThisButton'

interface ModuleListViewProps {
  params: {
    repo: string
  }
}

export default async function ModuleListViewPage({ params }: ModuleListViewProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    const [repository, visualFiles] = await Promise.all([
      getRepository(owner, repo),
      getVisualFiles(owner, repo)
    ])

    // Calculate module statistics
    const moduleStats = visualFiles.index.map(module => {
      const moduleIssues = visualFiles.issueLog.find(m => m.moduleName === module.name)
      const moduleFixes = visualFiles.fixesLog.find(m => m.moduleId === module.name)
      const fixCount = moduleIssues?.totalFixes || 0
      const isEscalated = shouldEscalate(fixCount)
      
      return {
        ...module,
        fixCount,
        isEscalated,
        issueCount: moduleIssues?.issues.length || 0,
        openIssues: moduleIssues?.issues.filter(i => i.status === 'open').length || 0,
        lastUpdated: moduleIssues?.lastUpdated || null
      }
    })

    const escalatedModules = moduleStats.filter(m => m.isEscalated)
    const healthyModules = moduleStats.filter(m => m.fixCount === 0)
    const totalModules = moduleStats.length

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-dark">
        {/* GitHub-like Header */}
        <header className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/index-view" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  🧠 ORPT Repo Lens
                </Link>
                <span className="text-gray-400">/</span>
                <Link href={`/${params.repo}/overview-view`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  {repository.name}
                </Link>
                <span className="text-gray-400">/</span>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Module List
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Zoom 20k - Module List
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {totalModules} modules
                </span>
                {escalatedModules.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    ⚠️ {escalatedModules.length} escalated
                  </span>
                )}
                <FixThisButton 
                  issue="module analysis" 
                  repoName={repository.name}
                  className="ml-2"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Repository Info Bar */}
        <div className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <BreadcrumbNav 
              items={[
                { label: 'ORPT Repo Lens', href: '/index-view' },
                { label: repository.name, href: `/${params.repo}/overview-view` },
                { label: 'Module List', current: true }
              ]}
              className="mb-3"
            />
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Health Score:</span>
                <span className={`font-medium ${
                  healthyModules.length / totalModules > 0.8 ? 'text-green-600 dark:text-green-400' :
                  healthyModules.length / totalModules > 0.6 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {totalModules > 0 ? Math.round((healthyModules.length / totalModules) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Healthy:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">{healthyModules.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Issues:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">{totalModules - healthyModules.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Escalated:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">{escalatedModules.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Altitude Marker */}
              <AltitudeMarker altitude={20000} title="Module List View" />
              
              {/* Module Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Module Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalModules}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{healthyModules.length}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Healthy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {moduleStats.filter(m => m.fixCount === 1).length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{escalatedModules.length}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Escalated</div>
                  </div>
                </div>
              </div>

              {/* Module List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📋 Detailed Module List
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Comprehensive breakdown of all modules with status and metrics
                  </p>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {moduleStats.map((module, index) => (
                    <div key={index} className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {module.type === 'module' ? '📦' : module.type === 'component' ? '🧩' : '📄'}
                          </span>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{module.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            module.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            module.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {module.priority}
                          </span>
                          {module.isEscalated && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              ⚠️ Escalated
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Module Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            module.fixCount === 0 ? 'text-green-600 dark:text-green-400' :
                            module.fixCount === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                            module.fixCount === 2 ? 'text-orange-600 dark:text-orange-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {module.fixCount}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Fixes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{module.issueCount}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Total Issues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{module.openIssues}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Open Issues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                            {module.lastUpdated ? new Date(module.lastUpdated).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Last Updated</div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/${params.repo}/module-detail-view/${encodeURIComponent(module.name)}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                          <span className="mr-1">🔍</span>
                          View Details
                        </Link>
                        
                        {module.isEscalated && (
                          <Link
                            href={`/${params.repo}/troubleshooting-view`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <span className="mr-1">⚠️</span>
                            Review Issues
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🚀 Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href={`/${params.repo}/overview-view`}
                    className="block w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📋</span>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Back to Overview</span>
                    </div>
                  </Link>
                  
                  <Link
                    href={`/${params.repo}/diagram-view`}
                    className="block w-full text-left p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📊</span>
                      <span className="text-green-700 dark:text-green-300 font-medium">View Diagram</span>
                    </div>
                  </Link>
                  
                  {escalatedModules.length > 0 && (
                    <Link
                      href={`/${params.repo}/troubleshooting-view`}
                      className="block w-full text-left p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">⚠️</span>
                        <span className="text-red-700 dark:text-red-300 font-medium">View Escalated Issues</span>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {escalatedModules.length} modules need attention
                      </p>
                    </Link>
                  )}
                </div>
              </div>

              {/* Module Types */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📦 Module Types
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Modules</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {moduleStats.filter(m => m.type === 'module').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Components</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {moduleStats.filter(m => m.type === 'component').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Files</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {moduleStats.filter(m => m.type === 'file').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading module list:', error)
    notFound()
  }
} 