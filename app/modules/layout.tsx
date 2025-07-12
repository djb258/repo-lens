import ModularNavigation from './shared/ModularNavigation';
import { ModularUtils } from './shared/utils';

// ORBT and Barton Doctrine Compliant Modular Layout
export default function ModularLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create diagnostic for layout initialization
  const layoutDiagnostic = ModularUtils.Barton.createDiagnostic(
    'Modular layout initialized',
    'info',
    'module',
    { 
      layout: 'modular',
      timestamp: new Date().toISOString()
    }
  );

  // Log layout diagnostic
  console.log('[ModularLayout]', layoutDiagnostic);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modular Navigation */}
      <ModularNavigation />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer with ORBT Status */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Repo Lens Modular System</span>
              <span>•</span>
              <span>ORBT & Barton Doctrine Compliant</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Session: {layoutDiagnostic.sessionId.slice(0, 8)}</span>
              <span>•</span>
              <span>Barton ID: {layoutDiagnostic.bartonId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 