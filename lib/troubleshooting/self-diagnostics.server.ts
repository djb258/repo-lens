// Server-only Self-Diagnostics System for ORBT + Barton Doctrine
import fs from 'fs';
import path from 'path';
import type { TroubleshootingCapabilities, RepairInterface } from './self-diagnostics';

export class SelfDiagnosticsServer {
  /**
   * Analyze troubleshooting capabilities (server-only)
   */
  static async analyzeCapabilities(): Promise<TroubleshootingCapabilities> {
    try {
      // Check for troubleshooting-related files and directories
      const troubleshootingPaths = [
        'app/diagnostics',
        'app/barton-dashboard',
        'app/modules/06-error-log',
        'lib/troubleshooting_log.ts',
        'lib/diagnostics.ts'
      ];
      let hasInterface = false;
      let hasSelfDiagnostics = false;
      let hasErrorHandling = false;
      let hasAutoRepair = false;
      let hasEscalation = false;
      let hasLogging = false;
      let hasMonitoring = false;
      let hasReporting = false;
      for (const checkPath of troubleshootingPaths) {
        if (fs.existsSync(checkPath)) {
          hasInterface = true;
          if (checkPath.includes('diagnostics')) {
            hasSelfDiagnostics = true;
            hasMonitoring = true;
          }
          if (checkPath.includes('error-log')) {
            hasErrorHandling = true;
            hasLogging = true;
          }
          if (checkPath.includes('barton-dashboard')) {
            hasReporting = true;
          }
          if (fs.statSync(checkPath).isFile()) {
            const content = fs.readFileSync(checkPath, 'utf8');
            if (content.includes('auto-repair') || content.includes('autoRepair')) {
              hasAutoRepair = true;
            }
            if (content.includes('escalation') || content.includes('escalate')) {
              hasEscalation = true;
            }
          }
        }
      }
      // Check for ORPT system integration
      const orptPath = 'lib/orpt-system.ts';
      if (fs.existsSync(orptPath)) {
        const orptContent = fs.readFileSync(orptPath, 'utf8');
        if (orptContent.includes('repair') || orptContent.includes('Repair')) {
          hasAutoRepair = true;
        }
        if (orptContent.includes('escalation') || orptContent.includes('Escalation')) {
          hasEscalation = true;
        }
      }
      return {
        hasInterface,
        hasSelfDiagnostics,
        hasErrorHandling,
        hasAutoRepair,
        hasEscalation,
        hasLogging,
        hasMonitoring,
        hasReporting
      };
    } catch (error) {
      return {
        hasInterface: false,
        hasSelfDiagnostics: false,
        hasErrorHandling: false,
        hasAutoRepair: false,
        hasEscalation: false,
        hasLogging: false,
        hasMonitoring: false,
        hasReporting: false
      };
    }
  }

  /**
   * Find repair interfaces in the application (server-only)
   */
  static async findRepairInterfaces(): Promise<RepairInterface[]> {
    const interfaces: RepairInterface[] = [];
    try {
      // Check for dashboard interfaces
      const dashboardPaths = [
        'app/barton-dashboard/page.tsx',
        'app/diagnostics/page.tsx',
        'app/modules/06-error-log/page.tsx'
      ];
      for (const dashboardPath of dashboardPaths) {
        if (fs.existsSync(dashboardPath)) {
          const content = fs.readFileSync(dashboardPath, 'utf8');
          // Dummy capability extraction for now
          const capabilities = ['dashboard'];
          interfaces.push({
            exists: true,
            type: 'dashboard',
            path: dashboardPath,
            capabilities
          });
        }
      }
      // Check for API repair endpoints
      const apiPaths = [
        'app/api/diagnostics',
        'app/api/troubleshooting',
        'app/api/repair'
      ];
      for (const apiPath of apiPaths) {
        if (fs.existsSync(apiPath)) {
          interfaces.push({
            exists: true,
            type: 'api',
            path: apiPath,
            capabilities: ['api-endpoint']
          });
        }
      }
      // Check for repair components
      const componentPaths = [
        'components/TroubleshootingDashboard.tsx',
        'components/DiagnosticsPanel.tsx',
        'components/RepairInterface.tsx'
      ];
      for (const componentPath of componentPaths) {
        if (fs.existsSync(componentPath)) {
          const content = fs.readFileSync(componentPath, 'utf8');
          // Dummy capability extraction for now
          const capabilities = ['component'];
          interfaces.push({
            exists: true,
            type: 'component',
            path: componentPath,
            capabilities
          });
        }
      }
      return interfaces;
    } catch (error) {
      return [];
    }
  }
} 