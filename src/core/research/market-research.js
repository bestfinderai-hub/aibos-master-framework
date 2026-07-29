/**
 * Market Research Engine
 * Analyzes market trends, opportunities, and white space
 */

class MarketResearch {
  constructor() {
    this.trends = []; // Historical trends
    this.opportunities = new Map(); // opportunityId -> opportunity
    this.innovations = []; // Innovation tracking
  }

  /**
   * Analyze market trend
   */
  analyzeTrend(trendName, data) {
    const trend = {
      id: `trend_${Date.now()}`,
      name: trendName,
      category: data.category || 'general',
      startDate: data.startDate || new Date(),
      currentPhase: this.detectPhase(data),
      adoptionRate: data.adoptionRate || 0, // % market penetration
      projectedGrowth: data.projectedGrowth || 0, // % annual growth
      maturityScore: this.calculateMaturity(data),
      relevance: this.calculateRelevance(data),
      signals: data.signals || [],
      analyzedAt: new Date()
    };

    this.trends.push(trend);
    return trend;
  }

  /**
   * Detect adoption phase
   */
  detectPhase(data) {
    const adoptionRate = data.adoptionRate || 0;

    if (adoptionRate < 2) return 'innovation';
    if (adoptionRate < 16) return 'early_adoption';
    if (adoptionRate < 50) return 'growth';
    if (adoptionRate < 90) return 'maturity';
    return 'decline';
  }

  /**
   * Calculate technology maturity (0-100)
   */
  calculateMaturity(data) {
    let score = 0;

    // Time to maturity
    if (data.startDate) {
      const years = (new Date() - new Date(data.startDate)) / (1000 * 60 * 60 * 24 * 365);
      score += Math.min(years * 10, 30);
    }

    // Adoption rate (max 40)
    score += Math.min((data.adoptionRate || 0) * 0.4, 40);

    // Number of vendors (max 20)
    const vendors = data.vendors || 0;
    score += Math.min(vendors * 2, 20);

    // Documentation/standardization (max 10)
    score += data.standardized ? 10 : 0;

    return Math.round(score);
  }

  /**
   * Calculate trend relevance (0-100)
   */
  calculateRelevance(data) {
    let score = 50; // Base score

    // Growth trajectory
    score += (data.projectedGrowth || 0) / 2; // Max +50

    // Market size
    if (data.marketSize > 1000000000) { // > $1B
      score += 10;
    }

    // Competitive intensity
    if (data.vendors < 3) {
      score += 10; // Less crowded
    }

    return Math.min(score, 100);
  }

  /**
   * Identify market opportunities
   */
  identifyOpportunity(opportunityData) {
    const opportunity = {
      id: `opp_${Date.now()}`,
      name: opportunityData.name,
      description: opportunityData.description,
      marketSize: opportunityData.marketSize || 0,
      growthRate: opportunityData.growthRate || 0,
      competitionLevel: opportunityData.competitionLevel || 'high', // low, medium, high
      techReadiness: opportunityData.techReadiness || 0, // 0-100
      customerReadiness: opportunityData.customerReadiness || 0, // 0-100
      entryBarrier: opportunityData.entryBarrier || 'high', // low, medium, high
      score: 0,
      recommendation: '',
      identifiedAt: new Date()
    };

    opportunity.score = this.scoreOpportunity(opportunity);
    opportunity.recommendation = this.getOpportunityRecommendation(opportunity.score);

    this.opportunities.set(opportunity.id, opportunity);
    return opportunity;
  }

  /**
   * Score market opportunity (0-100)
   */
  scoreOpportunity(opportunity) {
    let score = 0;

    // Market size (30%)
    const marketSizeScore = Math.min(opportunity.marketSize / 10000000, 30); // $300M = max
    score += marketSizeScore;

    // Growth rate (25%)
    const growthScore = Math.min(opportunity.growthRate / 4, 25); // 100% growth = max
    score += growthScore;

    // Competition (20%)
    const competitionScore = opportunity.competitionLevel === 'low' ? 20
      : opportunity.competitionLevel === 'medium' ? 10 : 0;
    score += competitionScore;

    // Tech readiness (15%)
    score += opportunity.techReadiness * 0.15;

    // Customer readiness (10%)
    score += opportunity.customerReadiness * 0.1;

    return Math.round(score);
  }

  /**
   * Get opportunity recommendation
   */
  getOpportunityRecommendation(score) {
    if (score >= 80) return 'pursue_aggressively';
    if (score >= 50) return 'explore_further';
    if (score >= 30) return 'monitor';
    return 'avoid';
  }

