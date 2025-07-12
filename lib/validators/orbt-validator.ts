/**
 * ORBT Validator - Comprehensive Compliance Checker
 * Validates Repo Lens application against ORBT system and Barton Numbering Doctrine
 */

import { ORPTSystem } from '../orpt-system';
import { BartonNumberingDoctrine } from '../barton-numbering-doctrine';

export interface ORBTComplianceResult {
  module: string;
  bartonNumber: string;
  orbtSections: {
    operating: boolean;
    repair: boolean;
    build: boolean;
    training: boolean;
  };
  documentation: {
    exists: boolean;
    path?: string;
  };
  visual: {
    exists: boolean;
    path?: string;
  };
  troubleshooting: {
    hasInterface: boolean;
    hasSelfDiagnostics: boolean;
  };
  compliance: {
    orbt: boolean;
    barton: boolean;
    documentation: boolean;
    visual: boolean;
    troubleshooting: boolean;
  };
  violations: string[];
  score: number; // 0-100
}

export interface AuditReport {
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
}

export class ORBTValidator {
  private orpt: ORPTSystem;
  private barton: BartonNumberingDoctrine;

  constructor() {
    this.orpt = new ORPTSystem();
    this.barton = new BartonNumberingDoctrine();
  }

  /**
   * Validate complete ORBT compliance across all modules
   */
  async validateORBTCompliance(): Promise<AuditReport> {
    const modules = await this.discoverModules();
    const results: ORBTComplianceResult[] = [];

    for (const module of modules) {
      const result = await this.validateModule(module);
      results.push(result);
    }

    const overallCompliance = this.calculateOverallCompliance(results);
    const violations = this.collectViolations(results);
    const recommendations = this.generateRecommendations(results);

    return {
      application: "Repo Lens",
      timestamp: new Date().toISOString(),
      auditedBy: "Cursor ORBT Audit",
      overallCompliance,
      modules: results,
      summary: {
        totalModules: modules.length,
        compliantModules: results.filter(r => r.score >= 80).length,
        violations,
        recommendations
      }
    };
  }

  /**
   * Discover all modules in the application
   */
  private async discoverModules(): Promise<string[]> {
    const moduleDirs = [
      'app/modules/01-github-index',
      'app/modules/02-repo-overview', 
      'app/modules/03-visual-architecture',
      'app/modules/04-module-detail',
      'app/modules/05-file-detail',
      'app/modules/06-error-log',
      'app/modules/test',
      'app/barton-dashboard',
      'app/diagnostics'
    ];

    return moduleDirs.filter(dir => {
      try {
        const fs = require('fs');
        return fs.existsSync(dir);
      } catch {
        return false;
      }
    });
  }

  /**
   * Validate individual module compliance
   */
  private async validateModule(modulePath: string): Promise<ORBTComplianceResult> {
    const moduleName = modulePath.split('/').pop() || 'unknown';
    const violations: string[] = [];
    
    // Check Barton numbering
    const bartonNumber = await this.validateBartonNumbering(modulePath);
    if (!bartonNumber) {
      violations.push('Missing or invalid Barton number');
    }

    // Check ORBT sections
    const orbtSections = await this.validateORBTSections(modulePath);
    const missingSections = Object.entries(orbtSections)
      .filter(([_, exists]) => !exists)
      .map(([section]) => section);
    
    if (missingSections.length > 0) {
      violations.push(`Missing ORBT sections: ${missingSections.join(', ')}`);
    }

    // Check documentation
    const documentation = await this.validateDocumentation(modulePath);
    if (!documentation.exists) {
      violations.push('Missing documentation');
    }

    // Check visual outputs
    const visual = await this.validateVisualOutputs(modulePath);
    if (!visual.exists) {
      violations.push('Missing visual outputs');
    }

    // Check troubleshooting capabilities
    const troubleshooting = await this.validateTroubleshooting(modulePath);
    if (!troubleshooting.hasInterface) {
      violations.push('Missing troubleshooting interface');
    }

    const score = this.calculateModuleScore({
      orbtSections,
      documentation,
      visual,
      troubleshooting,
      violations
    });

    return {
      module: moduleName,
      bartonNumber: bartonNumber || 'INVALID',
      orbtSections,
      documentation,
      visual,
      troubleshooting,
      compliance: {
        orbt: Object.values(orbtSections).every(Boolean),
        barton: !!bartonNumber,
        documentation: documentation.exists,
        visual: visual.exists,
        troubleshooting: troubleshooting.hasInterface
      },
      violations,
      score
    };
  }

  /**
   * Validate Barton numbering for a module
   */
  private async validateBartonNumbering(modulePath: string): Promise<string | null> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check for page.tsx or layout.tsx files
      const files = ['page.tsx', 'layout.tsx'];
      
