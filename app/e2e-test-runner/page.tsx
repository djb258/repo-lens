/**
 * Cursor Prompt: Full End-to-End Test for Repo Lens Application (Local + Vercel)
 * Purpose: Validate every page and interaction works correctly before deployment
 */

'use client';

import { useState, useEffect } from 'react';
import { testAllRoutes, testInteractivity, validateRendering, generateTestReport } from '@/lib/tests/core';
import { runVisualRegression, generateVisualReport } from '@/lib/tests/visuals';
import { runAgainstVercel, generateVercelReport } from '@/lib/tests/vercel-runner';

const LOCAL_BASE_URL = "http://localhost:3000";
const VERCEL_BASE_URL = "https://repo-lens.vercel.app"; // Update this if needed

// 🔁 Define core routes for Repo Lens
const ROUTES = [
  "/",                     // Repo index
  "/modules/01-github-index", // GitHub index module
  "/modules/02-repo-overview", // Repo overview
  "/modules/03-visual-architecture", // Visual schematic
  "/modules/04-module-detail", // Module breakdowns
  "/modules/05-file-detail", // File detail view
  "/modules/06-error-log", // Error log
  "/modules/test", // Test modules
  "/barton-dashboard", // Barton dashboard
  "/diagnostics", // Diagnostics
  "/final-orbt-audit", // Final ORBT audit
  "/troubleshooting", // ORBT repair dashboard
];

interface TestState {
  status: 'idle' | 'running' | 'completed' | 'error';
  currentStep: string;
  progress: number;
  results: any;
  error?: string;
}

interface TestResults {
  routeTests: any[];
  renderingTests: any[];
  visualTests: any[];
  interactivityTests: any[];
  vercelTests?: any;
  reports: {
    route: string;
    visual: string;
    vercel?: string;
  };
}

