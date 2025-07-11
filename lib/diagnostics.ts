// Universal Diagnostic Tracking System (ORBT Doctrine)
// Blueprint ID: BP-039 (RepoLens Application)

import { logTroubleshooting } from './troubleshooting_log'

export const BLUEPRINT_ID = 'BP-039'

// Altitude levels for UDNS codes
export enum Altitude {
  GROUND = '00',      // Ground level - file system, basic operations
  DETAIL = '05',      // 5k ft - function level detail
  MODULE = '10',      // 10k ft - module level operations
  COMPONENT = '20',   // 20k ft - component interactions
  SERVICE = '30',     // 30k ft - service level operations
  SYSTEM = '40',      // 40k ft - system level operations
}

// Module categories
export enum Module {
  UI = 'UI',           // User Interface components
  API = 'API',         // API endpoints and handlers
  DATABASE = 'DATABASE', // Database operations
  GITHUB = 'GITHUB',   // GitHub API operations
  VISUALS = 'VISUALS', // Visual file processing
  NAVIGATION = 'NAV',  // Navigation and routing
  AUTH = 'AUTH',       // Authentication and authorization
  PARSER = 'PARSER',   // File parsing operations
  MERMAID = 'MERMAID', // Mermaid diagram processing
  UTILS = 'UTILS',     // Utility functions
}

// Submodule categories
export enum Submodule {
  // UI Submodules
  REPO_CARD = 'repo-card',
  BREADCRUMB = 'breadcrumb',
  ALTITUDE_MARKER = 'altitude-marker',
  FIX_BUTTON = 'fix-button',
  INLINE_COMMENT = 'inline-comment',
  MERMAID_DIAGRAM = 'mermaid-diagram',
  SEARCH = 'search',
  
  // API Submodules
  REPOSITORIES = 'repositories',
  REPOSITORY = 'repository',
  CONTENTS = 'contents',
  FILE_CONTENT = 'file-content',
  WEBHOOK = 'webhook',
  
  // Database Submodules
  NEON = 'neon',
  ERROR_LOG = 'error-log',
  DIAGNOSTIC_LOG = 'diagnostic-log',
  
  // GitHub Submodules
  AUTH = 'auth',
  REPO_FETCH = 'repo-fetch',
  FILE_FETCH = 'file-fetch',
  PARSE_REPO = 'parse-repo',
  
  // Visuals Submodules
  INDEX_YAML = 'index-yaml',
  FUNCTION_DOC = 'function-doc',
  OVERVIEW_MMD = 'overview-mmd',
  ISSUE_LOG = 'issue-log',
  FIXES_LOG = 'fixes-log',
  
  // Navigation Submodules
  ROUTING = 'routing',
  REDIRECT = 'redirect',
  PARAMS = 'params',
  
  // Parser Submodules
  YAML_PARSE = 'yaml-parse',
  MARKDOWN_PARSE = 'markdown-parse',
  MERMAID_PARSE = 'mermaid-parse',
  
  // Mermaid Submodules
  ENHANCE = 'enhance',
  COLOR_CODE = 'color-code',
  TOOLTIP = 'tooltip',
  
  // Utils Submodules
  VALIDATION = 'validation',
  FORMATTING = 'formatting',
  ERROR_HANDLING = 'error-handling',
}

// Action types
export enum Action {
  // Read operations
  READ = 'read',
  FETCH = 'fetch',
  LOAD = 'load',
  PARSE = 'parse',
  RENDER = 'render',
  DISPLAY = 'display',
  START = 'start',
  
  // Write operations
  WRITE = 'write',
  SAVE = 'save',
  UPDATE = 'update',
  CREATE = 'create',
  DELETE = 'delete',
  
  // Validation operations
  VALIDATE = 'validate',
  CHECK = 'check',
  VERIFY = 'verify',
  
  // Error operations
  ERROR = 'error',
  WARNING = 'warning',
  FAIL = 'fail',
  TIMEOUT = 'timeout',
  
  // Success operations
  SUCCESS = 'success',
  COMPLETE = 'complete',
  
