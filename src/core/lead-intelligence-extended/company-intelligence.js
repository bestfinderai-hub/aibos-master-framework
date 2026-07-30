/**
 * Company Intelligence
 * Company profile building, financials, growth metrics, technology stack
 */

class CompanyIntelligence {
  constructor() {
    this.companies = new Map(); // companyId -> company profile
    this.financials = new Map(); // companyId -> financial data
    this.technology = new Map(); // companyId -> tech stack
  }

  // ============================================================================
  // COMPANY PROFILING
  // ============================================================================

  buildCompanyProfile(companyId, config) {
    const profile = {
      id: companyId,
      name: config.name,
      description: config.description,
      industry: config.industry,
      subIndustry: config.subIndustry,
      website: config.website,
      founded: config.founded,
      headquarters: config.headquarters,
      type: config.type || 'startup', // startup, scale-up, enterprise, nonprofit
      stage: config.stage || 'series-a', // bootstrapped, seed, series-a/b/c/d, ipo
      size: config.size || 'small', // small, mid-market, enterprise
      employees: config.employees || 0,
      revenueRange: config.revenueRange,
      targetMarkets: config.targetMarkets || [],
      competitors: config.competitors || [],
      strengths: config.strengths || [],
      weaknesses: config.weaknesses || [],
      opportunities: config.opportunities || [],
      threats: config.threats || [],
      lastUpdated: new Date(),
      dataQuality: this.assessDataQuality(config)
    };

    this.companies.set(companyId, profile);
    return profile;
  }

  assessDataQuality(config) {
    const fields = ['name', 'industry', 'website', 'headquarters', 'employees'];
    const completeness = fields.filter(f => config[f]).length / fields.length;

    const scores = {
      0.8: 'excellent',
      0.6: 'good',
      0.4: 'fair',
      0.2: 'poor'
    };

    for (const [threshold, score] of Object.entries(scores)) {
      if (completeness >= parseFloat(threshold)) return score;
    }
    return 'incomplete';
  }

  getCompanyProfile(companyId) {
    return this.companies.get(companyId);
  }

  // ============================================================================
  // FINANCIAL ANALYSIS
  // ============================================================================

  recordFinancials(companyId, config) {
    const financial = {
      companyId,
      year: config.year || new Date().getFullYear(),
      revenue: config.revenue || 0,
      costOfRevenue: config.costOfRevenue || 0,
      operatingExpenses: config.operatingExpenses || 0,
      netIncome: config.netIncome || 0,
      fundingRaised: config.fundingRaised || 0,
      fundingSources: config.fundingSources || [],
      burnRate: config.burnRate || 0, // monthly
      runway: config.runway || 0, // months
      bookings: config.bookings || 0,
      arr: config.arr || 0, // Annual Recurring Revenue
      mrr: config.mrr || 0, // Monthly Recurring Revenue
      churnRate: config.churnRate || 0,
      cac: config.cac || 0, // Customer Acquisition Cost
      ltv: config.ltv || 0, // Lifetime Value
      growth: config.growth || 0, // YoY growth %
      recordedAt: new Date()
    };

    this.financials.set(companyId, financial);
    return financial;
  }

  getFinancials(companyId) {
    return this.financials.get(companyId);
  }

  calculateMetrics(companyId) {
    const fin = this.financials.get(companyId);
    if (!fin) return null;

    const runway = fin.burnRate > 0 ? Math.floor((fin.revenue || 0) / fin.burnRate) : 0;

    const metrics = {
      companyId,
      grossMargin: fin.revenue > 0 ? ((fin.revenue - fin.costOfRevenue) / fin.revenue) * 100 : 0,
      operatingMargin: fin.revenue > 0 ? (fin.netIncome / fin.revenue) * 100 : 0,
      ltv_cac_ratio: fin.cac > 0 ? fin.ltv / fin.cac : 0,
      paybackPeriod: fin.cac > 0 ? (fin.cac / (fin.mrr || 1)) : 0, // months
      runway: fin.runway || runway,
      fundingEfficiency: fin.fundingRaised > 0 ? fin.revenue / fin.fundingRaised : 0,
      retentionRate: 100 - (fin.churnRate || 0),
      growthSustainability: fin.burnRate > 0 ? fin.runway : null,
      financialHealth: this.assessFinancialHealth(fin)
    };

    return metrics;
  }

  assessFinancialHealth(fin) {
    if (fin.runway < 6) return 'critical';
    if (fin.runway < 12) return 'at_risk';
    if (fin.revenue > 0 && fin.netIncome > 0) return 'strong';
    if (fin.revenue > 0) return 'moderate';
    return 'early_stage';
  }

