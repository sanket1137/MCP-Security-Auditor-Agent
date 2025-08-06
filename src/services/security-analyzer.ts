import axios, { AxiosResponse } from 'axios';
import * as https from 'https';
import * as tls from 'tls';
import { URL } from 'url';
import * as forge from 'node-forge';
import WebSocket from 'ws';
import {
  MCPServer,
  SecurityAnalysisResult,
  SecurityCheck,
  SecurityRecommendation,
  Vulnerability,
  SecurityScore,
  CheckStatus,
  Severity,
  SecurityCategory,
  SecurityAnalysisError
} from '../types';

/**
 * Service responsible for security analysis of MCP servers
 */
export class SecurityAnalyzer {
  private readonly requestTimeout = 10000; // 10 seconds
  private readonly maxRedirects = 5;

  /**
   * Perform comprehensive security analysis on an MCP server
   * @param server - MCP server to analyze
   * @returns Promise<SecurityAnalysisResult>
   */
  async analyzeServer(server: MCPServer): Promise<SecurityAnalysisResult> {
    const timestamp = new Date();
    const checks: SecurityCheck[] = [];
    const recommendations: SecurityRecommendation[] = [];
    const vulnerabilities: Vulnerability[] = [];

    try {
      // Run all security checks
      const checkResults = await Promise.allSettled([
        this.checkEndpointAvailability(server),
        this.checkSSLConfiguration(server),
        this.checkAuthentication(server),
        this.checkHttpSecurity(server),
        this.checkAPIEndpoints(server),
        this.checkRateLimit(server),
        this.checkCORSConfiguration(server),
        this.checkSecurityHeaders(server)
      ]);

      // Process check results
      checkResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          checks.push(...result.value.checks);
          recommendations.push(...result.value.recommendations);
          vulnerabilities.push(...result.value.vulnerabilities);
        } else if (result.status === 'rejected') {
          console.warn(`Security check ${index} failed:`, result.reason);
        }
      });

      // Calculate overall security score
      const overallScore = this.calculateSecurityScore(checks);

      return {
        serverId: server.id,
        serverName: server.name,
        endpoint: server.endpoint,
        timestamp,
        overallScore,
        checks,
        recommendations,
        vulnerabilities
      };
    } catch (error) {
      throw new SecurityAnalysisError(
        `Failed to analyze server ${server.name}: ${error}`,
        { server, error }
      );
    }
  }

  /**
   * Check if the server endpoint is available and responding
   */
  private async checkEndpointAvailability(server: MCPServer): Promise<{
    checks: SecurityCheck[];
    recommendations: SecurityRecommendation[];
    vulnerabilities: Vulnerability[];
  }> {
    const checks: SecurityCheck[] = [];
    const recommendations: SecurityRecommendation[] = [];
    const vulnerabilities: Vulnerability[] = [];

    try {
      if (server.protocol === 'ws' || server.protocol === 'wss') {
        // WebSocket availability check
        await this.checkWebSocketAvailability(server.endpoint);
        checks.push({
          id: 'endpoint-availability-ws',
          name: 'WebSocket Endpoint Availability',
          category: SecurityCategory.AVAILABILITY,
          status: CheckStatus.PASS,
          severity: Severity.HIGH,
          description: 'WebSocket endpoint is accessible and responding'
        });
      } else {
        // HTTP availability check
        const response = await axios.get(server.endpoint, {
          timeout: this.requestTimeout,
          maxRedirects: this.maxRedirects,
          validateStatus: () => true // Accept all status codes
        });

        if (response.status >= 200 && response.status < 300) {
          checks.push({
            id: 'endpoint-availability-http',
            name: 'HTTP Endpoint Availability',
            category: SecurityCategory.AVAILABILITY,
            status: CheckStatus.PASS,
            severity: Severity.HIGH,
            description: 'HTTP endpoint is accessible and responding normally'
          });
        } else if (response.status >= 400) {
          checks.push({
            id: 'endpoint-availability-http',
            name: 'HTTP Endpoint Availability',
            category: SecurityCategory.AVAILABILITY,
            status: CheckStatus.WARNING,
            severity: Severity.MEDIUM,
            description: `Endpoint returned status ${response.status}`,
            details: `HTTP ${response.status}: ${response.statusText}`
          });
        }
      }
    } catch (error) {
      checks.push({
        id: 'endpoint-availability',
        name: 'Endpoint Availability',
        category: SecurityCategory.AVAILABILITY,
        status: CheckStatus.FAIL,
        severity: Severity.CRITICAL,
        description: 'Endpoint is not accessible',
        details: error instanceof Error ? error.message : 'Unknown error'
      });

      vulnerabilities.push({
        id: 'endpoint-unreachable',
        title: 'Endpoint Unreachable',
        description: 'The MCP server endpoint cannot be reached',
        severity: Severity.HIGH,
        category: SecurityCategory.AVAILABILITY,
        affected: server.endpoint,
        remediation: 'Verify server is running and network connectivity'
      });
    }

    return { checks, recommendations, vulnerabilities };
  }

  /**
   * Check SSL/TLS configuration for HTTPS/WSS endpoints
   */
  private async checkSSLConfiguration(server: MCPServer): Promise<{
    checks: SecurityCheck[];
    recommendations: SecurityRecommendation[];
    vulnerabilities: Vulnerability[];
  }> {
    const checks: SecurityCheck[] = [];
    const recommendations: SecurityRecommendation[] = [];
    const vulnerabilities: Vulnerability[] = [];

    if (server.protocol !== 'https' && server.protocol !== 'wss') {
      checks.push({
        id: 'ssl-not-used',
        name: 'SSL/TLS Usage',
        category: SecurityCategory.ENCRYPTION,
        status: CheckStatus.FAIL,
        severity: Severity.HIGH,
        description: 'Server is not using SSL/TLS encryption'
      });

      vulnerabilities.push({
        id: 'unencrypted-communication',
        title: 'Unencrypted Communication',
        description: 'Server communication is not encrypted with SSL/TLS',
        severity: Severity.HIGH,
        category: SecurityCategory.ENCRYPTION,
        affected: server.endpoint,
        remediation: 'Enable HTTPS/WSS to encrypt communications'
      });

      return { checks, recommendations, vulnerabilities };
    }

    try {
      const url = new URL(server.endpoint);
      const port = parseInt(url.port) || (server.protocol === 'https' ? 443 : 443);

      // Get certificate information
      const certInfo = await this.getCertificateInfo(url.hostname, port);
      
      if (certInfo) {
        // Check certificate validity
        const now = new Date();
        const notBefore = new Date(certInfo.validFrom);
        const notAfter = new Date(certInfo.validTo);

        if (now >= notBefore && now <= notAfter) {
          checks.push({
            id: 'ssl-certificate-valid',
            name: 'SSL Certificate Validity',
            category: SecurityCategory.ENCRYPTION,
            status: CheckStatus.PASS,
            severity: Severity.HIGH,
            description: 'SSL certificate is valid and not expired'
          });
        } else {
          checks.push({
            id: 'ssl-certificate-valid',
            name: 'SSL Certificate Validity',
            category: SecurityCategory.ENCRYPTION,
            status: CheckStatus.FAIL,
            severity: Severity.CRITICAL,
            description: 'SSL certificate is expired or not yet valid',
            details: `Valid from: ${notBefore.toISOString()}, Valid to: ${notAfter.toISOString()}`
          });

          vulnerabilities.push({
            id: 'expired-certificate',
            title: 'Expired SSL Certificate',
            description: 'The SSL certificate has expired or is not yet valid',
            severity: Severity.CRITICAL,
            category: SecurityCategory.ENCRYPTION,
            affected: server.endpoint,
            remediation: 'Renew the SSL certificate'
          });
        }

        // Check certificate expiry warning (30 days)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (notAfter <= thirtyDaysFromNow) {
          recommendations.push({
            id: 'certificate-expiry-warning',
            title: 'SSL Certificate Expiring Soon',
            description: 'SSL certificate will expire within 30 days',
            severity: Severity.MEDIUM,
            category: SecurityCategory.ENCRYPTION,
            actionRequired: true,
            resources: ['Certificate renewal documentation']
          });
        }

        // Check cipher suites and protocol versions
        const tlsInfo = await this.checkTLSConfiguration(url.hostname, port);
        if (tlsInfo) {
          if (tlsInfo.supportsTLS12 || tlsInfo.supportsTLS13) {
            checks.push({
              id: 'tls-version',
              name: 'TLS Version Support',
              category: SecurityCategory.ENCRYPTION,
              status: CheckStatus.PASS,
              severity: Severity.MEDIUM,
              description: 'Server supports modern TLS versions'
            });
          } else {
            checks.push({
              id: 'tls-version',
              name: 'TLS Version Support',
              category: SecurityCategory.ENCRYPTION,
              status: CheckStatus.FAIL,
              severity: Severity.HIGH,
              description: 'Server does not support modern TLS versions'
            });

            vulnerabilities.push({
              id: 'outdated-tls',
              title: 'Outdated TLS Version',
              description: 'Server only supports outdated TLS versions',
              severity: Severity.HIGH,
              category: SecurityCategory.ENCRYPTION,
              affected: server.endpoint,
              remediation: 'Upgrade to support TLS 1.2 or higher'
            });
          }
        }
      }
    } catch (error) {
      checks.push({
        id: 'ssl-check-error',
        name: 'SSL Configuration Check',
        category: SecurityCategory.ENCRYPTION,
        status: CheckStatus.ERROR,
        severity: Severity.MEDIUM,
        description: 'Could not verify SSL configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return { checks, recommendations, vulnerabilities };
  }

  /**
   * Check authentication mechanisms
   */
  private async checkAuthentication(server: MCPServer): Promise<{
    checks: SecurityCheck[];
    recommendations: SecurityRecommendation[];
    vulnerabilities: Vulnerability[];
  }> {
    const checks: SecurityCheck[] = [];
    const recommendations: SecurityRecommendation[] = [];
    const vulnerabilities: Vulnerability[] = [];

    try {
      // Test unauthenticated access
      const response = await axios.get(server.endpoint, {
        timeout: this.requestTimeout,
        validateStatus: () => true
      });

      if (response.status === 401 || response.status === 403) {
        checks.push({
          id: 'authentication-required',
          name: 'Authentication Required',
          category: SecurityCategory.AUTHENTICATION,
          status: CheckStatus.PASS,
          severity: Severity.HIGH,
          description: 'Server properly requires authentication'
        });
      } else if (response.status === 200) {
        checks.push({
          id: 'authentication-required',
          name: 'Authentication Required',
          category: SecurityCategory.AUTHENTICATION,
          status: CheckStatus.WARNING,
          severity: Severity.MEDIUM,
          description: 'Server allows unauthenticated access'
        });

        recommendations.push({
          id: 'implement-authentication',
          title: 'Implement Authentication',
          description: 'Consider implementing authentication to secure the API',
          severity: Severity.MEDIUM,
          category: SecurityCategory.AUTHENTICATION,
          actionRequired: false
        });
      }

      // Check for authentication headers
      const authHeaders = ['www-authenticate', 'authorization'];
      const hasAuthHeaders = authHeaders.some(header => 
        response.headers[header] || response.headers[header.toLowerCase()]
      );

      if (hasAuthHeaders) {
        checks.push({
          id: 'auth-headers-present',
          name: 'Authentication Headers',
          category: SecurityCategory.AUTHENTICATION,
          status: CheckStatus.PASS,
          severity: Severity.LOW,
          description: 'Server includes proper authentication headers'
        });
      }
    } catch (error) {
      checks.push({
        id: 'authentication-check-error',
        name: 'Authentication Check',
        category: SecurityCategory.AUTHENTICATION,
        status: CheckStatus.ERROR,
        severity: Severity.LOW,
        description: 'Could not verify authentication configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return { checks, recommendations, vulnerabilities };
  }

  /**
   * Check HTTP security configurations
   */
  private async checkHttpSecurity(server: MCPServer): Promise<{
    checks: SecurityCheck[];
    recommendations: SecurityRecommendation[];
    vulnerabilities: Vulnerability[];
  }> {
    const checks: SecurityCheck[] = [];
    const recommendations: SecurityRecommendation[] = [];
    const vulnerabilities: Vulnerability[] = [];

    if (server.protocol === 'ws' || server.protocol === 'wss') {
      return { checks, recommendations, vulnerabilities };
    }

    try {
      const response = await axios.get(server.endpoint, {
        timeout: this.requestTimeout,
        validateStatus: () => true
      });

      // Check for security headers
      const securityHeaders = {
        'strict-transport-security': 'HSTS',
        'x-content-type-options': 'Content Type Options',
        'x-frame-options': 'Frame Options',
        'x-xss-protection': 'XSS Protection',
        'content-security-policy': 'Content Security Policy'
      };

      Object.entries(securityHeaders).forEach(([header, name]) => {
        if (response.headers[header] || response.headers[header.toLowerCase()]) {
          checks.push({
            id: `security-header-${header}`,
            name: `${name} Header`,
            category: SecurityCategory.CONFIGURATION,
            status: CheckStatus.PASS,
            severity: Severity.LOW,
            description: `${name} header is present`
          });
        } else {
          checks.push({
            id: `security-header-${header}`,
            name: `${name} Header`,
            category: SecurityCategory.CONFIGURATION,
            status: CheckStatus.WARNING,
            severity: Severity.LOW,
            description: `${name} header is missing`
          });

          recommendations.push({
            id: `add-${header}-header`,
            title: `Add ${name} Header`,
            description: `Consider adding the ${header} header for enhanced security`,
            severity: Severity.LOW,
            category: SecurityCategory.CONFIGURATION,
            actionRequired: false
          });
        }
      });

      // Check server header for information disclosure
      const serverHeader = response.headers.server || response.headers.Server;
      if (serverHeader) {
        checks.push({
          id: 'server-header-disclosure',
          name: 'Server Information Disclosure',
          category: SecurityCategory.CONFIGURATION,
          status: CheckStatus.WARNING,
          severity: Severity.LOW,
          description: 'Server header reveals server information',
          details: `Server: ${serverHeader}`
        });

        recommendations.push({
          id: 'hide-server-header',
          title: 'Hide Server Header',
          description: 'Consider hiding or minimizing server header information',
          severity: Severity.LOW,
          category: SecurityCategory.CONFIGURATION,
          actionRequired: false
        });
      }
    } catch (error) {
      checks.push({
        id: 'http-security-check-error',
        name: 'HTTP Security Check',
        category: SecurityCategory.CONFIGURATION,
        status: CheckStatus.ERROR,
        severity: Severity.LOW,
        description: 'Could not verify HTTP security configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return { checks, recommendations, vulnerabilities };
  }

  /**
   * Check API endpoints for security issues
   */
  private async checkAPIEndpoints(server: MCPServer): Promise<{
    checks: SecurityCheck[];
    recommendations: SecurityRecommendation[];
    vulnerabilities: Vulnerability[];
  }> {
    const checks: SecurityCheck[] = [];
    const recommendations: SecurityRecommendation[] = [];
    const vulnerabilities: Vulnerability[] = [];

    // Common MCP endpoints to test
    const endpoints = [
      '/metadata',
      '/info',
      '/health',
      '/status',
      '/api',
      '/docs',
      '/swagger',
      '/openapi'
    ];

    try {
      const baseUrl = server.endpoint.replace(/\/$/, '');
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${baseUrl}${endpoint}`, {
            timeout: this.requestTimeout,
            validateStatus: () => true
          });

          if (response.status === 200) {
            checks.push({
              id: `endpoint-${endpoint.replace('/', '-')}`,
              name: `Endpoint ${endpoint}`,
              category: SecurityCategory.CONFIGURATION,
              status: CheckStatus.PASS,
              severity: Severity.INFO,
              description: `Endpoint ${endpoint} is accessible`
            });

            // Check for sensitive information in responses
            if (this.containsSensitiveInfo(response.data)) {
              vulnerabilities.push({
                id: `sensitive-info-${endpoint}`,
                title: 'Sensitive Information Exposure',
                description: `Endpoint ${endpoint} may expose sensitive information`,
                severity: Severity.MEDIUM,
                category: SecurityCategory.DATA_PROTECTION,
                affected: `${baseUrl}${endpoint}`,
                remediation: 'Review and sanitize endpoint responses'
              });
            }
          }
        } catch (error) {
          // Ignore endpoint check errors
        }
      }
    } catch (error) {
      checks.push({
        id: 'api-endpoints-check-error',
        name: 'API Endpoints Check',
        category: SecurityCategory.CONFIGURATION,
        status: CheckStatus.ERROR,
        severity: Severity.LOW,
        description: 'Could not verify API endpoints',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return { checks, recommendations, vulnerabilities };
  }

  /**
   * Check rate limiting configuration
   */
  private async checkRateLimit(server: MCPServer): Promise<{
    checks: SecurityCheck[];
    recommendations: SecurityRecommendation[];
    vulnerabilities: Vulnerability[];
  }> {
    const checks: SecurityCheck[] = [];
    const recommendations: SecurityRecommendation[] = [];
    const vulnerabilities: Vulnerability[] = [];

    // This is a simplified rate limit check
    // In practice, you might want to make multiple requests to test actual rate limiting
    
    if (server.metadata?.rateLimit) {
      checks.push({
        id: 'rate-limit-configured',
        name: 'Rate Limiting',
        category: SecurityCategory.AVAILABILITY,
        status: CheckStatus.PASS,
        severity: Severity.MEDIUM,
        description: 'Rate limiting is configured'
      });
    } else {
      checks.push({
        id: 'rate-limit-configured',
        name: 'Rate Limiting',
        category: SecurityCategory.AVAILABILITY,
        status: CheckStatus.WARNING,
        severity: Severity.LOW,
        description: 'Rate limiting configuration not detected'
      });

      recommendations.push({
        id: 'implement-rate-limiting',
        title: 'Implement Rate Limiting',
        description: 'Consider implementing rate limiting to prevent abuse',
        severity: Severity.LOW,
        category: SecurityCategory.AVAILABILITY,
        actionRequired: false
      });
    }

    return { checks, recommendations, vulnerabilities };
  }

  /**
   * Check CORS configuration
   */
  private async checkCORSConfiguration(server: MCPServer): Promise<{
    checks: SecurityCheck[];
    recommendations: SecurityRecommendation[];
    vulnerabilities: Vulnerability[];
  }> {
    const checks: SecurityCheck[] = [];
    const recommendations: SecurityRecommendation[] = [];
    const vulnerabilities: Vulnerability[] = [];

    if (server.protocol === 'ws' || server.protocol === 'wss') {
      return { checks, recommendations, vulnerabilities };
    }

    try {
      const response = await axios.options(server.endpoint, {
        timeout: this.requestTimeout,
        headers: {
          'Origin': 'https://example.com',
          'Access-Control-Request-Method': 'GET'
        },
        validateStatus: () => true
      });

      const corsHeader = response.headers['access-control-allow-origin'];
      if (corsHeader === '*') {
        checks.push({
          id: 'cors-wildcard',
          name: 'CORS Configuration',
          category: SecurityCategory.CONFIGURATION,
          status: CheckStatus.WARNING,
          severity: Severity.MEDIUM,
          description: 'CORS allows all origins (*)',
          details: 'Access-Control-Allow-Origin: *'
        });

        recommendations.push({
          id: 'restrict-cors-origins',
          title: 'Restrict CORS Origins',
          description: 'Consider restricting CORS to specific trusted origins',
          severity: Severity.MEDIUM,
          category: SecurityCategory.CONFIGURATION,
          actionRequired: false
        });
      } else if (corsHeader) {
        checks.push({
          id: 'cors-configured',
          name: 'CORS Configuration',
          category: SecurityCategory.CONFIGURATION,
          status: CheckStatus.PASS,
          severity: Severity.LOW,
          description: 'CORS is properly configured with specific origins'
        });
      }
    } catch (error) {
      checks.push({
        id: 'cors-check-error',
        name: 'CORS Configuration Check',
        category: SecurityCategory.CONFIGURATION,
        status: CheckStatus.ERROR,
        severity: Severity.LOW,
        description: 'Could not verify CORS configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return { checks, recommendations, vulnerabilities };
  }

  /**
   * Check security headers in detail
   */
  private async checkSecurityHeaders(server: MCPServer): Promise<{
    checks: SecurityCheck[];
    recommendations: SecurityRecommendation[];
    vulnerabilities: Vulnerability[];
  }> {
    // This method can be expanded to provide more detailed security header analysis
    // For now, it's covered in checkHttpSecurity
    return { checks: [], recommendations: [], vulnerabilities: [] };
  }

  /**
   * Check WebSocket availability
   */
  private async checkWebSocketAvailability(endpoint: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(endpoint);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('WebSocket connection timeout'));
      }, this.requestTimeout);

      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve();
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Get certificate information
   */
  private async getCertificateInfo(hostname: string, port: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const socket = tls.connect(port, hostname, { rejectUnauthorized: false }, () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        resolve(cert);
      });

      socket.on('error', (error) => {
        reject(error);
      });

      setTimeout(() => {
        socket.destroy();
        reject(new Error('Certificate check timeout'));
      }, this.requestTimeout);
    });
  }

  /**
   * Check TLS configuration
   */
  private async checkTLSConfiguration(hostname: string, port: number): Promise<any> {
    // Simplified TLS configuration check
    // In practice, you might want to use a more comprehensive TLS testing library
    return {
      supportsTLS12: true, // Placeholder
      supportsTLS13: true  // Placeholder
    };
  }

  /**
   * Check if response contains sensitive information
   */
  private containsSensitiveInfo(data: any): boolean {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }

    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key.*=.*[a-zA-Z0-9]{20,}/i,
      /api.*key/i,
      /private.*key/i
    ];

    return sensitivePatterns.some(pattern => pattern.test(data));
  }

  /**
   * Calculate overall security score based on check results
   */
  private calculateSecurityScore(checks: SecurityCheck[]): SecurityScore {
    let totalScore = 0;
    let maxScore = 0;

    checks.forEach(check => {
      const severityWeight = this.getSeverityWeight(check.severity);
      maxScore += severityWeight;

      if (check.status === CheckStatus.PASS) {
        totalScore += severityWeight;
      } else if (check.status === CheckStatus.WARNING) {
        totalScore += severityWeight * 0.5;
      }
      // FAIL and ERROR get 0 points
    });

    if (maxScore === 0) return SecurityScore.FAIR;

    const percentage = (totalScore / maxScore) * 100;

    if (percentage >= 90) return SecurityScore.EXCELLENT;
    if (percentage >= 80) return SecurityScore.GOOD;
    if (percentage >= 60) return SecurityScore.FAIR;
    if (percentage >= 40) return SecurityScore.POOR;
    return SecurityScore.CRITICAL;
  }

  /**
   * Get weight for severity level
   */
  private getSeverityWeight(severity: Severity): number {
    switch (severity) {
      case Severity.CRITICAL: return 10;
      case Severity.HIGH: return 8;
      case Severity.MEDIUM: return 5;
      case Severity.LOW: return 2;
      case Severity.INFO: return 1;
      default: return 1;
    }
  }
}