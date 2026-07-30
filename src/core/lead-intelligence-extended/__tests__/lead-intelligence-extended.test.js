/**
 * Lead Intelligence Extended Tests
 */

const CompanyIntelligence = require('../company-intelligence');
const DecisionMakerResolver = require('../decision-maker-resolver');
const OutreachOrchestrator = require('../outreach-orchestrator');

describe('CompanyIntelligence', () => {
  let ci;

  beforeEach(() => {
    ci = new CompanyIntelligence();
  });

  describe('company profiling', () => {
    test('should build company profile', () => {
      const profile = ci.buildCompanyProfile('comp-1', {
        name: 'TechCorp',
        industry: 'Software',
        website: 'techcorp.com',
        founded: 2020,
        headquarters: 'San Francisco, CA',
        employees: 50,
        stage: 'series-b'
      });

      expect(profile.id).toBe('comp-1');
      expect(profile.name).toBe('TechCorp');
      expect(profile.stage).toBe('series-b');
    });

    test('should assess data quality', () => {
      const profile = ci.buildCompanyProfile('comp-1', {
        name: 'TechCorp',
        industry: 'Software',
        website: 'techcorp.com',
        founded: 2020,
        headquarters: 'San Francisco'
      });

      expect(profile.dataQuality).toBe('excellent');
    });

    test('should list companies by filter', () => {
      ci.buildCompanyProfile('comp-1', {
        name: 'TechCorp',
        industry: 'Software',
        stage: 'series-b'
      });
      ci.buildCompanyProfile('comp-2', {
        name: 'FinCorp',
        industry: 'Finance',
        stage: 'seed'
      });

      const techCompanies = ci.listCompanies({ industry: 'Software' });

      expect(techCompanies.length).toBe(1);
      expect(techCompanies[0].name).toBe('TechCorp');
    });
  });

  describe('financial analysis', () => {
    test('should record financials', () => {
      ci.buildCompanyProfile('comp-1', { name: 'TechCorp' });

      const fin = ci.recordFinancials('comp-1', {
        year: 2025,
        revenue: 1000000,
        netIncome: 200000,
        arr: 1000000,
        mrr: 83333,
        churnRate: 2,
        growth: 50
      });

      expect(fin.revenue).toBe(1000000);
      expect(fin.arr).toBe(1000000);
    });

    test('should calculate financial metrics', () => {
      ci.buildCompanyProfile('comp-1', { name: 'TechCorp' });
      ci.recordFinancials('comp-1', {
        revenue: 1000000,
        costOfRevenue: 300000,
        netIncome: 200000,
        mrr: 83333,
        cac: 5000,
        ltv: 75000,
        churnRate: 2
      });

      const metrics = ci.calculateMetrics('comp-1');

      expect(metrics.grossMargin).toBeGreaterThan(0);
      expect(metrics.operatingMargin).toBeGreaterThan(0);
      expect(metrics.ltv_cac_ratio).toBeGreaterThan(0);
    });

    test('should assess financial health', () => {
      ci.buildCompanyProfile('comp-1', { name: 'TechCorp' });
      ci.recordFinancials('comp-1', {
        revenue: 500000,
        netIncome: 100000,
        fundingRaised: 1000000,
        burnRate: 50000,
        runway: 20
      });

      const metrics = ci.calculateMetrics('comp-1');

      expect(metrics.financialHealth).toBe('strong');
    });
  });

  describe('technology stack', () => {
    test('should record technology stack', () => {
      ci.buildCompanyProfile('comp-1', { name: 'TechCorp' });

      const tech = ci.recordTechnologyStack('comp-1', {
        frontend: ['React', 'TypeScript'],
        backend: ['Node.js', 'PostgreSQL'],
        infrastructure: ['Kubernetes', 'AWS'],
        scalability: 'high'
      });

      expect(tech.frontend.length).toBe(2);
      expect(tech.infrastructure.length).toBe(2);
    });

    test('should assess tech maturity', () => {
      ci.buildCompanyProfile('comp-1', { name: 'TechCorp' });
      ci.recordTechnologyStack('comp-1', {
        infrastructure: ['Kubernetes', 'Docker'],
        modernization: 'high',
        scalability: 'high',
        security: 'excellent',
        debtLevel: 'low'
      });

      const maturity = ci.assessTechMaturity('comp-1');

      expect(maturity.level).toBe('advanced');
      expect(maturity.score).toBeGreaterThan(70);
    });
  });

  describe('growth analysis', () => {
    test('should track growth trajectory', () => {
      ci.buildCompanyProfile('comp-1', {
        name: 'TechCorp',
        stage: 'series-a',
        employees: 30
      });
      ci.recordFinancials('comp-1', {
        revenue: 100000, // Pre-revenue condition
        fundingRaised: 5000000,
        growth: 80
      });

      const growth = ci.trackGrowth('comp-1', { growth: 80, employeeGrowth: 20, marketExpansion: 'rapid' });

      expect(growth.momentumScore).toBeGreaterThan(0);
    });

    test('should identify growth risks', () => {
      ci.buildCompanyProfile('comp-1', {
        name: 'TechCorp',
        stage: 'seed',
        employees: 5
      });
      ci.recordFinancials('comp-1', {
        revenue: 50000,
        burnRate: 50000,
        runway: 2
      });

      const growth = ci.trackGrowth('comp-1');

      expect(growth.risks.length).toBeGreaterThan(0);
    });
  });

  describe('competitive analysis', () => {
    test('should analyze competitive position', () => {
      ci.buildCompanyProfile('comp-1', {
        name: 'TechCorp',
        industry: 'Software',
        stage: 'series-b',
        employees: 50,
        strengths: ['AI technology', 'Strong team'],
        competitors: ['Competitor A', 'Competitor B']
      });

      const analysis = ci.analyzeCompetitivePosition('comp-1');

      expect(analysis.directCompetitors.length).toBe(2);
      expect(analysis.competitiveAdvantages.length).toBe(2);
    });
  });

  describe('reporting', () => {
    test('should generate company report', () => {
      ci.buildCompanyProfile('comp-1', {
        name: 'TechCorp',
        industry: 'Software'
      });
      ci.recordFinancials('comp-1', { revenue: 1000000 });
      ci.recordTechnologyStack('comp-1', {
        frontend: ['React'],
        backend: ['Node.js']
      });

      const report = ci.generateCompanyReport('comp-1');

      expect(report.profile).toBeTruthy();
      expect(report.financials).toBeTruthy();
      expect(report.technology).toBeTruthy();
    });
  });
});

