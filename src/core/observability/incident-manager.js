/**
 * Incident Manager
 * Incident tracking, response automation, and post-mortem analysis
 */

class IncidentManager {
  constructor() {
    this.incidents = new Map(); // incidentId -> incident
    this.runbooks = new Map(); // runbookId -> runbook
    this.postmortems = []; // post-mortem reports
    this.oncallSchedules = new Map(); // scheduleId -> schedule
  }

  // ============================================================================
  // INCIDENT MANAGEMENT
  // ============================================================================

  createIncident(incidentId, config) {
    const incident = {
      id: incidentId,
      title: config.title,
      description: config.description,
      severity: config.severity || 'medium', // critical, high, medium, low
      status: 'open', // open, investigating, mitigating, resolved
      startedAt: new Date(),
      detectedAt: config.detectedAt || new Date(),
      resolvedAt: null,
      affectedServices: config.affectedServices || [],
      affectedCustomers: config.affectedCustomers || 0,
      rootCause: config.rootCause || null,
      impactedMetrics: config.impactedMetrics || [],
      timeline: [],
      assignedTo: config.assignedTo || null,
      runbooks: config.runbooks || [],
      tags: config.tags || {},
      notifications: []
    };

    this.incidents.set(incidentId, incident);

    // Log initial timeline entry
    this.addTimelineEntry(incidentId, 'incident_created', 'Incident created');

    return incident;
  }

  getIncident(incidentId) {
    return this.incidents.get(incidentId);
  }

  updateIncidentStatus(incidentId, newStatus) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const oldStatus = incident.status;
    incident.status = newStatus;

    // Log status change
    this.addTimelineEntry(incidentId, 'status_changed', `Status changed: ${oldStatus} → ${newStatus}`);

    // If resolving, record resolution time
    if (newStatus === 'resolved' && !incident.resolvedAt) {
      incident.resolvedAt = new Date();
      this.addTimelineEntry(incidentId, 'incident_resolved', 'Incident resolved');
    }

