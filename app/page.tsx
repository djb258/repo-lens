import { getRepositories, Repository } from '@/lib/github'
import RepoCard from '@/components/RepoCard'

export default async function HomePage() {
  let repositories: Repository[] = []
  let error: string | null = null

  try {
    repositories = await getRepositories()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch repositories'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Repo Lens
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Your GitHub Repository Browser
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                Configuration Required
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </p>
              <div className="mt-4 text-left">
                <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                  To use Repo Lens, you need to:
                </p>
                <ol className="text-red-700 dark:text-red-300 text-sm list-decimal list-inside space-y-1">
                  <li>Create a GitHub Personal Access Token</li>
                  <li>Add it to your <code className="bg-red-100 dark:bg-red-800 px-1 rounded">.env.local</code> file</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-github-dark">
      {/* GitHub-like Header */}
      <header className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                🧠 ORPT Repo Lens Viewer
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Operational Repository Performance Tracker
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {repositories.length} repositories
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Repository Index (40,000 ft)
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a repository to view its ORPT visual documentation, performance metrics, and troubleshooting data.
          </p>
        </div>

        {/* Repository Grid */}
        {repositories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No repositories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Make sure your GitHub token has the correct permissions.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click on any repository to explore its ORPT visual documentation and performance metrics
          </p>
        </div>
      </main>
    </div>
  )
} 