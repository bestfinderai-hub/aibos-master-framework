/**
 * Roadmap Engine
 * 4-week implementation plan, phasing, dependencies, critical path
 */

class RoadmapEngine {
  constructor() {
    this.roadmaps = new Map(); // roadmapId -> roadmap
    this.phases = new Map(); // phaseId -> phase
    this.dependencies = []; // list of dependencies
    this.criticalPath = [];
    this.risks = [];
  }

  // ============================================================================
  // ROADMAP MANAGEMENT
  // ============================================================================

  createRoadmap(roadmapId, config) {
    const roadmap = {
      id: roadmapId,
      name: config.name,
      description: config.description,
      goal: config.goal,
      owner: config.owner,
      timeline: {
        start: config.start || new Date(),
        end: config.end || new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 4 weeks default
        duration: config.duration || 28 // days
      },
      status: 'planning', // planning, active, paused, completed
      phases: [],
      milestones: [],
      risks: [],
      resources: config.resources || {},
      budget: config.budget || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.roadmaps.set(roadmapId, roadmap);
    return roadmap;
  }

  getRoadmap(roadmapId) {
    return this.roadmaps.get(roadmapId);
  }

  updateRoadmapStatus(roadmapId, newStatus) {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) throw new Error(`Roadmap ${roadmapId} not found`);

    roadmap.status = newStatus;
    roadmap.updatedAt = new Date();

    if (newStatus === 'active') {
      roadmap.actualStart = new Date();
    } else if (newStatus === 'completed') {
      roadmap.actualEnd = new Date();
    }

    return roadmap;
  }

  listRoadmaps(filter = {}) {
    let roadmaps = Array.from(this.roadmaps.values());

    if (filter.status) {
      roadmaps = roadmaps.filter(r => r.status === filter.status);
    }

    if (filter.owner) {
      roadmaps = roadmaps.filter(r => r.owner === filter.owner);
    }

    return roadmaps.sort((a, b) => b.createdAt - a.createdAt);
  }

  // ============================================================================
  // PHASE MANAGEMENT
  // ============================================================================

  createPhase(phaseId, roadmapId, config) {
    const phase = {
      id: phaseId,
      roadmapId,
      name: config.name,
      description: config.description,
      sequence: config.sequence || 1, // phase order (1-4 for 4 weeks)
      start: config.start,
      end: config.end,
      durationDays: config.durationDays || 7,
      status: 'pending', // pending, in_progress, completed, blocked
      deliverables: config.deliverables || [],
      tasks: [],
      dependencies: config.dependencies || [],
      owner: config.owner,
      successCriteria: config.successCriteria || [],
      risks: config.risks || [],
      createdAt: new Date()
    };

    this.phases.set(phaseId, phase);

    const roadmap = this.roadmaps.get(roadmapId);
    if (roadmap) {
      roadmap.phases.push(phaseId);
      roadmap.phases.sort((a, b) => {
        const phaseA = this.phases.get(a);
        const phaseB = this.phases.get(b);
        return phaseA.sequence - phaseB.sequence;
      });
    }

    return phase;
  }

  getPhase(phaseId) {
    return this.phases.get(phaseId);
  }

  updatePhaseStatus(phaseId, newStatus) {
    const phase = this.phases.get(phaseId);
    if (!phase) throw new Error(`Phase ${phaseId} not found`);

    phase.status = newStatus;

    if (newStatus === 'in_progress') {
      phase.actualStart = new Date();
    } else if (newStatus === 'completed') {
      phase.actualEnd = new Date();
    }

    return phase;
  }

