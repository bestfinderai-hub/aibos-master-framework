/**
 * Milestone Tracker
 * Milestone progress tracking, deadline management, blocker detection
 */

class MilestoneTracker {
  constructor() {
    this.trackers = new Map(); // trackerId -> tracker
    this.updates = []; // list of milestone updates
  }

  // ============================================================================
  // MILESTONE TRACKER SETUP
  // ============================================================================

  createTracker(trackerId, config) {
    const tracker = {
      id: trackerId,
      roadmapId: config.roadmapId,
      name: config.name,
      milestones: config.milestones || [],
      startDate: config.startDate || new Date(),
      createdAt: new Date(),
      status: 'active'
    };

    this.trackers.set(trackerId, tracker);
    return tracker;
  }

  getTracker(trackerId) {
    return this.trackers.get(trackerId);
  }

  // ============================================================================
  // MILESTONE UPDATES
  // ============================================================================

  recordMilestoneUpdate(trackerId, milestoneId, config) {
    const tracker = this.trackers.get(trackerId);
    if (!tracker) throw new Error(`Tracker ${trackerId} not found`);

    const update = {
      id: this.generateId('update'),
      trackerId,
      milestoneId,
      status: config.status, // on_track, at_risk, delayed, complete
      completion: config.completion || 0, // 0-100
      completionDate: config.completionDate || null,
      notes: config.notes || '',
      blockers: config.blockers || [],
      dependencies: config.dependencies || [],
      owner: config.owner,
      updatedAt: new Date()
    };

    this.updates.push(update);
    return update;
  }

