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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/${params.repo}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 inline-block">
              ← Back to {repository.name}
            </Link>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {params.file[params.file.length - 1]}
              </h1>
              <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {isMarkdown ? 'Markdown' : isMermaid ? 'Diagram' : 'Code'}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {filePath}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Content */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  File Content
                </h2>
                
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

              {/* Cursor Instructions Placeholder */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Cursor Instructions
                </h2>
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  File Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Repository:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{repository.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Path:</span>
                    <span className="ml-2 text-gray-900 dark:text-white break-all">{filePath}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {isMarkdown ? 'Markdown' : isMermaid ? 'Mermaid Diagram' : 'Code File'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Size:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {(fileContent.length / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <a
                  href={`${repository.html_url}/blob/main/${filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-4 inline-block text-center w-full"
                >
                  View on GitHub
                </a>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
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
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading file:', error)
    notFound()
  }
} 