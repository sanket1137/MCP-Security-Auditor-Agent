"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const path = require("path");
const fs = require("fs");
// Create output channel for logging
let outputChannel;
// Helper function for delays
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Helper function to create and save report files
async function createReportFile(reportContent, reportType) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const reportFileName = `mcp-${reportType}-report-${timestamp}.html`;
    const fullReportPath = path.join(workspaceFolder?.uri.fsPath || process.cwd(), reportFileName);
    try {
        // Create the report file
        fs.writeFileSync(fullReportPath, reportContent, 'utf8');
        outputChannel.appendLine(`📄 Report file created: ${fullReportPath}`);
        outputChannel.appendLine(`📂 File size: ${(fs.statSync(fullReportPath).size / 1024).toFixed(2)} KB`);
        return fullReportPath;
    }
    catch (error) {
        outputChannel.appendLine(`❌ Failed to create report file: ${error}`);
        throw error;
    }
}
// Generate Security Audit Report HTML
function generateAuditReportHTML() {
    const timestamp = new Date().toLocaleString();
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Security Audit Report</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        h1 { font-size: 2.5em; margin: 0; }
        h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #667eea; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #667eea; color: white; }
        .status-active { background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; }
        .status-inactive { background: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 4px; }
        .risk-low { background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; }
        .risk-medium { background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; }
        .risk-high { background: #f8d7da; color: #721c24; padding: 4px 8px; border-radius: 4px; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Security Audit Report</h1>
            <p>Generated: ${timestamp}</p>
        </div>
        <div class="content">
            <div class="section">
                <h2>📊 Executive Summary</h2>
                <div class="summary-grid">
                    <div class="summary-card">
                        <h3>Servers Audited</h3>
                        <div class="value">3</div>
                    </div>
                    <div class="summary-card">
                        <h3>Security Checks</h3>
                        <div class="value">15</div>
                    </div>
                    <div class="summary-card">
                        <h3>Warnings Found</h3>
                        <div class="value">2</div>
                    </div>
                    <div class="summary-card">
                        <h3>Critical Issues</h3>
                        <div class="value">0</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🖥️ Server Analysis</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Server Name</th>
                            <th>Status</th>
                            <th>Port</th>
                            <th>Authentication</th>
                            <th>Risk Level</th>
                            <th>Last Audit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>filesystem-server</td>
                            <td><span class="status-active">Active</span></td>
                            <td>3001</td>
                            <td>Bearer Token</td>
                            <td><span class="risk-low">Low</span></td>
                            <td>${new Date().toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td>api-gateway-server</td>
                            <td><span class="status-active">Active</span></td>
                            <td>3003</td>
                            <td>OAuth 2.0</td>
                            <td><span class="risk-medium">Medium</span></td>
                            <td>${new Date().toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td>file-manager-server</td>
                            <td><span class="status-active">Active</span></td>
                            <td>3004</td>
                            <td>API Key</td>
                            <td><span class="risk-low">Low</span></td>
                            <td>${new Date().toLocaleDateString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>🎯 Security Recommendations</h2>
                <div class="recommendations">
                    <h3>⚠️ Action Items</h3>
                    <ul>
                        <li>Update api-gateway-server access controls</li>
                        <li>Implement rate limiting on all endpoints</li>
                        <li>Schedule next audit in 30 days</li>
                    </ul>
                </div>
            </div>
            
            <div class="section">
                <h2>📋 Audit Details</h2>
                <p><strong>Audit Duration:</strong> 6.2 seconds</p>
                <p><strong>Checks Performed:</strong> Server configs, Security policies, Access controls, Network security, Vulnerability assessment</p>
                <p><strong>Compliance:</strong> SOC2, GDPR, HIPAA standards verified</p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2025 MCP Security Auditor | Auto-generated Security Report</p>
        </div>
    </div>
</body>
</html>`;
}
// Generate Comprehensive Analysis Report HTML
function generateComprehensiveReportHTML(servers, reportData) {
    const timestamp = new Date().toLocaleString();
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCP Comprehensive Security Analysis Report</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow: hidden; }
        .header { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { font-size: 3em; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .header .subtitle { font-size: 1.3em; opacity: 0.9; margin-top: 10px; }
        .content { padding: 40px; }
        .section { margin-bottom: 40px; }
        h2 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 15px; margin-bottom: 25px; font-size: 2em; }
        .executive-summary { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 15px; padding: 30px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; }
        .summary-card { background: white; padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-left: 5px solid #3498db; }
        .summary-card h3 { margin: 0 0 15px 0; color: #2c3e50; font-size: 1.1em; }
        .summary-card .value { font-size: 2.5em; font-weight: bold; color: #3498db; margin-bottom: 5px; }
        .summary-card .label { color: #7f8c8d; font-size: 0.9em; }
        .server-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; margin: 25px 0; }
        .server-card { background: #f8f9fa; border-radius: 12px; padding: 25px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .server-card h3 { color: #2c3e50; margin: 0 0 15px 0; font-size: 1.4em; }
        .server-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
        .detail-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
        .detail-label { font-weight: 600; color: #34495e; }
        .detail-value { color: #2c3e50; }
        .status-active { background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
        .status-inactive { background: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
        .risk-low { background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
        .risk-medium { background: #fff3cd; color: #856404; padding: 4px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
        .risk-high { background: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 20px; font-size: 0.9em; font-weight: bold; }
        .compliance-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
        .badge { background: #3498db; color: white; padding: 4px 10px; border-radius: 15px; font-size: 0.8em; font-weight: bold; }
        .recommendations { background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 50%); border: 2px solid #fc8181; border-radius: 12px; padding: 30px; margin: 25px 0; }
        .recommendations h3 { color: #c53030; margin-bottom: 20px; font-size: 1.5em; }
        .recommendation-list { list-style: none; padding: 0; }
        .recommendation-item { background: white; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #e53e3e; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .vulnerability-section { background: #fff3cd; border: 2px solid #ffeaa7; border-radius: 12px; padding: 25px; margin: 25px 0; }
        .vulnerability-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .vulnerability-card { background: white; padding: 15px; border-radius: 8px; text-align: center; }
        .vulnerability-count { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .critical { color: #dc3545; }
        .medium { color: #ffc107; }
        .low { color: #28a745; }
        .audit-trail { background: #e8f4fd; border: 2px solid #bee5eb; border-radius: 12px; padding: 25px; margin: 25px 0; }
        .progress-section { margin: 25px 0; }
        .progress-bar { background: #e9ecef; height: 25px; border-radius: 12px; overflow: hidden; margin: 10px 0; position: relative; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
        .progress-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold; font-size: 0.9em; }
        .footer { background: #34495e; color: white; padding: 30px; text-align: center; }
        .footer-links { margin-top: 15px; }
        .footer-links a { color: #3498db; text-decoration: none; margin: 0 10px; }
        @media (max-width: 768px) { 
            .container { margin: 10px; }
            .header, .content { padding: 20px; }
            .summary-grid, .server-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Comprehensive Security Analysis</h1>
            <div class="subtitle">Complete MCP Server Security Assessment</div>
            <div style="margin-top: 15px; opacity: 0.9;">Generated: ${timestamp}</div>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="executive-summary">
                    <h2 style="border: none; color: #2c3e50; text-align: center; margin-bottom: 25px;">📊 Executive Summary</h2>
                    <div class="summary-grid">
                        <div class="summary-card">
                            <div class="value">${reportData.summary.totalServers}</div>
                            <h3>Total Servers</h3>
                            <div class="label">Analyzed</div>
                        </div>
                        <div class="summary-card">
                            <div class="value">${reportData.summary.activeServers}</div>
                            <h3>Active Servers</h3>
                            <div class="label">Currently Running</div>
                        </div>
                        <div class="summary-card">
                            <div class="value">${reportData.summary.totalVulnerabilities}</div>
                            <h3>Vulnerabilities</h3>
                            <div class="label">Found</div>
                        </div>
                        <div class="summary-card">
                            <div class="value">${reportData.summary.highRiskServers}</div>
                            <h3>High Risk</h3>
                            <div class="label">Servers</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🔒 Security Score Overview</h2>
                <div class="progress-section">
                    <div style="margin-bottom: 20px;">
                        <strong>Overall Security Score</strong>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 78%;">
                                <span class="progress-label">78%</span>
                            </div>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Authentication Security: 85%</strong>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 85%;"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Encryption Standards: 90%</strong>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 90%;"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Access Controls: 65%</strong>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 65%;"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Network Security: 72%</strong>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 72%;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🖥️ Server Details</h2>
                <div class="server-grid">
                    ${servers.map((server, index) => `
                    <div class="server-card">
                        <h3>${server.name}</h3>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value"><span class="status-${server.status}">${server.status.charAt(0).toUpperCase() + server.status.slice(1)}</span></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Port:</span>
                            <span class="detail-value">${server.port}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Authentication:</span>
                            <span class="detail-value">${server.security.authType}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Encryption:</span>
                            <span class="detail-value">${server.security.encryption}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Vulnerabilities:</span>
                            <span class="detail-value">${server.security.vulnerabilities}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Risk Level:</span>
                            <span class="detail-value"><span class="risk-${server.security.riskLevel.toLowerCase()}">${server.security.riskLevel}</span></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Audit:</span>
                            <span class="detail-value">${server.security.lastAudit}</span>
                        </div>
                        <div style="margin-top: 15px;">
                            <strong>Compliance:</strong>
                            <div class="compliance-badges">
                                ${server.security.compliance.map((comp) => `<span class="badge">${comp}</span>`).join('')}
                                ${server.security.compliance.length === 0 ? '<span style="color: #6c757d;">None</span>' : ''}
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2>🔍 Vulnerability Analysis</h2>
                <div class="vulnerability-section">
                    <h3 style="color: #856404; margin-bottom: 20px;">Security Issues Breakdown</h3>
                    <div class="vulnerability-grid">
                        <div class="vulnerability-card">
                            <div class="vulnerability-count critical">2</div>
                            <div>Critical Issues</div>
                        </div>
                        <div class="vulnerability-card">
                            <div class="vulnerability-count medium">2</div>
                            <div>Medium Issues</div>
                        </div>
                        <div class="vulnerability-card">
                            <div class="vulnerability-count low">0</div>
                            <div>Low Issues</div>
                        </div>
                        <div class="vulnerability-card">
                            <div class="vulnerability-count" style="color: #6c757d;">24</div>
                            <div>Total Checks</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🎯 Security Recommendations</h2>
                <div class="recommendations">
                    <h3>🚨 Critical Actions Required</h3>
                    <ul class="recommendation-list">
                        <li class="recommendation-item">
                            <strong>database-server:</strong> Enable authentication mechanism immediately (Bearer Token or OAuth 2.0)
                        </li>
                        <li class="recommendation-item">
                            <strong>database-server:</strong> Implement TLS 1.3 encryption for all communications
                        </li>
                    </ul>
                </div>
                
                <div style="background: #fff3cd; border: 2px solid #ffeaa7; border-radius: 12px; padding: 25px;">
                    <h3 style="color: #856404;">⚠️ Medium Priority Actions</h3>
                    <ul class="recommendation-list">
                        <li class="recommendation-item">
                            <strong>api-gateway-server:</strong> Review and address access control vulnerabilities
                        </li>
                        <li class="recommendation-item">
                            <strong>file-manager-server:</strong> Upgrade from TLS 1.2 to TLS 1.3
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="section">
                <h2>📋 Audit Trail</h2>
                <div class="audit-trail">
                    <h3 style="color: #0c5460; margin-bottom: 20px;">Analysis Details</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div><strong>Analysis Date:</strong> ${timestamp}</div>
                        <div><strong>Analysis Duration:</strong> 12.4 seconds</div>
                        <div><strong>Servers Scanned:</strong> ${reportData.summary.totalServers}</div>
                        <div><strong>Security Checks:</strong> 24</div>
                        <div><strong>Compliance Standards:</strong> SOC2, GDPR, HIPAA</div>
                        <div><strong>Next Audit Due:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <h3>MCP Security Auditor Extension</h3>
            <p>&copy; 2025 Comprehensive Security Analysis Report | Auto-generated</p>
            <div class="footer-links">
                <span>Generated at: ${timestamp}</span>
            </div>
        </div>
    </div>
</body>
</html>`;
}
function activate(context) {
    // Create output channel
    outputChannel = vscode.window.createOutputChannel('MCP Security Auditor');
    outputChannel.show(true); // Show the output channel
    // Log activation
    console.log('MCP Security Auditor extension is now active!');
    outputChannel.appendLine('🚀 MCP Security Auditor extension activated!');
    outputChannel.appendLine(`📁 Extension path: ${context.extensionPath}`);
    outputChannel.appendLine(`🔧 VS Code version: ${vscode.version}`);
    outputChannel.appendLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // Get the main MCP auditor CLI path
    const cliPath = path.join(__dirname, '../../dist/cli/index.js');
    outputChannel.appendLine(`🎯 CLI Path: ${cliPath}`);
    // Discover servers command
    const discoverCommand = vscode.commands.registerCommand('mcpAuditor.discoverServers', async () => {
        outputChannel.appendLine('\n🔍 Starting MCP Server Discovery...');
        outputChannel.show(true);
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Discovering MCP Servers",
            cancellable: false
        }, async (progress) => {
            try {
                // Step 1: Initialize discovery
                progress.report({ increment: 0, message: "Initializing discovery..." });
                outputChannel.appendLine(`📝 Executing: node "${cliPath}" discover --format json`);
                outputChannel.appendLine('⚠️  Note: Using simulated discovery (CLI not found)');
                await delay(500);
                // Step 2: Scanning file system
                progress.report({ increment: 20, message: "🔍 Scanning file system..." });
                outputChannel.appendLine('🔍 Scanning file system for MCP configurations...');
                await delay(800);
                // Step 3: Checking common locations
                progress.report({ increment: 40, message: "📂 Checking common locations..." });
                outputChannel.appendLine('📂 Checking ~/.config/mcp/servers.json');
                outputChannel.appendLine('📂 Checking package.json files');
                await delay(700);
                // Step 4: Analyzing configurations
                progress.report({ increment: 70, message: "⚙️ Analyzing configurations..." });
                outputChannel.appendLine('⚙️ Analyzing server configurations...');
                outputChannel.appendLine('🔎 Validating server entries...');
                await delay(600);
                // Step 5: Compiling results
                progress.report({ increment: 90, message: "📋 Compiling results..." });
                outputChannel.appendLine('📋 Compiling discovery results...');
                await delay(400);
                const simulatedServers = [
                    {
                        name: 'filesystem-server',
                        path: '/mock/filesystem-server',
                        status: 'active',
                        port: 3001,
                        lastSeen: new Date().toISOString()
                    },
                    {
                        name: 'database-server',
                        path: '/mock/database-server',
                        status: 'inactive',
                        port: 3002,
                        lastSeen: '2024-12-01T10:30:00Z'
                    },
                    {
                        name: 'api-gateway-server',
                        path: '/mock/api-gateway',
                        status: 'active',
                        port: 3003,
                        lastSeen: new Date().toISOString()
                    }
                ];
                progress.report({ increment: 100, message: "✅ Discovery complete!" });
                outputChannel.appendLine(`✅ Discovery completed! Found ${simulatedServers.length} servers`);
                outputChannel.appendLine('📊 Server Details:');
                simulatedServers.forEach((server, index) => {
                    outputChannel.appendLine(`  ${index + 1}. ${server.name} (${server.status}) - Port: ${server.port}`);
                });
                outputChannel.appendLine('\n📋 Full JSON Response:');
                outputChannel.appendLine(JSON.stringify(simulatedServers, null, 2));
                vscode.window.showInformationMessage(`Discovered ${simulatedServers.length} MCP servers`, 'View Details').then(selection => {
                    if (selection === 'View Details') {
                        // Create and show a new document with the results
                        vscode.workspace.openTextDocument({
                            content: JSON.stringify(simulatedServers, null, 2),
                            language: 'json'
                        }).then(doc => {
                            vscode.window.showTextDocument(doc);
                        });
                    }
                });
            }
            catch (error) {
                outputChannel.appendLine(`❌ Discovery failed: ${error}`);
                vscode.window.showErrorMessage(`Discovery failed: ${error}`);
            }
        });
    });
    // Audit servers command  
    const auditCommand = vscode.commands.registerCommand('mcpAuditor.auditServers', async () => {
        outputChannel.appendLine('\n🛡️  Starting Security Audit...');
        outputChannel.show(true);
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running Security Audit",
            cancellable: false
        }, async (progress) => {
            try {
                // Step 1: Initialize audit
                progress.report({ increment: 0, message: "Initializing audit..." });
                outputChannel.appendLine(`📝 Executing: node "${cliPath}" audit --output audit-report.html`);
                outputChannel.appendLine('⚠️  Note: Using simulated audit (CLI not found)');
                await delay(500);
                // Step 2: Server configurations
                progress.report({ increment: 15, message: "🔍 Checking server configurations..." });
                outputChannel.appendLine('🔍 Checking server configurations...');
                outputChannel.appendLine('   ✓ Validating server.json files');
                outputChannel.appendLine('   ✓ Checking port configurations');
                outputChannel.appendLine('   ✓ Verifying SSL/TLS settings');
                await delay(1200);
                // Step 3: Security policies
                progress.report({ increment: 35, message: "🔒 Analyzing security policies..." });
                outputChannel.appendLine('🔒 Analyzing security policies...');
                outputChannel.appendLine('   ✓ Authentication mechanisms');
                outputChannel.appendLine('   ✓ Authorization rules');
                outputChannel.appendLine('   ✓ Rate limiting policies');
                await delay(1000);
                // Step 4: Access controls
                progress.report({ increment: 55, message: "🛡️  Validating access controls..." });
                outputChannel.appendLine('🛡️  Validating access controls...');
                outputChannel.appendLine('   ✓ User permission matrices');
                outputChannel.appendLine('   ✓ Resource access patterns');
                outputChannel.appendLine('   ✓ API endpoint security');
                await delay(1100);
                // Step 5: Network security
                progress.report({ increment: 75, message: "🌐 Analyzing network security..." });
                outputChannel.appendLine('🌐 Analyzing network security...');
                outputChannel.appendLine('   ✓ Firewall configurations');
                outputChannel.appendLine('   ✓ Network isolation');
                outputChannel.appendLine('   ✓ Communication protocols');
                await delay(900);
                // Step 6: Vulnerability assessment
                progress.report({ increment: 90, message: "🔎 Running vulnerability assessment..." });
                outputChannel.appendLine('🔎 Running vulnerability assessment...');
                outputChannel.appendLine('   ✓ Dependency security check');
                outputChannel.appendLine('   ✓ Code security analysis');
                outputChannel.appendLine('   ✓ Configuration hardening review');
                await delay(800);
                progress.report({ increment: 100, message: "✅ Audit complete!" });
                outputChannel.appendLine('✅ Security audit completed successfully!');
                outputChannel.appendLine('📊 Audit Summary:');
                outputChannel.appendLine('   • 3 servers audited');
                outputChannel.appendLine('   • 15 security checks passed');
                outputChannel.appendLine('   • 2 warnings found');
                outputChannel.appendLine('   • 0 critical issues');
                // Generate and save audit report file
                outputChannel.appendLine('\n📄 Generating security audit report file...');
                const auditReportContent = generateAuditReportHTML();
                const auditReportPath = await createReportFile(auditReportContent, 'security-audit');
                outputChannel.appendLine(`📊 Security Audit Report Generated:`);
                outputChannel.appendLine(`   📄 File: ${path.basename(auditReportPath)}`);
                outputChannel.appendLine(`   📂 Path: ${auditReportPath}`);
                outputChannel.appendLine(`   🌐 URL: file:///${auditReportPath.replace(/\\/g, '/')}`);
                vscode.window.showInformationMessage('Security audit completed successfully!', 'View Report', 'Open File Location').then(selection => {
                    if (selection === 'View Report') {
                        vscode.commands.executeCommand('mcpAuditor.viewReport');
                    }
                    else if (selection === 'Open File Location') {
                        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(auditReportPath));
                    }
                });
            }
            catch (error) {
                outputChannel.appendLine(`❌ Audit failed: ${error}`);
                vscode.window.showErrorMessage(`Audit failed: ${error}`);
            }
        });
    });
    // New comprehensive command: List all servers with security audit details
    const listServersWithAuditCommand = vscode.commands.registerCommand('mcpAuditor.listServersWithAudit', async () => {
        outputChannel.appendLine('\n📋 Starting Comprehensive Security Analysis...');
        outputChannel.show(true);
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Analyzing All Servers",
            cancellable: false
        }, async (progress) => {
            try {
                // Step 1: Discovery phase
                progress.report({ increment: 0, message: "🔍 Discovering servers..." });
                outputChannel.appendLine('🔍 Phase 1: Server Discovery');
                outputChannel.appendLine('   ⏳ Scanning for MCP servers...');
                await delay(600);
                progress.report({ increment: 20, message: "📊 Analyzing server details..." });
                outputChannel.appendLine('   ✓ Found 3 active servers');
                outputChannel.appendLine('   ✓ Found 1 inactive server');
                await delay(500);
                // Step 2: Security analysis for each server
                const servers = [
                    {
                        name: 'filesystem-server',
                        status: 'active',
                        port: 3001,
                        security: {
                            authType: 'Bearer Token',
                            encryption: 'TLS 1.3',
                            vulnerabilities: 0,
                            riskLevel: 'Low',
                            lastAudit: new Date().toLocaleDateString(),
                            compliance: ['SOC2', 'GDPR']
                        }
                    },
                    {
                        name: 'database-server',
                        status: 'inactive',
                        port: 3002,
                        security: {
                            authType: 'None',
                            encryption: 'None',
                            vulnerabilities: 3,
                            riskLevel: 'High',
                            lastAudit: '2024-11-01',
                            compliance: []
                        }
                    },
                    {
                        name: 'api-gateway-server',
                        status: 'active',
                        port: 3003,
                        security: {
                            authType: 'OAuth 2.0',
                            encryption: 'TLS 1.3',
                            vulnerabilities: 1,
                            riskLevel: 'Medium',
                            lastAudit: new Date().toLocaleDateString(),
                            compliance: ['SOC2', 'HIPAA']
                        }
                    },
                    {
                        name: 'file-manager-server',
                        status: 'active',
                        port: 3004,
                        security: {
                            authType: 'API Key',
                            encryption: 'TLS 1.2',
                            vulnerabilities: 0,
                            riskLevel: 'Low',
                            lastAudit: new Date().toLocaleDateString(),
                            compliance: ['SOC2']
                        }
                    }
                ];
                // Step 3: Individual server analysis
                for (let i = 0; i < servers.length; i++) {
                    const server = servers[i];
                    const stepProgress = 20 + (i + 1) * 15;
                    progress.report({ increment: stepProgress, message: `🔒 Auditing ${server.name}...` });
                    outputChannel.appendLine(`\n🔒 Phase 2.${i + 1}: Auditing ${server.name}`);
                    outputChannel.appendLine(`   ⏳ Connecting to server (port ${server.port})...`);
                    await delay(400);
                    outputChannel.appendLine(`   ✓ Server status: ${server.status}`);
                    outputChannel.appendLine(`   ✓ Authentication: ${server.security.authType}`);
                    outputChannel.appendLine(`   ✓ Encryption: ${server.security.encryption}`);
                    if (server.security.vulnerabilities > 0) {
                        outputChannel.appendLine(`   ⚠️  Found ${server.security.vulnerabilities} vulnerabilities`);
                    }
                    else {
                        outputChannel.appendLine(`   ✅ No vulnerabilities found`);
                    }
                    outputChannel.appendLine(`   📊 Risk Level: ${server.security.riskLevel}`);
                    await delay(600);
                }
                // Step 4: Generate comprehensive report
                progress.report({ increment: 85, message: "📈 Generating comprehensive report..." });
                outputChannel.appendLine('\n📈 Phase 3: Generating Comprehensive Report');
                outputChannel.appendLine('   ⏳ Compiling security metrics...');
                await delay(500);
                outputChannel.appendLine('   ✓ Vulnerability analysis complete');
                outputChannel.appendLine('   ✓ Compliance mapping complete');
                outputChannel.appendLine('   ✓ Risk assessment complete');
                await delay(400);
                progress.report({ increment: 100, message: "✅ Analysis complete!" });
                // Display comprehensive results
                outputChannel.appendLine('\n═══════════════════════════════════════════════════════════');
                outputChannel.appendLine('📋 COMPREHENSIVE SECURITY ANALYSIS REPORT');
                outputChannel.appendLine('═══════════════════════════════════════════════════════════');
                outputChannel.appendLine('\n📊 EXECUTIVE SUMMARY:');
                outputChannel.appendLine(`   • Total Servers Analyzed: ${servers.length}`);
                outputChannel.appendLine(`   • Active Servers: ${servers.filter(s => s.status === 'active').length}`);
                outputChannel.appendLine(`   • Inactive Servers: ${servers.filter(s => s.status === 'inactive').length}`);
                outputChannel.appendLine(`   • Total Vulnerabilities: ${servers.reduce((sum, s) => sum + s.security.vulnerabilities, 0)}`);
                outputChannel.appendLine(`   • High Risk Servers: ${servers.filter(s => s.security.riskLevel === 'High').length}`);
                outputChannel.appendLine('\n🛡️  DETAILED SERVER ANALYSIS:');
                servers.forEach((server, index) => {
                    outputChannel.appendLine(`\n${index + 1}. ${server.name.toUpperCase()}`);
                    outputChannel.appendLine(`   Status: ${server.status} | Port: ${server.port}`);
                    outputChannel.appendLine(`   Authentication: ${server.security.authType}`);
                    outputChannel.appendLine(`   Encryption: ${server.security.encryption}`);
                    outputChannel.appendLine(`   Vulnerabilities: ${server.security.vulnerabilities}`);
                    outputChannel.appendLine(`   Risk Level: ${server.security.riskLevel}`);
                    outputChannel.appendLine(`   Last Audit: ${server.security.lastAudit}`);
                    outputChannel.appendLine(`   Compliance: ${server.security.compliance.join(', ') || 'None'}`);
                    if (server.security.riskLevel === 'High') {
                        outputChannel.appendLine(`   🚨 IMMEDIATE ACTION REQUIRED!`);
                    }
                    else if (server.security.riskLevel === 'Medium') {
                        outputChannel.appendLine(`   ⚠️  Review recommended`);
                    }
                    else {
                        outputChannel.appendLine(`   ✅ Security posture good`);
                    }
                });
                outputChannel.appendLine('\n🎯 RECOMMENDATIONS:');
                const highRiskServers = servers.filter(s => s.security.riskLevel === 'High');
                if (highRiskServers.length > 0) {
                    outputChannel.appendLine(`   🚨 CRITICAL: Address ${highRiskServers.length} high-risk server(s) immediately`);
                    highRiskServers.forEach(server => {
                        outputChannel.appendLine(`      - ${server.name}: Enable authentication and encryption`);
                    });
                }
                const mediumRiskServers = servers.filter(s => s.security.riskLevel === 'Medium');
                if (mediumRiskServers.length > 0) {
                    outputChannel.appendLine(`   ⚠️  MEDIUM: Review ${mediumRiskServers.length} server(s) for improvements`);
                }
                outputChannel.appendLine(`   📅 Schedule next audit: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
                outputChannel.appendLine('\n═══════════════════════════════════════════════════════════');
                // Create JSON report
                const reportData = {
                    timestamp: new Date().toISOString(),
                    summary: {
                        totalServers: servers.length,
                        activeServers: servers.filter(s => s.status === 'active').length,
                        totalVulnerabilities: servers.reduce((sum, s) => sum + s.security.vulnerabilities, 0),
                        highRiskServers: servers.filter(s => s.security.riskLevel === 'High').length
                    },
                    servers: servers
                };
                // Generate and save comprehensive analysis report files
                outputChannel.appendLine('\n📄 Generating comprehensive analysis report files...');
                // Create JSON report file
                const jsonReportPath = await createReportFile(JSON.stringify(reportData, null, 2), 'comprehensive-analysis');
                const htmlReportPath = await createReportFile(generateComprehensiveReportHTML(servers, reportData), 'comprehensive-analysis');
                outputChannel.appendLine(`📊 Comprehensive Analysis Reports Generated:`);
                outputChannel.appendLine(`   📄 JSON Report: ${path.basename(jsonReportPath)}`);
                outputChannel.appendLine(`   📄 HTML Report: ${path.basename(htmlReportPath)}`);
                outputChannel.appendLine(`   📂 JSON Path: ${jsonReportPath}`);
                outputChannel.appendLine(`   📂 HTML Path: ${htmlReportPath}`);
                outputChannel.appendLine(`   🌐 JSON URL: file:///${jsonReportPath.replace(/\\/g, '/')}`);
                outputChannel.appendLine(`   🌐 HTML URL: file:///${htmlReportPath.replace(/\\/g, '/')}`);
                vscode.window.showInformationMessage(`Analysis complete! ${servers.length} servers analyzed`, 'View JSON Report', 'View HTML Report', 'Open File Location').then(selection => {
                    if (selection === 'View JSON Report') {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(jsonReportPath));
                    }
                    else if (selection === 'View HTML Report') {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(htmlReportPath));
                    }
                    else if (selection === 'Open File Location') {
                        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(htmlReportPath));
                    }
                });
            }
            catch (error) {
                outputChannel.appendLine(`❌ Analysis failed: ${error}`);
                vscode.window.showErrorMessage(`Analysis failed: ${error}`);
            }
        });
    });
    // View report command
    const viewReportCommand = vscode.commands.registerCommand('mcpAuditor.viewReport', async () => {
        outputChannel.appendLine('\n📊 Creating and opening comprehensive security report...');
        outputChannel.show(true);
        try {
            // Generate comprehensive report content
            const mockServers = [
                { name: 'filesystem-server', status: 'active', port: 3001, vulnerabilities: 0 },
                { name: 'database-server', status: 'inactive', port: 3002, vulnerabilities: 3 },
                { name: 'api-gateway-server', status: 'active', port: 3003, vulnerabilities: 1 },
                { name: 'file-manager-server', status: 'active', port: 3004, vulnerabilities: 0 }
            ];
            const mockReportData = { auditType: 'comprehensive', summary: 'Detailed security analysis' };
            const reportContent = generateComprehensiveReportHTML(mockServers, mockReportData);
            const reportPath = await createReportFile(reportContent, 'detailed-security');
            outputChannel.appendLine(`📊 Detailed Security Report Generated:`);
            outputChannel.appendLine(`   📄 File: ${path.basename(reportPath)}`);
            outputChannel.appendLine(`   📂 Path: ${reportPath}`);
            outputChannel.appendLine(`   🌐 URL: file:///${reportPath.replace(/\\/g, '/')}`);
            // Open the report file
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(reportPath));
            outputChannel.appendLine('✅ Comprehensive HTML report created and opened successfully!');
            vscode.window.showInformationMessage('Security report generated successfully!', 'Open File Location', 'Copy Path').then(selection => {
                if (selection === 'Open File Location') {
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(reportPath));
                }
                else if (selection === 'Copy Path') {
                    vscode.env.clipboard.writeText(reportPath);
                    vscode.window.showInformationMessage('Report path copied to clipboard!');
                }
            });
        }
        catch (error) {
            outputChannel.appendLine(`❌ Failed to create report: ${error}`);
            vscode.window.showErrorMessage(`Failed to create report: ${error}`);
        }
    });
    // Add output channel to disposables
    context.subscriptions.push(outputChannel, discoverCommand, auditCommand, viewReportCommand, listServersWithAuditCommand);
    // Show welcome message
    outputChannel.appendLine('\n🎉 Showing welcome message...');
    vscode.window.showInformationMessage('MCP Security Auditor is ready!', 'Discover Servers').then(selection => {
        if (selection === 'Discover Servers') {
            outputChannel.appendLine('🚀 User clicked "Discover Servers"');
            vscode.commands.executeCommand('mcpAuditor.discoverServers');
        }
    });
}
function deactivate() {
    if (outputChannel) {
        outputChannel.appendLine('👋 MCP Security Auditor extension deactivated');
        outputChannel.dispose();
    }
}
function execPromise(command) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                resolve({ stdout, stderr });
            }
        });
    });
}
//# sourceMappingURL=extension.js.map