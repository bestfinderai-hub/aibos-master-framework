/**
 * Insights Generator
 * Generates actionable competitive intelligence insights and recommendations
 */

class InsightsGenerator {
  constructor() {
    this.insights = [];
    this.reports = [];
  }

  /**
   * Generate weekly competitive intelligence report
   */
  generateWeeklyReport(competitors, marketData, options = {}) {
    const report = {
      id: `report_${Date.now()}`,
      type: 'weekly_competitive_intelligence',
      generatedAt: new Date(),
      period: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60000),
        end: new Date()
      },
      sections: {}
    };

    // Top competitive threats
    report.sections.competitiveThreats = this.identifyTopThreats(competitors, 5);

    // Market opportunities
    report.sections.opportunities = this.identifyMarketOpportunities(marketData, 5);

    // Innovation trends
    report.sections.innovationTrends = this.analyzeInnovationTrends(marketData);

    // Strategic recommendations
    report.sections.recommendations = this.generateRecommendations(
      competitors,
      marketData,
      options.ourCapabilities
    );

    // Risk summary
    report.sections.riskSummary = this.generateRiskSummary(competitors);

    this.reports.push(report);
    return report;
  }

  /**
   * Identify top competitive threats
   */
  identifyTopThreats(competitors, topN = 5) {
    return competitors
      .filter(c => c.threat)
      .sort((a, b) => b.threat.score - a.threat.score)
      .slice(0, topN)
      .map(c => ({
        competitor: c.name,
        threatLevel: c.threat.level,
        threatScore: c.threat.score,
        reasons: c.threat.reasons,
        keyActions: this.generateThreatActions(c),
        recommendation: this.getThreatRecommendation(c.threat.score)
      }));
  }

  /**
   * Generate threat response actions
   */
  generateThreatActions(competitor) {
    const actions = [];

    if (competitor.threat.reasons.includes('feature_parity')) {
      actions.push('Accelerate product roadmap');
      actions.push('Differentiate on use cases');
    }

    if (competitor.threat.reasons.includes('aggressive_pricing')) {
      actions.push('Emphasize value over price');
      actions.push('Highlight unique features');
      actions.push('Build customer loyalty programs');
    }

    if (competitor.threat.reasons.includes('well_funded')) {
      actions.push('Focus on profitability');
      actions.push('Build defensible moat');
      actions.push('Target niche segments');
    }

    if (competitor.threat.reasons.includes('rapid_hiring')) {
      actions.push('Retain key talent');
      actions.push('Strengthen company culture');
      actions.push('Accelerate hiring in critical roles');
    }

    return actions;
  }

  /**
   * Get threat recommendation
   */
  getThreatRecommendation(threatScore) {
    if (threatScore >= 75) return 'immediate_action_required';
    if (threatScore >= 50) return 'close_monitoring';
    return 'standard_monitoring';
  }

  /**
   * Identify market opportunities
   */
  identifyMarketOpportunities(marketData, topN = 5) {
    if (!marketData || !marketData.opportunities) {
      return this.generateDefaultOpportunities();
    }

    return marketData.opportunities
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map(opp => ({
        opportunity: opp.name,
        marketSize: opp.marketSize,
        growthRate: opp.growthRate,
        oppScore: opp.score,
        entryStrategy: this.generateEntryStrategy(opp),
        timeline: this.estimateTimeline(opp)
      }));
  }

  /**
   * Generate entry strategy
   */
  generateEntryStrategy(opportunity) {
    const competition = opportunity.competitionLevel || 'high';

    if (competition === 'low') {
      return 'First-mover advantage: Build quickly and establish market leadership';
    } else if (competition === 'medium') {
      return 'Differentiate: Focus on underserved segments or unique features';
    } else {
      return 'Partnership: Partner with established players or target niche markets';
    }
  }

  /**
   * Estimate timeline to market
   */
  estimateTimeline(opportunity) {
    const techReadiness = opportunity.techReadiness || 50;

    if (techReadiness >= 80) {
      return 'Fast-track: 6-12 months to MVP';
    } else if (techReadiness >= 50) {
      return 'Standard: 12-18 months to market readiness';
    } else {
      return 'Extended: 18-24+ months (R&D heavy)';
    }
  }

  /**
   * Analyze innovation trends
   */
  analyzeInnovationTrends(marketData) {
    if (!marketData || !marketData.trends) {
      return this.generateDefaultTrends();
    }

    const byPhase = {};
    marketData.trends.forEach(trend => {
      const phase = trend.currentPhase || 'growth';
      if (!byPhase[phase]) byPhase[phase] = [];
      byPhase[phase].push(trend);
    });

    return {
      trending_now: byPhase.growth || [],
      early_stage: byPhase.early_adoption || [],
      mature_technology: byPhase.maturity || [],
      declining: byPhase.decline || [],
      summary: `${Object.keys(byPhase).length} phases identified across ${marketData.trends.length} trends`
    };
  }

  /**
   * Generate strategic recommendations
   */
  generateRecommendations(competitors, marketData, ourCapabilities = {}) {
    const recommendations = [];

    // Competitive positioning
    const topCompetitor = competitors[0];
    if (topCompetitor) {
      recommendations.push({
        area: 'Competitive Positioning',
        priority: 'high',
        action: 'Differentiate from ' + topCompetitor.name,
        rationale: 'Top competitor threatens market position',
        expectedImpact: 'Improved market share and customer retention'
      });
    }

    // Innovation investment
    if (marketData && marketData.trends) {
      const fastGrowingTrends = (marketData.trends || []).filter(t => t.projectedGrowth > 50);
      if (fastGrowingTrends.length > 0) {
        recommendations.push({
          area: 'Innovation Strategy',
          priority: 'high',
          action: 'Invest in ' + fastGrowingTrends[0].name,
          rationale: 'High-growth trend identified',
          expectedImpact: 'Future-proof product offering'
        });
      }
    }

    // Market expansion
    recommendations.push({
      area: 'Market Expansion',
      priority: 'medium',
      action: 'Explore underserved market segments',
      rationale: 'Reduce competitive pressure',
      expectedImpact: 'New revenue streams'
    });

    // Talent & resources
    recommendations.push({
      area: 'Organization',
      priority: 'medium',
      action: 'Invest in R&D and product teams',
      rationale: 'Competitors are hiring aggressively',
      expectedImpact: 'Faster innovation cycles'
    });

    return recommendations;
  }

  /**
   * Generate risk summary
   */
  generateRiskSummary(competitors) {
    const criticalThreats = competitors.filter(c => c.threat?.level === 'critical').length;
    const highThreats = competitors.filter(c => c.threat?.level === 'high').length;

    const avgThreatScore = Math.round(
      competitors.reduce((sum, c) => sum + (c.threat?.score || 0), 0) / competitors.length
    );

    return {
      riskLevel: avgThreatScore >= 70 ? 'high' : avgThreatScore >= 50 ? 'medium' : 'low',
      criticalThreats,
      highThreats,
      avgCompetitorThreatScore: avgThreatScore,
      outlook: this.generateOutlook(avgThreatScore),
      mitigationPriority: avgThreatScore >= 70 ? 'immediate' : 'standard'
    };
  }

  /**
   * Generate market outlook
   */
  generateOutlook(avgThreatScore) {
    if (avgThreatScore >= 75) {
      return 'Highly competitive market with significant threats. Urgent action needed.';
    } else if (avgThreatScore >= 50) {
      return 'Competitive market with moderate threats. Continuous monitoring required.';
    } else {
      return 'Market opportunity exists with manageable competitive threats.';
    }
  }

  /**
   * Generate default opportunities (placeholder)
   */
  generateDefaultOpportunities() {
    return [
      {
        opportunity: 'Enterprise SaaS Segment',
        marketSize: 500000000,
        growthRate: 45,
        oppScore: 75,
        entryStrategy: 'Partner with systems integrators',
        timeline: 'Standard: 12-18 months'
      },
      {
        opportunity: 'Emerging Markets',
        marketSize: 200000000,
        growthRate: 60,
        oppScore: 68,
        entryStrategy: 'Localized solution and pricing',
        timeline: 'Fast-track: 6-12 months'
      }
    ];
  }

  /**
   * Generate default trends (placeholder)
   */
  generateDefaultTrends() {
    return {
      trending_now: [
        { name: 'AI Automation', currentPhase: 'growth', relevance: 95 },
        { name: 'Data Privacy', currentPhase: 'growth', relevance: 90 }
      ],
      early_stage: [
        { name: 'Quantum Computing', currentPhase: 'early_adoption', relevance: 70 }
      ],
      mature_technology: [
        { name: 'Cloud Computing', currentPhase: 'maturity', relevance: 85 }
      ],
      declining: [],
      summary: '4 phases identified across major market trends'
    };
  }

  /**
   * Export report
   */
  exportReport(reportId, format = 'json') {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return null;

    if (format === 'markdown') {
      return this.exportAsMarkdown(report);
    }

    return report;
  }

  /**
   * Export as Markdown
   */
  exportAsMarkdown(report) {
    let md = `# Competitive Intelligence Report\n\n`;
    md += `**Generated**: ${report.generatedAt.toISOString()}\n\n`;

    // Threats
    md += `## Top Competitive Threats\n\n`;
    report.sections.competitiveThreats.forEach(t => {
      md += `### ${t.competitor}\n`;
      md += `- **Threat Level**: ${t.threatLevel} (${t.threatScore}/100)\n`;
      md += `- **Reasons**: ${t.reasons.join(', ')}\n`;
      md += `- **Actions**: ${t.keyActions.join('; ')}\n\n`;
    });

    // Opportunities
    md += `## Market Opportunities\n\n`;
    report.sections.opportunities.forEach(o => {
      md += `- **${o.opportunity}**: Score ${o.oppScore}, ${o.growthRate}% growth\n`;
    });

    // Recommendations
    md += `\n## Strategic Recommendations\n\n`;
    report.sections.recommendations.forEach(r => {
      md += `- [${r.priority.toUpperCase()}] ${r.action}\n`;
    });

    return md;
  }
}

module.exports = InsightsGenerator;
