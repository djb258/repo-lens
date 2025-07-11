import Link from 'next/link'
import { getRepositories } from '@/lib/github'
import RepoCard from '@/components/RepoCard'

export default async function IndexViewPage() {
  try {
    const repositories = await getRepositories()
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-dark">
        {/* Header */}
        <header className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🧠 ORPT Repo Lens Viewer
                </h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Zoom 30k - Repository Index
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
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              🛰️ Zoom 30k - Repository Index
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Browse all accessible GitHub repositories. Click any repository to zoom into its ORPT documentation.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search repositories..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                id="repo-search"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* Repository Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="repo-grid">
            {repositories.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>

          {repositories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No repositories found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Make sure your GitHub token has access to repositories.
              </p>
            </div>
          )}
        </main>

        {/* Search Script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const searchInput = document.getElementById('repo-search');
              const repoGrid = document.getElementById('repo-grid');
              const repoCards = repoGrid.querySelectorAll('[data-repo-name]');
              
              searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                
                repoCards.forEach(card => {
                  const repoName = card.getAttribute('data-repo-name').toLowerCase();
                  const repoDescription = card.getAttribute('data-repo-description')?.toLowerCase() || '';
                  
                  if (repoName.includes(searchTerm) || repoDescription.includes(searchTerm)) {
                    card.style.display = 'block';
                  } else {
                    card.style.display = 'none';
                  }
                });
              });
            });
          `
        }} />
      </div>
    )
  } catch (error) {
    console.error('Error loading repositories:', error)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error loading repositories
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please check your GitHub token configuration.
          </p>
        </div>
      </div>
    )
  }
} 