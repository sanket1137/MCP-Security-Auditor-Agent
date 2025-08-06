import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import axios from 'axios';
import { glob } from 'glob';
import * as yaml from 'yaml';
import {
  MCPServer,
  DiscoveryConfig,
  DiscoveryResult,
  DiscoverySource,
  DiscoveryError
} from '../types';

/**
 * Service responsible for discovering MCP servers from various sources
 */
export class DiscoveryService {
  private readonly defaultTimeout = 10000; // 10 seconds
  private readonly defaultMaxConcurrent = 5;

  /**
   * Discover MCP servers from all configured sources
   * @param config - Discovery configuration
   * @returns Promise<DiscoveryResult[]>
   */
  async discoverServers(config: DiscoveryConfig): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];
    const timeout = config.timeout || this.defaultTimeout;
    const maxConcurrent = config.maxConcurrent || this.defaultMaxConcurrent;

    // Process sources in batches to respect concurrency limits
    const enabledSources = config.sources.filter(source => source.enabled);
    const batches = this.chunkArray(enabledSources, maxConcurrent);

    for (const batch of batches) {
      const batchPromises = batch.map(source => 
        this.discoverFromSource(source, timeout)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Discovery failed for ${batch[index].type}:`, result.reason);
          results.push({
            source: batch[index].type,
            servers: [],
            errors: [result.reason.message || 'Unknown error'],
            duration: 0
          });
        }
      });
    }

    return results;
  }

  /**
   * Discover servers from a single source
   * @param source - Discovery source configuration
   * @param timeout - Request timeout in milliseconds
   * @returns Promise<DiscoveryResult>
   */
  private async discoverFromSource(
    source: DiscoverySource, 
    timeout: number
  ): Promise<DiscoveryResult> {
    const startTime = Date.now();
    
    try {
      let servers: MCPServer[] = [];
      
      switch (source.type) {
        case 'local':
          servers = await this.discoverLocalServers(source.config);
          break;
        case 'registry':
          servers = await this.discoverFromRegistry(source.config, timeout);
          break;
        case 'api':
          servers = await this.discoverFromAPI(source.config, timeout);
          break;
        case 'vscode':
          servers = await this.discoverFromVSCode(source.config);
          break;
        default:
          throw new DiscoveryError(`Unknown source type: ${source.type}`);
      }

      return {
        source: source.type,
        servers,
        errors: [],
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        source: source.type,
        servers: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Discover MCP servers from local workspace/filesystem
   * @param config - Local discovery configuration
   * @returns Promise<MCPServer[]>
   */
  private async discoverLocalServers(config: any): Promise<MCPServer[]> {
    const servers: MCPServer[] = [];
    const searchPaths = config.paths || ['.'];
    const patterns = config.patterns || ['**/mcp.config.json', '**/mcp.yaml', '**/mcp.yml'];

    for (const searchPath of searchPaths) {
      for (const pattern of patterns) {
        try {
          const files = await glob(pattern, { 
            cwd: resolve(searchPath),
            absolute: true 
          });

          for (const file of files) {
            try {
              const server = await this.parseConfigFile(file);
              if (server) {
                servers.push(server);
              }
            } catch (error) {
              console.warn(`Failed to parse config file ${file}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Failed to search in ${searchPath} with pattern ${pattern}:`, error);
        }
      }
    }

    // Also check for package.json files with MCP server configurations
    try {
      const packageFiles = await glob('**/package.json', { 
        cwd: resolve(searchPaths[0] || '.'),
        absolute: true 
      });

      for (const packageFile of packageFiles) {
        try {
          const server = await this.parsePackageJson(packageFile);
          if (server) {
            servers.push(server);
          }
        } catch (error) {
          console.warn(`Failed to parse package.json ${packageFile}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to search for package.json files:', error);
    }

    return servers;
  }

  /**
   * Discover servers from a public registry
   * @param config - Registry configuration
   * @param timeout - Request timeout
   * @returns Promise<MCPServer[]>
   */
  private async discoverFromRegistry(config: any, timeout: number): Promise<MCPServer[]> {
    const registryUrl = config.url || 'https://registry.modelcontextprotocol.org/api/servers';
    
    try {
      const response = await axios.get(registryUrl, {
        timeout,
        headers: {
          'User-Agent': 'MCP-Security-Auditor/1.0.0',
          'Accept': 'application/json'
        }
      });

      if (!Array.isArray(response.data)) {
        throw new DiscoveryError('Registry response is not an array');
      }

      return response.data.map((item: any) => this.normalizeServerData(item, 'registry'));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DiscoveryError(`Registry request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Discover servers from a custom API endpoint
   * @param config - API configuration
   * @param timeout - Request timeout
   * @returns Promise<MCPServer[]>
   */
  private async discoverFromAPI(config: any, timeout: number): Promise<MCPServer[]> {
    const apiUrl = config.url;
    if (!apiUrl) {
      throw new DiscoveryError('API URL is required for API discovery');
    }

    try {
      const response = await axios.get(apiUrl, {
        timeout,
        headers: {
          'User-Agent': 'MCP-Security-Auditor/1.0.0',
          'Accept': 'application/json',
          ...config.headers
        },
        auth: config.auth
      });

      const servers = Array.isArray(response.data) ? response.data : response.data.servers;
      if (!Array.isArray(servers)) {
        throw new DiscoveryError('API response does not contain a servers array');
      }

      return servers.map((item: any) => this.normalizeServerData(item, 'api'));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DiscoveryError(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Discover servers from VS Code configuration
   * @param config - VS Code discovery configuration
   * @returns Promise<MCPServer[]>
   */
  private async discoverFromVSCode(config: any): Promise<MCPServer[]> {
    const servers: MCPServer[] = [];
    
    // Check VS Code settings for MCP configurations
    const vscodeSettingsPaths = [
      join(process.env.APPDATA || '', 'Code', 'User', 'settings.json'),
      join(process.env.HOME || '', '.vscode', 'settings.json'),
      join(process.cwd(), '.vscode', 'settings.json')
    ];

    for (const settingsPath of vscodeSettingsPaths) {
      try {
        await fs.access(settingsPath);
        const settingsContent = await fs.readFile(settingsPath, 'utf-8');
        const settings = JSON.parse(settingsContent);
        
        // Look for MCP-related settings
        const mcpServers = settings['mcp.servers'] || settings['modelContextProtocol.servers'];
        if (mcpServers && Array.isArray(mcpServers)) {
          servers.push(...mcpServers.map((item: any) => 
            this.normalizeServerData(item, 'vscode')
          ));
        }
      } catch (error) {
        // Ignore errors for missing files
      }
    }

    return servers;
  }

  /**
   * Parse a configuration file (JSON or YAML)
   * @param filePath - Path to the configuration file
   * @returns Promise<MCPServer | null>
   */
  private async parseConfigFile(filePath: string): Promise<MCPServer | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      let config: any;

      if (filePath.endsWith('.json')) {
        config = JSON.parse(content);
      } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        config = yaml.parse(content);
      } else {
        return null;
      }

      return this.normalizeServerData(config, 'local');
    } catch (error) {
      console.warn(`Failed to parse config file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Parse package.json for MCP server configuration
   * @param filePath - Path to package.json
   * @returns Promise<MCPServer | null>
   */
  private async parsePackageJson(filePath: string): Promise<MCPServer | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const packageJson = JSON.parse(content);

      // Check if this is an MCP server package
      const mcpConfig = packageJson.mcp || packageJson.modelContextProtocol;
      if (!mcpConfig) {
        return null;
      }

      return this.normalizeServerData({
        ...mcpConfig,
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        repository: packageJson.repository?.url
      }, 'local');
    } catch (error) {
      return null;
    }
  }

  /**
   * Normalize server data from different sources into a consistent format
   * @param data - Raw server data
   * @param source - Data source type
   * @returns MCPServer
   */
  private normalizeServerData(data: any, source: string): MCPServer {
    const endpoint = data.endpoint || data.url || data.server || '';
    const protocol = this.extractProtocol(endpoint);

    return {
      id: data.id || this.generateServerId(data.name || endpoint),
      name: data.name || data.title || 'Unknown Server',
      version: data.version || '1.0.0',
      description: data.description,
      endpoint,
      protocol,
      owner: data.owner || data.author,
      lastSeen: new Date(),
      metadata: {
        capabilities: data.capabilities,
        authentication: data.authentication,
        rateLimit: data.rateLimit,
        documentation: data.documentation,
        repository: data.repository,
        license: data.license,
        tags: data.tags
      }
    };
  }

  /**
   * Extract protocol from endpoint URL
   * @param endpoint - Server endpoint
   * @returns Protocol type
   */
  private extractProtocol(endpoint: string): 'http' | 'https' | 'ws' | 'wss' {
    if (endpoint.startsWith('wss://')) return 'wss';
    if (endpoint.startsWith('ws://')) return 'ws';
    if (endpoint.startsWith('https://')) return 'https';
    return 'http';
  }

  /**
   * Generate a unique server ID
   * @param name - Server name
   * @returns Unique ID
   */
  private generateServerId(name: string): string {
    return `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
  }

  /**
   * Split array into chunks of specified size
   * @param array - Array to chunk
   * @param size - Chunk size
   * @returns Chunked array
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}