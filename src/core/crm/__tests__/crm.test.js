/**
 * CRM Tests
 */

const ContactManager = require('../../../src/core/crm/contact-manager');
const HealthScorer = require('../../../src/core/crm/health-scorer');
const NPSLifecycleManager = require('../../../src/core/crm/nps-lifecycle');

describe('ContactManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ContactManager();
  });

  test('should create contact', () => {
    const contact = manager.createContact({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      title: 'CEO',
      company: 'Acme'
    });

    expect(contact.firstName).toBe('John');
    expect(contact.email).toBe('john@example.com');
  });

  test('should create company', () => {
    const company = manager.createCompany({
      name: 'Acme Inc',
      domain: 'acme.com',
      industry: 'Technology',
      size: '100-500'
    });

    expect(company.name).toBe('Acme Inc');
    expect(company.healthScore).toBe(50);
  });

  test('should create and move deal through pipeline', () => {
    const deal = manager.createDeal({
      name: 'Enterprise Deal',
      amount: 50000,
      stage: 'qualified',
      owner: 'sales@example.com'
    });

    expect(deal.amount).toBe(50000);
    expect(deal.probability).toBe(25);

    manager.updateDealStage(deal.id, 'proposal');
    const updated = manager.deals.get(deal.id);
    expect(updated.probability).toBe(50);
  });

  test('should calculate pipeline', () => {
    manager.createDeal({ name: 'Deal 1', amount: 10000, stage: 'qualified', owner: 'user' });
    manager.createDeal({ name: 'Deal 2', amount: 20000, stage: 'proposal', owner: 'user' });

    const pipeline = manager.getPipeline();
    expect(pipeline.qualified.value).toBe(10000);
    expect(pipeline.proposal.value).toBe(20000);
  });

  test('should calculate win rate', () => {
    manager.createDeal({ name: 'Deal 1', amount: 10000, stage: 'won', owner: 'user' });
    manager.createDeal({ name: 'Deal 2', amount: 20000, stage: 'lost', owner: 'user' });

    const winRate = manager.getWinRate();
    expect(winRate).toBe('50.00');
  });

  test('should calculate weighted forecast', () => {
    manager.createDeal({ name: 'Deal 1', amount: 10000, stage: 'proposal', owner: 'user' });
    const forecast = manager.getWeightedForecast();
    expect(forecast).toBe(5000); // 10000 * 50% probability
  });
});

describe('HealthScorer', () => {
  let scorer;

  beforeEach(() => {
    scorer = new HealthScorer();
  });

  test('should calculate health score', () => {
    const health = scorer.calculateHealth('cust-123', {
      adoptionPercent: 100,
      monthlyActiveUsers: 5,
      totalUsers: 5,
      npsScore: 50,
      supportSentiment: 0.8
    });

    expect(health.score).toBeGreaterThan(80);
    expect(health.status).toBe('green');
  });

  test('should identify red status (at risk)', () => {
    const health = scorer.calculateHealth('cust-456', {
      adoptionPercent: 10,
      monthlyActiveUsers: 0,
      totalUsers: 5,
      npsScore: -50,
      supportSentiment: 0.2
    });

    expect(health.status).toBe('red');
  });

  test('should predict churn risk', () => {
    const health = { status: 'red', score: 20 };
    const risk = scorer.predictChurnRisk(health);
    expect(risk).toBe('high');
  });

  test('should identify upsell opportunity', () => {
    const health = {
      status: 'green',
      components: { usage: 85 },
      score: 95
    };
    const opportunity = scorer.getUpsellOpportunity(health);
    expect(opportunity.recommendation).toBe('upsell');
  });
});

describe('NPSLifecycleManager', () => {
  let manager;

  beforeEach(() => {
    manager = new NPSLifecycleManager();
  });

  test('should categorize NPS responses', () => {
    expect(manager.categorizeResponse(10)).toBe('promoter');
    expect(manager.categorizeResponse(8)).toBe('passive');
    expect(manager.categorizeResponse(5)).toBe('detractor');
  });

  test('should calculate NPS score', () => {
    manager.recordNPSResponse('survey-1', 10);
    manager.recordNPSResponse('survey-2', 10);
    manager.recordNPSResponse('survey-3', 0);

    const nps = manager.calculateNPS();
    expect(nps).toBe(33); // (2 promoters - 1 detractor) / 3 * 100
  });

  test('should analyze sentiment from comment', () => {
    const sentiment = manager.analyzeSentiment('Great product, love it!');
    expect(sentiment).toBeGreaterThan(0.7);
  });

  test('should create lifecycle event', () => {
    const event = manager.createLifecycleEvent('cust-123', 'onboarding_started');
    expect(event.type).toBe('onboarding_started');
  });

  test('should determine lifecycle stage', () => {
    const stage = manager.getLifecycleStage(25, 1, 50);
    expect(stage).toBe('onboarding');
  });
});
