/**
 * Plugin Manager
 * Handles plugin installation, configuration, and lifecycle
 */

class PluginManager {
  constructor(engine, registry) {
    this.engine = engine;
    this.registry = registry;
    this.installedPlugins = new Map(); // pluginId -> installation metadata
    this.configurations = new Map(); // pluginId -> config
  }

  /**
   * Install plugin from registry
   */
  async installFromRegistry(pluginId, version, config = {}) {
    const manifest = this.registry.getVersionInfo(pluginId, version)?.manifest;
    if (!manifest) {
      throw new Error(`Plugin ${pluginId}@${version} not found in registry`);
    }

    // Install via engine
    await this.engine.installPlugin(pluginId, config);

    // Track installation
    this.installedPlugins.set(pluginId, {
      id: pluginId,
      version,
      installedAt: new Date(),
      config,
      enabled: false
    });

    // Track download
    this.registry.trackDownload(pluginId, version);

    return this.installedPlugins.get(pluginId);
  }

  /**
   * Uninstall plugin
   */
  async uninstallPlugin(pluginId) {
    await this.engine.uninstallPlugin(pluginId);
    this.installedPlugins.delete(pluginId);
    this.configurations.delete(pluginId);
  }

  /**
   * Enable plugin
   */
  async enablePlugin(pluginId) {
    await this.engine.enablePlugin(pluginId);

    const installed = this.installedPlugins.get(pluginId);
    if (installed) {
      installed.enabled = true;
    }
  }

  /**
   * Disable plugin
   */
  async disablePlugin(pluginId) {
    await this.engine.disablePlugin(pluginId);

    const installed = this.installedPlugins.get(pluginId);
    if (installed) {
      installed.enabled = false;
    }
  }

  /**
   * Update plugin
   */
  async updatePlugin(pluginId, newVersion) {
    const manifest = this.registry.getVersionInfo(pluginId, newVersion)?.manifest;
    if (!manifest) {
      throw new Error(`Plugin ${pluginId}@${newVersion} not found in registry`);
    }

    // Check compatibility
    if (!manifest.compatible) {
      throw new Error(`Plugin ${pluginId}@${newVersion} is not compatible`);
    }

    // Update via engine
    await this.engine.updatePlugin(pluginId, manifest);

    // Update installation metadata
    const installed = this.installedPlugins.get(pluginId);
    if (installed) {
      installed.version = newVersion;
      installed.updatedAt = new Date();
    }

    this.registry.trackDownload(pluginId, newVersion);

    return installed;
  }

  /**
   * Update plugin configuration
   */
  setConfiguration(pluginId, config) {
    this.configurations.set(pluginId, config);

    const installed = this.installedPlugins.get(pluginId);
    if (installed) {
      installed.config = config;
    }

    return config;
  }

  /**
   * Get plugin configuration
   */
  getConfiguration(pluginId) {
    return this.configurations.get(pluginId) || {};
  }

  /**
   * List installed plugins
   */
  listInstalledPlugins() {
    return Array.from(this.installedPlugins.values());
  }

  /**
   * Get plugin installation status
   */
  getInstallationStatus(pluginId) {
    return this.installedPlugins.get(pluginId) || null;
  }

  /**
   * Check for updates
   */
  checkForUpdates(pluginId) {
    const installed = this.installedPlugins.get(pluginId);
    if (!installed) return null;

    const plugin = this.registry.plugins.get(pluginId);
    if (!plugin) return null;

    if (plugin.latestVersion !== installed.version) {
      return {
        pluginId,
        currentVersion: installed.version,
        latestVersion: plugin.latestVersion,
        updateAvailable: true
      };
    }

    return {
      pluginId,
      currentVersion: installed.version,
      latestVersion: plugin.latestVersion,
      updateAvailable: false
    };
  }

  /**
   * Check all for updates
   */
  checkAllForUpdates() {
    const updates = [];

    for (const pluginId of this.installedPlugins.keys()) {
      const update = this.checkForUpdates(pluginId);
      if (update?.updateAvailable) {
        updates.push(update);
      }
    }

    return updates;
  }

  /**
   * Validate plugin before installation
   */
  validatePluginManifest(manifest) {
    const errors = [];

    if (!manifest.id) errors.push('Missing required field: id');
    if (!manifest.name) errors.push('Missing required field: name');
    if (!manifest.version) errors.push('Missing required field: version');
    if (!manifest.type) errors.push('Missing required field: type');

    const validTypes = ['module', 'integration', 'ui', 'command', 'webhook'];
    if (!validTypes.includes(manifest.type)) {
      errors.push(`Invalid type: ${manifest.type}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get plugin health status
   */
  getPluginHealth(pluginId) {
    const installed = this.installedPlugins.get(pluginId);
    if (!installed) return null;

    const engine = this.engine.getPluginInfo(pluginId);

    return {
      pluginId,
      installed: true,
      enabled: installed.enabled,
      version: installed.version,
      engineStatus: engine?.enabled ? 'running' : 'stopped',
      health: engine?.enabled ? 'healthy' : 'disabled',
      lastChecked: new Date()
    };
  }

  /**
   * Get all plugins health status
   */
  getAllPluginsHealth() {
    const health = [];

    for (const pluginId of this.installedPlugins.keys()) {
      health.push(this.getPluginHealth(pluginId));
    }

    return health;
  }

  /**
   * Export plugin configuration
   */
  exportConfiguration(pluginId) {
    return {
      pluginId,
      version: this.installedPlugins.get(pluginId)?.version,
      config: this.getConfiguration(pluginId),
      timestamp: new Date()
    };
  }

  /**
   * Import plugin configuration
   */
  importConfiguration(data) {
    this.setConfiguration(data.pluginId, data.config);
    return true;
  }

  /**
   * Get installation metrics
   */
  getMetrics() {
    const installedPlugins = this.installedPlugins.size;
    const enabledPlugins = Array.from(this.installedPlugins.values())
      .filter(p => p.enabled).length;

    return {
      installedPlugins,
      enabledPlugins,
      disabledPlugins: installedPlugins - enabledPlugins,
      availablePlugins: this.registry.plugins.size,
      totalDownloads: this.registry.getStats().totalDownloads,
      timestamp: new Date()
    };
  }
}

module.exports = PluginManager;
