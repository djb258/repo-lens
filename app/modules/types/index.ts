// Repo Lens Modular System Types
// ORBT and Barton Doctrine Compliant

export interface BartonDiagnostic {
  bartonId: string;
  sessionId: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'orbt' | 'barton' | 'github' | 'module' | 'system';
  message: string;
  context?: Record<string, any>;
  autoResolved?: boolean;
  resolutionSteps?: string[];
}

export interface ORBTCycle {
  observe: {
    status: 'pending' | 'active' | 'completed' | 'failed';
    data: any;
    diagnostics: BartonDiagnostic[];
  };
  report: {
    status: 'pending' | 'active' | 'completed' | 'failed';
    findings: any[];
    diagnostics: BartonDiagnostic[];
  };
  build: {
    status: 'pending' | 'active' | 'completed' | 'failed';
    output: any;
    diagnostics: BartonDiagnostic[];
  };
  test: {
    status: 'pending' | 'active' | 'completed' | 'failed';
    results: any[];
    diagnostics: BartonDiagnostic[];
  };
}

export interface DoctrineNumbering {
  repoId: string;
  moduleId?: string;
  submoduleId?: string;
  fullPath: string; // e.g., "39.2.1"
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
  topics: string[];
  default_branch: string;
  doctrineNumbering: DoctrineNumbering;
  orbtCycle: ORBTCycle;
  diagnostics: BartonDiagnostic[];
}

export interface RepositoryBlueprint {
  repoId: string;
  name: string;
  description: string;
  structure: {
    modules: ModuleStructure[];
    files: FileStructure[];
    dependencies: DependencyStructure[];
  };
  orbtBreakdown: {
    operating: ModuleAnalysis;
    repair: ModuleAnalysis;
    build: ModuleAnalysis;
    training: ModuleAnalysis;
  };
  diagnostics: BartonDiagnostic[];
  lastUpdated: Date;
}

export interface ModuleStructure {
  id: string;
  name: string;
  path: string;
  type: 'component' | 'service' | 'utility' | 'page' | 'api';
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
  doctrineNumbering: DoctrineNumbering;
  orbtCycle: ORBTCycle;
  diagnostics: BartonDiagnostic[];
}

export interface FileStructure {
  name: string;
  path: string;
  type: string;
  size: number;
  lastModified: Date;
  doctrineNumbering: DoctrineNumbering;
}

export interface DependencyStructure {
  name: string;
  version: string;
  type: 'production' | 'development' | 'peer';
  vulnerabilities?: VulnerabilityInfo[];
}

export interface VulnerabilityInfo {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cve?: string;
  fixedIn?: string;
}

export interface ModuleAnalysis {
  status: 'healthy' | 'warning' | 'error' | 'critical';
  score: number; // 0-100
  issues: BartonDiagnostic[];
  recommendations: string[];
  lastChecked: Date;
}

export interface DiagramNode {
  id: string;
  label: string;
  type: 'module' | 'file' | 'function' | 'component';
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string; // Based on error state
  doctrineNumbering: DoctrineNumbering;
  diagnostics: BartonDiagnostic[];
  clickable: boolean;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type: 'dependency' | 'import' | 'export' | 'reference';
  label?: string;
}

export interface DiagramView {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  metadata: {
    repoId: string;
    lastUpdated: Date;
    totalModules: number;
    totalFiles: number;
  };
  diagnostics: BartonDiagnostic[];
}

export interface ModuleViewData {
  moduleId: string;
  name: string;
  description: string;
  doctrineNumbering: DoctrineNumbering;
  orbtCycle: ORBTCycle;
  files: FileStructure[];
  dependencies: DependencyStructure[];
  diagnostics: BartonDiagnostic[];
  documentation?: string;
  testResults?: TestResult[];
  performanceMetrics?: PerformanceMetrics;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  timestamp: Date;
}

export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  bundleSize: number;
  lastMeasured: Date;
}

// Module-specific interfaces
export interface GitHubIndexModule {
  repositories: GitHubRepository[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date;
  autoRefreshEnabled: boolean;
  diagnostics: BartonDiagnostic[];
}

export interface RepoOverviewModule {
  repository: GitHubRepository | null;
  blueprint: RepositoryBlueprint | null;
  loading: boolean;
  error: string | null;
  diagnostics: BartonDiagnostic[];
}

export interface DiagramViewModule {
  diagram: DiagramView | null;
  selectedNode: DiagramNode | null;
  loading: boolean;
  error: string | null;
  diagnostics: BartonDiagnostic[];
}

export interface ModuleViewsModule {
  modules: ModuleViewData[];
  selectedModule: ModuleViewData | null;
  loading: boolean;
  error: string | null;
  diagnostics: BartonDiagnostic[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  diagnostics: BartonDiagnostic[];
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} 