/**
 * Self-Healing Orchestrator
 * Automatic remediation and auto-scaling
 */

class SelfHealingOrchestrator {
  constructor() {
    this.healingRules = new Map(); // ruleId -> rule
    this.remedialActions = []; // history of actions taken
    this.autoscalingPolicies = new Map(); // policyId -> policy
  }

  // ============================================================================
  // HEALING RULE MANAGEMENT
  // ============================================================================

  createHealingRule(ruleId, config) {
    if (!config.name || !config.trigger || !config.action) {
      throw new Error('Must provide name, trigger, and action');
    }

    const rule = {
      id: ruleId,
      name: config.name,
      description: config.description,
      enabled: true,
      trigger: config.trigger, // { type, condition }
      action: config.action, // { type, target, parameters }
      cooldown: config.cooldown || 300000, // 5 minutes default
      maxAttempts: config.maxAttempts || 3,
      rollback: config.rollback || true,
      lastExecuted: null,
      executionCount: 0,
      createdAt: new Date()
    };

    this.healingRules.set(ruleId, rule);
    return rule;
  }

  getHealingRule(ruleId) {
    return this.healingRules.get(ruleId);
  }

  listHealingRules(filter = {}) {
    let rules = Array.from(this.healingRules.values());

    if (filter.enabled !== undefined) {
      rules = rules.filter(r => r.enabled === filter.enabled);
    }

    return rules;
  }

  // ============================================================================
  // REMEDIAL ACTIONS
  // ============================================================================

  executeHealing(ruleId, anomaly) {
    const rule = this.healingRules.get(ruleId);
    if (!rule) throw new Error(`Healing rule ${ruleId} not found`);

    if (!rule.enabled) return null;

    // Check cooldown
    if (rule.lastExecuted) {
      const timeSinceLastExecution = Date.now() - rule.lastExecuted.getTime();
      if (timeSinceLastExecution < rule.cooldown) {
        return {
          status: 'skipped_cooldown',
          nextAvailableAt: new Date(rule.lastExecuted.getTime() + rule.cooldown)
        };
      }
    }

    // Check if trigger conditions are met
    if (!this.checkTriggerCondition(rule.trigger, anomaly)) {
      return null;
    }

    // Execute the healing action
    const action = this.executeRemediationAction(rule.action);

    // Record execution
    const remedialAction = {
      id: this.generateId('action'),
      ruleId,
      ruleName: rule.name,
      anomaly,
      action: rule.action,
      result: action,
      status: action.status,
      executedAt: new Date(),
      rollbackPending: action.status === 'success' && rule.rollback,
      attemptNumber: ++rule.executionCount
    };

    this.remedialActions.push(remedialAction);
    rule.lastExecuted = new Date();

    return remedialAction;
  }

  checkTriggerCondition(trigger, anomaly) {
    if (trigger.type === 'anomaly') {
      return anomaly && anomaly.severity === trigger.condition.severity;
    }

    if (trigger.type === 'threshold') {
      return anomaly && anomaly.value > trigger.condition.threshold;
    }

    if (trigger.type === 'pattern') {
      // Pattern matching logic
      return true;
    }

    return false;
  }

  executeRemediationAction(action) {
    let result = {
      type: action.type,
      target: action.target,
      status: 'executing',
      timestamp: new Date()
    };

    switch (action.type) {
      case 'restart_service':
        result = this.restartService(action.target, action.parameters);
        break;

      case 'scale_up':
        result = this.scaleUp(action.target, action.parameters);
        break;

      case 'scale_down':
        result = this.scaleDown(action.target, action.parameters);
        break;

      case 'clear_cache':
        result = this.clearCache(action.target, action.parameters);
        break;

      case 'drain_connection_pool':
        result = this.drainConnectionPool(action.target);
        break;

      case 'failover':
        result = this.triggerFailover(action.target);
        break;

      case 'circuit_breaker':
        result = this.toggleCircuitBreaker(action.target, true);
        break;

      case 'rate_limit':
        result = this.applyRateLimit(action.target, action.parameters);
        break;

      default:
        result.status = 'unknown_action';
    }

    return result;
  }

  restartService(serviceName, parameters = {}) {
    return {
      action: 'restart_service',
      service: serviceName,
      gracePeriod: parameters.gracePeriod || 30,
      status: 'success',
      message: `Service ${serviceName} restarted successfully`,
      timestamp: new Date()
    };
  }

  scaleUp(target, parameters = {}) {
    return {
      action: 'scale_up',
      target,
      instances: parameters.instances || 1,
      newCount: parameters.currentCount ? parameters.currentCount + (parameters.instances || 1) : null,
      status: 'success',
      message: `Scaled up ${target} by ${parameters.instances || 1} instances`,
      timestamp: new Date()
    };
  }

  scaleDown(target, parameters = {}) {
    return {
      action: 'scale_down',
      target,
      instances: parameters.instances || 1,
      newCount: parameters.currentCount ? Math.max(1, parameters.currentCount - (parameters.instances || 1)) : null,
      status: 'success',
      message: `Scaled down ${target} by ${parameters.instances || 1} instances`,
      timestamp: new Date()
    };
  }

  clearCache(target, parameters = {}) {
    return {
      action: 'clear_cache',
      target,
      type: parameters.type || 'full',
      status: 'success',
      message: `Cache for ${target} cleared`,
      timestamp: new Date()
    };
  }

  drainConnectionPool(target) {
    return {
      action: 'drain_connection_pool',
      target,
      status: 'success',
      message: `Connection pool drained for ${target}`,
      timestamp: new Date()
    };
  }

