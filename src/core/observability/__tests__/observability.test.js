/**
 * Observability Tests
 */

const MonitoringEngine = require('../monitoring-engine');
const AlertingSystem = require('../alerting-system');
const AnomalyDetector = require('../anomaly-detector');
const IncidentManager = require('../incident-manager');
const SelfHealingOrchestrator = require('../self-healing-orchestrator');

describe('MonitoringEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new MonitoringEngine();
  });

  describe('metric registration', () => {
    test('should register metric', () => {
      const metric = engine.registerMetric('cpu_usage', {
        name: 'CPU Usage',
        type: 'gauge',
        unit: 'percent'
      });

      expect(metric.id).toBe('cpu_usage');
      expect(metric.type).toBe('gauge');
    });

    test('should list metrics', () => {
      engine.registerMetric('cpu', { name: 'CPU', type: 'gauge' });
      engine.registerMetric('memory', { name: 'Memory', type: 'gauge' });

      const metrics = engine.listMetrics();

      expect(metrics.length).toBe(2);
    });
  });

  describe('data collection', () => {
    test('should record metric', () => {
      engine.registerMetric('cpu_usage', { name: 'CPU' });
      const dataPoint = engine.recordMetric('cpu_usage', 75);

      expect(dataPoint.value).toBe(75);
      expect(dataPoint.timestamp).toBeTruthy();
    });

    test('should record batch', () => {
      engine.registerMetric('cpu', { name: 'CPU' });
      engine.registerMetric('memory', { name: 'Memory' });

      const results = engine.recordBatch([
        { metricId: 'cpu', value: 50 },
        { metricId: 'memory', value: 60 }
      ]);

      expect(results.length).toBe(2);
    });

    test('should enforce retention policy', () => {
      engine.registerMetric('cpu', { name: 'CPU', retention: 100 });

      for (let i = 0; i < 10; i++) {
        engine.recordMetric('cpu', Math.random() * 100);
      }

      const timeSeries = engine.getTimeSeries('cpu');

      expect(timeSeries.length).toBeGreaterThan(0);
    });
  });

  describe('statistics', () => {
    test('should calculate metric stats', () => {
      engine.registerMetric('response_time', { name: 'Response Time' });

      for (let i = 0; i < 20; i++) {
        engine.recordMetric('response_time', 50 + Math.random() * 100);
      }

      const stats = engine.getMetricStats('response_time');

      expect(stats.mean).toBeGreaterThan(0);
      expect(stats.min).toBeLessThanOrEqual(stats.max);
    });
  });

  describe('dashboard', () => {
    test('should create dashboard', () => {
      const dashboard = engine.createDashboard('dashboard-1', {
        name: 'System Overview'
      });

      expect(dashboard.id).toBe('dashboard-1');
      expect(dashboard.panels.length).toBe(0);
    });

    test('should add panel', () => {
      engine.createDashboard('dashboard-1', { name: 'System' });
      const panel = engine.addPanel('dashboard-1', {
        title: 'CPU Usage',
        type: 'graph',
        metrics: ['cpu_usage']
      });

      expect(panel.title).toBe('CPU Usage');
    });
  });
});