describe('DecisionMakerResolver', () => {
  let dmr;

  beforeEach(() => {
    dmr = new DecisionMakerResolver();
  });

  describe('decision maker identification', () => {
    test('should identify decision maker', () => {
      const dm = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Alice',
        lastName: 'Johnson',
        title: 'VP of Engineering',
        department: 'technical',
        email: 'alice@techcorp.com'
      });

      expect(dm.firstName).toBe('Alice');
      expect(dm.influenceLevel).toBeGreaterThan(50);
      expect(dm.decisionPower).toBe('high');
    });

    test('should assess influence level', () => {
      const dmC = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Carol',
        lastName: 'CEO',
        title: 'Chief Executive Officer'
      });

      const dmE = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Eric',
        lastName: 'Dev',
        title: 'Software Engineer'
      });

      expect(dmC.influenceLevel).toBeGreaterThan(dmE.influenceLevel);
    });

    test('should search decision makers', () => {
      dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Alice',
        title: 'VP Sales',
        department: 'management'
      });
      dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Bob',
        title: 'Software Engineer',
        department: 'technical'
      });

      const sales = dmr.searchDecisionMakers({
        department: 'management'
      });

      expect(sales.length).toBe(1);
      expect(sales[0].firstName).toBe('Alice');
    });
  });

  describe('influence mapping', () => {
    test('should build influence graph', () => {
      const dm1 = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Alice',
        title: 'CEO'
      });
      const dm2 = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Bob',
        title: 'VP Engineering',
        manager: dm1.id
      });

      const graph = dmr.buildInfluenceGraph('comp-1', [dm1.id, dm2.id]);

      expect(graph.nodes.length).toBe(2);
      expect(graph.edges.length).toBeGreaterThan(0);
    });

    test('should identify buying committee', () => {
      const dm1 = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Alice',
        title: 'CEO',
        budget: 100000
      });
      const dm2 = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Bob',
        title: 'VP Sales',
        budget: 50000
      });
      const dm3 = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Carol',
        title: 'Marketing Manager'
      });

      const graph = dmr.buildInfluenceGraph('comp-1', [dm1.id, dm2.id, dm3.id]);

      expect(graph.buyingCommittee.decision_makers.length).toBeGreaterThan(0);
      expect(graph.buyingCommittee.budget_holders.length).toBe(2);
    });
  });

  describe('buyer persona development', () => {
    test('should develop buyer personas', () => {
      const dm1 = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Alice',
        title: 'VP Engineering',
        department: 'technical',
        painPoints: ['Scaling', 'Tech debt'],
        priorities: ['Performance', 'Reliability']
      });
      const dm2 = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Bob',
        title: 'VP Sales',
        department: 'management',
        painPoints: ['Revenue', 'Hiring'],
        priorities: ['Growth', 'Market share']
      });

      const personas = dmr.developBuyerPersona([dm1.id, dm2.id]);

      expect(personas.technical).toBeTruthy();
      expect(personas.management).toBeTruthy();
    });
  });

  describe('interaction tracking', () => {
    test('should record interaction', () => {
      const dm = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Alice',
        title: 'VP Engineering'
      });

      const interaction = dmr.recordInteraction(dm.id, {
        type: 'email',
        duration: 5,
        notes: 'Great discussion',
        sentiment: 'positive',
        outcome: 'interested'
      });

      expect(interaction.type).toBe('email');
      expect(interaction.sentiment).toBe('positive');
    });

    test('should get interaction history', () => {
      const dm = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Alice',
        title: 'VP Engineering'
      });

      dmr.recordInteraction(dm.id, { type: 'email' });
      dmr.recordInteraction(dm.id, { type: 'call' });

      const history = dmr.getInteractionHistory(dm.id);

      expect(history.length).toBe(2);
    });
  });

  describe('outreach readiness', () => {
    test('should assess outreach readiness', () => {
      const dm = dmr.identifyDecisionMaker('comp-1', {
        firstName: 'Alice',
        title: 'VP Engineering',
        email: 'alice@company.com',
        phone: '+1234567890',
        linkedin: 'alice-johnson'
      });

      const readiness = dmr.assessOutreachReadiness(dm.id);

      expect(readiness.contactQuality).toBeGreaterThan(50);
      expect(readiness.recommendedChannels.length).toBeGreaterThan(0);
    });
  });
});

