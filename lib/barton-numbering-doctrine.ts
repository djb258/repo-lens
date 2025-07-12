// 📌 Barton Numbering Doctrine Enforcement
// Reference: Neon table `dpr_doctrine`, section: ORBT + Barton Doctrine
// Blueprint ID: 39 (Repo Lens)

export interface BartonNumber {
  blueprintId: number
  module: number
  submodule: number
  file: number
  toString(): string
  validate(): boolean
  getHealthStatus(): 'green' | 'yellow' | 'red'
  getDescription(): string
}

export interface BartonComponent {
  id: string
  name: string
  type: 'module' | 'submodule' | 'page' | 'file' | 'ui_visual' | 'troubleshooting' | 'error_signature'
  bartonNumber: BartonNumber
  parentId?: string
  children: string[]
  healthStatus: 'green' | 'yellow' | 'red'
  lastUpdated: Date
  description: string
}

export class BartonNumberingDoctrine {
  private static instance: BartonNumberingDoctrine
  private components: Map<string, BartonComponent> = new Map()
  private readonly BLUEPRINT_ID = 39
  private readonly DOCTRINE_VERSION = '2.0.0'

  static getInstance(): BartonNumberingDoctrine {
    if (!BartonNumberingDoctrine.instance) {
      BartonNumberingDoctrine.instance = new BartonNumberingDoctrine()
    }
    return BartonNumberingDoctrine.instance
  }

  // Generate Barton Number from components
  generateBartonNumber(
    module: number,
    submodule: number,
    file: number
  ): BartonNumber {
    return {
      blueprintId: this.BLUEPRINT_ID,
      module,
      submodule,
      file,
      toString() {
        return `${this.blueprintId}.${this.module.toString().padStart(2, '0')}.${this.submodule.toString().padStart(2, '0')}.${this.file.toString().padStart(2, '0')}`
      },
      validate() {
        return this.blueprintId === 39 && 
               this.module >= 1 && this.module <= 99 &&
               this.submodule >= 1 && this.submodule <= 99 &&
               this.file >= 1 && this.file <= 99
      },
      getHealthStatus() {
        // Health status based on component validation
        return this.validate() ? 'green' : 'red'
      },
      getDescription() {
        return `Blueprint ${this.blueprintId}, Module ${this.module}, Submodule ${this.submodule}, File ${this.file}`
      }
    }
  }

  // Register component with Barton numbering
  registerComponent(
    id: string,
    name: string,
    type: BartonComponent['type'],
    module: number,
    submodule: number,
    file: number,
    description: string,
    parentId?: string
  ): BartonComponent {
    const bartonNumber = this.generateBartonNumber(module, submodule, file)
    
    const component: BartonComponent = {
      id,
      name,
      type,
      bartonNumber,
      parentId,
      children: [],
      healthStatus: bartonNumber.getHealthStatus(),
      lastUpdated: new Date(),
      description
    }

    // Add to parent's children if parent exists
    if (parentId) {
      const parent = this.components.get(parentId)
      if (parent) {
        parent.children.push(id)
      }
    }

    this.components.set(id, component)
    return component
  }

  // Get component by ID
  getComponent(id: string): BartonComponent | undefined {
    return this.components.get(id)
  }

  // Get component by Barton number
  getComponentByBartonNumber(bartonString: string): BartonComponent | undefined {
    return Array.from(this.components.values()).find(
      comp => comp.bartonNumber.toString() === bartonString
    )
  }

  // Get all components
  getAllComponents(): BartonComponent[] {
    return Array.from(this.components.values())
  }

  // Get components by type
  getComponentsByType(type: BartonComponent['type']): BartonComponent[] {
    return Array.from(this.components.values()).filter(comp => comp.type === type)
  }

  // Get hierarchical structure
  getHierarchy(): any {
    const hierarchy: any = {}
    
    this.components.forEach(component => {
      if (!component.parentId) {
        hierarchy[component.id] = {
          ...component,
          children: this.getChildrenRecursive(component.id)
        }
      }
    })
    
    return hierarchy
  }

