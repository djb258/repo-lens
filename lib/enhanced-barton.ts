import { ORPTSystem, ORPTModule, ORPTViolation, ORPTStatus } from './orpt-system'

export enum BartonPrinciple {
  UNIVERSAL_MONITORING = 'universal_monitoring',
  DIAGNOSTIC_TRACKING = 'diagnostic_tracking',
  ERROR_ESCALATION = 'error_escalation',
  SCHEMA_ENFORCEMENT = 'schema_enforcement',
  VISUAL_DOCUMENTATION = 'visual_documentation',
  CROSS_LINKING = 'cross_linking',
  AUTO_RESOLUTION = 'auto_resolution'
}

export interface BartonDiagnostic {
  bartonId: string
  sessionId: string
  timestamp: Date
  principle: BartonPrinciple
  severity: 'info' | 'warning' | 'error' | 'critical'
  category: 'orpt' | 'schema' | 'visual' | 'error' | 'system'
  message: string
  context: Record<string, any>
  moduleId?: string
  bartonNumber?: string
  escalationLevel: number
  autoResolved: boolean
  requiresManualReview: boolean
}

export interface BartonBlueprint {
  id: string
  name: string
  version: string
  modules: Array<{
    id: string
    bartonNumber: string
    name: string
    description: string
    dependencies: string[]
  }>
  schema: {
    stamped: any
    spvpet: any
    stacked: any
  }
  lastUpdated: Date
  compliance: number
}

export class EnhancedBartonSystem {
  private static instance: EnhancedBartonSystem
  private orptSystem: ORPTSystem
  private diagnostics: Map<string, BartonDiagnostic> = new Map()
  private blueprints: Map<string, BartonBlueprint> = new Map()
  private sessionId: string

  private constructor() {
    this.orptSystem = ORPTSystem.getInstance()
    this.sessionId = `session-${Date.now()}`
  }

  static getInstance(): EnhancedBartonSystem {
    if (!EnhancedBartonSystem.instance) {
      EnhancedBartonSystem.instance = new EnhancedBartonSystem()
    }
    return EnhancedBartonSystem.instance
  }

