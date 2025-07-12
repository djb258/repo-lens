export default function TestDeploymentPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🧪 Deployment Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Testing production deployment and environment variables
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Environment Check
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>Node Environment: <span className="font-mono">{process.env.NODE_ENV}</span></div>
              <div>GitHub Token: <span className="font-mono">{process.env.GITHUB_TOKEN ? '✅ Found' : '❌ Missing'}</span></div>
              <div>GitHub Username: <span className="font-mono">{process.env.GITHUB_USERNAME || 'Not set'}</span></div>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              API Test
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <a 
                href="/api/repositories" 
                target="_blank"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Test API Endpoint →
              </a>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Navigation Test
            </h2>
            <div className="space-y-2">
              <a 
                href="/index-view" 
                className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Repository Index →
              </a>
              <a 
                href="/diagnostics" 
                className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Diagnostics Page →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 