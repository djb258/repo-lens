'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ModularUtils } from './modules/shared/utils';

// ORBT and Barton Doctrine Compliant Main Page
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Create diagnostic for main page access
    const diagnostic = ModularUtils.Barton.createDiagnostic(
      'Main page accessed - redirecting to modular system',
      'info',
      'module',
      { 
        action: 'redirect',
        target: '/modules/01-github-index',
        timestamp: new Date().toISOString()
      }
    );

    console.log('[HomePage]', diagnostic);

    // Redirect to modular system after a brief delay
    const redirectTimer = setTimeout(() => {
      router.push('/modules/01-github-index');
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        {/* Loading Animation */}
        <div className="mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Repo Lens
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Modular Diagnostic System
        </p>

        {/* ORBT Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-green-50 p-3 rounded">
              <div className="font-medium text-green-800">ORBT Framework</div>
              <div className="text-green-600">Active</div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium text-blue-800">Barton Doctrine</div>
              <div className="text-blue-600">Active</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="font-medium text-yellow-800">Modular System</div>
              <div className="text-yellow-600">Initializing</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="font-medium text-purple-800">Diagnostics</div>
              <div className="text-purple-600">Ready</div>
            </div>
          </div>
        </div>

        {/* Redirect Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <span className="text-blue-800 font-medium">
              Redirecting to GitHub Repository Index...
            </span>
          </div>
        </div>

        {/* Doctrine Information */}
        <div className="mt-8 text-sm text-gray-500">
          <p className="mb-2">
            This system follows the ORBT (Observe, Report, Build, Test) framework
          </p>
          <p>
            and implements the Barton doctrine for comprehensive diagnostic tracking.
          </p>
        </div>
      </div>
    </div>
  );
} 