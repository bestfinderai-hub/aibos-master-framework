/**
 * Anomaly Detector
 * Detect unusual patterns in metrics using statistical methods
 */

class AnomalyDetector {
  constructor() {
    this.detectors = new Map(); // detectorId -> detector config
    this.anomalies = []; // detected anomalies
    this.baselines = new Map(); // metricId -> baseline stats
  }

  // ============================================================================
  // DETECTOR CONFIGURATION
  // ============================================================================

  createDetector(detectorId, config) {
    const detector = {
      id: detectorId,
      name: config.name,
      metricId: config.metricId,
      method: config.method || 'zscore', // zscore, iqr, isolation_forest, prophet
      sensitivity: config.sensitivity || 2, // std devs or IQR multiplier
      minDataPoints: config.minDataPoints || 10,
      windowSize: config.windowSize || 300000, // 5 minutes default
      enabled: true,
      createdAt: new Date(),
      lastUpdate: null
    };

    this.detectors.set(detectorId, detector);
    return detector;
  }

  getDetector(detectorId) {
    return this.detectors.get(detectorId);
  }

  listDetectors(filter = {}) {
    let detectors = Array.from(this.detectors.values());

    if (filter.enabled !== undefined) {
      detectors = detectors.filter(d => d.enabled === filter.enabled);
    }

    if (filter.method) {
      detectors = detectors.filter(d => d.method === filter.method);
    }

    return detectors;
  }

  // ============================================================================
  // BASELINE CALCULATION
  // ============================================================================

  calculateBaseline(metricId, timeSeries) {
    const values = timeSeries.map(dp => dp.value);

    if (values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = this.calculateStdDev(values, mean);

    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);

    const baseline = {
      metricId,
      mean,
      stdDev,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      q1: sorted[q1Index],
      q3: sorted[q3Index],
      iqr: sorted[q3Index] - sorted[q1Index],
      sampleSize: values.length,
      calculatedAt: new Date()
    };

    this.baselines.set(metricId, baseline);
    return baseline;
  }

