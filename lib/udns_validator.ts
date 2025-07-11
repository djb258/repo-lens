import fs from 'fs'
import path from 'path'

interface DiagnosticMap {
  udns_codes: Record<string, any>
  validation_rules: {
    udns_format: {
      pattern: string
    }
    altitude_range: {
      min: number
      max: number
    }
  }
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  summary: {
    totalFiles: number
    totalUDNSCodes: number
    validCodes: number
    invalidCodes: number
    undocumentedCodes: number
  }
}

interface ValidationError {
  type: 'INVALID_FORMAT' | 'INVALID_ALTITUDE' | 'UNDOCUMENTED_CODE' | 'MISSING_MAP'
  message: string
  file: string
  line?: number
  udns?: string
}

interface ValidationWarning {
  type: 'DEPRECATED_CODE' | 'MISSING_RECOMMENDATION'
  message: string
  file: string
  line?: number
  udns?: string
}

export class UDNSValidator {
  private diagnosticMap: DiagnosticMap | null = null
  private scannedFiles: Set<string> = new Set()
  private foundUDNSCodes: Set<string> = new Set()

  constructor(private projectRoot: string = process.cwd()) {}

  async loadDiagnosticMap(): Promise<void> {
    const mapPath = path.join(this.projectRoot, 'diagnostic_map.json')
    
    if (!fs.existsSync(mapPath)) {
      throw new Error('diagnostic_map.json not found in project root')
    }

    try {
      const mapContent = fs.readFileSync(mapPath, 'utf-8')
      this.diagnosticMap = JSON.parse(mapContent)
    } catch (error) {
      throw new Error(`Failed to parse diagnostic_map.json: ${error}`)
    }
  }

  async validateProject(): Promise<ValidationResult> {
    await this.loadDiagnosticMap()
    
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: {
        totalFiles: 0,
        totalUDNSCodes: 0,
        validCodes: 0,
        invalidCodes: 0,
        undocumentedCodes: 0
      }
    }

    // Scan specific directories manually
    const scanDirs = ['lib', 'app', 'components', 'scripts']
    
    for (const dir of scanDirs) {
      const dirPath = path.join(this.projectRoot, dir)
      if (fs.existsSync(dirPath)) {
        await this.scanDirectory(dirPath, result)
      }
    }

    // Check for undocumented codes
    const documentedCodes = new Set(Object.keys(this.diagnosticMap!.udns_codes))
    for (const foundCode of Array.from(this.foundUDNSCodes)) {
      if (!documentedCodes.has(foundCode)) {
        result.errors.push({
          type: 'UNDOCUMENTED_CODE',
          message: `UDNS code '${foundCode}' is used in code but not documented in diagnostic_map.json`,
          file: 'diagnostic_map.json',
          udns: foundCode
        })
        result.summary.undocumentedCodes++
      }
    }