  // Navigation operations
  NAVIGATE = 'navigate',
  REDIRECT = 'redirect',
  ROUTE = 'route',
  
  // Processing operations
  PROCESS = 'process',
  TRANSFORM = 'transform',
  ENHANCE = 'enhance',
  FILTER = 'filter',
  SORT = 'sort',
}

// Severity levels
export enum Severity {
  GREEN = 'GREEN',     // Success, no issues
  YELLOW = 'YELLOW',   // Warning, minor issues
  ORANGE = 'ORANGE',   // Critical, multiple issues
  RED = 'RED',         // Escalated, human intervention required
}

// Status types
export enum Status {
  SUCCESS = 'SUCCESS',
  FAILED_VALIDATION = 'FAILED_VALIDATION',
  FAILED_AUTHENTICATION = 'FAILED_AUTHENTICATION',
  FAILED_FETCH = 'FAILED_FETCH',
  FAILED_PARSE = 'FAILED_PARSE',
  FAILED_RENDER = 'FAILED_RENDER',
  TIMEOUT = 'TIMEOUT',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED',
  ESCALATED = 'ESCALATED',
}

// Diagnostic Event Interface
export interface DiagnosticEvent {
  blueprint_id: string
  diagnostic_code: string
  severity: Severity
  status: Status
  timestamp: string
  message: string
  details?: any
  stack_trace?: string
  user_agent?: string
  url?: string
  module_path?: string
  function_name?: string
  line_number?: number
}

// UDNS Code Generator
export function generateUDNS(
  altitude: Altitude,
  module: Module,
  submodule: Submodule,
  action: Action
): string {
  return `${altitude}.${module}.${submodule}.${action}`
}

// Diagnostic Logger
export class DiagnosticLogger {
  private static instance: DiagnosticLogger
  private errorLog: DiagnosticEvent[] = []
  private isProduction: boolean

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  static getInstance(): DiagnosticLogger {
    if (!DiagnosticLogger.instance) {
      DiagnosticLogger.instance = new DiagnosticLogger()
    }
    return DiagnosticLogger.instance
  }

  // Log a diagnostic event
  log(
    altitude: Altitude,
    module: Module,
    submodule: Submodule,
    action: Action,
    severity: Severity,
    status: Status,
    message: string,
    details?: any,
    error?: Error
  ): void {
    const diagnosticCode = generateUDNS(altitude, module, submodule, action)
    const event: DiagnosticEvent = {
      blueprint_id: BLUEPRINT_ID,
      diagnostic_code: diagnosticCode,
      severity,
      status,
      timestamp: new Date().toISOString(),
      message,
      details,
      stack_trace: error?.stack,
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }

    // Add to local log
    this.errorLog.push(event)

    // Send to troubleshooting log for RED and YELLOW diagnostics
    if (severity === Severity.RED || severity === Severity.YELLOW) {
      logTroubleshooting(event).catch(err => {
        console.error('Failed to log to troubleshooting system:', err)
      })
    }

    // Console output with blueprint ID
    const logMessage = `${BLUEPRINT_ID}::${diagnosticCode} - ${severity} - ${status} - ${message}`
    
    switch (severity) {
      case Severity.GREEN:
        console.log(logMessage)
        break
      case Severity.YELLOW:
        console.warn(logMessage)
        break
      case Severity.ORANGE:
        console.error(logMessage)
        break
      case Severity.RED:
        console.error(`🚨 ${logMessage}`)
        break
    }

    // In production, send to centralized log
    if (this.isProduction) {
      this.sendToCentralizedLog(event)
    }
  }

  // Send to centralized Neon database
  private async sendToCentralizedLog(event: DiagnosticEvent): Promise<void> {
    try {
      // TODO: Implement Neon database connection
      // This would typically use a service like Neon's serverless driver
      console.log('Sending to centralized log:', event)
    } catch (error) {
      console.error('Failed to send to centralized log:', error)
    }
  }

  // Get all diagnostic events
  getDiagnosticEvents(): DiagnosticEvent[] {
    return [...this.errorLog]
  }

