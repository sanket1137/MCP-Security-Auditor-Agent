# MCP Security Auditor - VS Code Extension

This VS Code extension provides a user-friendly interface for the MCP Security Auditor tool, allowing you to discover and analyze the security of MCP (Model Context Protocol) servers directly from within VS Code.

## Features

- **🔍 Server Discovery**: Automatically discover MCP servers from multiple sources
- **🛡️ Security Analysis**: Comprehensive security auditing with detailed reports  
- **📊 Visual Reports**: Interactive HTML reports with security scores and recommendations
- **⚡ Command Palette Integration**: Easy access through VS Code commands

## Quick Start

1. **Open VS Code Extension Development**
   - Press `F5` to launch a new Extension Development Host window
   - Or use `Run > Start Debugging` from the menu

2. **Use the Extension**
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Type "MCP Auditor" to see available commands:
     - `MCP Auditor: Discover MCP Servers`
     - `MCP Auditor: Run Security Audit` 
     - `MCP Auditor: View Security Report`

## Available Commands

### Discover MCP Servers
- Scans for MCP servers from various sources
- Shows discovered servers in JSON format
- Provides server details and metadata

### Run Security Audit
- Performs comprehensive security analysis
- Generates detailed HTML security report
- Provides security scores and risk assessments

### View Security Report
- Opens the generated security report
- Interactive HTML with charts and detailed findings
- Includes recommendations for security improvements

## How It Works

The extension acts as a VS Code wrapper around the powerful MCP Security Auditor CLI tool. When you run commands:

1. The extension calls the underlying CLI tool
2. Results are processed and displayed in VS Code
3. Reports are generated and can be viewed in your default browser

## Example Workflow

1. **Discovery**: Start by discovering MCP servers in your environment
2. **Analysis**: Run a security audit to identify potential vulnerabilities
3. **Review**: Examine the detailed security report with findings and recommendations
4. **Action**: Use the recommendations to improve your MCP server security

## Security Checks

The extension performs comprehensive security analysis including:

- SSL/TLS configuration validation
- Authentication mechanism analysis  
- Endpoint security assessment
- Rate limiting evaluation
- CORS policy review
- WebSocket security checks
- Certificate validation
- Security header analysis

## Development

This extension is built using:
- TypeScript
- VS Code Extension API
- Node.js child process integration with the CLI tool

## Troubleshooting

If you encounter issues:

1. Ensure the main CLI tool is built (`npm run build` in the parent directory)
2. Check that Node.js is available in your PATH
3. Verify network connectivity for server discovery
4. Check VS Code Developer Console for error details

## Next Steps

- Try discovering servers in your environment
- Run a security audit to see the comprehensive analysis
- Review the generated reports to understand your MCP security posture
- Use the recommendations to improve security configurations

Happy auditing! 🛡️
