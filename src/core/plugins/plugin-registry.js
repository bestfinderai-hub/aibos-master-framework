/**
 * Plugin Registry
 * Central catalog of available plugins and versions
 */

class PluginRegistry {
  constructor() {
    this.plugins = new Map(); // pluginId -> plugin metadata
    this.versions = new Map(); // pluginId:version -> version info
    this.ratings = new Map(); // pluginId -> rating info
  }

  /**
   * Register plugin in registry
   */
  registerPlugin(manifest, metadata = {}) {
    const pluginEntry = {
      id: manifest.id,
      name: manifest.name,
      description: manifest.description,
      type: manifest.type,
      author: metadata.author,
      repository: metadata.repository,
      documentation: metadata.documentation,
      support: metadata.support,
      license: metadata.license,
      tags: metadata.tags || [],
      category: metadata.category || 'other',
      featured: metadata.featured || false,
      latestVersion: manifest.version,
      createdAt: metadata.createdAt || new Date(),
      updatedAt: new Date(),
      versions: {},
      downloads: 0,
      reviews: [],
      pricing: manifest.pricing || { model: 'free' }
    };

    this.plugins.set(manifest.id, pluginEntry);

    // Register version
    this.registerVersion(manifest.id, manifest);

    return pluginEntry;
  }

  /**
   * Register plugin version
   */
  registerVersion(pluginId, manifest) {
    const versionKey = `${pluginId}:${manifest.version}`;

    const versionInfo = {
      version: manifest.version,
      manifest,
      downloads: 0,
      rating: 5.0,
      releaseDate: new Date(),
      changelog: manifest.changelog || 'No changelog provided',
      compatible: manifest.targetVersion || '>=1.0.0',
      size: 0 // Would be actual size
    };

    this.versions.set(versionKey, versionInfo);

    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.versions[manifest.version] = versionInfo;
      plugin.latestVersion = manifest.version;
      plugin.updatedAt = new Date();
    }

