'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { contextPersistence, ConversationContext, PersistentContext } from '../lib/context-persistence'

interface ContextPersistenceContextType {
  // Context management
  addConversationContext: (context: ConversationContext) => void
  getRepositoryHistory: (owner: string, repo: string, limit?: number) => ConversationContext[]
  getRecentRepositories: (limit?: number) => Array<{ owner: string; repo: string; lastAccessed: Date; accessCount: number }>
  
  // User preferences
  userPreferences: {
    preferredAltitude: number
    showDiagnostics: boolean
    autoExpandModules: boolean
    theme: 'light' | 'dark' | 'auto'
  }
  updateUserPreferences: (preferences: Partial<{
    preferredAltitude: number
    showDiagnostics: boolean
    autoExpandModules: boolean
    theme: 'light' | 'dark' | 'auto'
  }>) => void
  
  // Custom notes
  addCustomNote: (repoPath: string, content: string, tags?: string[]) => string
  getCustomNotes: (repoPath: string) => Array<{ id: string; content: string; timestamp: Date; tags: string[] }>
  
  // Context summary for LLM
  getContextSummary: (repoContext?: { owner: string; repo: string; module?: string; function?: string }) => string
  
  // Utility functions
  exportContext: () => string
  importContext: (contextJson: string) => boolean
  clearContext: () => void
  
  // State
  isInitialized: boolean
  lastUpdated: Date | null
}

const ContextPersistenceContext = createContext<ContextPersistenceContextType | undefined>(undefined)

export function useContextPersistence() {
  const context = useContext(ContextPersistenceContext)
  if (context === undefined) {
    throw new Error('useContextPersistence must be used within a ContextPersistenceProvider')
  }
  return context
}

interface ContextPersistenceProviderProps {
  children: ReactNode
}

export function ContextPersistenceProvider({ children }: ContextPersistenceProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [userPreferences, setUserPreferences] = useState<{
    preferredAltitude: number
    showDiagnostics: boolean
    autoExpandModules: boolean
    theme: 'light' | 'dark' | 'auto'
  }>({
    preferredAltitude: 30000,
    showDiagnostics: true,
    autoExpandModules: false,
    theme: 'auto'
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    // Initialize context on mount
    const initializeContext = () => {
      try {
        // Load user preferences
        const prefs = contextPersistence.getUserPreferences()
        setUserPreferences(prefs)
        
        // Get last updated timestamp
        const context = contextPersistence.exportContext()
        if (context) {
          const parsedContext = JSON.parse(context) as PersistentContext
          setLastUpdated(parsedContext.lastUpdated)
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize context persistence:', error)
        setIsInitialized(true) // Still mark as initialized to prevent infinite loading
      }
    }

    initializeContext()
  }, [])

  const addConversationContext = (context: ConversationContext) => {
    contextPersistence.addConversationContext(context)
    setLastUpdated(new Date())
  }

  const getRepositoryHistory = (owner: string, repo: string, limit: number = 10) => {
    return contextPersistence.getRepositoryHistory(owner, repo, limit)
  }

  const getRecentRepositories = (limit: number = 10) => {
    return contextPersistence.getRecentRepositories(limit)
  }

  const updateUserPreferences = (preferences: Partial<{
    preferredAltitude: number
    showDiagnostics: boolean
    autoExpandModules: boolean
    theme: 'light' | 'dark' | 'auto'
  }>) => {
    contextPersistence.updateUserPreferences(preferences)
    setUserPreferences(prev => ({ ...prev, ...preferences }))
    setLastUpdated(new Date())
  }

  const addCustomNote = (repoPath: string, content: string, tags: string[] = []) => {
    const noteId = contextPersistence.addCustomNote(repoPath, content, tags)
    setLastUpdated(new Date())
    return noteId
  }

  const getCustomNotes = (repoPath: string) => {
    return contextPersistence.getCustomNotes(repoPath)
  }

  const getContextSummary = (repoContext?: { owner: string; repo: string; module?: string; function?: string }) => {
    return contextPersistence.getContextSummary(repoContext)
  }

  const exportContext = () => {
    return contextPersistence.exportContext()
  }

  const importContext = (contextJson: string) => {
    const success = contextPersistence.importContext(contextJson)
    if (success) {
      // Reload preferences after import
      const prefs = contextPersistence.getUserPreferences()
      setUserPreferences(prefs)
      setLastUpdated(new Date())
    }
    return success
  }

  const clearContext = () => {
    contextPersistence.clearContext()
    setUserPreferences({
      preferredAltitude: 30000,
      showDiagnostics: true,
      autoExpandModules: false,
      theme: 'auto'
    })
    setLastUpdated(null)
  }

  const value: ContextPersistenceContextType = {
    addConversationContext,
    getRepositoryHistory,
    getRecentRepositories,
    userPreferences,
    updateUserPreferences,
    addCustomNote,
    getCustomNotes,
    getContextSummary,
    exportContext,
    importContext,
    clearContext,
    isInitialized,
    lastUpdated
  }

  return (
    <ContextPersistenceContext.Provider value={value}>
      {children}
    </ContextPersistenceContext.Provider>
  )
} 