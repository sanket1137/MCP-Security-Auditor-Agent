#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { existsSync } from 'fs';
import { resolve, join } from 'path';
import MCPSecurityAuditor from '../index';
import {
  DiscoveryConfig,
  ReportConfig,
  CLIOptions,
  DiscoverySource,
  SecurityAnalysisResult
} from '../types';

const program = new Command();

/**
 * CLI Application for MCP Security Auditor
 */
class MCPSecurityAuditorCLI {
  private auditor: MCPSecurityAuditor;

  constructor() {
    this.auditor = new MCPSecurityAuditor();
  }

  /**
   * Initialize and run the CLI
   */
  async run(): Promise<void> {
    program
      .name('mcp-audit')
      .description('MCP Security Auditor - Discover and analyze MCP servers for security issues')
      .version('1.0.0');

    // Audit command
    program
      .command('audit')
      .description('Perform security audit of MCP servers')
      .option('-c, --config <path>', 'Configuration file path')
      .option('-o, --output <path>', 'Output file path', './mcp-audit-report.html')
      .option('-f, --format <format>', 'Report format (json|html|markdown)', 'html')
      .option('-v, --verbose', 'Verbose output', false)
      .option('-t, --timeout <ms>', 'Request timeout in milliseconds', '10000')
      .option('--exclude <patterns...>', 'Exclude patterns')
      .option('--include <patterns...>', 'Include patterns')
      .option('--parallel <count>', 'Maximum parallel requests', '5')
      .action(this.handleAuditCommand.bind(this));

    // Discover command
    program
      .command('discover')
      .description('Discover MCP servers without security analysis')
      .option('-c, --config <path>', 'Configuration file path')
      .option('-f, --format <format>', 'Output format (json|text)', 'text')
      .option('-v, --verbose', 'Verbose output', false)
      .option('-t, --timeout <ms>', 'Request timeout in milliseconds', '10000')
      .option('--exclude <patterns...>', 'Exclude patterns')
      .option('--include <patterns...>', 'Include patterns')
      .action(this.handleDiscoverCommand.bind(this));

    // Init command
    program
      .command('init')
      .description('Initialize configuration file')
      .option('-p, --path <path>', 'Configuration file path', './mcp-audit.config.json')
      .action(this.handleInitCommand.bind(this));

    // Server command (analyze single server)
    program
      .command('server <endpoint>')
      .description('Analyze a single MCP server')
      .option('-o, --output <path>', 'Output file path')
      .option('-f, --format <format>', 'Report format (json|html|markdown)', 'json')
      .option('-v, --verbose', 'Verbose output', false)
      .action(this.handleServerCommand.bind(this));

    await program.parseAsync();
  }

  /**
   * Handle audit command
   */
  private async handleAuditCommand(options: CLIOptions): Promise<void> {
    console.log(chalk.blue.bold('🔍 MCP Security Auditor'));
    console.log(chalk.gray('Discovering and analyzing MCP servers...\n'));

    try {
      // Load configuration
      const config = await this.loadConfiguration(options.config);
      const spinner = ora('Discovering MCP servers...').start();

      // Apply CLI options to config
      this.applyOptionsToConfig(config, options);

      // Perform audit
      const results = await this.auditor.performAudit(config, options);
      spinner.succeed(`Discovered and analyzed ${results.length} servers`);

      if (results.length === 0) {
        console.log(chalk.yellow('ℹ️ No MCP servers found to analyze'));
        return;
      }

      // Display summary
      this.displaySummary(results);

      // Generate report
      if (options.output) {
        const reportConfig: ReportConfig = {
          format: (options.format as any) || 'html',
          outputPath: options.output,
          includeDetails: true,
          includeRecommendations: true
        };

        const reportSpinner = ora('Generating report...').start();
        const reportPath = await this.auditor.generateReport(results, reportConfig);
        reportSpinner.succeed(`Report generated: ${reportPath}`);
      }

    } catch (error) {
      console.error(chalk.red('❌ Audit failed:'), error);
      process.exit(1);
    }
  }

