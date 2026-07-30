/**
 * Decision Maker Resolver
 * Identify key decision makers, roles, influence mapping, and contact information
 */

class DecisionMakerResolver {
  constructor() {
    this.decisionMakers = []; // list of identified DMs
    this.influenceGraphs = new Map(); // companyId -> influence graph
  }

  // ============================================================================
  // DECISION MAKER IDENTIFICATION
  // ============================================================================

  identifyDecisionMaker(companyId, config) {
    const dm = {
      id: this.generateId('dm'),
      companyId,
      firstName: config.firstName,
      lastName: config.lastName,
      title: config.title,
      department: config.department || 'executive', // executive, management, technical, other
      role: config.role, // CEO, CTO, VP Sales, etc.
      influenceLevel: this.assessInfluenceLevel(config),
      decisionPower: this.assessDecisionPower(config),
      budget: config.budget || 0,
      email: config.email,
      phone: config.phone,
      linkedin: config.linkedin,
      twitter: config.twitter,
      manager: config.manager || null,
      directReports: config.directReports || [],
      communicationStyle: config.communicationStyle || 'professional',
      priorities: config.priorities || [],
      painPoints: config.painPoints || [],
      buyingCriteria: config.buyingCriteria || [],
      seniority: this.calculateSeniority(config.title),
      createdAt: new Date(),
      lastContactDate: null,
      interactionHistory: []
    };

    this.decisionMakers.push(dm);
    return dm;
  }

  assessInfluenceLevel(config) {
    const titleLower = (config.title || '').toLowerCase();

    if (titleLower.includes('chief') || titleLower.includes('ceo') || titleLower.includes('president')) {
      return 100;
    } else if (titleLower.includes('vp') || titleLower.includes('vice') || titleLower.includes('head of')) {
      return 80;
    } else if (titleLower.includes('director') || titleLower.includes('senior')) {
      return 60;
    } else if (titleLower.includes('manager')) {
      return 40;
    }
    return 50;
  }

  assessDecisionPower(config) {
    const titleWords = (config.title || '').toLowerCase().split(' ');

    if (titleWords.includes('chief') || titleWords.includes('ceo') || titleWords.includes('president')) {
      return 'executive';
    } else if (titleWords.includes('vp') || titleWords.includes('vice') || titleWords.includes('head')) {
      return 'high';
    } else if (titleWords.includes('director') || titleWords.includes('senior')) {
      return 'medium';
    } else if (titleWords.includes('manager')) {
      return 'moderate';
    }
    return 'low';
  }

  calculateSeniority(title) {
    const titleWords = (title || '').toLowerCase();

    if (titleWords.includes('c-level') || titleWords.includes('chief') || titleWords.includes('president')) {
      return 5;
    } else if (titleWords.includes('vp') || titleWords.includes('vice') || titleWords.includes('head')) {
      return 4;
    } else if (titleWords.includes('director') || titleWords.includes('senior')) {
      return 3;
    } else if (titleWords.includes('manager')) {
      return 2;
    }
    return 1;
  }

  getDecisionMaker(dmId) {
    return this.decisionMakers.find(dm => dm.id === dmId);
  }

  // ============================================================================
  // INFLUENCE MAPPING
  // ============================================================================

  buildInfluenceGraph(companyId, dmIds) {
    const graph = {
      companyId,
      nodes: dmIds.map(id => {
        const dm = this.getDecisionMaker(id);
        return {
          id: dm.id,
          name: `${dm.firstName} ${dm.lastName}`,
          title: dm.title,
          influenceLevel: dm.influenceLevel,
          decisionPower: dm.decisionPower
        };
      }),
      edges: this.buildEdges(dmIds),
      centrality: this.calculateCentrality(dmIds),
      buyingCommittee: this.identifyBuyingCommittee(dmIds),
      decisionPath: this.mapDecisionPath(dmIds)
    };

    this.influenceGraphs.set(companyId, graph);
    return graph;
  }