  private getChildrenRecursive(parentId: string): any[] {
    const children: any[] = []
    
    this.components.forEach(component => {
      if (component.parentId === parentId) {
        children.push({
          ...component,
          children: this.getChildrenRecursive(component.id)
        })
      }
    })
    
    return children
  }

  // Update component health status
  updateComponentHealth(id: string, healthStatus: 'green' | 'yellow' | 'red'): void {
    const component = this.components.get(id)
    if (component) {
      component.healthStatus = healthStatus
      component.lastUpdated = new Date()
    }
  }

  // Validate all components
  validateAllComponents(): { valid: number; invalid: number; errors: string[] } {
    let valid = 0
    let invalid = 0
    const errors: string[] = []

    this.components.forEach(component => {
      if (component.bartonNumber.validate()) {
        valid++
      } else {
        invalid++
        errors.push(`Invalid Barton number for ${component.name}: ${component.bartonNumber.toString()}`)
      }
    })

    return { valid, invalid, errors }
  }

  // Generate Barton number for file path
  generateBartonNumberFromPath(filePath: string): BartonNumber {
    // Parse file path to determine module, submodule, file
    const parts = filePath.split('/')
    
    // Extract module number from path
    let module = 1
    let submodule = 1
    let file = 1

    // Parse module number from path like "01-github-index" -> 1
    const moduleMatch = filePath.match(/(\d+)-/)
    if (moduleMatch) {
      module = parseInt(moduleMatch[1])
    }

    // Parse submodule from path structure
    if (parts.includes('modules')) {
      const moduleIndex = parts.indexOf('modules')
      if (moduleIndex >= 0 && parts[moduleIndex + 1]) {
        const submoduleMatch = parts[moduleIndex + 1].match(/(\d+)-/)
        if (submoduleMatch) {
          submodule = parseInt(submoduleMatch[1])
        }
      }
    }

    // Generate file number based on path hash
    const pathHash = filePath.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    file = Math.abs(pathHash % 99) + 1

    return this.generateBartonNumber(module, submodule, file)
  }

  // Get color coding for health status
  getHealthColor(status: 'green' | 'yellow' | 'red'): string {
    switch (status) {
      case 'green': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'yellow': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'red': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
    }
  }

  // Get health icon
  getHealthIcon(status: 'green' | 'yellow' | 'red'): string {
    switch (status) {
      case 'green': return '🟢'
      case 'yellow': return '🟡'
      case 'red': return '🔴'
    }
  }

