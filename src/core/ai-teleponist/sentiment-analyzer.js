/**
 * Sentiment & Analysis Service
 * Real-time analysis of call segments
 */

class SentimentAnalyzer {
  constructor() {
    // VADER sentiment scores (simplified)
    this.sentimentKeywords = {
      positive: ['great', 'excellent', 'perfect', 'love', 'amazing', 'good', 'yes', 'thank'],
      negative: ['bad', 'terrible', 'hate', 'awful', 'no', 'wrong', 'angry', 'frustrated'],
      objections: ['price', 'cost', 'expensive', 'timing', 'competitor', 'features', 'support']
    };

    this.intentClasses = {
      buy: ['buy', 'purchase', 'want', 'need', 'interested', 'deal'],
      ask: ['how', 'what', 'why', 'when', 'where', 'can', 'could'],
      complain: ['problem', 'issue', 'broken', 'not working', 'complaint'],
      schedule: ['meeting', 'call', 'appointment', 'time', 'calendar']
    };
  }

  /**
   * Analyze single segment
   */
  analyzeSegment(text) {
    const sentiment = this.getSentimentScore(text);
    const intent = this.getIntent(text);
    const objections = this.getObjections(text);

    return {
      text,
      sentiment,
      intent,
      objections,
      keywords: this.extractKeywords(text)
    };
  }

  /**
   * Get sentiment score (0-100)
   */
  getSentimentScore(text) {
    const lower = text.toLowerCase();
    let score = 50; // neutral

    const positiveCount = this.sentimentKeywords.positive.filter(
      word => lower.includes(word)
    ).length;

    const negativeCount = this.sentimentKeywords.negative.filter(
      word => lower.includes(word)
    ).length;

    score += positiveCount * 10;
    score -= negativeCount * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Classify intent
   */
  getIntent(text) {
    const lower = text.toLowerCase();
    let maxScore = 0;
    let classif = 'other';

    for (const [intent, keywords] of Object.entries(this.intentClasses)) {
      const score = keywords.filter(kw => lower.includes(kw)).length;
      if (score > maxScore) {
        maxScore = score;
        classif = intent;
      }
    }

    return maxScore > 0 ? classif : 'other';
  }

  /**
   * Detect objections
   */
  getObjections(text) {
    const lower = text.toLowerCase();
    return this.sentimentKeywords.objections.filter(obj => lower.includes(obj));
  }

  /**
   * Extract keywords
   */
  extractKeywords(text) {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 4); // Keep words > 4 chars
  }

  /**
   * Analyze full call transcript
   */
  analyzeFullCall(transcript, segments) {
    const sentiments = segments.map(s => s.sentiment);
    const avgSentiment = Math.round(
      sentiments.reduce((a, b) => a + b, 0) / segments.length
    );

    const objectionsList = [];
    segments.forEach(s => {
      objectionsList.push(...s.objections);
    });

    const intents = segments.map(s => s.intent);

    return {
      overallSentiment: avgSentiment,
      sentimentTrend: this.getTrend(sentiments),
      objectionsRaised: [...new Set(objectionsList)],
      intentFlow: intents,
      duration: segments.length,
      quality: this.getQualityScore(avgSentiment, objectionsList.length)
    };
  }

  /**
   * Get sentiment trend
   */
  getTrend(sentiments) {
    if (sentiments.length < 2) return 'stable';

    const first = sentiments.slice(0, Math.floor(sentiments.length / 2))
      .reduce((a, b) => a + b, 0) / Math.floor(sentiments.length / 2);
    const last = sentiments.slice(Math.floor(sentiments.length / 2))
      .reduce((a, b) => a + b, 0) / Math.ceil(sentiments.length / 2);

    if (last > first + 10) return 'improving';
    if (last < first - 10) return 'declining';
    return 'stable';
  }

  /**
   * Calculate call quality (0-100)
   */
  getQualityScore(avgSentiment, objectionCount) {
    let score = 50;
    score += Math.round(avgSentiment / 2); // 0-50 from sentiment
    score -= Math.min(50, objectionCount * 5); // Deduct for objections

    return Math.max(0, Math.min(100, score));
  }
}

module.exports = SentimentAnalyzer;
