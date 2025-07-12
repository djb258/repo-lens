/**
 * Audit Report Generator
 * Generates comprehensive compliance reports for ORBT + Barton doctrine audits
 */

import { AuditReport, ORBTComplianceResult } from '../validators/orbt-validator';

export interface ComplianceReport {
  application: string;
  timestamp: string;
  auditedBy: string;
  overallCompliance: number;
  modules: ORBTComplianceResult[];
  summary: {
    totalModules: number;
    compliantModules: number;
    violations: string[];
    recommendations: string[];
  };
  visualOutputs: {
    complianceChart: string;
    moduleStatus: string;
    violationSummary: string;
  };
  exportFormats: {
    json: string;
    markdown: string;
    html: string;
  };
}

export class AuditReportGenerator {
  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(data: {
    application: string;
    complianceResults: AuditReport;
    auditedBy: string;
    timestamp: string;
  }): Promise<ComplianceReport> {
    const { complianceResults } = data;
    
    // Generate visual outputs
    const visualOutputs = this.generateVisualOutputs(complianceResults);
    
    // Generate export formats
    const exportFormats = this.generateExportFormats(complianceResults);
    
    return {
      application: data.application,
      timestamp: data.timestamp,
      auditedBy: data.auditedBy,
      overallCompliance: complianceResults.overallCompliance,
      modules: complianceResults.modules,
      summary: complianceResults.summary,
      visualOutputs,
      exportFormats
    };
  }

  /**
   * Generate visual outputs for the audit report
   */
  private generateVisualOutputs(auditReport: AuditReport) {
    // Compliance chart (Mermaid)
    const complianceChart = this.generateComplianceChart(auditReport);
    
    // Module status visualization
    const moduleStatus = this.generateModuleStatusVisual(auditReport);
    
    // Violation summary
    const violationSummary = this.generateViolationSummary(auditReport);
    
    return {
      complianceChart,
      moduleStatus,
      violationSummary
    };
  }

  /**
   * Generate compliance chart using Mermaid
   */
  private generateComplianceChart(auditReport: AuditReport): string {
    const modules = auditReport.modules;
    
    let chart = `graph TD
    A[Repo Lens Application<br/>Overall Compliance: ${auditReport.overallCompliance}%]`;
    
    modules.forEach((module, index) => {
      const color = module.score >= 80 ? 'green' : module.score >= 60 ? 'yellow' : 'red';
      const status = module.score >= 80 ? '✅' : module.score >= 60 ? '⚠️' : '❌';
      
      chart += `
    B${index}[${status} ${module.module}<br/>Score: ${module.score}%<br/>Barton: ${module.bartonNumber}]`;
      
      chart += `
    A --> B${index}`;
    });
    
    chart += `
    style A fill:#e1f5fe
    style B0 fill:#${modules[0]?.score >= 80 ? 'c8e6c9' : modules[0]?.score >= 60 ? 'fff9c4' : 'ffcdd2'}
    style B1 fill:#${modules[1]?.score >= 80 ? 'c8e6c9' : modules[1]?.score >= 60 ? 'fff9c4' : 'ffcdd2'}
    style B2 fill:#${modules[2]?.score >= 80 ? 'c8e6c9' : modules[2]?.score >= 60 ? 'fff9c4' : 'ffcdd2'}
    style B3 fill:#${modules[3]?.score >= 80 ? 'c8e6c9' : modules[3]?.score >= 60 ? 'fff9c4' : 'ffcdd2'}
    style B4 fill:#${modules[4]?.score >= 80 ? 'c8e6c9' : modules[4]?.score >= 60 ? 'fff9c4' : 'ffcdd2'}
    style B5 fill:#${modules[5]?.score >= 80 ? 'c8e6c9' : modules[5]?.score >= 60 ? 'fff9c4' : 'ffcdd2'}`;
    
    return chart;
  }

  /**
   * Generate module status visualization
   */
  private generateModuleStatusVisual(auditReport: AuditReport): string {
    const modules = auditReport.modules;
    
    let visual = `graph LR
    subgraph "ORBT Compliance Status"
    direction TB`;
    
    modules.forEach((module, index) => {
      const orbtStatus = module.compliance.orbt ? '✅' : '❌';
      const bartonStatus = module.compliance.barton ? '✅' : '❌';
      const docStatus = module.compliance.documentation ? '✅' : '❌';
      const visualStatus = module.compliance.visual ? '✅' : '❌';
      const troubleStatus = module.compliance.troubleshooting ? '✅' : '❌';
      
      visual += `
    M${index}[${module.module}<br/>ORBT: ${orbtStatus} | Barton: ${bartonStatus}<br/>Doc: ${docStatus} | Visual: ${visualStatus}<br/>Trouble: ${troubleStatus}]`;
    });
    
    visual += `
    end`;
    
    return visual;
  }

  /**
   * Generate violation summary
   */
  private generateViolationSummary(auditReport: AuditReport): string {
    const violations = auditReport.summary.violations;
    
    if (violations.length === 0) {
      return `graph TD
    A[No Violations Found<br/>✅ All modules compliant]`;
    }
    
    let visual = `graph TD
    A[Violations Summary<br/>${violations.length} total violations]`;
    
    violations.forEach((violation, index) => {
      visual += `
    V${index}[${violation}]`;
      visual += `
    A --> V${index}`;
    });
    
    visual += `
    style A fill:#ffebee
    style V0 fill:#ffcdd2
    style V1 fill:#ffcdd2
    style V2 fill:#ffcdd2
    style V3 fill:#ffcdd2
    style V4 fill:#ffcdd2`;
    
    return visual;
  }

