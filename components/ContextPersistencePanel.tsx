'use client'

import React, { useState } from 'react'
import { useContextPersistence } from './ContextPersistenceProvider'

interface ContextPersistencePanelProps {
  repoContext?: {
    owner: string
    repo: string
    module?: string
    function?: string
  }
  className?: string
}

export default function ContextPersistencePanel({ repoContext, className = '' }: ContextPersistencePanelProps) {
  const {
    userPreferences,
    updateUserPreferences,
    getRepositoryHistory,
    getRecentRepositories,
    getCustomNotes,
    addCustomNote,
    getContextSummary,
    exportContext,
    importContext,
    clearContext,
    isInitialized,
    lastUpdated
  } = useContextPersistence()

  const [activeTab, setActiveTab] = useState<'preferences' | 'history' | 'notes' | 'export'>('preferences')
  const [newNote, setNewNote] = useState('')
  const [newNoteTags, setNewNoteTags] = useState('')
  const [importData, setImportData] = useState('')
  const [showContextSummary, setShowContextSummary] = useState(false)

  const recentRepos = getRecentRepositories(5)
  const repoHistory = repoContext ? getRepositoryHistory(repoContext.owner, repoContext.repo, 5) : []
  const customNotes = repoContext ? getCustomNotes(`${repoContext.owner}/${repoContext.repo}`) : []

  const handleAddNote = () => {
    if (newNote.trim() && repoContext) {
      const tags = newNoteTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      addCustomNote(`${repoContext.owner}/${repoContext.repo}`, newNote.trim(), tags)
      setNewNote('')
      setNewNoteTags('')
    }
  }

  const handleImport = () => {
    if (importData.trim()) {
      const success = importContext(importData)
      if (success) {
        setImportData('')
        alert('Context imported successfully!')
      } else {
        alert('Failed to import context. Please check the data format.')
      }
    }
  }

  const handleExport = () => {
    const data = exportContext()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `repo-lens-context-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isInitialized) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🧠 Context Persistence
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Maintains conversation history and preferences across sessions
            </p>
          </div>
          {lastUpdated && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'preferences', label: 'Preferences', icon: '⚙️' },
            { id: 'history', label: 'History', icon: '📚' },
            { id: 'notes', label: 'Notes', icon: '📝' },
            { id: 'export', label: 'Export/Import', icon: '💾' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Altitude
              </label>
              <select
                value={userPreferences.preferredAltitude}
                onChange={(e) => updateUserPreferences({ preferredAltitude: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={40000}>40,000 ft - Global Repo Index</option>
                <option value={30000}>30,000 ft - App Overview</option>
                <option value={20000}>20,000 ft - Module View</option>
                <option value={10000}>10,000 ft - Function View</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPreferences.showDiagnostics}
                  onChange={(e) => updateUserPreferences({ showDiagnostics: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show diagnostic information
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPreferences.autoExpandModules}
                  onChange={(e) => updateUserPreferences({ autoExpandModules: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Auto-expand modules by default
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={userPreferences.theme}
                onChange={(e) => updateUserPreferences({ theme: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="auto">Auto (system preference)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {repoContext && (
              <div className="mt-4">
                <button
                  onClick={() => setShowContextSummary(!showContextSummary)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showContextSummary ? 'Hide' : 'Show'} Context Summary for LLM
                </button>
                {showContextSummary && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {getContextSummary(repoContext)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {repoContext && repoHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Recent Conversations for {repoContext.owner}/{repoContext.repo}
                </h4>
                <div className="space-y-2">
                  {repoHistory.map((conv, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {conv.timestamp.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                        {conv.userQuery.substring(0, 100)}...
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {conv.assistantResponse.substring(0, 150)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Recent Repositories
              </h4>
              <div className="space-y-2">
                {recentRepos.map((repo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {repo.owner}/{repo.repo}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {repo.accessCount} visits • {repo.lastAccessed.toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {recentRepos.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent repositories
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {repoContext && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Add Note for {repoContext.owner}/{repoContext.repo}
                </h4>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this repository..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
                <input
                  type="text"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  placeholder="Tags (comma-separated)"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Custom Notes
              </h4>
              <div className="space-y-2">
                {customNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {note.timestamp.toLocaleString()}
                      </div>
                      {note.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {note.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {note.content}
                    </div>
                  </div>
                ))}
                {customNotes.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No custom notes yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Export Context
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Download your context data as a JSON file for backup or transfer.
              </p>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export Context Data
              </button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Import Context
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Import context data from a previously exported JSON file.
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste JSON context data here..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={6}
              />
              <button
                onClick={handleImport}
                disabled={!importData.trim()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Context Data
              </button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Clear Context
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Warning: This will permanently delete all stored context data.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all context data? This action cannot be undone.')) {
                    clearContext()
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear All Context Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 