  /**
   * Detect white space (underserved markets)
   */
  detectWhiteSpace(existingCompetitors, marketSegments) {
    const whiteSpace = [];

    for (const segment of marketSegments) {
      const competitorCount = existingCompetitors.filter(
        c => c.targetSegments?.includes(segment.name)
      ).length;

      if (competitorCount === 0) {
        whiteSpace.push({
          segment: segment.name,
          marketSize: segment.size,
          growthRate: segment.growthRate,
          unserved: true,
          opportunity: 'high'
        });
      } else if (competitorCount === 1) {
        whiteSpace.push({
          segment: segment.name,
          marketSize: segment.size,
          growthRate: segment.growthRate,
          unserved: false,
          opportunity: 'medium'
        });
      }
    }

    return whiteSpace;
  }

  /**
   * Analyze technology disruption risk
   */
  analyzeDisruption(currentTechnology, emergingTechnology) {
    const disruption = {
      currentTech: currentTechnology,
      emergingTech: emergingTechnology,
      disruptionScore: this.calculateDisruptionScore(emergingTechnology),
      timeToDisruption: this.estimateTimeToDisruption(emergingTechnology),
      impactLevel: this.assessImpactLevel(emergingTechnology),
      mitigationStrategies: [],
      riskLevel: ''
    };

    // Generate mitigation strategies
    if (disruption.disruptionScore > 70) {
      disruption.mitigationStrategies = [
        'Invest in emerging technology R&D',
        'Partner with emerging tech leaders',
        'Develop transition strategy for customers',
        'Build organizational agility'
      ];
      disruption.riskLevel = 'critical';
    } else if (disruption.disruptionScore > 50) {
      disruption.mitigationStrategies = [
        'Monitor emerging technology progress',
        'Build complementary capabilities',
        'Plan for technology shift'
      ];
      disruption.riskLevel = 'high';
    } else {
      disruption.riskLevel = 'low';
    }

    return disruption;
  }

  /**
   * Calculate disruption score (0-100)
   */
  calculateDisruptionScore(technology) {
    let score = 0;

    // Performance improvement (30%)
    score += (technology.performanceImprovement || 0) * 0.3;

    // Cost reduction (30%)
    score += (technology.costReduction || 0) * 0.3;

    // Simplicity (20%)
    score += (technology.simplicity || 0) * 0.2;

    // Network effects (20%)
    score += (technology.networkEffects || 0) * 0.2;

    return Math.round(score);
  }

  /**
   * Estimate time to disruption (years)
   */
  estimateTimeToDisruption(technology) {
    const maturity = technology.maturityLevel || 'early'; // early, mid, advanced

    if (maturity === 'advanced') return 1;
    if (maturity === 'mid') return 2;
    return 5; // early stage = 5+ years
  }

  /**
   * Assess impact level
   */
  assessImpactLevel(technology) {
    const score = this.calculateDisruptionScore(technology);

    if (score >= 80) return 'transformative';
    if (score >= 60) return 'significant';
    if (score >= 40) return 'moderate';
    return 'minimal';
  }

  /**
   * Get market summary
   */
  getMarketSummary() {
    const trendsByPhase = {};
    this.trends.forEach(t => {
      trendsByPhase[t.currentPhase] = (trendsByPhase[t.currentPhase] || 0) + 1;
    });

    const topOpportunities = Array.from(this.opportunities.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      timestamp: new Date(),
      totalTrends: this.trends.length,
      trendsByPhase,
      topOpportunities,
      averageMarketScore: Math.round(
        topOpportunities.reduce((sum, o) => sum + o.score, 0) / topOpportunities.length
      )
    };
  }

  /**
   * Get trends by phase
   */
  getTrendsByPhase(phase) {
    return this.trends.filter(t => t.currentPhase === phase);
  }

  /**
   * Get high-potential opportunities
   */
  getHighPotentialOpportunities() {
    return Array.from(this.opportunities.values())
      .filter(o => o.score >= 50)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Forecast market evolution (5-year)
   */
  forecastMarketEvolution() {
    const forecast = {
      year_1: { trends: [], opportunities: [] },
      year_2: { trends: [], opportunities: [] },
      year_3: { trends: [], opportunities: [] },
      year_4: { trends: [], opportunities: [] },
      year_5: { trends: [], opportunities: [] }
    };

    // Early adoption trends move to growth
    const earlyAdoption = this.getTrendsByPhase('early_adoption');
    earlyAdoption.forEach(t => {
      forecast.year_1.trends.push(`${t.name} -> Growth phase`);
      forecast.year_2.trends.push(`${t.name} -> Maturity phase`);
    });

    // New innovations emerge
    forecast.year_1.trends.push('New wave of AI innovations');
    forecast.year_2.trends.push('Consolidation among vendors');
    forecast.year_3.trends.push('Standardization of practices');

    return forecast;
  }
}

module.exports = MarketResearch;
