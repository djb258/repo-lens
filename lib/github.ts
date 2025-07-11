import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  updated_at: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  owner: {
    login: string
    avatar_url: string
  }
}

export interface FileContent {
  name: string
  path: string
  type: 'file' | 'dir' | 'submodule' | 'symlink'
  size?: number
  content?: string
  encoding?: string
  sha: string
  url: string
  updated_at?: string
}

export interface RepoFile {
  name: string
  path: string
  type: 'file' | 'dir' | 'submodule' | 'symlink'
  size?: number
  summary?: string
  diagram?: string
  lastModified?: string
  content?: string
}

export interface ModuleInfo {
  name: string
  path: string
  summary?: string
  diagram?: string
  functions?: FunctionInfo[]
}

export interface FunctionInfo {
  name: string
  path: string
  summary?: string
  code?: string
  lastModified?: string
}

export async function getRepositories(): Promise<Repository[]> {
  try {
    const response = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching repositories:', error)
    throw new Error('Failed to fetch repositories')
  }
}

export async function getRepository(owner: string, repo: string): Promise<Repository> {
  try {
    const response = await octokit.repos.get({
      owner,
      repo,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching repository:', error)
    throw new Error('Failed to fetch repository')
  }
}

export async function getRepositoryContents(
  owner: string,
  repo: string,
  path: string = ''
): Promise<FileContent[]> {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
    })
    
    if (Array.isArray(response.data)) {
      return response.data
    } else {
      return [response.data]
    }
  } catch (error) {
    console.error('Error fetching repository contents:', error)
    throw new Error('Failed to fetch repository contents')
  }
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
    })
    
    if ('content' in response.data && response.data.encoding === 'base64') {
      return Buffer.from(response.data.content, 'base64').toString('utf-8')
    }
    
    throw new Error('Invalid file content')
  } catch (error) {
    console.error('Error fetching file content:', error)
    throw new Error('Failed to fetch file content')
  }
}

export async function parseRepoStructure(
  owner: string,
  repo: string
): Promise<RepoFile[]> {
  try {
    const contents = await getRepositoryContents(owner, repo)
    const files: RepoFile[] = []
    
    for (const item of contents) {
      const file: RepoFile = {
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        lastModified: item.updated_at || undefined,
      }
      
      // Check for wiki files
      if (item.name === 'REPO_WIKI.md' && item.type === 'file') {
        try {
          const content = await getFileContent(owner, repo, item.path)
          file.summary = content
          file.content = content
        } catch (error) {
          console.warn('Could not fetch REPO_WIKI.md:', error)
        }
      }
      
      if (item.name === 'WIKI_MAP.mmd' && item.type === 'file') {
        try {
          const content = await getFileContent(owner, repo, item.path)
          file.diagram = content
          file.content = content
        } catch (error) {
          console.warn('Could not fetch WIKI_MAP.mmd:', error)
        }
      }
      
      files.push(file)
    }
    
    return files
  } catch (error) {
    console.error('Error parsing repo structure:', error)
    throw new Error('Failed to parse repository structure')
  }
}

export async function getModuleInfo(
  owner: string,
  repo: string,
  modulePath: string
): Promise<ModuleInfo> {
  try {
    const contents = await getRepositoryContents(owner, repo, modulePath)
    const moduleInfo: ModuleInfo = {
      name: modulePath.split('/').pop() || modulePath,
      path: modulePath,
    }
    
    // Look for module-specific documentation
    for (const item of contents) {
      if (item.name === `${moduleInfo.name}.mmd` && item.type === 'file') {
        try {
          const content = await getFileContent(owner, repo, item.path)
          moduleInfo.diagram = content
        } catch (error) {
          console.warn(`Could not fetch ${item.name}:`, error)
        }
      }
    }
    
    // Look for MODULE_MAP directory
    try {
      const moduleMapContents = await getRepositoryContents(owner, repo, 'MODULE_MAP')
      const moduleMapFile = moduleMapContents.find(f => f.name === `${moduleInfo.name}.mmd`)
      if (moduleMapFile) {
        const content = await getFileContent(owner, repo, moduleMapFile.path)
        moduleInfo.diagram = content
      }
    } catch (error) {
      // MODULE_MAP directory might not exist
    }
    
    return moduleInfo
  } catch (error) {
    console.error('Error fetching module info:', error)
    throw new Error('Failed to fetch module information')
  }
}

export async function getFunctionInfo(
  owner: string,
  repo: string,
  functionPath: string
): Promise<FunctionInfo> {
  try {
    const functionInfo: FunctionInfo = {
      name: functionPath.split('/').pop() || functionPath,
      path: functionPath,
    }
    
    // Look for function-specific documentation
    try {
      const funcSummaryContent = await getFileContent(owner, repo, `FUNCTION_SUMMARY/${functionInfo.name}.md`)
      functionInfo.summary = funcSummaryContent
    } catch (error) {
      console.warn(`Could not fetch function summary for ${functionInfo.name}:`, error)
    }
    
    // Get the actual function code
    try {
      const codeContent = await getFileContent(owner, repo, functionPath)
      functionInfo.code = codeContent
    } catch (error) {
      console.warn(`Could not fetch function code for ${functionPath}:`, error)
    }
    
    return functionInfo
  } catch (error) {
    console.error('Error fetching function info:', error)
    throw new Error('Failed to fetch function information')
  }
}

export function parseRepoName(fullName: string): { owner: string; repo: string } {
  const parts = fullName.split('/')
  if (parts.length !== 2) {
    throw new Error('Invalid repository name format')
  }
  return { owner: parts[0], repo: parts[1] }
} 