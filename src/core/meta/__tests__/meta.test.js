/**
 * Meta Intelligence Engine Tests
 */

const KnowledgeGraph = require('../knowledge-graph');
const AutonomousBuilder = require('../autonomous-builder');
const StrategicSimulator = require('../strategic-simulator');
const GlobalOptimizer = require('../global-optimizer');
const LearningEngine = require('../learning-engine');

describe('KnowledgeGraph', () => {
  let graph;

  beforeEach(() => {
    graph = new KnowledgeGraph();
  });

  describe('node management', () => {
    test('should add node', () => {
      const node = graph.addNode('revenue-1', 'metric:business', { name: 'Revenue', value: 250000 });

      expect(graph.nodes.has('revenue-1')).toBe(true);
      expect(node.type).toBe('metric:business');
    });

    test('should prevent duplicate nodes', () => {
      graph.addNode('rev-1', 'metric:business', { name: 'Revenue', value: 250000 });

      expect(() => {
        graph.addNode('rev-1', 'metric:business', { name: 'Revenue' });
      }).toThrow('already exists');
    });

    test('should update node', () => {
      graph.addNode('rev-1', 'metric:business', { name: 'Revenue', value: 250000 });
      const updated = graph.updateNode('rev-1', { value: 300000 });

      expect(updated.data.value).toBe(300000);
    });

    test('should remove node', () => {
      graph.addNode('rev-1', 'metric:business', { name: 'Revenue' });
      const removed = graph.removeNode('rev-1');

      expect(removed).toBe(true);
      expect(graph.nodes.has('rev-1')).toBe(false);
    });
  });

  describe('edge management', () => {
    test('should add edge between nodes', () => {
      graph.addNode('revenue', 'metric:business', { name: 'Revenue' });
      graph.addNode('hiring', 'decision', { name: 'Hiring' });

      const edge = graph.addEdge('e1', 'revenue', 'hiring', 'drives', 0.8);

      expect(graph.edges.has('e1')).toBe(true);
      expect(edge.weight).toBe(0.8);
    });

    test('should fail adding edge with missing node', () => {
      graph.addNode('revenue', 'metric:business', { name: 'Revenue' });

      expect(() => {
        graph.addEdge('e1', 'revenue', 'missing', 'drives');
      }).toThrow('not found');
    });

    test('should remove edge', () => {
      graph.addNode('rev', 'metric', { name: 'Revenue' });
      graph.addNode('hiring', 'decision', { name: 'Hiring' });
      graph.addEdge('e1', 'rev', 'hiring', 'drives');

      const removed = graph.removeEdge('e1');

      expect(removed).toBe(true);
      expect(graph.edges.has('e1')).toBe(false);
    });
  });

  describe('queries', () => {
    test('should find nodes by type', () => {
      graph.addNode('rev', 'metric:business', { name: 'Revenue' });
      graph.addNode('churn', 'metric:business', { name: 'Churn' });
      graph.addNode('coverage', 'metric:engineering', { name: 'Coverage' });

      const business = graph.findNodesByType('metric:business');

      expect(business.length).toBe(2);
    });

    test('should find connected nodes', () => {
      graph.addNode('rev', 'metric', { name: 'Revenue' });
      graph.addNode('hiring', 'decision', { name: 'Hiring' });
      graph.addNode('velocity', 'metric', { name: 'Velocity' });

      graph.addEdge('e1', 'rev', 'hiring', 'drives');
      graph.addEdge('e2', 'hiring', 'velocity', 'impacts');

      const connected = graph.findConnectedNodes('rev');

      expect(connected.length).toBeGreaterThan(0);
    });

    test('should calculate shortest path', () => {
      graph.addNode('a', 'node', { name: 'A' });
      graph.addNode('b', 'node', { name: 'B' });
      graph.addNode('c', 'node', { name: 'C' });
      graph.addNode('d', 'node', { name: 'D' });

      graph.addEdge('e1', 'a', 'b', 'connects');
      graph.addEdge('e2', 'b', 'c', 'connects');
      graph.addEdge('e3', 'c', 'd', 'connects');
      graph.addEdge('e4', 'a', 'd', 'shortcut');

      const path = graph.getShortestPath('a', 'd');

      expect(path.distance).toBeLessThan(3);
    });
  });

  describe('analysis', () => {
    test('should analyze impact', () => {
      graph.addNode('price', 'metric', { name: 'Price' });
      graph.addNode('churn', 'metric', { name: 'Churn' });
      graph.addNode('revenue', 'metric', { name: 'Revenue' });

      graph.addEdge('e1', 'price', 'churn', 'constrains', 0.7);
      graph.addEdge('e2', 'churn', 'revenue', 'impacts', 0.8);

      const impact = graph.analyzeImpact('price', 2);

      expect(impact.directImpact.length).toBeGreaterThan(0);
    });

    test('should detect cycles', () => {
      graph.addNode('a', 'node', { name: 'A' });
      graph.addNode('b', 'node', { name: 'B' });
      graph.addNode('c', 'node', { name: 'C' });

      graph.addEdge('e1', 'a', 'b', 'connects');
      graph.addEdge('e2', 'b', 'c', 'connects');
      graph.addEdge('e3', 'c', 'a', 'connects');

      const cycles = graph.detectCycles();

      expect(cycles.length).toBeGreaterThan(0);
    });

    test('should calculate centrality scores', () => {
      for (let i = 0; i < 5; i++) {
        graph.addNode(`n${i}`, 'node', { name: `Node ${i}` });
      }

      graph.addEdge('e1', 'n0', 'n1', 'connects');
      graph.addEdge('e2', 'n0', 'n2', 'connects');
      graph.addEdge('e3', 'n1', 'n3', 'connects');

      const scores = graph.getCentralityScores(5);

      expect(scores.length).toBeGreaterThan(0);
      expect(scores[0].degree).toBeGreaterThanOrEqual(scores[1].degree);
    });
  });

  describe('export/import', () => {
    test('should export graph', () => {
      graph.addNode('n1', 'node', { name: 'Node1' });
      graph.addNode('n2', 'node', { name: 'Node2' });
      graph.addEdge('e1', 'n1', 'n2', 'connects');

      const exported = graph.export();

      expect(exported.nodes.length).toBe(2);
      expect(exported.edges.length).toBe(1);
    });

    test('should import graph', () => {
      const data = {
        nodes: [
          { id: 'n1', type: 'node', data: { name: 'Node1' }, relationships: [] },
          { id: 'n2', type: 'node', data: { name: 'Node2' }, relationships: [] }
        ],
        edges: []
      };

      graph.import(data);

      expect(graph.nodes.size).toBe(2);
    });
  });
});

