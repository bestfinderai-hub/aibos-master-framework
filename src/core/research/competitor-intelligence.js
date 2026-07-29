/**
 * Competitor Intelligence Engine
 * Real-time tracking of competitor moves across multiple dimensions
 */

class CompetitorIntelligence {
  constructor() {
    this.competitors = new Map(); // competitorId -> profile
    this.threatScores = new Map(); // competitorId -> threat metrics
    this.changeLog = []; // Historical changes
  }

  /**
   * Register competitor for monitoring
   */
  registerCompetitor(competitorData) {
    const competitor = {
      competitorId: competitorData.id || `comp_${Date.now()}`,
      name: competitorData.name,
      industry: competitorData.industry,
      founded: competitorData.founded,
      website: competitorData.website,

      products: competitorData.products || [],
      marketing: competitorData.marketing || { campaigns: [], messaging: [] },
      hiring: competitorData.hiring || { openPositions: 0, recentHires: 0 },
      funding: competitorData.funding || { totalRaised: 0, rounds: [] },
      social: competitorData.social || { followers: 0, mentions: 0 },

      threat: { level: 'medium', score: 50, reasons: [] },
      monitoring: {
        startDate: new Date(),
        lastUpdated: new Date(),
        updateFrequency: 'daily',
        sources: []
      }
    };

    this.competitors.set(competitor.competitorId, competitor);
    return competitor;
  }

  /**
   * Update competitor information
   */
  updateCompetitor(competitorId, updates) {
    const competitor = this.competitors.get(competitorId);
    if (!competitor) return null;

    const previous = JSON.parse(JSON.stringify(competitor));

    // Update fields
    if (updates.products) competitor.products = updates.products;
    if (updates.pricing) this.logPricingChange(competitor, updates.pricing);
    if (updates.marketing) competitor.marketing = updates.marketing;
    if (updates.hiring) competitor.hiring = updates.hiring;
    if (updates.funding) competitor.funding = updates.funding;
    if (updates.social) competitor.social = updates.social;

    competitor.monitoring.lastUpdated = new Date();

    // Log changes
    this.logChange(competitorId, previous, competitor);

    // Recalculate threat
    this.calculateThreatScore(competitorId);

    return competitor;
  }

  /**
   * Get competitor profile
   */
  getCompetitor(competitorId) {
    return this.competitors.get(competitorId) || null;
  }

  /**
   * List all competitors
   */
  listCompetitors() {
    return Array.from(this.competitors.values())
      .sort((a, b) => b.threat.score - a.threat.score);
  }

  /**
   * Log feature launch
   */
  logFeatureLaunch(competitorId, featureName, description = '') {
    const competitor = this.competitors.get(competitorId);
    if (!competitor) return null;

    const feature = {
      name: featureName,
      launchDate: new Date(),
      description
    };

    if (!competitor.products[0]) {
      competitor.products.push({
        name: 'Main Product',
        launchDate: competitor.monitoring.startDate,
        features: []
      });
    }

    competitor.products[0].features.push(feature);
    this.calculateThreatScore(competitorId);

    return {
      competitorId,
      event: 'feature_launch',
      feature,
      threatImpact: 'medium'
    };
  }

  /**
   * Log pricing change
   */
  logPricingChange(competitor, newPricing) {
    if (!competitor.pricing) competitor.pricing = [];

    competitor.pricing.push({
      timestamp: new Date(),
      changes: newPricing,
      previousPrice: competitor.products[0]?.pricing
    });

    return {
      competitorId: competitor.competitorId,
      event: 'pricing_change',
      newPricing,
      threatImpact: this.assessPricingThreat(newPricing)
    };
  }

  /**
   * Calculate threat score (0-100)
   */
  calculateThreatScore(competitorId) {
    const competitor = this.competitors.get(competitorId);
    if (!competitor) return 0;

    let score = 50; // Base score

    // Product threat (30%)
    const productThreat = this.assessProductThreat(competitor);
    score += productThreat * 0.3;

    // Pricing threat (20%)
    const pricingThreat = this.assessPricingThreat(competitor.products[0]?.pricing);
    score += pricingThreat * 0.2;

    // Market momentum (25%)
    const momentum = this.assessMarketMomentum(competitor);
    score += momentum * 0.25;

    // Funding & resources (15%)
    const resourceThreat = this.assessResourceThreat(competitor.funding);
    score += resourceThreat * 0.15;

    // Hiring growth (10%)
    const hiringThreat = this.assessHiringThreat(competitor.hiring);
    score += hiringThreat * 0.1;

    const threatLevel = score >= 75 ? 'critical'
      : score >= 50 ? 'high'
        : score >= 30 ? 'medium'
          : 'low';

    const reasons = this.generateThreatReasons(competitor, score);

    competitor.threat = {
      score: Math.round(score),
      level: threatLevel,
      reasons,
      assessedAt: new Date()
    };

    this.threatScores.set(competitorId, competitor.threat);

    return competitor.threat;
  }

  /**
   * Assess product threat (0-20)
   */
  assessProductThreat(competitor) {
    const featureCount = competitor.products.reduce((sum, p) => sum + (p.features?.length || 0), 0);
    const productCount = competitor.products.length;

    const featureThreat = Math.min(featureCount / 5, 1) * 10; // Max 10
    const breadthThreat = Math.min(productCount / 3, 1) * 10; // Max 10

    return featureThreat + breadthThreat;
  }

  /**
   * Assess pricing threat (0-20)
   */
  assessPricingThreat(pricing) {
    if (!pricing) return 10;

    const isAggressive = pricing.starter && pricing.starter < 50;
    return isAggressive ? 15 : 5;
  }