  calculateStdDev(values, mean) {
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  getBaseline(metricId) {
    return this.baselines.get(metricId);
  }

  // ============================================================================
  // ANOMALY DETECTION
  // ============================================================================

  detectAnomaly(detectorId, value, timeSeries) {
    const detector = this.detectors.get(detectorId);
    if (!detector) throw new Error(`Detector ${detectorId} not found`);

    if (!detector.enabled) return null;

    // Use appropriate detection method
    switch (detector.method) {
      case 'zscore':
        return this.detectZScoreAnomaly(detectorId, value, timeSeries);
      case 'iqr':
        return this.detectIQRAnomaly(detectorId, value, timeSeries);
      case 'isolation_forest':
        return this.detectIsolationForestAnomaly(detectorId, value, timeSeries);
      default:
        return null;
    }
  }

  detectZScoreAnomaly(detectorId, value, timeSeries) {
    const detector = this.detectors.get(detectorId);
    const baseline = this.getBaseline(detector.metricId);

    if (!baseline || baseline.stdDev === 0) {
      return null;
    }

    const zScore = Math.abs((value - baseline.mean) / baseline.stdDev);
    const isAnomaly = zScore > detector.sensitivity;

    if (isAnomaly) {
      return this.recordAnomaly(detectorId, value, 'zscore', {
        zScore,
        baseline: baseline.mean,
        threshold: detector.sensitivity
      });
    }

    return null;
  }

  detectIQRAnomaly(detectorId, value, timeSeries) {
    const detector = this.detectors.get(detectorId);
    const baseline = this.getBaseline(detector.metricId);

    if (!baseline) return null;

    const lowerBound = baseline.q1 - detector.sensitivity * baseline.iqr;
    const upperBound = baseline.q3 + detector.sensitivity * baseline.iqr;
    const isAnomaly = value < lowerBound || value > upperBound;

    if (isAnomaly) {
      return this.recordAnomaly(detectorId, value, 'iqr', {
        lowerBound,
        upperBound,
        iqrMultiplier: detector.sensitivity
      });
    }

    return null;
  }

  detectIsolationForestAnomaly(detectorId, value, timeSeries) {
    // Simplified isolation forest - in production use proper implementation
    const detector = this.detectors.get(detectorId);
    const baseline = this.getBaseline(detector.metricId);

    if (!baseline || timeSeries.length < detector.minDataPoints) {
      return null;
    }

    // Anomaly score based on distance from recent values
    const recentValues = timeSeries.slice(-10).map(dp => dp.value);
    const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const deviation = Math.abs(value - avgRecent) / Math.max(baseline.stdDev, 1);

    const isAnomaly = deviation > detector.sensitivity;

    if (isAnomaly) {
      return this.recordAnomaly(detectorId, value, 'isolation_forest', {
        anomalyScore: deviation,
        recentAverage: avgRecent
      });
    }

    return null;
  }

  recordAnomaly(detectorId, value, method, details) {
    const anomaly = {
      id: this.generateId('anomaly'),
      detectorId,
      value,
      method,
      details,
      severity: this.calculateAnomalySeverity(details),
      detectedAt: new Date(),
      acknowledged: false,
      resolvedAt: null
    };

    this.anomalies.push(anomaly);
    return anomaly;
  }

  calculateAnomalySeverity(details) {
    // Calculate severity based on anomaly details
    if (details.zScore > 5) return 'critical';
    if (details.zScore > 3) return 'high';
    if (details.anomalyScore > 3) return 'high';
    return 'medium';
  }

  acknowledgeAnomaly(anomalyId) {
    const anomaly = this.anomalies.find(a => a.id === anomalyId);
    if (!anomaly) throw new Error(`Anomaly ${anomalyId} not found`);

    anomaly.acknowledged = true;
    return anomaly;
  }

  resolveAnomaly(anomalyId) {
    const anomaly = this.anomalies.find(a => a.id === anomalyId);
    if (!anomaly) throw new Error(`Anomaly ${anomalyId} not found`);

    anomaly.resolvedAt = new Date();
    return anomaly;
  }

  getAnomaly(anomalyId) {
    return this.anomalies.find(a => a.id === anomalyId);
  }

  listAnomalies(filter = {}) {
    let anomalies = [...this.anomalies];

    if (filter.severity) {
      anomalies = anomalies.filter(a => a.severity === filter.severity);
    }

    if (filter.acknowledged !== undefined) {
      anomalies = anomalies.filter(a => a.acknowledged === filter.acknowledged);
    }

    if (filter.resolved !== undefined) {
      const resolved = filter.resolved;
      anomalies = anomalies.filter(a => (a.resolvedAt !== null) === resolved);
    }

    if (filter.detectorId) {
      anomalies = anomalies.filter(a => a.detectorId === filter.detectorId);
    }

    return anomalies.sort((a, b) => b.detectedAt - a.detectedAt);
  }

  // ============================================================================
  // TREND ANALYSIS
  // ============================================================================

  analyzeTrend(timeSeries, windowSize = 10) {
    if (timeSeries.length < windowSize) {
      return null;
    }

    const recentValues = timeSeries.slice(-windowSize).map(dp => dp.value);
    const olderValues = timeSeries.slice(-windowSize * 2, -windowSize).map(dp => dp.value);

    const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const olderMean = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;

    const trend = recentMean > olderMean ? 'increasing' : recentMean < olderMean ? 'decreasing' : 'stable';
    const percentChange = ((recentMean - olderMean) / Math.abs(olderMean || 1)) * 100;

    return {
      trend,
      percentChange,
      recentMean,
      olderMean,
      velocity: (recentMean - olderMean) / windowSize
    };
  }

  predictNextValue(timeSeries, method = 'linear') {
    if (timeSeries.length < 2) return null;

    const values = timeSeries.map(dp => dp.value);

    if (method === 'linear') {
      // Simple linear regression
      const n = values.length;
      const x = Array.from({ length: n }, (_, i) => i);
      const xMean = x.reduce((a, b) => a + b) / n;
      const yMean = values.reduce((a, b) => a + b) / n;

      const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (values[i] - yMean), 0);
      const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);

      const slope = numerator / denominator;
      const intercept = yMean - slope * xMean;

      const nextValue = slope * n + intercept;

      return { nextValue, slope, confidence: 0.7 };
    }

    // Default to simple average
    return {
      nextValue: values.reduce((a, b) => a + b) / values.length,
      method: 'average',
      confidence: 0.5
    };
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getAnomalyStats() {
    const unresolved = this.anomalies.filter(a => !a.resolvedAt);
    const unacknowledged = this.anomalies.filter(a => !a.acknowledged);

    const bySeverity = {};
    for (const anomaly of this.anomalies) {
      bySeverity[anomaly.severity] = (bySeverity[anomaly.severity] || 0) + 1;
    }

    return {
      total: this.anomalies.length,
      unresolved: unresolved.length,
      unacknowledged: unacknowledged.length,
      bySeverity,
      detectors: this.detectors.size,
      enabledDetectors: Array.from(this.detectors.values()).filter(d => d.enabled).length,
      baselines: this.baselines.size
    };
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  exportAnomalies(filter = {}) {
    const anomalies = this.listAnomalies(filter);

    return {
      anomalies,
      exportedAt: new Date(),
      count: anomalies.length
    };
  }
}

module.exports = AnomalyDetector;