      for (const file of files) {
        const filePath = path.join(modulePath, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Look for Barton number patterns
          const bartonPattern = /B\d+\.\d+\.\d+/g;
          const matches = content.match(bartonPattern);
          
          if (matches && matches.length > 0) {
            return matches[0];
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate ORBT sections in module
   */
  private async validateORBTSections(modulePath: string): Promise<{
    operating: boolean;
    repair: boolean;
    build: boolean;
    training: boolean;
  }> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const files = ['page.tsx', 'layout.tsx'];
      let content = '';
      
      for (const file of files) {
        const filePath = path.join(modulePath, file);
        if (fs.existsSync(filePath)) {
          content += fs.readFileSync(filePath, 'utf8');
        }
      }

      return {
        operating: content.includes('operating') || content.includes('Operating'),
        repair: content.includes('repair') || content.includes('Repair') || content.includes('troubleshooting'),
        build: content.includes('build') || content.includes('Build') || content.includes('construction'),
        training: content.includes('training') || content.includes('Training') || content.includes('documentation')
      };
    } catch (error) {
      return {
        operating: false,
        repair: false,
        build: false,
        training: false
      };
    }
  }

  /**
   * Validate documentation exists
   */
  private async validateDocumentation(modulePath: string): Promise<{
    exists: boolean;
    path?: string;
  }> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const docFiles = ['README.md', 'DOCUMENTATION.md', 'API.md'];
      
      for (const file of docFiles) {
        const filePath = path.join(modulePath, file);
        if (fs.existsSync(filePath)) {
          return { exists: true, path: filePath };
        }
      }
      
      return { exists: false };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Validate visual outputs exist
   */
  private async validateVisualOutputs(modulePath: string): Promise<{
    exists: boolean;
    path?: string;
  }> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const visualFiles = ['visual.tsx', 'diagram.tsx', 'schematic.tsx'];
      
      for (const file of visualFiles) {
        const filePath = path.join(modulePath, file);
        if (fs.existsSync(filePath)) {
          return { exists: true, path: filePath };
        }
      }
      
      // Check if page contains visual elements
      const pagePath = path.join(modulePath, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        if (content.includes('visual') || content.includes('diagram') || content.includes('chart')) {
          return { exists: true, path: pagePath };
        }
      }
      
      return { exists: false };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Validate troubleshooting capabilities
   */
  private async validateTroubleshooting(modulePath: string): Promise<{
    hasInterface: boolean;
    hasSelfDiagnostics: boolean;
  }> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const pagePath = path.join(modulePath, 'page.tsx');
      let content = '';
      
      if (fs.existsSync(pagePath)) {
        content = fs.readFileSync(pagePath, 'utf8');
      }

      return {
        hasInterface: content.includes('troubleshooting') || content.includes('diagnostics') || content.includes('error'),
        hasSelfDiagnostics: content.includes('self-diagnostic') || content.includes('auto-diagnostic')
      };
    } catch (error) {
      return {
        hasInterface: false,
        hasSelfDiagnostics: false
      };
    }
  }

  /**
   * Calculate module compliance score
   */
  private calculateModuleScore(data: {
    orbtSections: { [key: string]: boolean };
    documentation: { exists: boolean };
    visual: { exists: boolean };
    troubleshooting: { hasInterface: boolean };
    violations: string[];
  }): number {
    let score = 100;
    
    // Deduct points for missing ORBT sections
    const missingSections = Object.values(data.orbtSections).filter(Boolean).length;
    score -= (4 - missingSections) * 15; // 15 points per missing section
    
    // Deduct points for missing documentation
    if (!data.documentation.exists) score -= 20;
    
    // Deduct points for missing visual outputs
    if (!data.visual.exists) score -= 20;
    
    // Deduct points for missing troubleshooting
    if (!data.troubleshooting.hasInterface) score -= 20;
    
    // Deduct points for violations
    score -= data.violations.length * 5;
    
    return Math.max(0, score);
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallCompliance(results: ORBTComplianceResult[]): number {
    if (results.length === 0) return 0;
    
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / results.length);
  }

  /**
   * Collect all violations across modules
   */
  private collectViolations(results: ORBTComplianceResult[]): string[] {
    const violations = new Set<string>();
    
    results.forEach(result => {
      result.violations.forEach(violation => {
        violations.add(`${result.module}: ${violation}`);
      });
    });
    
    return Array.from(violations);
  }

  /**
   * Generate recommendations based on audit results
   */
  private generateRecommendations(results: ORBTComplianceResult[]): string[] {
    const recommendations: string[] = [];
    
    const lowScoreModules = results.filter(r => r.score < 80);
    if (lowScoreModules.length > 0) {
      recommendations.push(`Improve compliance in modules: ${lowScoreModules.map(m => m.module).join(', ')}`);
    }
    
    const missingDocs = results.filter(r => !r.documentation.exists);
    if (missingDocs.length > 0) {
      recommendations.push(`Add documentation to modules: ${missingDocs.map(m => m.module).join(', ')}`);
    }
    
    const missingVisuals = results.filter(r => !r.visual.exists);
    if (missingVisuals.length > 0) {
      recommendations.push(`Add visual outputs to modules: ${missingVisuals.map(m => m.module).join(', ')}`);
    }
    
    return recommendations;
  }
}

// Export the main validation function
export async function validateORBTCompliance(): Promise<AuditReport> {
  const validator = new ORBTValidator();
  return await validator.validateORBTCompliance();
} 