import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, getRepository } from '@/lib/github'
import AltitudeMarker from '@/components/AltitudeMarker'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import FixThisButton from '@/components/FixThisButton'
import { DiagnosticMapProvider, useDiagnosticMap } from '@/components/DiagnosticMapProvider'
import { getAllUDNS, getUDNSColor } from '@/lib/orbt'

interface OverviewViewProps {
  params: {
    repo: string
  }
}

export default async function OverviewViewPage({ params }: OverviewViewProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    
    // Validate repository name
    if (owner === 'unknown' || repo === 'unknown') {
      throw new Error(`Invalid repository format: ${params.repo}. Expected format: owner/repo`)
    }
    
    // Try to get repository data, but handle missing token gracefully
    let repository: any = null
    try {
      repository = await getRepository(owner, repo)
    } catch (error: any) {
      // If GitHub token is missing, create a placeholder repository object
      if (error.message.includes('GitHub token is required') || error.message.includes('Failed to fetch repository')) {
        console.warn('GitHub token missing - using placeholder repository data')
        repository = {
          id: 0,
          name: repo,
          full_name: `${owner}/${repo}`,
          description: 'Repository data unavailable - GitHub token required',
          private: false,
          html_url: `https://github.com/${owner}/${repo}`,
          updated_at: null,
          language: null,
          stargazers_count: 0,
          forks_count: 0,
          owner: {
            login: owner,
            avatar_url: 'https://github.com/github.png'
          }
        }
      } else {
        // Re-throw other errors
        throw error
      }
    }
    
    // Create a simple visualFiles object for now
    const visualFiles = {
      index: [],
      functionDoc: {
        overview: '',
        architecture: '',
        keyComponents: [],
        dependencies: [],
        deployment: '',
        troubleshooting: ''
      },
      overviewMmd: '',
      issueLog: [],
      fixesLog: []
    }

    // Wrap the page in DiagnosticMapProvider
    return (
      <DiagnosticMapProvider owner={owner} repo={repo}>
        <OverviewViewContent params={params} owner={owner} repo={repo} repository={repository} visualFiles={visualFiles} />
      </DiagnosticMapProvider>
    )
  } catch (err) {
    console.error('Error loading repository overview:', err)
    
    // Check if it's a repository name parsing error
    const isRepoNameError = err instanceof Error && 
      (err.message.includes('Invalid repository name format') ||
       err.message.includes('Invalid repository format'))
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-dark">
        {/* Header */}
        <header className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/index-view" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  🧠 ORPT Repo Lens
                </Link>
                <span className="text-gray-400">/</span>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Repository Overview
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Zoom 30k - Overview
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            {isRepoNameError ? (
              <>
                <div className="text-red-400 text-6xl mb-4">🔗</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Invalid Repository URL
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The repository URL format is invalid.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    <strong>Expected format:</strong> <code className="bg-red-100 dark:bg-red-800 px-1 rounded">owner/repo</code>
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-2">
                    <strong>Received:</strong> <code className="bg-red-100 dark:bg-red-800 px-1 rounded">{params.repo}</code>
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href="/index-view"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ← Back to Repository Index
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Error loading repository
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {err instanceof Error ? err.message : 'An unexpected error occurred'}
                </p>
                <div className="mt-6">
                  <Link
                    href="/index-view"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ← Back to Repository Index
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    )
  }
}

function OverviewViewContent({ params, owner, repo, repository, visualFiles }: any) {
  const { diagnosticMap, loading, error } = useDiagnosticMap()
  // Compute repo-level ORBT status
  let status: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN'
  if (diagnosticMap) {
    const all = getAllUDNS(diagnosticMap)
    if (all.some(udns => getUDNSColor(diagnosticMap, udns) === 'RED')) status = 'RED'
    else if (all.some(udns => getUDNSColor(diagnosticMap, udns) === 'YELLOW')) status = 'YELLOW'
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-github-dark">
      {/* ORBT Status Bar */}
      <div className={`w-full py-2 px-4 text-center font-semibold ${
        status === 'RED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
        status === 'YELLOW' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      }`}>
        ORBT Status: {status}
      </div>
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
          
          {/* GitHub Token Notice */}
          {repository.description === 'Repository data unavailable - GitHub token required' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                <div>
                  <h4 className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                    Limited Functionality
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
                    GitHub token is missing. Repository data is limited. To see full repository information, add your GitHub Personal Access Token to the environment variables.
                  </p>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    <strong>Setup:</strong> Add GITHUB_TOKEN to your environment variables or Vercel settings.
                  </div>
                </div>
              </div>
            </div>
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
                  visualFiles.index.map((module: any, index: number) => (
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
                    <div className="text-4xl mb-2">📁</div>
                    <h3 className="text-md font-medium mb-1">No VISUALS folder found</h3>
                    <p className="text-sm">This repository doesn't have ORPT documentation yet.</p>
                    <div className="mt-4 text-xs text-gray-400">
                      <p>To add ORPT documentation, create a <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/VISUALS</code> folder with:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">index.yaml</code> - Module index</li>
                        <li>• <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">function_doc.md</code> - Documentation</li>
                        <li>• <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">overview.mmd</code> - Mermaid diagram</li>
                      </ul>
                    </div>
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
                  {visualFiles.functionDoc.keyComponents.map((component: string, index: number) => (
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
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visualFiles.functionDoc.dependencies.map((dep: any, index: number) => (
                    <div key={index} className="p-6">
                      <span className="text-gray-900 dark:text-white font-medium">{dep.name}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{dep.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Components */}
            {visualFiles.functionDoc.components.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🧩 Components
                </h3>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visualFiles.functionDoc.components.map((component: any, index: number) => (
                    <div key={index} className="p-6">
                      <span className="text-gray-900 dark:text-white font-medium">{component.name}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{component.description}</p>
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
} 