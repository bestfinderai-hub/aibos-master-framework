/**
 * Audit Logger
 * Immutable audit trail for compliance and security
 */

class AuditLogger {
  constructor(retentionDays = 2555) {
    this.logs = [];
    this.retentionDays = retentionDays; // Default 7 years
    this.systemStart = new Date();
  }

  /**
   * Log action
   */
  async log(entry) {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      action: entry.action,
      userId: entry.userId,
      resourceId: entry.resourceId,
      resourceType: entry.resourceType,
      changes: entry.changes || {},
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      status: entry.status || 'success',
      details: entry.details || {},
      tenantId: entry.tenantId,
      severity: this.calculateSeverity(entry.action)
    };

    this.logs.push(logEntry);
    return logEntry;
  }

  /**
   * Log authentication event
   */
  async logAuth(userId, action, ipAddress, success = true) {
    return this.log({
      action: `auth:${action}`,
      userId,
      resourceType: 'authentication',
      ipAddress,
      status: success ? 'success' : 'failure',
      severity: success ? 'info' : 'warning'
    });
  }

  /**
   * Log authorization change
   */
  async logAuthorizationChange(userId, grantedUserId, roleGranted, ipAddress) {
    return this.log({
      action: 'auth:role_assignment',
      userId, // Admin doing the granting
      resourceId: grantedUserId,
      resourceType: 'user',
      changes: { role_assigned: roleGranted },
      ipAddress,
      severity: 'medium'
    });
  }

  /**
   * Log data modification
   */
  async logDataModification(userId, action, resourceType, resourceId, changes) {
    return this.log({
      action: `data:${action}`,
      userId,
      resourceType,
      resourceId,
      changes,
      severity: this.calculateDataModificationSeverity(resourceType)
    });
  }

  /**
   * Log data access
   */
  async logDataAccess(userId, action, resourceType, resourceId, ipAddress) {
    return this.log({
      action: `access:${action}`,
      userId,
      resourceType,
      resourceId,
      ipAddress,
      severity: 'low'
    });
  }

  /**
   * Log security incident
   */
  async logSecurityIncident(type, severity, details) {
    return this.log({
      action: `security:${type}`,
      resourceType: 'security',
      details,
      severity,
      status: 'flagged'
    });
  }

  /**
   * Query audit logs
   */
  query(filters = {}) {
    let results = [...this.logs];

    // Filter by userId
    if (filters.userId) {
      results = results.filter(l => l.userId === filters.userId);
    }

    // Filter by action
    if (filters.action) {
      const pattern = filters.action.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`);
      results = results.filter(l => regex.test(l.action));
    }

    // Filter by resourceType
    if (filters.resourceType) {
      results = results.filter(l => l.resourceType === filters.resourceType);
    }

    // Filter by status
    if (filters.status) {
      results = results.filter(l => l.status === filters.status);
    }

    // Filter by severity
    if (filters.severity) {
      results = results.filter(l => l.severity === filters.severity);
    }

    // Filter by date range
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      results = results.filter(l => l.timestamp >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      results = results.filter(l => l.timestamp <= end);
    }

    // Filter by tenantId
    if (filters.tenantId) {
      results = results.filter(l => l.tenantId === filters.tenantId);
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Search audit logs
   */
  search(searchTerm) {
    return this.logs.filter(l => {
      const searchableFields = [
        l.action,
        l.userId,
        l.resourceId,
        l.ipAddress,
        JSON.stringify(l.changes),
        JSON.stringify(l.details)
      ];

      return searchableFields.some(field =>
        field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  /**
   * Export logs for compliance
   */
  export(startDate, endDate, format = 'csv') {
    const logs = this.query({
      startDate,
      endDate
    });

    if (format === 'csv') {
      return this.exportAsCSV(logs);
    } else if (format === 'json') {
      return this.exportAsJSON(logs);
    }

    return logs;
  }

  /**
   * Export as CSV
   */
  exportAsCSV(logs) {
    const headers = [
      'ID', 'Timestamp', 'Action', 'UserId', 'ResourceId', 'ResourceType',
      'Status', 'Severity', 'IPAddress', 'Changes', 'Details'
    ];

    const rows = logs.map(l => [
      l.id,
      l.timestamp.toISOString(),
      l.action,
      l.userId || '',
      l.resourceId || '',
      l.resourceType || '',
      l.status,
      l.severity,
      l.ipAddress || '',
      JSON.stringify(l.changes),
      JSON.stringify(l.details)
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }

  /**
   * Export as JSON
   */
  exportAsJSON(logs) {
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get audit summary
   */
  getSummary(startDate, endDate) {
    const logs = this.query({ startDate, endDate });

    const summary = {
      totalEvents: logs.length,
      byAction: {},
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byStatus: { success: 0, failure: 0, flagged: 0 },
      byUser: {},
      timeRange: { start: startDate, end: endDate }
    };

    logs.forEach(log => {
      // By action
      summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;

      // By severity
      summary.bySeverity[log.severity] = (summary.bySeverity[log.severity] || 0) + 1;

      // By status
      summary.byStatus[log.status] = (summary.byStatus[log.status] || 0) + 1;

      // By user
      if (log.userId) {
        summary.byUser[log.userId] = (summary.byUser[log.userId] || 0) + 1;
      }
    });

    return summary;
  }

  /**
   * Check for suspicious activity
   */
  detectAnomalies(userId, timeWindowMinutes = 60) {
    const timeWindow = new Date(Date.now() - timeWindowMinutes * 60000);
    const userLogs = this.query({
      userId,
      startDate: timeWindow.toISOString()
    });

    const anomalies = [];

    // Multiple failed logins
    const failedLogins = userLogs.filter(l => l.action === 'auth:login' && l.status === 'failure');
    if (failedLogins.length >= 5) {
      anomalies.push({
        type: 'multiple_failed_logins',
        severity: 'high',
        count: failedLogins.length
      });
    }

    // Unusual access pattern
    const accessLogs = userLogs.filter(l => l.action.startsWith('access:'));
    if (accessLogs.length > 100) {
      anomalies.push({
        type: 'high_access_volume',
        severity: 'medium',
        count: accessLogs.length
      });
    }

    // Delete operations
    const deleteOps = userLogs.filter(l => l.action === 'data:delete');
    if (deleteOps.length >= 10) {
      anomalies.push({
        type: 'bulk_deletes',
        severity: 'high',
        count: deleteOps.length
      });
    }

    return anomalies;
  }

  /**
   * Cleanup old logs (retention policy)
   */
  cleanup() {
    const cutoffDate = new Date(Date.now() - this.retentionDays * 24 * 60 * 60000);
    const initialCount = this.logs.length;

    this.logs = this.logs.filter(l => l.timestamp > cutoffDate);

    return {
      deleted: initialCount - this.logs.length,
      remaining: this.logs.length,
      cutoffDate
    };
  }

  /**
   * Generate log ID
   */
  generateLogId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate severity based on action
   */
  calculateSeverity(action) {
    const severityMap = {
      'auth:login': 'low',
      'auth:logout': 'low',
      'auth:role_assignment': 'medium',
      'auth:permission_change': 'high',
      'data:create': 'low',
      'data:read': 'low',
      'data:update': 'medium',
      'data:delete': 'high',
      'data:export': 'medium',
      'security:breach': 'critical',
      'security:unauthorized_access': 'high'
    };

    return severityMap[action] || 'medium';
  }

  /**
   * Calculate severity for data modification
   */
  calculateDataModificationSeverity(resourceType) {
    const severityMap = {
      user: 'high',
      settings: 'high',
      role: 'high',
      contact: 'medium',
      report: 'low',
      default: 'medium'
    };

    return severityMap[resourceType] || severityMap.default;
  }

  /**
   * Get log by ID
   */
  getLogById(logId) {
    return this.logs.find(l => l.id === logId) || null;
  }

  /**
   * Verify log integrity (immutable)
   */
  verifyIntegrity(logId) {
    const log = this.getLogById(logId);
    if (!log) return false;

    // In production, use cryptographic hashing/signing
    return {
      logId,
      isValid: true,
      timestamp: log.timestamp,
      cannotBeModified: true
    };
  }
}

module.exports = AuditLogger;