    return versionInfo;
  }

  /**
   * Search plugins
   */
  search(query, filters = {}) {
    const results = [];

    for (const [, plugin] of this.plugins) {
      let matches = true;

      // Text search
      if (query) {
        const queryLower = query.toLowerCase();
        matches = plugin.name.toLowerCase().includes(queryLower) ||
          plugin.description.toLowerCase().includes(queryLower) ||
          plugin.tags.some(t => t.toLowerCase().includes(queryLower));
      }

      // Category filter
      if (filters.category && plugin.category !== filters.category) {
        matches = false;
      }

      // Type filter
      if (filters.type && plugin.type !== filters.type) {
        matches = false;
      }

      // Rating filter
      if (filters.minRating) {
        const avgRating = this.getAverageRating(plugin.id);
        if (avgRating < filters.minRating) {
          matches = false;
        }
      }

      // Price filter
      if (filters.free && plugin.pricing.model !== 'free') {
        matches = false;
      }

      if (matches) {
        results.push(this.getPluginInfo(plugin.id));
      }
    }

    // Sort by downloads or rating
    if (filters.sortBy === 'downloads') {
      results.sort((a, b) => b.downloads - a.downloads);
    } else if (filters.sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'recent') {
      results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return results;
  }

  /**
   * Get plugin info
   */
  getPluginInfo(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return null;

    return {
      id: plugin.id,
      name: plugin.name,
      description: plugin.description,
      type: plugin.type,
      author: plugin.author,
      category: plugin.category,
      tags: plugin.tags,
      latestVersion: plugin.latestVersion,
      downloads: plugin.downloads,
      rating: this.getAverageRating(pluginId),
      reviewCount: plugin.reviews.length,
      featured: plugin.featured,
      repository: plugin.repository,
      documentation: plugin.documentation,
      pricing: plugin.pricing,
      createdAt: plugin.createdAt,
      updatedAt: plugin.updatedAt
    };
  }

  /**
   * Get version info
   */
  getVersionInfo(pluginId, version) {
    const versionKey = `${pluginId}:${version}`;
    return this.versions.get(versionKey);
  }

  /**
   * Get all versions
   */
  getVersions(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return [];

    return Object.values(plugin.versions).sort((a, b) => {
      return new Date(b.releaseDate) - new Date(a.releaseDate);
    });
  }

  /**
   * Add review/rating
   */
  addReview(pluginId, review) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const reviewEntry = {
      id: `review_${Date.now()}`,
      author: review.author,
      rating: review.rating, // 1-5
      title: review.title,
      text: review.text,
      version: review.version,
      helpful: review.helpful || 0,
      createdAt: new Date()
    };

    plugin.reviews.push(reviewEntry);

    return reviewEntry;
  }

  /**
   * Get average rating
   */
  getAverageRating(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || plugin.reviews.length === 0) return 0;

    const sum = plugin.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Math.round((sum / plugin.reviews.length) * 10) / 10;
  }

  /**
   * Track download
   */
  trackDownload(pluginId, version) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    plugin.downloads++;

    const versionKey = `${pluginId}:${version}`;
    const versionInfo = this.versions.get(versionKey);
    if (versionInfo) {
      versionInfo.downloads++;
    }
  }

  /**
   * Get featured plugins
   */
  getFeaturedPlugins() {
    return Array.from(this.plugins.values())
      .filter(p => p.featured)
      .map(p => this.getPluginInfo(p.id))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);
  }

  /**
   * Get trending plugins
   */
  getTrendingPlugins() {
    return Array.from(this.plugins.values())
      .map(p => this.getPluginInfo(p.id))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);
  }

  /**
   * Get plugins by category
   */
  getByCategory(category) {
    return Array.from(this.plugins.values())
      .filter(p => p.category === category)
      .map(p => this.getPluginInfo(p.id))
      .sort((a, b) => b.rating - a.rating);
  }

  /**
   * List all plugins
   */
  listAll() {
    return Array.from(this.plugins.values())
      .map(p => this.getPluginInfo(p.id))
      .sort((a, b) => b.downloads - a.downloads);
  }

  /**
   * Check compatibility
   */
  checkCompatibility(pluginId, platformVersion) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    const version = this.getVersionInfo(pluginId, plugin.latestVersion);
    if (!version) return false;

    // Simplified compatibility check
    return this.isVersionCompatible(platformVersion, version.compatible);
  }

  /**
   * Check version compatibility
   */
  isVersionCompatible(platformVersion, requirement) {
    if (requirement === '*') return true;
    if (requirement.startsWith('>=')) {
      const minVersion = requirement.substring(2);
      return platformVersion >= minVersion;
    }
    if (requirement.startsWith('^')) {
      const minVersion = requirement.substring(1);
      return platformVersion >= minVersion;
    }
    return true;
  }

  /**
   * Get installation count
   */
  getInstallationCount(pluginId) {
    const plugin = this.plugins.get(pluginId);
    return plugin ? plugin.downloads : 0;
  }

  /**
   * Get registry stats
   */
  getStats() {
    return {
      totalPlugins: this.plugins.size,
      totalDownloads: Array.from(this.plugins.values()).reduce((sum, p) => sum + p.downloads, 0),
      totalReviews: Array.from(this.plugins.values()).reduce((sum, p) => sum + p.reviews.length, 0),
      averageRating: this.calculateGlobalRating(),
      categories: this.getCategoryStats(),
      types: this.getTypeStats(),
      timestamp: new Date()
    };
  }

  /**
   * Calculate global average rating
   */
  calculateGlobalRating() {
    const ratings = Array.from(this.plugins.values())
      .filter(p => p.reviews.length > 0)
      .map(p => this.getAverageRating(p.id));

    if (ratings.length === 0) return 0;
    return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  }

  /**
   * Get category stats
   */
  getCategoryStats() {
    const stats = {};
    for (const plugin of this.plugins.values()) {
      const category = plugin.category;
      stats[category] = (stats[category] || 0) + 1;
    }
    return stats;
  }

  /**
   * Get type stats
   */
  getTypeStats() {
    const stats = {};
    for (const plugin of this.plugins.values()) {
      const type = plugin.type;
      stats[type] = (stats[type] || 0) + 1;
    }
    return stats;
  }
}

module.exports = PluginRegistry;
