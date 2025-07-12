import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist. This might be a system request or an invalid repository URL.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/index-view"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Repository Index
          </Link>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Valid repository URLs should be in the format:</p>
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
              /owner/repository-name
            </code>
          </div>
        </div>
      </div>
    </div>
  )
} 