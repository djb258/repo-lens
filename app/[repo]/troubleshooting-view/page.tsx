import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, getRepository } from '@/lib/github'
import { getVisualFiles } from '@/lib/parseVisualFiles'
import { shouldEscalate } from '@/lib/mermaidEnhancer'
import AltitudeMarker from '@/components/AltitudeMarker'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FixThisButton from '@/components/FixThisButton'

interface TroubleshootingViewProps {
  params: {
    repo: string
  }
}

export default async function TroubleshootingViewPage({ params }: TroubleshootingViewProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    const [repository, visualFiles] = await Promise.all([
      getRepository(owner, repo),
      getVisualFiles(owner, repo)
    ])

    // Calculate escalation statistics
    const escalatedModules = visualFiles.issueLog.filter(module => shouldEscalate(module.totalFixes))
    const totalIssues = visualFiles.issueLog.reduce((sum, module) => sum + module.issues.length, 0)
    const openIssues = visualFiles.issueLog.reduce((sum, module) => 
      sum + module.issues.filter(issue => issue.status === 'open').length, 0
    )
    const totalFixes = visualFiles.fixesLog.reduce((sum, module) => sum + module.fixes.length, 0)

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
                  Troubleshooting
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Zoom 20k - Troubleshooting
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {escalatedModules.length} escalated
                </span>
                <FixThisButton 
                  issue="systematic review" 
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
                { label: 'Troubleshooting', current: true }
              ]}
              className="mb-3"
            />
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Escalated Modules:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">{escalatedModules.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Total Issues:</span>
                <span className="text-orange-600 dark:text-orange-400 font-medium">{totalIssues}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Open Issues:</span>
                <span className="text-red-600 dark:text-red-400 font-medium">{openIssues}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Total Fixes:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">{totalFixes}</span>
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
              <AltitudeMarker altitude={20000} title="Troubleshooting Dashboard" />
              
              {/* Escalation Summary */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                      System Escalation Summary
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>
                        {escalatedModules.length} modules have been escalated to human review due to repeated fixes.
                        These modules require immediate attention and potential architectural changes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escalated Modules */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ⚠️ Escalated Modules (3+ Fixes)
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Modules requiring human intervention
                  </p>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {escalatedModules.length > 0 ? (
                    escalatedModules.map((module, index) => (
                      <div key={index} className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">🚨</span>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {module.moduleName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {module.totalFixes} fixes applied • {module.issues.length} total issues
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              ⚠️ Escalated
                            </span>
                            <Link
                              href={`/${params.repo}/module-detail-view/${encodeURIComponent(module.moduleName)}`}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                        
                        {/* Recent Issues */}
                        <div className="space-y-2">
                          {module.issues.slice(0, 3).map((issue, issueIndex) => (
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
                          {module.issues.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              +{module.issues.length - 3} more issues
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-lg font-medium mb-2">No escalated modules</h3>
                      <p>All modules are operating within normal parameters</p>
                    </div>
                  )}
                </div>
              </div>

              {/* All Issues Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📋 All Issues Summary
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visualFiles.issueLog
                    .filter(module => module.issues.length > 0)
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
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {module.issues.length} issues • {module.issues.filter(i => i.status === 'open').length} open
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Fixes Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🔧 Recent Fixes Summary
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visualFiles.fixesLog
                    .flatMap(module => module.fixes.map(fix => ({ ...fix, moduleId: module.moduleId })))
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map((fix, index) => (
                      <div key={index} className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">
                            Fix #{fix.id} - {fix.moduleId}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              fix.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {fix.success ? '✅ Success' : '❌ Failed'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {fix.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          <span>👤 {fix.appliedBy}</span>
                          <span className="mx-2">•</span>
                          <span>📅 {new Date(fix.timestamp).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>🎯 Issue #{fix.issueId}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Troubleshooting Statistics
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{escalatedModules.length}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Escalated Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalIssues}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{openIssues}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Open Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalFixes}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Fixes</div>
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
                  
                  <Link
                    href={`/${params.repo}/module-list-view`}
                    className="block w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📋</span>
                      <span className="text-purple-700 dark:text-purple-300 font-medium">View Module List</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading troubleshooting view:', error)
    notFound()
  }
} 