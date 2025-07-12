export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🚀 Repo Lens is Working!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Vercel deployment is successful
        </p>
        <div className="space-y-4">
          <a 
            href="/index-view" 
            className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Repository Index
          </a>
          <a 
            href="/diagnostics" 
            className="block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View Diagnostics
          </a>
        </div>
      </div>
    </div>
  )
} 