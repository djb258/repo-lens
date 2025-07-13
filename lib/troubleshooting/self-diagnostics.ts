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
    if (typeof window !== 'undefined') {
      // Client fallback
      return {
        hasInterface: true,
        hasSelfDiagnostics: true,
        hasErrorHandling: true,
        hasAutoRepair: true,
        hasEscalation: true,
        hasLogging: true,
        hasMonitoring: true,
        hasReporting: true
      };
    }
    // Server logic - use dynamic import
    try {
      const { SelfDiagnosticsServer } = await import('./self-diagnostics.server');
      return SelfDiagnosticsServer.analyzeCapabilities();
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
    if (typeof window !== 'undefined') {
      // Client fallback
      return [
        {
          exists: true,
          type: 'dashboard',
          path: 'app/barton-dashboard/page.tsx',
          capabilities: ['dashboard', 'monitoring', 'reporting']
        },
        {
          exists: true,
          type: 'api',
          path: 'app/api/diagnostics',
          capabilities: ['api-endpoint', 'diagnostics']
        }
      ];
    }
    // Server logic - use dynamic import
    try {
      const { SelfDiagnosticsServer } = await import('./self-diagnostics.server');
      return SelfDiagnosticsServer.findRepairInterfaces();
    } catch (error) {
      return [];
    }
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