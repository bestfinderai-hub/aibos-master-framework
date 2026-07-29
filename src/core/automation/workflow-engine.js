/**
 * Workflow Engine
 * Executes automations (triggers, actions, conditions)
 */

class WorkflowEngine {
  constructor() {
    this.workflows = new Map();
    this.executions = [];
  }

  /**
   * Create workflow
   */
  createWorkflow(name, trigger, actions) {
    const id = Math.random().toString(36).substr(2, 9);
    const workflow = {
      id,
      name,
      trigger,
      actions,
      status: 'draft',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      lastExecuted: null
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  /**
   * Evaluate trigger (does it match?)
   */
  evaluateTrigger(workflow, context) {
    const { trigger } = workflow;

    switch (trigger.type) {
      case 'event':
        return context.event === trigger.event;
      
      case 'time':
        return this.checkTimeCondition(trigger);
      
      case 'condition':
        return this.evaluateCondition(trigger.condition, context);
      
      default:
        return false;
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId, context) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    // Check trigger
    if (!this.evaluateTrigger(workflow, context)) {
      return { status: 'skipped', reason: 'trigger not matched' };
    }

    const execution = {
      id: Math.random().toString(36).substr(2, 9),
      workflowId,
      status: 'running',
      startedAt: new Date(),
      actions: [],
      context
    };

    try {
      // Execute actions in sequence
      for (const action of workflow.actions) {
        const result = await this.executeAction(action, context);
        execution.actions.push(result);

        // Stop if action failed (unless it's non-blocking)
        if (result.status === 'failed' && action.required) {
          execution.status = 'failed';
          break;
        }
      }

      execution.status = execution.status === 'failed' ? 'failed' : 'completed';
      execution.completedAt = new Date();

      workflow.executionCount++;
      workflow.lastExecuted = new Date();

    } catch (error) {
      execution.status = 'error';
      execution.error = error.message;
    }

    this.executions.push(execution);
    return execution;
  }

  /**
   * Execute single action
   */
  async executeAction(action, context) {
    const result = {
      actionId: action.id,
      type: action.type,
      status: 'pending',
      startedAt: new Date()
    };

    try {
      switch (action.type) {
        case 'send_email':
          result.data = await this.sendEmail(action, context);
          break;

        case 'send_sms':
          result.data = await this.sendSMS(action, context);
          break;

        case 'create_task':
          result.data = await this.createTask(action, context);
          break;

        case 'update_field':
          result.data = await this.updateField(action, context);
          break;

        case 'webhook':
          result.data = await this.callWebhook(action, context);
          break;

        default:
          result.status = 'unknown_action';
          return result;
      }

      result.status = 'success';
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
    }

    result.completedAt = new Date();
    return result;
  }

  /**
   * Action implementations
   */
  async sendEmail(action, context) {
    return {
      to: action.to || context.email,
      subject: action.subject,
      template: action.template,
      messageId: Math.random().toString(36).substr(2, 9)
    };
  }

  async sendSMS(action, context) {
    return {
      to: action.to || context.phone,
      message: action.message,
      messageId: Math.random().toString(36).substr(2, 9)
    };
  }

  async createTask(action, context) {
    return {
      title: action.title,
      assignee: action.assignee || context.owner,
      dueDate: action.dueDate || new Date(Date.now() + 24*60*60*1000),
      taskId: Math.random().toString(36).substr(2, 9)
    };
  }

  async updateField(action, context) {
    return {
      entity: action.entity, // contact, deal, etc
      entityId: context.id,
      field: action.field,
      value: action.value
    };
  }

  async callWebhook(action, context) {
    return {
      url: action.url,
      method: action.method || 'POST',
      payload: action.payload || context,
      responseStatus: 200
    };
  }

  /**
   * Evaluate condition (if X then Y)
   */
  evaluateCondition(condition, context) {
    const { field, operator, value } = condition;
    const contextValue = context[field];

    switch (operator) {
      case 'equals':
        return contextValue === value;
      case 'not_equals':
        return contextValue !== value;
      case 'greater_than':
        return contextValue > value;
      case 'less_than':
        return contextValue < value;
      case 'contains':
        return String(contextValue).includes(value);
      default:
        return false;
    }
  }

  /**
   * Check time condition
   */
  checkTimeCondition(trigger) {
    // Simplified: just check if it's the right time
    const now = new Date();
    const hour = now.getHours();

    if (trigger.frequency === 'daily') {
      return hour === trigger.hour;
    }

    return true;
  }

  /**
   * Publish workflow
   */
  publishWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    workflow.status = 'active';
    workflow.publishedAt = new Date();
    workflow.version++;

    return workflow;
  }

  /**
   * Pause workflow
   */
  pauseWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    workflow.status = 'paused';
    return workflow;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(workflowId, limit = 50) {
    return this.executions
      .filter(e => e.workflowId === workflowId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get execution stats
   */
  getExecutionStats(workflowId) {
    const executions = this.executions.filter(e => e.workflowId === workflowId);
    const successful = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;

    return {
      total: executions.length,
      successful,
      failed,
      successRate: executions.length > 0 ? ((successful / executions.length) * 100).toFixed(2) : 0,
      avgDuration: this.calcAvgDuration(executions)
    };
  }

  calcAvgDuration(executions) {
    if (executions.length === 0) return 0;
    const durations = executions
      .filter(e => e.completedAt)
      .map(e => (e.completedAt - e.startedAt) / 1000); // seconds

    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }
}

module.exports = WorkflowEngine;