  // ============================================================================
  // TECHNOLOGY STACK
  // ============================================================================

  recordTechnologyStack(companyId, config) {
    const tech = {
      companyId,
      frontend: config.frontend || [],
      backend: config.backend || [],
      database: config.database || [],
      infrastructure: config.infrastructure || [],
      tools: config.tools || [],
      languages: config.languages || [],
      frameworks: config.frameworks || [],
      apis: config.apis || [],
      thirdPartyServices: config.thirdPartyServices || [],
      modernization: config.modernization || 'low', // low, medium, high
      debtLevel: config.debtLevel || 'unknown', // low, medium, high
      scalability: config.scalability || 'unknown', // low, medium, high
      security: config.security || 'unknown', // basic, good, excellent
      lastUpdated: new Date()
    };

    this.technology.set(companyId, tech);
    return tech;
  }

  getTechnologyStack(companyId) {
    return this.technology.get(companyId);
  }

  assessTechMaturity(companyId) {
    const tech = this.technology.get(companyId);
    if (!tech) return null;

    const maturityFactors = {
      infrastructure: tech.infrastructure.includes('kubernetes') || tech.infrastructure.includes('docker') ? 0.8 : 0.5,
      modernization: tech.modernization === 'high' ? 0.8 : tech.modernization === 'medium' ? 0.5 : 0.2,
      scalability: tech.scalability === 'high' ? 0.8 : tech.scalability === 'medium' ? 0.5 : 0.2,
      security: tech.security === 'excellent' ? 0.8 : tech.security === 'good' ? 0.6 : 0.3,
      debtLevel: tech.debtLevel === 'low' ? 0.8 : tech.debtLevel === 'medium' ? 0.5 : 0.2
    };

    const maturityScore = Object.values(maturityFactors).reduce((a, b) => a + b, 0) / Object.keys(maturityFactors).length;
    const maturityLevel = maturityScore >= 0.7 ? 'advanced' : maturityScore >= 0.5 ? 'intermediate' : 'basic';

    return {
      companyId,
      score: Math.round(maturityScore * 100),
      level: maturityLevel,
      factors: maturityFactors
    };
  }

  // ============================================================================
  // GROWTH TRAJECTORY
  // ============================================================================

  trackGrowth(companyId, metrics = {}) {
    const fin = this.financials.get(companyId);
    const profile = this.companies.get(companyId);

    if (!fin || !profile) return null;

    const trajectory = {
      companyId,
      stage: profile.stage,
      currentAnnualGrowth: metrics.growth || 0,
      revenueTrajectory: this.projectRevenue(fin),
      fundingTrajectory: this.projectFunding(fin, profile),
      employeeGrowth: metrics.employeeGrowth || 0,
      marketExpansion: metrics.marketExpansion || 'stable', // contracting, stable, growing, rapid
      momentumScore: this.calculateMomentum(fin, metrics),
      milestones: this.identifyUpcomingMilestones(fin, profile),
      risks: this.identifyGrowthRisks(fin, profile)
    };

    return trajectory;
  }

  projectRevenue(fin, quarters = 4) {
    const projections = [];
    let current = fin.revenue;

    for (let q = 0; q < quarters; q++) {
      const growthRate = Math.max(0.1, fin.growth / 400); // Convert annual to quarterly
      current = current * (1 + growthRate);
      projections.push({
        quarter: q + 1,
        revenue: Math.round(current)
      });
    }

    return projections;
  }

  projectFunding(fin, profile) {
    const currentFunding = fin.fundingRaised;
    const nextRound = this.estimateNextRound(profile.stage, currentFunding);

    return {
      currentTotal: currentFunding,
      estimatedNextRound: nextRound,
      expectedTimeline: this.estimateNextRoundTimeline(profile.stage),
      nextStage: this.getNextFundingStage(profile.stage)
    };
  }

  estimateNextRound(currentStage, currentFunding) {
    const roundMultipliers = {
      'bootstrapped': 500000,
      'seed': 2000000,
      'series-a': 5000000,
      'series-b': 15000000,
      'series-c': 40000000,
      'series-d': 100000000
    };

    return roundMultipliers[currentStage] || 5000000;
  }

  estimateNextRoundTimeline(currentStage) {
    const timelines = {
      'bootstrapped': 6,
      'seed': 12,
      'series-a': 18,
      'series-b': 24,
      'series-c': 24,
      'series-d': 30
    };

    return timelines[currentStage] || 12; // months
  }

