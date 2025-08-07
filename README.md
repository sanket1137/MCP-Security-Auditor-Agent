# MCP Security Auditor - Complete Platform

A comprehensive security analysis platform for Model Context Protocol (MCP) servers, featuring both **command-line tools** and **VS Code extension** interfaces. This intelligent agent discovers, analyzes, and reports on the security posture of MCP infrastructure with professional-grade vulnerability detection and compliance reporting.

## 🎯 **Project Overview**

This platform provides **dual interfaces** for MCP security analysis:
- **🖥️ CLI Tool**: Command-line interface for automation and CI/CD integration
- **🔌 VS Code Extension**: Visual interface for interactive development and analysis

## 🏗️ **Architecture**

```
MCP Security Auditor Platform
├── 🎯 Core Engine (src/)
│   ├── Discovery Service     # Multi-source server detection
│   ├── Security Analyzer     # 8+ security checks with A-F scoring
│   └── Report Generator      # HTML/JSON/Markdown reports
├── 🖥️ CLI Interface (src/cli/)
│   ├── audit                 # Full security audit
│   ├── discover             # Server discovery only
│   ├── server               # Single server analysis
│   └── init                 # Configuration setup
└── 🔌 VS Code Extension (extension/)
    ├── Command Integration   # VS Code command palette
    ├── Output Panels        # Real-time logs and progress
    └── Report Viewing       # In-editor report display
```

## ✨ **Features**

### 🔍 **Multi-Source Server Discovery**
- **Local Workspace**: Scans for `mcp.config.json`, `mcp.yaml`, `package.json`
- **VS Code Extensions**: Integrates with VS Code MCP server registry
- **Public Registry**: Queries official MCP server registries
- **Custom APIs**: Supports custom endpoint discovery

### 🛡️ **Comprehensive Security Analysis**
- **SSL/TLS Analysis**: Certificate validation, protocol versions, cipher suites
- **Authentication Security**: Mechanism detection, unauthorized access testing
- **Network Security**: CORS configuration, security headers, rate limiting
- **API Security**: Endpoint enumeration, input validation, error handling
- **Configuration Security**: Information disclosure, default configurations

### 📊 **Professional Reporting**
- **HTML Reports**: Interactive dashboards with charts and collapsible sections
- **JSON Reports**: Machine-readable format for CI/CD and automation
- **Markdown Reports**: Human-readable documentation format
- **Security Scoring**: A-F letter grades with detailed vulnerability prioritization

### 🛠️ **Multiple Interfaces**
- **CLI Tool**: Full automation support with 4 main commands
- **VS Code Extension**: Interactive GUI with real-time feedback
- **Programmatic API**: TypeScript/JavaScript integration

## 🚀 **Quick Start**

### **Option 1: CLI Tool**

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Initialize configuration
node dist/cli/index.js init

# Discover MCP servers
node dist/cli/index.js discover --format json

# Run complete security audit
node dist/cli/index.js audit --output security-report.html

# Analyze specific server
node dist/cli/index.js server https://api.example.com/mcp
```

### **Option 2: VS Code Extension**

```bash
# Navigate to extension folder
cd extension/

# Install extension dependencies
npm install

# Compile extension
npm run compile

# Launch Extension Development Host
# Press F5 in VS Code, then use Command Palette (Ctrl+Shift+P):
# - "MCP Auditor: Discover MCP Servers"
# - "MCP Auditor: Run Security Audit"
# - "MCP Auditor: View Security Report"
```

## 📋 **Detailed CLI Commands**

### **`mcp-audit audit`** - Complete Security Audit
Performs comprehensive security analysis of all discovered MCP servers.

```bash
node dist/cli/index.js audit [options]

Options:
  -c, --config <path>       Configuration file path
  -o, --output <path>       Output file path (default: ./mcp-audit-report.html)
  -f, --format <format>     Report format: json|html|markdown (default: html)
  -v, --verbose             Verbose output with detailed logs
  -t, --timeout <ms>        Request timeout in milliseconds (default: 10000)
  --exclude <patterns...>   Exclude server patterns
  --include <patterns...>   Include only specified patterns
  --parallel <count>        Maximum parallel requests (default: 5)
