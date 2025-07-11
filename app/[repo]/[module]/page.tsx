import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseRepoName, getRepository, getFileContent, getRepositoryContents, getModuleInfo } from '@/lib/github'
import MermaidDiagram from '@/components/MermaidDiagram'
import AltitudeMarker from '@/components/AltitudeMarker'
import BreadcrumbNav from '@/components/BreadcrumbNav'
import InlineComment from '@/components/InlineComment'
import FixThisButton from '@/components/FixThisButton'
import OutdatedWarning from '@/components/OutdatedWarning'

interface ModulePageProps {
  params: {
    repo: string
    module: string
  }
}

export default async function ModulePage({ params }: ModulePageProps) {
  try {
    const { owner, repo } = parseRepoName(params.repo)
    const modulePath = params.module
    
    const [repository, moduleContents, moduleInfo] = await Promise.all([
      getRepository(owner, repo),
      getRepositoryContents(owner, repo, modulePath),
      getModuleInfo(owner, repo, modulePath)
    ])

    // Look for module-specific documentation
    const wikiFile = moduleContents.find(f => f.name === 'REPO_WIKI.md')
    const diagramFile = moduleContents.find(f => f.name === 'WIKI_MAP.mmd')
    const moduleDiagramFile = moduleContents.find(f => f.name === `${params.module}.mmd`)
    
    // Get module summary and diagram content
    let moduleSummary = ''
    let moduleDiagram = moduleInfo.diagram || ''
    
    if (wikiFile) {
      try {
        moduleSummary = await getFileContent(owner, repo, `${modulePath}/REPO_WIKI.md`)
      } catch (error) {
        console.warn('Could not fetch module wiki:', error)
      }
    }
    
    if (!moduleDiagram && moduleDiagramFile) {
      try {
        moduleDiagram = await getFileContent(owner, repo, `${modulePath}/${params.module}.mmd`)
      } catch (error) {
        console.warn('Could not fetch module diagram:', error)
      }
    } else if (!moduleDiagram && diagramFile) {
      try {
        moduleDiagram = await getFileContent(owner, repo, `${modulePath}/WIKI_MAP.mmd`)
      } catch (error) {
        console.warn('Could not fetch module diagram:', error)
      }
    }

    // Categorize files in the module
    const files = moduleContents.filter(f => f.type === 'file')
    const directories = moduleContents.filter(f => f.type === 'dir')
    
    // Identify potential functions/components (common file patterns)
    const functionFiles = files.filter(f => 
      f.name.endsWith('.ts') || 
      f.name.endsWith('.tsx') || 
      f.name.endsWith('.js') || 
      f.name.endsWith('.jsx') ||
      f.name.endsWith('.py') ||
      f.name.endsWith('.java') ||
      f.name.endsWith('.cpp') ||
      f.name.endsWith('.c')
    )

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
                  {params.module}
                </h1>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  Module
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {moduleContents.length} items
                </span>
                <FixThisButton 
                  issue="missing tests" 
                  repoName={repository.name}
                  filePath={modulePath}
                  className="ml-2"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Module Info Bar */}
        <div className="bg-white dark:bg-github-gray border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <BreadcrumbNav 
              items={[
                { label: 'Repo Lens', href: '/' },
                { label: repository.name, href: `/${params.repo}` },
                { label: params.module, current: true }
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
                <span className="text-gray-500 dark:text-gray-400">Files:</span>
                <span className="text-gray-900 dark:text-white">{files.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">Functions:</span>
                <span className="text-gray-900 dark:text-white">{functionFiles.length}</span>
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
              <AltitudeMarker altitude={20000} title="Module View" />
              
              {/* Outdated Warning */}
              {wikiFile?.updated_at && repository.updated_at && (
                <OutdatedWarning
                  docLastModified={wikiFile.updated_at}
                  codeLastModified={repository.updated_at}
                  filePath={`${modulePath}/REPO_WIKI.md`}
                />
              )}

              {/* Module Summary */}
              {moduleSummary && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      📖 Module Overview
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Module purpose, responsibilities, and key functions
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                        {moduleSummary}
                      </pre>
                    </div>
                    <InlineComment 
                      placeholder="Add notes about this module..."
                      className="mt-4"
                    />
                  </div>
                </div>
              )}

              {/* Module Structure */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    🧭 Module Structure
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Directories */}
                  {directories.length > 0 && (
                    <div className="p-6">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        📁 Subdirectories
                      </h3>
                      <div className="space-y-2">
                        {directories.map((dir) => (
                          <Link 
                            key={dir.path}
                            href={`/${params.repo}/${dir.path}`}
                            className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">📁</span>
                              <span className="text-gray-900 dark:text-white font-medium">{dir.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Function Files */}
                  {functionFiles.length > 0 && (
                    <div className="p-6">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        ⚙️ Functions & Components
                      </h3>
                      <div className="space-y-2">
                        {functionFiles.map((file) => (
                          <Link 
                            key={file.path}
                            href={`/${params.repo}/${file.path}`}
                            className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">🔧</span>
                                <span className="text-gray-900 dark:text-white font-medium">{file.name}</span>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Files */}
                  {files.filter(f => !functionFiles.includes(f)).length > 0 && (
                    <div className="p-6">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                        📄 Other Files
                      </h3>
                      <div className="space-y-2">
                        {files.filter(f => !functionFiles.includes(f)).map((file) => (
                          <Link 
                            key={file.path}
                            href={`/${params.repo}/${file.path}`}
                            className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">📄</span>
                                <span className="text-gray-900 dark:text-white font-medium">{file.name}</span>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Module Diagram */}
              {moduleDiagram && (
                <MermaidDiagram chart={moduleDiagram} />
              )}

              {/* Module Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Module Stats
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Items:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{moduleContents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Files:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Directories:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{directories.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Functions:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{functionFiles.length}</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
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
    console.error('Error loading module:', error)
    notFound()
  }
} 