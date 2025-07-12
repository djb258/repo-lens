// Shared utilities for Repo Lens Modular System
// ORBT and Barton Doctrine Compliant

import { v4 as uuidv4 } from 'uuid';
import { 
  BartonDiagnostic, 
  DoctrineNumbering, 
  ORBTCycle,
  GitHubRepository,
  ModuleStructure 
} from '../types';

// Barton Doctrine Integration
export class ModularBartonUtils {
  private static sessionId = uuidv4();

  static createDiagnostic(
    message: string,
    severity: BartonDiagnostic['severity'] = 'info',
    category: BartonDiagnostic['category'] = 'module',
    context?: Record<string, any>
  ): BartonDiagnostic {
    return {
      bartonId: uuidv4(),
      sessionId: this.sessionId,
      timestamp: new Date(),
      severity,
      category,
      message,
      context,
      autoResolved: false,
      resolutionSteps: []
    };
  }

  static createORBTCycle(): ORBTCycle {
    const baseDiagnostic = this.createDiagnostic('ORBT cycle initialized', 'info', 'orbt');
    
    return {
      observe: {
        status: 'pending',
        data: null,
        diagnostics: [baseDiagnostic]
      },
      report: {
        status: 'pending',
        findings: [],
        diagnostics: []
      },
      build: {
        status: 'pending',
        output: null,
        diagnostics: []
      },
      test: {
        status: 'pending',
        results: [],
        diagnostics: []
      }
    };
  }

  static updateORBTCyclePhase(
    cycle: ORBTCycle,
    phase: keyof ORBTCycle,
    status: 'pending' | 'active' | 'completed' | 'failed',
    data?: any,
    diagnostics?: BartonDiagnostic[]
  ): ORBTCycle {
    const updatedCycle = { ...cycle };
    updatedCycle[phase] = {
      ...updatedCycle[phase],
      status,
      ...(data && { data }),
      ...(diagnostics && { diagnostics })
    };

    // Add diagnostic for phase update
    const diagnostic = this.createDiagnostic(
      `ORBT ${phase} phase updated to ${status}`,
      status === 'failed' ? 'error' : 'info',
      'orbt',
      { phase, status, data }
    );
    updatedCycle[phase].diagnostics.push(diagnostic);

    return updatedCycle;
  }
}

// Doctrine Numbering System
export class DoctrineNumberingSystem {
  private static repoCounter = 0;
  private static moduleCounters: Record<string, number> = {};

  static generateRepoId(): string {
    this.repoCounter++;
    return this.repoCounter.toString();
  }

  static generateModuleId(repoId: string): string {
    if (!this.moduleCounters[repoId]) {
      this.moduleCounters[repoId] = 0;
    }
    this.moduleCounters[repoId]++;
    return this.moduleCounters[repoId].toString();
  }

  static createDoctrineNumbering(
    repoId: string,
    moduleId?: string,
    submoduleId?: string
  ): DoctrineNumbering {
    const parts = [repoId];
    if (moduleId) parts.push(moduleId);
    if (submoduleId) parts.push(submoduleId);

    return {
      repoId,
      moduleId,
      submoduleId,
      fullPath: parts.join('.')
    };
  }

  static parseDoctrineNumbering(fullPath: string): DoctrineNumbering {
    const parts = fullPath.split('.');
    return {
      repoId: parts[0],
      moduleId: parts[1],
      submoduleId: parts[2],
      fullPath
    };
  }

  static validateDoctrineNumbering(numbering: DoctrineNumbering): boolean {
    return !!(numbering.repoId && numbering.fullPath);
  }
}

// GitHub Repository Enhancement
export class GitHubRepositoryEnhancer {
  static enhanceRepository(repo: any): GitHubRepository {
    const repoId = DoctrineNumberingSystem.generateRepoId();
    const doctrineNumbering = DoctrineNumberingSystem.createDoctrineNumbering(repoId);
    const orbtCycle = ModularBartonUtils.createORBTCycle();
    
    const diagnostic = ModularBartonUtils.createDiagnostic(
      `Repository ${repo.full_name} enhanced with doctrine numbering`,
      'info',
      'github',
      { repoId, fullName: repo.full_name }
    );

    return {
      ...repo,
      doctrineNumbering,
      orbtCycle,
      diagnostics: [diagnostic]
    };
  }