```

**Example Output:**
```
🔍 MCP Security Auditor
Discovering and analyzing MCP servers...

✔ Discovered and analyzed 34 servers

📊 Audit Summary:
Total Servers: 34
Security Score Distribution:
  A (Excellent): 12
  B (Good): 8
  C (Fair): 10
  D (Poor): 3
  F (Critical): 1

Issues Found:
  Critical Vulnerabilities: 2
  High Severity Issues: 7
  Total Recommendations: 45
```

### **`mcp-audit discover`** - Server Discovery Only
Discovers MCP servers without performing security analysis.

```bash
node dist/cli/index.js discover [options]

Options:
  -c, --config <path>       Configuration file path
  -f, --format <format>     Output format: json|text (default: text)
  -v, --verbose             Verbose output
  -t, --timeout <ms>        Request timeout in milliseconds
  --exclude <patterns...>   Exclude patterns
  --include <patterns...>   Include patterns
```

**JSON Output Example:**
```json
[
  {
    "id": "local-dev-server",
    "name": "Local Development MCP Server",
    "version": "1.0.0",
    "endpoint": "ws://localhost:8080/mcp",
    "protocol": "ws",
    "description": "Local MCP server for development",
    "metadata": {
      "capabilities": ["file-system", "database"],
      "authentication": { "type": "none" }
    }
  }
]
```

### **`mcp-audit server <endpoint>`** - Single Server Analysis
Analyzes a specific MCP server endpoint.

```bash
node dist/cli/index.js server https://api.example.com/mcp [options]

Options:
  -o, --output <path>       Output file path
  -f, --format <format>     Report format: json|html|markdown (default: json)
  -v, --verbose             Verbose output
```

### **`mcp-audit init`** - Interactive Configuration Setup
Creates a configuration file with guided prompts.

```bash
node dist/cli/index.js init [options]

Options:
  -p, --path <path>         Configuration file path (default: ./mcp-audit.config.json)
