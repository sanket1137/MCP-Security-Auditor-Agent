#!/usr/bin/env node

import { DiscoveryService } from './services/discovery';
import { SecurityAnalyzer } from './services/security-analyzer';
import { ReportGenerator } from './services/report-generator';
import { 
  MCPServer, 
  SecurityAnalysisResult, 
  DiscoveryConfig, 
  ReportConfig,
  CLIOptions 
} from './types';

/**
 * Main MCP Security Auditor Agent class
 * Orchestrates discovery, analysis, and reporting of MCP servers
 */
export class MCPSecurityAuditor {
  private discoveryService: DiscoveryService;
  private securityAnalyzer: SecurityAnalyzer;
  private reportGenerator: ReportGenerator;

  constructor() {
    this.discoveryService = new DiscoveryService();
    this.securityAnalyzer = new SecurityAnalyzer();
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Perform a complete audit of discoverable MCP servers
   * @param config - Discovery configuration
   * @param options - CLI options
   * @returns Promise<SecurityAnalysisResult[]>
   */
  async performAudit(
    config: DiscoveryConfig, 
    options: CLIOptions = {}
  ): Promise<SecurityAnalysisResult[]> {
    try {
      console.log('🔍 Starting MCP server discovery...');
      
      // Phase 1: Discover MCP servers
      const discoveryResults = await this.discoveryService.discoverServers(config);
      const allServers = discoveryResults.flatMap(result => result.servers);
      
      console.log(`✅ Discovered ${allServers.length} MCP servers`);
      
      if (allServers.length === 0) {
        console.log('ℹ️ No MCP servers found to analyze');
        return [];
      }

      // Phase 2: Security analysis
      console.log('🔒 Starting security analysis...');
      const analysisResults: SecurityAnalysisResult[] = [];
      
      const analysisPromises = allServers.map(async (server) => {
        try {
          console.log(`🔍 Analyzing ${server.name} (${server.endpoint})`);
          const result = await this.securityAnalyzer.analyzeServer(server);
          analysisResults.push(result);
          return result;
        } catch (error) {
          console.error(`❌ Failed to analyze ${server.name}: ${error}`);
          return null;
        }
      });

      await Promise.allSettled(analysisPromises);
      
      console.log(`✅ Completed security analysis for ${analysisResults.length} servers`);
      
      return analysisResults;
    } catch (error) {
      console.error('❌ Audit failed:', error);
      throw error;
    }
  }

  /**
   * Generate a report from analysis results
   * @param results - Security analysis results
   * @param config - Report configuration
   */
  async generateReport(
    results: SecurityAnalysisResult[], 
    config: ReportConfig
  ): Promise<string> {
    console.log(`📄 Generating ${config.format} report...`);
    
    const reportPath = await this.reportGenerator.generateReport(results, config);
    
    console.log(`✅ Report generated: ${reportPath}`);
    return reportPath;
  }

  /**
   * Get discovered servers without security analysis
   * @param config - Discovery configuration
   */
  async discoverServers(config: DiscoveryConfig): Promise<MCPServer[]> {
    const discoveryResults = await this.discoveryService.discoverServers(config);
    return discoveryResults.flatMap(result => result.servers);
  }

  /**
   * Analyze a single server
   * @param server - MCP server to analyze
   */
  async analyzeServer(server: MCPServer): Promise<SecurityAnalysisResult> {
    return await this.securityAnalyzer.analyzeServer(server);
  }
}

// Export for use as a library
export * from './types';
export { DiscoveryService } from './services/discovery';
export { SecurityAnalyzer } from './services/security-analyzer';
export { ReportGenerator } from './services/report-generator';

// Default export
export default MCPSecurityAuditor;