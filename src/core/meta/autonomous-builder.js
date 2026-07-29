/**
 * Autonomous Project Builder
 * Decomposes strategic goals into executable tasks and projects
 */

class AutonomousBuilder {
  constructor() {
    this.projects = new Map(); // projectId -> project
    this.tasks = new Map(); // taskId -> task
    this.dependencies = new Map(); // taskId -> [dependencyIds]
  }

  // ============================================================================
  // GOAL DECOMPOSITION
  // ============================================================================

  decomposeGoal(goal) {
    if (!goal.name || !goal.target || !goal.deadline) {
      throw new Error('Goal must have name, target, and deadline');
    }

    const epics = this.generateEpics(goal);
    const stories = [];

    for (const epic of epics) {
      stories.push(...this.generateStories(epic, goal));
    }

    const tasks = [];
    for (const story of stories) {
      tasks.push(...this.generateTasks(story, goal));
    }

    return {
      goalId: goal.id || this.generateId('goal'),
      goal,
      epics,
      stories,
      tasks,
      timeline: this.estimateTimeline(tasks, goal.deadline),
      resourcePlan: this.planResources(tasks),
      riskFactors: this.identifyRisks(goal, tasks)
    };
  }

  generateEpics(goal) {
    const epics = [];

    // Analyze goal to create epics
    switch (goal.category) {
      case 'growth':
        epics.push(
          { name: 'Market Analysis', description: 'Understand market and competition', priority: 1 },
          { name: 'Product Development', description: 'Build required features', priority: 2 },
          { name: 'Go-to-Market', description: 'Launch and market strategy', priority: 3 }
        );
        break;

      case 'retention':
        epics.push(
          { name: 'Churn Analysis', description: 'Identify churn reasons', priority: 1 },
          { name: 'Product Improvements', description: 'Address pain points', priority: 2 },
          { name: 'Customer Success', description: 'Support and engagement', priority: 3 }
        );
        break;

      case 'efficiency':
        epics.push(
          { name: 'Process Audit', description: 'Current state assessment', priority: 1 },
          { name: 'Automation', description: 'Automate workflows', priority: 2 },
          { name: 'Training', description: 'Team enablement', priority: 3 }
        );
        break;

      default:
        epics.push(
          { name: 'Analysis', description: 'Understand requirements', priority: 1 },
          { name: 'Execution', description: 'Implement solution', priority: 2 },
          { name: 'Validation', description: 'Measure results', priority: 3 }
        );
    }

    return epics.map((e, i) => ({
      id: this.generateId('epic'),
      ...e,
      goalId: goal.id,
      status: 'planned'
    }));
  }

  generateStories(epic, goal) {
    const stories = [];
    const count = 3 + Math.random() * 4; // 3-7 stories per epic

    for (let i = 0; i < count; i++) {
      stories.push({
        id: this.generateId('story'),
        epicId: epic.id,
        title: `${epic.name} - Story ${i + 1}`,
        description: `Implement aspect of ${epic.name}`,
        acceptanceCriteria: this.generateAcceptanceCriteria(),
        estimation: this.estimateStoryPoints(),
        priority: epic.priority,
        status: 'planned'
      });
    }

    return stories;
  }

  generateTasks(story, goal) {
    const taskCount = 3 + Math.random() * 3; // 3-6 tasks per story
    const tasks = [];

    for (let i = 0; i < taskCount; i++) {
      tasks.push({
        id: this.generateId('task'),
        storyId: story.id,
        title: `Task ${i + 1}: ${story.title}`,
        description: `Subtask for ${story.title}`,
        type: this.selectTaskType(),
        estimation: this.estimateTaskHours(),
        assignee: null,
        status: 'planned',
        priority: story.priority,
        dependencies: []
      });
    }

    return tasks;
  }

  generateAcceptanceCriteria() {
    const criteria = [
      'System meets performance requirements',
      'No regression in existing functionality',
      'Code review approved',
      'Tests pass with >80% coverage'
    ];

    return criteria.slice(0, 2 + Math.floor(Math.random() * 3));
  }

