// ORBT Troubleshooting Log System
// Sends RED and YELLOW diagnostics to centralized error logs (Firebase, Neon, etc.)
// Tracks repeat YELLOW codes and escalates to RED if repeated ≥3 times

import { DiagnosticEvent, Severity } from './diagnostics'

interface TroubleshootingEntry {
  id: string
  udns: string
  severity: Severity
  message: string
  timestamp: string
  file?: string
  line?: number
  details?: any
  repeatCount: number
  escalated: boolean
  centralizedLogId?: string
}

interface CentralizedLogEntry {
  blueprint_id: string
  diagnostic_code: string
  severity: Severity
  status: string
  timestamp: string
  message: string
  details?: any
  file_reference?: string
  line_number?: number
  repeat_count: number
  escalated: boolean
}

export class TroubleshootingLog {
  private static instance: TroubleshootingLog
  private entries: Map<string, TroubleshootingEntry> = new Map()
  private yellowRepeatThreshold = 3
  private centralizedLogUrl: string | null = null

  private constructor() {
    // Load centralized log URL from environment
    this.centralizedLogUrl = process.env.CENTRALIZED_LOG_URL || null
  }

  static getInstance(): TroubleshootingLog {
    if (!TroubleshootingLog.instance) {
      TroubleshootingLog.instance = new TroubleshootingLog()
    }
    return TroubleshootingLog.instance
  }

  // Log a diagnostic event with escalation logic
  async logDiagnostic(event: DiagnosticEvent): Promise<void> {
    const { severity, diagnostic_code: udns } = event

    // Always log RED diagnostics immediately
    if (severity === Severity.RED) {
      await this.logToCentralized(event, 1, false)
      return
    }

    // Handle YELLOW diagnostics with repeat tracking
    if (severity === Severity.YELLOW) {
      const entryKey = `${udns}-${event.file || 'unknown'}`
      const existingEntry = this.entries.get(entryKey)

      if (existingEntry) {
        // Increment repeat count
        existingEntry.repeatCount++
        existingEntry.timestamp = new Date().toISOString()

        // Check if we should escalate
        if (existingEntry.repeatCount >= this.yellowRepeatThreshold && !existingEntry.escalated) {
          existingEntry.escalated = true
          await this.logToCentralized(event, existingEntry.repeatCount, true)
        } else if (existingEntry.repeatCount >= this.yellowRepeatThreshold) {
          // Log repeated YELLOW after threshold
          await this.logToCentralized(event, existingEntry.repeatCount, false)
        }
      } else {
        // First occurrence of this YELLOW diagnostic
        const newEntry: TroubleshootingEntry = {
          id: entryKey,
          udns,
          severity,
          message: event.message,
          timestamp: event.timestamp,
          file: event.file,
          line: event.line_number,
          details: event.details,
          repeatCount: 1,
          escalated: false
        }
        this.entries.set(entryKey, newEntry)
      }
    }
  }

  // Send to centralized error log (Firebase, Neon, etc.)
  private async logToCentralized(
    event: DiagnosticEvent, 
    repeatCount: number, 
    escalated: boolean
  ): Promise<void> {
    if (!this.centralizedLogUrl) {
      console.warn('No centralized log URL configured, skipping centralized logging')
      return
    }

    const logEntry: CentralizedLogEntry = {
      blueprint_id: event.blueprint_id,
      diagnostic_code: event.diagnostic_code,
      severity: event.severity,
      status: escalated ? 'ESCALATED' : event.status,
      timestamp: event.timestamp,
      message: event.message,
      details: event.details,
      file_reference: event.module_path,
      line_number: event.line_number,
      repeat_count: repeatCount,
      escalated
    }

    try {
      const response = await fetch(this.centralizedLogUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CENTRALIZED_LOG_TOKEN || ''}`
        },
        body: JSON.stringify(logEntry)
      })

      if (!response.ok) {
        console.error('Failed to send to centralized log:', response.status, response.statusText)
      } else {
        console.log(`✅ Logged to centralized system: ${event.diagnostic_code} (${event.severity})`)
      }
    } catch (error) {
      console.error('Error sending to centralized log:', error)
    }
  }

  // Get all troubleshooting entries
  getEntries(): TroubleshootingEntry[] {
    return Array.from(this.entries.values())
  }

  // Get entries by severity
  getEntriesBySeverity(severity: Severity): TroubleshootingEntry[] {
    return this.getEntries().filter(entry => entry.severity === severity)
  }

  // Get escalated entries
  getEscalatedEntries(): TroubleshootingEntry[] {
    return this.getEntries().filter(entry => entry.escalated)
  }

  // Get entries by UDNS code
  getEntriesByUDNS(udns: string): TroubleshootingEntry[] {
    return this.getEntries().filter(entry => entry.udns === udns)
  }

  // Get repeat count for a specific diagnostic
  getRepeatCount(udns: string, file?: string): number {
    const entryKey = `${udns}-${file || 'unknown'}`
    const entry = this.entries.get(entryKey)
    return entry?.repeatCount || 0
  }

  // Check if a diagnostic should be escalated
  shouldEscalate(udns: string, file?: string): boolean {
    const entryKey = `${udns}-${file || 'unknown'}`
    const entry = this.entries.get(entryKey)
    return entry ? entry.repeatCount >= this.yellowRepeatThreshold : false
  }

  // Clear all entries (for testing)
  clear(): void {
    this.entries.clear()
  }

  // Export entries for analysis
  exportEntries(): string {
    return JSON.stringify(this.getEntries(), null, 2)
  }

  // Generate troubleshooting report
  generateReport(): string {
    const entries = this.getEntries()
    const redCount = entries.filter(e => e.severity === Severity.RED).length
    const yellowCount = entries.filter(e => e.severity === Severity.YELLOW).length
    const escalatedCount = entries.filter(e => e.escalated).length

    const report = [
      '🔧 ORBT Troubleshooting Report',
      '='.repeat(50),
      '',
      `📊 Summary:`,
      `  Total Entries: ${entries.length}`,
      `  RED Diagnostics: ${redCount}`,
      `  YELLOW Diagnostics: ${yellowCount}`,
      `  Escalated: ${escalatedCount}`,
      '',
      `⚙️  Configuration:`,
      `  Yellow Repeat Threshold: ${this.yellowRepeatThreshold}`,
      `  Centralized Log: ${this.centralizedLogUrl ? 'Configured' : 'Not configured'}`,
      ''
    ]

    if (entries.length > 0) {
      report.push('📋 Recent Entries:')
      entries
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
        .forEach((entry, index) => {
          report.push(`  ${index + 1}. ${entry.udns} (${entry.severity})`)
          report.push(`     Message: ${entry.message}`)
          report.push(`     Repeat Count: ${entry.repeatCount}`)
          if (entry.escalated) {
            report.push(`     ⚠️  ESCALATED`)
          }
          report.push('')
        })
    }

    return report.join('\n')
  }
}

// Convenience function for logging diagnostics
export async function logTroubleshooting(event: DiagnosticEvent): Promise<void> {
  const log = TroubleshootingLog.getInstance()
  await log.logDiagnostic(event)
}

// Export the singleton instance
export const troubleshootingLog = TroubleshootingLog.getInstance() 