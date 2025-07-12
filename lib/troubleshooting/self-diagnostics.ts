/**
 * Self-Diagnostics System for ORBT + Barton Doctrine
 * Checks troubleshooting capabilities and repair interfaces
 */

export interface TroubleshootingCapabilities {
  hasInterface: boolean;
  hasSelfDiagnostics: boolean;
  hasErrorHandling: boolean;
  hasAutoRepair: boolean;
  hasEscalation: boolean;
  hasLogging: boolean;
  hasMonitoring: boolean;
  hasReporting: boolean;
}

export interface RepairInterface {
  exists: boolean;
  type: 'dashboard' | 'api' | 'component' | 'page';
  path?: string;
  capabilities: string[];
}

export class SelfDiagnostics {
  /**
   * Check troubleshooting capabilities across the application
   */
  async checkTroubleshootingCapabilities(): Promise<{
    hasInterface: boolean;
    capabilities: TroubleshootingCapabilities;
    repairInterfaces: RepairInterface[];
    recommendations: string[];
  }> {
    const capabilities = await this.analyzeCapabilities();
    const repairInterfaces = await this.findRepairInterfaces();
    const recommendations = this.generateRecommendations(capabilities, repairInterfaces);

    return {
      hasInterface: capabilities.hasInterface,
      capabilities,
      repairInterfaces,
      recommendations
    };
  }

  /**
   * Analyze troubleshooting capabilities
   */
  private async analyzeCapabilities(): Promise<TroubleshootingCapabilities> {
    try {
      const fs = require('fs');
      const path = require('path');
      
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
          
          // Check specific capabilities based on path
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
          
          // Check file contents for additional capabilities
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
   * Find repair interfaces in the application
   */
  private async findRepairInterfaces(): Promise<RepairInterface[]> {
    const interfaces: RepairInterface[] = [];
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check for dashboard interfaces
      const dashboardPaths = [
        'app/barton-dashboard/page.tsx',
        'app/diagnostics/page.tsx',
        'app/modules/06-error-log/page.tsx'
      ];
      
      for (const dashboardPath of dashboardPaths) {
        if (fs.existsSync(dashboardPath)) {
          const content = fs.readFileSync(dashboardPath, 'utf8');
          const capabilities = this.extractCapabilities(content);
          
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
          const capabilities = this.extractCapabilities(content);
          
          interfaces.push({
            exists: true,
            type: 'component',
            path: componentPath,
            capabilities
          });
        }
      }
      
    } catch (error) {
      // Continue with empty interfaces array
    }
    
    return interfaces;
  }

  /**
   * Extract capabilities from file content
   */
  private extractCapabilities(content: string): string[] {
    const capabilities: string[] = [];
    
    if (content.includes('troubleshooting') || content.includes('diagnostics')) {
      capabilities.push('diagnostics');
    }
    
    if (content.includes('error') || content.includes('Error')) {
      capabilities.push('error-handling');
    }
    
    if (content.includes('repair') || content.includes('Repair')) {
      capabilities.push('repair');
    }
    
    if (content.includes('auto') || content.includes('Auto')) {
      capabilities.push('auto-resolution');
    }
    
    if (content.includes('escalation') || content.includes('Escalation')) {
      capabilities.push('escalation');
    }
    
    if (content.includes('log') || content.includes('Log')) {
      capabilities.push('logging');
    }
    
    if (content.includes('monitor') || content.includes('Monitor')) {
      capabilities.push('monitoring');
    }
    
    if (content.includes('report') || content.includes('Report')) {
      capabilities.push('reporting');
    }
    
    return capabilities;
  }

  /**
   * Generate recommendations based on capabilities analysis
   */
  private generateRecommendations(
    capabilities: TroubleshootingCapabilities,
    repairInterfaces: RepairInterface[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (!capabilities.hasInterface) {
      recommendations.push('Create a troubleshooting dashboard interface');
    }
    
    if (!capabilities.hasSelfDiagnostics) {
      recommendations.push('Implement self-diagnostic capabilities');
    }
    
    if (!capabilities.hasErrorHandling) {
      recommendations.push('Add comprehensive error handling system');
    }
    
    if (!capabilities.hasAutoRepair) {
      recommendations.push('Implement auto-repair functionality');
    }
    
    if (!capabilities.hasEscalation) {
      recommendations.push('Add escalation mechanisms for critical issues');
    }
    
    if (!capabilities.hasLogging) {
      recommendations.push('Implement comprehensive logging system');
    }
    
    if (!capabilities.hasMonitoring) {
      recommendations.push('Add system monitoring capabilities');
    }
    
    if (!capabilities.hasReporting) {
      recommendations.push('Create reporting and analytics interface');
    }
    
    if (repairInterfaces.length === 0) {
      recommendations.push('Create at least one repair interface (dashboard, API, or component)');
    }
    
    return recommendations;
  }

  /**
   * Generate troubleshooting capability diagram
   */
  async generateCapabilityDiagram(capabilities: TroubleshootingCapabilities): Promise<string> {
    let diagram = `graph TD
    A[Troubleshooting Capabilities<br/>Repo Lens System]`;
    
    const capabilityItems = [
      { name: 'Interface', value: capabilities.hasInterface },
      { name: 'Self-Diagnostics', value: capabilities.hasSelfDiagnostics },
      { name: 'Error Handling', value: capabilities.hasErrorHandling },
      { name: 'Auto-Repair', value: capabilities.hasAutoRepair },
      { name: 'Escalation', value: capabilities.hasEscalation },
      { name: 'Logging', value: capabilities.hasLogging },
      { name: 'Monitoring', value: capabilities.hasMonitoring },
      { name: 'Reporting', value: capabilities.hasReporting }
    ];
    
    capabilityItems.forEach((item, index) => {
      diagram += `
    C${index}[${item.name}<br/>${item.value ? '✅' : '❌'}]`;
      diagram += `
    A --> C${index}`;
    });
    
    // Add styling
    diagram += `
    style A fill:#e1f5fe`;
    
    capabilityItems.forEach((item, index) => {
      const color = item.value ? 'c8e6c9' : 'ffcdd2';
      diagram += `
    style C${index} fill:#${color}`;
    });
    
    return diagram;
  }

  /**
   * Generate repair interface overview
   */
  async generateRepairInterfaceOverview(interfaces: RepairInterface[]): Promise<string> {
    if (interfaces.length === 0) {
      return `graph TD
    A[No Repair Interfaces Found<br/>❌ Missing ORBT:Repair]`;
    }
    
    let diagram = `graph TD
    A[Repair Interfaces<br/>${interfaces.length} found]`;
    
    interfaces.forEach((interface_, index) => {
      diagram += `
    I${index}[${interface_.type}<br/>${interface_.path || 'Unknown'}<br/>${interface_.capabilities.join(', ')}]`;
      diagram += `
    A --> I${index}`;
    });
    
    diagram += `
    style A fill:#e8f5e8`;
    
    interfaces.forEach((_, index) => {
      diagram += `
    style I${index} fill:#c8e6c9`;
    });
    
    return diagram;
  }
}

// Export the main function
export async function checkTroubleshootingCapabilities(): Promise<boolean> {
  const diagnostics = new SelfDiagnostics();
  const result = await diagnostics.checkTroubleshootingCapabilities();
  return result.hasInterface;
} 