  estimateStoryPoints() {
    const sizes = [1, 2, 3, 5, 8, 13, 21];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  estimateTaskHours() {
    return 2 + Math.floor(Math.random() * 6); // 2-8 hours
  }

  selectTaskType() {
    const types = ['development', 'testing', 'documentation', 'design', 'research', 'deployment'];
    return types[Math.floor(Math.random() * types.length)];
  }

  // ============================================================================
  // RESOURCE ALLOCATION
  // ============================================================================

  planResources(tasks) {
    const totalHours = tasks.reduce((sum, t) => sum + t.estimation, 0);
    const engineersNeeded = Math.ceil(totalHours / (8 * 5 * 4)); // assuming 160 hours/month per engineer

    return {
      totalHours,
      engineersNeeded,
      breakdown: {
        development: tasks.filter(t => t.type === 'development').length,
        testing: tasks.filter(t => t.type === 'testing').length,
        documentation: tasks.filter(t => t.type === 'documentation').length,
        design: tasks.filter(t => t.type === 'design').length,
        research: tasks.filter(t => t.type === 'research').length,
        deployment: tasks.filter(t => t.type === 'deployment').length
      },
      parallelizationFactor: 0.75, // 75% of tasks can run in parallel
      efficientHours: totalHours * 0.75 // accounting for parallelization
    };
  }

  // ============================================================================
  // TIMELINE & CRITICAL PATH
  // ============================================================================

  estimateTimeline(tasks, deadline) {
    const tasksByPriority = [...tasks].sort((a, b) => b.priority - a.priority);
    const criticalPath = this.calculateCriticalPath(tasksByPriority);

    const totalHours = tasks.reduce((sum, t) => sum + t.estimation, 0);
    const workDaysNeeded = Math.ceil(totalHours / 8);
    const calendarDaysNeeded = Math.ceil(workDaysNeeded / 5) * 7; // convert to calendar days

    const startDate = new Date();
    const projectedEnd = new Date(startDate.getTime() + calendarDaysNeeded * 24 * 60 * 60 * 1000);

    const timeRemaining = deadline.getTime() - startDate.getTime();
    const timeNeeded = calendarDaysNeeded * 24 * 60 * 60 * 1000;
    const bufferPercent = (timeRemaining - timeNeeded) / timeRemaining;

    return {
      startDate,
      projectedEnd,
      deadline,
      workDaysNeeded,
      calendarDaysNeeded,
      bufferPercent: Math.max(0, bufferPercent),
      riskLevel: bufferPercent < 0.1 ? 'high' : bufferPercent < 0.2 ? 'medium' : 'low',
      criticalPath: criticalPath.map(t => t.id)
    };
  }

  calculateCriticalPath(tasks) {
    const critical = [];
    let remainingHours = 0;

    for (const task of tasks) {
      remainingHours += task.estimation;
      critical.push(task);

      if (remainingHours > 100) break; // limit critical path
    }

    return critical;
  }

  // ============================================================================
  // RISK IDENTIFICATION
  // ============================================================================

  identifyRisks(goal, tasks) {
    const risks = [];

    // Resource risks
    if (tasks.length > 50) {
      risks.push({
        type: 'resource',
        severity: 'high',
        description: 'Large project scope may require more resources than available',
        mitigation: 'Break into phases or increase team size'
      });
    }

    // Timeline risks
    const timeline = this.estimateTimeline(tasks, goal.deadline);
    if (timeline.bufferPercent < 0.15) {
      risks.push({
        type: 'timeline',
        severity: timeline.bufferPercent < 0 ? 'critical' : 'high',
        description: 'Tight timeline may lead to quality issues',
        mitigation: 'Prioritize MVP features or extend deadline'
      });
    }

    // Dependency risks
    const cycles = this.detectDependencyCycles(tasks);
    if (cycles.length > 0) {
      risks.push({
        type: 'dependency',
        severity: 'high',
        description: `Found ${cycles.length} circular dependencies`,
        mitigation: 'Refactor task dependencies to remove cycles'
      });
    }

    // Skill gaps
    if (tasks.some(t => t.type === 'design' && tasks.filter(x => x.type === 'design').length < 2)) {
      risks.push({
        type: 'skill',
        severity: 'medium',
        description: 'Limited design resources may create bottleneck',
        mitigation: 'Hire contractor or use design templates'
      });
    }

    return risks;
  }

  detectDependencyCycles(tasks) {
    const cycles = [];
    const visited = new Set();

    const hasCycle = (taskId, path) => {
      if (path.includes(taskId)) {
        return [taskId, ...path];
      }

      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.dependencies) return null;

      for (const depId of task.dependencies) {
        const cycle = hasCycle(depId, [taskId, ...path]);
        if (cycle) return cycle;
      }

      return null;
    };

    for (const task of tasks) {
      const cycle = hasCycle(task.id, []);
      if (cycle && !visited.has(JSON.stringify(cycle))) {
        visited.add(JSON.stringify(cycle));
        cycles.push(cycle);
      }
    }

    return cycles;
  }