  getMilestoneUpdates(trackerId, milestoneId) {
    return this.updates.filter(u => u.trackerId === trackerId && u.milestoneId === milestoneId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getLatestUpdate(trackerId, milestoneId) {
    const updates = this.getMilestoneUpdates(trackerId, milestoneId);
    return updates.length > 0 ? updates[0] : null;
  }

  // ============================================================================
  // MILESTONE HEALTH
  // ============================================================================

  calculateMilestoneHealth(trackerId, milestoneId) {
    const latestUpdate = this.getLatestUpdate(trackerId, milestoneId);
    if (!latestUpdate) return null;

    const healthScore = this.calculateHealthScore(latestUpdate);

    return {
      milestoneId,
      status: latestUpdate.status,
      completion: latestUpdate.completion,
      health: healthScore,
      healthStatus: this.getHealthStatus(healthScore),
      blockers: latestUpdate.blockers,
      daysOverdue: latestUpdate.status === 'delayed' ? this.calculateDaysOverdue(latestUpdate.completionDate) : 0,
      owner: latestUpdate.owner,
      lastUpdate: latestUpdate.updatedAt
    };
  }

  calculateHealthScore(update) {
    // Health score based on status and completion
    let score = 100;

    if (update.status === 'complete') {
      return 100;
    }

    if (update.status === 'on_track') {
      score = 50 + (update.completion / 2);
    } else if (update.status === 'at_risk') {
      score = 30 + (update.completion / 3);
    } else if (update.status === 'delayed') {
      score = Math.max(10, 20 + (update.completion / 5));
    }

    // Penalty for blockers
    if (update.blockers && update.blockers.length > 0) {
      score -= update.blockers.length * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  getHealthStatus(score) {
    if (score >= 75) return 'healthy';
    if (score >= 50) return 'at_risk';
    if (score >= 25) return 'critical';
    return 'blocked';
  }

  calculateDaysOverdue(targetDate) {
    if (!targetDate) return 0;
    return Math.max(0, Math.floor((Date.now() - targetDate) / (1000 * 60 * 60 * 24)));
  }

  // ============================================================================
  // ROADMAP HEALTH
  // ============================================================================

  calculateRoadmapHealth(trackerId) {
    const tracker = this.trackers.get(trackerId);
    if (!tracker) return null;

    const milestoneHealths = tracker.milestones.map(mid => this.calculateMilestoneHealth(trackerId, mid))
      .filter(h => h !== null);

    if (milestoneHealths.length === 0) return null;

    const averageHealth = milestoneHealths.reduce((sum, h) => sum + (h.health || 0), 0) / milestoneHealths.length;
    const totalCompletion = milestoneHealths.reduce((sum, h) => sum + h.completion, 0) / milestoneHealths.length;

    const blocked = milestoneHealths.filter(h => h.healthStatus === 'blocked').length;
    const critical = milestoneHealths.filter(h => h.healthStatus === 'critical').length;
    const atRisk = milestoneHealths.filter(h => h.healthStatus === 'at_risk').length;
    const healthy = milestoneHealths.filter(h => h.healthStatus === 'healthy').length;

    return {
      trackerId,
      overallHealth: Math.round(averageHealth),
      healthStatus: this.getHealthStatus(averageHealth),
      totalCompletion: Math.round(totalCompletion),
      milestoneCounts: {
        healthy,
        atRisk,
        critical,
        blocked,
        total: milestoneHealths.length
      },
      milestones: milestoneHealths,
      statusMessage: this.generateStatusMessage(healthy, atRisk, critical, blocked, milestoneHealths.length)
    };
  }

  scoreToNumeric(healthStatus) {
    const scores = {
      healthy: 100,
      at_risk: 60,
      critical: 30,
      blocked: 10
    };
    return scores[healthStatus] || 0;
  }

  generateStatusMessage(healthy, atRisk, critical, blocked, total) {
    const percentages = {
      healthy: Math.round((healthy / total) * 100),
      atRisk: Math.round((atRisk / total) * 100),
      critical: Math.round((critical / total) * 100),
      blocked: Math.round((blocked / total) * 100)
    };

    if (blocked > 0) {
      return `🔴 CRITICAL: ${blocked} milestones blocked, ${critical} critical, ${atRisk} at risk`;
    }

    if (critical > 0) {
      return `🟠 AT RISK: ${critical} milestones critical, ${atRisk} at risk, ${healthy} healthy`;
    }

    if (atRisk > 0) {
      return `🟡 MONITOR: ${atRisk} milestones at risk, ${healthy} healthy`;
    }

    return `🟢 ON TRACK: All ${total} milestones healthy`;
  }

  // ============================================================================
  // BLOCKER MANAGEMENT
  // ============================================================================

  getBlockers(trackerId) {
    const blockers = [];

    for (const update of this.updates) {
      if (update.trackerId === trackerId && update.blockers && update.blockers.length > 0) {
        for (const blocker of update.blockers) {
          blockers.push({
            milestoneId: update.milestoneId,
            blocker,
            foundAt: update.updatedAt,
            severity: blocker.severity || 'medium'
          });
        }
      }
    }

    return blockers.sort((a, b) => b.foundAt - a.foundAt);
  }

  getCriticalBlockers(trackerId) {
    return this.getBlockers(trackerId).filter(b => b.severity === 'critical' || b.severity === 'high');
  }

  // ============================================================================
  // TREND ANALYSIS
  // ============================================================================

  getMilestoneCompletionTrend(trackerId, milestoneId, days = 14) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const updates = this.getMilestoneUpdates(trackerId, milestoneId)
      .filter(u => u.updatedAt >= cutoffDate)
      .sort((a, b) => a.updatedAt - b.updatedAt);

    if (updates.length < 2) return null;

    const trend = {
      milestoneId,
      days,
      updates: updates.map(u => ({
        date: u.updatedAt,
        completion: u.completion
      })),
      startCompletion: updates[0].completion,
      endCompletion: updates[updates.length - 1].completion,
      trend: this.calculateCompletionTrend(updates),
      dailyRate: (updates[updates.length - 1].completion - updates[0].completion) / updates.length
    };

    return trend;
  }

  calculateCompletionTrend(updates) {
    if (updates.length < 2) return 'unknown';

    const first = updates[0].completion;
    const last = updates[updates.length - 1].completion;
    const diff = last - first;

    if (diff > 10) return 'accelerating';
    if (diff > 0) return 'progressing';
    if (diff === 0) return 'stalled';
    return 'regressing';
  }

  // ============================================================================
  // REPORTING
  // ============================================================================

  generateTrackerReport(trackerId) {
    const tracker = this.trackers.get(trackerId);
    if (!tracker) throw new Error(`Tracker ${trackerId} not found`);

    const health = this.calculateRoadmapHealth(trackerId);
    const blockers = this.getCriticalBlockers(trackerId);

    return {
      trackerId,
      name: tracker.name,
      status: tracker.status,
      health,
      criticalBlockers: blockers,
      actionItems: this.generateActionItems(health, blockers),
      generatedAt: new Date()
    };
  }

  generateActionItems(health, blockers) {
    const items = [];

    if (blockers.length > 0) {
      items.push({
        priority: 'critical',
        description: `Address ${blockers.length} critical blockers immediately`,
        action: 'Schedule unblock meeting with owners'
      });
    }

    if (health && health.milestoneCounts.critical > 0) {
      items.push({
        priority: 'high',
        description: `${health.milestoneCounts.critical} milestones in critical status`,
        action: 'Review scope and resource allocation'
      });
    }

    if (health && health.milestoneCounts.atRisk > 0) {
      items.push({
        priority: 'medium',
        description: `${health.milestoneCounts.atRisk} milestones at risk`,
        action: 'Implement mitigation strategies'
      });
    }

    return items;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = MilestoneTracker;