  // Get events by severity
  getEventsBySeverity(severity: Severity): DiagnosticEvent[] {
    return this.errorLog.filter(event => event.severity === severity)
  }

  // Get events by module
  getEventsByModule(module: Module): DiagnosticEvent[] {
    return this.errorLog.filter(event => 
      event.diagnostic_code.includes(`${module}.`)
    )
  }

  // Get escalated events (RED severity)
  getEscalatedEvents(): DiagnosticEvent[] {
    return this.getEventsBySeverity(Severity.RED)
  }

  // Clear log (for testing)
  clearLog(): void {
    this.errorLog = []
  }
}

// Convenience functions for common diagnostic scenarios
export const Diagnostics = {
  // Success logging
  success: (
    altitude: Altitude,
    module: Module,
    submodule: Submodule,
    action: Action,
    message: string,
    details?: any
  ) => {
    const logger = DiagnosticLogger.getInstance()
    logger.log(altitude, module, submodule, action, Severity.GREEN, Status.SUCCESS, message, details)
  },

  // Warning logging
  warning: (
    altitude: Altitude,
    module: Module,
    submodule: Submodule,
    action: Action,
    message: string,
    details?: any
  ) => {
    const logger = DiagnosticLogger.getInstance()
    logger.log(altitude, module, submodule, action, Severity.YELLOW, Status.FAILED_VALIDATION, message, details)
  },

  // Error logging
  error: (
    altitude: Altitude,
    module: Module,
    submodule: Submodule,
    action: Action,
    message: string,
    error?: Error,
    details?: any
  ) => {
    const logger = DiagnosticLogger.getInstance()
    logger.log(altitude, module, submodule, action, Severity.ORANGE, Status.FAILED_FETCH, message, details, error)
  },

  // Escalation logging
  escalate: (
    altitude: Altitude,
    module: Module,
    submodule: Submodule,
    action: Action,
    message: string,
    error?: Error,
    details?: any
  ) => {
    const logger = DiagnosticLogger.getInstance()
    logger.log(altitude, module, submodule, action, Severity.RED, Status.ESCALATED, message, details, error)
  },

  // Authentication failure
  authFailure: (
    altitude: Altitude,
    module: Module,
    submodule: Submodule,
    action: Action,
    message: string,
    details?: any
  ) => {
    const logger = DiagnosticLogger.getInstance()
    logger.log(altitude, module, submodule, action, Severity.RED, Status.FAILED_AUTHENTICATION, message, details)
  },

  // Validation failure
  validationFailure: (
    altitude: Altitude,
    module: Module,
    submodule: Submodule,
    action: Action,
    message: string,
    details?: any
  ) => {
    const logger = DiagnosticLogger.getInstance()
    logger.log(altitude, module, submodule, action, Severity.YELLOW, Status.FAILED_VALIDATION, message, details)
  },

  // Parse failure
  parseFailure: (
    altitude: Altitude,
    module: Module,
    submodule: Submodule,
    action: Action,
    message: string,
    error?: Error,
    details?: any
  ) => {
    const logger = DiagnosticLogger.getInstance()
    logger.log(altitude, module, submodule, action, Severity.ORANGE, Status.FAILED_PARSE, message, details, error)
  },

  // Render failure
  renderFailure: (
    altitude: Altitude,
    module: Module,
    submodule: Submodule,
    action: Action,
    message: string,
    error?: Error,
    details?: any
  ) => {
    const logger = DiagnosticLogger.getInstance()
    logger.log(altitude, module, submodule, action, Severity.ORANGE, Status.FAILED_RENDER, message, details, error)
  },
}

// Hook for React components to track diagnostic events
export function useDiagnostics() {
  return {
    log: Diagnostics.success,
    warn: Diagnostics.warning,
    error: Diagnostics.error,
    escalate: Diagnostics.escalate,
    authFailure: Diagnostics.authFailure,
    validationFailure: Diagnostics.validationFailure,
    parseFailure: Diagnostics.parseFailure,
    renderFailure: Diagnostics.renderFailure,
  }
}

// Export the logger instance
export const diagnosticLogger = DiagnosticLogger.getInstance() 