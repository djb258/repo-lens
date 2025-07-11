'use client'

import { config, hasGitHubToken, hasCentralizedLogging } from '@/lib/config'

interface EnvStatusProps {
  showDetails?: boolean
}

export default function EnvStatus({ showDetails = false }: EnvStatusProps) {
  if (!showDetails) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        🔧 Environment Status
      </h3>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">GitHub Token:</span>
          <span className={hasGitHubToken ? 'text-green-600' : 'text-red-600'}>
            {hasGitHubToken ? '✅ Configured' : '❌ Missing'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Centralized Logging:</span>
          <span className={hasCentralizedLogging ? 'text-green-600' : 'text-yellow-600'}>
            {hasCentralizedLogging ? '✅ Configured' : '⚠️ Local Only'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Environment:</span>
          <span className="text-blue-600">{config.app.environment}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">App Version:</span>
          <span className="text-blue-600">{config.app.version}</span>
        </div>
      </div>
    </div>
  )
} 