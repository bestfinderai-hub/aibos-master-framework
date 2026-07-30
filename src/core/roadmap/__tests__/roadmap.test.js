/**
 * Roadmap Tests
 */

const RoadmapEngine = require('../roadmap-engine');
const ResourceAllocator = require('../resource-allocator');
const MilestoneTracker = require('../milestone-tracker');

describe('RoadmapEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new RoadmapEngine();
  });

  describe('roadmap management', () => {
    test('should create roadmap', () => {
      const roadmap = engine.createRoadmap('roadmap-1', {
        name: 'Q3 2026 Rollout',
        goal: 'Deploy AIBOS framework to production',
        owner: 'engineering-team'
      });

      expect(roadmap.id).toBe('roadmap-1');
      expect(roadmap.status).toBe('planning');
      expect(roadmap.timeline.duration).toBe(28);
    });

    test('should list roadmaps', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });
      engine.createRoadmap('r2', { name: 'Roadmap 2' });

      const roadmaps = engine.listRoadmaps();

      expect(roadmaps.length).toBe(2);
    });

    test('should update roadmap status', () => {
      engine.createRoadmap('r1', { name: 'Test' });
      const updated = engine.updateRoadmapStatus('r1', 'active');

      expect(updated.status).toBe('active');
      expect(updated.actualStart).toBeTruthy();
    });
  });

  describe('phase management', () => {
    test('should create phase', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });
      const phase = engine.createPhase('phase-1', 'r1', {
        name: 'Phase 1: Foundation',
        sequence: 1,
        durationDays: 7
      });

      expect(phase.id).toBe('phase-1');
      expect(phase.sequence).toBe(1);
    });

    test('should list phases in order', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });
      engine.createPhase('p1', 'r1', { name: 'Phase 1', sequence: 1 });
      engine.createPhase('p2', 'r1', { name: 'Phase 2', sequence: 2 });
      engine.createPhase('p3', 'r1', { name: 'Phase 3', sequence: 3 });

      const phases = engine.listPhases('r1');

      expect(phases.length).toBe(3);
      expect(phases[0].sequence).toBe(1);
      expect(phases[2].sequence).toBe(3);
    });

    test('should update phase status', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });
      engine.createPhase('p1', 'r1', { name: 'Phase 1' });
      const updated = engine.updatePhaseStatus('p1', 'in_progress');

      expect(updated.status).toBe('in_progress');
      expect(updated.actualStart).toBeTruthy();
    });
  });

  describe('dependencies', () => {
    test('should add phase dependency', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });
      engine.createPhase('p1', 'r1', { name: 'Phase 1' });
      engine.createPhase('p2', 'r1', { name: 'Phase 2' });

      const dep = engine.addDependency('p1', 'p2', 'finish_to_start');

      expect(dep.from).toBe('p1');
      expect(dep.to).toBe('p2');
      expect(dep.type).toBe('finish_to_start');
    });

    test('should get dependencies for phase', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });
      engine.createPhase('p1', 'r1', { name: 'Phase 1' });
      engine.createPhase('p2', 'r1', { name: 'Phase 2' });
      engine.createPhase('p3', 'r1', { name: 'Phase 3' });

      engine.addDependency('p1', 'p2');
      engine.addDependency('p2', 'p3');

      const deps = engine.getDependencies('p2');

      expect(deps.length).toBe(2);
    });
  });

  describe('critical path analysis', () => {
    test('should calculate critical path', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });
      engine.createPhase('p1', 'r1', { name: 'Phase 1', sequence: 1, durationDays: 7 });
      engine.createPhase('p2', 'r1', { name: 'Phase 2', sequence: 2, durationDays: 7 });
      engine.createPhase('p3', 'r1', { name: 'Phase 3', sequence: 3, durationDays: 7 });

      engine.addDependency('p1', 'p2');
      engine.addDependency('p2', 'p3');

      const path = engine.calculateCriticalPath('r1');

      expect(path.length).toBeGreaterThan(0);
      expect(path[0].id).toBeTruthy();
    });
  });

  describe('milestone management', () => {
    test('should add milestone', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });

      const milestone = engine.addMilestone('r1', {
        name: 'MVP Launch',
        date: new Date('2026-08-31'),
        successCriteria: ['Core features working', 'Docs complete']
      });

      expect(milestone.name).toBe('MVP Launch');
      expect(milestone.status).toBe('pending');
    });
  });

  describe('risk management', () => {
    test('should add risk', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });

      const risk = engine.addRisk('r1', {
        description: 'Resource shortage',
        severity: 'high',
        probability: 0.6,
        impact: 0.7,
        mitigation: 'Hire contractors'
      });

      expect(risk.description).toBe('Resource shortage');
      expect(risk.severity).toBe('high');
    });

    test('should calculate risk score', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });

      const risk = engine.addRisk('r1', {
        description: 'Test Risk',
        severity: 'high',
        probability: 0.8,
        impact: 0.8
      });

      const score = engine.getRiskScore(risk);

      expect(score).toBeGreaterThan(0);
    });
  });

  describe('progress tracking', () => {
    test('should get phase progress', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });
      engine.createPhase('p1', 'r1', { name: 'Phase 1' });
      engine.updatePhaseStatus('p1', 'in_progress');

      const progress = engine.getPhaseProgress('p1');

      expect(progress.phaseId).toBe('p1');
      expect(progress.status).toBe('in_progress');
    });

    test('should get roadmap progress', () => {
      engine.createRoadmap('r1', { name: 'Roadmap 1' });
      engine.createPhase('p1', 'r1', { name: 'Phase 1', sequence: 1 });
      engine.createPhase('p2', 'r1', { name: 'Phase 2', sequence: 2 });

      const progress = engine.getRoadmapProgress('r1');

      expect(progress.roadmapId).toBe('r1');
      expect(progress.totalPhases).toBe(2);
    });
  });

  describe('reporting', () => {
    test('should generate roadmap report', () => {
      engine.createRoadmap('r1', {
        name: 'Q3 Rollout',
        goal: 'Deploy framework'
      });
      engine.createPhase('p1', 'r1', { name: 'Phase 1' });

      const report = engine.generateRoadmapReport('r1');

      expect(report.roadmapId).toBe('r1');
      expect(report.goal).toBe('Deploy framework');
      expect(report.progress).toBeTruthy();
    });
  });
});

