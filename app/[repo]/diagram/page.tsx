import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, getRepository } from '@/lib/github'
import { getVisualFiles } from '@/lib/parseVisualFiles'
import { enhanceMermaidDiagram, createStatusLegend, shouldEscalate } from '@/lib/mermaidEnhancer'
import MermaidDiagram from '@/components/MermaidDiagram'
import AltitudeMarker from '@/components/AltitudeMarker'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FixThisButton from '@/components/FixThisButton'

interface RepoDiagramProps {
  params: {
    repo: string
  }
}

export default async function RepoDiagramPage({ params }: RepoDiagramProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    const [repository, visualFiles] = await Promise.all([
      getRepository(owner, repo),
      getVisualFiles(owner, repo)
    ])

    // Enhance the Mermaid diagram with color coding
    const enhancedDiagram = enhanceMermaidDiagram(visualFiles.overviewMmd, visualFiles.issueLog)
    const statusLegend = createStatusLegend()

    // Calculate escalation statistics
    const escalatedModules = visualFiles.issueLog.filter(module => shouldEscalate(module.totalFixes))
    const totalModules = visualFiles.issueLog.length
    const healthyModules = visualFiles.issueLog.filter(module => module.totalFixes === 0).length

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-dark">
        {/* GitHub-like Header */}
        <header className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  🧠 ORPT Repo Lens
                </Link>
                <span className="text-gray-400">/</span>
                <Link href={`/${params.repo}/overview`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  {repository.name}
                </Link>
                <span className="text-gray-400">/</span>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Architecture Diagram
                </h1>
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
                  issue="performance" 
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
                { label: 'ORPT Repo Lens', href: '/' },
                { label: repository.name, href: `/${params.repo}/overview` },
                { label: 'Architecture Diagram', current: true }
              ]}
              className="mb-3"
            />
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Health Score:</span>
                <span className={`font-medium ${
                  healthyModules / totalModules > 0.8 ? 'text-green-600 dark:text-green-400' :
                  healthyModules / totalModules > 0.6 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {totalModules > 0 ? Math.round((healthyModules / totalModules) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Healthy:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">{healthyModules}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Issues:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">{totalModules - healthyModules}</span>
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
            {/* Main Diagram */}
            <div className="lg:col-span-3 space-y-6">
              {/* Altitude Marker */}
              <AltitudeMarker altitude={30000} title="Architecture Schematic" />
              
              {/* Enhanced Mermaid Diagram */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📊 Enhanced Architecture Diagram (from VISUALS/overview.mmd)
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Color-coded performance metrics and issue tracking
                  </p>
                </div>
                <div className="p-6">
                  {enhancedDiagram ? (
                    <div className="space-y-4">
                                             <MermaidDiagram chart={enhancedDiagram} />
                      
                      {/* Status Legend */}
                      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          🎨 Color Legend
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">🟩 No Issues (0 fixes)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">🟨 Warning (1 fix)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">🟧 Critical (2 fixes)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">🟥 Escalated (3+ fixes)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-lg font-medium mb-2">No diagram found</h3>
                      <p>Create a VISUALS/overview.mmd file to display the architecture diagram</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Issue Summary */}
              {visualFiles.issueLog.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      ⚠️ Issue Summary (from VISUALS/troubleshooting/issue_log.yaml)
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {visualFiles.issueLog
                      .filter(module => module.totalFixes > 0)
                      .sort((a, b) => b.totalFixes - a.totalFixes)
                      .map((module, index) => (
                        <div key={index} className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-md font-medium text-gray-900 dark:text-white">
                              {module.moduleName}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                module.totalFixes >= 3 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                module.totalFixes === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {module.totalFixes} fixes
                              </span>
                              {shouldEscalate(module.totalFixes) && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  ⚠️ Escalated
                                </span>
                              )}
                            </div>
                          </div>
                          {module.issues.length > 0 && (
                            <div className="space-y-2">
                              {module.issues.slice(0, 2).map((issue, issueIndex) => (
                                <div key={issueIndex} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                                  <div className="flex items-center space-x-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      issue.type === 'error' ? 'bg-red-500' :
                                      issue.type === 'warning' ? 'bg-yellow-500' :
                                      'bg-blue-500'
                                    }`}></span>
                                    <span>{issue.message}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {new Date(issue.timestamp).toLocaleDateString()} • {issue.fixCount} fixes applied
                                  </div>
                                </div>
                              ))}
                              {module.issues.length > 2 && (
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  +{module.issues.length - 2} more issues
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📈 Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Health Score</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {totalModules > 0 ? Math.round((healthyModules / totalModules) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          healthyModules / totalModules > 0.8 ? 'bg-green-500' :
                          healthyModules / totalModules > 0.6 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${totalModules > 0 ? (healthyModules / totalModules) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{healthyModules}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Healthy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{escalatedModules.length}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Escalated</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🚀 Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href={`/${params.repo}/overview`}
                    className="block w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📋</span>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Back to Overview</span>
                    </div>
                  </Link>
                  
                  {escalatedModules.length > 0 && (
                    <Link
                      href={`/${params.repo}/troubleshooting`}
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
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading repository diagram:', error)
    notFound()
  }
} 