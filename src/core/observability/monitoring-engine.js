/**
 * Monitoring Engine
 * Real-time monitoring and metrics collection
 */

class MonitoringEngine {
  constructor() {
    this.metrics = new Map(); // metricId -> metric definition
    this.timeSeries = new Map(); // metricId -> [data points]
    this.collectors = new Map(); // collectorId -> collector
    this.dashboards = new Map(); // dashboardId -> dashboard config
  }

  // ============================================================================
  // METRIC REGISTRATION
  // ============================================================================

  registerMetric(metricId, config) {
    const metric = {
      id: metricId,
      name: config.name,
      type: config.type || 'gauge', // gauge, counter, histogram, summary
      description: config.description,
      unit: config.unit,
      tags: config.tags || [],
      retention: config.retention || 7 * 24 * 60 * 60 * 1000, // 7 days default
      scrapeInterval: config.scrapeInterval || 60000, // 1 minute default
      createdAt: new Date()
    };

    this.metrics.set(metricId, metric);
    this.timeSeries.set(metricId, []);

    return metric;
  }

  getMetric(metricId) {
    return this.metrics.get(metricId);
  }

  listMetrics(filter = {}) {
    let metrics = Array.from(this.metrics.values());

    if (filter.type) {
      metrics = metrics.filter(m => m.type === filter.type);
    }

    if (filter.tags) {
      metrics = metrics.filter(m =>
        filter.tags.every(t => m.tags.includes(t))
      );
    }

    return metrics;
  }

  // ============================================================================
  // DATA COLLECTION
  // ============================================================================

  recordMetric(metricId, value, tags = {}) {
    const metric = this.metrics.get(metricId);
    if (!metric) throw new Error(`Metric ${metricId} not found`);

    const dataPoint = {
      timestamp: new Date(),
      value,
      tags: { ...metric.tags, ...tags }
    };

    const timeSeries = this.timeSeries.get(metricId);
    timeSeries.push(dataPoint);

    // Enforce retention policy
    const cutoffTime = Date.now() - metric.retention;
    this.timeSeries.set(metricId, timeSeries.filter(dp => dp.timestamp.getTime() > cutoffTime));

    return dataPoint;
  }

  recordBatch(metrics) {
    const results = [];

    for (const { metricId, value, tags } of metrics) {
      results.push(this.recordMetric(metricId, value, tags));
    }

    return results;
  }

  getTimeSeries(metricId, options = {}) {
    const timeSeries = this.timeSeries.get(metricId);
    if (!timeSeries) throw new Error(`Metric ${metricId} not found`);

    let filtered = [...timeSeries];

    // Filter by time range
    if (options.from) {
      filtered = filtered.filter(dp => dp.timestamp >= options.from);
    }

    if (options.to) {
      filtered = filtered.filter(dp => dp.timestamp <= options.to);
    }

    // Filter by tags
    if (options.tags) {
      filtered = filtered.filter(dp =>
        Object.entries(options.tags).every(([k, v]) => dp.tags[k] === v)
      );
    }

    return filtered.sort((a, b) => a.timestamp - b.timestamp);
  }

  // ============================================================================
  // STATISTICS & AGGREGATION
  // ============================================================================

  getMetricStats(metricId, window = null) {
    const timeSeries = this.getTimeSeries(metricId, window);

    if (timeSeries.length === 0) {
      return null;
    }

    const values = timeSeries.map(dp => dp.value);
    const sorted = [...values].sort((a, b) => a - b);

    return {
      metricId,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      stdDev: this.calculateStdDev(values),
      sum: values.reduce((a, b) => a + b, 0)
    };
  }

  calculateStdDev(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  aggregateMetrics(metricIds, aggregation = 'mean', window = null) {
    const results = {};

    for (const metricId of metricIds) {
      const stats = this.getMetricStats(metricId, window);
      results[metricId] = stats ? stats[aggregation] : null;
    }

    return results;
  }

  // ============================================================================
  // COLLECTOR REGISTRATION
  // ============================================================================

  registerCollector(collectorId, config) {
    const collector = {
      id: collectorId,
      name: config.name,
      type: config.type, // prometheus, cloudwatch, datadog, etc.
      endpoint: config.endpoint,
      credentials: config.credentials,
      metrics: config.metrics || [],
      enabled: true,
      lastScrape: null,
      scrapeInterval: config.scrapeInterval || 60000,
      createdAt: new Date()
    };

    this.collectors.set(collectorId, collector);
    return collector;
  }

  getCollector(collectorId) {
    return this.collectors.get(collectorId);
  }

  listCollectors(filter = {}) {
    let collectors = Array.from(this.collectors.values());

    if (filter.type) {
      collectors = collectors.filter(c => c.type === filter.type);
    }

    if (filter.enabled !== undefined) {
      collectors = collectors.filter(c => c.enabled === filter.enabled);
    }

    return collectors;
  }

  // ============================================================================
  // DASHBOARD MANAGEMENT
  // ============================================================================

  createDashboard(dashboardId, config) {
    const dashboard = {
      id: dashboardId,
      name: config.name,
      description: config.description,
      panels: config.panels || [],
      layout: config.layout || 'grid',
      refreshInterval: config.refreshInterval || 30000,
      tags: config.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: config.createdBy
    };

    this.dashboards.set(dashboardId, dashboard);
    return dashboard;
  }

  addPanel(dashboardId, panelConfig) {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) throw new Error(`Dashboard ${dashboardId} not found`);

    const panel = {
      id: this.generateId('panel'),
      title: panelConfig.title,
      type: panelConfig.type, // graph, table, stat, heatmap, etc.
      metrics: panelConfig.metrics || [],
      queries: panelConfig.queries || [],
      options: panelConfig.options || {},
      position: panelConfig.position || { x: 0, y: 0, w: 4, h: 4 }
    };

    dashboard.panels.push(panel);
    dashboard.updatedAt = new Date();

    return panel;
  }

