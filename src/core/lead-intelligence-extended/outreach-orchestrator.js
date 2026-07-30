/**
 * Outreach Orchestrator
 * Campaign orchestration, multi-touch sequencing, response tracking
 */

class OutreachOrchestrator {
  constructor() {
    this.campaigns = new Map(); // campaignId -> campaign
    this.sequences = new Map(); // sequenceId -> sequence
    this.responses = []; // list of responses
  }

  // ============================================================================
  // CAMPAIGN MANAGEMENT
  // ============================================================================

  createCampaign(campaignId, config) {
    const campaign = {
      id: campaignId,
      name: config.name,
      description: config.description,
      objective: config.objective, // lead_gen, nurture, product_launch, etc
      targetAudience: config.targetAudience || {},
      targetCount: config.targetCount || 100,
      status: 'planning', // planning, active, paused, completed
      sequences: [],
      contacts: [],
      startDate: config.startDate || new Date(),
      endDate: config.endDate,
      budget: config.budget || 0,
      metrics: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        converted: 0
      },
      createdAt: new Date()
    };

    this.campaigns.set(campaignId, campaign);
    return campaign;
  }

  getCampaign(campaignId) {
    return this.campaigns.get(campaignId);
  }

  updateCampaignStatus(campaignId, newStatus) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

    campaign.status = newStatus;

    if (newStatus === 'active') {
      campaign.actualStart = new Date();
    } else if (newStatus === 'completed') {
      campaign.actualEnd = new Date();
    }

    return campaign;
  }

  addContactsToCampaign(campaignId, contacts) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

    for (const contact of contacts) {
      campaign.contacts.push({
        id: this.generateId('contact'),
        ...contact,
        status: 'pending', // pending, sent, opened, clicked, replied, converted, unsubscribed
        startDate: null,
        progressionDate: null
      });
    }

    return campaign;
  }

  // ============================================================================
  // SEQUENCE DESIGN
  // ============================================================================

  createSequence(sequenceId, config) {
    const sequence = {
      id: sequenceId,
      name: config.name,
      description: config.description,
      type: config.type || 'email', // email, sms, call, linkedin, mixed
      steps: [],
      conditions: config.conditions || {},
      personalization: config.personalization || true,
      tracking: config.tracking !== false,
      priority: config.priority || 'medium',
      createdAt: new Date()
    };

    this.sequences.set(sequenceId, sequence);
    return sequence;
  }

  getSequence(sequenceId) {
    return this.sequences.get(sequenceId);
  }

  addSequenceStep(sequenceId, config) {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) throw new Error(`Sequence ${sequenceId} not found`);

    const step = {
      id: this.generateId('step'),
      sequenceId,
      order: sequence.steps.length + 1,
      type: config.type || 'email', // email, sms, call, linkedin, wait, condition
      subject: config.subject,
      body: config.body,
      template: config.template,
      variables: config.variables || [],
      channel: config.channel || 'email',
      delayDays: config.delayDays || 0,
      conditions: config.conditions || {},
      successCriteria: config.successCriteria || [],
      fallback: config.fallback // What to do if condition not met
    };

    sequence.steps.push(step);
    return step;
  }

  buildSequence(sequenceId, campaignId) {
    const sequence = this.sequences.get(sequenceId);
    const campaign = this.campaigns.get(campaignId);

    if (!sequence || !campaign) throw new Error('Invalid sequence or campaign');

    const sequenceMap = {
      id: sequenceId,
      campaignId,
      steps: sequence.steps.map(step => ({
        ...step,
        estimatedDelay: this.calculateDelay(step, sequence.steps)
      })),
      estimatedDuration: this.calculateTotalDuration(sequence.steps),
      expectedEngagement: this.estimateEngagement(sequence)
    };

    return sequenceMap;
  }

  calculateDelay(step, allSteps) {
    let delay = step.delayDays;

    for (let i = 0; i < step.order - 1; i++) {
      delay += allSteps[i]?.delayDays || 0;
    }

    return delay;
  }

  calculateTotalDuration(steps) {
    return steps.reduce((sum, step) => sum + (step.delayDays || 0), 0);
  }

  estimateEngagement(sequence) {
    const stepCount = sequence.steps.length;
    const avgOpenRate = 0.25; // 25% average email open rate
    const avgClickRate = 0.03; // 3% average click rate
    const multiTouchBoost = 1 + (stepCount * 0.05); // 5% boost per touch

    return {
      estimatedOpenRate: (avgOpenRate * multiTouchBoost),
      estimatedClickRate: (avgClickRate * multiTouchBoost),
      estimatedReplyRate: (0.02 * multiTouchBoost),
      estimatedConversionRate: (0.005 * multiTouchBoost)
    };
  }

  // ============================================================================
  // EXECUTION & TRACKING
  // ============================================================================

  executeSequence(campaignId, sequenceId, contacts) {
    const campaign = this.campaigns.get(campaignId);
    const sequence = this.sequences.get(sequenceId);

    if (!campaign || !sequence) throw new Error('Invalid campaign or sequence');

    const execution = {
      id: this.generateId('execution'),
      campaignId,
      sequenceId,
      contacts: contacts.length,
      startDate: new Date(),
      status: 'running',
      results: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        unsubscribed: 0
      }
    };

    for (const contact of contacts) {
      for (const [index, step] of sequence.steps.entries()) {
        const delayMs = step.delayDays * 24 * 60 * 60 * 1000;
        const sendDate = new Date(Date.now() + delayMs);

        const message = {
          id: this.generateId('message'),
          executionId: execution.id,
          contactId: contact.id,
          step: index + 1,
          type: step.type,
          subject: step.subject,
          body: this.personalizeMessage(step.body, contact),
          channel: step.channel,
          scheduledFor: sendDate,
          status: 'scheduled',
          tracking: sequence.tracking ? this.generateTrackingId('track') : null
        };

        this.responses.push(message);
        execution.results.sent++;
      }
    }

    campaign.metrics.sent += execution.results.sent;
    campaign.sequences.push(sequenceId);

    return execution;
  }

  personalizeMessage(template, contact) {
    if (!template) return '';

    let message = template;

    message = message.replace(/{{firstName}}/g, contact.firstName || '');
    message = message.replace(/{{lastName}}/g, contact.lastName || '');
    message = message.replace(/{{company}}/g, contact.company || '');
    message = message.replace(/{{title}}/g, contact.title || '');

    return message;
  }

  trackResponse(messageId, config) {
    const message = this.responses.find(m => m.id === messageId);
    if (!message) throw new Error(`Message ${messageId} not found`);

    message.status = config.status; // sent, opened, clicked, replied, bounced
    message.respondedAt = new Date();
    message.response = config.response || null;
    message.sentiment = config.sentiment;

    return message;
  }

  recordReply(campaignId, contactId, config) {
    const response = {
      id: this.generateId('response'),
      campaignId,
      contactId,
      type: 'reply',
      message: config.message,
      sentiment: config.sentiment || this.analyzeSentiment(config.message),
      receivedAt: new Date(),
      quality: config.quality || 'medium' // low, medium, high
    };

    this.responses.push(response);
    return response;
  }

  analyzeSentiment(text) {
    const positiveWords = ['great', 'love', 'excellent', 'perfect', 'interested', 'yes', 'absolutely'];
    const negativeWords = ['no', 'not interested', 'terrible', 'bad', 'hate', 'unsubscribe'];

    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(w => textLower.includes(w)).length;
    const negativeCount = negativeWords.filter(w => textLower.includes(w)).length;

    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  calculateCampaignMetrics(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return null;

    const campaignResponses = this.responses.filter(r => r.campaignId === campaignId);

    const metrics = {
      campaignId,
      totalContacts: campaign.contacts.length,
      sent: campaignResponses.filter(r => r.status === 'sent').length,
      opened: campaignResponses.filter(r => r.status === 'opened').length,
      clicked: campaignResponses.filter(r => r.status === 'clicked').length,
      replied: campaignResponses.filter(r => r.status === 'replied').length,
      converted: campaignResponses.filter(r => r.status === 'converted').length,
      unsubscribed: campaignResponses.filter(r => r.status === 'unsubscribed').length
    };

    metrics.openRate = metrics.sent > 0 ? (metrics.opened / metrics.sent) * 100 : 0;
    metrics.clickRate = metrics.sent > 0 ? (metrics.clicked / metrics.sent) * 100 : 0;
    metrics.replyRate = metrics.sent > 0 ? (metrics.replied / metrics.sent) * 100 : 0;
    metrics.conversionRate = metrics.sent > 0 ? (metrics.converted / metrics.sent) * 100 : 0;

    return metrics;
  }

  getContactProgression(contactId) {
    const messages = this.responses.filter(m => m.contactId === contactId && m.type !== 'reply');

    return messages.map(m => ({
      step: m.step,
      status: m.status,
      sentAt: m.respondedAt,
      channel: m.channel
    }));
  }

  identifyEngagedContacts(campaignId, minEngagement = 2) {
    const campaignResponses = this.responses.filter(r => r.campaignId === campaignId);
    const engagedByContact = {};

    for (const response of campaignResponses) {
      if (!engagedByContact[response.contactId]) {
        engagedByContact[response.contactId] = 0;
      }

      if (['opened', 'clicked', 'replied'].includes(response.status)) {
        engagedByContact[response.contactId]++;
      }
    }

    return Object.entries(engagedByContact)
      .filter(([_, count]) => count >= minEngagement)
      .map(([contactId]) => contactId);
  }

  generateCampaignReport(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    const metrics = this.calculateCampaignMetrics(campaignId);
    const engagedContacts = this.identifyEngagedContacts(campaignId);

    return {
      campaignId,
      name: campaign.name,
      status: campaign.status,
      duration: campaign.endDate ? `${Math.ceil((campaign.endDate - campaign.startDate) / (1000 * 60 * 60 * 24))} days` : 'Ongoing',
      metrics,
      engagedContacts: engagedContacts.length,
      topPerformers: this.identifyTopPerformers(campaignId),
      roi: this.estimateROI(campaign, metrics),
      nextSteps: this.recommendNextSteps(metrics),
      generatedAt: new Date()
    };
  }

  identifyTopPerformers(campaignId) {
    const campaignResponses = this.responses.filter(r => r.campaignId === campaignId && r.type !== 'reply');

    const performers = {};
    for (const response of campaignResponses) {
      if (!performers[response.contactId]) {
        performers[response.contactId] = 0;
      }
      if (['opened', 'clicked', 'replied'].includes(response.status)) {
        performers[response.contactId]++;
      }
    }

    return Object.entries(performers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([contactId]) => contactId);
  }

  estimateROI(campaign, metrics) {
    const costPerContact = campaign.budget / campaign.contacts.length;
    const costPerConversion = metrics.converted > 0 ? campaign.budget / metrics.converted : campaign.budget;

    return {
      totalSpend: campaign.budget,
      conversions: metrics.converted,
      costPerConversion: Math.round(costPerConversion),
      estimatedValue: metrics.converted * 50000, // Assume $50k average deal
      roi: metrics.converted > 0 ? (((metrics.converted * 50000) - campaign.budget) / campaign.budget) * 100 : -100
    };
  }

  recommendNextSteps(metrics) {
    const recommendations = [];

    if (metrics.openRate < 15) {
      recommendations.push('Improve subject lines - current open rate is below benchmark');
    }

    if (metrics.clickRate < 2) {
      recommendations.push('Enhance call-to-action and message relevance');
    }

    if (metrics.replyRate < 1) {
      recommendations.push('Increase personalization and relevance in messages');
    }

    if (metrics.conversionRate < 0.5) {
      recommendations.push('Optimize follow-up sequences for engaged contacts');
    }

    return recommendations;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTrackingId(prefix) {
    return `${prefix}-${Math.random().toString(36).substr(2, 16)}`;
  }
}

module.exports = OutreachOrchestrator;