describe('OutreachOrchestrator', () => {
  let orch;

  beforeEach(() => {
    orch = new OutreachOrchestrator();
  });

  describe('campaign management', () => {
    test('should create campaign', () => {
      const campaign = orch.createCampaign('campaign-1', {
        name: 'Summer 2026 Launch',
        objective: 'product_launch',
        targetCount: 500,
        budget: 10000
      });

      expect(campaign.id).toBe('campaign-1');
      expect(campaign.status).toBe('planning');
      expect(campaign.budget).toBe(10000);
    });

    test('should add contacts to campaign', () => {
      orch.createCampaign('campaign-1', { name: 'Campaign' });

      const contacts = [
        { firstName: 'Alice', company: 'TechCorp' },
        { firstName: 'Bob', company: 'FinCorp' }
      ];

      orch.addContactsToCampaign('campaign-1', contacts);
      const campaign = orch.getCampaign('campaign-1');

      expect(campaign.contacts.length).toBe(2);
    });

    test('should update campaign status', () => {
      orch.createCampaign('campaign-1', { name: 'Campaign' });
      const updated = orch.updateCampaignStatus('campaign-1', 'active');

      expect(updated.status).toBe('active');
      expect(updated.actualStart).toBeTruthy();
    });
  });

  describe('sequence design', () => {
    test('should create sequence', () => {
      const seq = orch.createSequence('seq-1', {
        name: 'Welcome Series',
        type: 'email',
        description: 'Initial welcome sequence'
      });

      expect(seq.id).toBe('seq-1');
      expect(seq.steps.length).toBe(0);
    });

    test('should add sequence steps', () => {
      orch.createSequence('seq-1', { name: 'Welcome Series' });

      orch.addSequenceStep('seq-1', {
        type: 'email',
        subject: 'Welcome to {{company}}',
        body: 'Hi {{firstName}}, welcome!',
        delayDays: 0
      });

      orch.addSequenceStep('seq-1', {
        type: 'email',
        subject: 'Quick question',
        body: 'Checking in...',
        delayDays: 3
      });

      const seq = orch.getSequence('seq-1');

      expect(seq.steps.length).toBe(2);
      expect(seq.steps[1].delayDays).toBe(3);
    });

    test('should estimate engagement', () => {
      orch.createSequence('seq-1', { name: 'Welcome Series' });
      orch.addSequenceStep('seq-1', { type: 'email', delayDays: 0 });
      orch.addSequenceStep('seq-1', { type: 'email', delayDays: 3 });

      const seq = orch.getSequence('seq-1');
      const engagement = orch.estimateEngagement(seq);

      expect(engagement.estimatedOpenRate).toBeGreaterThan(0.25);
      expect(engagement.estimatedClickRate).toBeGreaterThan(0.03);
    });
  });

  describe('execution & tracking', () => {
    test('should execute sequence', () => {
      orch.createCampaign('campaign-1', {
        name: 'Campaign',
        budget: 1000
      });
      orch.createSequence('seq-1', { name: 'Series' });
      orch.addSequenceStep('seq-1', { type: 'email', subject: 'Hi' });

      const contacts = [
        { firstName: 'Alice', email: 'alice@company.com' },
        { firstName: 'Bob', email: 'bob@company.com' }
      ];

      orch.addContactsToCampaign('campaign-1', contacts);
      const campaign = orch.getCampaign('campaign-1');

      const execution = orch.executeSequence('campaign-1', 'seq-1', campaign.contacts);

      expect(execution.status).toBe('running');
      expect(execution.results.sent).toBeGreaterThan(0);
    });

    test('should track response', () => {
      orch.createCampaign('campaign-1', { name: 'Campaign' });
      orch.createSequence('seq-1', { name: 'Series' });
      orch.addSequenceStep('seq-1', { type: 'email' });

      const contacts = [{ firstName: 'Alice' }];
      orch.addContactsToCampaign('campaign-1', contacts);
      const campaign = orch.getCampaign('campaign-1');

      const exec = orch.executeSequence('campaign-1', 'seq-1', campaign.contacts);

      // Get first message ID
      const messages = orch.responses.filter(r => r.executionId === exec.id);
      if (messages.length > 0) {
        const tracked = orch.trackResponse(messages[0].id, {
          status: 'opened'
        });

        expect(tracked.status).toBe('opened');
      }
    });
  });

  describe('analytics', () => {
    test('should calculate campaign metrics', () => {
      orch.createCampaign('campaign-1', {
        name: 'Campaign',
        budget: 1000
      });

      const metrics = orch.calculateCampaignMetrics('campaign-1');

      expect(metrics).toBeTruthy();
      expect(metrics.openRate).toBeGreaterThanOrEqual(0);
    });

    test('should generate campaign report', () => {
      orch.createCampaign('campaign-1', { name: 'Campaign', budget: 1000 });

      const report = orch.generateCampaignReport('campaign-1');

      expect(report.campaignId).toBe('campaign-1');
      expect(report.metrics).toBeTruthy();
      expect(report.nextSteps).toBeTruthy();
    });

    test('should estimate ROI', () => {
      const campaign = orch.createCampaign('campaign-1', {
        name: 'Campaign',
        budget: 5000
      });

      orch.addContactsToCampaign('campaign-1', [
        { firstName: 'Alice' },
        { firstName: 'Bob' }
      ]);

      const metrics = orch.calculateCampaignMetrics('campaign-1');
      const roi = orch.estimateROI(campaign, metrics);

      expect(roi.totalSpend).toBe(5000);
    });
  });
});
