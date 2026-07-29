/**
 * Plugin System Tests
 */

const PluginEngine = require('../plugin-engine');
const PluginRegistry = require('../plugin-registry');
const PluginManager = require('../plugin-manager');

describe('PluginEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new PluginEngine();
  });

  describe('plugin lifecycle', () => {
    test('should register plugin', () => {
      const manifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        type: 'module'
      };

      engine.registerPlugin(manifest, {});

      expect(engine.plugins.has('test-plugin')).toBe(true);
    });

    test('should install plugin', async () => {
      const manifest = { id: 'p1', name: 'Plugin', version: '1.0.0', type: 'module' };
      engine.registerPlugin(manifest, {});

      await engine.installPlugin('p1', {});

      expect(engine.plugins.get('p1').installed).toBe(true);
    });

    test('should enable plugin', async () => {
      const manifest = { id: 'p1', name: 'Plugin', version: '1.0.0', type: 'module' };
      engine.registerPlugin(manifest, {});
      await engine.installPlugin('p1', {});

      await engine.enablePlugin('p1');

      expect(engine.plugins.get('p1').enabled).toBe(true);
    });

    test('should disable plugin', async () => {
      const manifest = { id: 'p1', name: 'Plugin', version: '1.0.0', type: 'module' };
      engine.registerPlugin(manifest, {});
      await engine.installPlugin('p1', {});
      await engine.enablePlugin('p1');

      await engine.disablePlugin('p1');

      expect(engine.plugins.get('p1').enabled).toBe(false);
    });

    test('should uninstall plugin', async () => {
      const manifest = { id: 'p1', name: 'Plugin', version: '1.0.0', type: 'module' };
      engine.registerPlugin(manifest, {});

      await engine.uninstallPlugin('p1');

      expect(engine.plugins.has('p1')).toBe(false);
    });
  });

  describe('event system', () => {
    test('should register and emit hooks', async () => {
      const manifest = { id: 'p1', name: 'Plugin', version: '1.0.0' };
      engine.registerPlugin(manifest, {});

      const handler = jest.fn();
      engine.registerHook('test:event', handler, 'p1');

      await engine.emitEvent('test:event', { data: 'test' });

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('health check', () => {
    test('should report health status', async () => {
      const manifest = { id: 'p1', name: 'Plugin', version: '1.0.0', type: 'module' };
      engine.registerPlugin(manifest, {});

      const health = engine.getHealth();

      expect(health.pluginsCount).toBe(1);
      expect(health.enabledCount).toBe(0);
    });
  });
});

describe('PluginRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new PluginRegistry();
  });

  describe('plugin registration', () => {
    test('should register plugin in registry', () => {
      const manifest = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        type: 'module'
      };

      registry.registerPlugin(manifest);

      expect(registry.plugins.has('test-plugin')).toBe(true);
    });

    test('should register plugin version', () => {
      const manifest = {
        id: 'test-plugin',
        name: 'Test',
        version: '1.0.0',
        type: 'module'
      };

      registry.registerPlugin(manifest);
      registry.registerVersion('test-plugin', manifest);

      expect(registry.getVersions('test-plugin').length).toBeGreaterThan(0);
    });
  });

  describe('search', () => {
    test('should search plugins by name', () => {
      const manifest = { id: 'p1', name: 'Test Plugin', version: '1.0.0', type: 'module' };
      registry.registerPlugin(manifest);

      const results = registry.search('Test');

      expect(results.length).toBeGreaterThan(0);
    });

    test('should filter by category', () => {
      registry.registerPlugin(
        { id: 'p1', name: 'P1', version: '1.0.0', type: 'module' },
        { category: 'crm' }
      );

      const results = registry.search('', { category: 'crm' });

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('ratings', () => {
    test('should add review', () => {
      registry.registerPlugin({ id: 'p1', name: 'P1', version: '1.0.0', type: 'module' });

      registry.addReview('p1', {
        author: 'user',
        rating: 5,
        title: 'Great plugin',
        text: 'Works perfectly'
      });

      expect(registry.getAverageRating('p1')).toBe(5);
    });
  });

  describe('stats', () => {
    test('should calculate registry stats', () => {
      registry.registerPlugin({ id: 'p1', name: 'P1', version: '1.0.0', type: 'module' });

      const stats = registry.getStats();

      expect(stats.totalPlugins).toBeGreaterThan(0);
      expect(stats.totalDownloads).toBeDefined();
    });
  });
});

describe('PluginManager', () => {
  let manager, engine, registry;

  beforeEach(() => {
    engine = new PluginEngine();
    registry = new PluginRegistry();
    manager = new PluginManager(engine, registry);
  });

  describe('plugin installation', () => {
    test('should install plugin from registry', async () => {
      const manifest = {
        id: 'test-plugin',
        name: 'Test',
        version: '1.0.0',
        type: 'module'
      };

      registry.registerPlugin(manifest);
      engine.registerPlugin(manifest, {});

      await manager.installFromRegistry('test-plugin', '1.0.0');

      expect(manager.installedPlugins.has('test-plugin')).toBe(true);
    });

    test('should track downloads on install', async () => {
      const manifest = { id: 'p1', name: 'P1', version: '1.0.0', type: 'module' };
      registry.registerPlugin(manifest);
      engine.registerPlugin(manifest, {});

      await manager.installFromRegistry('p1', '1.0.0');

      expect(registry.getInstallationCount('p1')).toBeGreaterThan(0);
    });
  });

  describe('plugin configuration', () => {
    test('should set plugin configuration', () => {
      manager.configurations.set('p1', {});
      const config = { apiKey: 'test123' };

      manager.setConfiguration('p1', config);

      expect(manager.getConfiguration('p1')).toEqual(config);
    });
  });

  describe('plugin validation', () => {
    test('should validate plugin manifest', () => {
      const manifest = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        type: 'module'
      };

      const result = manager.validatePluginManifest(manifest);

      expect(result.valid).toBe(true);
    });

    test('should catch validation errors', () => {
      const manifest = { name: 'Test' }; // Missing id, version, type

      const result = manager.validatePluginManifest(manifest);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('metrics', () => {
    test('should report plugin metrics', () => {
      const metrics = manager.getMetrics();

      expect(metrics.installedPlugins).toBeDefined();
      expect(metrics.enabledPlugins).toBeDefined();
    });
  });
});