    return incident;
  }

  assignIncident(incidentId, assignee) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    incident.assignedTo = assignee;
    this.addTimelineEntry(incidentId, 'assignment_changed', `Assigned to ${assignee}`);

    return incident;
  }

  listIncidents(filter = {}) {
    let incidents = Array.from(this.incidents.values());

    if (filter.status) {
      incidents = incidents.filter(i => i.status === filter.status);
    }

    if (filter.severity) {
      incidents = incidents.filter(i => i.severity === filter.severity);
    }

    if (filter.assignedTo) {
      incidents = incidents.filter(i => i.assignedTo === filter.assignedTo);
    }

    return incidents.sort((a, b) => b.startedAt - a.startedAt);
  }

  // ============================================================================
  // TIMELINE TRACKING
  // ============================================================================

  addTimelineEntry(incidentId, type, description, metadata = {}) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const entry = {
      id: this.generateId('entry'),
      type,
      description,
      metadata,
      timestamp: new Date()
    };

    incident.timeline.push(entry);
    return entry;
  }

  getTimeline(incidentId) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    return incident.timeline.sort((a, b) => a.timestamp - b.timestamp);
  }

  // ============================================================================
  // RUNBOOK MANAGEMENT
  // ============================================================================

  createRunbook(runbookId, config) {
    const runbook = {
      id: runbookId,
      name: config.name,
      description: config.description,
      triggers: config.triggers || [],
      steps: config.steps || [],
      conditions: config.conditions || {},
      autoExecute: config.autoExecute !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.runbooks.set(runbookId, runbook);
    return runbook;
  }

  getRunbook(runbookId) {
    return this.runbooks.get(runbookId);
  }

  listRunbooks(filter = {}) {
    let runbooks = Array.from(this.runbooks.values());

    if (filter.autoExecute !== undefined) {
      runbooks = runbooks.filter(r => r.autoExecute === filter.autoExecute);
    }

    return runbooks;
  }

  executeRunbook(incidentId, runbookId) {
    const incident = this.incidents.get(incidentId);
    const runbook = this.runbooks.get(runbookId);

    if (!incident) throw new Error(`Incident ${incidentId} not found`);
    if (!runbook) throw new Error(`Runbook ${runbookId} not found`);

    // Check if conditions are met
    if (!this.checkConditions(incident, runbook.conditions)) {
      return {
        runbookId,
        status: 'skipped',
        reason: 'Conditions not met'
      };
    }

    const execution = {
      id: this.generateId('execution'),
      runbookId,
      startedAt: new Date(),
      completedAt: null,
      steps: [],
      status: 'running'
    };

    // Execute steps
    for (const step of runbook.steps) {
      const stepResult = this.executeStep(step);
      execution.steps.push(stepResult);

      if (stepResult.status === 'failed' && step.continueOnError !== true) {
        execution.status = 'failed';
        execution.completedAt = new Date();
        break;
      }
    }

    if (execution.status !== 'failed') {
      execution.status = 'succeeded';
      execution.completedAt = new Date();
    }

    incident.runbooks.push(execution);
    this.addTimelineEntry(incidentId, 'runbook_executed', `Runbook ${runbook.name} executed`);

    return execution;
  }

  checkConditions(incident, conditions) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'severity') {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (severityOrder[incident.severity] < severityOrder[value]) {
          return false;
        }
      }
    }

    return true;
  }

  executeStep(step) {
    // Simulate step execution
    const stepResult = {
      id: this.generateId('step'),
      stepName: step.name,
      action: step.action,
      executedAt: new Date(),
      status: Math.random() > 0.1 ? 'success' : 'failed',
      output: step.action ? `Executed: ${step.action}` : ''
    };

    return stepResult;
  }

  // ============================================================================
  // POST-MORTEM ANALYSIS
  // ============================================================================

  generatePostMortem(incidentId, config = {}) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const duration = incident.resolvedAt
      ? (incident.resolvedAt.getTime() - incident.startedAt.getTime()) / 1000 / 60
      : null;

    const postmortem = {
      id: this.generateId('postmortem'),
      incidentId,
      title: `Post-mortem: ${incident.title}`,
      summary: config.summary || '',
      rootCause: config.rootCause || incident.rootCause,
      timeline: this.getTimeline(incidentId),
      severity: incident.severity,
      duration: duration, // in minutes
      affectedServices: incident.affectedServices,
      affectedCustomers: incident.affectedCustomers,
      actionItems: config.actionItems || [],
      lessons: config.lessons || [],
      contributors: config.contributors || [],
      createdAt: new Date(),
      createdBy: config.createdBy
    };

    this.postmortems.push(postmortem);
    return postmortem;
  }

  getPostMortem(postmorttemId) {
    return this.postmortems.find(p => p.id === postmorttemId);
  }

  listPostMortems(filter = {}) {
    let postmortems = [...this.postmortems];

    if (filter.severity) {
      postmortems = postmortems.filter(p => p.severity === filter.severity);
    }

    if (filter.incidentId) {
      postmortems = postmortems.filter(p => p.incidentId === filter.incidentId);
    }

    return postmortems.sort((a, b) => b.createdAt - a.createdAt);
  }

  // ============================================================================
  // ON-CALL MANAGEMENT
  // ============================================================================

  createOncallSchedule(scheduleId, config) {
    const schedule = {
      id: scheduleId,
      name: config.name,
      members: config.members || [],
      rotationPeriod: config.rotationPeriod || 7 * 24 * 60 * 60 * 1000, // 1 week
      escalationPolicy: config.escalationPolicy || [],
      timezone: config.timezone || 'UTC',
      createdAt: new Date()
    };

    this.oncallSchedules.set(scheduleId, schedule);
    return schedule;
  }

  getOncallSchedule(scheduleId) {
    return this.oncallSchedules.get(scheduleId);
  }

  getCurrentOncall(scheduleId) {
    const schedule = this.oncallSchedules.get(scheduleId);
    if (!schedule || schedule.members.length === 0) {
      return null;
    }

    // Simple rotation based on current date
    const daysSinceStart = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const rotationCycles = Math.floor(daysSinceStart / (schedule.rotationPeriod / (24 * 60 * 60 * 1000)));
    const memberIndex = rotationCycles % schedule.members.length;

    return {
      scheduleId,
      currentMember: schedule.members[memberIndex],
      startTime: new Date(daysSinceStart * 24 * 60 * 60 * 1000),
      endTime: new Date((daysSinceStart + schedule.rotationPeriod / (24 * 60 * 60 * 1000)) * 24 * 60 * 60 * 1000)
    };
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getIncidentStats() {
    const allIncidents = Array.from(this.incidents.values());
    const openIncidents = allIncidents.filter(i => i.status === 'open');
    const resolvedIncidents = allIncidents.filter(i => i.status === 'resolved');

    const mttr = resolvedIncidents.length > 0
      ? resolvedIncidents.reduce((sum, i) => {
          const duration = i.resolvedAt.getTime() - i.startedAt.getTime();
          return sum + duration;
        }, 0) / resolvedIncidents.length / 60 / 1000 // in minutes
      : 0;

    const bySeverity = {};
    for (const incident of allIncidents) {
      bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
    }

    return {
      total: allIncidents.length,
      open: openIncidents.length,
      resolved: resolvedIncidents.length,
      bySeverity,
      mttr: Math.round(mttr), // Mean Time To Resolution in minutes
      postmortems: this.postmortems.length,
      runbooks: this.runbooks.size,
      schedules: this.oncallSchedules.size
    };
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  exportIncidents(filter = {}) {
    const incidents = this.listIncidents(filter);

    return {
      incidents,
      exportedAt: new Date(),
      count: incidents.length
    };
  }
}

module.exports = IncidentManager;
