import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, getRepository, getFileContent } from '@/lib/github'
import { getVisualFiles } from '@/lib/parseVisualFiles'
import { shouldEscalate } from '@/lib/mermaidEnhancer'
import AltitudeMarker from '@/components/AltitudeMarker'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FixThisButton from '@/components/FixThisButton'
import InlineComment from '@/components/InlineComment'

interface ModuleDetailProps {
  params: {
    repo: string
    moduleId: string
  }
}

export default async function ModuleDetailPage({ params }: ModuleDetailProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    const moduleId = decodeURIComponent(params.moduleId)
    
    const [repository, visualFiles] = await Promise.all([
      getRepository(owner, repo),
      getVisualFiles(owner, repo)
    ])

    // Find the specific module
    const module = visualFiles.index.find(m => m.name === moduleId)
    const moduleIssues = visualFiles.issueLog.find(m => m.moduleName === moduleId)
    const moduleFixes = visualFiles.fixesLog.find(m => m.moduleId === moduleId)

    if (!module) {
      notFound()
    }

    const fixCount = moduleIssues?.totalFixes || 0
    const isEscalated = shouldEscalate(fixCount)

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
                  {moduleId}
                </h1>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {module.type}
                </span>
                {isEscalated && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    ⚠️ Escalated to Human
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {fixCount} fixes
                </span>
                <FixThisButton 
                  issue="code quality" 
                  repoName={repository.name}
                  filePath={module.path}
                  className="ml-2"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Module Info Bar */}
        <div className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <BreadcrumbNav 
              items={[
                { label: 'ORPT Repo Lens', href: '/' },
                { label: repository.name, href: `/${params.repo}/overview` },
                { label: moduleId, current: true }
              ]}
              className="mb-3"
            />
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Module:</span>
                <span className="text-gray-900 dark:text-white font-medium">{moduleId}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="text-gray-900 dark:text-white font-medium">{module.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                <span className={`font-medium ${
                  module.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                  module.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {module.priority}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Fixes:</span>
                <span className={`font-medium ${
                  fixCount >= 3 ? 'text-red-600 dark:text-red-400' :
                  fixCount === 2 ? 'text-orange-600 dark:text-orange-400' :
                  fixCount === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {fixCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Altitude Marker */}
              <AltitudeMarker altitude={20000} title="Module Detail View" />
              
              {/* Escalation Warning */}
              {isEscalated && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                        Module Escalated to Human Review
                      </h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        <p>
                          This module has {fixCount} fixes applied and requires human intervention.
                          Consider architectural review or refactoring.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Module Description */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📖 Module Description
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300">
                    {module.description}
                  </p>
                  <InlineComment 
                    placeholder="Add notes about this module..."
                    className="mt-4"
                  />
                </div>
              </div>

              {/* Function Summary */}
              {visualFiles.functionDoc.overview && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      📋 Function Summary (from VISUALS/function_doc.md)
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                        {visualFiles.functionDoc.overview}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Issues Log */}
              {moduleIssues && moduleIssues.issues.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      ⚠️ Issues Log (from VISUALS/troubleshooting/issue_log.yaml)
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {moduleIssues.issues.map((issue, index) => (
                      <div key={index} className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">
                            Issue #{issue.id}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              issue.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              issue.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {issue.type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              issue.status === 'escalated' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              issue.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {issue.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {issue.message}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span>📅 {new Date(issue.timestamp).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>🔧 {issue.fixCount} fixes applied</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fixes Log */}
              {moduleFixes && moduleFixes.fixes.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      🔧 Fixes Log (from VISUALS/training/fixes.yaml)
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {moduleFixes.fixes.map((fix, index) => (
                      <div key={index} className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">
                            Fix #{fix.id}
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
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {fix.description}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span>👤 {fix.appliedBy}</span>
                          <span className="mx-2">•</span>
                          <span>📅 {new Date(fix.timestamp).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>🎯 Issue #{fix.issueId}</span>
                        </div>
                        {fix.notes && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <strong>Notes:</strong> {fix.notes}
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
              {/* Module Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Module Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Health Status</span>
                    <span className={`text-sm font-medium ${
                      fixCount === 0 ? 'text-green-600 dark:text-green-400' :
                      fixCount === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                      fixCount === 2 ? 'text-orange-600 dark:text-orange-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {fixCount === 0 ? 'Healthy' :
                       fixCount === 1 ? 'Warning' :
                       fixCount === 2 ? 'Critical' :
                       'Escalated'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Fixes</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{fixCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Open Issues</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {moduleIssues?.issues.filter(i => i.status === 'open').length || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Priority</span>
                    <span className={`text-sm font-medium ${
                      module.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                      module.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {module.priority}
                    </span>
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
                  
                  <Link
                    href={`/${params.repo}/diagram`}
                    className="block w-full text-left p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📊</span>
                      <span className="text-green-700 dark:text-green-300 font-medium">View Diagram</span>
                    </div>
                  </Link>
                  
                  {isEscalated && (
                    <div className="block w-full text-left p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">⚠️</span>
                        <span className="text-red-700 dark:text-red-300 font-medium">Human Review Required</span>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        This module needs immediate attention
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading module detail:', error)
    notFound()
  }
} 