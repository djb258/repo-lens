import DiagnosticDashboard from '@/components/DiagnosticDashboard'
import { Diagnostics, Altitude, Module, Submodule, Action } from '@/lib/diagnostics'

export default function DiagnosticsPage() {
  // Log page access
  Diagnostics.success(
    Altitude.SYSTEM,
    Module.UI,
    Submodule.DIAGNOSTIC_LOG,
    Action.READ,
    'Diagnostics page accessed',
    { page: '/diagnostics' }
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔍 RepoLens Diagnostics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Universal diagnostic tracking system for BP-039 (RepoLens Application)
          </p>
        </div>

        <DiagnosticDashboard />
      </div>
    </div>
  )
} 