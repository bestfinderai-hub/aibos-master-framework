/**
 * Alerting System
 * Alert rules, escalation policies, and notifications
 */

class AlertingSystem {
  constructor() {
    this.alertRules = new Map(); // ruleId -> rule definition
    this.alerts = []; // active alerts
    this.escalationPolicies = new Map(); // policyId -> policy
    this.notifications = []; // sent notifications
    this.silences = new Map(); // silenceId -> silence rule
  }

  // ============================================================================
  // ALERT RULE MANAGEMENT
  // ============================================================================

  createAlertRule(ruleId, config) {
    if (!config.name || !config.condition || !config.actions) {
      throw new Error('Must provide name, condition, and actions');
    }

    const rule = {
      id: ruleId,
      name: config.name,
      description: config.description,
      enabled: true,
      condition: config.condition, // { metric, operator, threshold }
      evaluationInterval: config.evaluationInterval || 60000, // 1 minute
      forDuration: config.forDuration || 0, // fire immediately by default
      severity: config.severity || 'warning', // critical, warning, info
      actions: config.actions || [], // list of actions to take
      escalationPolicy: config.escalationPolicy,
      labels: config.labels || {},
      annotations: config.annotations || {},
      createdAt: new Date(),
      lastEvaluation: null,
      firingCount: 0
    };

    this.alertRules.set(ruleId, rule);
    return rule;
  }

  getAlertRule(ruleId) {
    return this.alertRules.get(ruleId);
  }

  updateAlertRule(ruleId, updates) {
    const rule = this.alertRules.get(ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);

    Object.assign(rule, updates);
    return rule;
  }

  listAlertRules(filter = {}) {
    let rules = Array.from(this.alertRules.values());

    if (filter.enabled !== undefined) {
      rules = rules.filter(r => r.enabled === filter.enabled);
    }

    if (filter.severity) {
      rules = rules.filter(r => r.severity === filter.severity);
    }

    return rules;
  }

  // ============================================================================
  // ALERT EVALUATION & FIRING
  // ============================================================================

  evaluateRule(ruleId, currentValue) {
    const rule = this.alertRules.get(ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);

    if (!rule.enabled) return null;

    const { metric, operator, threshold } = rule.condition;
    let conditionMet = false;

    switch (operator) {
      case '>':
        conditionMet = currentValue > threshold;
        break;
      case '<':
        conditionMet = currentValue < threshold;
        break;
      case '>=':
        conditionMet = currentValue >= threshold;
        break;
      case '<=':
        conditionMet = currentValue <= threshold;
        break;
      case '==':
        conditionMet = currentValue === threshold;
        break;
      case '!=':
        conditionMet = currentValue !== threshold;
        break;
      default:
        conditionMet = false;
    }

    rule.lastEvaluation = new Date();

    if (conditionMet) {
      rule.firingCount++;

      // Check if alert should fire based on forDuration
      if (rule.forDuration === 0 || rule.firingCount * rule.evaluationInterval >= rule.forDuration) {
        return this.fireAlert(ruleId, currentValue);
      }
    } else {
      rule.firingCount = 0;
    }

    return null;
  }

