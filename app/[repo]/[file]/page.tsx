import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, getFileContent, getRepository } from '@/lib/github'
import MermaidDiagram from '@/components/MermaidDiagram'

interface FilePageProps {
  params: {
    repo: string
    file: string[]
  }
}

export default async function FilePage({ params }: FilePageProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    const filePath = params.file.join('/')
    
    const [repository, fileContent] = await Promise.all([
      getRepository(owner, repo),
      getFileContent(owner, repo, filePath)
    ])

    const isMarkdown = filePath.endsWith('.md') || filePath.endsWith('.markdown')
    const isMermaid = filePath.endsWith('.mmd') || filePath.endsWith('.mermaid')
    const isCode = !isMarkdown && !isMermaid

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
                <Link href={`/${params.repo}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  {repository.name}
                </Link>
                <span className="text-gray-400">/</span>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {params.file[params.file.length - 1]}
                </h1>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {isMarkdown ? 'Markdown' : isMermaid ? 'Diagram' : 'Code'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {(fileContent.length / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* File Info Bar */}
        <div className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Repository:</span>
                <span className="text-gray-900 dark:text-white font-medium">{repository.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Path:</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">{filePath}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="text-gray-900 dark:text-white">
                  {isMarkdown ? 'Markdown' : isMermaid ? 'Mermaid Diagram' : 'Code File'}
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
              {/* File Content */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    📄 File Content
                  </h2>
                </div>
                <div className="p-6">
                  {isMermaid ? (
                    <MermaidDiagram chart={fileContent} />
                  ) : isMarkdown ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                        {fileContent}
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm text-gray-700 dark:text-gray-300">
                        <code>{fileContent}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Cursor Instructions Placeholder */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🤖 Cursor Instructions
                  </h2>
                </div>
                <div className="p-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      This section will contain AI-generated instructions for working with this file in Cursor.
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                      Features coming soon:
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 text-sm mt-1 list-disc list-inside space-y-1">
                      <li>Code explanation and context</li>
                      <li>Suggested improvements</li>
                      <li>Related files and dependencies</li>
                      <li>Common patterns and best practices</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📋 File Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Repository:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{repository.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Size:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {(fileContent.length / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Lines:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {fileContent.split('\n').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {isMarkdown ? 'Markdown' : isMermaid ? 'Mermaid Diagram' : 'Code File'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  ⚡ Quick Actions
                </h3>
                <div className="space-y-3">
                  <a
                    href={`${repository.html_url}/blob/main/${filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center"
                  >
                    View on GitHub
                  </a>
                  <button className="btn-secondary w-full text-left">
                    📝 Edit in Cursor
                  </button>
                  <button className="btn-secondary w-full text-left">
                    🔍 Search in Repository
                  </button>
                  <button className="btn-secondary w-full text-left">
                    📋 Copy File Path
                  </button>
                </div>
              </div>

              {/* File Navigation */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🧭 Navigation
                </h3>
                <div className="space-y-2">
                  <Link 
                    href={`/${params.repo}`}
                    className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    ← Back to Repository
                  </Link>
                  <Link 
                    href="/"
                    className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    ← Back to All Repositories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading file:', error)
    notFound()
  }
} 