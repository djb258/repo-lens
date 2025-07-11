import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, getRepository } from '@/lib/github'
import { getVisualFiles } from '@/lib/parseVisualFiles'
import AltitudeMarker from '@/components/AltitudeMarker'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FixThisButton from '@/components/FixThisButton'

interface OverviewViewProps {
  params: {
    repo: string
  }
}

export default async function OverviewViewPage({ params }: OverviewViewProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    const [repository, visualFiles] = await Promise.all([
      getRepository(owner, repo),
      getVisualFiles(owner, repo)
    ])

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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {repository.name}
                </h1>
                {repository.private && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    Private
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Zoom 30k - Overview
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {visualFiles.index.length} modules
                </span>
                <FixThisButton 
                  issue="outdated docs" 
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
                { label: repository.name, current: true }
              ]}
              className="mb-3"
            />
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Owner:</span>
                <span className="text-gray-900 dark:text-white font-medium">{repository.owner.login}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">⭐</span>
                <span className="text-gray-900 dark:text-white">{repository.stargazers_count}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">🍴</span>
                <span className="text-gray-900 dark:text-white">{repository.forks_count}</span>
              </div>
              {repository.language && (
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-gray-900 dark:text-white">{repository.language}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                <span className="text-gray-900 dark:text-white">
                  {repository.updated_at ? new Date(repository.updated_at).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
            {repository.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {repository.description}
              </p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Altitude Marker */}
              <AltitudeMarker altitude={30000} title="Repository Overview" />
              
              {/* Module Index */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📋 Module Index (from VISUALS/index.yaml)
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    High-level list of modules and components
                  </p>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visualFiles.index.length > 0 ? (
                    visualFiles.index.map((module, index) => (
                      <Link 
                        key={index}
                        href={`/${params.repo}/module-detail-view/${encodeURIComponent(module.name)}`}
                        className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">
                              {module.type === 'module' ? '📦' : module.type === 'component' ? '🧩' : '📄'}
                            </span>
                            <div>
                              <span className="text-gray-900 dark:text-white font-medium">{module.name}</span>
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
                            <span className="text-blue-600 dark:text-blue-400">→</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      No modules found in VISUALS/index.yaml
                    </div>
                  )}
                </div>
              </div>

              {/* Function Documentation */}
              {visualFiles.functionDoc.overview && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      📖 Function Documentation (from VISUALS/function_doc.md)
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Plain English repository summary
                    </p>
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

              {/* Architecture Section */}
              {visualFiles.functionDoc.architecture && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      🏗️ Architecture Overview
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                        {visualFiles.functionDoc.architecture}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
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
                    href={`/${params.repo}/diagram-view`}
                    className="block w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📊</span>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">View Architecture Diagram</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Color-coded performance metrics
                    </p>
                  </Link>
                  
                  <Link
                    href={`/${params.repo}/module-list-view`}
                    className="block w-full text-left p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📋</span>
                      <span className="text-green-700 dark:text-green-300 font-medium">View Module List</span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Detailed module breakdown
                    </p>
                  </Link>
                  
                  <Link
                    href={`/${params.repo}/troubleshooting-view`}
                    className="block w-full text-left p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">⚠️</span>
                      <span className="text-red-700 dark:text-red-300 font-medium">View Issues & Fixes</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Performance and troubleshooting data
                    </p>
                  </Link>
                </div>
              </div>

              {/* Key Components */}
              {visualFiles.functionDoc.keyComponents.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🔑 Key Components
                  </h3>
                  <div className="space-y-2">
                    {visualFiles.functionDoc.keyComponents.map((component, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-blue-500">•</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{component}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {visualFiles.functionDoc.dependencies.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    📦 Dependencies
                  </h3>
                  <div className="space-y-2">
                    {visualFiles.functionDoc.dependencies.map((dep, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-green-500">•</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{dep}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading repository overview:', error)
    notFound()
  }
} 