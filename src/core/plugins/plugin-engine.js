/**
 * Plugin Engine
 * Core plugin lifecycle management and coordination
 */

const EventEmitter = require('events');

class PluginEngine extends EventEmitter {
  constructor() {
    super();
    this.plugins = new Map(); // pluginId -> plugin instance
    this.hooks = new Map(); // eventName -> [handlers]
    this.middleware = []; // Middleware chain
    this.permissions = new Map(); // pluginId -> [permissions]
    this.started = false;
  }

  /**
   * Register plugin
   */
  registerPlugin(manifest, implementation) {
    if (!manifest.id) {
      throw new Error('Plugin must have an id');
    }

    const plugin = {
      id: manifest.id,
      manifest,
      implementation,
      enabled: false,
      installed: false,
      loadedAt: null,
      config: {},
      hooks: []
    };

    this.plugins.set(manifest.id, plugin);
    this.permissions.set(manifest.id, manifest.permissions || []);

    this.emit('plugin:registered', manifest.id);
    return plugin;
  }

  /**
   * Install plugin
   */
  async installPlugin(pluginId, config = {}) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Validate dependencies
    if (plugin.manifest.dependencies) {
      this.validateDependencies(plugin.manifest.dependencies);
    }

    // Store configuration
    plugin.config = config;
    plugin.installed = true;

    // Call install hook
    if (plugin.manifest.hooks?.onInstall) {
      await this.callHook(plugin, plugin.manifest.hooks.onInstall);
    }

