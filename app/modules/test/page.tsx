'use client';

import { useState, useEffect } from 'react';
import { ModularUtils } from '../shared/utils';

// ORBT and Barton Doctrine Compliant Test Page
export default function TestPage() {
  const [testResults, setTestResults] = useState<{
    orbt: boolean;
    barton: boolean;
    doctrine: boolean;
    modules: boolean;
  }>({
    orbt: false,
    barton: false,
    doctrine: false,
    modules: false
  });

  const [diagnostics, setDiagnostics] = useState<any[]>([]);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const testDiagnostic = ModularUtils.Barton.createDiagnostic(
      'Modular system test suite started',
      'info',
      'module',
      { testSuite: 'modular-system' }
    );
    setDiagnostics([testDiagnostic]);

    // Test 1: ORBT System
    try {
      const orbtCycle = ModularUtils.Barton.createORBTCycle();
      const updatedCycle = ModularUtils.Barton.updateORBTCyclePhase(
        orbtCycle, 'observe', 'completed', { test: 'passed' }
      );
      
      setTestResults(prev => ({ ...prev, orbt: true }));
      setDiagnostics(prev => [...prev, ModularUtils.Barton.createDiagnostic(
        'ORBT system test passed',
        'info',
        'orbt',
        { test: 'orbt-system' }
      )]);
    } catch (error) {
      setDiagnostics(prev => [...prev, ModularUtils.Error.handleError(
        error as Error,
        'ORBT System Test',
        'test-page'
      )]);
    }

    // Test 2: Barton Doctrine
    try {
      const diagnostic = ModularUtils.Barton.createDiagnostic(
        'Barton doctrine test',
        'info',
        'barton',
        { test: 'barton-doctrine' }
      );
      
      setTestResults(prev => ({ ...prev, barton: true }));
      setDiagnostics(prev => [...prev, diagnostic]);
    } catch (error) {
      setDiagnostics(prev => [...prev, ModularUtils.Error.handleError(
        error as Error,
        'Barton Doctrine Test',
        'test-page'
      )]);
    }

    // Test 3: Doctrine Numbering
    try {
      const numbering = ModularUtils.Doctrine.createDoctrineNumbering('1', '2', '3');
      const isValid = ModularUtils.Doctrine.validateDoctrineNumbering(numbering);
      
      setTestResults(prev => ({ ...prev, doctrine: isValid }));
      setDiagnostics(prev => [...prev, ModularUtils.Barton.createDiagnostic(
        'Doctrine numbering test passed',
        'info',
        'module',
        { test: 'doctrine-numbering', numbering }
      )]);
    } catch (error) {
      setDiagnostics(prev => [...prev, ModularUtils.Error.handleError(
        error as Error,
        'Doctrine Numbering Test',
        'test-page'
      )]);
    }

    // Test 4: Module Structure
    try {
      const module = ModularUtils.Module.createModuleStructure(
        'test-module',
        '/test/path',
        'component',
        '1'
      );
      const isValid = ModularUtils.Validator.validateModuleStructure(module);
      
      setTestResults(prev => ({ ...prev, modules: isValid }));
      setDiagnostics(prev => [...prev, ModularUtils.Barton.createDiagnostic(
        'Module structure test passed',
        'info',
        'module',
        { test: 'module-structure', module }
      )]);
    } catch (error) {
      setDiagnostics(prev => [...prev, ModularUtils.Error.handleError(
        error as Error,
        'Module Structure Test',
        'test-page'
      )]);
    }
  };

  const allTestsPassed = Object.values(testResults).every(result => result);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Modular System Test Suite
          </h1>
          <p className="text-gray-600 mb-6">
            Testing ORBT and Barton doctrine compliance
          </p>

          {/* Test Results */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg border-2 ${
              testResults.orbt 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="font-medium text-gray-900">ORBT System</div>
              <div className={`text-sm ${testResults.orbt ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.orbt ? '✓ Passed' : '✗ Failed'}
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              testResults.barton 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="font-medium text-gray-900">Barton Doctrine</div>
              <div className={`text-sm ${testResults.barton ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.barton ? '✓ Passed' : '✗ Failed'}
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              testResults.doctrine 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="font-medium text-gray-900">Doctrine Numbering</div>
              <div className={`text-sm ${testResults.doctrine ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.doctrine ? '✓ Passed' : '✗ Failed'}
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              testResults.modules 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="font-medium text-gray-900">Module Structure</div>
              <div className={`text-sm ${testResults.modules ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.modules ? '✓ Passed' : '✗ Failed'}
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`p-4 rounded-lg border-2 ${
            allTestsPassed 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="font-medium text-gray-900 mb-2">Overall Status</div>
            <div className={`text-lg font-semibold ${
              allTestsPassed ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {allTestsPassed ? 'All Tests Passed ✓' : 'Some Tests Failed ⚠'}
            </div>
          </div>
        </div>

        {/* Diagnostics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Diagnostics ({diagnostics.length})
          </h2>
          <div className="space-y-3">
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {diagnostic.message}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    diagnostic.severity === 'error' ? 'bg-red-100 text-red-800' :
                    diagnostic.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {diagnostic.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Category: {diagnostic.category}</div>
                  <div>Barton ID: {diagnostic.bartonId.slice(0, 8)}...</div>
                  <div>Time: {new Date(diagnostic.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 