  fireAlert(ruleId, value) {
    const rule = this.alertRules.get(ruleId);
    if (!rule) throw new Error(`Rule ${ruleId} not found`);

    const alert = {
      id: this.generateId('alert'),
      ruleId,
      ruleName: rule.name,
      severity: rule.severity,
      status: 'firing',
      triggeredValue: value,
      firedAt: new Date(),
      resolvedAt: null,
      labels: rule.labels,
      annotations: rule.annotations,
      actionsTaken: []
    };

    this.alerts.push(alert);

    // Execute actions
    if (rule.actions && rule.actions.length > 0) {
      for (const action of rule.actions) {
        this.executeAction(alert, action);
      }
    }

    // Apply escalation policy
    if (rule.escalationPolicy) {
      this.applyEscalation(alert, rule.escalationPolicy);
    }

    return alert;
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) throw new Error(`Alert ${alertId} not found`);

    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    return alert;
  }

  getAlert(alertId) {
    return this.alerts.find(a => a.id === alertId);
  }

  listAlerts(filter = {}) {
    let alerts = [...this.alerts];

    if (filter.status) {
      alerts = alerts.filter(a => a.status === filter.status);
    }

    if (filter.severity) {
      alerts = alerts.filter(a => a.severity === filter.severity);
    }

    if (filter.ruleId) {
      alerts = alerts.filter(a => a.ruleId === filter.ruleId);
    }

    return alerts.sort((a, b) => b.firedAt - a.firedAt);
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  executeAction(alert, action) {
    const result = {
      type: action.type,
      target: action.target,
      timestamp: new Date(),
      status: 'executed'
    };

    switch (action.type) {
      case 'notify':
        result.message = this.sendNotification(action.target, alert);
        break;

      case 'escalate':
        result.escalated = this.escalateAlert(alert, action.policy);
        break;

      case 'execute_webhook':
        result.webhook = this.triggerWebhook(action.url, alert);
        break;

      case 'create_incident':
        result.incident = this.createIncident(alert, action.metadata);
        break;

      case 'page_oncall':
        result.paged = this.pageOncall(alert, action.schedule);
        break;

      default:
        result.status = 'unknown';
    }

    alert.actionsTaken.push(result);
    return result;
  }

  sendNotification(target, alert) {
    const notification = {
      id: this.generateId('notif'),
      type: target.type, // email, slack, pagerduty, sms
      recipient: target.recipient,
      alert: alert.id,
      message: this.formatAlertMessage(alert),
      timestamp: new Date(),
      delivered: true,
      deliveredAt: new Date()
    };

    this.notifications.push(notification);
    return notification;
  }

  formatAlertMessage(alert) {
    return `
Alert: ${alert.ruleName}
Severity: ${alert.severity}
Status: ${alert.status}
Value: ${alert.triggeredValue}
Fired: ${alert.firedAt.toISOString()}
    `;
  }

  triggerWebhook(url, alert) {
    return {
      url,
      method: 'POST',
      payload: alert,
      status: 'sent',
      timestamp: new Date()
    };
  }

  createIncident(alert, metadata) {
    return {
      id: this.generateId('incident'),
      alertId: alert.id,
      title: `${alert.severity.toUpperCase()}: ${alert.ruleName}`,
      description: this.formatAlertMessage(alert),
      severity: alert.severity,
      status: 'open',
      metadata: metadata || {},
      createdAt: new Date()
    };
  }

  pageOncall(alert, schedule) {
    return {
      schedule,
      alert: alert.id,
      timestamp: new Date(),
      status: 'paged'
    };
  }

  // ============================================================================
  // ESCALATION POLICIES
  // ============================================================================

  createEscalationPolicy(policyId, config) {
    const policy = {
      id: policyId,
      name: config.name,
      escalationRules: config.escalationRules || [],
      repeatEscalation: config.repeatEscalation !== false,
      createdAt: new Date()
    };

    this.escalationPolicies.set(policyId, policy);
    return policy;
  }

  applyEscalation(alert, policyId) {
    const policy = this.escalationPolicies.get(policyId);
    if (!policy) return null;

    const escalation = {
      alertId: alert.id,
      policyId,
      rules: policy.escalationRules,
      appliedAt: new Date(),
      status: 'applied'
    };

    return escalation;
  }

  getEscalationPolicy(policyId) {
    return this.escalationPolicies.get(policyId);
  }

  // ============================================================================
  // SILENCES (Muting Alerts)
  // ============================================================================

  createSilence(silenceId, config) {
    const silence = {
      id: silenceId,
      matchers: config.matchers || [], // label matchers for which alerts to silence
      startsAt: config.startsAt || new Date(),
      endsAt: config.endsAt,
      reason: config.reason,
      createdBy: config.createdBy,
      createdAt: new Date()
    };

    this.silences.set(silenceId, silence);
    return silence;
  }

  isSilenced(alert) {
    const now = new Date();

    for (const [, silence] of this.silences.entries()) {
      // Check if silence is active
      if (now < silence.startsAt || (silence.endsAt && now > silence.endsAt)) {
        continue;
      }

      // Check if alert matches silence matchers
      const matches = silence.matchers.every(matcher =>
        this.matchesLabel(alert.labels, matcher)
      );

      if (matches) {
        return true;
      }
    }

    return false;
  }

  matchesLabel(labels, matcher) {
    const value = labels[matcher.name];

    switch (matcher.type) {
      case '=':
        return value === matcher.value;
      case '!=':
        return value !== matcher.value;
      case '=~':
        return new RegExp(matcher.value).test(value);
      case '!~':
        return !new RegExp(matcher.value).test(value);
      default:
        return false;
    }
  }

  removeSilence(silenceId) {
    return this.silences.delete(silenceId);
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getAlertStats() {
    const firingAlerts = this.alerts.filter(a => a.status === 'firing');
    const resolvedAlerts = this.alerts.filter(a => a.status === 'resolved');

    const bySeverity = {};
    for (const alert of firingAlerts) {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    }

    return {
      total: this.alerts.length,
      firing: firingAlerts.length,
      resolved: resolvedAlerts.length,
      bySeverity,
      alertRules: this.alertRules.size,
      enabledRules: Array.from(this.alertRules.values()).filter(r => r.enabled).length,
      notificationsSent: this.notifications.length,
      silences: this.silences.size
    };
  }

  getMostRecentAlerts(limit = 10) {
    return this.alerts.sort((a, b) => b.firedAt - a.firedAt).slice(0, limit);
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  exportAlerts(filter = {}) {
    const alerts = this.listAlerts(filter);

    return {
      alerts,
      exportedAt: new Date(),
      count: alerts.length
    };
  }

  importAlertRules(rules) {
    for (const rule of rules) {
      this.createAlertRule(rule.id, rule);
    }

    return { imported: rules.length };
  }
}

module.exports = AlertingSystem;