  /**
   * Generate export formats
   */
  private generateExportFormats(auditReport: AuditReport) {
    return {
      json: this.generateJSONExport(auditReport),
      markdown: this.generateMarkdownExport(auditReport),
      html: this.generateHTMLExport(auditReport)
    };
  }

  /**
   * Generate JSON export
   */
  private generateJSONExport(auditReport: AuditReport): string {
    return JSON.stringify(auditReport, null, 2);
  }

  /**
   * Generate Markdown export
   */
  private generateMarkdownExport(auditReport: AuditReport): string {
    let markdown = `# ORBT + Barton Doctrine Compliance Report

## Application: ${auditReport.application}
**Audited By:** ${auditReport.auditedBy}  
**Timestamp:** ${auditReport.timestamp}  
**Overall Compliance:** ${auditReport.overallCompliance}%

## Summary
- **Total Modules:** ${auditReport.summary.totalModules}
- **Compliant Modules:** ${auditReport.summary.compliantModules}
- **Compliance Rate:** ${Math.round((auditReport.summary.compliantModules / auditReport.summary.totalModules) * 100)}%

## Module Details

`;

    auditReport.modules.forEach(module => {
      const status = module.score >= 80 ? '✅' : module.score >= 60 ? '⚠️' : '❌';
      
      markdown += `### ${status} ${module.module} (Score: ${module.score}%)

**Barton Number:** ${module.bartonNumber}

**ORBT Compliance:**
- Operating: ${module.orbtSections.operating ? '✅' : '❌'}
- Repair: ${module.orbtSections.repair ? '✅' : '❌'}
- Build: ${module.orbtSections.build ? '✅' : '❌'}
- Training: ${module.orbtSections.training ? '✅' : '❌'}

**Requirements:**
- Documentation: ${module.documentation.exists ? '✅' : '❌'}
- Visual Outputs: ${module.visual.exists ? '✅' : '❌'}
- Troubleshooting: ${module.troubleshooting.hasInterface ? '✅' : '❌'}

`;

      if (module.violations.length > 0) {
        markdown += `**Violations:**
${module.violations.map(v => `- ${v}`).join('\n')}

`;
      }
    });

    if (auditReport.summary.violations.length > 0) {
      markdown += `## Violations Summary

${auditReport.summary.violations.map(v => `- ${v}`).join('\n')}

`;
    }

    if (auditReport.summary.recommendations.length > 0) {
      markdown += `## Recommendations

${auditReport.summary.recommendations.map(r => `- ${r}`).join('\n')}

`;
    }

    return markdown;
  }

  /**
   * Generate HTML export
   */
  private generateHTMLExport(auditReport: AuditReport): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ORBT + Barton Doctrine Compliance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .module { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .compliant { border-left: 5px solid #4caf50; }
        .warning { border-left: 5px solid #ff9800; }
        .non-compliant { border-left: 5px solid #f44336; }
        .status { font-weight: bold; }
        .violations { background: #ffebee; padding: 10px; border-radius: 3px; margin: 10px 0; }
        .recommendations { background: #e8f5e8; padding: 10px; border-radius: 3px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ORBT + Barton Doctrine Compliance Report</h1>
        <p><strong>Application:</strong> ${auditReport.application}</p>
        <p><strong>Audited By:</strong> ${auditReport.auditedBy}</p>
        <p><strong>Timestamp:</strong> ${auditReport.timestamp}</p>
        <p><strong>Overall Compliance:</strong> ${auditReport.overallCompliance}%</p>
    </div>

    <h2>Module Details</h2>
    ${auditReport.modules.map(module => {
      const statusClass = module.score >= 80 ? 'compliant' : module.score >= 60 ? 'warning' : 'non-compliant';
      const status = module.score >= 80 ? '✅ Compliant' : module.score >= 60 ? '⚠️ Warning' : '❌ Non-Compliant';
      
      return `<div class="module ${statusClass}">
        <h3>${module.module} - ${status} (Score: ${module.score}%)</h3>
        <p><strong>Barton Number:</strong> ${module.bartonNumber}</p>
        <p><strong>ORBT Compliance:</strong></p>
        <ul>
            <li>Operating: ${module.orbtSections.operating ? '✅' : '❌'}</li>
            <li>Repair: ${module.orbtSections.repair ? '✅' : '❌'}</li>
            <li>Build: ${module.orbtSections.build ? '✅' : '❌'}</li>
            <li>Training: ${module.orbtSections.training ? '✅' : '❌'}</li>
        </ul>
        <p><strong>Requirements:</strong></p>
        <ul>
            <li>Documentation: ${module.documentation.exists ? '✅' : '❌'}</li>
            <li>Visual Outputs: ${module.visual.exists ? '✅' : '❌'}</li>
            <li>Troubleshooting: ${module.troubleshooting.hasInterface ? '✅' : '❌'}</li>
        </ul>
        ${module.violations.length > 0 ? `<div class="violations">
            <strong>Violations:</strong>
            <ul>${module.violations.map(v => `<li>${v}</li>`).join('')}</ul>
        </div>` : ''}
    </div>`;
    }).join('')}

    ${auditReport.summary.recommendations.length > 0 ? `<h2>Recommendations</h2>
    <div class="recommendations">
        <ul>${auditReport.summary.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
    </div>` : ''}
</body>
</html>`;
  }
}

// Export the main function
export async function generateComplianceReport(data: {
  application: string;
  complianceResults: AuditReport;
  auditedBy: string;
  timestamp: string;
}): Promise<ComplianceReport> {
  const generator = new AuditReportGenerator();
  return await generator.generateComplianceReport(data);
} 