/**
 * Automation Engine Tests
 */

const WorkflowEngine = require('../../../src/core/automation/workflow-engine');
const IntegrationHub = require('../../../src/core/automation/integration-hub');
const WorkflowTemplates = require('../../../src/core/automation/workflow-templates');

describe('WorkflowEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  test('should create workflow', () => {
    const workflow = engine.createWorkflow('Test Workflow', 
      { type: 'event', event: 'contact_created' },
      [{ type: 'send_email', template: 'welcome' }]
    );

    expect(workflow.name).toBe('Test Workflow');
    expect(workflow.status).toBe('draft');
  });

  test('should evaluate event trigger', () => {
    const workflow = {
      trigger: { type: 'event', event: 'contact_created' }
    };
    const context = { event: 'contact_created' };

    const matches = engine.evaluateTrigger(workflow, context);
    expect(matches).toBe(true);
  });

  test('should evaluate condition trigger', () => {
    const workflow = {
      trigger: { type: 'condition', condition: { field: 'score', operator: 'greater_than', value: 50 } }
    };
    const context = { score: 75 };

    const matches = engine.evaluateTrigger(workflow, context);
    expect(matches).toBe(true);
  });

  test('should execute workflow', async () => {
    const workflow = engine.createWorkflow('Test',
      { type: 'event', event: 'contact_created' },
      [
        { id: 'a1', type: 'send_email', template: 'welcome', required: true },
        { id: 'a2', type: 'create_task', title: 'Follow up' }
      ]
    );

    engine.publishWorkflow(workflow.id);

    const execution = await engine.executeWorkflow(workflow.id, { event: 'contact_created' });

    expect(execution.status).toBe('completed');
    expect(execution.actions.length).toBe(2);
  });

  test('should track execution stats', async () => {
    const workflow = engine.createWorkflow('Test',
      { type: 'event', event: 'test' },
      [{ type: 'send_email', template: 'welcome' }]
    );

    engine.publishWorkflow(workflow.id);

    await engine.executeWorkflow(workflow.id, { event: 'test' });
    await engine.executeWorkflow(workflow.id, { event: 'test' });

    const stats = engine.getExecutionStats(workflow.id);

    expect(stats.total).toBe(2);
    expect(stats.successful).toBe(2);
    expect(stats.successRate).toBe('100.00');
  });
});

describe('IntegrationHub', () => {
  let hub;

  beforeEach(() => {
    hub = new IntegrationHub();
  });

  test('should register integration', () => {
    const result = hub.registerIntegration('salesforce', { 
      apiKey: 'test-key',
      endpoint: 'https://api.salesforce.com'
    });

    expect(result.type).toBe('salesforce');
    expect(result.status).toBe('connected');
  });

  test('should get integration by type', () => {
    hub.registerIntegration('slack', { token: 'test-token' });
    const integration = hub.getIntegration('slack');

    expect(integration).not.toBeNull();
    expect(integration.type).toBe('slack');
  });

  test('should sync data from integration', async () => {
    hub.registerIntegration('salesforce', { apiKey: 'test' });

    const result = await hub.syncData('salesforce', 'contacts');

    expect(result.success).toBe(true);
    expect(result.recordsProcessed).toBeGreaterThan(0);
  });

  test('should register webhook', () => {
    const webhook = hub.registerWebhook('https://example.com/webhook', ['contact_created']);

    expect(webhook.url).toBe('https://example.com/webhook');
    expect(webhook.status).toBe('active');
  });

  test('should send webhook', async () => {
    const webhook = hub.registerWebhook('https://example.com/webhook', []);
    const response = await hub.sendWebhook(webhook.id, { test: 'data' });

    expect(response.statusCode).toBe(200);
  });
});

describe('WorkflowTemplates', () => {
  test('should load welcome sequence template', () => {
    const templates = WorkflowTemplates.getTemplates();
    const template = templates.welcome_sequence;

    expect(template.name).toContain('Welcome');
    expect(template.actions.length).toBe(3);
  });

  test('should load lead nurture template', () => {
    const templates = WorkflowTemplates.getTemplates();
    const template = templates.lead_nurture;

    expect(template.trigger.type).toBe('event');
    expect(template.actions.length).toBeGreaterThan(0);
  });

  test('should load churn prevention template', () => {
    const templates = WorkflowTemplates.getTemplates();
    const template = templates.churn_prevention;

    expect(template.trigger.type).toBe('condition');
    expect(template.actions.some(a => a.type === 'webhook')).toBe(true);
  });

  test('should have 6 templates', () => {
    const templates = WorkflowTemplates.getTemplates();
    expect(Object.keys(templates).length).toBe(6);
  });
});
