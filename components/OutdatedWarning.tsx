import React from 'react'

interface OutdatedWarningProps {
  docLastModified: string
  codeLastModified: string
  filePath?: string
  className?: string
}

export default function OutdatedWarning({ 
  docLastModified, 
  codeLastModified, 
  filePath,
  className = '' 
}: OutdatedWarningProps) {
  const docDate = new Date(docLastModified)
  const codeDate = new Date(codeLastModified)
  const isOutdated = docDate < codeDate
  const daysDiff = Math.floor((codeDate.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24))

  if (!isOutdated) {
    return null
  }

  return (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Documentation may be outdated
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>
              Code was last modified {daysDiff} day{daysDiff !== 1 ? 's' : ''} after this documentation.
            </p>
            {filePath && (
              <p className="mt-1">
                <span className="font-mono text-xs bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded">
                  {filePath}
                </span>
              </p>
            )}
            <div className="mt-2 text-xs">
              <span className="text-yellow-600 dark:text-yellow-400">
                Doc: {docDate.toLocaleDateString()} | Code: {codeDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 