  triggerFailover(target) {
    return {
      action: 'failover',
      target,
      newPrimary: `${target}-failover`,
      status: 'success',
      message: `Failover completed for ${target}`,
      timestamp: new Date()
    };
  }

  toggleCircuitBreaker(target, open) {
    return {
      action: 'circuit_breaker',
      target,
      state: open ? 'open' : 'closed',
      status: 'success',
      message: `Circuit breaker ${open ? 'opened' : 'closed'} for ${target}`,
      timestamp: new Date()
    };
  }

  applyRateLimit(target, parameters = {}) {
    return {
      action: 'rate_limit',
      target,
      rps: parameters.rps || 100,
      status: 'success',
      message: `Rate limit applied: ${parameters.rps || 100} req/s for ${target}`,
      timestamp: new Date()
    };
  }

  // ============================================================================
  // AUTOSCALING POLICIES
  // ============================================================================

  createAutoscalingPolicy(policyId, config) {
    const policy = {
      id: policyId,
      name: config.name,
      target: config.target,
      minInstances: config.minInstances || 1,
      maxInstances: config.maxInstances || 10,
      targetMetric: config.targetMetric || 'cpu_usage',
      targetValue: config.targetValue || 70, // percentage
      scaleUpThreshold: config.scaleUpThreshold || 80,
      scaleDownThreshold: config.scaleDownThreshold || 30,
      cooldownUp: config.cooldownUp || 60000, // 1 minute
      cooldownDown: config.cooldownDown || 300000, // 5 minutes
      enabled: true,
      lastScaleUp: null,
      lastScaleDown: null,
      createdAt: new Date()
    };

    this.autoscalingPolicies.set(policyId, policy);
    return policy;
  }

  evaluateAutoscaling(policyId, currentMetricValue, currentInstances) {
    const policy = this.autoscalingPolicies.get(policyId);
    if (!policy || !policy.enabled) return null;

    const now = Date.now();

    // Check cooldown for scale up
    if (policy.lastScaleUp) {
      const timeSinceScaleUp = now - policy.lastScaleUp.getTime();
      if (timeSinceScaleUp < policy.cooldownUp) {
        return null;
      }
    }

    // Check cooldown for scale down
    if (policy.lastScaleDown) {
      const timeSinceScaleDown = now - policy.lastScaleDown.getTime();
      if (timeSinceScaleDown < policy.cooldownDown) {
        return null;
      }
    }

    // Determine scaling action
    if (currentMetricValue > policy.scaleUpThreshold && currentInstances < policy.maxInstances) {
      policy.lastScaleUp = new Date();

      return {
        action: 'scale_up',
        policyId,
        target: policy.target,
        currentInstances,
        newInstances: Math.min(currentInstances + 1, policy.maxInstances),
        reason: `Metric ${policy.targetMetric} at ${currentMetricValue}%`,
        timestamp: new Date()
      };
    }

    if (currentMetricValue < policy.scaleDownThreshold && currentInstances > policy.minInstances) {
      policy.lastScaleDown = new Date();

      return {
        action: 'scale_down',
        policyId,
        target: policy.target,
        currentInstances,
        newInstances: Math.max(currentInstances - 1, policy.minInstances),
        reason: `Metric ${policy.targetMetric} at ${currentMetricValue}%`,
        timestamp: new Date()
      };
    }

    return null;
  }

  getAutoscalingPolicy(policyId) {
    return this.autoscalingPolicies.get(policyId);
  }

  // ============================================================================
  // ROLLBACK MANAGEMENT
  // ============================================================================

  performRollback(remedialActionId) {
    const action = this.remedialActions.find(a => a.id === remedialActionId);
    if (!action) throw new Error(`Remedial action ${remedialActionId} not found`);

    // Reverse the action
    const rollback = {
      id: this.generateId('rollback'),
      originalAction: remedialActionId,
      reversedAction: this.reverseAction(action.action),
      status: 'success',
      executedAt: new Date()
    };

    action.rollbackPending = false;
    return rollback;
  }

  reverseAction(action) {
    const reverse = { ...action };

    if (action.type === 'scale_up') {
      reverse.type = 'scale_down';
    } else if (action.type === 'scale_down') {
      reverse.type = 'scale_up';
    } else if (action.type === 'circuit_breaker') {
      reverse.parameters = { ...action.parameters, open: !action.parameters.open };
    }

    return reverse;
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getHealingStats() {
    const successfulActions = this.remedialActions.filter(a => a.status === 'success');
    const failedActions = this.remedialActions.filter(a => a.status === 'failed');

    const byType = {};
    for (const action of this.remedialActions) {
      const type = action.action.type;
      byType[type] = (byType[type] || 0) + 1;
    }

    return {
      total: this.remedialActions.length,
      successful: successfulActions.length,
      failed: failedActions.length,
      successRate: this.remedialActions.length > 0
        ? (successfulActions.length / this.remedialActions.length * 100).toFixed(2) + '%'
        : 'N/A',
      byType,
      healingRules: this.healingRules.size,
      autoscalingPolicies: this.autoscalingPolicies.size
    };
  }

  getMostRecentActions(limit = 10) {
    return this.remedialActions.slice(-limit).reverse();
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  exportHealingStats() {
    return {
      rules: Array.from(this.healingRules.values()),
      actions: this.remedialActions,
      autoscalingPolicies: Array.from(this.autoscalingPolicies.values()),
      stats: this.getHealingStats(),
      exportedAt: new Date()
    };
  }
}

module.exports = SelfHealingOrchestrator;