  listPhases(roadmapId) {
    return Array.from(this.phases.values())
      .filter(p => p.roadmapId === roadmapId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  // ============================================================================
  // DEPENDENCY MANAGEMENT
  // ============================================================================

  addDependency(fromPhaseId, toPhaseId, type = 'finish_to_start') {
    const dependency = {
      id: this.generateId('dep'),
      from: fromPhaseId,
      to: toPhaseId,
      type, // finish_to_start, finish_to_finish, start_to_start, start_to_finish
      lag: 0, // days between tasks
      createdAt: new Date()
    };

    this.dependencies.push(dependency);
    return dependency;
  }

  getDependencies(phaseId) {
    return this.dependencies.filter(d => d.from === phaseId || d.to === phaseId);
  }

  // ============================================================================
  // CRITICAL PATH ANALYSIS
  // ============================================================================

  calculateCriticalPath(roadmapId) {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap || roadmap.phases.length === 0) return [];

    const phaseIds = roadmap.phases;
    const phases = phaseIds.map(id => this.phases.get(id));

    const graph = this.buildDependencyGraph(phaseIds);
    const path = this.findLongestPath(graph, phases);

    this.criticalPath = path;
    roadmap.criticalPath = path.map(p => p.id);

    return path;
  }

  buildDependencyGraph(phaseIds) {
    const graph = {};

    for (const phaseId of phaseIds) {
      graph[phaseId] = [];
    }

    for (const dep of this.dependencies) {
      if (phaseIds.includes(dep.from) && phaseIds.includes(dep.to)) {
        graph[dep.from].push({
          to: dep.to,
          lag: dep.lag
        });
      }
    }

    return graph;
  }

  findLongestPath(graph, phases) {
    const phaseMap = {};
    for (const phase of phases) {
      phaseMap[phase.id] = phase;
    }

    const memo = {};

    const dfs = (phaseId) => {
      if (memo[phaseId]) return memo[phaseId];

      const phase = phaseMap[phaseId];
      let maxPath = [phase];
      let maxLength = phase.durationDays || 7;

      for (const dep of graph[phaseId] || []) {
        const subPath = dfs(dep.to);
        const totalLength = maxLength + (subPath[0]?.durationDays || 7) + dep.lag;

        if (subPath.length > 0) {
          const newPath = [phase, ...subPath];
          const newLength = newPath.reduce((sum, p) => sum + (p.durationDays || 7), 0);

          if (newLength > maxLength) {
            maxPath = newPath;
            maxLength = newLength;
          }
        }
      }

      memo[phaseId] = maxPath;
      return maxPath;
    };

    const allPhaseIds = Object.keys(graph);
    let longestPath = [];
    let maxDuration = 0;

    for (const phaseId of allPhaseIds) {
      const path = dfs(phaseId);
      const duration = path.reduce((sum, p) => sum + (p.durationDays || 7), 0);

      if (duration > maxDuration) {
        longestPath = path;
        maxDuration = duration;
      }
    }

    return longestPath;
  }

  // ============================================================================
  // MILESTONE MANAGEMENT
  // ============================================================================

  addMilestone(roadmapId, config) {
    const milestone = {
      id: this.generateId('milestone'),
      roadmapId,
      name: config.name,
      description: config.description,
      date: config.date,
      phaseId: config.phaseId,
      status: 'pending', // pending, achieved, at_risk, missed
      successCriteria: config.successCriteria || [],
      actualDate: null,
      createdAt: new Date()
    };

    const roadmap = this.roadmaps.get(roadmapId);
    if (roadmap) {
      roadmap.milestones.push(milestone.id);
    }

    return milestone;
  }

  updateMilestoneStatus(milestoneId, newStatus) {
    const roadmaps = Array.from(this.roadmaps.values());
    let milestone = null;

    for (const roadmap of roadmaps) {
      for (const id of roadmap.milestones) {
        if (id === milestoneId) {
          const found = roadmap.milestones.find(m => m === milestoneId);
          if (found) milestone = found;
        }
      }
    }

    if (!milestone) throw new Error(`Milestone ${milestoneId} not found`);

    if (newStatus === 'achieved') {
      milestone.actualDate = new Date();
    }

    milestone.status = newStatus;
    return milestone;
  }

  // ============================================================================
  // RISK MANAGEMENT
  // ============================================================================

  addRisk(roadmapId, config) {
    const risk = {
      id: this.generateId('risk'),
      roadmapId,
      description: config.description,
      severity: config.severity || 'medium', // low, medium, high, critical
      probability: config.probability || 0.5, // 0-1
      impact: config.impact || 0.5, // 0-1
      mitigation: config.mitigation,
      owner: config.owner,
      status: 'identified', // identified, mitigating, resolved, accepted
      createdAt: new Date()
    };

    this.risks.push(risk);

    const roadmap = this.roadmaps.get(roadmapId);
    if (roadmap) {
      roadmap.risks.push(risk.id);
    }

    return risk;
  }

  getRiskScore(risk) {
    // Risk score = probability × impact × severity weight
    const severityWeight = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    return (risk.probability * risk.impact * severityWeight[risk.severity]) / 12;
  }

  listRisks(roadmapId) {
    return this.risks
      .filter(r => r.roadmapId === roadmapId)
      .sort((a, b) => this.getRiskScore(b) - this.getRiskScore(a));
  }

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  getPhaseProgress(phaseId) {
    const phase = this.phases.get(phaseId);
    if (!phase) return null;

    const totalDeliverables = phase.deliverables.length;
    const completedDeliverables = phase.deliverables.filter(d => d.status === 'completed').length;
    const completionRate = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

    return {
      phaseId,
      phaseName: phase.name,
      status: phase.status,
      progress: completionRate,
      totalDeliverables,
      completedDeliverables,
      daysElapsed: phase.actualStart ? Math.floor((Date.now() - phase.actualStart) / (1000 * 60 * 60 * 24)) : 0,
      daysRemaining: Math.ceil((phase.end - Date.now()) / (1000 * 60 * 60 * 24))
    };
  }

  getRoadmapProgress(roadmapId) {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return null;

    const phases = this.listPhases(roadmapId);
    const phaseProgresses = phases.map(p => this.getPhaseProgress(p.id));

    const totalProgress = phaseProgresses.length > 0
      ? phaseProgresses.reduce((sum, p) => sum + p.progress, 0) / phaseProgresses.length
      : 0;

    const completedPhases = phases.filter(p => p.status === 'completed').length;

    return {
      roadmapId,
      name: roadmap.name,
      status: roadmap.status,
      overallProgress: totalProgress,
      phasesCompleted: completedPhases,
      totalPhases: phases.length,
      phaseBreakdown: phaseProgresses,
      daysElapsed: roadmap.actualStart ? Math.floor((Date.now() - roadmap.actualStart) / (1000 * 60 * 60 * 24)) : 0,
      daysRemaining: Math.ceil((roadmap.timeline.end - Date.now()) / (1000 * 60 * 60 * 24))
    };
  }

  // ============================================================================
  // REPORTING
  // ============================================================================

  generateRoadmapReport(roadmapId) {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) throw new Error(`Roadmap ${roadmapId} not found`);

    const progress = this.getRoadmapProgress(roadmapId);
    const criticalPath = roadmap.criticalPath || this.calculateCriticalPath(roadmapId);
    const risks = this.listRisks(roadmapId);

    return {
      roadmapId,
      name: roadmap.name,
      goal: roadmap.goal,
      status: roadmap.status,
      progress,
      criticalPath: criticalPath.map(p => {
        const phase = this.phases.get(p.id);
        return {
          id: p.id,
          name: phase?.name,
          duration: p.durationDays
        };
      }),
      risks: risks.map(r => ({
        id: r.id,
        description: r.description,
        severity: r.severity,
        score: this.getRiskScore(r),
        mitigation: r.mitigation,
        status: r.status
      })),
      timeline: roadmap.timeline,
      summary: `${roadmap.name}: ${Math.round(progress.overallProgress)}% complete, ${progress.phasesCompleted}/${progress.totalPhases} phases done`
    };
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  exportRoadmap(roadmapId) {
    const roadmap = this.roadmaps.get(roadmapId);
    const phases = this.listPhases(roadmapId);

    return {
      roadmap,
      phases,
      report: this.generateRoadmapReport(roadmapId),
      exportedAt: new Date()
    };
  }
}

module.exports = RoadmapEngine;