describe('ResourceAllocator', () => {
  let allocator;

  beforeEach(() => {
    allocator = new ResourceAllocator();
  });

  describe('resource management', () => {
    test('should register resource', () => {
      const resource = allocator.registerResource('eng-1', {
        name: 'Alice',
        type: 'engineer',
        skills: ['JavaScript', 'TypeScript'],
        costPerDay: 800
      });

      expect(resource.id).toBe('eng-1');
      expect(resource.type).toBe('engineer');
      expect(resource.skills.length).toBe(2);
    });

    test('should list resources by type', () => {
      allocator.registerResource('eng-1', { name: 'Alice', type: 'engineer' });
      allocator.registerResource('des-1', { name: 'Bob', type: 'designer' });
      allocator.registerResource('eng-2', { name: 'Charlie', type: 'engineer' });

      const engineers = allocator.listResources({ type: 'engineer' });

      expect(engineers.length).toBe(2);
    });
  });

  describe('allocation management', () => {
    test('should allocate resource to phase', () => {
      allocator.registerResource('eng-1', { name: 'Alice' });

      const alloc = allocator.allocateResource('eng-1', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08'),
        hoursPerDay: 8
      });

      expect(alloc.resourceId).toBe('eng-1');
      expect(alloc.phaseId).toBe('phase-1');
      expect(alloc.hoursPerDay).toBe(8);
    });

    test('should get phase allocations', () => {
      allocator.registerResource('eng-1', { name: 'Alice' });
      allocator.registerResource('eng-2', { name: 'Bob' });

      allocator.allocateResource('eng-1', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08')
      });
      allocator.allocateResource('eng-2', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08')
      });

      const phaseAllocs = allocator.getPhaseAllocations('phase-1');

      expect(phaseAllocs.length).toBe(2);
    });
  });

  describe('capacity planning', () => {
    test('should create capacity plan', () => {
      const plan = allocator.createCapacityPlan('phase-1', {
        targetTeamSize: 5,
        budget: 50000
      });

      expect(plan.phaseId).toBe('phase-1');
      expect(plan.targetTeamSize).toBe(5);
    });

    test('should calculate phase capacity', () => {
      allocator.registerResource('eng-1', { name: 'Alice', baseCapacity: 8 });
      allocator.registerResource('eng-2', { name: 'Bob', baseCapacity: 8 });

      allocator.allocateResource('eng-1', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08'),
        hoursPerDay: 6
      });
      allocator.allocateResource('eng-2', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08'),
        hoursPerDay: 8
      });

      const capacity = allocator.calculatePhaseCapacity('phase-1');

      expect(capacity.teamSize).toBe(2);
      expect(capacity.utilization).toBeGreaterThan(0);
    });
  });

  describe('resource leveling', () => {
    test('should detect over-allocations', () => {
      allocator.registerResource('eng-1', { name: 'Alice', baseCapacity: 8 });

      allocator.allocateResource('eng-1', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08'),
        hoursPerDay: 6
      });
      allocator.allocateResource('eng-1', 'phase-2', {
        startDate: new Date('2026-08-05'),
        endDate: new Date('2026-08-12'),
        hoursPerDay: 5
      });

      const leveling = allocator.levelResources('roadmap-1', []);

      expect(leveling.overAllocations.length).toBeGreaterThan(0);
    });
  });

  describe('budget tracking', () => {
    test('should calculate resource cost', () => {
      allocator.registerResource('eng-1', { name: 'Alice', costPerDay: 800 });

      const alloc = allocator.allocateResource('eng-1', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08'),
        hoursPerDay: 8
      });

      const cost = allocator.calculateResourceCost(alloc.id, 21);

      expect(cost.totalCost).toBeGreaterThan(0);
    });

    test('should calculate phase budget', () => {
      allocator.registerResource('eng-1', { name: 'Alice', costPerDay: 800 });
      allocator.registerResource('eng-2', { name: 'Bob', costPerDay: 600 });

      allocator.allocateResource('eng-1', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08'),
        hoursPerDay: 8
      });
      allocator.allocateResource('eng-2', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08'),
        hoursPerDay: 8
      });

      const budget = allocator.calculatePhaseBudget('phase-1', 21);

      expect(budget.totalBudget).toBeGreaterThan(0);
      expect(budget.resourceCount).toBe(2);
    });
  });

  describe('utilization metrics', () => {
    test('should calculate resource utilization', () => {
      allocator.registerResource('eng-1', {
        name: 'Alice',
        baseCapacity: 8,
        availability: 1.0
      });

      allocator.allocateResource('eng-1', 'phase-1', {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-08-08'),
        hoursPerDay: 4
      });

      const util = allocator.getResourceUtilization(
        'eng-1',
        new Date('2026-08-01'),
        new Date('2026-08-31')
      );

      expect(util.utilization).toBeGreaterThan(0);
    });
  });
});