  // ============================================================================
  // PROJECT GENERATION
  // ============================================================================

  generateProject(decomposition) {
    const projectId = this.generateId('project');
    const project = {
      id: projectId,
      name: decomposition.goal.name,
      description: decomposition.goal.description,
      goal: decomposition.goal,
      status: 'active',
      createdAt: new Date(),
      startDate: decomposition.timeline.startDate,
      endDate: decomposition.timeline.deadline,
      epics: decomposition.epics,
      stories: decomposition.stories,
      tasks: decomposition.tasks,
      resourcePlan: decomposition.resourcePlan,
      timeline: decomposition.timeline,
      risks: decomposition.riskFactors,
      metrics: {
        completedTasks: 0,
        totalTasks: decomposition.tasks.length,
        completionPercent: 0,
        actualVsEstimated: 0,
        velocity: 0
      }
    };

    this.projects.set(projectId, project);
    return project;
  }

  updateProjectProgress(projectId, taskId, status) {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    task.status = status;

    // Update metrics
    project.metrics.completedTasks = project.tasks.filter(t => t.status === 'completed').length;
    project.metrics.completionPercent = Math.round((project.metrics.completedTasks / project.metrics.totalTasks) * 100);

    return project;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getProjectSummary(projectId) {
    const project = this.projects.get(projectId);
    if (!project) return null;

    return {
      id: project.id,
      name: project.name,
      status: project.status,
      progress: project.metrics.completionPercent,
      totalTasks: project.metrics.totalTasks,
      completedTasks: project.metrics.completedTasks,
      timeline: {
        start: project.startDate,
        end: project.endDate,
        status: this.getTimelineStatus(project)
      },
      risks: project.risks.filter(r => r.severity === 'high' || r.severity === 'critical'),
      nextSteps: this.getNextSteps(project)
    };
  }

  getTimelineStatus(project) {
    const now = new Date();
    const elapsed = now.getTime() - project.startDate.getTime();
    const total = project.endDate.getTime() - project.startDate.getTime();
    const expectedProgress = elapsed / total;
    const actualProgress = project.metrics.completionPercent / 100;

    if (actualProgress < expectedProgress * 0.8) return 'behind';
    if (actualProgress < expectedProgress * 0.95) return 'at-risk';
    return 'on-track';
  }

  getNextSteps(project) {
    const incompleteTasks = project.tasks.filter(t => t.status !== 'completed');
    const readyTasks = incompleteTasks.filter(t => !t.dependencies || t.dependencies.length === 0);

    return readyTasks.slice(0, 5).map(t => ({
      id: t.id,
      title: t.title,
      estimation: t.estimation
    }));
  }
}

module.exports = AutonomousBuilder;
