'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  RepoOverviewModule, 
  GitHubRepository, 
  RepositoryBlueprint,
  BartonDiagnostic 
} from '../../types';
import { ModularUtils } from '../../shared/utils';
import Link from 'next/link';

// ORBT and Barton Doctrine Compliant Repo Overview Module
export default function RepoOverviewPage() {
  const params = useParams();
  const repoId = params.repoId as string;

  const [moduleState, setModuleState] = useState<RepoOverviewModule>({
    repository: null,
    blueprint: null,
    loading: true,
    error: null,
    diagnostics: []
  });

  // ORBT Cycle Management
  const [orbtCycle, setOrbtCycle] = useState(ModularUtils.Barton.createORBTCycle());

  // Initialize module with Barton diagnostic tracking
  useEffect(() => {
    const timerId = ModularUtils.Performance.startTimer('RepoOverviewInit');
    
    const initDiagnostic = ModularUtils.Barton.createDiagnostic(
      'Repo Overview Module initialized',
      'info',
      'module',
      { 
        moduleId: '02-repo-overview',
        repoId,
        timestamp: new Date().toISOString()
      }
    );

    setModuleState(prev => ({
      ...prev,
      diagnostics: [initDiagnostic]
    }));

    // Start ORBT Observe phase
    setOrbtCycle(prev => ModularUtils.Barton.updateORBTCyclePhase(
      prev, 'observe', 'active', { repoId }
    ));

    // Load repository data
    loadRepositoryData();

    const loadTime = ModularUtils.Performance.endTimer(timerId);
    console.log(`[RepoOverview] Initialization completed in ${loadTime.toFixed(2)}ms`);
  }, [repoId]);

  // Load repository data with full ORBT and Barton compliance
  const loadRepositoryData = async () => {
    const timerId = ModularUtils.Performance.startTimer('LoadRepositoryData');
    
    try {
      // Update ORBT Observe phase
      setOrbtCycle(prev => ModularUtils.Barton.updateORBTCyclePhase(
        prev, 'observe', 'active', { loading: true }
      ));

      setModuleState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      // For now, create a placeholder repository since we don't have the full API
      // In a real implementation, this would fetch from GitHub API by repo ID
      const placeholderRepo: GitHubRepository = {
        id: parseInt(repoId.split('.')[0]) || 1,
        name: `Repository ${repoId}`,
        full_name: `user/repo-${repoId}`,
        description: `Placeholder repository for ${repoId}`,
        private: false,
        fork: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pushed_at: new Date().toISOString(),
        size: 1024,
        stargazers_count: 0,
        watchers_count: 0,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        has_discussions: false,
        forks_count: 0,
        archived: false,
        disabled: false,
        license: null,
        topics: ['placeholder', 'repo-lens'],
        default_branch: 'main',
        doctrineNumbering: ModularUtils.Doctrine.parseDoctrineNumbering(repoId),
        orbtCycle: ModularUtils.Barton.createORBTCycle(),
        diagnostics: []
      };

      // Create placeholder blueprint
      const placeholderBlueprint: RepositoryBlueprint = {
        repoId: repoId.split('.')[0],
        name: placeholderRepo.name,
        description: placeholderRepo.description || '',
        structure: {
          modules: [
            ModularUtils.Module.createModuleStructure('components', '/components', 'component', repoId.split('.')[0]),
            ModularUtils.Module.createModuleStructure('pages', '/pages', 'page', repoId.split('.')[0]),
            ModularUtils.Module.createModuleStructure('api', '/api', 'api', repoId.split('.')[0])
          ],
          files: [],
          dependencies: []
        },
        orbtBreakdown: {
          operating: {
            status: 'healthy',
            score: 85,
            issues: [],
            recommendations: ['Implement comprehensive error handling'],
            lastChecked: new Date()
          },
          repair: {
            status: 'warning',
            score: 70,
            issues: [],
            recommendations: ['Add automated testing'],
            lastChecked: new Date()
          },
          build: {
            status: 'healthy',
            score: 90,
            issues: [],
            recommendations: ['Optimize build process'],
            lastChecked: new Date()
          },
          training: {
            status: 'error',
            score: 45,
            issues: [],
            recommendations: ['Add documentation', 'Create onboarding guide'],
            lastChecked: new Date()
          }
        },
        diagnostics: [],
        lastUpdated: new Date()
      };

      // Create success diagnostic
      const successDiagnostic = ModularUtils.Barton.createDiagnostic(
        `Successfully loaded repository data for ${repoId}`,
        'info',
        'github',
        { 
          repoId,
          timestamp: new Date().toISOString()
        }
      );

      // Update ORBT cycle
      setOrbtCycle(prev => ModularUtils.Barton.updateORBTCyclePhase(
        prev, 'observe', 'completed', { repository: placeholderRepo }, [successDiagnostic]
      ));

      // Update module state
      setModuleState(prev => ({
        ...prev,
        repository: placeholderRepo,
        blueprint: placeholderBlueprint,
        loading: false,
        diagnostics: [...prev.diagnostics, successDiagnostic]
      }));

    } catch (error) {
      const errorDiagnostic = ModularUtils.Error.handleError(
        error as Error,
        'Repository Data Loading',
        '02-repo-overview'
      );

      // Update ORBT cycle with error
      setOrbtCycle(prev => ModularUtils.Barton.updateORBTCyclePhase(
        prev, 'observe', 'failed', { error: errorDiagnostic }, [errorDiagnostic]
      ));

      setModuleState(prev => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
        diagnostics: [...prev.diagnostics, errorDiagnostic]
      }));
    }

    const loadTime = ModularUtils.Performance.endTimer(timerId);
    console.log(`[RepoOverview] Data load completed in ${loadTime.toFixed(2)}ms`);
  };

  // Get ORBT status color
  const getOrbtStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (moduleState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading repository overview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (moduleState.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Repository</h3>
                <div className="mt-2 text-sm text-red-700">{moduleState.error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!moduleState.repository || !moduleState.blueprint) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Repository not found</h3>
            <p className="text-gray-600">The requested repository could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link 
                  href="/modules/01-github-index"
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Back to Repo Index
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                📋 {moduleState.repository.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Module 2: Repository Overview - {moduleState.repository.full_name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Doctrine ID: {moduleState.repository.doctrineNumbering.fullPath}
              </p>
            </div>
            
            {/* ORBT Status Indicator */}
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-medium">ORBT Status:</span>
                <div className="flex space-x-2 mt-1">
                  {Object.entries(orbtCycle).map(([phase, data]) => (
                    <div
                      key={phase}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        data.status === 'completed' ? 'bg-green-100 text-green-800' :
                        data.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        data.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {phase.charAt(0).toUpperCase() + phase.slice(1)}: {data.status}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Repository Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900 mb-2">Repository Info</h3>
              <div className="space-y-2 text-sm">
                <div>Language: {moduleState.repository.language || 'Unknown'}</div>
                <div>Stars: ⭐ {moduleState.repository.stargazers_count}</div>
                <div>Forks: 🔄 {moduleState.repository.forks_count}</div>
                <div>Visibility: {moduleState.repository.private ? '🔒 Private' : '🌐 Public'}</div>
                <div>Last Updated: {new Date(moduleState.repository.updated_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900 mb-2">Features</h3>
              <div className="space-y-2 text-sm">
                {moduleState.repository.has_issues && <div>📋 Issues enabled</div>}
                {moduleState.repository.has_wiki && <div>📚 Wiki available</div>}
                {moduleState.repository.has_projects && <div>📊 Projects enabled</div>}
                {moduleState.repository.has_discussions && <div>💬 Discussions enabled</div>}
                {moduleState.repository.archived && <div>📦 Archived</div>}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-900 mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <Link 
                  href={`/modules/03-diagram-view/${repoId}`}
                  className="block w-full text-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  View Diagram
                </Link>
                <Link 
                  href={`/modules/04-module-views/${repoId}`}
                  className="block w-full text-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Module Analysis
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ORBT Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ORBT Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(moduleState.blueprint.orbtBreakdown).map(([phase, analysis]) => (
              <div key={phase} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 capitalize">{phase}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getOrbtStatusColor(analysis.status)}`}>
                    {analysis.status}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{analysis.score}%</div>
                <div className="text-sm text-gray-600">
                  {analysis.recommendations.length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium mb-1">Recommendations:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="text-xs">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {moduleState.repository.description && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700">{moduleState.repository.description}</p>
          </div>
        )}

        {/* Placeholder for future modules */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Module 2 - Repository Overview</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This is a placeholder implementation. Future enhancements will include:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>README rendering with diagnostic overlays</li>
                  <li>Repository structure analysis</li>
                  <li>Dependency visualization</li>
                  <li>Integration with Module 3 (Diagram View)</li>
                  <li>Real GitHub API integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 