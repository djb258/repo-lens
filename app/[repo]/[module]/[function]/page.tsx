import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, getRepository, getFileContent, getFunctionInfo } from '@/lib/github'
import MermaidDiagram from '@/components/MermaidDiagram'
import AltitudeMarker from '@/components/AltitudeMarker'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import InlineComment from '@/components/InlineComment'
import FixThisButton from '@/components/FixThisButton'
import OutdatedWarning from '@/components/OutdatedWarning'

interface FunctionPageProps {
  params: {
    repo: string
    module: string
    function: string[]
  }
}

export default async function FunctionPage({ params }: FunctionPageProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    const modulePath = params.module
    const functionPath = params.function.join('/')
    const fullPath = `${modulePath}/${functionPath}`
    
    const [repository, fileContent, functionInfo] = await Promise.all([
      getRepository(owner, repo),
      getFileContent(owner, repo, fullPath),
      getFunctionInfo(owner, repo, fullPath)
    ])

    const isMarkdown = functionPath.endsWith('.md') || functionPath.endsWith('.markdown')
    const isMermaid = functionPath.endsWith('.mmd') || functionPath.endsWith('.mermaid')
    const isCode = !isMarkdown && !isMermaid

    // Try to find function-specific documentation
    const functionName = params.function[params.function.length - 1].replace(/\.[^/.]+$/, '')
    let functionSummary = functionInfo.summary || ''
    let functionDiagram = ''
    
    // Look for function diagram if not already found
    if (!functionInfo.summary) {
      try {
        const summaryPath = `${modulePath}/FUNCTION_SUMMARY/${functionName}.md`
        functionSummary = await getFileContent(owner, repo, summaryPath)
      } catch (error) {
        // Function summary not found, that's okay
      }
    }
    
    // Look for function diagram
    try {
      const diagramPath = `${modulePath}/FUNCTION_SUMMARY/${functionName}.mmd`
      functionDiagram = await getFileContent(owner, repo, diagramPath)
    } catch (error) {
      // Function diagram not found, that's okay
    }

    // Extract function information from code (basic parsing)
    const extractFunctionInfo = (code: string) => {
      const lines = code.split('\n')
      const functions: Array<{name: string, line: number, signature: string}> = []
      
      // Basic function detection patterns
      const patterns = [
        /function\s+(\w+)\s*\(/g,
        /const\s+(\w+)\s*=\s*\(/g,
        /let\s+(\w+)\s*=\s*\(/g,
        /export\s+(?:default\s+)?function\s+(\w+)/g,
        /export\s+(?:default\s+)?const\s+(\w+)/g,
        /def\s+(\w+)\s*\(/g, // Python
        /public\s+(?:static\s+)?\w+\s+(\w+)\s*\(/g, // Java
      ]
      
      lines.forEach((line, index) => {
        patterns.forEach(pattern => {
          const match = line.match(pattern)
          if (match) {
            functions.push({
              name: match[1],
              line: index + 1,
              signature: line.trim()
            })
          }
        })
      })
      
      return functions
    }

    const functions = isCode ? extractFunctionInfo(fileContent) : []

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
                <Link href={`/${params.repo}/${params.module}`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  {params.module}
                </Link>
                <span className="text-gray-400">/</span>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {params.function[params.function.length - 1]}
                </h1>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Function
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {functions.length} functions
                </span>
                <FixThisButton 
                  issue="code quality" 
                  repoName={repository.name}
                  filePath={fullPath}
                  functionName={functionName}
                  className="ml-2"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Function Info Bar */}
        <div className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <BreadcrumbNav 
              items={[
                { label: 'Repo Lens', href: '/' },
                { label: repository.name, href: `/${params.repo}` },
                { label: params.module, href: `/${params.repo}/${params.module}` },
                { label: params.function[params.function.length - 1], current: true }
              ]}
              className="mb-3"
            />
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Repository:</span>
                <span className="text-gray-900 dark:text-white font-medium">{repository.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Module:</span>
                <span className="text-gray-900 dark:text-white font-medium">{params.module}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">File:</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">{functionPath}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Size:</span>
                <span className="text-gray-900 dark:text-white">
                  {(fileContent.length / 1024).toFixed(1)} KB
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
              {/* Altitude Marker */}
              <AltitudeMarker altitude={10000} title="Function View" />
              
              {/* Outdated Warning */}
              {functionInfo.lastModified && repository.updated_at && (
                <OutdatedWarning
                  docLastModified={functionInfo.lastModified}
                  codeLastModified={repository.updated_at}
                  filePath={fullPath}
                />
              )}

              {/* Function Summary */}
              {functionSummary && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      📖 Function Overview
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Function purpose, parameters, and behavior
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                        {functionSummary}
                      </pre>
                    </div>
                    <InlineComment 
                      placeholder="Add notes about this function..."
                      className="mt-4"
                    />
                  </div>
                </div>
              )}

              {/* Function List (for code files) */}
              {isCode && functions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      🔧 Functions Found
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {functions.map((func, index) => (
                      <div key={index} className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">
                            {func.name}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Line {func.line}
                          </span>
                        </div>
                        <pre className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-md overflow-x-auto">
                          {func.signature}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Logic Flow (Placeholder for future AI integration) */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🔄 Logic Flow Analysis
                  </h2>
                </div>
                <div className="p-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      This section will show AI-generated logic flow analysis for the functions in this file.
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-2">
                      Features coming soon:
                    </p>
                    <ul className="text-yellow-700 dark:text-yellow-300 text-sm mt-1 list-disc list-inside space-y-1">
                      <li>Control flow diagrams</li>
                      <li>Data flow analysis</li>
                      <li>Error handling paths</li>
                      <li>API call sequences</li>
                      <li>Performance insights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Function Diagram */}
              {functionDiagram && (
                <MermaidDiagram chart={functionDiagram} />
              )}

              {/* Function Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Function Stats
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Functions Found:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{functions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">File Size:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {(fileContent.length / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Lines of Code:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {fileContent.split('\n').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">File Type:</span>
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
                    href={`${repository.html_url}/blob/main/${fullPath}`}
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
                    🔍 Search in File
                  </button>
                  <button className="btn-secondary w-full text-left">
                    📋 Copy File Path
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🧭 Navigation
                </h3>
                <div className="space-y-2">
                  <Link 
                    href={`/${params.repo}/${params.module}`}
                    className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    ← Back to Module
                  </Link>
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
    console.error('Error loading function:', error)
    notFound()
  }
} 