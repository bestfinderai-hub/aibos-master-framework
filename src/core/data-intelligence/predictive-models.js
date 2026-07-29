/**
 * Predictive Models Engine
 * Predicts churn, expansion, and lead scoring using statistical models
 */

class PredictiveModels {
  constructor() {
    this.models = {
      churn: null,
      expansion: null,
      leadScore: null
    };
  }

  /**
   * Predict churn probability (0-100)
   */
  predictChurn(profile) {
    let probability = 0;

    // Inactivity indicator (weight: 35%)
    const daysInactive = profile.behavioral?.daysInactive || 0;
    if (daysInactive > 90) probability += 35;
    else if (daysInactive > 60) probability += 25;
    else if (daysInactive > 30) probability += 15;

    // Support issues indicator (weight: 25%)
    const supportTickets = profile.engagement?.supportTicketsCreated || 0;
    if (supportTickets > 10) probability += 25;
    else if (supportTickets > 5) probability += 15;

    // Payment issues indicator (weight: 20%)
    if (profile.financial?.hasOutstandingInvoices) {
      probability += 20;
    }

    // Error rate indicator (weight: 15%)
    const errorRate = profile.behavioral?.errorRate || 0;
    if (errorRate > 0.15) probability += 15;
    else if (errorRate > 0.05) probability += 8;

    // Engagement indicator (weight: 5%)
    const emailClickRate = profile.engagement?.emailClickRate || 0;
    if (emailClickRate < 0.05) probability += 5;

    // NPS indicator (bonus/penalty)
    const nps = profile.engagement?.netPromoterScore;
    if (nps !== null) {
      if (nps < 6) probability += 10;
      else if (nps >= 9) probability -= 10;
    }

    return Math.max(0, Math.min(100, probability));
  }

  /**
   * Predict expansion probability (0-100)
   */
  predictExpansion(profile) {
    let probability = 0;

    // Usage indicator (weight: 30%)
    const apiCallsPerDay = profile.behavioral?.apiCallsPerDay || 0;
    if (apiCallsPerDay > 1000) probability += 30;
    else if (apiCallsPerDay > 500) probability += 20;
    else if (apiCallsPerDay > 100) probability += 10;

    // Feature adoption (weight: 25%)
    const featuresUsed = profile.behavioral?.mostUsedFeatures?.length || 0;
    if (featuresUsed > 7) probability += 25;
    else if (featuresUsed > 5) probability += 15;
    else if (featuresUsed > 3) probability += 8;

    // Engagement indicator (weight: 20%)
    const emailClickRate = profile.engagement?.emailClickRate || 0;
    if (emailClickRate > 0.3) probability += 20;
    else if (emailClickRate > 0.15) probability += 10;

    // Financial health (weight: 15%)
    const mrr = profile.financial?.monthlyRecurringRevenue || 0;
    if (mrr > 1000) probability += 15;
    else if (mrr > 500) probability += 10;

    // NPS indicator (weight: 10%)
    const nps = profile.engagement?.netPromoterScore;
    if (nps !== null) {
      if (nps >= 9) probability += 10;
      else if (nps <= 6) probability -= 5;
    }

    // Support issues penalty (weight: -5%)
    const supportTickets = profile.engagement?.supportTicketsCreated || 0;
    if (supportTickets > 5) probability -= 5;

    return Math.max(0, Math.min(100, probability));
  }

  /**
   * Calculate lead score (0-100)
   */
  predictLeadScore(leadData) {
    let score = 0;

    // Firmographic fit (weight: 30%)
    score += this.scoreCompanyFit(leadData) * 0.3;

    // Engagement level (weight: 25%)
    score += this.scoreEngagement(leadData) * 0.25;

    // Behavioral signals (weight: 25%)
    score += this.scoreBehavior(leadData) * 0.25;

    // Contact quality (weight: 20%)
    score += this.scoreContactQuality(leadData) * 0.2;

    return Math.round(Math.min(100, score));
  }

  /**
   * Score company fit (0-100)
   */
  scoreCompanyFit(leadData) {
    let score = 50; // Base score

    // Industry fit
    const targetIndustries = ['technology', 'finance', 'healthcare', 'retail'];
    if (targetIndustries.includes(leadData.industry?.toLowerCase())) {
      score += 20;
    }

    // Company size fit
    const employees = leadData.employees || 0;
    if (employees >= 50 && employees <= 5000) {
      score += 20;
    } else if (employees > 5000) {
      score += 15;
    }

    // Revenue fit
    const revenue = leadData.revenue || 0;
    if (revenue >= 1000000 && revenue <= 100000000) {
      score += 15;
    }

    return Math.min(100, score);
  }