  getDashboard(dashboardId) {
    return this.dashboards.get(dashboardId);
  }

  listDashboards(filter = {}) {
    let dashboards = Array.from(this.dashboards.values());

    if (filter.tags) {
      dashboards = dashboards.filter(d =>
        filter.tags.every(t => d.tags.includes(t))
      );
    }

    return dashboards;
  }

  // ============================================================================
  // HEALTH CHECKS
  // ============================================================================

  registerHealthCheck(checkId, config) {
    const check = {
      id: checkId,
      name: config.name,
      endpoint: config.endpoint,
      method: config.method || 'GET',
      expectedStatus: config.expectedStatus || 200,
      timeout: config.timeout || 5000,
      interval: config.interval || 60000,
      enabled: true,
      lastCheck: null,
      status: 'unknown',
      consecutiveFailures: 0
    };

    return check;
  }

  performHealthCheck(check) {
    // Simulate health check
    const status = Math.random() > 0.1 ? 'healthy' : 'unhealthy';

    check.lastCheck = new Date();
    check.status = status;

    if (status === 'unhealthy') {
      check.consecutiveFailures++;
    } else {
      check.consecutiveFailures = 0;
    }

    return {
      checkId: check.id,
      status,
      responseTime: Math.random() * 500,
      timestamp: new Date(),
      consecutiveFailures: check.consecutiveFailures
    };
  }

  // ============================================================================
  // CUSTOM QUERIES
  // ============================================================================

  queryMetrics(query) {
    // Simple query language: "metric_name[5m] | mean"
    // Parse the query and execute

    const [metricPart, ...operations] = query.split('|').map(s => s.trim());
    const [metricId, timeWindow] = metricPart.includes('[')
      ? metricPart.split('[')
      : [metricPart, null];

    let timeSeries = this.getTimeSeries(metricId.trim());

    // Apply time window
    if (timeWindow) {
      const minutes = parseInt(timeWindow);
      const cutoff = Date.now() - minutes * 60 * 1000;
      timeSeries = timeSeries.filter(dp => dp.timestamp.getTime() > cutoff);
    }

    // Apply operations
    for (const op of operations) {
      if (op === 'mean') {
        const mean = timeSeries.length > 0
          ? timeSeries.reduce((sum, dp) => sum + dp.value, 0) / timeSeries.length
          : 0;
        return { result: mean, operation: op };
      } else if (op === 'sum') {
        const sum = timeSeries.reduce((sum, dp) => sum + dp.value, 0);
        return { result: sum, operation: op };
      } else if (op === 'max') {
        const max = timeSeries.length > 0
          ? Math.max(...timeSeries.map(dp => dp.value))
          : 0;
        return { result: max, operation: op };
      } else if (op === 'min') {
        const min = timeSeries.length > 0
          ? Math.min(...timeSeries.map(dp => dp.value))
          : 0;
        return { result: min, operation: op };
      }
    }

    return { result: timeSeries, operation: 'raw' };
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getMonitoringStats() {
    return {
      totalMetrics: this.metrics.size,
      totalDataPoints: Array.from(this.timeSeries.values()).reduce((sum, ts) => sum + ts.length, 0),
      totalCollectors: this.collectors.size,
      enabledCollectors: Array.from(this.collectors.values()).filter(c => c.enabled).length,
      totalDashboards: this.dashboards.size,
      averageDataPointsPerMetric: this.metrics.size > 0
        ? Array.from(this.timeSeries.values()).reduce((sum, ts) => sum + ts.length, 0) / this.metrics.size
        : 0
    };
  }

  exportMetrics(metricId, format = 'json') {
    const metric = this.metrics.get(metricId);
    const timeSeries = this.getTimeSeries(metricId);

    if (format === 'prometheus') {
      return this.toPrometheusFormat(metric, timeSeries);
    }

    return { metric, timeSeries };
  }

  toPrometheusFormat(metric, timeSeries) {
    let output = `# HELP ${metric.id} ${metric.description}\n`;
    output += `# TYPE ${metric.id} ${metric.type}\n`;

    for (const dp of timeSeries) {
      const labels = Object.entries(dp.tags)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      output += `${metric.id}{${labels}} ${dp.value} ${dp.timestamp.getTime()}\n`;
    }

    return output;
  }

  clearOldData() {
    const now = Date.now();

    for (const [metricId, metric] of this.metrics.entries()) {
      const cutoffTime = now - metric.retention;
      const timeSeries = this.timeSeries.get(metricId);

      this.timeSeries.set(metricId, timeSeries.filter(dp => dp.timestamp.getTime() > cutoffTime));
    }

    return { clearedAt: new Date() };
  }
}

module.exports = MonitoringEngine;
