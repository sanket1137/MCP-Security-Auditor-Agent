// Core MCP types
export interface MCPServer {
  id: string;
  name: string;
  version: string;
  description?: string;
  endpoint: string;
  protocol: 'http' | 'https' | 'ws' | 'wss';
  owner?: string;
  lastSeen: Date;
  metadata?: MCPServerMetadata;
}

export interface MCPServerMetadata {
  capabilities?: string[];
  authentication?: AuthenticationMethod;
  rateLimit?: RateLimit;
  documentation?: string;
  repository?: string;
  license?: string;
  tags?: string[];
}

export interface AuthenticationMethod {
  type: 'none' | 'api-key' | 'bearer' | 'oauth2' | 'custom';
  details?: Record<string, any>;
}

export interface RateLimit {
  requests: number;
  window: string; // e.g., "1m", "1h", "1d"
}

// Security analysis types
export interface SecurityAnalysisResult {
  serverId: string;
  serverName: string;
  endpoint: string;
  timestamp: Date;
  overallScore: SecurityScore;
  checks: SecurityCheck[];
  recommendations: SecurityRecommendation[];
  vulnerabilities: Vulnerability[];
}

export interface SecurityCheck {
  id: string;
  name: string;
  category: SecurityCategory;
  status: CheckStatus;
  severity: Severity;
  description: string;
  details?: string;
  evidence?: any;
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: SecurityCategory;
  actionRequired: boolean;
  resources?: string[];
}

export interface Vulnerability {
  id: string;
  cve?: string;
  title: string;
  description: string;
  severity: Severity;
  category: SecurityCategory;
  affected: string;
  remediation?: string;
  references?: string[];
}

// Enums
export enum SecurityScore {
  EXCELLENT = 'A',
  GOOD = 'B',
  FAIR = 'C',
  POOR = 'D',
  CRITICAL = 'F'
}

export enum CheckStatus {
  PASS = 'pass',
  FAIL = 'fail',
  WARNING = 'warning',
  SKIP = 'skip',
  ERROR = 'error'
}

export enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export enum SecurityCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  ENCRYPTION = 'encryption',
  NETWORK = 'network',
  CONFIGURATION = 'configuration',
  COMPLIANCE = 'compliance',
  AVAILABILITY = 'availability',
  DATA_PROTECTION = 'data-protection'
}

// Discovery types
export interface DiscoveryConfig {
  sources: DiscoverySource[];
  timeout: number;
  maxConcurrent: number;
  excludePatterns?: string[];
}

export interface DiscoverySource {
  type: 'local' | 'registry' | 'api' | 'vscode';
  config: Record<string, any>;
  enabled: boolean;
}

export interface DiscoveryResult {
  source: string;
  servers: MCPServer[];
  errors: string[];
  duration: number;
}

// Report types
export interface ReportConfig {
  format: 'json' | 'html' | 'markdown' | 'pdf';
  outputPath: string;
  includeDetails: boolean;
  includeRecommendations: boolean;
  template?: string;
}

export interface AuditReport {
  id: string;
  timestamp: Date;
  summary: AuditSummary;
  servers: SecurityAnalysisResult[];
  metadata: ReportMetadata;
}

export interface AuditSummary {
  totalServers: number;
  serversAnalyzed: number;
  overallSecurityScore: SecurityScore;
  criticalVulnerabilities: number;
  highSeverityIssues: number;
  recommendations: number;
}

export interface ReportMetadata {
  version: string;
  generatedBy: string;
  duration: number;
  config: DiscoveryConfig;
}

// CLI types
export interface CLIOptions {
  config?: string;
  output?: string;
  format?: string;
  verbose?: boolean;
  timeout?: number;
  exclude?: string[];
  include?: string[];
  parallel?: number;
}

// Error types
export class MCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export class SecurityAnalysisError extends MCPError {
  constructor(message: string, details?: any) {
    super(message, 'SECURITY_ANALYSIS_ERROR', details);
    this.name = 'SecurityAnalysisError';
  }
}

export class DiscoveryError extends MCPError {
  constructor(message: string, details?: any) {
    super(message, 'DISCOVERY_ERROR', details);
    this.name = 'DiscoveryError';
  }
}