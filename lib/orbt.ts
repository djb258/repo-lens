// ORBT Diagnostic System (Universal, Doctrine-Compliant)
// This module is designed for drop-in reuse across all future apps.

import { Severity } from './diagnostics'

export type UDNS = string // e.g. '10.UI.login.formRender'

export interface DiagnosticMap {
  system_key: {
    [udns: string]: {
      description: string
      recommended_action?: string
    }
  }
  color_legend: {
    [udns: string]: 'GREEN' | 'YELLOW' | 'RED'
  }
}

// Load and cache the diagnostic_map.json for a repo
const diagnosticMapCache: Record<string, DiagnosticMap | null> = {}

export async function loadDiagnosticMap(owner: string, repo: string): Promise<DiagnosticMap | null> {
  const cacheKey = `${owner}/${repo}`
  if (diagnosticMapCache[cacheKey]) return diagnosticMapCache[cacheKey]
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/diagnostic_map.json`)
    if (!res.ok) return null
    const map = await res.json()
    diagnosticMapCache[cacheKey] = map
    return map
  } catch {
    return null
  }
}

// Get color for a UDNS code from the loaded map
export function getUDNSColor(map: DiagnosticMap | null, udns: UDNS): 'GREEN' | 'YELLOW' | 'RED' {
  if (!map) return 'GREEN'
  return map.color_legend[udns] || 'GREEN'
}

// Get description for a UDNS code
export function getUDNSDescription(map: DiagnosticMap | null, udns: UDNS): string {
  if (!map) return ''
  return map.system_key[udns]?.description || ''
}

// Get all UDNS codes for a repo
export function getAllUDNS(map: DiagnosticMap | null): UDNS[] {
  if (!map) return []
  return Object.keys(map.system_key)
}

// Check if a UDNS code is RED (critical failure or ORBT non-compliance)
export function isUDNSRed(map: DiagnosticMap | null, udns: UDNS): boolean {
  return getUDNSColor(map, udns) === 'RED'
}

// Check if a UDNS code is YELLOW (soft issue, only log if repeated)
export function isUDNSYellow(map: DiagnosticMap | null, udns: UDNS): boolean {
  return getUDNSColor(map, udns) === 'YELLOW'
}

// Check if a UDNS code is GREEN (no error)
export function isUDNSGreen(map: DiagnosticMap | null, udns: UDNS): boolean {
  return getUDNSColor(map, udns) === 'GREEN'
}

// Utility: Log a diagnostic event with ORBT color logic
export function logORBTDiagnostic({
  udns,
  map,
  message,
  details,
  error,
  repeated = false,
}: {
  udns: UDNS
  map: DiagnosticMap | null
  message: string
  details?: any
  error?: Error
  repeated?: boolean
}) {
  const color = getUDNSColor(map, udns)
  if (color === 'GREEN') {
    // Only log if explicitly requested
    return
  }
  if (color === 'YELLOW' && !repeated) {
    // Only log YELLOW if repeated
    return
  }
  // Always log RED
  // Use the main diagnostics system for actual logging
  // (Assume Diagnostics is imported in the consumer)
  // Example:
  // Diagnostics.error(...)
  // Here, just return the log object for consumer
  return {
    udns,
    color,
    message,
    details,
    error,
    timestamp: new Date().toISOString(),
  }
} 