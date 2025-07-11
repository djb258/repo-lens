'use client'

import { useState, useEffect } from 'react'
import { getRepositories, Repository } from '@/lib/github'
import RepoCard from '@/components/RepoCard'
import { Diagnostics, Altitude, Module, Submodule, Action } from '@/lib/diagnostics'
import { useDiagnosticOverlay } from '@/components/DiagnosticOverlay'

export default function IndexViewPage() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { DiagnosticWrapper } = useDiagnosticOverlay('index-view')

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setLoading(true)
        setError(null)

        // Log page load start
        Diagnostics.success(
          Altitude.COMPONENT,
          Module.UI,
          Submodule.REPO_CARD,
          Action.LOAD,
          'Starting repository index page load',
          { page: 'index-view' }
        )

        const repos = await getRepositories()
        setRepositories(repos)

        // Log successful load
        Diagnostics.success(
          Altitude.COMPONENT,
          Module.UI,
          Submodule.REPO_CARD,
          Action.COMPLETE,
          `Successfully loaded ${repos.length} repositories`,
          { count: repos.length }
        )

      } catch (err: any) {
        // Log error
        Diagnostics.error(
          Altitude.COMPONENT,
          Module.UI,
          Submodule.REPO_CARD,
          Action.LOAD,
          'Failed to load repositories on index page',
          err,
          { page: 'index-view' }
        )

        setError(err.message || 'Failed to load repositories')
      } finally {
        setLoading(false)
      }
    }

    loadRepositories()
  }, [])

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DiagnosticWrapper>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading repositories...</p>
            </div>
          </div>
        </div>
      </DiagnosticWrapper>
    )
  }

  if (error) {
    return (
      <DiagnosticWrapper>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error Loading Repositories
                </h2>
                <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </DiagnosticWrapper>
    )
  }

  return (
    <DiagnosticWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📚 Repository Index
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore your GitHub repositories with RepoLens
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Repository Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepositories.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>

          {filteredRepositories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No repositories found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms.' : 'No repositories available.'}
              </p>
            </div>
          )}

          {/* Repository Count */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredRepositories.length} of {repositories.length} repositories
          </div>
        </div>
      </div>
    </DiagnosticWrapper>
  )
} 