describe('AlertingSystem', () => {
  let system;

  beforeEach(() => {
    system = new AlertingSystem();
  });

  describe('alert rules', () => {
    test('should create alert rule', () => {
      const rule = system.createAlertRule('rule-1', {
        name: 'High CPU',
        condition: { metric: 'cpu', operator: '>', threshold: 80 },
        actions: [{ type: 'notify', target: { type: 'email' } }]
      });

      expect(rule.id).toBe('rule-1');
      expect(rule.enabled).toBe(true);
    });

    test('should list alert rules', () => {
      system.createAlertRule('r1', {
        name: 'Rule 1',
        condition: { metric: 'cpu', operator: '>', threshold: 80 },
        actions: []
      });

      system.createAlertRule('r2', {
        name: 'Rule 2',
        condition: { metric: 'memory', operator: '>', threshold: 90 },
        actions: []
      });

      const rules = system.listAlertRules();

      expect(rules.length).toBe(2);
    });
  });

  describe('alert evaluation', () => {
    test('should fire alert when condition met', () => {
      system.createAlertRule('rule-1', {
        name: 'High CPU',
        condition: { metric: 'cpu', operator: '>', threshold: 80 },
        actions: [{ type: 'notify', target: { type: 'email' } }]
      });

      const alert = system.evaluateRule('rule-1', 85);

      expect(alert).toBeTruthy();
      expect(alert.status).toBe('firing');
    });

    test('should not fire alert when condition not met', () => {
      system.createAlertRule('rule-1', {
        name: 'High CPU',
        condition: { metric: 'cpu', operator: '>', threshold: 80 },
        actions: []
      });

      const alert = system.evaluateRule('rule-1', 50);

      expect(alert).toBeNull();
    });
  });

  describe('silences', () => {
    test('should create silence', () => {
      const silence = system.createSilence('silence-1', {
        matchers: [{ name: 'service', type: '=', value: 'api' }],
        endsAt: new Date(Date.now() + 60 * 60 * 1000)
      });

      expect(silence.id).toBe('silence-1');
    });

    test('should check if alert is silenced', () => {
      system.createSilence('silence-1', {
        matchers: [{ name: 'service', type: '=', value: 'api' }]
      });

      const alert = {
        id: 'alert-1',
        labels: { service: 'api' }
      };

      const silenced = system.isSilenced(alert);

      expect(silenced).toBe(true);
    });
  });
});

describe('AnomalyDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new AnomalyDetector();
  });

  describe('detector creation', () => {
    test('should create detector', () => {
      const d = detector.createDetector('detector-1', {
        name: 'CPU Anomaly',
        metricId: 'cpu_usage',
        method: 'zscore'
      });

      expect(d.id).toBe('detector-1');
      expect(d.method).toBe('zscore');
    });
  });

  describe('baseline calculation', () => {
    test('should calculate baseline', () => {
      const timeSeries = Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(),
        value: 50 + Math.random() * 10
      }));

      const baseline = detector.calculateBaseline('cpu', timeSeries);

      expect(baseline.mean).toBeGreaterThan(0);
      expect(baseline.stdDev).toBeGreaterThan(0);
    });
  });

  describe('anomaly detection', () => {
    test('should detect z-score anomaly', () => {
      detector.createDetector('detector-1', {
        name: 'CPU Anomaly',
        metricId: 'cpu',
        method: 'zscore',
        sensitivity: 2
      });

      const timeSeries = Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(),
        value: 50 + Math.random() * 10
      }));

      detector.calculateBaseline('cpu', timeSeries);
      const anomaly = detector.detectAnomaly('detector-1', 100, timeSeries);

      expect(anomaly).toBeTruthy();
      expect(anomaly.method).toBe('zscore');
    });
  });

  describe('trend analysis', () => {
    test('should analyze trend', () => {
      const timeSeries = Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(),
        value: i * 5 + Math.random() * 2
      }));

      const trend = detector.analyzeTrend(timeSeries);

      expect(trend.trend).toBeTruthy();
      expect(trend.percentChange).toBeDefined();
    });
  });
});

