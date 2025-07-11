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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block">
              ← Back to Repositories
            </Link>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {repository.name}
              </h1>
              {repository.private && (
                <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  Private
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {repository.description || 'No description available'}
            </p>
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
              <span>⭐ {repository.stargazers_count}</span>
              <span>🍴 {repository.forks_count}</span>
              {repository.language && (
                <span className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                  {repository.language}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Repository Summary */}
              {wikiFile?.summary && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Repository Overview
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {wikiFile.summary}
                    </pre>
                  </div>
                </div>
              )}

              {/* File Structure */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  File Structure
                </h2>
                <div className="space-y-2">
                  {files.map((file) => (
                    <FileItem key={file.path} file={file} repoName={params.repo} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Diagram */}
              {diagramFile?.diagram && (
                <MermaidDiagram chart={diagramFile.diagram} />
              )}

              {/* Repository Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Repository Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Owner:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{repository.owner.login}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {repository.updated_at ? new Date(repository.updated_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Files:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{files.length}</span>
                  </div>
                </div>
                <a
                  href={repository.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-4 inline-block text-center w-full"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading repository:', error)
    notFound()
  }
} 