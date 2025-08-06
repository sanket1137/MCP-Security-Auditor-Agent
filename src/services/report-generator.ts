import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import {
  SecurityAnalysisResult,
  ReportConfig,
  AuditReport,
  AuditSummary,
  ReportMetadata,
  SecurityScore,
  Severity,
  CheckStatus
} from '../types';

/**
 * Service responsible for generating security analysis reports
 */
export class ReportGenerator {
  /**
   * Generate a security analysis report
   * @param results - Security analysis results
   * @param config - Report configuration
   * @returns Promise<string> - Path to generated report
   */
  async generateReport(
    results: SecurityAnalysisResult[],
    config: ReportConfig
  ): Promise<string> {
    // Ensure output directory exists
    await this.ensureDirectoryExists(dirname(config.outputPath));

    // Create audit report data
    const auditReport = this.createAuditReport(results);

    // Generate report based on format
    switch (config.format) {
      case 'json':
        return await this.generateJSONReport(auditReport, config);
      case 'html':
        return await this.generateHTMLReport(auditReport, config);
      case 'markdown':
        return await this.generateMarkdownReport(auditReport, config);
      default:
        throw new Error(`Unsupported report format: ${config.format}`);
    }
  }

  /**
   * Create audit report structure from analysis results
   */
  private createAuditReport(results: SecurityAnalysisResult[]): AuditReport {
    const summary = this.createAuditSummary(results);
    
    return {
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      summary,
      servers: results,
      metadata: {
        version: '1.0.0',
        generatedBy: 'MCP Security Auditor',
        duration: 0, // TODO: Track actual duration
        config: {} as any // TODO: Include actual config
      }
    };
  }

  /**
   * Create audit summary from results
   */
  private createAuditSummary(results: SecurityAnalysisResult[]): AuditSummary {
    const totalServers = results.length;
    const serversAnalyzed = results.filter(r => r.checks.length > 0).length;
    
    // Count vulnerabilities by severity
    const criticalVulnerabilities = results.reduce((count, result) => 
      count + result.vulnerabilities.filter(v => v.severity === Severity.CRITICAL).length, 0
    );
    
    const highSeverityIssues = results.reduce((count, result) => {
      const highVulns = result.vulnerabilities.filter(v => v.severity === Severity.HIGH).length;
      const highFailedChecks = result.checks.filter(c => 
        c.severity === Severity.HIGH && c.status === CheckStatus.FAIL
      ).length;
      return count + highVulns + highFailedChecks;
    }, 0);

    const recommendations = results.reduce((count, result) => 
      count + result.recommendations.length, 0
    );

    // Calculate overall security score
    const scores = results.map(r => r.overallScore);
    const overallSecurityScore = this.calculateOverallScore(scores);

    return {
      totalServers,
      serversAnalyzed,
      overallSecurityScore,
      criticalVulnerabilities,
      highSeverityIssues,
      recommendations
    };
  }

  /**
   * Generate JSON report
   */
  private async generateJSONReport(
    auditReport: AuditReport,
    config: ReportConfig
  ): Promise<string> {
    const jsonData = JSON.stringify(auditReport, null, 2);
    await fs.writeFile(config.outputPath, jsonData, 'utf-8');
    return config.outputPath;
  }

  /**
   * Generate HTML report
   */
  private async generateHTMLReport(
    auditReport: AuditReport,
    config: ReportConfig
  ): Promise<string> {
    const html = this.generateHTMLContent(auditReport, config);
    await fs.writeFile(config.outputPath, html, 'utf-8');
    return config.outputPath;
  }

  /**
   * Generate Markdown report
   */
  private async generateMarkdownReport(
    auditReport: AuditReport,
    config: ReportConfig
  ): Promise<string> {
    const markdown = this.generateMarkdownContent(auditReport, config);
    await fs.writeFile(config.outputPath, markdown, 'utf-8');
    return config.outputPath;
  }