```

## 🔌 **VS Code Extension Usage**

### **Installation & Launch**
1. Open the extension folder in VS Code
2. Press `F5` to launch Extension Development Host
3. In the new window, access commands via Command Palette (`Ctrl+Shift+P`)

### **Available Commands**

#### **🔍 MCP Auditor: Discover MCP Servers**
- Scans multiple sources for MCP servers
- Displays results in JSON format within VS Code
- Shows progress notifications and detailed output logs
- Opens interactive document with server details

#### **🛡️ MCP Auditor: Run Security Audit**
- Performs comprehensive security analysis
- Generates interactive HTML security reports
- Provides real-time progress updates in Output panel
- Shows summary with security scores and issue counts

#### **📊 MCP Auditor: View Security Report**
- Opens generated security reports in VS Code
- Displays interactive HTML with charts and detailed findings
- Includes actionable security recommendations
- Supports multiple report formats

### **Extension UI Locations**

#### **Output Panel** (Primary Interface)
- Go to `View > Output`
- Select "**MCP Security Auditor**" from dropdown
- Real-time logs: `🚀 MCP Security Auditor extension activated!`
- Progress tracking and detailed operation logs

#### **Command Palette Integration**
- Press `Ctrl+Shift+P`
- Type "**MCP Auditor**" to see all commands
- Category: "MCP Auditor" for easy filtering

#### **Explorer Panel** (Future Enhancement)
- Tree view of discovered servers
- Security status indicators
- Expandable vulnerability details

## ⚙️ **Configuration**

### **Configuration File Structure**
```json
{
  "sources": [
    {
      "type": "local",
      "config": {
        "paths": ["."],
        "patterns": ["**/mcp.config.json", "**/mcp.yaml", "**/package.json"]
      },
      "enabled": true
    },
    {
      "type": "vscode",
      "config": {},
      "enabled": true
    },
    {
      "type": "registry",
      "config": {
        "url": "https://registry.modelcontextprotocol.org/api/servers"
      },
      "enabled": false
    },
    {
      "type": "api",
      "config": {
        "url": "https://api.example.com/mcp/servers"
      },
      "enabled": false
    }
  ],
  "timeout": 10000,
  "maxConcurrent": 5,
  "excludePatterns": ["**/node_modules/**", "**/.*"]
}
```

### **Discovery Sources**

#### **Local File System**
- Scans specified paths for MCP configuration files
- Supports glob patterns for flexible file matching
- Excludes common build/cache directories

#### **VS Code Integration**
- Reads VS Code settings for MCP server configurations
- Integrates with VS Code MCP extension registry
- Automatic detection of development servers

#### **Public Registry**
- Queries official MCP server registries
- Discovers publicly available MCP servers
- Configurable registry endpoints

#### **Custom API Endpoints**
- Supports custom server discovery APIs
- Flexible endpoint configuration
- Custom authentication support

## 🔒 **Security Analysis Details**

### **SSL/TLS Security**
- **Certificate Validation**: Expiration, validity, chain verification
- **Protocol Analysis**: TLS 1.2+ support, deprecated protocol detection
- **Cipher Suite Assessment**: Strong encryption requirements
- **Certificate Authority Validation**: Trusted CA verification

### **Authentication & Authorization**
- **Mechanism Detection**: API keys, OAuth2, Bearer tokens, custom auth
- **Unauthorized Access Testing**: Anonymous access attempts
- **Token Security**: JWT validation, token expiration checks
- **Permission Analysis**: Role-based access control assessment

### **Network Security**
- **CORS Configuration**: Cross-origin policy analysis
- **Security Headers**: HSTS, CSP, X-Frame-Options verification
- **Rate Limiting**: Abuse prevention mechanism detection
- **Information Disclosure**: Server fingerprinting prevention

### **API Security**
- **Endpoint Discovery**: Available endpoint enumeration
- **Input Validation**: Parameter injection testing
- **Error Handling**: Information leakage in error responses
- **Versioning Security**: API version deprecation analysis

## 📊 **Security Scoring System**

### **Letter Grade Scale**
- **A (90-100%)**: Excellent security posture, minimal issues
- **B (80-89%)**: Good security with minor improvements needed
- **C (60-79%)**: Adequate security, moderate improvements required
- **D (40-59%)**: Poor security, significant issues present
- **F (0-39%)**: Critical security issues, immediate attention required

### **Scoring Factors**
1. **SSL/TLS Configuration** (25% weight)
2. **Authentication Security** (20% weight)
3. **Network Security** (20% weight)
4. **API Security** (15% weight)
5. **Configuration Security** (10% weight)
6. **Compliance Adherence** (10% weight)

## 📈 **Use Cases & Examples**

### **Use Case 1: Development Environment Audit**
```bash
# Scenario: Security audit of local development MCP servers
cd /project/directory

# Initialize configuration for local development
node dist/cli/index.js init
# Select: Local workspace scanning, VS Code extensions

# Discover all local MCP servers
node dist/cli/index.js discover --format json

# Run security audit with detailed HTML report
node dist/cli/index.js audit --output dev-security-report.html --verbose

# Result: Comprehensive security analysis of 12 local MCP servers
# - 8 servers with A/B grades (development-appropriate security)
# - 3 servers with C grade (missing HTTPS in local development)
# - 1 server with D grade (no authentication configured)
```

### **Use Case 2: Production Environment Security Assessment**
```bash
# Scenario: Security assessment of production MCP infrastructure
# Configure for production registry and API discovery
node dist/cli/index.js init
# Select: Public registry, Custom API endpoint

# Discover production servers
node dist/cli/index.js discover --include "*production*" --format json

# Run comprehensive audit with JSON output for CI/CD
node dist/cli/index.js audit --format json --output prod-audit.json --parallel 10

# Result: Production-grade security analysis
# - Identifies 2 critical vulnerabilities requiring immediate attention
# - 15 high-severity issues for next sprint planning
# - Compliance report for security team review
```

### **Use Case 3: VS Code Extension Workflow**
```bash
# Scenario: Interactive security analysis during development