  /**
   * Score engagement level (0-100)
   */
  scoreEngagement(leadData) {
    let score = 0;

    // Email opens
    if (leadData.emailOpens >= 3) score += 25;
    else if (leadData.emailOpens >= 1) score += 15;

    // Website visits
    if (leadData.websiteVisits >= 5) score += 20;
    else if (leadData.websiteVisits >= 2) score += 10;

    // Demo requests
    if (leadData.demoRequested) score += 30;

    // Content downloads
    if (leadData.contentDownloads >= 2) score += 15;
    else if (leadData.contentDownloads >= 1) score += 8;

    // Form submissions
    if (leadData.formSubmissions >= 2) score += 12;

    return Math.min(100, score);
  }

  /**
   * Score behavior signals (0-100)
   */
  scoreBehavior(leadData) {
    let score = 0;

    // Recency (visited within last 7 days)
    const daysSinceLastVisit = leadData.daysSinceLastVisit || 1000;
    if (daysSinceLastVisit <= 7) score += 30;
    else if (daysSinceLastVisit <= 30) score += 15;

    // Frequency
    if (leadData.totalWebsiteVisits >= 10) score += 20;
    else if (leadData.totalWebsiteVisits >= 5) score += 10;

    // Time on site
    const minutesOnSite = leadData.totalTimeOnSite || 0;
    if (minutesOnSite >= 30) score += 20;
    else if (minutesOnSite >= 10) score += 10;

    // Device type (mobile + desktop = more engaged)
    if (leadData.usedMobileAndDesktop) score += 10;

    // Page depth
    if (leadData.pagesVisited >= 5) score += 15;
    else if (leadData.pagesVisited >= 3) score += 8;

    return Math.min(100, score);
  }

  /**
   * Score contact quality (0-100)
   */
  scoreContactQuality(leadData) {
    let score = 50; // Base score

    // Email validity
    if (leadData.emailValidated) score += 20;

    // Phone validity
    if (leadData.phoneValidated) score += 15;

    // LinkedIn profile
    if (leadData.linkedinProfile) score += 15;

    // Decision maker title
    const decisionMakerTitles = ['ceo', 'cto', 'cfo', 'cmo', 'vp', 'director', 'manager'];
    if (decisionMakerTitles.some(t => leadData.title?.toLowerCase().includes(t))) {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Get churn risk level
   */
  getChurnRiskLevel(churnScore) {
    if (churnScore >= 75) return 'critical';
    if (churnScore >= 50) return 'high';
    if (churnScore >= 25) return 'medium';
    return 'low';
  }

  /**
   * Get expansion opportunity level
   */
  getExpansionLevel(expansionScore) {
    if (expansionScore >= 75) return 'high';
    if (expansionScore >= 50) return 'medium';
    return 'low';
  }

  /**
   * Get lead grade (A-F)
   */
  getLeadGrade(leadScore) {
    if (leadScore >= 90) return 'A';
    if (leadScore >= 75) return 'B';
    if (leadScore >= 60) return 'C';
    if (leadScore >= 45) return 'D';
    return 'F';
  }

  /**
   * Predict next best action
   */
  predictNextAction(profile) {
    const churnScore = this.predictChurn(profile);
    const expansionScore = this.predictExpansion(profile);

    if (churnScore >= 75) {
      return {
        action: 'immediate_outreach',
        reason: 'Critical churn risk',
        priority: 'urgent'
      };
    }

    if (churnScore >= 50) {
      return {
        action: 'retention_campaign',
        reason: 'High churn risk',
        priority: 'high'
      };
    }

    if (expansionScore >= 75) {
      return {
        action: 'upgrade_offer',
        reason: 'Strong expansion opportunity',
        priority: 'high'
      };
    }

    if (expansionScore >= 50) {
      return {
        action: 'feature_education',
        reason: 'Potential for upsell',
        priority: 'medium'
      };
    }

    return {
      action: 'monitor',
      reason: 'Healthy customer',
      priority: 'low'
    };
  }
}

module.exports = PredictiveModels;