  /**
   * Assess market momentum (0-25)
   */
  assessMarketMomentum(competitor) {
    let momentum = 10;

    // Recent feature launches boost momentum
    if (competitor.products[0]?.features) {
      const recentLaunches = competitor.products[0].features.filter(f => {
        const days = (new Date() - f.launchDate) / (1000 * 60 * 60 * 24);
        return days < 90;
      }).length;

      momentum += Math.min(recentLaunches * 2, 10);
    }

    // Social activity boosts momentum
    if (competitor.social?.mentions) {
      momentum += Math.min(competitor.social.mentions / 1000, 5);
    }

    return momentum;
  }

  /**
   * Assess resource threat (0-15)
   */
  assessResourceThreat(funding) {
    if (!funding || !funding.totalRaised) return 5;

    const raisedM = parseFloat(funding.totalRaised) || 0;
    return Math.min(raisedM / 10, 15); // $150M = max threat
  }

  /**
   * Assess hiring threat (0-10)
   */
  assessHiringThreat(hiring) {
    if (!hiring) return 5;

    const recentHires = hiring.recentHires || 0;
    const openPositions = hiring.openPositions || 0;

    return Math.min((recentHires + openPositions) / 20, 10); // 200+ people = max threat
  }

  /**
   * Generate threat reasons
   */
  generateThreatReasons(competitor, score) {
    const reasons = [];

    if (competitor.products.length > 3) {
      reasons.push('broad_product_portfolio');
    }

    if (competitor.funding.totalRaised > 50000000) {
      reasons.push('well_funded');
    }

    if (competitor.hiring.recentHires > 50) {
      reasons.push('rapid_hiring');
    }

    if (score >= 75) {
      reasons.push('aggressive_strategy');
    }

    return reasons;
  }

  /**
   * Log change
   */
  logChange(competitorId, previous, current) {
    const change = {
      competitorId,
      timestamp: new Date(),
      previous,
      current,
      changes: this.detectChanges(previous, current)
    };

    this.changeLog.push(change);
    return change;
  }

  /**
   * Detect changes between two versions
   */
  detectChanges(previous, current) {
    const changes = [];

    // Check products
    if (JSON.stringify(previous.products) !== JSON.stringify(current.products)) {
      changes.push('products');
    }

    // Check pricing
    if (JSON.stringify(previous.marketing) !== JSON.stringify(current.marketing)) {
      changes.push('marketing');
    }

    // Check hiring
    if (JSON.stringify(previous.hiring) !== JSON.stringify(current.hiring)) {
      changes.push('hiring');
    }

    // Check funding
    if (JSON.stringify(previous.funding) !== JSON.stringify(current.funding)) {
      changes.push('funding');
    }

    return changes;
  }

  /**
   * Get competitive landscape
   */
  getCompetitiveLandscape() {
    const competitors = this.listCompetitors();

    return {
      timestamp: new Date(),
      totalCompetitors: competitors.length,
      threats: {
        critical: competitors.filter(c => c.threat.level === 'critical').length,
        high: competitors.filter(c => c.threat.level === 'high').length,
        medium: competitors.filter(c => c.threat.level === 'medium').length,
        low: competitors.filter(c => c.threat.level === 'low').length
      },
      topThreats: competitors.slice(0, 5),
      averageThreatScore: Math.round(
        competitors.reduce((sum, c) => sum + c.threat.score, 0) / competitors.length
      )
    };
  }

  /**
   * Get recent changes
   */
  getRecentChanges(days = 7) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60000);

    return this.changeLog
      .filter(c => c.timestamp > cutoffDate)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * SWOT analysis
   */
  generateSWOT(competitorId, ourCapabilities) {
    const competitor = this.competitors.get(competitorId);
    if (!competitor) return null;

    return {
      competitor: competitor.name,
      strengths: this.identifyCompetitorStrengths(competitor),
      weaknesses: this.identifyCompetitorWeaknesses(competitor),
      opportunities: this.identifyOpportunities(competitor, ourCapabilities),
      threats: competitor.threat.reasons
    };
  }

  /**
   * Identify competitor strengths
   */
  identifyCompetitorStrengths(competitor) {
    const strengths = [];

    if (competitor.products.length > 1) {
      strengths.push('broad_product_line');
    }

    if (competitor.funding.totalRaised > 10000000) {
      strengths.push('significant_funding');
    }

    if (competitor.social?.followers > 100000) {
      strengths.push('strong_brand');
    }

    return strengths;
  }

  /**
   * Identify competitor weaknesses
   */
  identifyCompetitorWeaknesses(competitor) {
    const weaknesses = [];

    if (!competitor.website) {
      weaknesses.push('weak_online_presence');
    }

    if (competitor.hiring.openPositions > 50) {
      weaknesses.push('hiring_challenges');
    }

    return weaknesses;
  }

  /**
   * Identify opportunities vs competitor
   */
  identifyOpportunities(competitor, ourCapabilities) {
    const opportunities = [];

    // Feature gaps
    if (ourCapabilities.uniqueFeatures) {
      opportunities.push('feature_differentiation');
    }

    // Pricing gaps
    if (competitor.products[0]?.pricing?.starter > 99) {
      opportunities.push('lower_price_point');
    }

    // Geographic gaps
    if (!competitor.products[0]?.targetMarkets?.includes('APAC')) {
      opportunities.push('geographic_expansion');
    }

    return opportunities;
  }
}

module.exports = CompetitorIntelligence;