  /**
   * Generate HTML content
   */
  private generateHTMLContent(auditReport: AuditReport, config: ReportConfig): string {
    const { summary, servers, timestamp } = auditReport;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Security Audit Report</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header { 
            border-bottom: 2px solid #007acc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .summary { 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007acc;
        }
        .summary-card h3 { margin-top: 0; color: #007acc; }
        .summary-card .value { font-size: 2em; font-weight: bold; }
        .security-score {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            color: white;
        }
        .score-A { background-color: #28a745; }
        .score-B { background-color: #17a2b8; }
        .score-C { background-color: #ffc107; color: #212529; }
        .score-D { background-color: #fd7e14; }
        .score-F { background-color: #dc3545; }
        .server-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .server-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .server-header h3 { margin: 0; }
        .checks-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .check-item {
            padding: 10px;
            border-radius: 6px;
            border-left: 4px solid;
        }
        .check-pass { border-left-color: #28a745; background-color: #d4edda; }
        .check-warning { border-left-color: #ffc107; background-color: #fff3cd; }
        .check-fail { border-left-color: #dc3545; background-color: #f8d7da; }
        .check-error { border-left-color: #6c757d; background-color: #e2e3e5; }
        .vulnerability {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
        }
        .vulnerability-critical { border-left: 4px solid #dc3545; }
        .vulnerability-high { border-left: 4px solid #fd7e14; }
        .vulnerability-medium { border-left: 4px solid #ffc107; }
        .vulnerability-low { border-left: 4px solid #17a2b8; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
        .collapsible {
            background-color: #f1f1f1;
            color: #444;
            cursor: pointer;
            padding: 15px;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            font-size: 16px;
            margin-top: 10px;
        }
        .collapsible:hover { background-color: #ddd; }
        .content {
            padding: 0 18px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.2s ease-out;
            background-color: #f9f9f9;
        }
        .content.active { padding: 18px; max-height: 1000px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 MCP Security Audit Report</h1>
        <p class="timestamp">Generated on ${timestamp.toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Servers</h3>
            <div class="value">${summary.totalServers}</div>
        </div>
        <div class="summary-card">
            <h3>Servers Analyzed</h3>
            <div class="value">${summary.serversAnalyzed}</div>
        </div>
        <div class="summary-card">
            <h3>Overall Security Score</h3>
            <div class="value">
                <span class="security-score score-${summary.overallSecurityScore}">
                    ${summary.overallSecurityScore}
                </span>
            </div>
        </div>
        <div class="summary-card">
            <h3>Critical Vulnerabilities</h3>
            <div class="value" style="color: #dc3545;">${summary.criticalVulnerabilities}</div>
        </div>
        <div class="summary-card">
            <h3>High Severity Issues</h3>
            <div class="value" style="color: #fd7e14;">${summary.highSeverityIssues}</div>
        </div>
        <div class="summary-card">
            <h3>Recommendations</h3>
            <div class="value" style="color: #17a2b8;">${summary.recommendations}</div>
        </div>
    </div>

    <h2>Server Analysis Results</h2>
    ${servers.map(server => this.generateServerHTML(server, config)).join('')}

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const collapsibles = document.querySelectorAll('.collapsible');
            collapsibles.forEach(function(collapsible) {
                collapsible.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const content = this.nextElementSibling;
                    content.classList.toggle('active');
                });
            });
        });
    </script>
</body>
</html>`;
  }

  /**
   * Generate HTML for a single server
   */
  private generateServerHTML(server: SecurityAnalysisResult, config: ReportConfig): string {
    const vulnerabilitiesHTML = server.vulnerabilities.length > 0 ? 
      `<button class="collapsible">Vulnerabilities (${server.vulnerabilities.length})</button>
       <div class="content">
         ${server.vulnerabilities.map(vuln => `
           <div class="vulnerability vulnerability-${vuln.severity}">
             <h4>${vuln.title}</h4>
             <p>${vuln.description}</p>
             <p><strong>Severity:</strong> ${vuln.severity.toUpperCase()}</p>
             <p><strong>Category:</strong> ${vuln.category}</p>
             <p><strong>Affected:</strong> ${vuln.affected}</p>
             ${vuln.remediation ? `<p><strong>Remediation:</strong> ${vuln.remediation}</p>` : ''}
           </div>
         `).join('')}
       </div>` : '';

    const recommendationsHTML = config.includeRecommendations && server.recommendations.length > 0 ? 
      `<button class="collapsible">Recommendations (${server.recommendations.length})</button>
       <div class="content">
         ${server.recommendations.map(rec => `
           <div style="margin: 10px 0; padding: 10px; background: #e7f3ff; border-radius: 6px;">
             <h4>${rec.title}</h4>
             <p>${rec.description}</p>
             <p><strong>Severity:</strong> ${rec.severity.toUpperCase()}</p>
             <p><strong>Action Required:</strong> ${rec.actionRequired ? 'Yes' : 'No'}</p>
           </div>
         `).join('')}
       </div>` : '';

    return `
    <div class="server-card">
        <div class="server-header">
            <h3>${server.serverName}</h3>
            <span class="security-score score-${server.overallScore}">${server.overallScore}</span>
        </div>
        <p><strong>Endpoint:</strong> ${server.endpoint}</p>
        <p><strong>Analyzed:</strong> ${server.timestamp.toLocaleString()}</p>
        
        <button class="collapsible">Security Checks (${server.checks.length})</button>
        <div class="content">
            <div class="checks-grid">
                ${server.checks.map(check => `
                    <div class="check-item check-${check.status}">
                        <strong>${check.name}</strong><br>
                        ${check.description}
                        ${check.details ? `<br><small>${check.details}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        ${vulnerabilitiesHTML}
        ${recommendationsHTML}
    </div>`;
  }

  /**
   * Generate Markdown content
   */
  private generateMarkdownContent(auditReport: AuditReport, config: ReportConfig): string {
    const { summary, servers, timestamp } = auditReport;

    let markdown = `# 🔒 MCP Security Audit Report

**Generated:** ${timestamp.toLocaleString()}

## Summary

| Metric | Value |
|--------|-------|
| Total Servers | ${summary.totalServers} |
| Servers Analyzed | ${summary.serversAnalyzed} |
| Overall Security Score | **${summary.overallSecurityScore}** |
| Critical Vulnerabilities | ${summary.criticalVulnerabilities} |
| High Severity Issues | ${summary.highSeverityIssues} |
| Recommendations | ${summary.recommendations} |

## Server Analysis Results

`;

    servers.forEach(server => {
      markdown += `### ${server.serverName} (Score: ${server.overallScore})

**Endpoint:** ${server.endpoint}  
**Analyzed:** ${server.timestamp.toLocaleString()}

#### Security Checks

| Check | Status | Severity | Description |
|-------|--------|----------|-------------|
${server.checks.map(check => 
  `| ${check.name} | ${this.getStatusEmoji(check.status)} ${check.status} | ${check.severity} | ${check.description} |`
).join('\n')}

`;

      if (server.vulnerabilities.length > 0) {
        markdown += `#### Vulnerabilities

${server.vulnerabilities.map(vuln => `
**${vuln.title}** (${vuln.severity.toUpperCase()})
- **Description:** ${vuln.description}
- **Category:** ${vuln.category}
- **Affected:** ${vuln.affected}
${vuln.remediation ? `- **Remediation:** ${vuln.remediation}` : ''}
`).join('\n')}

`;
      }

      if (config.includeRecommendations && server.recommendations.length > 0) {
        markdown += `#### Recommendations

${server.recommendations.map(rec => `
- **${rec.title}** (${rec.severity.toUpperCase()})
  - ${rec.description}
  - Action Required: ${rec.actionRequired ? 'Yes' : 'No'}
`).join('\n')}

`;
      }

      markdown += '---\n\n';
    });

    return markdown;
  }

  /**
   * Get status emoji for markdown
   */
  private getStatusEmoji(status: CheckStatus): string {
    switch (status) {
      case CheckStatus.PASS: return '✅';
      case CheckStatus.WARNING: return '⚠️';
      case CheckStatus.FAIL: return '❌';
      case CheckStatus.ERROR: return '🔧';
      case CheckStatus.SKIP: return '⏭️';
      default: return '❓';
    }
  }

  /**
   * Calculate overall security score from individual scores
   */
  private calculateOverallScore(scores: SecurityScore[]): SecurityScore {
    if (scores.length === 0) return SecurityScore.FAIR;

    const scoreValues = {
      [SecurityScore.EXCELLENT]: 5,
      [SecurityScore.GOOD]: 4,
      [SecurityScore.FAIR]: 3,
      [SecurityScore.POOR]: 2,
      [SecurityScore.CRITICAL]: 1
    };

    const average = scores.reduce((sum, score) => sum + scoreValues[score], 0) / scores.length;

    if (average >= 4.5) return SecurityScore.EXCELLENT;
    if (average >= 3.5) return SecurityScore.GOOD;
    if (average >= 2.5) return SecurityScore.FAIR;
    if (average >= 1.5) return SecurityScore.POOR;
    return SecurityScore.CRITICAL;
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Ignore error if directory already exists
      if ((error as any)?.code !== 'EEXIST') {
        throw error;
      }
    }
  }
}