  // Export doctrine compliance report
  exportComplianceReport(): any {
    const validation = this.validateAllComponents()
    const components = this.getAllComponents()
    
    return {
      doctrineVersion: this.DOCTRINE_VERSION,
      blueprintId: this.BLUEPRINT_ID,
      totalComponents: components.length,
      validation,
      healthSummary: {
        green: components.filter(c => c.healthStatus === 'green').length,
        yellow: components.filter(c => c.healthStatus === 'yellow').length,
        red: components.filter(c => c.healthStatus === 'red').length
      },
      components: components.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        bartonNumber: c.bartonNumber.toString(),
        healthStatus: c.healthStatus,
        lastUpdated: c.lastUpdated,
        description: c.description
      }))
    }
  }

  // Auto-register components from file system
  autoRegisterFromFileSystem(): void {
    // Register core modules
    this.registerComponent(
      'github-index',
      'GitHub Repository Index',
      'module',
      1, 1, 1,
      'Main GitHub repository listing and search functionality'
    )

    this.registerComponent(
      'repo-overview',
      'Repository Overview',
      'module',
      2, 1, 1,
      '30,000-foot repository overview with metadata'
    )

    this.registerComponent(
      'visual-architecture',
      'Visual Architecture Map',
      'module',
      3, 1, 1,
      'Clickable, color-coded visual diagrams'
    )

    this.registerComponent(
      'module-detail',
      'Module Detail View',
      'module',
      4, 1, 1,
      'Detailed module metadata and file explorer'
    )

    this.registerComponent(
      'file-detail',
      'File Detail View',
      'module',
      5, 1, 1,
      'File content with syntax highlighting and ORPT compliance'
    )

    this.registerComponent(
      'error-log',
      'Error Log & Diagnostic View',
      'module',
      6, 1, 1,
      'Centralized error monitoring and diagnostic tracking'
    )

    this.registerComponent(
      'orpt-cleanups',
      'ORPT + Barton Doctrine Cleanups',
      'module',
      7, 1, 1,
      'Universal color-coding, automated page generation, schema validation'
    )

    // Register submodules and files
    this.registerComponent(
      'github-index-page',
      'GitHub Index Page',
      'page',
      1, 1, 1,
      'Main page component for GitHub repository index',
      'github-index'
    )

    this.registerComponent(
      'github-api-route',
      'GitHub API Route',
      'file',
      1, 1, 2,
      'GitHub API integration service',
      'github-index'
    )

    this.registerComponent(
      'orpt-system',
      'ORPT System',
      'file',
      1, 0, 1,
      'ORPT system utilities and types',
      'github-index'
    )

    this.registerComponent(
      'enhanced-barton',
      'Enhanced Barton System',
      'file',
      1, 0, 2,
      'Enhanced Barton doctrine system',
      'github-index'
    )

    // Register UI visuals
    this.registerComponent(
      'repo-card',
      'Repository Card',
      'ui_visual',
      1, 1, 3,
      'Individual repository display component',
      'github-index-page'
    )

    this.registerComponent(
      'search-bar',
      'Search Bar',
      'ui_visual',
      1, 1, 4,
      'Search and filter interface component',
      'github-index-page'
    )

    // Register troubleshooting logs
    this.registerComponent(
      'github-auth-error',
      'GitHub Auth Error',
      'troubleshooting',
      1, 1, 5,
      'GitHub API authentication error troubleshooting',
      'github-index'
    )

    this.registerComponent(
      'rate-limit-error',
      'Rate Limit Error',
      'troubleshooting',
      1, 1, 6,
      'API rate limiting error troubleshooting',
      'github-index'
    )

    // Register error signatures
    this.registerComponent(
      'GITHUB_AUTH_FAILED',
      'GitHub Auth Failed',
      'error_signature',
      1, 1, 7,
      'GitHub API authentication failure signature',
      'github-index'
    )

    this.registerComponent(
      'RATE_LIMIT_TIMEOUT',
      'Rate Limit Timeout',
      'error_signature',
      1, 1, 8,
      'API rate limiting timeout signature',
      'github-index'
    )
  }
}

// Utility functions for Barton numbering
export function formatBartonNumber(blueprintId: number, module: number, submodule: number, file: number): string {
  return `${blueprintId}.${module.toString().padStart(2, '0')}.${submodule.toString().padStart(2, '0')}.${file.toString().padStart(2, '0')}`
}

export function parseBartonNumber(bartonString: string): { blueprintId: number; module: number; submodule: number; file: number } | null {
  const match = bartonString.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (match) {
    return {
      blueprintId: parseInt(match[1]),
      module: parseInt(match[2]),
      submodule: parseInt(match[3]),
      file: parseInt(match[4])
    }
  }
  return null
}

export function validateBartonNumber(bartonString: string): boolean {
  const parsed = parseBartonNumber(bartonString)
  if (!parsed) return false
  
  return parsed.blueprintId === 39 && 
         parsed.module >= 1 && parsed.module <= 99 &&
         parsed.submodule >= 1 && parsed.submodule <= 99 &&
         parsed.file >= 1 && parsed.file <= 99
}

// React component for displaying Barton numbers
export function BartonNumberDisplay({ 
  bartonNumber, 
  showIcon = true, 
  showDescription = false,
  className = ''
}: {
  bartonNumber: string
  showIcon?: boolean
  showDescription?: boolean
  className?: string
}) {
  const isValid = validateBartonNumber(bartonNumber)
  const healthStatus = isValid ? 'green' : 'red'
  
  const doctrine = BartonNumberingDoctrine.getInstance()
  const component = doctrine.getComponentByBartonNumber(bartonNumber)
  const healthColor = doctrine.getHealthColor(healthStatus)
  const healthIcon = doctrine.getHealthIcon(healthStatus)

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <span className="text-sm">{healthIcon}</span>
      )}
      <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${healthColor}`}>
        {bartonNumber}
      </span>
      {showDescription && component && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {component.description}
        </span>
      )}
    </div>
  )
} 