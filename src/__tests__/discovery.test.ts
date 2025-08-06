import { describe, test, expect, beforeEach } from '@jest/globals';
import { DiscoveryService } from '../services/discovery';
import { DiscoveryConfig } from '../types';

describe('DiscoveryService', () => {
  let discoveryService: DiscoveryService;
  let config: DiscoveryConfig;

  beforeEach(() => {
    discoveryService = new DiscoveryService();
    config = {
      sources: [
        {
          type: 'local',
          config: {
            paths: ['.'],
            patterns: ['**/package.json']
          },
          enabled: true
        }
      ],
      timeout: 5000,
      maxConcurrent: 2
    };
  });

  test('should initialize properly', () => {
    expect(discoveryService).toBeInstanceOf(DiscoveryService);
  });

  test('should discover servers from configuration', async () => {
    const results = await discoveryService.discoverServers(config);
    expect(Array.isArray(results)).toBe(true);
  });

  test('should handle empty configuration', async () => {
    const emptyConfig: DiscoveryConfig = {
      sources: [],
      timeout: 5000,
      maxConcurrent: 1
    };
    
    const results = await discoveryService.discoverServers(emptyConfig);
    expect(results).toHaveLength(0);
  });
});