describe('MilestoneTracker', () => {
  let tracker;

  beforeEach(() => {
    tracker = new MilestoneTracker();
  });

  describe('tracker management', () => {
    test('should create tracker', () => {
      const t = tracker.createTracker('tracker-1', {
        roadmapId: 'roadmap-1',
        name: 'Q3 Roadmap Tracking',
        milestones: ['m1', 'm2', 'm3']
      });

      expect(t.id).toBe('tracker-1');
      expect(t.milestones.length).toBe(3);
    });
  });

  describe('milestone updates', () => {
    test('should record milestone update', () => {
      tracker.createTracker('tracker-1', {
        roadmapId: 'roadmap-1',
        name: 'Tracker',
        milestones: ['m1']
      });

      const update = tracker.recordMilestoneUpdate('tracker-1', 'm1', {
        status: 'on_track',
        completion: 50,
        owner: 'alice@example.com'
      });

      expect(update.status).toBe('on_track');
      expect(update.completion).toBe(50);
    });

    test('should get milestone updates', () => {
      tracker.createTracker('tracker-1', {
        roadmapId: 'roadmap-1',
        milestones: ['m1']
      });

      tracker.recordMilestoneUpdate('tracker-1', 'm1', {
        status: 'on_track',
        completion: 25
      });
      tracker.recordMilestoneUpdate('tracker-1', 'm1', {
        status: 'on_track',
        completion: 50
      });

      const updates = tracker.getMilestoneUpdates('tracker-1', 'm1');

      expect(updates.length).toBe(2);
    });
  });

  describe('milestone health', () => {
    test('should calculate milestone health', () => {
      tracker.createTracker('tracker-1', {
        roadmapId: 'roadmap-1',
        milestones: ['m1']
      });

      tracker.recordMilestoneUpdate('tracker-1', 'm1', {
        status: 'on_track',
        completion: 75
      });

      const health = tracker.calculateMilestoneHealth('tracker-1', 'm1');

      expect(health.milestoneId).toBe('m1');
      expect(health.status).toBe('on_track');
      expect(health.health).toBeGreaterThan(50);
    });
  });

  describe('roadmap health', () => {
    test('should calculate roadmap health', () => {
      tracker.createTracker('tracker-1', {
        roadmapId: 'roadmap-1',
        milestones: ['m1', 'm2', 'm3']
      });

      tracker.recordMilestoneUpdate('tracker-1', 'm1', {
        status: 'on_track',
        completion: 80
      });
      tracker.recordMilestoneUpdate('tracker-1', 'm2', {
        status: 'on_track',
        completion: 60
      });
      tracker.recordMilestoneUpdate('tracker-1', 'm3', {
        status: 'at_risk',
        completion: 30
      });

      const health = tracker.calculateRoadmapHealth('tracker-1');

      expect(health.trackerId).toBe('tracker-1');
      expect(health.overallHealth).toBeGreaterThan(0);
      expect(health.milestoneCounts.total).toBe(3);
    });
  });

  describe('blocker management', () => {
    test('should get blockers', () => {
      tracker.createTracker('tracker-1', {
        roadmapId: 'roadmap-1',
        milestones: ['m1']
      });

      tracker.recordMilestoneUpdate('tracker-1', 'm1', {
        status: 'at_risk',
        completion: 30,
        blockers: [
          { description: 'API not ready', severity: 'high' },
          { description: 'Design review pending', severity: 'medium' }
        ]
      });

      const blockers = tracker.getBlockers('tracker-1');

      expect(blockers.length).toBe(2);
    });

    test('should get critical blockers', () => {
      tracker.createTracker('tracker-1', {
        roadmapId: 'roadmap-1',
        milestones: ['m1']
      });

      tracker.recordMilestoneUpdate('tracker-1', 'm1', {
        status: 'delayed',
        completion: 10,
        blockers: [
          { description: 'Database failure', severity: 'critical' },
          { description: 'Minor issue', severity: 'low' }
        ]
      });

      const critical = tracker.getCriticalBlockers('tracker-1');

      expect(critical.length).toBe(1);
      expect(critical[0].severity).toBe('critical');
    });
  });

  describe('reporting', () => {
    test('should generate tracker report', () => {
      tracker.createTracker('tracker-1', {
        roadmapId: 'roadmap-1',
        name: 'Q3 Tracking',
        milestones: ['m1']
      });

      tracker.recordMilestoneUpdate('tracker-1', 'm1', {
        status: 'on_track',
        completion: 50
      });

      const report = tracker.generateTrackerReport('tracker-1');

      expect(report.trackerId).toBe('tracker-1');
      expect(report.name).toBe('Q3 Tracking');
      expect(report.health).toBeTruthy();
    });
  });
});
