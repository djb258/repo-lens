import { getFileContent } from './github'
import yaml from 'js-yaml'

export interface ModuleIndex {
  name: string
  path: string
  description: string
  type: 'module' | 'file' | 'component'
  priority: 'high' | 'medium' | 'low'
}

export interface IssueLog {
  moduleId: string
  moduleName: string
  issues: Array<{
    id: string
    type: 'error' | 'warning' | 'info'
    message: string
    timestamp: string
    fixCount: number
    status: 'open' | 'resolved' | 'escalated'
  }>
  totalFixes: number
  lastUpdated: string
}

export interface FixLog {
  moduleId: string
  fixes: Array<{
    id: string
    issueId: string
    description: string
    timestamp: string
    appliedBy: string
    success: boolean
    notes?: string
  }>
}

export interface FunctionDoc {
  overview: string
  architecture: string
  keyComponents: string[]
  dependencies: string[]
  deployment: string
  troubleshooting: string
}

export async function parseIndexYaml(
  owner: string,
  repo: string,
  content: string
): Promise<ModuleIndex[]> {
  try {
    const parsed = yaml.load(content) as any
    return parsed.modules || []
  } catch (error) {
    console.error('Error parsing index.yaml:', error)
    return []
  }
}

export async function parseIssueLogYaml(
  owner: string,
  repo: string,
  content: string
): Promise<IssueLog[]> {
  try {
    const parsed = yaml.load(content) as any
    return parsed.issues || []
  } catch (error) {
    console.error('Error parsing issue_log.yaml:', error)
    return []
  }
}

export async function parseFixesYaml(
  owner: string,
  repo: string,
  content: string
): Promise<FixLog[]> {
  try {
    const parsed = yaml.load(content) as any
    return parsed.fixes || []
  } catch (error) {
    console.error('Error parsing fixes.yaml:', error)
    return []
  }
}

export async function parseFunctionDoc(
  owner: string,
  repo: string,
  content: string
): Promise<FunctionDoc> {
  try {
    // Parse markdown content and extract sections
    const lines = content.split('\n')
    const sections: { [key: string]: string[] } = {}
    let currentSection = 'overview'
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        const sectionName = line.replace('## ', '').toLowerCase().replace(/\s+/g, '')
        currentSection = sectionName
        sections[currentSection] = []
      } else if (line.trim() && currentSection) {
        if (!sections[currentSection]) {
          sections[currentSection] = []
        }
        sections[currentSection].push(line)
      }
    }
    
    return {
      overview: sections.overview?.join('\n') || '',
      architecture: sections.architecture?.join('\n') || '',
      keyComponents: sections.keycomponents || [],
      dependencies: sections.dependencies || [],
      deployment: sections.deployment?.join('\n') || '',
      troubleshooting: sections.troubleshooting?.join('\n') || ''
    }
  } catch (error) {
    console.error('Error parsing function_doc.md:', error)
    return {
      overview: '',
      architecture: '',
      keyComponents: [],
      dependencies: [],
      deployment: '',
      troubleshooting: ''
    }
  }
}

export async function getVisualFiles(
  owner: string,
  repo: string
): Promise<{
  index: ModuleIndex[]
  functionDoc: FunctionDoc
  overviewMmd: string
  issueLog: IssueLog[]
  fixesLog: FixLog[]
}> {
  try {
    const [
      indexContent,
      functionDocContent,
      overviewMmdContent,
      issueLogContent,
      fixesLogContent
    ] = await Promise.all([
      getFileContent(owner, repo, 'VISUALS/index.yaml').catch(() => ''),
      getFileContent(owner, repo, 'VISUALS/function_doc.md').catch(() => ''),
      getFileContent(owner, repo, 'VISUALS/overview.mmd').catch(() => ''),
      getFileContent(owner, repo, 'VISUALS/troubleshooting/issue_log.yaml').catch(() => ''),
      getFileContent(owner, repo, 'VISUALS/training/fixes.yaml').catch(() => '')
    ])

    const [index, functionDoc, issueLog, fixesLog] = await Promise.all([
      parseIndexYaml(owner, repo, indexContent),
      parseFunctionDoc(owner, repo, functionDocContent),
      parseIssueLogYaml(owner, repo, issueLogContent),
      parseFixesYaml(owner, repo, fixesLogContent)
    ])

    return {
      index,
      functionDoc,
      overviewMmd: overviewMmdContent,
      issueLog,
      fixesLog
    }
  } catch (error) {
    console.error('Error fetching visual files:', error)
    return {
      index: [],
      functionDoc: {
        overview: '',
        architecture: '',
        keyComponents: [],
        dependencies: [],
        deployment: '',
        troubleshooting: ''
      },
      overviewMmd: '',
      issueLog: [],
      fixesLog: []
    }
  }
} 