  /**
   * Handle discover command
   */
  private async handleDiscoverCommand(options: CLIOptions): Promise<void> {
    const isJsonFormat = options.format === 'json';
    
    if (!isJsonFormat) {
      console.log(chalk.blue.bold('🔍 MCP Server Discovery'));
      console.log(chalk.gray('Discovering MCP servers...\n'));
    }

    try {
      const config = await this.loadConfiguration(options.config);
      this.applyOptionsToConfig(config, options);

      const spinner = !isJsonFormat ? ora('Discovering MCP servers...').start() : null;
      const servers = await this.auditor.discoverServers(config);
      
      if (spinner) {
        spinner.succeed(`Discovered ${servers.length} servers`);
      }

      if (isJsonFormat) {
        // Output JSON format for programmatic use
        console.log(JSON.stringify(servers, null, 2));
        return;
      }

      if (servers.length === 0) {
        console.log(chalk.yellow('ℹ️ No MCP servers found'));
        return;
      }

      // Display discovered servers in text format
      console.log(chalk.green.bold('\n📋 Discovered Servers:'));
      servers.forEach((server, index) => {
        console.log(`${index + 1}. ${chalk.cyan(server.name)} (${server.endpoint})`);
        if (server.description) {
          console.log(`   ${chalk.gray(server.description)}`);
        }
        console.log(`   Version: ${server.version}, Protocol: ${server.protocol}`);
        console.log('');
      });

    } catch (error) {
      if (isJsonFormat) {
        console.error(JSON.stringify({ error: String(error) }));
      } else {
        console.error(chalk.red('❌ Discovery failed:'), error);
      }
      process.exit(1);
    }
  }

