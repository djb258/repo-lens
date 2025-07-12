'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDiagnosticOverlay } from './DiagnosticOverlay'

export default function Navigation() {
  const pathname = usePathname()
  const { hasDiagnostics, diagnosticCount, DiagnosticWrapper } = useDiagnosticOverlay('navigation')

  return (
    <DiagnosticWrapper>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Home Link */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>🔍</span>
              <span>RepoLens</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/' || pathname === '/index-view'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Repositories
              </Link>

              {/* Barton Dashboard Link */}
              <Link
                href="/barton-dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/barton-dashboard'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                🏥 Barton
              </Link>

              {/* Diagnostics Link with Badge */}
              <Link
                href="/diagnostics"
                className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/diagnostics'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Diagnostics
                {hasDiagnostics && diagnosticCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {diagnosticCount > 9 ? '9+' : diagnosticCount}
                  </span>
                )}
              </Link>

              {/* GitHub Link */}
              <a
                href="https://github.com/djb258/repo-lens"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>
    </DiagnosticWrapper>
  )
} 