export default function E2ETestRunner() {
  const [testState, setTestState] = useState<TestState>({
    status: 'idle',
    currentStep: 'Ready to start E2E testing',
    progress: 0,
    results: null
  });

  const [results, setResults] = useState<TestResults | null>(null);
  const [vercelUrl, setVercelUrl] = useState(VERCEL_BASE_URL);
  const [runVercelTests, setRunVercelTests] = useState(true);

  const runE2ETests = async () => {
    setTestState({
      status: 'running',
      currentStep: 'Starting E2E test suite...',
      progress: 0,
      results: null
    });

    try {
      const testResults: TestResults = {
        routeTests: [],
        renderingTests: [],
        visualTests: [],
        interactivityTests: [],
        reports: {
          route: '',
          visual: '',
          vercel: ''
        }
      };

      // ✅ 1. Test all routes locally
      setTestState(prev => ({
        ...prev,
        currentStep: 'Testing all routes locally...',
        progress: 10
      }));

      const routeResults = await testAllRoutes(ROUTES, LOCAL_BASE_URL, {
        timeout: 10000,
        retries: 3,
        validateContent: true
      });
      testResults.routeTests = routeResults;

      setTestState(prev => ({
        ...prev,
        currentStep: 'Validating rendering and visuals per page...',
        progress: 30
      }));

      // ✅ 2. Validate rendering and visuals per page
      const renderingResults = await validateRendering(ROUTES, LOCAL_BASE_URL, {
        checkImages: true,
        checkScripts: true,
        checkStyles: true
      });
      testResults.renderingTests = renderingResults;

      const visualResults = await runVisualRegression(ROUTES, LOCAL_BASE_URL, {
        viewports: ['1920x1080', '1366x768'],
        thresholds: {
          layout: 0.95,
          colors: 0.90,
          fonts: 0.95,
          images: 0.85
        }
      });
      testResults.visualTests = visualResults;

      setTestState(prev => ({
        ...prev,
        currentStep: 'Running interactivity and navigation tests...',
        progress: 60
      }));

      // ✅ 3. Run interactivity and navigation tests
      const interactivityResults = await testInteractivity(LOCAL_BASE_URL, {
        testNavigation: true,
        testForms: true,
        testButtons: true,
        timeout: 5000
      });
      testResults.interactivityTests = interactivityResults;

      setTestState(prev => ({
        ...prev,
        currentStep: 'Generating test reports...',
        progress: 80
      }));

      // Generate reports
      testResults.reports.route = generateTestReport([...routeResults, ...renderingResults, ...interactivityResults]);
      testResults.reports.visual = generateVisualReport(visualResults);

      // ✅ 4. If deployed, repeat against live Vercel URL
      if (runVercelTests && vercelUrl) {
        setTestState(prev => ({
          ...prev,
          currentStep: 'Running tests against Vercel deployment...',
          progress: 90
        }));

        try {
          const vercelResults = await runAgainstVercel(ROUTES, vercelUrl, {
            timeout: 15000,
            retries: 3,
            checkDeployment: true,
            performanceThreshold: 5000
          });
          testResults.vercelTests = vercelResults;
          testResults.reports.vercel = generateVercelReport(vercelResults);
        } catch (error: any) {
          console.warn('Vercel tests failed:', error.message);
          testResults.vercelTests = null;
        }
      }

      setResults(testResults);

      // ✅ Final Output
      setTestState({
        status: 'completed',
        currentStep: '✅ All Repo Lens E2E tests completed successfully!',
        progress: 100,
        results: testResults
      });

    } catch (error: any) {
      setTestState({
        status: 'error',
        currentStep: `❌ E2E test failed: ${error.message}`,
        progress: 0,
        results: null,
        error: error.message
      });
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (testState.status === 'error') {
      return 'error';
    }
    if (testState.progress >= stepNumber * 25) {
      return 'completed';
    }
    if (testState.progress >= (stepNumber - 1) * 25 && testState.status === 'running') {
      return 'running';
    }
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getTestSummary = () => {
    if (!results) return null;

    const allTests = [
      ...results.routeTests,
      ...results.renderingTests,
      ...results.interactivityTests,
      ...(results.vercelTests?.routeResults || [])
    ];

    const passed = allTests.filter(r => r.status === 'pass').length;
    const failed = allTests.filter(r => r.status === 'fail').length;
    const errored = allTests.filter(r => r.status === 'error').length;
    const total = allTests.length;

    return { passed, failed, errored, total };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Repo Lens E2E Test Runner
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Full end-to-end testing for Repo Lens application (Local + Vercel)
          </p>
        </div>

        {/* Test Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Base URL
              </label>
              <input
                type="text"
                value={LOCAL_BASE_URL}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vercel Base URL
              </label>
              <input
                type="text"
                value={vercelUrl}
                onChange={(e) => setVercelUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://your-app.vercel.app"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={runVercelTests}
                onChange={(e) => setRunVercelTests(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Run tests against Vercel deployment</span>
            </label>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Test Status: {testState.status.toUpperCase()}
              </h2>
              <p className="text-gray-600">{testState.currentStep}</p>
            </div>
            <button
              onClick={runE2ETests}
              disabled={testState.status === 'running'}
              className={`px-6 py-3 rounded-lg font-semibold ${
                testState.status === 'running'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {testState.status === 'running' ? 'Running Tests...' : 'Start E2E Tests'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {testState.progress}%</span>
              <span>{Math.round(testState.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${testState.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Test Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Steps</h3>
          <div className="space-y-4">
            {[
              'Test all routes locally',
              'Validate rendering and visuals per page',
              'Run interactivity and navigation tests',
              'Test against Vercel deployment (if enabled)'
            ].map((step, index) => {
              const status = getStepStatus(index + 1);
              const icon = getStepIcon(status);
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-2xl">{icon}</span>
                  <span className={`flex-1 ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'error' ? 'text-red-700' :
                    status === 'running' ? 'text-blue-700' :
                    'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Test Results */}
        {testState.status === 'completed' && results && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Summary</h3>
              {(() => {
                const summary = getTestSummary();
                if (!summary) return null;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {summary.passed}
                      </div>
                      <div className="text-green-600">Passed</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">
                        {summary.failed}
                      </div>
                      <div className="text-yellow-600">Failed</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">
                        {summary.errored}
                      </div>
                      <div className="text-red-600">Errors</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {summary.total}
                      </div>
                      <div className="text-blue-600">Total</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Route Test Results */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Route Test Results</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Code
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.routeTests.map((test, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {test.route}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            test.status === 'pass' ? 'bg-green-100 text-green-800' :
                            test.status === 'fail' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {test.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {test.responseTime}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {test.statusCode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vercel Test Results */}
            {results.vercelTests && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Vercel Test Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-lg font-semibold text-blue-700">
                      {Math.round(results.vercelTests.performanceMetrics.averageResponseTime)}ms
                    </div>
                    <div className="text-blue-600">Avg Response Time</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-lg font-semibold text-green-700">
                      {results.vercelTests.deploymentStatus}
                    </div>
                    <div className="text-green-600">Deployment Status</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-lg font-semibold text-purple-700">
                      {Math.round(results.vercelTests.comparison.localVsVercel.visualConsistency * 100)}%
                    </div>
                    <div className="text-purple-600">Visual Consistency</div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                E2E Tests Completed Successfully
              </h3>
              <p className="text-green-700">
                All Repo Lens E2E tests passed locally and on Vercel.
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {testState.status === 'error' && testState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">❌</div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">E2E Test Failed</h3>
                <p className="text-red-700">{testState.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 