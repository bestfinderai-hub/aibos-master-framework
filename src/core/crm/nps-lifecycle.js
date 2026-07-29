/**
 * NPS & Lifecycle Manager
 * Customer journey automation, feedback, retention
 */

class NPSLifecycleManager {
  constructor() {
    this.npsResponses = [];
    this.lifecycleEvents = new Map();
  }

  /**
   * Send NPS survey
   */
  sendNPSSurvey(customerId, data) {
    const survey = {
      id: Math.random().toString(36).substr(2, 9),
      customerId,
      type: data.type || 'nps', // nps, csat, ces
      sentAt: new Date(),
      respondedAt: null,
      score: null,
      comment: null,
      segment: data.segment || 'general' // general, product, support, billing
    };
    return survey;
  }

  /**
   * Record NPS response
   */
  recordNPSResponse(surveyId, score, comment) {
    const response = {
      surveyId,
      score, // 0-10
      comment,
      respondedAt: new Date(),
      sentiment: this.analyzeSentiment(comment),
      category: this.categorizeResponse(score)
    };

    this.npsResponses.push(response);
    return response;
  }

  /**
   * Categorize NPS response
   */
  categorizeResponse(score) {
    if (score >= 9) return 'promoter'; // Likely to recommend
    if (score >= 7) return 'passive'; // Neutral
    return 'detractor'; // Dissatisfied
  }

  /**
   * Calculate NPS score
   * Formula: (Promoters - Detractors) / Total * 100
   */
  calculateNPS() {
    if (this.npsResponses.length === 0) return 0;

    const promoters = this.npsResponses.filter(r => r.category === 'promoter').length;
    const detractors = this.npsResponses.filter(r => r.category === 'detractor').length;
    const total = this.npsResponses.length;

    return Math.round(((promoters - detractors) / total) * 100);
  }

  /**
   * Analyze sentiment from NPS comment
   */
  analyzeSentiment(comment) {
    if (!comment) return 0.5;

    const positive = ['great', 'excellent', 'love', 'amazing', 'perfect', 'thank'];
    const negative = ['bad', 'terrible', 'hate', 'awful', 'poor', 'disappointed'];

    const posCount = positive.filter(w => comment.toLowerCase().includes(w)).length;
    const negCount = negative.filter(w => comment.toLowerCase().includes(w)).length;

    return Math.max(0, Math.min(1, 0.5 + (posCount - negCount) * 0.2));
  }

  /**
   * Create lifecycle event
   */
  createLifecycleEvent(customerId, eventType, data = {}) {
    const event = {
      id: Math.random().toString(36).substr(2, 9),
      customerId,
      type: eventType, // onboarding_started, feature_adopted, expansion_ready, churn_risk, etc.
      timestamp: new Date(),
      data
    };

    if (!this.lifecycleEvents.has(customerId)) {
      this.lifecycleEvents.set(customerId, []);
    }

    this.lifecycleEvents.get(customerId).push(event);
    return event;
  }

  /**
   * Get recommended actions based on lifecycle
   */
  getRecommendedActions(customerId, health, npsScore) {
    const actions = [];

    // Onboarding stage
    if (health.components.adoption < 30) {
      actions.push({
        action: 'onboarding_training',
        urgency: 'high',
        message: 'Schedule training to improve adoption'
      });
    }

    // Expansion stage
    if (health.status === 'green' && health.components.adoption > 70) {
      actions.push({
        action: 'upsell_opportunity',
        urgency: 'medium',
        message: 'High usage - discuss expansion plans'
      });
    }

    // At-risk stage
    if (health.status === 'red') {
      actions.push({
        action: 'retention_outreach',
        urgency: 'high',
        message: 'Urgent: Proactive outreach needed'
      });
    }

    // Detractor follow-up
    if (npsScore < 30 && npsScore !== null) {
      actions.push({
        action: 'detractor_followup',
        urgency: 'high',
        message: 'Detractor NPS - schedule check-in'
      });
    }

    return actions;
  }

  /**
   * Get customer lifecycle stage
   */
  getLifecycleStage(adoptionPercent, months, npsScore) {
    const monthsAsBrand = months || 1;

    // Onboarding: First 1-2 months, low adoption
    if (monthsAsBrand <= 2 && adoptionPercent < 50) return 'onboarding';

    // Active: Using product, growing adoption
    if (adoptionPercent >= 50 && adoptionPercent < 80) return 'active';

    // Expansion: High adoption, ready for upsell
    if (adoptionPercent >= 80 && npsScore > 50) return 'expansion';

    // At-risk: Declining metrics or low NPS
    if (adoptionPercent < 30 || npsScore < 30) return 'at_risk';

    // Mature: Stable, sustained usage
    return 'mature';
  }
}

module.exports = NPSLifecycleManager;
