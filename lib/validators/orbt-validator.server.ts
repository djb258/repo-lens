// Server-only ORBT Validator
import fs from 'fs';
import path from 'path';
import type { ORBTComplianceResult, AuditReport } from './orbt-validator';
import { ORPTSystem } from '../orpt-system';
import { BartonNumberingDoctrine } from '../barton-numbering-doctrine';

export class ORBTValidatorServer {
  private orpt: ORPTSystem;
  private barton: BartonNumberingDoctrine;

  constructor() {
    this.orpt = new ORPTSystem();
    this.barton = new BartonNumberingDoctrine();
  }

  /**
   * Discover all modules in the application (server-only)
   */
  async discoverModules(): Promise<string[]> {
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
        return fs.existsSync(dir);
      } catch {
        return false;
      }
    });
  }

  /**
   * Validate Barton numbering for a module (server-only)
   */
  async validateBartonNumbering(modulePath: string): Promise<string | null> {
    try {
      // Check for page.tsx or layout.tsx files
      const files = ['page.tsx', 'layout.tsx'];
      
      for (const file of files) {
        const filePath = path.join(modulePath, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Look for Barton number patterns in the content
          const bartonMatch = content.match(/bartonNumber:\s*['"`](\d+\.\d+\.\d+\.\d+)['"`]/);
          if (bartonMatch) {
            return bartonMatch[1];
          }
          
          // Look for Barton number in comments
          const commentMatch = content.match(/\/\/\s*Barton:\s*(\d+\.\d+\.\d+\.\d+)/);
          if (commentMatch) {
            return commentMatch[1];
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate ORBT sections in module (server-only)
   */
  async validateORBTSections(modulePath: string): Promise<{
    operating: boolean;
    repair: boolean;
    build: boolean;
    training: boolean;
  }> {
    try {
      const pagePath = path.join(modulePath, 'page.tsx');
      const layoutPath = path.join(modulePath, 'layout.tsx');
      
      let content = '';
      if (fs.existsSync(pagePath)) {
        content = fs.readFileSync(pagePath, 'utf8');
      } else if (fs.existsSync(layoutPath)) {
        content = fs.readFileSync(layoutPath, 'utf8');
      }
      
      return {
        operating: content.includes('operating') || content.includes('Operating'),
        repair: content.includes('repair') || content.includes('Repair'),
        build: content.includes('build') || content.includes('Build'),
        training: content.includes('training') || content.includes('Training')
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
   * Validate documentation exists (server-only)
   */
  async validateDocumentation(modulePath: string): Promise<{
    exists: boolean;
    path?: string;
  }> {
    try {
      const docPaths = [
        path.join(modulePath, 'README.md'),
        path.join(modulePath, 'documentation.md'),
        path.join(modulePath, 'docs', 'README.md')
      ];
      
      for (const docPath of docPaths) {
        if (fs.existsSync(docPath)) {
          return {
            exists: true,
            path: docPath
          };
        }
      }
      
      return { exists: false };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Validate visual outputs exist (server-only)
   */
  async validateVisualOutputs(modulePath: string): Promise<{
    exists: boolean;
    path?: string;
  }> {
    try {
      const visualPaths = [
        path.join(modulePath, 'diagram.md'),
        path.join(modulePath, 'visual.md'),
        path.join(modulePath, 'mermaid.md'),
        path.join(modulePath, 'diagrams', 'overview.md')
      ];
      
      for (const visualPath of visualPaths) {
        if (fs.existsSync(visualPath)) {
          return {
            exists: true,
            path: visualPath
          };
        }
      }
      
      return { exists: false };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Validate troubleshooting capabilities (server-only)
   */
  async validateTroubleshooting(modulePath: string): Promise<{
    hasInterface: boolean;
    hasSelfDiagnostics: boolean;
  }> {
    try {
      const pagePath = path.join(modulePath, 'page.tsx');
      let content = '';
      
      if (fs.existsSync(pagePath)) {
        content = fs.readFileSync(pagePath, 'utf8');
      }
      
      return {
        hasInterface: content.includes('troubleshooting') || content.includes('diagnostics'),
        hasSelfDiagnostics: content.includes('self-diagnostics') || content.includes('SelfDiagnostics')
      };
    } catch (error) {
      return {
        hasInterface: false,
        hasSelfDiagnostics: false
      };
    }
  }
} 