# 1. Launch VS Code extension
cd extension/ && npm run compile
# Press F5 in VS Code

# 2. In Extension Development Host:
# - Command Palette: "MCP Auditor: Discover MCP Servers"
# - View Output Panel for real-time discovery logs
# - Review JSON results in VS Code editor

# 3. Run security analysis:
# - Command Palette: "MCP Auditor: Run Security Audit"
# - Monitor progress in Output Panel
# - View interactive HTML report in browser

# 4. Iterative development:
# - Fix security issues identified in report
# - Re-run audit to verify improvements
# - Track security score improvements over time
```

### **Use Case 4: CI/CD Integration**
```bash
# Scenario: Automated security testing in CI pipeline

#!/bin/bash
# ci-security-check.sh

# Build and run security audit
npm run build
node dist/cli/index.js audit --format json --output security-results.json

# Parse results for CI/CD decisions
CRITICAL=$(jq '.[] | select(.vulnerabilities[].severity == "critical") | length' security-results.json)
HIGH=$(jq '.[] | select(.vulnerabilities[].severity == "high") | length' security-results.json)

if [ "$CRITICAL" -gt 0 ]; then
    echo "❌ CI FAILED: $CRITICAL critical security issues found"
    exit 1
elif [ "$HIGH" -gt 5 ]; then
    echo "⚠️ CI WARNING: $HIGH high-severity issues found"
    exit 1
else
    echo "✅ CI PASSED: Security audit completed successfully"
    exit 0
fi
```

### **Use Case 5: Single Server Deep Dive**
```bash
# Scenario: Detailed analysis of specific problematic server

# Analyze specific server with verbose output
node dist/cli/index.js server wss://api.example.com/mcp \
  --format html \
  --output server-analysis.html \
  --verbose

# Result: Detailed single-server report showing:
# - SSL certificate expires in 30 days (Medium severity)
# - Missing CORS headers (High severity)
# - Weak authentication mechanism (Critical severity)
# - 12 specific recommendations for improvement
```

## 🔧 **Development & Customization**

### **Project Structure**
```
MCP-Security-Auditor-Agent/
├── src/                          # Core platform source
│   ├── index.ts                  # Main MCPSecurityAuditor class
│   ├── cli/index.ts              # CLI interface implementation
│   ├── services/                 # Core services
│   │   ├── discovery.ts          # Multi-source server discovery
│   │   ├── security-analyzer.ts  # Security analysis engine
│   │   └── report-generator.ts   # Report generation system
│   ├── types/index.ts            # TypeScript definitions
│   └── __tests__/                # Unit tests
├── extension/                    # VS Code extension
│   ├── src/extension.ts          # Extension entry point
│   ├── package.json              # Extension manifest
│   └── out/                      # Compiled extension
├── dist/                         # Compiled platform code
├── examples/                     # Sample configurations
├── docs/                         # Additional documentation
└── reports/                      # Generated security reports
```

### **Adding Custom Security Checks**
```typescript
// Example: Adding custom security check
class CustomSecurityAnalyzer extends SecurityAnalyzer {
  async analyzeCustomCheck(server: MCPServer): Promise<SecurityCheck> {
    // Custom security logic
    return {
      id: 'custom-check',
      name: 'Custom Security Check',
      category: SecurityCategory.CUSTOM,
      status: CheckStatus.PASS,
      severity: Severity.MEDIUM,
      description: 'Custom security validation',
      details: 'Implementation details'
    };
  }
}
```

### **Custom Report Templates**
```typescript
// Example: Custom HTML report template
const customTemplate = `
<div class="custom-section">
  <h2>Custom Security Analysis</h2>
  {{#each customChecks}}
    <div class="check-item {{status}}">
      <h3>{{name}}</h3>
      <p>{{description}}</p>
    </div>
  {{/each}}
</div>
`;
```

## 🎯 **Integration Examples**

### **GitHub Actions Workflow**
```yaml
name: MCP Security Audit

