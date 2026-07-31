/**
 * DEL 8 Tests: Lead Intelligence Extended
 * Company Intelligence, Decision Maker Research, Outreach Sequences
 */

import { CompanyIntelligence } from '../src/modules/lead-intelligence/src/company-intelligence';
import { DecisionMakerResearch } from '../src/modules/lead-intelligence/src/decision-maker-research';
import { OutreachSequences } from '../src/modules/lead-intelligence/src/outreach-sequences';

describe('DEL 8: Lead Intelligence Extended', () => {
  let companyIntel: CompanyIntelligence;
  let decisionMaker: DecisionMakerResearch;
  let outreach: OutreachSequences;

  beforeEach(() => {
    companyIntel = new CompanyIntelligence();
    decisionMaker = new DecisionMakerResearch();
    outreach = new OutreachSequences();
  });

  describe('CompanyIntelligence', () => {
    test('should build company profile', () => {
      const profile = companyIntel.buildProfile({
        companyName: 'TechCorp',
        domain: 'techcorp.com',
        industry: 'Software',
        employees: 250,
        revenue: 50000000,
        techStack: ['React', 'Node.js', 'PostgreSQL'],
        competitors: ['CompetitorA', 'CompetitorB'],
        marketPosition: 'challenger',
      });

      expect(profile.companyName).toBe('TechCorp');
      expect(profile.employees).toBe(250);
      expect(profile.techStack).toHaveLength(3);
      expect(profile.growthMetrics).toBeDefined();
    });

    test('should analyze tech stack modernization', () => {
      const analysis = companyIntel.analyzeStackModernization([
        'React',
        'Node.js',
        'PostgreSQL',
        'Kubernetes',
      ]);

      expect(analysis.currentStack).toHaveLength(4);
      expect(analysis.modernizationGap).toBeLessThanOrEqual(100);
      expect(analysis.modernizationGap).toBeGreaterThanOrEqual(0);
      expect(analysis.migrationComplexity).toMatch(/low|medium|high/);
    });

    test('should recommend tech stack improvements', () => {
      const analysis = companyIntel.analyzeStackModernization([
        'jQuery',
        'MySQL',
        'Monolith',
      ]);

      expect(analysis.recommendedTech).toContain('TypeScript');
      expect(analysis.modernizationGap).toBeGreaterThan(50);
    });

    test('should analyze competitors', () => {
      const competitors = companyIntel.analyzeCompetitors(['Competitor1', 'Competitor2']);

      expect(competitors).toHaveLength(2);
      competitors.forEach(c => {
        expect(c.competitor).toBeDefined();
        expect(c.marketShare).toBeGreaterThan(0);
        expect(c.marketShare).toBeLessThan(100);
        expect(c.strengths).toBeDefined();
        expect(c.weaknesses).toBeDefined();
        expect(c.threatLevel).toBeGreaterThanOrEqual(0);
        expect(c.threatLevel).toBeLessThanOrEqual(100);
      });
    });

    test('should score company fit', () => {
      const profile = companyIntel.buildProfile({
        companyName: 'GrowthCo',
        industry: 'SaaS',
        employees: 500,
        growthMetrics: {
          yearlySalesGrowth: 75,
          employeeGrowth: 30,
          fundingMomentum: 85,
        },
        signals: [
          { type: 'hiring', description: 'Hiring engineers', date: '2026-01-15', impact: 'high', relevance: 90 },
          { type: 'funding', description: 'Series B round', date: '2026-02-01', impact: 'high', relevance: 95 },
        ],
      });

      const fit = companyIntel.scoreCompanyFit(profile);

      expect(fit).toBeGreaterThanOrEqual(0);
      expect(fit).toBeLessThanOrEqual(100);
      expect(fit).toBeGreaterThan(50); // High growth should score well
    });
  });

  describe('DecisionMakerResearch', () => {
    test('should identify decision makers', () => {
      const makers = decisionMaker.identifyDecisionMakers('TechCorp');

      expect(makers).toBeDefined();
      expect(makers.length).toBeGreaterThan(0);
      makers.forEach(m => {
        expect(m.name).toBeDefined();
        expect(m.title).toBeDefined();
        expect(m.department).toBeDefined();
        expect(m.seniority).toMatch(/C-level|Director|Manager|Individual Contributor/);
        expect(m.influenceScore).toBeGreaterThanOrEqual(0);
        expect(m.influenceScore).toBeLessThanOrEqual(100);
      });
    });

    test('should filter makers by department', () => {
      const makers = decisionMaker.identifyDecisionMakers('TechCorp', 'Engineering');

      makers.forEach(m => {
        expect(m.department).toBe('Engineering');
      });
    });

    test('should build buying committee', () => {
      const makers = decisionMaker.identifyDecisionMakers('TechCorp');
      const committee = decisionMaker.buildBuyingCommittee(makers);

      expect(committee.champion || committee.budgetOwner).toBeDefined(); // At least one exists
      expect(committee.alignment).toBeGreaterThanOrEqual(0);
      expect(committee.alignment).toBeLessThanOrEqual(100);
      expect(committee.buyingCycle).toBeGreaterThan(0);
      expect(committee.complexity).toMatch(/simple|moderate|complex/);
    });

    test('should score decision maker fit', () => {
      const makers = decisionMaker.identifyDecisionMakers('TechCorp');
      const score = decisionMaker.scoreDecisionMaker(makers[0]);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should generate outreach strategy', () => {
      const makers = decisionMaker.identifyDecisionMakers('TechCorp');
      const committee = decisionMaker.buildBuyingCommittee(makers);
      const strategy = decisionMaker.generateOutreachStrategy(committee);

      expect(strategy.keyMessaging).toBeDefined();
      expect(strategy.keyMessaging.length).toBeGreaterThan(0);
      expect(strategy.optimalTiming).toBeDefined();
      expect(strategy.successCriteria).toBeDefined();
      expect(strategy.successCriteria.length).toBeGreaterThan(0);
    });
  });

  describe('OutreachSequences', () => {
    test('should create outreach sequence', () => {
      const sequence = outreach.createSequence(
        'CTO',
        'TechCorp',
        ['Technical debt', 'Scalability'],
        'AI-powered automation'
      );

      expect(sequence.id).toBeDefined();
      expect(sequence.name).toBeDefined();
      expect(sequence.targetRole).toBe('CTO');
      expect(sequence.touchCount).toBeGreaterThan(0);
      expect(sequence.duration).toBeGreaterThan(0);
      expect(sequence.messages.length).toBe(sequence.touchCount);
      expect(sequence.expectedConversionRate).toBeGreaterThanOrEqual(0);
      expect(sequence.expectedConversionRate).toBeLessThanOrEqual(100);
    });

    test('should have varied message types', () => {
      const sequence = outreach.createSequence(
        'CTO',
        'TechCorp',
        ['Scalability'],
        'Solution'
      );

      const types = sequence.messages.map(m => m.type);
      expect(new Set(types).size).toBeGreaterThan(1); // Multiple types
    });

    test('should personalize messages', () => {
      const message = {
        type: 'email' as const,
        subject: 'Hello {{firstName}} at {{company}}',
        body: 'Hi {{firstName}}, your company {{company}} is great',
        cta: 'Contact me',
        delay: 0,
        personalizationTokens: ['{{firstName}}', '{{company}}'],
        expectedResponseRate: 10,
      };

      const personalized = outreach.personalizeMessage(message, {
        firstName: 'John',
        company: 'TechCorp',
      });

      expect(personalized.subject).toContain('John');
      expect(personalized.subject).toContain('TechCorp');
      expect(personalized.body).toContain('John');
      expect(personalized.body).toContain('TechCorp');
    });

    test('should generate multi-sequence campaign', () => {
      const makers = [
        { name: 'John Smith', role: 'CTO', company: 'TechCorp' },
        { name: 'Jane Doe', role: 'VP Product', company: 'TechCorp' },
      ];

      const campaign = outreach.generateCampaign(makers, ['Scalability'], 'Solution');

      expect(campaign).toHaveLength(2);
      campaign.forEach(c => {
        expect(c.maker).toBeDefined();
        expect(c.sequence).toBeDefined();
        expect(c.schedule).toBeDefined();
      });
    });

    test('should track campaign performance', () => {
      const performance = outreach.trackPerformance('seq-123', 100, 12);

      expect(performance.sequenceId).toBe('seq-123');
      expect(performance.sent).toBe(100);
      expect(performance.opened).toBeLessThanOrEqual(100);
      expect(performance.clicked).toBeLessThanOrEqual(performance.opened);
      expect(performance.replied).toBeLessThanOrEqual(performance.clicked);
      expect(performance.converted).toBeLessThanOrEqual(performance.replied);
      expect(performance.successRate).toBeGreaterThanOrEqual(0);
      expect(performance.successRate).toBeLessThanOrEqual(100);
    });

    test('should calculate realistic conversion funnel', () => {
      const performance = outreach.trackPerformance('seq-123', 1000, 50);

      // Realistic funnel ratios
      expect(performance.opened / performance.sent).toBeGreaterThan(0.2); // 20%+ open rate
      expect(performance.clicked / performance.opened).toBeGreaterThan(0.1); // 10%+ click rate
      expect(performance.replied / performance.clicked).toBeGreaterThan(0.05); // 5%+ reply rate
    });
  });

  describe('Integration: Full Lead Intelligence Flow', () => {
    test('should execute complete lead intelligence workflow', () => {
      // 1. Build company profile
      const profile = companyIntel.buildProfile({
        companyName: 'GrowthTech',
        industry: 'SaaS',
        employees: 100,
        techStack: ['React', 'Node.js'],
        competitors: ['Competitor1'],
      });

      expect(profile).toBeDefined();

      // 2. Identify decision makers
      const makers = decisionMaker.identifyDecisionMakers(profile.companyName);
      expect(makers.length).toBeGreaterThan(0);

      // 3. Build committee
      const committee = decisionMaker.buildBuyingCommittee(makers);
      expect(committee.champion || committee.budgetOwner).toBeDefined();

      // 4. Generate outreach strategy
      const strategy = decisionMaker.generateOutreachStrategy(committee);
      expect(strategy.keyMessaging).toBeDefined();

      // 5. Create outreach sequences
      const sequence = outreach.createSequence(
        committee.champion?.title || 'Decision Maker',
        profile.companyName,
        ['Growth', 'Efficiency'],
        'AI solution'
      );

      expect(sequence.touchCount).toBeGreaterThan(0);

      // 6. Generate full campaign
      const campaign = outreach.generateCampaign(
        makers.map(m => ({ name: m.name, role: m.title, company: profile.companyName })),
        ['Growth'],
        'Solution'
      );

      expect(campaign.length).toBe(makers.length);
    });
  });
});
