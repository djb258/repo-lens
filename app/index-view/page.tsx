'use client'

import { useState, useEffect } from 'react'
import { Repository } from '@/lib/github'
import RepoCard from '@/components/RepoCard'
import Navigation from '@/components/Navigation'

export default function IndexViewPage() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔍 DEBUG: Component render - loading: true error: null repos: 0 filtered: 0')
        
        const response = await fetch('/api/repositories')
        console.log('🔍 DEBUG: API response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const repos = await response.json()
        console.log('🔍 DEBUG: Repositories loaded:', repos.length)
        setRepositories(repos)

      } catch (err: any) {
        console.error('🔍 DEBUG: Error loading repositories:', err)
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading repositories...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
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
              {repositories.length === 0 && !loading && !error 
                ? 'GitHub Token Required' 
                : 'No repositories found'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {repositories.length === 0 && !loading && !error 
                ? 'To view your repositories, please add your GitHub Personal Access Token to the environment variables.'
                : searchTerm ? 'Try adjusting your search terms.' : 'No repositories available.'
              }
            </p>
            {repositories.length === 0 && !loading && !error && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Setup Instructions:</h4>
                <ol className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-1">
                  <li>1. Create a GitHub Personal Access Token</li>
                  <li>2. Add it to your .env file as GITHUB_TOKEN=your_token_here</li>
                  <li>3. For Vercel: Add GITHUB_TOKEN in Vercel Environment Variables</li>
                  <li>4. Restart the development server</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Repository Count */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredRepositories.length} of {repositories.length} repositories
        </div>
      </div>
    </div>
  )
} 