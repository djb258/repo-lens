import { Diagnostics, Altitude, Module, Submodule, Action } from './diagnostics'

// Context Persistence System for Repo Lens
// Maintains conversation history, user preferences, and session state across LLM sessions

export interface ConversationContext {
  sessionId: string
  timestamp: Date
  userQuery: string
  assistantResponse: string
  repoContext?: {
    owner: string
    repo: string
    module?: string
    function?: string
  }
  diagnosticContext?: {
    blueprintId: string
    diagnosticCode: string
    severity: string
  }
  userPreferences?: {
    preferredAltitude: number
    showDiagnostics: boolean
    autoExpandModules: boolean
    theme: 'light' | 'dark' | 'auto'
  }
  metadata?: {
    llmProvider?: string
    model?: string
    tokensUsed?: number
    responseTime?: number
  }
}

export interface PersistentContext {
  userId: string
  sessionHistory: ConversationContext[]
  userPreferences: {
    preferredAltitude: number
    showDiagnostics: boolean
    autoExpandModules: boolean
    theme: 'light' | 'dark' | 'auto'
    lastActiveRepo?: {
      owner: string
      repo: string
      module?: string
      function?: string
    }
  }
  recentRepositories: Array<{
    owner: string
    repo: string
    lastAccessed: Date
    accessCount: number
  }>
  diagnosticHistory: Array<{
    timestamp: Date
    diagnosticCode: string
    severity: string
    message: string
    resolved: boolean
  }>
  customNotes: Array<{
    id: string
    repoPath: string
    content: string
    timestamp: Date
    tags: string[]
  }>
  lastUpdated: Date
}

export class ContextPersistence {
  private static instance: ContextPersistence
  private storageKey = 'repo-lens-context'
  private maxHistorySize = 100
  private maxRecentRepos = 20

  private constructor() {
    this.initializeContext()
  }

  static getInstance(): ContextPersistence {
    if (!ContextPersistence.instance) {
      ContextPersistence.instance = new ContextPersistence()
    }
    return ContextPersistence.instance
  }

