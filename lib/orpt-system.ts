export enum ORPTStatus {
  GREEN = 'green',
  YELLOW = 'yellow',
  RED = 'red'
}

export interface RepairEntry {
  id: string
  timestamp: Date
  errorType: 'build' | 'runtime' | 'schema' | 'performance' | 'security'
  errorMessage: string
  errorSignature: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  toolUsed: 'Cursor' | 'Mantis' | 'Manual' | 'Auto'
  fixDescription: string
  fixCode?: string
  resolved: boolean
  recurrenceCount: number
  escalated: boolean
  bartonNumber: string
  moduleId: string
}

export interface ORPTSection {
  status: ORPTStatus
  description: string
  lastUpdated: Date
  details: string
  violations: Array<{
    id: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    timestamp: Date
    resolved: boolean
    fixAttempts: number
  }>
}

export interface ORPTModule {
  id: string
  name: string
  bartonNumber: string
  blueprintId: string
  version: string
  
  // ORPT Sections
  operating: ORPTSection & {
    purpose: string
    expectedBehavior: string
    dependencies: string[]
    interfaces: string[]
  }
  repair: ORPTSection & {
    repairLog: RepairEntry[]
    totalErrors: number
    totalFixes: number
    escalationCount: number
    lastErrorDate?: Date
    troubleshootingTips: string[]
  }
  parts: ORPTSection & {
    keyFiles: Array<{
      path: string
      type: 'component' | 'service' | 'utility' | 'config' | 'test'
      description: string
      bartonNumber: string
      clickable: boolean
    }>
    components: Array<{
      name: string
      file: string
      description: string
      dependencies: string[]
    }>
    imports: string[]
    exports: string[]
  }
  training: ORPTSection & {
    usageInstructions: string
    cliCommands: string[]
    uiInstructions: string[]
    troubleshootingGuide: string
    errorSignatures: Array<{
      pattern: string
      description: string
      solution: string
    }>
    examples: Array<{
      title: string
      description: string
      code?: string
    }>
  }
  
  // Visual and Documentation
  visualDiagram: {
    type: 'flow' | 'dependency' | 'component' | 'architecture'
    data: any
    filePath: string
    clickable: boolean
    depth: '30k' | '20k' | '10k' | '5k'
  }
  
  documentation: {
    markdown: string
    autoGenerated: boolean
    lastGenerated: Date
    schema: {
      stamped: any
      spvpet: any
      stacked: any
    }
    crossLinks: string[]
    version: string
  }
  
  // Status and Health
  overallStatus: ORPTStatus
  errorCount: number
  lastHealthCheck: Date
  escalationLevel: number // 0-3, 3 = manual review required
  buildTimestamp: Date
  runtimeStatus: 'operational' | 'degraded' | 'failed'
  schemaCompliance: number // 0-100
}

export interface ORPTViolation {
  id: string
  moduleId: string
  bartonNumber: string
  section: 'operating' | 'repair' | 'parts' | 'training'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
  fixAttempts: number
  autoFixAttempted: boolean
  escalated: boolean
  outputFailure: boolean
  schemaViolation: boolean
  errorSignature: string
}

export class ORPTSystem {
  private static instance: ORPTSystem
  private modules: Map<string, ORPTModule> = new Map()
  private violations: Map<string, ORPTViolation> = new Map()
  private mode: 'design' | 'maintenance' = 'design'
  private errorLog: RepairEntry[] = []

  static getInstance(): ORPTSystem {
    if (!ORPTSystem.instance) {
      ORPTSystem.instance = new ORPTSystem()
    }
    return ORPTSystem.instance
  }

  setMode(mode: 'design' | 'maintenance') {
    this.mode = mode
  }

  getMode(): 'design' | 'maintenance' {
    return this.mode
  }

  registerModule(module: ORPTModule) {
    this.modules.set(module.id, module)
    this.validateModule(module)
  }

  getModule(id: string): ORPTModule | undefined {
    return this.modules.get(id)
  }

  getAllModules(): ORPTModule[] {
    return Array.from(this.modules.values())
  }

