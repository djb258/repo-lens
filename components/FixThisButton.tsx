'use client'

import React, { useState } from 'react'

interface FixThisButtonProps {
  issue: string
  repoName: string
  filePath?: string
  functionName?: string
  className?: string
}

export default function FixThisButton({ 
  issue, 
  repoName, 
  filePath, 
  functionName,
  className = '' 
}: FixThisButtonProps) {
  const [showCommands, setShowCommands] = useState(false)

  const generateCommands = () => {
    const commands = []
    
    switch (issue.toLowerCase()) {
      case 'outdated docs':
        commands.push(
          `# Update documentation for ${repoName}`,
          `cd ${repoName}`,
          `# Review recent changes and update docs`,
          `git log --oneline -10`,
          `# Update relevant markdown files`,
          `# Check for outdated examples or API references`
        )
        break
      
      case 'missing tests':
        commands.push(
          `# Add tests for ${repoName}`,
          `cd ${repoName}`,
          `# Create test files`,
          `mkdir -p tests`,
          `# Add unit tests for key functions`,
          `# Example: npm test or yarn test`
        )
        break
      
      case 'code quality':
        commands.push(
          `# Improve code quality in ${repoName}`,
          `cd ${repoName}`,
          `# Run linter`,
          `npm run lint`,
          `# Fix auto-fixable issues`,
          `npm run lint -- --fix`,
          `# Run type checking`,
          `npm run type-check`
        )
        break
      
      case 'performance':
        commands.push(
          `# Optimize performance in ${repoName}`,
          `cd ${repoName}`,
          `# Run performance analysis`,
          `npm run build`,
          `# Check bundle size`,
          `npm run analyze`,
          `# Profile specific functions`
        )
        break
      
      case 'security':
        commands.push(
          `# Security audit for ${repoName}`,
          `cd ${repoName}`,
          `# Run security audit`,
          `npm audit`,
          `# Fix vulnerabilities`,
          `npm audit fix`,
          `# Check for outdated dependencies`
        )
        break
      
      default:
        commands.push(
          `# Fix ${issue} in ${repoName}`,
          `cd ${repoName}`,
          `# Analyze the issue`,
          `# Implement solution`,
          `# Test changes`,
          `# Update documentation`
        )
    }

    if (filePath) {
      commands.unshift(`# Focus on file: ${filePath}`)
    }
    
    if (functionName) {
      commands.unshift(`# Focus on function: ${functionName}`)
    }

    return commands.join('\n')
  }

  const copyToClipboard = async () => {
    const commands = generateCommands()
    try {
      await navigator.clipboard.writeText(commands)
      // Show success feedback
      setTimeout(() => setShowCommands(false), 3000)
    } catch (err) {
      console.error('Failed to copy commands:', err)
    }
  }

  return (
    <div className={className}>
      <button
        onClick={() => setShowCommands(!showCommands)}
        className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
      >
        🔧 Fix This
      </button>
      
      {showCommands && (
        <div className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Cursor Commands:</span>
            <button
              onClick={copyToClipboard}
              className="text-blue-400 hover:text-blue-300 text-xs"
            >
              📋 Copy All
            </button>
          </div>
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {generateCommands()}
          </pre>
        </div>
      )}
    </div>
  )
} 