describe('IncidentManager', () => {
  let manager;

  beforeEach(() => {
    manager = new IncidentManager();
  });

  describe('incident management', () => {
    test('should create incident', () => {
      const incident = manager.createIncident('inc-1', {
        title: 'API Down',
        description: 'API service is down',
        severity: 'critical'
      });

      expect(incident.id).toBe('inc-1');
      expect(incident.status).toBe('open');
    });

    test('should update incident status', () => {
      manager.createIncident('inc-1', { title: 'Issue', severity: 'high' });
      const updated = manager.updateIncidentStatus('inc-1', 'investigating');

      expect(updated.status).toBe('investigating');
    });

    test('should list incidents', () => {
      manager.createIncident('inc-1', { title: 'Issue 1', severity: 'high' });
      manager.createIncident('inc-2', { title: 'Issue 2', severity: 'low' });

      const incidents = manager.listIncidents({ severity: 'high' });

      expect(incidents.length).toBeGreaterThan(0);
    });
  });

  describe('timeline', () => {
    test('should add timeline entry', () => {
      manager.createIncident('inc-1', { title: 'Issue', severity: 'high' });
      const entry = manager.addTimelineEntry('inc-1', 'update', 'Status changed');

      expect(entry.type).toBe('update');
    });

    test('should get timeline', () => {
      manager.createIncident('inc-1', { title: 'Issue', severity: 'high' });
      manager.addTimelineEntry('inc-1', 'update', 'Message');

      const timeline = manager.getTimeline('inc-1');

      expect(timeline.length).toBeGreaterThan(0);
    });
  });

  describe('runbooks', () => {
    test('should create runbook', () => {
      const runbook = manager.createRunbook('runbook-1', {
        name: 'API Recovery',
        steps: [{ name: 'Step 1', action: 'restart' }]
      });

      expect(runbook.id).toBe('runbook-1');
    });
  });

  describe('post-mortem', () => {
    test('should generate post-mortem', () => {
      manager.createIncident('inc-1', { title: 'Issue', severity: 'critical' });
      manager.updateIncidentStatus('inc-1', 'resolved');

      const postmortem = manager.generatePostMortem('inc-1', {
        summary: 'Summary of incident'
      });

      expect(postmortem.incidentId).toBe('inc-1');
      expect(postmortem.duration).toBeTruthy();
    });
  });
});

describe('SelfHealingOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new SelfHealingOrchestrator();
  });

  describe('healing rules', () => {
    test('should create healing rule', () => {
      const rule = orchestrator.createHealingRule('rule-1', {
        name: 'Restart Service',
        trigger: { type: 'anomaly', condition: { severity: 'critical' } },
        action: { type: 'restart_service', target: 'api' }
      });

      expect(rule.id).toBe('rule-1');
      expect(rule.enabled).toBe(true);
    });

    test('should list healing rules', () => {
      orchestrator.createHealingRule('r1', {
        name: 'Rule 1',
        trigger: { type: 'anomaly' },
        action: { type: 'restart_service', target: 'api' }
      });

      orchestrator.createHealingRule('r2', {
        name: 'Rule 2',
        trigger: { type: 'anomaly' },
        action: { type: 'scale_up', target: 'worker' }
      });

      const rules = orchestrator.listHealingRules();

      expect(rules.length).toBe(2);
    });
  });

  describe('remedial actions', () => {
    test('should execute healing action', () => {
      orchestrator.createHealingRule('rule-1', {
        name: 'Scale Up',
        trigger: { type: 'anomaly' },
        action: { type: 'scale_up', target: 'worker', parameters: { instances: 2 } }
      });

      const action = orchestrator.executeHealing('rule-1', { severity: 'critical' });

      expect(action).toBeTruthy();
      expect(action.status).toBe('success');
    });
  });

  describe('autoscaling', () => {
    test('should create autoscaling policy', () => {
      const policy = orchestrator.createAutoscalingPolicy('policy-1', {
        name: 'API Autoscale',
        target: 'api-server',
        minInstances: 2,
        maxInstances: 10,
        scaleUpThreshold: 80
      });

      expect(policy.id).toBe('policy-1');
      expect(policy.maxInstances).toBe(10);
    });

    test('should evaluate autoscaling', () => {
      orchestrator.createAutoscalingPolicy('policy-1', {
        name: 'API Autoscale',
        target: 'api-server',
        minInstances: 2,
        maxInstances: 10,
        scaleUpThreshold: 80
      });

      const action = orchestrator.evaluateAutoscaling('policy-1', 85, 5);

      expect(action).toBeTruthy();
      expect(action.action).toBe('scale_up');
    });
  });

  describe('statistics', () => {
    test('should get healing stats', () => {
      orchestrator.createHealingRule('r1', {
        name: 'Rule 1',
        trigger: { type: 'anomaly' },
        action: { type: 'restart_service', target: 'api' }
      });

      const stats = orchestrator.getHealingStats();

      expect(stats.healingRules).toBe(1);
      expect(stats.total).toBe(0); // no actions executed yet
    });
  });
});