on: [push, pull_request]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build MCP Security Auditor
        run: npm run build
      
      - name: Run Security Audit
        run: |
          node dist/cli/index.js audit \
            --format json \
            --output security-report.json
      
      - name: Upload Security Report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.json
```

### **Jenkins Pipeline**
```groovy
pipeline {
    agent any
    
    stages {
        stage('Security Audit') {
            steps {
                script {
                    sh 'npm install && npm run build'
                    sh 'node dist/cli/index.js audit --format json --output security-results.json'
                    
                    def results = readJSON file: 'security-results.json'
                    def criticalIssues = results.findAll { it.vulnerabilities.any { v -> v.severity == 'critical' } }
                    
                    if (criticalIssues.size() > 0) {
                        error("Critical security issues found: ${criticalIssues.size()}")
                    }
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'security-results.json', fingerprint: true
                }
            }
        }
    }
}
```

## 📚 **Additional Resources**

### **Documentation**
- **BRD.md**: Business Requirements Document
- **IMPLEMENTATION_SUMMARY.md**: Technical implementation details
- **Extension README**: VS Code extension specific documentation

### **Sample Configurations**
- **mcp-audit.config.sample.json**: Example audit configuration
- **examples/sample-configs/**: Various configuration examples
- **examples/sample-mcp-server/**: Example MCP server setup

### **Reports & Examples**
- **single-server-report.json**: Example single server analysis
- **Generated Reports**: HTML/JSON/Markdown format examples

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Submit a pull request with detailed description

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🛡️ **Security**

For security-related issues, please email security@example.com instead of using the public issue tracker.

---

**🎉 This platform provides enterprise-grade MCP security analysis with both command-line automation and interactive VS Code integration, making it suitable for development teams, security professionals, and DevOps engineers working with Model Context Protocol infrastructure.**

## Quick Start

### Installation

```bash
npm install -g mcp-security-auditor
```

### Basic Usage

```bash
# Initialize configuration
mcp-audit init

# Discover MCP servers
mcp-audit discover

# Perform security audit
mcp-audit audit --output report.html

# Analyze a specific server
mcp-audit server https://api.example.com/mcp
```

## CLI Commands

### `mcp-audit audit`

Perform a comprehensive security audit of discovered MCP servers.

```bash
mcp-audit audit [options]

Options:
  -c, --config <path>       Configuration file path
  -o, --output <path>       Output file path (default: ./mcp-audit-report.html)
  -f, --format <format>     Report format: json|html|markdown (default: html)
  -v, --verbose             Verbose output
  -t, --timeout <ms>        Request timeout in milliseconds (default: 10000)
  --exclude <patterns...>   Exclude patterns
  --include <patterns...>   Include patterns
  --parallel <count>        Maximum parallel requests (default: 5)
```

### `mcp-audit discover`

Discover MCP servers without performing security analysis.

```bash
mcp-audit discover [options]

Options:
  -c, --config <path>       Configuration file path
  -v, --verbose             Verbose output
  -t, --timeout <ms>        Request timeout in milliseconds
  --exclude <patterns...>   Exclude patterns
  --include <patterns...>   Include patterns
```

### `mcp-audit server <endpoint>`

Analyze a single MCP server.

```bash
mcp-audit server <endpoint> [options]

Options:
  -o, --output <path>       Output file path
  -f, --format <format>     Report format: json|html|markdown (default: json)
  -v, --verbose             Verbose output
```

### `mcp-audit init`

Initialize a configuration file with guided setup.

```bash
mcp-audit init [options]

Options:
  -p, --path <path>         Configuration file path (default: ./mcp-audit.config.json)
