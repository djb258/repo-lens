'use client'

import React, { useState } from 'react'
import { ContextPersistenceProvider, useContextPersistence } from '../../../../components/ContextPersistenceProvider'
import ContextPersistencePanel from '../../../../components/ContextPersistencePanel'

function ContextPersistenceTestContent() {
  const {
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
  } = useContextPersistence()

  const [testRepoContext, setTestRepoContext] = useState({
    owner: 'djb258',
    repo: 'repo-lens'
  })
  const [testQuery, setTestQuery] = useState('How does the diagnostic system work?')
  const [testResponse, setTestResponse] = useState('The diagnostic system tracks all application events with UDNS codes...')
  const [testNote, setTestNote] = useState('This is a test note for the context persistence system')
  const [testTags, setTestTags] = useState('test,persistence,context')

  const handleAddTestConversation = () => {
    addConversationContext({
      sessionId: `test-session-${Date.now()}`,
      timestamp: new Date(),
      userQuery: testQuery,
      assistantResponse: testResponse,
      repoContext: testRepoContext,
      userPreferences: {
        preferredAltitude: 30000,
        showDiagnostics: true,
        autoExpandModules: false,
        theme: 'auto'
      },
      metadata: {
        llmProvider: 'test',
        model: 'gpt-4',
        tokensUsed: 150,
        responseTime: 2000
      }
    })
  }

  const handleAddTestNote = () => {
    const tags = testTags.split(',').map(tag => tag.trim()).filter(tag => tag)
    addCustomNote(`${testRepoContext.owner}/${testRepoContext.repo}`, testNote, tags)
  }

  const handleExportTest = () => {
    const data = exportContext()
    console.log('Exported context data:', data)
    alert('Context data exported to console. Check browser console for details.')
  }

  const handleImportTest = () => {
    const sampleData = JSON.stringify({
      userId: 'test-user-123',
      sessionHistory: [],
      userPreferences: {
        preferredAltitude: 20000,
        showDiagnostics: false,
        autoExpandModules: true,
        theme: 'dark'
      },
      recentRepositories: [],
      diagnosticHistory: [],
      customNotes: [],
      lastUpdated: new Date().toISOString()
    })
    
    const success = importContext(sampleData)
    alert(success ? 'Test context imported successfully!' : 'Failed to import test context')
  }

  if (!isInitialized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🧠 Context Persistence System Test
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Test the context persistence system that maintains conversation history and user preferences across LLM sessions.
        </p>
        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Test Controls */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🧪 Test Controls
            </h2>

            {/* Test Repository Context */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Repository Context
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={testRepoContext.owner}
                  onChange={(e) => setTestRepoContext(prev => ({ ...prev, owner: e.target.value }))}
                  placeholder="Owner"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  value={testRepoContext.repo}
                  onChange={(e) => setTestRepoContext(prev => ({ ...prev, repo: e.target.value }))}
                  placeholder="Repository"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Test Conversation */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Conversation
              </label>
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="User query"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
              />
              <textarea
                value={testResponse}
                onChange={(e) => setTestResponse(e.target.value)}
                placeholder="Assistant response"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleAddTestConversation}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Test Conversation
              </button>
            </div>

            {/* Test Note */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Note
              </label>
              <textarea
                value={testNote}
                onChange={(e) => setTestNote(e.target.value)}
                placeholder="Note content"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
              />
              <input
                type="text"
                value={testTags}
                onChange={(e) => setTestTags(e.target.value)}
                placeholder="Tags (comma-separated)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
              />
              <button
                onClick={handleAddTestNote}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Test Note
              </button>
            </div>

            {/* Export/Import Tests */}
            <div className="space-y-2">
              <button
                onClick={handleExportTest}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Export Context (to console)
              </button>
              <button
                onClick={handleImportTest}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Import Test Context
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all context data?')) {
                    clearContext()
                  }
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear All Context
              </button>
            </div>
          </div>

          {/* Current State Display */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📊 Current State
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User Preferences:</span>
                <pre className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  {JSON.stringify(userPreferences, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Repositories:</span>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {getRecentRepositories(3).map((repo, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900 p-2 rounded mb-1">
                      {repo.owner}/{repo.repo} - {repo.accessCount} visits
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Repository History:</span>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {getRepositoryHistory(testRepoContext.owner, testRepoContext.repo, 3).map((conv, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900 p-2 rounded mb-1">
                      {conv.timestamp.toLocaleString()}: {conv.userQuery.substring(0, 50)}...
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Notes:</span>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {getCustomNotes(`${testRepoContext.owner}/${testRepoContext.repo}`).map((note, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900 p-2 rounded mb-1">
                      {note.timestamp.toLocaleString()}: {note.content.substring(0, 50)}...
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Context Persistence Panel */}
        <div>
          <ContextPersistencePanel repoContext={testRepoContext} />
        </div>
      </div>

      {/* Context Summary for LLM */}
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🤖 Context Summary for LLM
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This is the context summary that would be provided to an LLM to maintain continuity across sessions:
          </p>
          <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96">
            {getContextSummary(testRepoContext)}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function ContextPersistenceTestPage() {
  return (
    <ContextPersistenceProvider>
      <ContextPersistenceTestContent />
    </ContextPersistenceProvider>
  )
} 