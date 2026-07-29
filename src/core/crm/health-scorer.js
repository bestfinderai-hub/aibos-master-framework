/**
 * Customer Health Scorer
 * NPS, product adoption, support sentiment, churn risk
 */

class HealthScorer {
  constructor() {
    this.healthScores = new Map();
  }

  /**
   * Calculate health score (0-100)
   * Formula: (Adoption * 30%) + (Usage * 25%) + (NPS * 25%) + (Support * 20%)
   */
  calculateHealth(customerId, data) {
    const adoption = this.scoreAdoption(data.adoptionPercent || 0);
    const usage = this.scoreUsage(data.monthlyActiveUsers || 0, data.totalUsers || 1);
    const nps = this.scoreNPS(data.npsScore || 0);
    const support = this.scoreSupport(data.supportSentiment || 0.5);

    const health = (adoption * 0.30) + (usage * 0.25) + (nps * 0.25) + (support * 0.20);

    const score = {
      customerId,
      score: Math.round(health),
      components: { adoption, usage, nps, support },
      status: this.getHealthStatus(health),
      timestamp: new Date()
    };

    this.healthScores.set(customerId, score);
    return score;
  }

  /**
   * Adoption score (0-100)
   * Based on feature usage percentage
   */
  scoreAdoption(adoptionPercent) {
    // 0% adoption = 0 points, 100% adoption = 100 points
    return Math.min(100, adoptionPercent);
  }

  /**
   * Usage score (0-100)
   * Based on active users / total users
   */
  scoreUsage(activeUsers, totalUsers) {
    if (totalUsers === 0) return 0;
    const percent = (activeUsers / totalUsers) * 100;
    return Math.min(100, percent);
  }

  /**
   * NPS score (0-100)
   * NPS ranges from -100 to +100, convert to 0-100
   */
  scoreNPS(npsScore) {
    return Math.max(0, Math.min(100, (npsScore + 100) / 2));
  }

  /**
   * Support score (0-100)
   * Based on sentiment (0 = negative, 1 = positive)
   */
  scoreSupport(sentiment) {
    return sentiment * 100;
  }

  /**
   * Get health status
   */
  getHealthStatus(score) {
    if (score >= 90) return 'green'; // Healthy, expansion ready
    if (score >= 50) return 'yellow'; // Stable, monitor
    return 'red'; // At risk, intervention needed
  }

  /**
   * Get churn risk prediction
   */
  predictChurnRisk(health) {
    // Simplified: red customers have high churn risk
    if (health.status === 'red') return 'high';
    if (health.status === 'yellow') return 'medium';
    return 'low';
  }

  /**
   * Get upsell opportunity
   */
  getUpsellOpportunity(health) {
    // Green customers with high usage = expansion opportunity
    if (health.status === 'green' && health.components.usage > 80) {
      return { recommendation: 'upsell', confidence: 'high' };
    }

    // Yellow customers with high NPS = expansion potential
    if (health.status === 'yellow' && health.components.nps > 75) {
      return { recommendation: 'cross-sell', confidence: 'medium' };
    }

    return null;
  }

  /**
   * Get health trend (improving/declining/stable)
   */
  getHealthTrend(previousScore, currentScore) {
    const change = currentScore - previousScore;
    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  }

  /**
   * Get alert recommendations
   */
  getAlerts(health) {
    const alerts = [];

    if (health.status === 'red') {
      alerts.push({ severity: 'high', message: 'Customer at risk - proactive outreach needed' });
    }

    if (health.components.adoption < 30) {
      alerts.push({ severity: 'medium', message: 'Low feature adoption - send training' });
    }

    if (health.components.support < 50) {
      alerts.push({ severity: 'medium', message: 'Negative support sentiment - escalate' });
    }

    if (health.components.nps < 30) {
      alerts.push({ severity: 'medium', message: 'Detractor NPS score - schedule check-in' });
    }

    return alerts;
  }
}

module.exports = HealthScorer;
