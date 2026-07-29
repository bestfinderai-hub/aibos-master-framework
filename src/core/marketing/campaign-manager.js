/**
 * Campaign Manager Service
 * Email sequences, A/B testing, analytics
 */

class CampaignManager {
  constructor() {
    this.campaigns = new Map();
    this.sequences = new Map();
  }

  /**
   * Create email campaign
   */
  createCampaign(name, config) {
    const id = Math.random().toString(36).substr(2, 9);
    const campaign = {
      id,
      name,
      type: config.type || 'nurture',
      status: 'draft',
      createdAt: new Date(),
      emails: [],
      recipients: config.recipients || [],
      analytics: {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      }
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  /**
   * Create email sequence (multi-email)
   */
  createSequence(name, emails) {
    const id = Math.random().toString(36).substr(2, 9);
    const sequence = {
      id,
      name,
      emails: emails.map((e, i) => ({
        order: i + 1,
        subject: e.subject,
        content: e.content,
        delayHours: e.delayHours || (i * 24),
        cta: e.cta
      })),
      status: 'active',
      metrics: { sent: 0, opened: 0, clicked: 0 }
    };
    this.sequences.set(id, sequence);
    return sequence;
  }

  /**
   * Launch campaign
   */
  launchCampaign(campaignId, segmentData) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    campaign.status = 'launched';
    campaign.launchedAt = new Date();
    campaign.recipients = segmentData.recipients || [];

    return {
      campaignId,
      recipientCount: campaign.recipients.length,
      launchedAt: campaign.launchedAt
    };
  }

  /**
   * Setup A/B test
   */
  setupABTest(campaignId, variants) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    campaign.abtests = variants.map((v, i) => ({
      id: \ariant-\\,
      name: v.name,
      subject: v.subject,
      percentage: v.percentage || 50,
      performance: { sent: 0, opened: 0, clicked: 0 }
    }));

    return campaign.abtests;
  }

  /**
   * Update campaign metrics
   */
  updateMetrics(campaignId, event) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const eventMap = {
      'send': 'sent',
      'open': 'opened',
      'click': 'clicked',
      'convert': 'converted'
    };

    const metric = eventMap[event];
    if (metric) campaign.analytics[metric]++;

    return campaign.analytics;
  }

  /**
   * Get campaign performance
   */
  getPerformance(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const { sent, opened, clicked, converted } = campaign.analytics;
    const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(2) : 0;
    const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(2) : 0;
    const conversionRate = clicked > 0 ? ((converted / clicked) * 100).toFixed(2) : 0;

    return {
      campaignId,
      sent,
      opened,
      openRate: \\%\,
      clicked,
      clickRate: \\%\,
      converted,
      conversionRate: \\%\,
      roi: this.calcROI(campaign)
    };
  }

  /**
   * Get winning variant
   */
  getWinningVariant(campaignId, metric = 'clickRate') {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign || !campaign.abtests) throw new Error('No A/B test data');

    return campaign.abtests.reduce((best, current) => {
      const bestRate = (best.performance.clicked / best.performance.sent) || 0;
      const currentRate = (current.performance.clicked / current.performance.sent) || 0;
      return currentRate > bestRate ? current : best;
    });
  }

  calcROI(campaign) {
    const revenue = campaign.analytics.converted * 50; // Assume \ per conversion
    const cost = campaign.recipients.length * 0.01; // \.01 per email
    return ((revenue - cost) / cost * 100).toFixed(2);
  }
}

module.exports = CampaignManager;
