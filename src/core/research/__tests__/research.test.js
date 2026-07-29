/**
 * Research Engine Tests
 */

const CompetitorIntelligence = require('../competitor-intelligence');
const MarketResearch = require('../market-research');
const InsightsGenerator = require('../insights-generator');

describe('CompetitorIntelligence', () => {
  let intelligence;

  beforeEach(() => {
    intelligence = new CompetitorIntelligence();
  });

  describe('competitor tracking', () => {
    test('should register competitor', () => {
      const comp = intelligence.registerCompetitor({
        id: 'comp_1',
        name: 'Competitor X',
        industry: 'SaaS'
      });

      expect(comp.name).toBe('Competitor X');
      expect(comp.threat.score).toBe(50);
    });

    test('should list competitors sorted by threat', () => {
      intelligence.registerCompetitor({ id: 'c1', name: 'Low Threat' });
      intelligence.registerCompetitor({ id: 'c2', name: 'High Threat' });

      const comp2 = intelligence.getCompetitor('c2');
      comp2.threat.score = 80;

      const competitors = intelligence.listCompetitors();

      expect(competitors[0].threat.score >= competitors[1].threat.score).toBe(true);
    });

    test('should log feature launch', () => {
      const comp = intelligence.registerCompetitor({ id: 'c1', name: 'Comp' });
      const event = intelligence.logFeatureLaunch('c1', 'New Dashboard');

      expect(event.event).toBe('feature_launch');
      expect(event.feature.name).toBe('New Dashboard');
    });
  });

  describe('threat scoring', () => {
    test('should calculate threat score', () => {
      const comp = intelligence.registerCompetitor({
        id: 'c1',
        name: 'Comp',
        products: [{
          name: 'Product',
          features: [{ name: 'f1' }, { name: 'f2' }]
        }]
      });

      const threat = intelligence.calculateThreatScore('c1');

      expect(threat.score).toBeGreaterThanOrEqual(0);
      expect(threat.score).toBeLessThanOrEqual(100);
      expect(threat.level).toMatch(/low|medium|high|critical/);
    });

    test('should generate SWOT analysis', () => {
      const comp = intelligence.registerCompetitor({
        id: 'c1',
        name: 'Comp',
        funding: { totalRaised: 50000000 }
      });

      const swot = intelligence.generateSWOT('c1', {});

      expect(swot.strengths).toBeDefined();
      expect(swot.weaknesses).toBeDefined();
      expect(swot.opportunities).toBeDefined();
      expect(swot.threats).toBeDefined();
    });
  });

  describe('competitive landscape', () => {
    test('should analyze competitive landscape', () => {
      intelligence.registerCompetitor({ id: 'c1', name: 'Low' });
      intelligence.registerCompetitor({ id: 'c2', name: 'High' });

      const landscape = intelligence.getCompetitiveLandscape();

      expect(landscape.totalCompetitors).toBe(2);
      expect(landscape.threats).toBeDefined();
      expect(landscape.topThreats).toBeDefined();
    });

    test('should track recent changes', () => {
      const comp = intelligence.registerCompetitor({ id: 'c1', name: 'Comp' });
      intelligence.updateCompetitor('c1', { hiring: { recentHires: 10 } });

      const changes = intelligence.getRecentChanges(7);

      expect(changes.length).toBeGreaterThan(0);
    });
  });
});

