/**
 * Customer 360 Profiler
 * Builds unified customer profiles from multiple data sources
 */

class CustomerProfiler {
  constructor() {
    this.profileCache = new Map();
  }

  /**
   * Build 360-degree customer profile
   */
  buildProfile(customerId, sources) {
    const profile = {
      customerId,
      demographics: {},
      firmographics: {},
      behavioral: {},
      engagement: {},
      financial: {},
      health: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Merge data from all sources
    if (sources.crm) {
      profile.demographics = this.extractDemographics(sources.crm);
      profile.firmographics = this.extractFirmographics(sources.crm);
    }

    if (sources.usage) {
      profile.behavioral = this.extractBehavioral(sources.usage);
    }

    if (sources.engagement) {
      profile.engagement = this.extractEngagement(sources.engagement);
    }

    if (sources.billing) {
      profile.financial = this.extractFinancial(sources.billing);
    }

    // Calculate health score
    profile.health = this.calculateHealth(profile);

    this.profileCache.set(customerId, profile);
    return profile;
  }

  /**
   * Extract demographics
   */
  extractDemographics(crmData) {
    return {
      name: crmData.name,
      email: crmData.email,
      phone: crmData.phone,
      location: crmData.location,
      title: crmData.title,
      department: crmData.department,
      signupDate: crmData.signupDate
    };
  }

  /**
   * Extract firmographics
   */
  extractFirmographics(crmData) {
    return {
      company: crmData.company,
      industry: crmData.industry,
      employees: crmData.employees,
      revenue: crmData.revenue,
      founded: crmData.founded,
      website: crmData.website,
      headquarters: crmData.headquarters
    };
  }

  /**
   * Extract behavioral data
   */
  extractBehavioral(usageData) {
    const actions = usageData.actions || [];

    return {
      totalEvents: actions.length,
      lastActiveDate: this.getLastActiveDate(actions),
      daysInactive: this.calculateDaysInactive(actions),
      mostUsedFeatures: this.getMostUsedFeatures(actions),
      apiCallsPerDay: this.calculateApiCallsPerDay(actions),
      errorRate: this.calculateErrorRate(actions),
      peakUsageTime: this.getPeakUsageTime(actions)
    };
  }

  /**
   * Extract engagement metrics
   */
  extractEngagement(engagementData) {
    const interactions = engagementData.interactions || [];

    return {
      emailsReceived: interactions.filter(i => i.type === 'email').length,
      emailsOpened: interactions.filter(i => i.type === 'email' && i.opened).length,
      emailClickRate: this.calculateEmailClickRate(interactions),
      communityPostsCreated: interactions.filter(i => i.type === 'community').length,
      supportTicketsCreated: interactions.filter(i => i.type === 'support').length,
      supportResolutionTime: this.getAverageSupportTime(interactions),
      netPromoterScore: engagementData.nps || null
    };
  }

  /**
   * Extract financial data
   */
  extractFinancial(billingData) {
    return {
      currentPlan: billingData.plan,
      monthlyRecurringRevenue: billingData.mrr || 0,
      annualContractValue: billingData.acv || 0,
      totalSpent: billingData.totalSpent || 0,
      paymentMethod: billingData.paymentMethod,
      billingCycle: billingData.billingCycle,
      nextBillingDate: billingData.nextBillingDate,
      hasOutstandingInvoices: billingData.hasOutstandingInvoices || false,
      averageMonthlySpend: this.calculateAverageMonthlySpend(billingData)
    };
  }

  /**
   * Calculate customer health score
   */
  calculateHealth(profile) {
    let score = 100;

    // Behavioral factors (30%)
    if (profile.behavioral.daysInactive > 30) score -= 20;
    if (profile.behavioral.errorRate > 0.1) score -= 10;

    // Engagement factors (25%)
    if (profile.engagement.emailClickRate < 0.1) score -= 10;
    if (profile.engagement.supportTicketsCreated > 5) score -= 10;

    // Financial factors (25%)
    if (profile.financial.hasOutstandingInvoices) score -= 15;
    if (profile.financial.monthlyRecurringRevenue === 0) score -= 20;

    // NPS factor (20%)
    if (profile.engagement.netPromoterScore !== null) {
      if (profile.engagement.netPromoterScore < 7) score -= 15;
      if (profile.engagement.netPromoterScore >= 9) score += 10;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      status: this.getHealthStatus(score),
      riskFactors: this.identifyRiskFactors(profile)
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(score) {
    if (score >= 75) return 'healthy';
    if (score >= 50) return 'at_risk';
    return 'critical';
  }

  /**
   * Identify risk factors
   */
  identifyRiskFactors(profile) {
    const risks = [];

    if (profile.behavioral.daysInactive > 30) {
      risks.push({ type: 'inactivity', severity: 'high', days: profile.behavioral.daysInactive });
    }

    if (profile.engagement.supportTicketsCreated > 5) {
      risks.push({ type: 'support_issues', severity: 'medium', count: profile.engagement.supportTicketsCreated });
    }

    if (profile.financial.hasOutstandingInvoices) {
      risks.push({ type: 'payment', severity: 'critical' });
    }

    if (profile.behavioral.errorRate > 0.1) {
      risks.push({ type: 'technical_issues', severity: 'medium', rate: profile.behavioral.errorRate });
    }

    return risks;
  }

  /**
   * Helper: Get last active date
   */
  getLastActiveDate(actions) {
    if (!actions || actions.length === 0) return null;
    return new Date(Math.max(...actions.map(a => new Date(a.timestamp))));
  }

  /**
   * Helper: Calculate days inactive
   */
  calculateDaysInactive(actions) {
    const lastActive = this.getLastActiveDate(actions);
    if (!lastActive) return Infinity;
    return Math.floor((new Date() - lastActive) / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper: Get most used features
   */
  getMostUsedFeatures(actions) {
    const features = {};
    (actions || []).forEach(a => {
      features[a.feature] = (features[a.feature] || 0) + 1;
    });
    return Object.entries(features)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature, count]) => ({ feature, count }));
  }

  /**
   * Helper: Calculate API calls per day
   */
  calculateApiCallsPerDay(actions) {
    if (!actions || actions.length === 0) return 0;
    const uniqueDays = new Set(actions.map(a => new Date(a.timestamp).toDateString()));
    return Math.round(actions.length / uniqueDays.size);
  }

  /**
   * Helper: Calculate error rate
   */
  calculateErrorRate(actions) {
    if (!actions || actions.length === 0) return 0;
    const errors = actions.filter(a => a.status === 'error').length;
    return errors / actions.length;
  }

  /**
   * Helper: Get peak usage time
   */
  getPeakUsageTime(actions) {
    const hours = {};
    (actions || []).forEach(a => {
      const hour = new Date(a.timestamp).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    return Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  /**
   * Helper: Calculate email click rate
   */
  calculateEmailClickRate(interactions) {
    const emails = interactions.filter(i => i.type === 'email');
    if (emails.length === 0) return 0;
    const clicked = emails.filter(i => i.clicked).length;
    return clicked / emails.length;
  }

  /**
   * Helper: Get average support resolution time
   */
  getAverageSupportTime(interactions) {
    const tickets = interactions.filter(i => i.type === 'support' && i.resolvedAt);
    if (tickets.length === 0) return null;
    const times = tickets.map(t => new Date(t.resolvedAt) - new Date(t.createdAt));
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length / (1000 * 60 * 60));
  }

  /**
   * Helper: Calculate average monthly spend
   */
  calculateAverageMonthlySpend(billingData) {
    if (!billingData.history || billingData.history.length === 0) {
      return billingData.mrr || 0;
    }
    const total = billingData.history.reduce((sum, h) => sum + h.amount, 0);
    return total / billingData.history.length;
  }

  /**
   * Get cached profile
   */
  getProfile(customerId) {
    return this.profileCache.get(customerId);
  }

  /**
   * Update profile
   */
  updateProfile(customerId, updates) {
    const profile = this.profileCache.get(customerId);
    if (!profile) return null;

    const updated = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    };

    this.profileCache.set(customerId, updated);
    return updated;
  }
}

module.exports = CustomerProfiler;