  static enhanceRepositoryList(repos: any[]): GitHubRepository[] {
    return repos.map(repo => this.enhanceRepository(repo));
  }
}

// Module Structure Utilities
export class ModuleStructureUtils {
  static createModuleStructure(
    name: string,
    path: string,
    type: ModuleStructure['type'],
    repoId: string
  ): ModuleStructure {
    const moduleId = DoctrineNumberingSystem.generateModuleId(repoId);
    const doctrineNumbering = DoctrineNumberingSystem.createDoctrineNumbering(repoId, moduleId);
    const orbtCycle = ModularBartonUtils.createORBTCycle();

    const diagnostic = ModularBartonUtils.createDiagnostic(
      `Module ${name} created with doctrine numbering`,
      'info',
      'module',
      { moduleId, name, path, type }
    );

    return {
      id: moduleId,
      name,
      path,
      type,
      complexity: 'low', // Default, can be enhanced later
      dependencies: [],
      doctrineNumbering,
      orbtCycle,
      diagnostics: [diagnostic]
    };
  }

  static analyzeModuleComplexity(module: ModuleStructure): 'low' | 'medium' | 'high' {
    // Simple complexity analysis based on dependencies and type
    const dependencyScore = module.dependencies.length;
    const typeScore = {
      'component': 1,
      'utility': 1,
      'service': 2,
      'page': 2,
      'api': 3
    }[module.type] || 1;

    const totalScore = dependencyScore + typeScore;

    if (totalScore <= 2) return 'low';
    if (totalScore <= 5) return 'medium';
    return 'high';
  }
}

// Error Handling and Recovery
export class ModularErrorHandler {
  static handleError(
    error: Error,
    context: string,
    moduleId?: string
  ): BartonDiagnostic {
    const diagnostic = ModularBartonUtils.createDiagnostic(
      `Error in ${context}: ${error.message}`,
      'error',
      'module',
      { 
        context, 
        moduleId, 
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    );

    // Log error for debugging
    console.error(`[ModularErrorHandler] ${context}:`, error);
    
    return diagnostic;
  }

  static createRecoverySteps(error: Error, context: string): string[] {
    const steps = [
      `Review error context: ${context}`,
      'Check diagnostic logs for detailed information',
      'Verify module dependencies and configuration',
      'Run ORBT cycle to identify root cause',
      'Implement fixes based on diagnostic recommendations'
    ];

    // Add context-specific recovery steps
    if (context.includes('GitHub')) {
      steps.push('Verify GitHub API token and permissions');
      steps.push('Check rate limiting and API quotas');
    }

    if (context.includes('Module')) {
      steps.push('Validate module structure and dependencies');
      steps.push('Check module configuration and environment');
    }

    return steps;
  }
}

// Performance Monitoring
export class ModularPerformanceMonitor {
  private static metrics: Record<string, any> = {};

  static startTimer(operation: string): string {
    const timerId = uuidv4();
    this.metrics[timerId] = {
      operation,
      startTime: performance.now(),
      endTime: null,
      duration: null
    };
    return timerId;
  }

  static endTimer(timerId: string): number {
    if (!this.metrics[timerId]) {
      throw new Error(`Timer ${timerId} not found`);
    }

    const metric = this.metrics[timerId];
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    return metric.duration;
  }

  static getMetrics(): Record<string, any> {
    return { ...this.metrics };
  }

  static clearMetrics(): void {
    this.metrics = {};
  }
}

// Validation Utilities
export class ModularValidator {
  static validateRepository(repo: any): boolean {
    return !!(repo && repo.id && repo.name && repo.full_name);
  }

  static validateModuleStructure(module: ModuleStructure): boolean {
    return !!(
      module.id &&
      module.name &&
      module.path &&
      module.type &&
      DoctrineNumberingSystem.validateDoctrineNumbering(module.doctrineNumbering)
    );
  }

  static validateORBTCycle(cycle: ORBTCycle): boolean {
    return !!(
      cycle.observe &&
      cycle.report &&
      cycle.build &&
      cycle.test
    );
  }
}

// Export all utilities for easy access
export const ModularUtils = {
  Barton: ModularBartonUtils,
  Doctrine: DoctrineNumberingSystem,
  GitHub: GitHubRepositoryEnhancer,
  Module: ModuleStructureUtils,
  Error: ModularErrorHandler,
  Performance: ModularPerformanceMonitor,
  Validator: ModularValidator
}; 