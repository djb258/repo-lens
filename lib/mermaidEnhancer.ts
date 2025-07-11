import { IssueLog } from './parseVisualFiles'

export interface EnhancedNode {
  id: string
  label: string
  color: string
  tooltip: string
  fixCount: number
  status: 'healthy' | 'warning' | 'critical' | 'escalated'
}

export function getNodeColor(fixCount: number): string {
  if (fixCount === 0) return '#10B981' // Green - no issues
  if (fixCount === 1) return '#F59E0B' // Yellow - 1 fix
  if (fixCount === 2) return '#F97316' // Orange - 2 fixes
  return '#EF4444' // Red - 3+ fixes
}

export function getNodeStatus(fixCount: number): 'healthy' | 'warning' | 'critical' | 'escalated' {
  if (fixCount === 0) return 'healthy'
  if (fixCount === 1) return 'warning'
  if (fixCount === 2) return 'critical'
  return 'escalated'
}

export function generateTooltip(moduleName: string, issues: any[]): string {
  if (issues.length === 0) {
    return `${moduleName}\n✅ No issues`
  }
  
  const recentIssue = issues[0]
  const fixCount = issues.reduce((sum, issue) => sum + issue.fixCount, 0)
  
  return `${moduleName}\n⚠️ ${fixCount} total fixes\n📝 Latest: ${recentIssue.message}\n🕒 ${new Date(recentIssue.timestamp).toLocaleDateString()}`
}

export function enhanceMermaidDiagram(
  mermaidContent: string,
  issueLog: IssueLog[]
): string {
  try {
    // Create a mapping of module names to their issue data
    const issueMap = new Map<string, any>()
    issueLog.forEach(module => {
      issueMap.set(module.moduleName.toLowerCase(), module)
    })

    // Parse the Mermaid content to find nodes
    const lines = mermaidContent.split('\n')
    const enhancedLines: string[] = []
    const nodeStyles: string[] = []
    
    for (const line of lines) {
      // Look for node definitions (A[label], B[label], etc.)
      const nodeMatch = line.match(/^(\w+)\[([^\]]+)\]/)
      if (nodeMatch) {
        const [, nodeId, label] = nodeMatch
        const moduleName = label.replace(/<br\/?>/g, ' ').trim()
        const moduleData = issueMap.get(moduleName.toLowerCase())
        
        if (moduleData) {
          const fixCount = moduleData.totalFixes
          const color = getNodeColor(fixCount)
          const tooltip = generateTooltip(moduleName, moduleData.issues)
          const status = getNodeStatus(fixCount)
          
          // Add enhanced node with tooltip
          enhancedLines.push(`${nodeId}["${moduleName}<br/>${fixCount} fixes"]`)
          
          // Add styling
          nodeStyles.push(`classDef ${nodeId}Class fill:${color},stroke:#000,stroke-width:2px,color:#fff`)
          nodeStyles.push(`class ${nodeId} ${nodeId}Class`)
          
          // Add tooltip (Mermaid doesn't support tooltips natively, so we'll use a comment)
          enhancedLines.push(`%% Tooltip for ${nodeId}: ${tooltip}`)
        } else {
          // No issues found, use default styling
          enhancedLines.push(line)
          nodeStyles.push(`classDef ${nodeId}Class fill:#10B981,stroke:#000,stroke-width:2px,color:#fff`)
          nodeStyles.push(`class ${nodeId} ${nodeId}Class`)
        }
      } else {
        enhancedLines.push(line)
      }
    }
    
    // Add the styling at the end
    enhancedLines.push('')
    enhancedLines.push('%% Node Styling')
    nodeStyles.forEach(style => enhancedLines.push(style))
    
    return enhancedLines.join('\n')
  } catch (error) {
    console.error('Error enhancing Mermaid diagram:', error)
    return mermaidContent
  }
}

export function createStatusLegend(): string {
  return `
%% Status Legend
subgraph Legend
  L1["🟩 No Issues<br/>0 fixes"]
  L2["🟨 Warning<br/>1 fix"]
  L3["🟧 Critical<br/>2 fixes"]
  L4["🟥 Escalated<br/>3+ fixes"]
end

classDef legendClass fill:#f8f9fa,stroke:#dee2e6,stroke-width:1px,color:#000
class L1,L2,L3,L4 legendClass
`
}

export function getEscalationThreshold(): number {
  return 3 // Modules with 3+ fixes are escalated
}

export function shouldEscalate(fixCount: number): boolean {
  return fixCount >= getEscalationThreshold()
} 