  buildEdges(dmIds) {
    const edges = [];
    const dms = dmIds.map(id => this.getDecisionMaker(id));

    for (const dm of dms) {
      if (dm.manager) {
        edges.push({
          from: dm.id,
          to: dm.manager,
          type: 'reports_to'
        });
      }

      for (const report of dm.directReports) {
        edges.push({
          from: dm.id,
          to: report,
          type: 'manages'
        });
      }
    }

    return edges;
  }

  calculateCentrality(dmIds) {
    const centrality = {};
    const dms = dmIds.map(id => this.getDecisionMaker(id));

    for (const dm of dms) {
      const connections = (dm.directReports?.length || 0) + (dm.manager ? 1 : 0);
      centrality[dm.id] = {
        name: `${dm.firstName} ${dm.lastName}`,
        connections,
        score: dm.influenceLevel * (1 + connections * 0.1)
      };
    }

    return centrality;
  }

  identifyBuyingCommittee(dmIds) {
    const dms = dmIds.map(id => this.getDecisionMaker(id));
    const committee = {
      decision_makers: dms.filter(dm => dm.decisionPower === 'executive' || dm.decisionPower === 'high'),
      influencers: dms.filter(dm => dm.decisionPower === 'medium' || dm.decisionPower === 'moderate'),
      evaluators: dms.filter(dm => dm.decisionPower === 'low'),
      budget_holders: dms.filter(dm => dm.budget > 0)
    };

    return committee;
  }

  mapDecisionPath(dmIds) {
    const dms = dmIds.map(id => this.getDecisionMaker(id));

    // Sort by seniority to find the decision path
    const sortedByInfluence = [...dms].sort((a, b) => b.influenceLevel - a.influenceLevel);

    const path = {
      primary: sortedByInfluence[0],
      secondary: sortedByInfluence.slice(1, 3),
      stakeholders: sortedByInfluence.slice(3)
    };

    return path;
  }

  // ============================================================================
  // PERSONA DEVELOPMENT
  // ============================================================================

  developBuyerPersona(dmIds) {
    const dms = dmIds.map(id => this.getDecisionMaker(id));

    const personas = {};

    // Group by department
    const departments = {};
    for (const dm of dms) {
      if (!departments[dm.department]) {
        departments[dm.department] = [];
      }
      departments[dm.department].push(dm);
    }

    // Create persona for each department
    for (const [dept, members] of Object.entries(departments)) {
      const avgInfluence = members.reduce((sum, m) => sum + m.influenceLevel, 0) / members.length;
      const commonPainPoints = this.findCommonPainPoints(members);
      const commonPriorities = this.findCommonPriorities(members);

      personas[dept] = {
        department: dept,
        count: members.length,
        avgInfluence: Math.round(avgInfluence),
        topRoles: [...new Set(members.map(m => m.role))],
        painPoints: commonPainPoints,
        priorities: commonPriorities,
        communicationStyle: members[0]?.communicationStyle || 'professional',
        buyingCriteria: this.aggregateBuyingCriteria(members)
      };
    }

    return personas;
  }