  logRepairEntry(entry: Omit<RepairEntry, 'id' | 'timestamp'>): string {
    const repairEntry: RepairEntry = {
      ...entry,
      id: `repair-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    }

    this.errorLog.push(repairEntry)
    
    const module = this.modules.get(entry.moduleId)
    if (module) {
      module.repair.repairLog.push(repairEntry)
      module.repair.totalErrors++
      module.repair.lastErrorDate = repairEntry.timestamp
      
      // Update recurrence count
      const similarErrors = module.repair.repairLog.filter(
        e => e.errorSignature === entry.errorSignature
      )
      repairEntry.recurrenceCount = similarErrors.length
      
      // Escalate after 3 recurrences
      if (repairEntry.recurrenceCount >= 3) {
        repairEntry.escalated = true
        module.repair.escalationCount++
        module.escalationLevel = 3
      }
      
      this.updateModuleStatus(module)
    }

    return repairEntry.id
  }

  resolveRepairEntry(entryId: string, resolution: string, toolUsed: 'Cursor' | 'Mantis' | 'Manual' | 'Auto' = 'Manual') {
    const entry = this.errorLog.find(e => e.id === entryId)
    if (entry) {
      entry.resolved = true
      entry.fixDescription = resolution
      entry.toolUsed = toolUsed
      
      const module = this.modules.get(entry.moduleId)
      if (module) {
        module.repair.totalFixes++
        this.updateModuleStatus(module)
      }
    }
  }

  logViolation(violation: ORPTViolation) {
    this.violations.set(violation.id, violation)
    
    const module = this.modules.get(violation.moduleId)
    if (module) {
      const section = module[violation.section]
      section.violations.push({
        id: violation.id,
        severity: violation.severity,
        message: violation.message,
        timestamp: violation.timestamp,
        resolved: violation.resolved,
        fixAttempts: violation.fixAttempts
      })
      
      this.updateModuleStatus(module)
    }
  }

  resolveViolation(violationId: string, resolution: string) {
    const violation = this.violations.get(violationId)
    if (violation) {
      violation.resolved = true
      violation.fixAttempts++
      
      const module = this.modules.get(violation.moduleId)
      if (module) {
        const section = module[violation.section]
        const sectionViolation = section.violations.find(v => v.id === violationId)
        if (sectionViolation) {
          sectionViolation.resolved = true
          sectionViolation.fixAttempts = violation.fixAttempts
        }
        
        // Add to repair section
        module.repair.details += `\n\n**Fix ${violation.fixAttempts}:** ${resolution} (${new Date().toISOString()})`
        module.repair.lastUpdated = new Date()
        
        this.updateModuleStatus(module)
      }
    }
  }

  attemptAutoFix(violationId: string): boolean {
    const violation = this.violations.get(violationId)
    if (!violation || violation.autoFixAttempted) {
      return false
    }

    violation.autoFixAttempted = true
    violation.fixAttempts++

    // Simple auto-fix logic - can be enhanced with AI
    if (violation.severity === 'low' && violation.fixAttempts <= 2) {
      this.resolveViolation(violationId, 'Auto-fixed by system')
      return true
    }

    // Escalate after 3 attempts
    if (violation.fixAttempts >= 3) {
      violation.escalated = true
      const module = this.modules.get(violation.moduleId)
      if (module) {
        module.escalationLevel = 3
        this.updateModuleStatus(module)
      }
    }

    return false
  }

  private validateModule(module: ORPTModule) {
    // Check for required fields
    if (!module.bartonNumber || !module.blueprintId) {
      this.logViolation({
        id: `validation-${module.id}-${Date.now()}`,
        moduleId: module.id,
        bartonNumber: module.bartonNumber,
        section: 'operating',
        severity: 'high',
        message: 'Missing required Barton number or Blueprint ID',
        timestamp: new Date(),
        resolved: false,
        fixAttempts: 0,
        autoFixAttempted: false,
        escalated: false,
        outputFailure: false,
        schemaViolation: true,
        errorSignature: 'MISSING_BARTON_NUMBER'
      })
    }

    // Check schema compliance
    if (!this.validateSchema(module.documentation.schema)) {
      this.logViolation({
        id: `schema-${module.id}-${Date.now()}`,
        moduleId: module.id,
        bartonNumber: module.bartonNumber,
        section: 'parts',
        severity: 'medium',
        message: 'Schema does not conform to STAMPED/SPVPET/STACKED standards',
        timestamp: new Date(),
        resolved: false,
        fixAttempts: 0,
        autoFixAttempted: false,
        escalated: false,
        outputFailure: false,
        schemaViolation: true,
        errorSignature: 'SCHEMA_VIOLATION'
      })
    }

    // Check for required ORPT sections
    if (!module.operating.purpose || !module.repair.repairLog || !module.parts.keyFiles || !module.training.usageInstructions) {
      this.logViolation({
        id: `orpt-${module.id}-${Date.now()}`,
        moduleId: module.id,
        bartonNumber: module.bartonNumber,
        section: 'operating',
        severity: 'medium',
        message: 'Incomplete ORPT structure - missing required sections',
        timestamp: new Date(),
        resolved: false,
        fixAttempts: 0,
        autoFixAttempted: false,
        escalated: false,
        outputFailure: false,
        schemaViolation: false,
        errorSignature: 'INCOMPLETE_ORPT'
      })
    }
  }

  private validateSchema(schema: any): boolean {
    // Enhanced schema validation
    return schema && 
           typeof schema.stamped === 'object' &&
           typeof schema.spvpet === 'object' &&
           typeof schema.stacked === 'object' &&
           schema.stamped.bartonNumber &&
           schema.spvpet.id &&
           schema.stacked.module
  }

  private updateModuleStatus(module: ORPTModule) {
    const sections = [module.operating, module.repair, module.parts, module.training]
    const redCount = sections.filter(s => s.status === ORPTStatus.RED).length
    const yellowCount = sections.filter(s => s.status === ORPTStatus.YELLOW).length

    if (redCount > 0) {
      module.overallStatus = ORPTStatus.RED
      module.runtimeStatus = 'failed'
    } else if (yellowCount > 0) {
      module.overallStatus = ORPTStatus.YELLOW
      module.runtimeStatus = 'degraded'
    } else {
      module.overallStatus = ORPTStatus.GREEN
      module.runtimeStatus = 'operational'
    }

    module.errorCount = sections.reduce((sum, section) => 
      sum + section.violations.filter(v => !v.resolved).length, 0
    )
    module.lastHealthCheck = new Date()
    
    // Calculate schema compliance
    module.schemaCompliance = this.calculateSchemaCompliance(module)
  }

  private calculateSchemaCompliance(module: ORPTModule): number {
    let checks = 0
    let passed = 0

    // Check schema structure
    if (this.validateSchema(module.documentation.schema)) {
      passed++
    }
    checks++

    // Check Barton numbering
    if (module.bartonNumber && /^\d+\.\d+\.\d+\.\d+$/.test(module.bartonNumber)) {
      passed++
    }
    checks++

    // Check ORPT structure
    if (module.operating.purpose && module.repair.repairLog && module.parts.keyFiles && module.training.usageInstructions) {
      passed++
    }
    checks++

    // Check visual diagram
    if (module.visualDiagram && module.visualDiagram.data) {
      passed++
    }
    checks++

    return checks > 0 ? Math.round((passed / checks) * 100) : 100
  }

  getSystemHealth() {
    const modules = this.getAllModules()
    const totalModules = modules.length
    const greenModules = modules.filter(m => m.overallStatus === ORPTStatus.GREEN).length
    const yellowModules = modules.filter(m => m.overallStatus === ORPTStatus.YELLOW).length
    const redModules = modules.filter(m => m.overallStatus === ORPTStatus.RED).length
    const escalatedModules = modules.filter(m => m.escalationLevel >= 3).length
    const totalErrors = modules.reduce((sum, m) => sum + m.errorCount, 0)
    const totalRepairs = modules.reduce((sum, m) => sum + m.repair.totalFixes, 0)

    return {
      totalModules,
      greenModules,
      yellowModules,
      redModules,
      escalatedModules,
      totalErrors,
      totalRepairs,
      healthPercentage: Math.round((greenModules / totalModules) * 100),
      mode: this.mode,
      averageSchemaCompliance: Math.round(
        modules.reduce((sum, m) => sum + m.schemaCompliance, 0) / totalModules
      )
    }
  }

  getErrorLog(filters?: {
    moduleId?: string
    severity?: string[]
    resolved?: boolean
    escalated?: boolean
  }): RepairEntry[] {
    let entries = [...this.errorLog]

    if (filters) {
      if (filters.moduleId) {
        entries = entries.filter(e => e.moduleId === filters.moduleId)
      }
      if (filters.severity) {
        entries = entries.filter(e => filters.severity!.includes(e.severity))
      }
      if (filters.resolved !== undefined) {
        entries = entries.filter(e => e.resolved === filters.resolved)
      }
      if (filters.escalated !== undefined) {
        entries = entries.filter(e => e.escalated === filters.escalated)
      }
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  exportForExternalSystem(system: 'stamped' | 'spvpet' | 'stacked') {
    const modules = this.getAllModules()
    return modules.map(module => ({
      id: module.id,
      bartonNumber: module.bartonNumber,
      blueprintId: module.blueprintId,
      version: module.version,
      status: module.overallStatus,
      runtimeStatus: module.runtimeStatus,
      errorCount: module.errorCount,
      escalationLevel: module.escalationLevel,
      schemaCompliance: module.schemaCompliance,
      schema: module.documentation.schema[system],
      lastHealthCheck: module.lastHealthCheck,
      buildTimestamp: module.buildTimestamp,
      repairLog: module.repair.repairLog
    }))
  }

  generateMarkdown(module: ORPTModule): string {
    return `# ${module.name}

**Barton Number:** ${module.bartonNumber}  
**Blueprint ID:** ${module.blueprintId}  
**Version:** ${module.version}  
**Status:** ${module.overallStatus.toUpperCase()}  
**Last Updated:** ${module.lastHealthCheck.toLocaleDateString()}

## Operating

**Purpose:** ${module.operating.purpose}

**Expected Behavior:** ${module.operating.expectedBehavior}

**Dependencies:** ${module.operating.dependencies.join(', ')}

**Interfaces:** ${module.operating.interfaces.join(', ')}

## Repair

**Total Errors:** ${module.repair.totalErrors}  
**Total Fixes:** ${module.repair.totalFixes}  
**Escalation Count:** ${module.repair.escalationCount}

### Recent Repair Entries:
${module.repair.repairLog.slice(-5).map(entry => `
- **${entry.timestamp.toLocaleDateString()}** - ${entry.errorMessage}
  - Tool: ${entry.toolUsed}
  - Resolved: ${entry.resolved ? 'Yes' : 'No'}
  - Recurrence: ${entry.recurrenceCount}
`).join('')}

### Troubleshooting Tips:
${module.repair.troubleshootingTips.map(tip => `- ${tip}`).join('\n')}

## Parts

### Key Files:
${module.parts.keyFiles.map(file => `
- **${file.path}** (${file.type})
  - Barton: ${file.bartonNumber}
  - Description: ${file.description}
`).join('')}

### Components:
${module.parts.components.map(comp => `
- **${comp.name}** (${comp.file})
  - Description: ${comp.description}
  - Dependencies: ${comp.dependencies.join(', ')}
`).join('')}

## Training

### Usage Instructions:
${module.training.usageInstructions}

### CLI Commands:
${module.training.cliCommands.map(cmd => `\`${cmd}\``).join('\n')}

### Error Signatures:
${module.training.errorSignatures.map(sig => `
- **${sig.pattern}**
  - Description: ${sig.description}
  - Solution: ${sig.solution}
`).join('')}

### Examples:
${module.training.examples.map(ex => `
#### ${ex.title}
${ex.description}
${ex.code ? `\`\`\`\n${ex.code}\n\`\`\`` : ''}
`).join('')}
`
  }
}

// Utility functions
export function createORPTSection(
  status: ORPTStatus = ORPTStatus.GREEN,
  description: string = '',
  details: string = ''
): ORPTSection {
  return {
    status,
    description,
    lastUpdated: new Date(),
    details,
    violations: []
  }
}

export function getStatusColor(status: ORPTStatus): string {
  switch (status) {
    case ORPTStatus.GREEN: return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
    case ORPTStatus.YELLOW: return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
    case ORPTStatus.RED: return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
  }
}

export function getStatusIcon(status: ORPTStatus): string {
  switch (status) {
    case ORPTStatus.GREEN: return '🟢'
    case ORPTStatus.YELLOW: return '🟡'
    case ORPTStatus.RED: return '🔴'
  }
} 