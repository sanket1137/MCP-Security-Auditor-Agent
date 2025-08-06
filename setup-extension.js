#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up MCP Security Auditor VS Code Extension...\n');

// Create extension directory structure
const extensionDir = path.join(__dirname, 'extension');
if (!fs.existsSync(extensionDir)) {
    fs.mkdirSync(extensionDir, { recursive: true });
}

// Copy package.json for extension
const extensionPackageJson = {
    "name": "mcp-security-auditor-extension",
    "displayName": "MCP Security Auditor",
    "description": "Discover and analyze security of MCP (Model Context Protocol) servers",
    "version": "1.0.0",
    "publisher": "mcp-security-auditor",
    "engines": {
        "vscode": "^1.74.0"
    },
    "categories": ["Other", "Linters", "Debuggers"],
    "keywords": ["mcp", "security", "audit", "model-context-protocol"],
    "activationEvents": [],
    "main": "./out/extension.js",
    "contributes": {
        "commands": [
            {
                "command": "mcpAuditor.discoverServers",
                "title": "Discover MCP Servers",
                "category": "MCP Auditor",
                "icon": "$(search)"
            },
            {
                "command": "mcpAuditor.auditServers",
                "title": "Run Security Audit",
                "category": "MCP Auditor",
                "icon": "$(shield)"
            },
            {
                "command": "mcpAuditor.viewReport",
                "title": "View Security Report",
                "category": "MCP Auditor",
                "icon": "$(graph)"
            }
        ],
        "views": {
            "explorer": [
                {
                    "id": "mcpAuditorView",
                    "name": "MCP Security Auditor",
                    "when": "true"
                }
            ]
        },
        "menus": {
            "view/title": [
                {
                    "command": "mcpAuditor.discoverServers",
                    "when": "view == mcpAuditorView",
                    "group": "navigation"
                },
                {
                    "command": "mcpAuditor.auditServers", 
                    "when": "view == mcpAuditorView",
                    "group": "navigation"
                }
            ]
        }
    },
    "scripts": {
        "vscode:prepublish": "npm run compile",
        "compile": "tsc -p ./",
        "watch": "tsc -watch -p ./"
    },
    "devDependencies": {
        "@types/vscode": "^1.74.0",
        "@types/node": "20.x",
        "typescript": "^5.1.6"
    },
    "dependencies": {
        "axios": "^1.6.0"
    }
};

// Write extension package.json
fs.writeFileSync(
    path.join(extensionDir, 'package.json'),
    JSON.stringify(extensionPackageJson, null, 2)
);

// Create TypeScript config for extension
const extensionTsConfig = {
    "compilerOptions": {
        "module": "commonjs",
        "target": "ES2020",
        "outDir": "out",
        "lib": ["ES2020"],
        "sourceMap": true,
        "rootDir": "src",
        "strict": true
    },
    "exclude": ["node_modules", ".vscode-test"]
};

fs.writeFileSync(
    path.join(extensionDir, 'tsconfig.json'),
    JSON.stringify(extensionTsConfig, null, 2)
);

// Create simple extension.ts file
const extensionSrcDir = path.join(extensionDir, 'src');
if (!fs.existsSync(extensionSrcDir)) {
    fs.mkdirSync(extensionSrcDir, { recursive: true });
}

const simpleExtensionCode = `import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('MCP Security Auditor extension is now active!');

    // Get the main MCP auditor CLI path
    const cliPath = path.join(__dirname, '../../dist/cli/index.js');

    // Discover servers command
    const discoverCommand = vscode.commands.registerCommand('mcpAuditor.discoverServers', async () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Discovering MCP Servers...",
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: "Running discovery..." });
                
                const { stdout } = await execPromise(\`node "\${cliPath}" discover --format json\`);
                const servers = JSON.parse(stdout);
                
                progress.report({ increment: 100, message: "Discovery complete!" });
                
                vscode.window.showInformationMessage(
                    \`Discovered \${servers.length} MCP servers\`,
                    'View Details'
                ).then(selection => {
                    if (selection === 'View Details') {
                        // Create and show a new document with the results
                        vscode.workspace.openTextDocument({
                            content: JSON.stringify(servers, null, 2),
                            language: 'json'
                        }).then(doc => {
                            vscode.window.showTextDocument(doc);
                        });
                    }
                });
            } catch (error) {
                vscode.window.showErrorMessage(\`Discovery failed: \${error}\`);
            }
        });
    });

    // Audit servers command  
    const auditCommand = vscode.commands.registerCommand('mcpAuditor.auditServers', async () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Running Security Audit...",
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: "Running audit..." });
                
                const { stdout } = await execPromise(\`node "\${cliPath}" audit --output audit-report.html\`);
                
                progress.report({ increment: 100, message: "Audit complete!" });
                
                vscode.window.showInformationMessage(
                    'Security audit completed successfully!',
                    'View Report'
                ).then(selection => {
                    if (selection === 'View Report') {
                        vscode.commands.executeCommand('mcpAuditor.viewReport');
                    }
                });
            } catch (error) {
                vscode.window.showErrorMessage(\`Audit failed: \${error}\`);
            }
        });
    });

    // View report command
    const viewReportCommand = vscode.commands.registerCommand('mcpAuditor.viewReport', async () => {
        try {
            const reportPath = vscode.Uri.file(path.join(vscode.workspace.rootPath || '', 'audit-report.html'));
            await vscode.env.openExternal(reportPath);
        } catch (error) {
            vscode.window.showErrorMessage(\`Failed to open report: \${error}\`);
        }
    });

    context.subscriptions.push(discoverCommand, auditCommand, viewReportCommand);

    // Show welcome message
    vscode.window.showInformationMessage(
        'MCP Security Auditor is ready!',
        'Discover Servers'
    ).then(selection => {
        if (selection === 'Discover Servers') {
            vscode.commands.executeCommand('mcpAuditor.discoverServers');
        }
    });
}

export function deactivate() {}

function execPromise(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}
`;

fs.writeFileSync(path.join(extensionSrcDir, 'extension.ts'), simpleExtensionCode);

console.log('✅ Extension structure created!');
console.log('📁 Extension files created in:', extensionDir);

// Instructions
console.log(`
🎯 Next steps to try the extension:

1. Open the extension folder in VS Code:
   code "${extensionDir}"

2. Install dependencies:
   cd "${extensionDir}"
   npm install

3. Press F5 in VS Code to launch Extension Development Host

4. In the new VS Code window, open Command Palette (Ctrl+Shift+P) and try:
   - "MCP Auditor: Discover MCP Servers"
   - "MCP Auditor: Run Security Audit"
   - "MCP Auditor: View Security Report"

The extension uses the CLI tool we built to perform the actual security analysis!
`);