describe('AutonomousBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new AutonomousBuilder();
  });

  describe('goal decomposition', () => {
    test('should decompose goal into epics', () => {
      const goal = {
        id: 'goal-1',
        name: 'Increase enterprise adoption',
        target: 225,
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        category: 'growth'
      };

      const decomposition = builder.decomposeGoal(goal);

      expect(decomposition.epics.length).toBeGreaterThan(0);
      expect(decomposition.stories.length).toBeGreaterThan(0);
      expect(decomposition.tasks.length).toBeGreaterThan(0);
    });

    test('should estimate timeline', () => {
      const goal = {
        name: 'Launch product',
        target: 1000,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        category: 'growth'
      };

      const decomposition = builder.decomposeGoal(goal);

      expect(decomposition.timeline.calendarDaysNeeded).toBeGreaterThan(0);
      expect(decomposition.timeline.riskLevel).toMatch(/low|medium|high/);
    });

    test('should identify risks', () => {
      const goal = {
        name: 'Complex initiative',
        target: 5000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'growth'
      };

      const decomposition = builder.decomposeGoal(goal);

      // Tight timeline should generate risks
      expect(decomposition.riskFactors.length).toBeGreaterThan(0);
    });
  });

  describe('project generation', () => {
    test('should generate project from decomposition', () => {
      const goal = {
        name: 'Test goal',
        target: 100,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        category: 'growth'
      };

      const decomposition = builder.decomposeGoal(goal);
      const project = builder.generateProject(decomposition);

      expect(project.name).toBe('Test goal');
      expect(project.status).toBe('active');
      expect(project.tasks.length).toBeGreaterThan(0);
    });

    test('should track project progress', () => {
      const goal = { name: 'Test', target: 100, deadline: new Date(), category: 'growth' };
      const decomposition = builder.decomposeGoal(goal);
      const project = builder.generateProject(decomposition);

      const taskId = project.tasks[0].id;
      builder.updateProjectProgress(project.id, taskId, 'completed');

      expect(project.metrics.completedTasks).toBe(1);
      expect(project.metrics.completionPercent).toBeGreaterThan(0);
    });
  });

  describe('resource planning', () => {
    test('should plan resources', () => {
      const goal = { name: 'Test', target: 100, deadline: new Date(), category: 'growth' };
      const decomposition = builder.decomposeGoal(goal);

      expect(decomposition.resourcePlan.totalHours).toBeGreaterThan(0);
      expect(decomposition.resourcePlan.engineersNeeded).toBeGreaterThan(0);
    });
  });
});