    result.isValid = result.errors.length === 0
    return result
  }

  private async scanDirectory(dirPath: string, result: ValidationResult): Promise<void> {
    const files = fs.readdirSync(dirPath)
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        await this.scanDirectory(fullPath, result)
      } else if (this.shouldScanFile(file)) {
        await this.validateFile(fullPath, result)
        result.summary.totalFiles++
      }
    }
  }

  private shouldScanFile(filename: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
    return extensions.some(ext => filename.endsWith(ext))
  }

  private async validateFile(filePath: string, result: ValidationResult): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')
      
      for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
        const line = lines[lineNumber - 1]
        const udnsCodes = this.extractUDNSCodes(line)
        
        for (const udns of udnsCodes) {
          this.foundUDNSCodes.add(udns)
          result.summary.totalUDNSCodes++
          
          const validation = this.validateUDNSCode(udns)
          if (validation.isValid) {
            result.summary.validCodes++
          } else {
            result.summary.invalidCodes++
            if (validation.errorType && validation.message) {
              result.errors.push({
                type: validation.errorType,
                message: validation.message,
                file: path.relative(this.projectRoot, filePath),
                line: lineNumber,
                udns
              })
            }
          }
        }
      }
    } catch (error) {
      result.errors.push({
        type: 'MISSING_MAP',
        message: `Failed to read file: ${error}`,
        file: path.relative(this.projectRoot, filePath)
      })
    }
  }

  private extractUDNSCodes(content: string): string[] {
    // Match UDNS pattern: XX.MODULE.submodule.action
    const udnsPattern = /\b\d{2}\.[A-Z]+\.[a-z-]+\.[a-z]+\b/g
    const matches = content.match(udnsPattern) || []
    return Array.from(new Set(matches)) // Remove duplicates
  }

  private validateUDNSCode(udns: string): { isValid: boolean; errorType?: ValidationError['type']; message?: string } {
    if (!this.diagnosticMap) {
      return {
        isValid: false,
        errorType: 'MISSING_MAP',
        message: 'Diagnostic map not loaded'
      }
    }

    // Check format
    const formatPattern = new RegExp(this.diagnosticMap.validation_rules.udns_format.pattern)
    if (!formatPattern.test(udns)) {
      return {
        isValid: false,
        errorType: 'INVALID_FORMAT',
        message: `UDNS code '${udns}' does not match required format: ${this.diagnosticMap.validation_rules.udns_format.pattern}`
      }
    }

    // Check altitude range
    const altitude = parseInt(udns.split('.')[0])
    const { min, max } = this.diagnosticMap.validation_rules.altitude_range
    if (altitude < min || altitude > max) {
      return {
        isValid: false,
        errorType: 'INVALID_ALTITUDE',
        message: `Altitude ${altitude} is outside valid range [${min}-${max}]`
      }
    }

    // Check if documented
    if (!this.diagnosticMap.udns_codes[udns]) {
      return {
        isValid: false,
        errorType: 'UNDOCUMENTED_CODE',
        message: `UDNS code '${udns}' is not documented in diagnostic_map.json`
      }
    }

    return { isValid: true }
  }

  generateReport(result: ValidationResult): string {
    const report = [
      '🔍 UDNS Validation Report',
      '='.repeat(50),
      '',
      `📊 Summary:`,
      `  Total Files Scanned: ${result.summary.totalFiles}`,
      `  Total UDNS Codes Found: ${result.summary.totalUDNSCodes}`,
      `  Valid Codes: ${result.summary.validCodes}`,
      `  Invalid Codes: ${result.summary.invalidCodes}`,
      `  Undocumented Codes: ${result.summary.undocumentedCodes}`,
      '',
      `✅ Status: ${result.isValid ? 'PASSED' : 'FAILED'}`,
      ''
    ]

    if (result.errors.length > 0) {
      report.push('❌ Errors:')
      result.errors.forEach((error, index) => {
        report.push(`  ${index + 1}. ${error.type}: ${error.message}`)
        if (error.file && error.line) {
          report.push(`     File: ${error.file}:${error.line}`)
        }
        if (error.udns) {
          report.push(`     UDNS: ${error.udns}`)
        }
        report.push('')
      })
    }

    if (result.warnings.length > 0) {
      report.push('⚠️  Warnings:')
      result.warnings.forEach((warning, index) => {
        report.push(`  ${index + 1}. ${warning.type}: ${warning.message}`)
        if (warning.file && warning.line) {
          report.push(`     File: ${warning.file}:${warning.line}`)
        }
        report.push('')
      })
    }

    return report.join('\n')
  }
}

// CLI usage
if (require.main === module) {
  const validator = new UDNSValidator()
  
  validator.validateProject()
    .then(result => {
      console.log(validator.generateReport(result))
      process.exit(result.isValid ? 0 : 1)
    })
    .catch(error => {
      console.error('Validation failed:', error.message)
      process.exit(1)
    })
} 