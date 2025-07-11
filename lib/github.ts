import { Octokit } from '@octokit/rest'
import { Diagnostics, Altitude, Module, Submodule, Action, Status } from '@/lib/diagnostics'
import { config, hasGitHubToken } from '@/lib/config'

const octokit = new Octokit({
  auth: config.github.token,
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
    // Log the start of repository fetch
    Diagnostics.success(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.REPO_FETCH,
      Action.START,
      'Starting repository fetch',
      { per_page: 100, sort: 'updated' }
    )

    const response = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    })

    // Log successful fetch
    Diagnostics.success(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.REPO_FETCH,
      Action.COMPLETE,
      `Successfully fetched ${response.data.length} repositories`,
      { 
        count: response.data.length,
        rateLimitRemaining: response.headers['x-ratelimit-remaining'],
        rateLimitReset: response.headers['x-ratelimit-reset']
      }
    )

    return response.data
  } catch (error: any) {
    // Log authentication failure
    if (error.status === 401) {
      Diagnostics.authFailure(
        Altitude.SERVICE,
        Module.GITHUB,
        Submodule.AUTH,
        Action.FETCH,
        'GitHub authentication failed - missing or invalid token',
        { 
          status: error.status,
          message: error.message,
          documentation_url: error.response?.data?.documentation_url
        }
      )
    }
    // Log rate limiting
    else if (error.status === 403 && error.response?.headers?.['x-ratelimit-remaining'] === '0') {
      Diagnostics.warning(
        Altitude.SERVICE,
        Module.GITHUB,
        Submodule.REPO_FETCH,
        Action.FETCH,
        'GitHub API rate limit exceeded',
        { 
          status: error.status,
          rateLimitReset: error.response?.headers?.['x-ratelimit-reset'],
          rateLimitLimit: error.response?.headers?.['x-ratelimit-limit']
        }
      )
    }
    // Log other errors
    else {
      Diagnostics.error(
        Altitude.SERVICE,
        Module.GITHUB,
        Submodule.REPO_FETCH,
        Action.FETCH,
        'Failed to fetch repositories from GitHub API',
        error,
        { 
          status: error.status,
          message: error.message,
          url: error.request?.url
        }
      )
    }

    console.error('Error fetching repositories:', error)
    throw new Error('Failed to fetch repositories')
  }
}

export async function getRepository(owner: string, repo: string): Promise<Repository> {
  try {
    // Log repository fetch start
    Diagnostics.success(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.REPO_FETCH,
      Action.START,
      `Starting repository fetch for ${owner}/${repo}`,
      { owner, repo }
    )

    const response = await octokit.repos.get({
      owner,
      repo,
    })

    // Log successful fetch
    Diagnostics.success(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.REPO_FETCH,
      Action.COMPLETE,
      `Successfully fetched repository ${owner}/${repo}`,
      { 
        owner, 
        repo,
        name: response.data.name,
        language: response.data.language,
        stars: response.data.stargazers_count
      }
    )

    return response.data
  } catch (error: any) {
    // Log repository fetch error
    Diagnostics.error(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.REPO_FETCH,
      Action.FETCH,
      `Failed to fetch repository ${owner}/${repo}`,
      error,
      { owner, repo, status: error.status }
    )

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
    // Log contents fetch start
    Diagnostics.success(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.CONTENTS,
      Action.START,
      `Starting contents fetch for ${owner}/${repo}${path ? `/${path}` : ''}`,
      { owner, repo, path }
    )

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
    })
    
    const contents = Array.isArray(response.data) ? response.data : [response.data]

    // Log successful fetch
    Diagnostics.success(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.CONTENTS,
      Action.COMPLETE,
      `Successfully fetched ${contents.length} items from ${owner}/${repo}${path ? `/${path}` : ''}`,
      { 
        owner, 
        repo, 
        path, 
        count: contents.length,
        types: contents.map(item => item.type)
      }
    )
    
    return contents
  } catch (error: any) {
    // Log contents fetch error
    Diagnostics.error(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.CONTENTS,
      Action.FETCH,
      `Failed to fetch contents for ${owner}/${repo}${path ? `/${path}` : ''}`,
      error,
      { owner, repo, path, status: error.status }
    )

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
    // Log file content fetch start
    Diagnostics.success(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.FILE_FETCH,
      Action.START,
      `Starting file content fetch for ${owner}/${repo}/${path}`,
      { owner, repo, path }
    )

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
    })
    
    if ('content' in response.data && response.data.encoding === 'base64') {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8')

      // Log successful fetch
      Diagnostics.success(
        Altitude.SERVICE,
        Module.GITHUB,
        Submodule.FILE_FETCH,
        Action.COMPLETE,
        `Successfully fetched file content for ${owner}/${repo}/${path}`,
        { 
          owner, 
          repo, 
          path, 
          size: content.length,
          encoding: response.data.encoding
        }
      )

      return content
    }
    
    // Log invalid content error
    Diagnostics.parseFailure(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.FILE_FETCH,
      Action.PARSE,
      `Invalid file content format for ${owner}/${repo}/${path}`,
      new Error('Invalid file content'),
      { 
        owner, 
        repo, 
        path, 
        encoding: 'content' in response.data ? response.data.encoding : 'unknown'
      }
    )
    
    throw new Error('Invalid file content')
  } catch (error: any) {
    // Log file content fetch error
    Diagnostics.error(
      Altitude.SERVICE,
      Module.GITHUB,
      Submodule.FILE_FETCH,
      Action.FETCH,
      `Failed to fetch file content for ${owner}/${repo}/${path}`,
      error,
      { owner, repo, path, status: error.status }
    )

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
  // Handle URL-encoded repository names
  const decodedName = decodeURIComponent(fullName)
  
  // Filter out common non-repository requests
  const commonNonRepoRequests = [
    'favicon.ico', 'robots.txt', 'sitemap.xml', '.well-known',
    'manifest.json', 'sw.js', 'workbox-', 'static/',
    'api/', '_next/', '__nextjs_original-stack-frame'
  ]
  
  // Check for exact matches first
  if (commonNonRepoRequests.includes(decodedName)) {
    throw new Error(`Invalid repository format: ${fullName}. This appears to be a system request, not a repository.`)
  }
  
  // Check for partial matches
  if (commonNonRepoRequests.some(req => decodedName.includes(req))) {
    throw new Error(`Invalid repository format: ${fullName}. This appears to be a system request, not a repository.`)
  }
  
  // Split by '/' and handle various formats
  const parts = decodedName.split('/')
  
  if (parts.length === 2) {
    return { owner: parts[0], repo: parts[1] }
  } else if (parts.length === 1) {
    // Handle case where only repo name is provided (use a default owner)
    return { owner: 'unknown', repo: parts[0] }
  } else if (parts.length > 2) {
    // Handle case where there are more than 2 parts (take first and last)
    return { owner: parts[0], repo: parts[parts.length - 1] }
  } else {
    // Fallback for empty or invalid names
    return { owner: 'unknown', repo: 'unknown' }
  }
} 