describe('StrategicSimulator', () => {
  let simulator;

  beforeEach(() => {
    simulator = new StrategicSimulator();
    simulator.setBaseline({
      revenue: 250000,
      churn: 0.05,
      nps: 50,
      costs: 150000
    });
  });

  describe('pricing simulations', () => {
    test('should simulate price increase', () => {
      const simulation = simulator.simulatePricingChange(0.10);

      expect(simulation.scenarios.length).toBe(3);
      expect(simulation.scenarios.every(s => s.name)).toBe(true);
      expect(simulation.expectedValue).toBeGreaterThan(0);
    });

    test('should generate pricing recommendation', () => {
      const simulation = simulator.simulatePricingChange(0.10);

      expect(simulation.recommendedAction).toBeTruthy();
      expect(simulation.recommendedAction.length).toBeGreaterThan(0);
    });
  });

  describe('feature launch simulations', () => {
    test('should simulate feature launch', () => {
      const feature = {
        name: 'White Label',
        targetSegment: 'Enterprise',
        developmentCost: 50000,
        segmentSize: 100,
        estimatedARPU: 200
      };

      const simulation = simulator.simulateFeatureLaunch(feature);

      expect(simulation.scenarios.length).toBe(3);
      expect(simulation.roi).toBeTruthy();
    });

    test('should calculate ROI', () => {
      const feature = {
        name: 'Feature',
        targetSegment: 'SMB',
        developmentCost: 30000
      };

      const simulation = simulator.simulateFeatureLaunch(feature);

      expect(simulation.roi.yearOneROI).toBeDefined();
      expect(simulation.roi.paybackPeriod).toBeGreaterThan(0);
    });
  });

  describe('hiring simulations', () => {
    test('should simulate hiring impact', () => {
      const hires = [
        { level: 'senior', salary: 150000 },
        { level: 'senior', salary: 140000 },
        { level: 'junior', salary: 80000 }
      ];

      const simulation = simulator.simulateHiring(hires);

      expect(simulation.scenarios.length).toBe(3);
      expect(simulation.totalAnnualCost).toBeGreaterThan(0);
    });

    test('should calculate velocity impact', () => {
      const hires = [
        { level: 'senior', salary: 150000 },
        { level: 'junior', salary: 80000 }
      ];

      const simulation = simulator.simulateHiring(hires);

      expect(simulation.velocityImpact.immediate).toBeGreaterThan(0);
    });
  });

  describe('tech debt simulations', () => {
    test('should simulate tech debt investment', () => {
      const investment = {
        currentDebt: 1000,
        investmentAmount: 100000,
        currentVelocity: 100,
        currentIncidents: 5
      };

      const simulation = simulator.simulateTechDebtInvestment(investment);

      expect(simulation.scenarios.length).toBe(3);
      expect(simulation.velocityGain).toBeTruthy();
    });
  });

  describe('market entry simulations', () => {
    test('should simulate market entry', () => {
      const market = {
        name: 'European Enterprise',
        tam: 10000000,
        entryInvestment: 500000,
        competitors: 3
      };

      const simulation = simulator.simulateMarketEntry(market);

      expect(simulation.scenarios.length).toBe(3);
      expect(simulation.competitiveThreat).toBeTruthy();
    });
  });

  describe('comparison', () => {
    test('should compare simulations', () => {
      const sim1 = simulator.simulatePricingChange(0.05);
      const sim2 = simulator.simulatePricingChange(0.10);
      const sim3 = simulator.simulatePricingChange(0.15);

      const comparison = simulator.compareSimulations([sim1.id, sim2.id, sim3.id]);

      expect(comparison.comparison.bestCase).toBeTruthy();
      expect(comparison.comparison.expectedValue).toBeTruthy();
    });
  });
});