```

## Configuration

The tool uses a JSON configuration file to define discovery sources and analysis parameters:

```json
{
  "sources": [
    {
      "type": "local",
      "config": {
        "paths": ["."],
        "patterns": ["**/mcp.config.json", "**/mcp.yaml", "**/package.json"]
      },
      "enabled": true
    },
    {
      "type": "vscode",
      "config": {},
      "enabled": true
    },
    {
      "type": "registry",
      "config": {
        "url": "https://registry.modelcontextprotocol.org/api/servers"
      },
      "enabled": false
    }
  ],
  "timeout": 10000,
  "maxConcurrent": 5,
  "excludePatterns": ["**/node_modules/**", "**/.*"]
}
```

### Discovery Sources

- **local**: Scan local filesystem for MCP configuration files
- **vscode**: Check VS Code settings for MCP server configurations
- **registry**: Query public MCP server registries
- **api**: Query custom API endpoints for server lists

## Programmatic Usage

```typescript
import MCPSecurityAuditor from 'mcp-security-auditor';

const auditor = new MCPSecurityAuditor();

// Discover servers
const config = {
  sources: [
    {
      type: 'local',
      config: { paths: ['.'] },
      enabled: true
    }
  ],
  timeout: 10000,
  maxConcurrent: 5
};

const servers = await auditor.discoverServers(config);

// Analyze security
const results = await auditor.performAudit(config);

// Generate report
const reportConfig = {
  format: 'html',
  outputPath: './security-report.html',
  includeDetails: true,
  includeRecommendations: true
};

await auditor.generateReport(results, reportConfig);
```

## Security Checks

The tool performs comprehensive security analysis including:

### SSL/TLS Analysis
- Certificate validity and expiration
- Protocol version support (TLS 1.2+)
- Cipher suite analysis
- Certificate chain validation

### Authentication & Authorization
- Authentication mechanism detection
- Unauthenticated access testing
- Authorization header validation
- API key security assessment

### Network Security
- CORS configuration analysis
- Security header verification
- Rate limiting detection
- Information disclosure checks

### API Security
- Endpoint enumeration
- Input validation testing
- Error handling analysis
- Sensitive data exposure

### Configuration Security
- Server information disclosure
- Default configuration detection
- Security misconfiguration identification

## Report Formats

### HTML Report
Interactive report with:
- Executive summary dashboard
- Detailed server analysis
- Collapsible sections
- Security score visualization
- Vulnerability prioritization

### JSON Report
Machine-readable format for:
- CI/CD integration
- Automated processing
- Data analysis
- Custom reporting

### Markdown Report
Human-readable format for:
- Documentation
- GitHub integration
- Team sharing
- Knowledge base

## Security Scoring

Servers receive letter grades based on security posture:

- **A (Excellent)**: 90-100% - Strong security posture
- **B (Good)**: 80-89% - Good security with minor issues
- **C (Fair)**: 60-79% - Adequate security, improvements needed
- **D (Poor)**: 40-59% - Poor security, significant issues
- **F (Critical)**: 0-39% - Critical security issues

## Development

### Prerequisites

- Node.js 18+
- TypeScript 5+

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/mcp-security-auditor.git
cd mcp-security-auditor

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

### Project Structure

```
src/
├── index.ts              # Main entry point
├── cli/
│   └── index.ts          # CLI interface
├── services/
│   ├── discovery.ts      # Server discovery service
│   ├── security-analyzer.ts  # Security analysis engine
│   └── report-generator.ts   # Report generation
└── types/
    └── index.ts          # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Security

For security-related issues, please email security@example.com instead of using the public issue tracker.

## Roadmap

### Phase 1 (Current)
- ✅ CLI tool with basic discovery
- ✅ Security analysis engine
- ✅ Report generation

### Phase 2 (Planned)
- 🔄 VS Code extension
- 🔄 Real-time monitoring
- 🔄 Integration with security tools

### Phase 3 (Future)
- 🔄 Machine learning-based threat detection
- 🔄 Automated remediation suggestions
- 🔄 Compliance framework integration

## Support

- 📖 [Documentation](https://docs.example.com/mcp-security-auditor)
- 🐛 [Issue Tracker](https://github.com/your-org/mcp-security-auditor/issues)
- 💬 [Community Discussions](https://github.com/your-org/mcp-security-auditor/discussions)
- 📧 [Email Support](mailto:support@example.com)