  /**
   * Handle init command
   */
  private async handleInitCommand(options: { path?: string }): Promise<void> {
    const configPath = options.path || './mcp-audit.config.json';

    if (existsSync(configPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Configuration file ${configPath} already exists. Overwrite?`,
          default: false
        }
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('Configuration initialization cancelled.'));
        return;
      }
    }

    console.log(chalk.blue.bold('🚀 MCP Audit Configuration Setup'));

    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'sources',
        message: 'Select discovery sources:',
        choices: [
          { name: 'Local workspace scanning', value: 'local', checked: true },
          { name: 'VS Code extensions', value: 'vscode', checked: true },
          { name: 'Public MCP registry', value: 'registry', checked: false },
          { name: 'Custom API endpoint', value: 'api', checked: false }
        ]
      },
      {
        type: 'input',
        name: 'timeout',
        message: 'Request timeout (ms):',
        default: '10000',
        validate: (input) => !isNaN(parseInt(input)) || 'Please enter a valid number'
      },
      {
        type: 'input',
        name: 'maxConcurrent',
        message: 'Maximum concurrent requests:',
        default: '5',
        validate: (input) => !isNaN(parseInt(input)) || 'Please enter a valid number'
      }
    ]);

    // Build configuration
    const config: DiscoveryConfig = {
      sources: this.createSourcesFromAnswers(answers.sources),
      timeout: parseInt(answers.timeout),
      maxConcurrent: parseInt(answers.maxConcurrent),
      excludePatterns: []
    };

    // Write configuration file
    const fs = await import('fs/promises');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    console.log(chalk.green(`✅ Configuration saved to ${configPath}`));
    console.log(chalk.gray('You can now run: mcp-audit audit'));
  }

  /**
   * Handle server command (analyze single server)
   */
  private async handleServerCommand(endpoint: string, options: CLIOptions): Promise<void> {
    console.log(chalk.blue.bold('🔍 MCP Server Analysis'));
    console.log(chalk.gray(`Analyzing server: ${endpoint}\n`));

    try {
      // Create mock server object
      const server = {
        id: `manual-${Date.now()}`,
        name: 'Manual Server',
        version: '1.0.0',
        endpoint,
        protocol: this.extractProtocol(endpoint),
        owner: 'Unknown',
        lastSeen: new Date(),
        metadata: {}
      };

      const spinner = ora('Analyzing server...').start();
      const result = await this.auditor.analyzeServer(server as any);
      spinner.succeed('Analysis complete');

      // Display single server summary
      this.displaySingleServerSummary(result);

      // Generate report if requested
      if (options.output) {
        const reportConfig: ReportConfig = {
          format: (options.format as any) || 'json',
          outputPath: options.output,
          includeDetails: true,
          includeRecommendations: true
        };

        const reportSpinner = ora('Generating report...').start();
        const reportPath = await this.auditor.generateReport([result], reportConfig);
        reportSpinner.succeed(`Report generated: ${reportPath}`);
      }

    } catch (error) {
      console.error(chalk.red('❌ Analysis failed:'), error);
      process.exit(1);
    }
  }

  /**
   * Load configuration from file or create default
   */
  private async loadConfiguration(configPath?: string): Promise<DiscoveryConfig> {
    if (configPath && existsSync(configPath)) {
      const fs = await import('fs/promises');
      const configContent = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(configContent);
    }

    // Default configuration
    return {
      sources: [
        {
          type: 'local',
          config: {
            paths: ['.'],
            patterns: ['**/mcp.config.json', '**/mcp.yaml', '**/package.json']
          },
          enabled: true
        },
        {
          type: 'vscode',
          config: {},
          enabled: true
        }
      ],
      timeout: 10000,
      maxConcurrent: 5,
      excludePatterns: ['**/node_modules/**', '**/.*']
    };
  }

  /**
   * Apply CLI options to configuration
   */
  private applyOptionsToConfig(config: DiscoveryConfig, options: CLIOptions): void {
    if (options.timeout) {
      config.timeout = parseInt(options.timeout.toString());
    }
    if (options.parallel) {
      config.maxConcurrent = parseInt(options.parallel.toString());
    }
    if (options.exclude) {
      config.excludePatterns = [...(config.excludePatterns || []), ...options.exclude];
    }
  }

  /**
   * Create sources from user answers
   */
  private createSourcesFromAnswers(selectedSources: string[]): DiscoverySource[] {
    const sources: DiscoverySource[] = [];

    if (selectedSources.includes('local')) {
      sources.push({
        type: 'local',
        config: {
          paths: ['.'],
          patterns: ['**/mcp.config.json', '**/mcp.yaml', '**/package.json']
        },
        enabled: true
      });
    }

    if (selectedSources.includes('vscode')) {
      sources.push({
        type: 'vscode',
        config: {},
        enabled: true
      });
    }

    if (selectedSources.includes('registry')) {
      sources.push({
        type: 'registry',
        config: {
          url: 'https://registry.modelcontextprotocol.org/api/servers'
        },
        enabled: true
      });
    }

    if (selectedSources.includes('api')) {
      sources.push({
        type: 'api',
        config: {
          url: 'https://api.example.com/mcp/servers'
        },
        enabled: false // Disabled by default, user needs to configure
      });
    }

    return sources;
  }

  /**
   * Display audit summary
   */
  private displaySummary(results: SecurityAnalysisResult[]): void {
    console.log(chalk.green.bold('\n📊 Audit Summary:'));
    
    const summary = this.calculateSummary(results);
    
    console.log(`Total Servers: ${summary.total}`);
    console.log(`Security Score Distribution:`);
    console.log(`  A (Excellent): ${summary.scoreDistribution.A}`);
    console.log(`  B (Good): ${summary.scoreDistribution.B}`);
    console.log(`  C (Fair): ${summary.scoreDistribution.C}`);
    console.log(`  D (Poor): ${summary.scoreDistribution.D}`);
    console.log(`  F (Critical): ${summary.scoreDistribution.F}`);
    
    console.log(`\nIssues Found:`);
    console.log(`  Critical Vulnerabilities: ${chalk.red(summary.criticalVulns)}`);
    console.log(`  High Severity Issues: ${chalk.yellow(summary.highSeverity)}`);
    console.log(`  Total Recommendations: ${chalk.blue(summary.recommendations)}`);

    // Show top issues
    if (summary.topIssues.length > 0) {
      console.log(chalk.red.bold('\n⚠️ Top Issues:'));
      summary.topIssues.slice(0, 5).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.server}: ${issue.issue}`);
      });
    }
  }

  /**
   * Display single server summary
   */
  private displaySingleServerSummary(result: SecurityAnalysisResult): void {
    console.log(chalk.green.bold('\n📊 Analysis Summary:'));
    console.log(`Server: ${result.serverName}`);
    console.log(`Endpoint: ${result.endpoint}`);
    const scoreColor = this.getScoreColorFunction(result.overallScore);
    console.log(`Security Score: ${scoreColor(result.overallScore)}`);
    console.log(`Checks: ${result.checks.length}`);
    console.log(`Vulnerabilities: ${result.vulnerabilities.length}`);
    console.log(`Recommendations: ${result.recommendations.length}`);

    if (result.vulnerabilities.length > 0) {
      console.log(chalk.red.bold('\n⚠️ Vulnerabilities:'));
      result.vulnerabilities.forEach((vuln, index) => {
        console.log(`${index + 1}. ${vuln.title} (${vuln.severity.toUpperCase()})`);
        console.log(`   ${vuln.description}`);
      });
    }
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(results: SecurityAnalysisResult[]) {
    const summary = {
      total: results.length,
      scoreDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
      criticalVulns: 0,
      highSeverity: 0,
      recommendations: 0,
      topIssues: [] as Array<{ server: string; issue: string }>
    };

    results.forEach(result => {
      // Score distribution
      summary.scoreDistribution[result.overallScore as keyof typeof summary.scoreDistribution]++;

      // Count issues
      summary.criticalVulns += result.vulnerabilities.filter(v => v.severity === 'critical').length;
      summary.highSeverity += result.vulnerabilities.filter(v => v.severity === 'high').length;
      summary.recommendations += result.recommendations.length;

      // Collect top issues
      result.vulnerabilities.forEach(vuln => {
        if (vuln.severity === 'critical' || vuln.severity === 'high') {
          summary.topIssues.push({
            server: result.serverName,
            issue: vuln.title
          });
        }
      });
    });

    return summary;
  }

  /**
   * Get color for security score
   */
  private getScoreColor(score: string): string {
    switch (score) {
      case 'A': return chalk.green.bold('');
      case 'B': return chalk.blue.bold('');
      case 'C': return chalk.yellow.bold('');
      case 'D': return chalk.magenta.bold('');
      case 'F': return chalk.red.bold('');
      default: return chalk.gray.bold('');
    }
  }

  /**
   * Get color function for security score
   */
  private getScoreColorFunction(score: string) {
    switch (score) {
      case 'A': return chalk.green.bold;
      case 'B': return chalk.blue.bold;
      case 'C': return chalk.yellow.bold;
      case 'D': return chalk.magenta.bold;
      case 'F': return chalk.red.bold;
      default: return chalk.gray.bold;
    }
  }

  /**
   * Extract protocol from endpoint
   */
  private extractProtocol(endpoint: string): 'http' | 'https' | 'ws' | 'wss' {
    if (endpoint.startsWith('wss://')) return 'wss';
    if (endpoint.startsWith('ws://')) return 'ws';
    if (endpoint.startsWith('https://')) return 'https';
    return 'http';
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new MCPSecurityAuditorCLI();
  cli.run().catch(error => {
    console.error(chalk.red('❌ CLI Error:'), error);
    process.exit(1);
  });
}

export default MCPSecurityAuditorCLI;