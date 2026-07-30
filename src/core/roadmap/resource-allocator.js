/**
 * Resource Allocator
 * Team assignment, capacity planning, resource leveling, utilization tracking
 */

class ResourceAllocator {
  constructor() {
    this.resources = new Map(); // resourceId -> resource
    this.allocations = []; // list of resource allocations
    this.capacityPlans = new Map(); // phaseId -> capacity plan
  }

  // ============================================================================
  // RESOURCE MANAGEMENT
  // ============================================================================

  registerResource(resourceId, config) {
    const resource = {
      id: resourceId,
      name: config.name,
      type: config.type || 'engineer', // engineer, designer, pm, qa
      role: config.role,
      skills: config.skills || [],
      availability: config.availability || 1.0, // 0-1 (0.5 = half-time)
      costPerDay: config.costPerDay || 500,
      baseCapacity: config.baseCapacity || 8, // hours per day
      allocations: [],
      createdAt: new Date()
    };

    this.resources.set(resourceId, resource);
    return resource;
  }

  getResource(resourceId) {
    return this.resources.get(resourceId);
  }

  listResources(filter = {}) {
    let resources = Array.from(this.resources.values());

    if (filter.type) {
      resources = resources.filter(r => r.type === filter.type);
    }

    if (filter.skills) {
      resources = resources.filter(r =>
        filter.skills.some(skill => r.skills.includes(skill))
      );
    }

    return resources;
  }

  // ============================================================================
  // ALLOCATION MANAGEMENT
  // ============================================================================

  allocateResource(resourceId, phaseId, config) {
    const resource = this.resources.get(resourceId);
    if (!resource) throw new Error(`Resource ${resourceId} not found`);

    const allocation = {
      id: this.generateId('alloc'),
      resourceId,
      phaseId,
      startDate: config.startDate,
      endDate: config.endDate,
      hoursPerDay: config.hoursPerDay || resource.baseCapacity,
      role: config.role || resource.role,
      status: 'planned', // planned, active, completed, paused
      ramp: config.ramp || 'full', // full, ramp_up, ramp_down
      priority: config.priority || 'medium', // low, medium, high
      createdAt: new Date()
    };

    this.allocations.push(allocation);
    resource.allocations.push(allocation.id);

    return allocation;
  }

  getResourceAllocations(resourceId) {
    const resource = this.resources.get(resourceId);
    if (!resource) return [];

    return this.allocations.filter(a => a.resourceId === resourceId);
  }

  getPhaseAllocations(phaseId) {
    return this.allocations.filter(a => a.phaseId === phaseId);
  }

  updateAllocationStatus(allocationId, newStatus) {
    const allocation = this.allocations.find(a => a.id === allocationId);
    if (!allocation) throw new Error(`Allocation ${allocationId} not found`);

    allocation.status = newStatus;
    return allocation;
  }

  // ============================================================================
  // CAPACITY PLANNING
  // ============================================================================

  createCapacityPlan(phaseId, config) {
    const plan = {
      phaseId,
      targetTeamSize: config.targetTeamSize || 5,
      roles: config.roles || {}, // role -> number
      budget: config.budget || 0,
      budgetUtilized: 0,
      daysAvailable: config.daysAvailable || 21,
      allocatedResources: [],
      gaps: [],
      utilization: 0,
      createdAt: new Date()
    };

    this.capacityPlans.set(phaseId, plan);
    return plan;
  }

  getCapacityPlan(phaseId) {
    return this.capacityPlans.get(phaseId);
  }

  calculatePhaseCapacity(phaseId) {
    const allocations = this.getPhaseAllocations(phaseId);

    if (allocations.length === 0) {
      return {
        phaseId,
        totalCapacity: 0,
        allocatedCapacity: 0,
        availableCapacity: 0,
        utilization: 0,
        teamSize: 0,
        resources: []
      };
    }

    const totalCapacity = allocations.reduce((sum, a) => {
      const resource = this.resources.get(a.resourceId);
      return sum + (a.hoursPerDay * 21); // 21 working days
    }, 0);

    const allocatedCapacity = allocations.reduce((sum, a) => sum + (a.hoursPerDay * 21), 0);
    const availableCapacity = totalCapacity - allocatedCapacity;
    const utilization = totalCapacity > 0 ? (allocatedCapacity / totalCapacity) * 100 : 0;

    return {
      phaseId,
      totalCapacity,
      allocatedCapacity,
      availableCapacity,
      utilization,
      teamSize: allocations.length,
      resources: allocations.map(a => {
        const resource = this.resources.get(a.resourceId);
        return {
          resourceId: a.resourceId,
          name: resource?.name,
          hoursPerDay: a.hoursPerDay,
          totalHours: a.hoursPerDay * 21,
          role: a.role
        };
      })
    };
  }

  // ============================================================================
  // RESOURCE LEVELING
  // ============================================================================