    this.emit('plugin:installed', pluginId);
    return plugin;
  }

  /**
   * Enable plugin
   */
  async enablePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!plugin.installed) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    try {
      // Load plugin code
      await this.loadPlugin(plugin);

      // Call enable hook
      if (plugin.manifest.hooks?.onEnable) {
        await this.callHook(plugin, plugin.manifest.hooks.onEnable);
      }

      plugin.enabled = true;
      plugin.loadedAt = new Date();

      this.emit('plugin:enabled', pluginId);
      return plugin;
    } catch (error) {
      this.emit('plugin:error', { pluginId, error: error.message });
      throw error;
    }
  }

  /**
   * Disable plugin
   */
  async disablePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!plugin.enabled) {
      return plugin;
    }

    try {
      // Unregister hooks
      this.unregisterPluginHooks(pluginId);

      plugin.enabled = false;

      this.emit('plugin:disabled', pluginId);
      return plugin;
    } catch (error) {
      this.emit('plugin:error', { pluginId, error: error.message });
      throw error;
    }
  }

  /**
   * Uninstall plugin
   */
  async uninstallPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Disable if enabled
    if (plugin.enabled) {
      await this.disablePlugin(pluginId);
    }

    // Call uninstall hook
    if (plugin.manifest.hooks?.onUninstall) {
      await this.callHook(plugin, plugin.manifest.hooks.onUninstall);
    }

    this.plugins.delete(pluginId);
    this.permissions.delete(pluginId);

    this.emit('plugin:uninstalled', pluginId);
    return true;
  }

  /**
   * Load plugin code
   */
  async loadPlugin(plugin) {
    if (plugin.implementation && typeof plugin.implementation.install === 'function') {
      await plugin.implementation.install(this.getPluginAPI(plugin.id));
    }
  }

  /**
   * Register event hook
   */
  registerHook(eventName, handler, pluginId) {
    if (!this.hooks.has(eventName)) {
      this.hooks.set(eventName, []);
    }

    const subscription = { handler, pluginId };
    this.hooks.get(eventName).push(subscription);

    return () => {
      const hooks = this.hooks.get(eventName);
      const index = hooks.indexOf(subscription);
      if (index > -1) {
        hooks.splice(index, 1);
      }
    };
  }

  /**
   * Emit event (trigger hooks)
   */
  async emitEvent(eventName, data) {
    const hooks = this.hooks.get(eventName) || [];

    for (const { handler, pluginId } of hooks) {
      try {
        await handler(data);
      } catch (error) {
        this.emit('plugin:error', { pluginId, error: error.message });
      }
    }
  }

  /**
   * Get plugin API (what plugin has access to)
   */
  getPluginAPI(pluginId) {
    const plugin = this.plugins.get(pluginId);
    const permissions = this.permissions.get(pluginId) || [];

    return {
      // Event system
      on: (event, handler) => this.registerHook(event, handler, pluginId),
      emit: (event, data) => this.emit(`plugin:${pluginId}:${event}`, data),

      // Permission checking
      hasPermission: (permission) => permissions.includes(permission),
      getPermissions: () => permissions,

      // Plugin management
      getPlugin: (id) => this.getPluginInfo(id),
      listPlugins: () => this.listEnabledPlugins(),

      // Configuration
      getConfig: () => plugin.config,
      setConfig: (config) => { plugin.config = config; },

      // Logging
      log: (level, message, data) => {
        this.emit('plugin:log', { pluginId, level, message, data });
      }
    };
  }

  /**
   * Validate plugin dependencies
   */
  validateDependencies(dependencies) {
    for (const [depId, versionRange] of Object.entries(dependencies)) {
      const dep = this.plugins.get(depId);
      if (!dep || !dep.installed) {
        throw new Error(`Dependency ${depId} is not installed`);
      }

      // Simple version check (would use semver in production)
      if (!this.checkVersionCompatibility(dep.manifest.version, versionRange)) {
        throw new Error(`Dependency ${depId} version mismatch`);
      }
    }
  }

  /**
   * Check version compatibility
   */
  checkVersionCompatibility(version, range) {
    // Simplified: just check >=
    if (range.startsWith('>=')) {
      const minVersion = range.substring(2);
      return version >= minVersion;
    }
    if (range.startsWith('^')) {
      const minVersion = range.substring(1);
      return version >= minVersion;
    }
    return true;
  }

  /**
   * Call plugin hook
   */
  async callHook(plugin, hookPath) {
    if (plugin.implementation && plugin.implementation[hookPath]) {
      await plugin.implementation[hookPath]();
    }
  }

  /**
   * Unregister all hooks for plugin
   */
  unregisterPluginHooks(pluginId) {
    for (const [eventName, hooks] of this.hooks.entries()) {
      this.hooks.set(
        eventName,
        hooks.filter(h => h.pluginId !== pluginId)
      );
    }
  }

  /**
   * Get plugin info
   */
  getPluginInfo(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return null;

    return {
      id: plugin.id,
      name: plugin.manifest.name,
      version: plugin.manifest.version,
      enabled: plugin.enabled,
      installed: plugin.installed,
      loadedAt: plugin.loadedAt,
      permissions: this.permissions.get(pluginId),
      config: plugin.config
    };
  }

  /**
   * List all enabled plugins
   */
  listEnabledPlugins() {
    return Array.from(this.plugins.values())
      .filter(p => p.enabled)
      .map(p => this.getPluginInfo(p.id));
  }

  /**
   * List all plugins
   */
  listAllPlugins() {
    return Array.from(this.plugins.values())
      .map(p => this.getPluginInfo(p.id));
  }

  /**
   * Start plugin engine
   */
  async start() {
    // Enable all installed plugins that should auto-start
    for (const plugin of this.plugins.values()) {
      if (plugin.installed && plugin.manifest.autoStart !== false) {
        try {
          await this.enablePlugin(plugin.id);
        } catch (error) {
          console.error(`Failed to start plugin ${plugin.id}:`, error);
        }
      }
    }

    this.started = true;
    this.emit('engine:started');
  }

  /**
   * Stop plugin engine
   */
  async stop() {
    // Disable all enabled plugins
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled) {
        try {
          await this.disablePlugin(plugin.id);
        } catch (error) {
          console.error(`Failed to stop plugin ${plugin.id}:`, error);
        }
      }
    }

    this.started = false;
    this.emit('engine:stopped');
  }

  /**
   * Health check
   */
  getHealth() {
    return {
      started: this.started,
      pluginsCount: this.plugins.size,
      enabledCount: Array.from(this.plugins.values()).filter(p => p.enabled).length,
      plugins: this.listAllPlugins(),
      timestamp: new Date()
    };
  }

  /**
   * Update plugin
   */
  async updatePlugin(pluginId, newManifest) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const wasEnabled = plugin.enabled;

    try {
      // Disable before update
      if (wasEnabled) {
        await this.disablePlugin(pluginId);
      }

      // Update manifest
      const oldManifest = plugin.manifest;
      plugin.manifest = newManifest;

      // Call update hook
      if (newManifest.hooks?.onUpdate) {
        await this.callHook(plugin, newManifest.hooks.onUpdate);
      }

      // Re-enable if was enabled
      if (wasEnabled) {
        await this.enablePlugin(pluginId);
      }

      this.emit('plugin:updated', pluginId);
      return plugin;
    } catch (error) {
      // Rollback on error
      plugin.manifest = oldManifest;
      if (wasEnabled) {
        await this.enablePlugin(pluginId);
      }
      throw error;
    }
  }
}

module.exports = PluginEngine;
