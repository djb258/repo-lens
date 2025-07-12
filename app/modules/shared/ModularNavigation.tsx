'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ModularUtils } from './utils';

// ORBT and Barton Doctrine Compliant Modular Navigation
export default function ModularNavigation() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  // Create diagnostic for navigation interaction
  const createNavigationDiagnostic = (action: string, target?: string) => {
    return ModularUtils.Barton.createDiagnostic(
      `Navigation ${action}${target ? ` to ${target}` : ''}`,
      'info',
      'module',
      { 
        action,
        target,
        currentPath: pathname,
        timestamp: new Date().toISOString()
      }
    );
  };

  const handleNavigation = (target: string) => {
    const diagnostic = createNavigationDiagnostic('clicked', target);
    console.log('[ModularNavigation]', diagnostic);
  };

  const toggleExpanded = () => {
    const diagnostic = createNavigationDiagnostic(
      isExpanded ? 'collapsed' : 'expanded'
    );
    console.log('[ModularNavigation]', diagnostic);
    setIsExpanded(!isExpanded);
  };

  const modules = [
    {
      id: '01-github-index',
      name: 'GitHub Index',
      description: 'Repository Discovery',
      path: '/modules/01-github-index',
      icon: '📚',
      doctrineNumber: '01'
    },
    {
      id: '02-repo-overview',
      name: 'Repo Overview',
      description: 'Repository Blueprint',
      path: '/modules/02-repo-overview',
      icon: '🔍',
      doctrineNumber: '02'
    },
    {
      id: '03-diagram-view',
      name: 'Diagram View',
      description: 'Visual Structure',
      path: '/modules/03-diagram-view',
      icon: '📊',
      doctrineNumber: '03'
    },
    {
      id: '04-module-views',
      name: 'Module Views',
      description: 'Component Analysis',
      path: '/modules/04-module-views',
      icon: '🧩',
      doctrineNumber: '04'
    }
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              href="/modules/01-github-index"
              onClick={() => handleNavigation('/modules/01-github-index')}
              className="flex items-center space-x-3"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RL</span>
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">Repo Lens</h1>
                <p className="text-xs text-gray-500">Modular System</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {modules.map((module) => (
              <Link
                key={module.id}
                href={module.path}
                onClick={() => handleNavigation(module.path)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(module.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{module.icon}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{module.name}</span>
                  <span className="text-xs text-gray-500">{module.description}</span>
                </div>
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                  {module.doctrineNumber}
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleExpanded}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isExpanded ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isExpanded && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {modules.map((module) => (
              <Link
                key={module.id}
                href={module.path}
                onClick={() => {
                  handleNavigation(module.path);
                  setIsExpanded(false);
                }}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(module.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{module.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{module.name}</div>
                  <div className="text-sm text-gray-500">{module.description}</div>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                  {module.doctrineNumber}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ORBT Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="font-medium">ORBT Status:</span>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Observe: Active</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Report: Ready</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Build: Ready</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Test: Ready</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Barton:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Active</span>
          </div>
        </div>
      </div>
    </nav>
  );
} 