  levelResources(roadmapId, phases) {
    const allocations = this.allocations;
    const leveled = [];

    // Group allocations by resource and date
    const resourceTimeline = {};
    for (const alloc of allocations) {
      const key = alloc.resourceId;
      if (!resourceTimeline[key]) {
        resourceTimeline[key] = [];
      }
      resourceTimeline[key].push(alloc);
    }

    // Detect over-allocations
    const overAllocations = [];
    for (const [resourceId, allocs] of Object.entries(resourceTimeline)) {
      const resource = this.resources.get(resourceId);

      for (let i = 0; i < allocs.length; i++) {
        for (let j = i + 1; j < allocs.length; j++) {
          const a1 = allocs[i];
          const a2 = allocs[j];

          if (this.datesOverlap(a1.startDate, a1.endDate, a2.startDate, a2.endDate)) {
            const totalHours = a1.hoursPerDay + a2.hoursPerDay;
            if (totalHours > resource.baseCapacity) {
              overAllocations.push({
                resourceId,
                allocations: [a1.id, a2.id],
                totalHours,
                availableHours: resource.baseCapacity,
                conflict: totalHours - resource.baseCapacity
              });
            }
          }
        }
      }
    }

    return {
      status: overAllocations.length > 0 ? 'unleveled' : 'leveled',
      overAllocations,
      suggestions: this.generateLevelingSuggestions(overAllocations)
    };
  }

  datesOverlap(start1, end1, start2, end2) {
    return start1 <= end2 && start2 <= end1;
  }

  generateLevelingSuggestions(overAllocations) {
    const suggestions = [];

    for (const conflict of overAllocations) {
      suggestions.push({
        type: 'reduce_hours',
        resourceId: conflict.resourceId,
        recommendation: `Reduce allocation by ${conflict.conflict} hours on one or more of allocations ${conflict.allocations.join(', ')}`
      });

      suggestions.push({
        type: 'find_replacement',
        resourceId: conflict.resourceId,
        recommendation: `Reassign one allocation to another resource with available capacity`
      });
    }

    return suggestions;
  }

  // ============================================================================
  // BUDGET TRACKING
  // ============================================================================

  calculateResourceCost(allocationId, daysAvailable = 21) {
    const allocation = this.allocations.find(a => a.id === allocationId);
    if (!allocation) throw new Error(`Allocation ${allocationId} not found`);

    const resource = this.resources.get(allocation.resourceId);
    const dailyCost = resource.costPerDay * (allocation.hoursPerDay / resource.baseCapacity);
    const totalCost = dailyCost * daysAvailable;

    return {
      allocationId,
      resourceId: allocation.resourceId,
      dailyCost,
      totalCost,
      daysAvailable
    };
  }

  calculatePhaseBudget(phaseId, daysAvailable = 21) {
    const allocations = this.getPhaseAllocations(phaseId);

    let totalBudget = 0;
    const costs = [];

    for (const alloc of allocations) {
      const cost = this.calculateResourceCost(alloc.id, daysAvailable);
      costs.push(cost);
      totalBudget += cost.totalCost;
    }

    return {
      phaseId,
      totalBudget,
      resourceCount: allocations.length,
      costBreakdown: costs,
      budgetPerDay: totalBudget / daysAvailable
    };
  }

  calculateRoadmapBudget(roadmapId, phases, daysAvailable = 28) {
    let totalBudget = 0;
    const phaseBudgets = [];

    for (const phase of phases) {
      const budget = this.calculatePhaseBudget(phase.id, daysAvailable);
      phaseBudgets.push(budget);
      totalBudget += budget.totalBudget;
    }

    return {
      roadmapId,
      totalBudget,
      phases: phaseBudgets,
      averageBudgetPerPhase: totalBudget / phases.length,
      budgetPerDay: totalBudget / daysAvailable
    };
  }

  // ============================================================================
  // UTILIZATION METRICS
  // ============================================================================

  getResourceUtilization(resourceId, startDate, endDate) {
    const resource = this.resources.get(resourceId);
    if (!resource) return null;

    const allocations = this.getResourceAllocations(resourceId)
      .filter(a => this.datesOverlap(a.startDate, a.endDate, startDate, endDate));

    const daysAvailable = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalAvailableHours = resource.baseCapacity * daysAvailable * resource.availability;
    const allocatedHours = allocations.reduce((sum, a) => sum + (a.hoursPerDay * 21), 0);
    const utilization = totalAvailableHours > 0 ? (allocatedHours / totalAvailableHours) * 100 : 0;

    return {
      resourceId,
      name: resource.name,
      totalAvailableHours,
      allocatedHours,
      utilization,
      status: utilization > 100 ? 'overallocated' : utilization < 30 ? 'underutilized' : 'optimal',
      allocations: allocations.length
    };
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = ResourceAllocator;
