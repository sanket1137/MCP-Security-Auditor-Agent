# MCP Security Auditor

An intelligent agent for discovering and analyzing the security posture of Model Context Protocol (MCP) servers. This tool provides comprehensive security analysis, vulnerability detection, and compliance reporting for MCP infrastructure.

## Features

🔍 **Server Discovery**
- Local workspace scanning
- VS Code extension registry integration
- Public MCP registry support
- Custom API endpoint discovery

🔒 **Security Analysis**
- SSL/TLS certificate validation
- Authentication mechanism analysis
- API endpoint security testing
- CORS configuration assessment
- Security headers verification
- Rate limiting detection

📊 **Comprehensive Reporting**
- HTML, JSON, and Markdown reports
- Security score calculation
- Vulnerability prioritization
- Actionable recommendations
- Compliance assessments

🛠️ **Multiple Interfaces**
- Command-line interface (CLI)
- Programmatic API
- VS Code extension (planned)

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