  findCommonPainPoints(dms) {
    const painPoints = {};

    for (const dm of dms) {
      for (const pain of dm.painPoints) {
        painPoints[pain] = (painPoints[pain] || 0) + 1;
      }
    }

    return Object.entries(painPoints)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pain]) => pain);
  }

  findCommonPriorities(dms) {
    const priorities = {};

    for (const dm of dms) {
      for (const priority of dm.priorities) {
        priorities[priority] = (priorities[priority] || 0) + 1;
      }
    }

    return Object.entries(priorities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([priority]) => priority);
  }

  aggregateBuyingCriteria(dms) {
    const criteria = {};

    for (const dm of dms) {
      for (const criterion of dm.buyingCriteria) {
        criteria[criterion] = (criteria[criterion] || 0) + 1;
      }
    }

    return Object.entries(criteria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([criterion]) => criterion);
  }

  // ============================================================================
  // INTERACTION TRACKING
  // ============================================================================

  recordInteraction(dmId, config) {
    const dm = this.getDecisionMaker(dmId);
    if (!dm) throw new Error(`Decision maker ${dmId} not found`);

    const interaction = {
      id: this.generateId('interaction'),
      type: config.type, // email, call, meeting, demo, etc
      date: new Date(),
      duration: config.duration,
      notes: config.notes,
      sentiment: config.sentiment || 'neutral', // positive, neutral, negative
      nextSteps: config.nextSteps,
      outcome: config.outcome // interested, not_interested, need_more_info, defer
    };

    dm.interactionHistory.push(interaction);
    if (!dm.lastContactDate) {
      dm.lastContactDate = new Date();
    }

    return interaction;
  }

  getInteractionHistory(dmId) {
    const dm = this.getDecisionMaker(dmId);
    if (!dm) return [];

    return dm.interactionHistory.sort((a, b) => b.date - a.date);
  }

  // ============================================================================
  // OUTREACH READINESS
  // ============================================================================

  assessOutreachReadiness(dmId) {
    const dm = this.getDecisionMaker(dmId);
    if (!dm) return null;

    const contactInfo = {
      hasEmail: !!dm.email,
      hasPhone: !!dm.phone,
      hasLinkedIn: !!dm.linkedin,
      hasTwitter: !!dm.twitter
    };

    const contactQuality = Object.values(contactInfo).filter(Boolean).length / 4;

    const readiness = {
      dmId,
      name: `${dm.firstName} ${dm.lastName}`,
      contactQuality: Math.round(contactQuality * 100),
      recommendedChannels: this.recommendChannels(contactInfo),
      messagePersonalization: this.buildMessagePersonalization(dm),
      recentInteraction: dm.lastContactDate ? `${Math.floor((Date.now() - dm.lastContactDate) / (1000 * 60 * 60))} hours ago` : 'Never',
      readinessScore: this.calculateReadinessScore(dm, contactQuality)
    };

    return readiness;
  }

  recommendChannels(contactInfo) {
    const channels = [];

    if (contactInfo.hasEmail) channels.push('email');
    if (contactInfo.hasPhone) channels.push('phone');
    if (contactInfo.hasLinkedIn) channels.push('linkedin');
    if (contactInfo.hasTwitter) channels.push('twitter');

    return channels;
  }

  buildMessagePersonalization(dm) {
    return {
      name: dm.firstName,
      title: dm.title,
      company: dm.companyId,
      painPoints: dm.painPoints,
      priorities: dm.priorities,
      communicationStyle: dm.communicationStyle
    };
  }

  calculateReadinessScore(dm, contactQuality) {
    const factors = {
      contact_quality: contactQuality * 100,
      influence: dm.influenceLevel,
      decision_power: dm.decisionPower === 'executive' ? 100 : dm.decisionPower === 'high' ? 80 : 50,
      profile_completeness: ((dm.email ? 25 : 0) + (dm.phone ? 25 : 0) + (dm.painPoints.length > 0 ? 25 : 0) + (dm.priorities.length > 0 ? 25 : 0))
    };

    const score = Object.values(factors).reduce((a, b) => a + b, 0) / Object.keys(factors).length;
    return Math.round(score);
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  listCompanyDecisionMakers(companyId) {
    return this.decisionMakers.filter(dm => dm.companyId === companyId);
  }

  searchDecisionMakers(query = {}) {
    let results = [...this.decisionMakers];

    if (query.companyId) {
      results = results.filter(dm => dm.companyId === query.companyId);
    }

    if (query.role) {
      results = results.filter(dm => dm.role?.toLowerCase().includes(query.role.toLowerCase()));
    }

    if (query.department) {
      results = results.filter(dm => dm.department === query.department);
    }

    if (query.minInfluence) {
      results = results.filter(dm => dm.influenceLevel >= query.minInfluence);
    }

    return results;
  }

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = DecisionMakerResolver;