describe('GlobalOptimizer', () => {
  let optimizer;

  beforeEach(() => {
    optimizer = new GlobalOptimizer();
    optimizer.setObjectives([
      { name: 'Revenue Growth', metric: 'revenue', direction: 'maximize', weight: 2, targetValue: 500000 },
      { name: 'Cost Efficiency', metric: 'costs', direction: 'minimize', weight: 1, targetValue: 100000 },
      { name: 'Quality', metric: 'quality', direction: 'maximize', weight: 1, targetValue: 0.9 }
    ]);
    optimizer.addConstraint('min_margin', 'netMargin', '>=', 0.40);
    optimizer.addConstraint('max_incidents', 'incidents', '<=', 10);
  });

  describe('optimization', () => {
    test('should generate candidate solutions', () => {
      const metrics = {
        revenue: 250000,
        costs: 150000,
        quality: 0.8,
        churn: 0.05
      };

      const candidates = optimizer.generateCandidateSolutions(metrics);

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates.every(c => c.expectedImpact)).toBe(true);
    });

    test('should filter feasible solutions', () => {
      const metrics = {
        revenue: 250000,
        costs: 150000,
        quality: 0.8,
        churn: 0.05,
        netMargin: 0.4,
        incidents: 5
      };

      const candidates = optimizer.generateCandidateSolutions(metrics);
      const feasible = optimizer.filterFeasible(candidates, metrics);

      expect(feasible.length).toBeGreaterThan(0);
    });

    test('should run optimization', () => {
      const metrics = {
        revenue: 250000,
        costs: 150000,
        quality: 0.8,
        churn: 0.05,
        netMargin: 0.4,
        incidents: 5
      };

      const result = optimizer.optimize(metrics);

      expect(result.feasibleSolutions).toBeGreaterThan(0);
      expect(result.optimalSolutions.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('quick wins', () => {
    test('should identify quick wins', () => {
      const metrics = {
        manualProcesses: 50,
        discountRate: 0.20,
        supportTickets: 2000,
        cloudSpend: 20000
      };

      const wins = optimizer.identifyQuickWins(metrics);

      expect(wins.length).toBeGreaterThan(0);
      expect(wins.every(w => w.effort && w.impact)).toBe(true);
    });
  });

  describe('risk identification', () => {
    test('should identify risks', () => {
      const metrics = {
        churn: 0.10,
        burnRate: 50000,
        runway: 365000,
        technicalDebtScore: 75,
        turnoverRate: 0.20
      };

      const risks = optimizer.identifyRisks(metrics);

      expect(risks.length).toBeGreaterThan(0);
      expect(risks.every(r => r.risk && r.mitigation)).toBe(true);
    });
  });
});

describe('LearningEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new LearningEngine();
    engine.registerModel('model-1', 'churn_prediction', { threshold: 0.5 });
  });

  describe('model management', () => {
    test('should register model', () => {
      const model = engine.getModel('model-1');

      expect(model).toBeTruthy();
      expect(model.type).toBe('churn_prediction');
      expect(model.version).toBe(1);
    });

    test('should update model version', () => {
      engine.updateModelVersion('model-1', { threshold: 0.6 });
      const model = engine.getModel('model-1');

      expect(model.version).toBe(2);
      expect(model.parameters.threshold).toBe(0.6);
    });
  });

  describe('predictions and feedback', () => {
    test('should record prediction', () => {
      const pred = engine.recordPrediction('model-1', { usage: 50 }, 0.8, 0.9);

      expect(pred.status).toBe('pending');
      expect(pred.confidence).toBe(0.9);
    });

    test('should provide feedback', () => {
      const pred = engine.recordPrediction('model-1', { usage: 50 }, 0.8, 0.9);
      const feedback = engine.provideFeedback(pred.id, 0.75, 'Accurate prediction');

      expect(feedback.status).toBe('evaluated');
      expect(feedback.actual).toBe(0.75);
    });
  });

  describe('learning cycles', () => {
    test('should handle insufficient data', () => {
      const cycle = engine.runLearningCycle('model-1');

      expect(cycle.status).toBe('insufficient_data');
    });

    test('should run learning cycle with sufficient data', () => {
      // Add predictions
      for (let i = 0; i < 20; i++) {
        const pred = engine.recordPrediction('model-1', { usage: Math.random() * 100 }, Math.random(), 0.8);
        engine.provideFeedback(pred.id, Math.random() * 1.5);
      }

      const cycle = engine.runLearningCycle('model-1');

      expect(cycle.evaluatedCount).toBeGreaterThan(0);
      expect(cycle.newAccuracy).toBeDefined();
    });
  });

  describe('analytics', () => {
    test('should get performance summary', () => {
      for (let i = 0; i < 15; i++) {
        const pred = engine.recordPrediction('model-1', { usage: Math.random() * 100 }, Math.random(), 0.8);
        engine.provideFeedback(pred.id, Math.random());
      }

      const summary = engine.getPerformanceSummary();

      expect(summary.totalPredictions).toBeGreaterThan(0);
      expect(summary.feedbackRate).toBeGreaterThan(0);
    });

    test('should identify patterns', () => {
      for (let i = 0; i < 20; i++) {
        const pred = engine.recordPrediction('model-1', { segment: i % 3 ? 'A' : 'B', usage: Math.random() * 100 }, Math.random(), 0.8);
        engine.provideFeedback(pred.id, Math.random());
      }

      const patterns = engine.identifyPatterns('segment', 0.1);

      expect(patterns.patterns.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('export/import', () => {
    test('should export learning data', () => {
      const pred = engine.recordPrediction('model-1', { usage: 50 }, 0.8, 0.9);
      engine.provideFeedback(pred.id, 0.75);

      const exported = engine.exportLearningData();

      expect(exported.models.length).toBe(1);
      expect(exported.predictions.length).toBe(1);
    });

    test('should import learning data', () => {
      const data = {
        models: [{ id: 'model-2', type: 'test', accuracy: 0.8, version: 1, predictions: [], feedback: [] }],
        predictions: [],
        feedback: [],
        learningCycles: []
      };

      engine.importLearningData(data);
      const model = engine.getModel('model-2');

      expect(model).toBeTruthy();
    });
  });
});