  logDiagnostic(diagnostic: Omit<BartonDiagnostic, 'bartonId' | 'sessionId' | 'timestamp' | 'escalationLevel' | 'autoResolved' | 'requiresManualReview'>) {
    const fullDiagnostic: BartonDiagnostic = {
      ...diagnostic,
      bartonId: `barton-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      timestamp: new Date(),
      escalationLevel: 0,
      autoResolved: false,
      requiresManualReview: false
    }

    this.diagnostics.set(fullDiagnostic.bartonId, fullDiagnostic)

    // Check for escalation
    if (fullDiagnostic.severity === 'critical' || fullDiagnostic.severity === 'error') {
      fullDiagnostic.escalationLevel = 1
      fullDiagnostic.requiresManualReview = true
    }

    // Attempt auto-resolution for low severity issues
    if (fullDiagnostic.severity === 'info' || fullDiagnostic.severity === 'warning') {
      this.attemptAutoResolution(fullDiagnostic)
    }

    return fullDiagnostic.bartonId
  }

  private attemptAutoResolution(diagnostic: BartonDiagnostic): boolean {
    // Simple auto-resolution logic - can be enhanced with AI
    if (diagnostic.category === 'schema' && diagnostic.severity === 'warning') {
      diagnostic.autoResolved = true
      diagnostic.escalationLevel = 0
      return true
    }

    if (diagnostic.category === 'visual' && diagnostic.severity === 'info') {
      diagnostic.autoResolved = true
      diagnostic.escalationLevel = 0
      return true
    }

    return false
  }

  registerBlueprint(blueprint: BartonBlueprint) {
    this.blueprints.set(blueprint.id, blueprint)
    
    // Validate blueprint compliance
    const compliance = this.calculateBlueprintCompliance(blueprint)
    blueprint.compliance = compliance

    if (compliance < 100) {
      this.logDiagnostic({
        principle: BartonPrinciple.SCHEMA_ENFORCEMENT,
        severity: 'warning',
        category: 'schema',
        message: `Blueprint ${blueprint.id} has ${100 - compliance}% compliance issues`,
        context: { blueprintId: blueprint.id, compliance }
      })
    }
  }

  private calculateBlueprintCompliance(blueprint: BartonBlueprint): number {
    let totalChecks = 0
    let passedChecks = 0

    // Check schema compliance
    if (blueprint.schema.stamped && typeof blueprint.schema.stamped === 'object') {
      totalChecks++
      passedChecks++
    }
    if (blueprint.schema.spvpet && typeof blueprint.schema.spvpet === 'object') {
      totalChecks++
      passedChecks++
    }
    if (blueprint.schema.stacked && typeof blueprint.schema.stacked === 'object') {
      totalChecks++
      passedChecks++
    }

    // Check module structure
    blueprint.modules.forEach(module => {
      totalChecks++
      if (module.bartonNumber && module.name && module.description) {
        passedChecks++
      }
    })

    return totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100
  }

  validateModule(module: ORPTModule): BartonDiagnostic[] {
    const diagnostics: BartonDiagnostic[] = []

    // Validate Barton number format
    if (!this.isValidBartonNumber(module.bartonNumber)) {
      diagnostics.push({
        principle: BartonPrinciple.SCHEMA_ENFORCEMENT,
        severity: 'error',
        category: 'schema',
        message: `Invalid Barton number format: ${module.bartonNumber}`,
        context: { moduleId: module.id, bartonNumber: module.bartonNumber },
        moduleId: module.id,
        bartonNumber: module.bartonNumber,
        escalationLevel: 0,
        autoResolved: false,
        requiresManualReview: false
      })
    }

    // Validate visual diagram
    if (!module.visualDiagram || !module.visualDiagram.filePath) {
      diagnostics.push({
        principle: BartonPrinciple.VISUAL_DOCUMENTATION,
        severity: 'warning',
        category: 'visual',
        message: `Missing visual diagram for module ${module.id}`,
        context: { moduleId: module.id },
        moduleId: module.id,
        bartonNumber: module.bartonNumber,
        escalationLevel: 0,
        autoResolved: false,
        requiresManualReview: false
      })
    }

    // Validate documentation
    if (!module.documentation.markdown || module.documentation.markdown.trim().length < 100) {
      diagnostics.push({
        principle: BartonPrinciple.VISUAL_DOCUMENTATION,
        severity: 'warning',
        category: 'orpt',
        message: `Insufficient documentation for module ${module.id}`,
        context: { moduleId: module.id, docLength: module.documentation.markdown?.length || 0 },
        moduleId: module.id,
        bartonNumber: module.bartonNumber,
        escalationLevel: 0,
        autoResolved: false,
        requiresManualReview: false
      })
    }

    // Log all diagnostics
    diagnostics.forEach(diagnostic => {
      this.logDiagnostic({
        principle: diagnostic.principle,
        severity: diagnostic.severity,
        category: diagnostic.category,
        message: diagnostic.message,
        context: diagnostic.context,
        moduleId: diagnostic.moduleId,
        bartonNumber: diagnostic.bartonNumber
      })
    })

    return diagnostics
  }

  private isValidBartonNumber(bartonNumber: string): boolean {
    // Barton number format: BlueprintID.ModuleID.SubmoduleID.StepID
    // Example: 39.02.01.01
    const pattern = /^\d+\.\d+\.\d+\.\d+$/
    return pattern.test(bartonNumber)
  }

  getDiagnostics(filters?: {
    severity?: string[]
    category?: string[]
    moduleId?: string
    principle?: BartonPrinciple[]
  }): BartonDiagnostic[] {
    let diagnostics = Array.from(this.diagnostics.values())

    if (filters) {
      if (filters.severity) {
        diagnostics = diagnostics.filter(d => filters.severity!.includes(d.severity))
      }
      if (filters.category) {
        diagnostics = diagnostics.filter(d => filters.category!.includes(d.category))
      }
      if (filters.moduleId) {
        diagnostics = diagnostics.filter(d => d.moduleId === filters.moduleId)
      }
      if (filters.principle) {
        diagnostics = diagnostics.filter(d => filters.principle!.includes(d.principle))
      }
    }

    return diagnostics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getSystemHealth() {
    const diagnostics = this.getDiagnostics()
    const totalDiagnostics = diagnostics.length
    const criticalDiagnostics = diagnostics.filter(d => d.severity === 'critical').length
    const errorDiagnostics = diagnostics.filter(d => d.severity === 'error').length
    const warningDiagnostics = diagnostics.filter(d => d.severity === 'warning').length
    const autoResolvedDiagnostics = diagnostics.filter(d => d.autoResolved).length
    const manualReviewRequired = diagnostics.filter(d => d.requiresManualReview).length

    return {
      totalDiagnostics,
      criticalDiagnostics,
      errorDiagnostics,
      warningDiagnostics,
      autoResolvedDiagnostics,
      manualReviewRequired,
      healthPercentage: totalDiagnostics > 0 ? 
        Math.round(((totalDiagnostics - criticalDiagnostics - errorDiagnostics) / totalDiagnostics) * 100) : 100
    }
  }

  exportDiagnostics(system: 'stamped' | 'spvpet' | 'stacked') {
    const diagnostics = this.getDiagnostics()
    return diagnostics.map(diagnostic => ({
      bartonId: diagnostic.bartonId,
      sessionId: diagnostic.sessionId,
      timestamp: diagnostic.timestamp,
      principle: diagnostic.principle,
      severity: diagnostic.severity,
      category: diagnostic.category,
      message: diagnostic.message,
      context: diagnostic.context,
      moduleId: diagnostic.moduleId,
      bartonNumber: diagnostic.bartonNumber,
      escalationLevel: diagnostic.escalationLevel,
      autoResolved: diagnostic.autoResolved,
      requiresManualReview: diagnostic.requiresManualReview,
      system
    }))
  }

  clearSession() {
    this.sessionId = `session-${Date.now()}`
  }
}

// Utility functions
export function logBartonEvent(
  principle: BartonPrinciple,
  message: string,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
  category: 'orpt' | 'schema' | 'visual' | 'error' | 'system' = 'system',
  context: Record<string, any> = {}
): string {
  const bartonSystem = EnhancedBartonSystem.getInstance()
  return bartonSystem.logDiagnostic({
    principle,
    severity,
    category,
    message,
    context
  })
}

export function validateBartonModule(module: ORPTModule): BartonDiagnostic[] {
  const bartonSystem = EnhancedBartonSystem.getInstance()
  return bartonSystem.validateModule(module)
} 