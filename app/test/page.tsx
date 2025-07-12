export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          ✅ RepoLens Test Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          If you can see this page, the deployment is working correctly!
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Environment Check
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>Node Environment: {process.env.NODE_ENV}</div>
              <div>GitHub Token: {process.env.GITHUB_TOKEN ? '✅ Found' : '❌ Missing'}</div>
              <div>GitHub Username: {process.env.GITHUB_USERNAME ? '✅ Found' : '❌ Missing'}</div>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Quick Links
            </h2>
            <div className="space-y-2">
              <a 
                href="/index-view" 
                className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Repository View
              </a>
              <a 
                href="/diagnostics" 
                className="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Diagnostics Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 