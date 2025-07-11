"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { DiagnosticMap, loadDiagnosticMap } from '@/lib/orbt'

interface DiagnosticMapContextValue {
  diagnosticMap: DiagnosticMap | null
  loading: boolean
  error: string | null
}

const DiagnosticMapContext = createContext<DiagnosticMapContextValue>({
  diagnosticMap: null,
  loading: false,
  error: null,
})

export function useDiagnosticMap() {
  return useContext(DiagnosticMapContext)
}

interface DiagnosticMapProviderProps {
  owner: string
  repo: string
  children: React.ReactNode
}

export function DiagnosticMapProvider({ owner, repo, children }: DiagnosticMapProviderProps) {
  const [diagnosticMap, setDiagnosticMap] = useState<DiagnosticMap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    setDiagnosticMap(null)
    loadDiagnosticMap(owner, repo)
      .then((map) => {
        if (mounted) {
          setDiagnosticMap(map)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError('Failed to load diagnostic_map.json')
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [owner, repo])

  return (
    <DiagnosticMapContext.Provider value={{ diagnosticMap, loading, error }}>
      {children}
    </DiagnosticMapContext.Provider>
  )
} 