  private initializeContext(): void {
    try {
      const existing = this.getStoredContext()
      if (!existing) {
        const defaultContext: PersistentContext = {
          userId: this.generateUserId(),
          sessionHistory: [],
          userPreferences: {
            preferredAltitude: 30000,
            showDiagnostics: true,
            autoExpandModules: false,
            theme: 'auto'
          },
          recentRepositories: [],
          diagnosticHistory: [],
          customNotes: [],
          lastUpdated: new Date()
        }
        this.saveContext(defaultContext)
        
        Diagnostics.success(
          Altitude.SERVICE,
          Module.UTILS,
          Submodule.VALIDATION,
          Action.SUCCESS,
          'Context persistence system initialized with default values',
          { userId: defaultContext.userId }
        )
      }
    } catch (error) {
      Diagnostics.error(
        Altitude.SERVICE,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to initialize context persistence system',
        error as Error
      )
    }
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getStoredContext(): PersistentContext | null {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey)
        return stored ? JSON.parse(stored) : null
      }
      return null
    } catch (error) {
      console.error('Error reading stored context:', error)
      return null
    }
  }

  private saveContext(context: PersistentContext): void {
    try {
      if (typeof window !== 'undefined') {
        context.lastUpdated = new Date()
        localStorage.setItem(this.storageKey, JSON.stringify(context))
      }
    } catch (error) {
      console.error('Error saving context:', error)
    }
  }

  // Add a new conversation context
  addConversationContext(context: ConversationContext): void {
    try {
      const persistentContext = this.getStoredContext()
      if (!persistentContext) return

      // Add to session history
      persistentContext.sessionHistory.unshift(context)
      
      // Limit history size
      if (persistentContext.sessionHistory.length > this.maxHistorySize) {
        persistentContext.sessionHistory = persistentContext.sessionHistory.slice(0, this.maxHistorySize)
      }

      // Update recent repositories if repo context exists
      if (context.repoContext) {
        this.updateRecentRepositories(persistentContext, context.repoContext)
      }

      // Update user preferences if provided
      if (context.userPreferences) {
        persistentContext.userPreferences = {
          ...persistentContext.userPreferences,
          ...context.userPreferences
        }
      }

      this.saveContext(persistentContext)

      Diagnostics.success(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.SUCCESS,
        'Added conversation context to persistence',
        { 
          sessionId: context.sessionId,
          repoContext: context.repoContext,
          historySize: persistentContext.sessionHistory.length
        }
      )
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to add conversation context',
        error as Error
      )
    }
  }

  private updateRecentRepositories(context: PersistentContext, repoContext: { owner: string; repo: string }): void {
    const existingIndex = context.recentRepositories.findIndex(
      repo => repo.owner === repoContext.owner && repo.repo === repoContext.repo
    )

    if (existingIndex >= 0) {
      // Update existing entry
      context.recentRepositories[existingIndex].lastAccessed = new Date()
      context.recentRepositories[existingIndex].accessCount++
    } else {
      // Add new entry
      context.recentRepositories.unshift({
        owner: repoContext.owner,
        repo: repoContext.repo,
        lastAccessed: new Date(),
        accessCount: 1
      })
    }

    // Limit recent repositories
    if (context.recentRepositories.length > this.maxRecentRepos) {
      context.recentRepositories = context.recentRepositories.slice(0, this.maxRecentRepos)
    }

    // Sort by last accessed
    context.recentRepositories.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
  }

  // Get conversation history for a specific repository
  getRepositoryHistory(owner: string, repo: string, limit: number = 10): ConversationContext[] {
    try {
      const context = this.getStoredContext()
      if (!context) return []

      return context.sessionHistory
        .filter(conv => 
          conv.repoContext?.owner === owner && 
          conv.repoContext?.repo === repo
        )
        .slice(0, limit)
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to get repository history',
        error as Error
      )
      return []
    }
  }

  // Get recent repositories
  getRecentRepositories(limit: number = 10): Array<{ owner: string; repo: string; lastAccessed: Date; accessCount: number }> {
    try {
      const context = this.getStoredContext()
      if (!context) return []

      return context.recentRepositories.slice(0, limit)
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to get recent repositories',
        error as Error
      )
      return []
    }
  }

  // Get user preferences
  getUserPreferences(): { preferredAltitude: number; showDiagnostics: boolean; autoExpandModules: boolean; theme: 'light' | 'dark' | 'auto' } {
    try {
      const context = this.getStoredContext()
      return context?.userPreferences || {
        preferredAltitude: 30000,
        showDiagnostics: true,
        autoExpandModules: false,
        theme: 'auto'
      }
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to get user preferences',
        error as Error
      )
      return {
        preferredAltitude: 30000,
        showDiagnostics: true,
        autoExpandModules: false,
        theme: 'auto'
      }
    }
  }

  // Update user preferences
  updateUserPreferences(preferences: Partial<{ preferredAltitude: number; showDiagnostics: boolean; autoExpandModules: boolean; theme: 'light' | 'dark' | 'auto' }>): void {
    try {
      const context = this.getStoredContext()
      if (!context) return

      context.userPreferences = {
        ...context.userPreferences,
        ...preferences
      }

      this.saveContext(context)

      Diagnostics.success(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.SUCCESS,
        'Updated user preferences',
        { preferences }
      )
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to update user preferences',
        error as Error
      )
    }
  }

  // Add custom note
  addCustomNote(repoPath: string, content: string, tags: string[] = []): string {
    try {
      const context = this.getStoredContext()
      if (!context) return ''

      const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const note = {
        id: noteId,
        repoPath,
        content,
        timestamp: new Date(),
        tags
      }

      context.customNotes.unshift(note)
      this.saveContext(context)

      Diagnostics.success(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.SUCCESS,
        'Added custom note',
        { noteId, repoPath, tags }
      )

      return noteId
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to add custom note',
        error as Error
      )
      return ''
    }
  }

  // Get custom notes for a repository
  getCustomNotes(repoPath: string): Array<{ id: string; content: string; timestamp: Date; tags: string[] }> {
    try {
      const context = this.getStoredContext()
      if (!context) return []

      return context.customNotes
        .filter(note => note.repoPath === repoPath)
        .map(note => ({
          id: note.id,
          content: note.content,
          timestamp: note.timestamp,
          tags: note.tags
        }))
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to get custom notes',
        error as Error
      )
      return []
    }
  }

  // Get context summary for LLM
  getContextSummary(repoContext?: { owner: string; repo: string; module?: string; function?: string }): string {
    try {
      const context = this.getStoredContext()
      if (!context) return ''

      let summary = `# Repo Lens Context Summary\n\n`
      summary += `**User ID:** ${context.userId}\n`
      summary += `**Last Updated:** ${context.lastUpdated.toISOString()}\n\n`

      // User preferences
      const prefs = context.userPreferences
      summary += `## User Preferences\n`
      summary += `- Preferred Altitude: ${prefs.preferredAltitude}ft\n`
      summary += `- Show Diagnostics: ${prefs.showDiagnostics}\n`
      summary += `- Auto-expand Modules: ${prefs.autoExpandModules}\n`
      summary += `- Theme: ${prefs.theme}\n\n`

      // Recent repositories
      if (context.recentRepositories.length > 0) {
        summary += `## Recent Repositories\n`
        context.recentRepositories.slice(0, 5).forEach(repo => {
          summary += `- ${repo.owner}/${repo.repo} (accessed ${repo.accessCount} times, last: ${repo.lastAccessed.toISOString()})\n`
        })
        summary += `\n`
      }

      // Repository-specific history
      if (repoContext) {
        const repoHistory = this.getRepositoryHistory(repoContext.owner, repoContext.repo, 3)
        if (repoHistory.length > 0) {
          summary += `## Recent Conversations for ${repoContext.owner}/${repoContext.repo}\n`
          repoHistory.forEach((conv, index) => {
            summary += `### Conversation ${index + 1} (${conv.timestamp.toISOString()})\n`
            summary += `**User:** ${conv.userQuery}\n`
            summary += `**Assistant:** ${conv.assistantResponse.substring(0, 200)}...\n\n`
          })
        }

        // Custom notes for this repository
        const notes = this.getCustomNotes(`${repoContext.owner}/${repoContext.repo}`)
        if (notes.length > 0) {
          summary += `## Custom Notes for ${repoContext.owner}/${repoContext.repo}\n`
          notes.forEach(note => {
            summary += `### Note (${note.timestamp.toISOString()})\n`
            summary += `**Tags:** ${note.tags.join(', ')}\n`
            summary += `${note.content}\n\n`
          })
        }
      }

      return summary
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to generate context summary',
        error as Error
      )
      return ''
    }
  }

  // Clear context (for testing or reset)
  clearContext(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.storageKey)
      }
      
      Diagnostics.success(
        Altitude.SERVICE,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.SUCCESS,
        'Context persistence cleared'
      )
    } catch (error) {
      Diagnostics.error(
        Altitude.SERVICE,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to clear context',
        error as Error
      )
    }
  }

  // Export context for backup
  exportContext(): string {
    try {
      const context = this.getStoredContext()
      return context ? JSON.stringify(context, null, 2) : ''
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to export context',
        error as Error
      )
      return ''
    }
  }

  // Import context from backup
  importContext(contextJson: string): boolean {
    try {
      const context = JSON.parse(contextJson) as PersistentContext
      this.saveContext(context)
      
      Diagnostics.success(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.SUCCESS,
        'Context imported successfully',
        { userId: context.userId }
      )
      
      return true
    } catch (error) {
      Diagnostics.error(
        Altitude.COMPONENT,
        Module.UTILS,
        Submodule.VALIDATION,
        Action.ERROR,
        'Failed to import context',
        error as Error
      )
      return false
    }
  }
}

// Export singleton instance
export const contextPersistence = ContextPersistence.getInstance()      