  getNextFundingStage(currentStage) {
    const progression = {
      'bootstrapped': 'seed',
      'seed': 'series-a',
      'series-a': 'series-b',
      'series-b': 'series-c',
      'series-c': 'series-d',
      'series-d': 'ipo'
    };

    return progression[currentStage] || 'ipo';
  }

  calculateMomentum(fin, metrics) {
    const factors = {
      revenue_growth: Math.min(metrics.growth || 0, 100) / 100,
      employee_growth: Math.min(metrics.employeeGrowth || 0, 100) / 100,
      funding_activity: fin.fundingRaised > 0 ? 0.8 : 0.2,
      market_expansion: metrics.marketExpansion === 'rapid' ? 0.9 : metrics.marketExpansion === 'growing' ? 0.6 : 0.3
    };

    const score = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;
    return Math.round(score * 100);
  }

  identifyUpcomingMilestones(fin, profile) {
    const milestones = [];

    if (profile.stage === 'seed') {
      milestones.push({ type: 'Series A Fundraising', timeline: '12-18 months' });
    }

    if (fin.revenue > 0 && fin.revenue < 100000) {
      milestones.push({ type: 'Product Market Fit', timeline: 'Current' });
    }

    if (fin.arr > 100000) {
      milestones.push({ type: 'Series B Ready', timeline: '6-12 months' });
    }

    if (profile.employees > 50) {
      milestones.push({ type: 'Scale Operations', timeline: 'Current' });
    }

    return milestones;
  }

  identifyGrowthRisks(fin, profile) {
    const risks = [];

    if (fin.runway < 6) {
      risks.push({ risk: 'Funding shortfall', severity: 'critical' });
    }

    if (fin.churnRate > 5) {
      risks.push({ risk: 'High churn rate', severity: 'high' });
    }

    if (fin.cac > fin.ltv) {
      risks.push({ risk: 'Unfavorable unit economics', severity: 'high' });
    }

    if (profile.type === 'startup' && profile.employees < 10) {
      risks.push({ risk: 'Execution risk (small team)', severity: 'medium' });
    }

    return risks;
  }

  // ============================================================================
  // COMPETITIVE POSITIONING
  // ============================================================================

  analyzeCompetitivePosition(companyId) {
    const profile = this.companies.get(companyId);
    if (!profile) return null;

    const analysis = {
      companyId,
      directCompetitors: profile.competitors,
      competitiveAdvantages: profile.strengths,
      vulnerabilities: profile.weaknesses,
      marketPosition: this.assessMarketPosition(profile),
      differentiators: this.identifyDifferentiators(profile),
      marketShare: this.estimateMarketShare(profile),
      targetSegments: profile.targetMarkets
    };

    return analysis;
  }

  assessMarketPosition(profile) {
    const factors = {
      funding: profile.stage === 'series-c' || profile.stage === 'series-d' ? 'strong' : profile.stage === 'series-b' ? 'moderate' : 'emerging',
      size: profile.size === 'enterprise' ? 'strong' : profile.size === 'mid-market' ? 'moderate' : 'emerging',
      revenue: profile.employees > 50 ? 'established' : profile.employees > 20 ? 'growing' : 'early'
    };

    return factors;
  }

  identifyDifferentiators(profile) {
    const differentiators = [];

    if (profile.strengths.length > 0) {
      differentiators.push(...profile.strengths.slice(0, 3));
    }

    return differentiators;
  }

  estimateMarketShare(profile) {
    if (profile.revenueRange === 'pre-revenue') return 0.01;
    if (profile.employees < 10) return 0.05;
    if (profile.employees < 50) return 0.1;
    if (profile.employees < 200) return 0.2;
    return 0.5;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  listCompanies(filter = {}) {
    let companies = Array.from(this.companies.values());

    if (filter.industry) {
      companies = companies.filter(c => c.industry === filter.industry);
    }

    if (filter.stage) {
      companies = companies.filter(c => c.stage === filter.stage);
    }

    if (filter.size) {
      companies = companies.filter(c => c.size === filter.size);
    }

    return companies;
  }

  generateCompanyReport(companyId) {
    const profile = this.companies.get(companyId);
    const financials = this.financials.get(companyId);
    const tech = this.technology.get(companyId);
    const growth = this.trackGrowth(companyId);
    const competition = this.analyzeCompetitivePosition(companyId);

    return {
      profile,
      financials,
      technology: tech,
      growth,
      competition,
      generatedAt: new Date()
    };
  }
}

module.exports = CompanyIntelligence;