describe('MarketResearch', () => {
  let research;

  beforeEach(() => {
    research = new MarketResearch();
  });

  describe('trend analysis', () => {
    test('should analyze market trend', () => {
      const trend = research.analyzeTrend('AI Automation', {
        category: 'technology',
        adoptionRate: 25,
        projectedGrowth: 40
      });

      expect(trend.name).toBe('AI Automation');
      expect(trend.currentPhase).toMatch(/innovation|early_adoption|growth|maturity|decline/);
    });

    test('should detect adoption phases', () => {
      const early = research.analyzeTrend('T1', { adoptionRate: 1 });
      const growth = research.analyzeTrend('T2', { adoptionRate: 30 });
      const mature = research.analyzeTrend('T3', { adoptionRate: 80 });

      expect(early.currentPhase).toBe('innovation');
      expect(growth.currentPhase).toBe('growth');
      expect(mature.currentPhase).toBe('maturity');
    });
  });

  describe('opportunity identification', () => {
    test('should identify and score opportunities', () => {
      const opp = research.identifyOpportunity({
        name: 'Enterprise AI',
        marketSize: 1000000000,
        growthRate: 50,
        techReadiness: 80,
        customerReadiness: 70
      });

      expect(opp.score).toBeGreaterThan(0);
      expect(opp.recommendation).toMatch(/pursue|explore|monitor|avoid/);
    });

    test('should rank opportunities by score', () => {
      research.identifyOpportunity({ name: 'Low', marketSize: 10000000, growthRate: 5 });
      research.identifyOpportunity({ name: 'High', marketSize: 1000000000, growthRate: 50 });

      const high = research.getHighPotentialOpportunities();

      expect(high.length).toBeGreaterThan(0);
      expect(high[0].score >= high[high.length - 1].score).toBe(true);
    });
  });

  describe('disruption analysis', () => {
    test('should analyze technology disruption', () => {
      const disruption = research.analyzeDisruption('Current', {
        performanceImprovement: 50,
        costReduction: 40,
        maturityLevel: 'mid'
      });

      expect(disruption.disruptionScore).toBeGreaterThanOrEqual(0);
      expect(disruption.disruptionScore).toBeLessThanOrEqual(100);
      expect(disruption.riskLevel).toMatch(/low|high|critical/);
    });
  });

  describe('market forecasting', () => {
    test('should forecast market evolution', () => {
      research.analyzeTrend('T1', { adoptionRate: 10 });

      const forecast = research.forecastMarketEvolution();

      expect(forecast.year_1).toBeDefined();
      expect(forecast.year_5).toBeDefined();
    });
  });
});

describe('InsightsGenerator', () => {
  let generator;
  let mockCompetitors;
  let mockMarketData;

  beforeEach(() => {
    generator = new InsightsGenerator();

    mockCompetitors = [
      {
        name: 'Comp1',
        threat: { level: 'high', score: 75, reasons: ['aggressive_pricing'] }
      },
      {
        name: 'Comp2',
        threat: { level: 'medium', score: 50, reasons: [] }
      }
    ];

    mockMarketData = {
      trends: [
        { name: 'AI', currentPhase: 'growth', projectedGrowth: 60 },
        { name: 'Cloud', currentPhase: 'maturity', projectedGrowth: 20 }
      ],
      opportunities: [
        { name: 'Enterprise', score: 80 },
        { name: 'SMB', score: 60 }
      ]
    };
  });

  describe('report generation', () => {
    test('should generate weekly report', () => {
      const report = generator.generateWeeklyReport(mockCompetitors, mockMarketData);

      expect(report.type).toBe('weekly_competitive_intelligence');
      expect(report.sections.competitiveThreats).toBeDefined();
      expect(report.sections.opportunities).toBeDefined();
      expect(report.sections.recommendations).toBeDefined();
    });

    test('should identify top threats', () => {
      const threats = generator.identifyTopThreats(mockCompetitors, 1);

      expect(threats.length).toBe(1);
      expect(threats[0].competitor).toBe('Comp1');
    });

    test('should generate recommendations', () => {
      const recs = generator.generateRecommendations(mockCompetitors, mockMarketData);

      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].priority).toBeDefined();
    });
  });

  describe('report export', () => {
    test('should export report as JSON', () => {
      const report = generator.generateWeeklyReport(mockCompetitors, mockMarketData);
      const exported = generator.exportReport(report.id, 'json');

      expect(exported).toBeDefined();
      expect(exported.type).toBe('weekly_competitive_intelligence');
    });

    test('should export report as Markdown', () => {
      const report = generator.generateWeeklyReport(mockCompetitors, mockMarketData);
      const exported = generator.exportReport(report.id, 'markdown');

      expect(exported).toContain('Competitive Intelligence Report');
    });
  });
});
