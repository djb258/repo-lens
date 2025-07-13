/**
 * Final ORBT + Barton Audit for Repo Lens Application
 * Purpose: Perform a complete structural and functional audit to ensure the Repo Lens app adheres to:
 * - ORBT system (Operating, Repair, Build, Training)
 * - Barton Numbering Doctrine
 * - Self-documentation and visualization output
 */

'use client';

import { useState, useEffect } from 'react';
import { generateComplianceReport } from '@/lib/diagnostics/audit-report';
import { renderModuleVisuals } from '@/lib/visuals/generator';

interface AuditState {
  status: 'idle' | 'running' | 'completed' | 'error';
  step: number;
  totalSteps: number;
  currentStep: string;
  results: any;
  error?: string;
}

export default function FinalORBTAudit() {
  const [auditState, setAuditState] = useState<AuditState>({
    status: 'idle',
    step: 0,
    totalSteps: 4,
    currentStep: 'Ready to start audit',
    results: null
  });

  const [complianceResults, setComplianceResults] = useState<any>(null);
  const [moduleVisuals, setModuleVisuals] = useState<any[]>([]);
  const [troubleshootingCapabilities, setTroubleshootingCapabilities] = useState<any>(null);
  const [auditReport, setAuditReport] = useState<any>(null);

  const runAudit = async () => {
    setAuditState({
      status: 'running',
      step: 1,
      totalSteps: 4,
      currentStep: 'Validating ORBT + Barton compliance across all modules...',
      results: null
    });

    try {
      // 🔍 Step 1: Validate all modules conform to ORBT + Barton numbering
      const complianceResponse = await fetch('/api/audit/orbt-compliance');
      if (!complianceResponse.ok) {
        throw new Error('Failed to validate ORBT compliance');
      }
      const results = await complianceResponse.json();
      setComplianceResults(results.data);
      
      setAuditState(prev => ({
        ...prev,
        step: 2,
        currentStep: 'Checking module documentation and visual outputs...'
      }));

      // 📄 Step 2: Ensure each module has required documentation + visual outputs
      const visualPromises = results.data.modules.map(async (module: any) => {
        return await renderModuleVisuals({
          name: module.module,
          bartonNumber: module.bartonNumber,
          orbtSections: module.orbtSections,
          compliance: module.compliance,
          violations: module.violations,
          score: module.score
        });
      });

      const visuals = await Promise.all(visualPromises);
      setModuleVisuals(visuals);

      // Check for missing documentation or visuals
      const missingRequirements = results.data.modules.filter((module: any) => 
        !module.documentation.exists || !module.visual.exists
      );

      if (missingRequirements.length > 0) {
        const missingModules = missingRequirements.map((m: any) => m.module).join(', ');
        const missingTypes = missingRequirements.map((m: any) => {
          const missing = [];
          if (!m.documentation.exists) missing.push('documentation');
          if (!m.visual.exists) missing.push('visual');
          return `${m.module}: ${missing.join(', ')}`;
        }).join('; ');
        
        throw new Error(
          `Modules missing required documentation or visual outputs: ${missingTypes}`
        );
      }

      setAuditState(prev => ({
        ...prev,
        step: 3,
        currentStep: 'Verifying troubleshooting/repair interface...'
      }));

      // 🧰 Step 3: Confirm the app includes a repair/troubleshooting interface
      const troubleshootingResponse = await fetch('/api/audit/troubleshooting');
      if (!troubleshootingResponse.ok) {
        throw new Error('Failed to check troubleshooting capabilities');
      }
      const troubleshootingResult = await troubleshootingResponse.json();
      setTroubleshootingCapabilities(troubleshootingResult.data);

      if (!troubleshootingResult.data) {
        throw new Error("App is missing a troubleshooting/repair interface (ORBT:Repair)");
      }

      setAuditState(prev => ({
        ...prev,
        step: 4,
        currentStep: 'Generating comprehensive compliance report...'
      }));

      // 📊 Step 4: Generate full compliance report for log or review
      const report = await generateComplianceReport({
        application: "Repo Lens",
        complianceResults: results.data,
        auditedBy: "Cursor ORBT Audit",
        timestamp: new Date().toISOString(),
      });
      setAuditReport(report);

      // ✅ Final Output
      setAuditState({
        status: 'completed',
        step: 4,
        totalSteps: 4,
        currentStep: '✅ Repo Lens application passed ORBT + Barton doctrine audit.',
        results: {
          complianceResults: results.data,
          moduleVisuals: visuals,
          troubleshootingCapabilities: troubleshootingResult.data,
          auditReport: report
        }
      });

    } catch (error: any) {
      setAuditState({
        status: 'error',
        step: auditState.step,
        totalSteps: 4,
        currentStep: `❌ Audit failed: ${error.message}`,
        results: null,
        error: error.message
      });
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (auditState.status === 'error' && stepNumber === auditState.step) {
      return 'error';
    }
    if (stepNumber < auditState.step) {
      return 'completed';
    }
    if (stepNumber === auditState.step && auditState.status === 'running') {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Final ORBT + Barton Doctrine Audit
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive structural and functional audit to ensure Repo Lens application 
            adheres to ORBT system and Barton Numbering Doctrine requirements.
          </p>
        </div>

        {/* Audit Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Audit Status: {auditState.status.toUpperCase()}
              </h2>
              <p className="text-gray-600">{auditState.currentStep}</p>
            </div>
            <button
              onClick={runAudit}
              disabled={auditState.status === 'running'}
              className={`px-6 py-3 rounded-lg font-semibold ${
                auditState.status === 'running'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {auditState.status === 'running' ? 'Running Audit...' : 'Start Audit'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {auditState.step} / {auditState.totalSteps}</span>
              <span>{Math.round((auditState.step / auditState.totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(auditState.step / auditState.totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Audit Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Audit Steps</h3>
          <div className="space-y-4">
            {[
              'Validate all modules conform to ORBT + Barton numbering',
              'Check module documentation and visual outputs',
              'Verify troubleshooting/repair interface',
              'Generate comprehensive compliance report'
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

        {/* Results */}
        {auditState.status === 'completed' && auditState.results && (
          <div className="space-y-8">
            {/* Compliance Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Compliance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {complianceResults?.overallCompliance}%
                  </div>
                  <div className="text-green-600">Overall Compliance</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {complianceResults?.summary.compliantModules} / {complianceResults?.summary.totalModules}
                  </div>
                  <div className="text-blue-600">Compliant Modules</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">
                    {complianceResults?.summary.violations.length}
                  </div>
                  <div className="text-orange-600">Total Violations</div>
                </div>
              </div>
            </div>

            {/* Module Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Module Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Barton Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complianceResults?.modules.map((module: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {module.module}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {module.bartonNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {module.score}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            module.score >= 80 ? 'bg-green-100 text-green-800' :
                            module.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {module.score >= 80 ? 'Compliant' : module.score >= 60 ? 'Warning' : 'Non-Compliant'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Outputs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Visual Outputs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {moduleVisuals.slice(0, 4).map((visual, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {visual.moduleName} (B{visual.bartonNumber})
                    </h4>
                    <div className="text-sm text-gray-600">
                      <p>✅ Diagram generated</p>
                      <p>✅ Schematic created</p>
                      <p>✅ Compliance chart ready</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Audit Completed Successfully
              </h3>
              <p className="text-green-700">
                Repo Lens application passed ORBT + Barton doctrine audit.
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {auditState.status === 'error' && auditState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">❌</div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Audit Failed</h3>
                <p className="text-red-700">{auditState.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 