import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, parseRepoStructure, getRepository } from '@/lib/github'
import FileItem from '@/components/FileItem'
import MermaidDiagram from '@/components/MermaidDiagram'

interface RepoPageProps {
  params: {
    repo: string
  }
}

export default async function RepoPage({ params }: RepoPageProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    const [repository, files] = await Promise.all([
      getRepository(owner, repo),
      parseRepoStructure(owner, repo)
    ])

    const wikiFile = files.find(f => f.name === 'REPO_WIKI.md')
    const diagramFile = files.find(f => f.name === 'WIKI_MAP.mmd')

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-github-dark">
        {/* GitHub-like Header */}
        <header className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Repo Lens
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
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {files.length} items
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Repository Info Bar */}
        <div className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              {/* Repository Summary */}
              {wikiFile?.summary && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    📖 Repository Overview
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                      {wikiFile.summary}
                    </pre>
                  </div>
                </div>
              )}

              {/* File Structure */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📁 File Structure
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {files.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">📄</div>
                      <p className="text-gray-600 dark:text-gray-400">No files found</p>
                    </div>
                  ) : (
                    files.map((file) => (
                      <FileItem key={file.path} file={file} repoName={params.repo} />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Diagram */}
              {diagramFile?.diagram && (
                <MermaidDiagram chart={diagramFile.diagram} />
              )}

              {/* Repository Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🔗 Quick Actions
                </h3>
                <div className="space-y-3">
                  <a
                    href={repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center"
                  >
                    View on GitHub
                  </a>
                  <a
                    href={`${repository.html_url}/issues`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full text-center"
                  >
                    View Issues
                  </a>
                  <a
                    href={`${repository.html_url}/pulls`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full text-center"
                  >
                    View Pull Requests
                  </a>
                </div>
              </div>

              {/* Repository Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Repository Stats
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Files:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Stars:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{repository.stargazers_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Forks:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{repository.forks_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Language:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {repository.language || 'Not specified'}
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
    console.error('Error loading repository:', error)
    notFound()
  }
} 