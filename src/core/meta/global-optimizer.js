/**
 * Global Optimizer
 * System-wide improvement recommendations and optimization
 */

class GlobalOptimizer {
  constructor() {
    this.optimizations = new Map();
    this.constraints = new Map();
    this.objectives = [];
    this.pareto = []; // Pareto frontier of optimal solutions
  }

  // ============================================================================
  // OBJECTIVE & CONSTRAINT SETUP
  // ============================================================================

  setObjectives(objectives) {
    if (!Array.isArray(objectives)) {
      throw new Error('Objectives must be an array');
    }

    this.objectives = objectives.map(obj => ({
      name: obj.name,
      metric: obj.metric,
      direction: obj.direction, // 'maximize' or 'minimize'
      weight: obj.weight || 1,
      targetValue: obj.targetValue
    }));

    return this.objectives;
  }

  addConstraint(name, metricName, operator, value) {
    this.constraints.set(name, {
      name,
      metricName,
      operator, // '>=', '<=', '=='
      value,
      status: 'unmet'
    });

    return this.constraints.get(name);
  }

  getConstraints() {
    return Array.from(this.constraints.values());
  }

  // ============================================================================
  // OPTIMIZATION ENGINE
  // ============================================================================

  optimize(currentMetrics) {
    const candidates = this.generateCandidateSolutions(currentMetrics);
    const feasible = this.filterFeasible(candidates, currentMetrics);
    const scored = this.scoreSolutions(feasible);
    const optimal = this.selectOptimalSolutions(scored);

    return {
      timestamp: new Date(),
      currentMetrics,
      feasibleSolutions: feasible.length,
      optimalSolutions: optimal,
      paretoFrontier: this.calculateParetoFrontier(optimal),
      recommendations: this.generateRecommendations(optimal, currentMetrics)
    };
  }

  generateCandidateSolutions(metrics) {
    const candidates = [];

    // Strategy 1: Revenue maximization
    candidates.push({
      name: 'Revenue Maximization',
      strategy: 'grow_revenue',
      changes: {
        pricing: '+10%',
        marketingSpend: '+20%',
        salesTeamSize: '+2',
        featureDevelopment: 'premium_features'
      },
      expectedImpact: this.estimateImpact(metrics, {
        revenueChange: 0.25,
        churnChange: 0.03,
        costChange: 0.15
      })
    });

    // Strategy 2: Efficiency optimization
    candidates.push({
      name: 'Efficiency Optimization',
      strategy: 'reduce_costs',
      changes: {
        infrastructure: 'optimize',
        operations: 'automate',
        support: 'tiered',
        debtPaydown: '40%'
      },
      expectedImpact: this.estimateImpact(metrics, {
        costChange: -0.20,
        velocityChange: 0.15,
        incidentChange: -0.30
      })
    });

    // Strategy 3: Quality focus
    candidates.push({
      name: 'Quality Focus',
      strategy: 'improve_quality',
      changes: {
        testingInvestment: '+15%',
        codeReview: 'mandatory',
        technicalDebt: '-50%',
        monitoringEnhancement: '2x'
      },
      expectedImpact: this.estimateImpact(metrics, {
        qualityChange: 0.25,
        incidentChange: -0.50,
        satisfactionChange: 0.15,
        costChange: 0.10
      })
    });

    // Strategy 4: Customer success focus
    candidates.push({
      name: 'Customer Success',
      strategy: 'improve_retention',
      changes: {
        supportTeamSize: '+3',
        proactiveEngagement: 'enabled',
        npsProgram: 'enhanced',
        onboarding: 'dedicated'
      },
      expectedImpact: this.estimateImpact(metrics, {
        npsChange: 15,
        churnChange: -0.03,
        satisfactionChange: 0.20,
        costChange: 0.12
      })
    });

    // Strategy 5: Market expansion
    candidates.push({
      name: 'Market Expansion',
      strategy: 'expand_market',
      changes: {
        newMarketEntry: '2 markets',
        productAdaptation: 'localization',
        partnershipDevelopment: 'enabled',
        marketingBudget: '+30%'
      },
      expectedImpact: this.estimateImpact(metrics, {
        revenueChange: 0.40,
        marketShareChange: 0.03,
        costChange: 0.25,
        riskIncrease: 0.2
      })
    });

    // Strategy 6: Balanced approach
    candidates.push({
      name: 'Balanced Growth',
      strategy: 'balanced',
      changes: {
        revenue: '+10%',
        costs: '-5%',
        quality: '+15%',
        retention: '+10%'
      },
      expectedImpact: this.estimateImpact(metrics, {
        revenueChange: 0.10,
        costChange: -0.05,
        qualityChange: 0.15,
        churnChange: -0.02
      })
    });

    return candidates;
  }

  estimateImpact(metrics, changes) {
    const impact = {
      revenue: metrics.revenue * (1 + (changes.revenueChange || 0)),
      costs: metrics.costs * (1 + (changes.costChange || 0)),
      quality: (metrics.quality || 0.8) + (changes.qualityChange || 0),
      churn: Math.max(0, (metrics.churn || 0.05) + (changes.churnChange || 0)),
      nps: (metrics.nps || 50) + (changes.npsChange || 0),
      velocity: (metrics.velocity || 100) * (1 + (changes.velocityChange || 0)),
      incidents: Math.max(0, (metrics.incidents || 5) * (1 + (changes.incidentChange || 0)))
    };

    impact.netMargin = (impact.revenue - impact.costs) / impact.revenue;
    impact.ltv = impact.revenue / (impact.churn || 0.01);
    impact.ltv_cac_ratio = impact.ltv / (metrics.cac || 500);

    return impact;
  }

  filterFeasible(candidates, metrics) {
    return candidates.filter(candidate => {
      const impact = candidate.expectedImpact;

      for (const [, constraint] of this.constraints.entries()) {
        const metricValue = impact[constraint.metricName];

        switch (constraint.operator) {
          case '>=':
            if (metricValue < constraint.value) return false;
            break;
          case '<=':
            if (metricValue > constraint.value) return false;
            break;
          case '==':
            if (Math.abs(metricValue - constraint.value) > 0.01) return false;
            break;
          default:
            break;
        }
      }

      return true;
    });
  }

  scoreSolutions(candidates) {
    return candidates.map(candidate => {
      let score = 0;
      const impact = candidate.expectedImpact;

      for (const objective of this.objectives) {
        const metricValue = impact[objective.metric];
        let objectiveScore = 0;

        if (objective.direction === 'maximize') {
          objectiveScore = Math.min(metricValue / (objective.targetValue || 1000000), 1);
        } else if (objective.direction === 'minimize') {
          objectiveScore = Math.max(1 - metricValue / (objective.targetValue || 1), 0);
        }

        score += objectiveScore * objective.weight;
      }

      return {
        ...candidate,
        score: score / this.objectives.reduce((sum, obj) => sum + obj.weight, 0),
        normalizedScore: (score / this.objectives.reduce((sum, obj) => sum + obj.weight, 0)) * 100
      };
    });
  }

  selectOptimalSolutions(scored) {
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  calculateParetoFrontier(scored) {
    const frontier = [];

    for (const solution of scored) {
      let dominated = false;

      for (const other of frontier) {
        // Check if solution is dominated by other
        let otherBetter = false;
        let somethingBetter = false;

        if (other.expectedImpact.revenue > solution.expectedImpact.revenue) somethingBetter = true;
        if (other.expectedImpact.costs < solution.expectedImpact.costs) somethingBetter = true;
        if (other.expectedImpact.quality > solution.expectedImpact.quality) somethingBetter = true;

        if (somethingBetter) {
          // Check if other is better across all dimensions
          otherBetter = other.expectedImpact.revenue >= solution.expectedImpact.revenue &&
                       other.expectedImpact.costs <= solution.expectedImpact.costs &&
                       other.expectedImpact.quality >= solution.expectedImpact.quality;

          if (otherBetter) {
            dominated = true;
            break;
          }
        }
      }

      if (!dominated) {
        frontier.push(solution);
      }
    }

    return frontier;
  }

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================

  generateRecommendations(optimalSolutions, currentMetrics) {
    if (optimalSolutions.length === 0) {
      return [{
        priority: 'high',
        type: 'constraints',
        description: 'Current constraints are too restrictive. Relax one or more constraints to find feasible solutions.',
        action: 'Review and adjust constraints'
      }];
    }

    const recommendations = [];
    const bestSolution = optimalSolutions[0];

    // Primary recommendation
    recommendations.push({
      priority: 'high',
      type: 'primary',
      strategy: bestSolution.strategy,
      description: bestSolution.name,
      expectedOutcome: bestSolution.expectedImpact,
      confidence: Math.round(bestSolution.score * 100),
      timeframe: this.estimateTimeframe(bestSolution),
      riskLevel: this.assessRisk(bestSolution, currentMetrics),
      nextSteps: this.generateNextSteps(bestSolution)
    });

    // Alternative recommendation
    if (optimalSolutions.length > 1) {
      const alternative = optimalSolutions[1];
      recommendations.push({
        priority: 'medium',
        type: 'alternative',
        strategy: alternative.strategy,
        description: alternative.name,
        expectedOutcome: alternative.expectedImpact,
        confidence: Math.round(alternative.score * 100),
        rationale: 'Consider if primary strategy faces execution challenges',
        riskLevel: this.assessRisk(alternative, currentMetrics)
      });
    }

    // Quick wins
    const quickWins = this.identifyQuickWins(currentMetrics);
    if (quickWins.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'quick_wins',
        description: 'Quick wins available with minimal investment',
        items: quickWins
      });
    }

    // Risk mitigation
    const risks = this.identifyRisks(currentMetrics);
    if (risks.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'risk_mitigation',
        description: 'Critical risks requiring immediate attention',
        items: risks
      });
    }

    return recommendations;
  }

  estimateTimeframe(solution) {
    const changeIntensity = Object.values(solution.changes).filter(v => typeof v === 'string').length;
    const weeks = 2 + changeIntensity * 2;

    return {
      weeks,
      months: Math.ceil(weeks / 4),
      phases: Math.max(1, Math.ceil(changeIntensity / 3))
    };
  }

  assessRisk(solution, metrics) {
    const impact = solution.expectedImpact;
    let riskScore = 0;

    // Revenue decrease risk
    if (impact.revenue < metrics.revenue * 0.95) riskScore += 0.2;

    // Margin compression risk
    if (impact.netMargin < (metrics.netMargin || 0.4) * 0.90) riskScore += 0.2;

    // Quality degradation risk
    if (impact.incidents > (metrics.incidents || 5) * 1.2) riskScore += 0.2;

    // Implementation risk
    const changeCount = Object.keys(solution.changes).length;
    riskScore += Math.min(changeCount * 0.1, 0.3);

    if (riskScore < 0.2) return 'low';
    if (riskScore < 0.4) return 'medium';
    return 'high';
  }

  generateNextSteps(solution) {
    const steps = [];

    for (const [key, value] of Object.entries(solution.changes)) {
      steps.push({
        phase: Math.floor(steps.length / 3) + 1,
        action: `${key}: ${value}`,
        estimatedDays: 3 + Math.floor(Math.random() * 10),
        dependencies: []
      });
    }

    return steps.slice(0, 5); // Top 5 steps
  }

  // ============================================================================
  // QUICK WINS & RISKS
  // ============================================================================

  identifyQuickWins(metrics) {
    const wins = [];

    // Win 1: Process automation
    if (metrics.manualProcesses > 20) {
      wins.push({
        initiative: 'Automate manual processes',
        effort: 'low',
        impact: 'high',
        timeline: '2-4 weeks',
        expectedBenefit: 'Save 10+ hours/week per team member',
        roiMonths: 1
      });
    }

    // Win 2: Improve pricing realization
    if (metrics.discountRate > 0.15) {
      wins.push({
        initiative: 'Reduce discounting through value pricing',
        effort: 'low',
        impact: 'high',
        timeline: '1-2 weeks',
        expectedBenefit: '+$20K-50K MRR',
        roiMonths: 0.5
      });
    }

    // Win 3: Reduce support tickets
    if (metrics.supportTickets > 1000) {
      wins.push({
        initiative: 'Implement self-service knowledge base',
        effort: 'medium',
        impact: 'high',
        timeline: '3-6 weeks',
        expectedBenefit: 'Reduce tickets by 20%',
        roiMonths: 2
      });
    }

    // Win 4: Optimize cloud costs
    if (metrics.cloudSpend > 10000) {
      wins.push({
        initiative: 'Optimize cloud infrastructure',
        effort: 'low',
        impact: 'medium',
        timeline: '1-2 weeks',
        expectedBenefit: '-$2K-5K monthly costs',
        roiMonths: 0.5
      });
    }

    return wins.slice(0, 3);
  }

  identifyRisks(metrics) {
    const risks = [];

    // Risk 1: Churn spike
    if (metrics.churn > 0.07) {
      risks.push({
        risk: 'High customer churn',
        impact: 'high',
        probability: 'high',
        description: `Churn rate of ${Math.round(metrics.churn * 100)}% is unsustainable`,
        mitigation: 'Launch customer success program and NPS improvement initiative'
      });
    }

    // Risk 2: Cash runway
    if (metrics.burnRate > metrics.runway * 0.15) {
      risks.push({
        risk: 'Runway depletion',
        impact: 'critical',
        probability: 'medium',
        description: 'Burn rate will exhaust runway in less than 12 months',
        mitigation: 'Achieve profitability or secure additional funding'
      });
    }

    // Risk 3: Tech debt
    if (metrics.technicalDebtScore > 60) {
      risks.push({
        risk: 'High technical debt',
        impact: 'high',
        probability: 'high',
        description: 'Technical debt is limiting velocity and increasing incidents',
        mitigation: 'Allocate 30% of engineering time to debt paydown'
      });
    }

    // Risk 4: Team retention
    if (metrics.turnoverRate > 0.15) {
      risks.push({
        risk: 'High team turnover',
        impact: 'high',
        probability: 'high',
        description: 'Turnover rate exceeds industry standard',
        mitigation: 'Conduct stay interviews and implement retention programs'
      });
    }

    return risks;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  getAllOptimizations() {
    return Array.from(this.optimizations.values());
  }

  getOptimization(optimizationId) {
    return this.optimizations.get(optimizationId);
  }

  trackOptimizationResult(optimizationId, actualMetrics) {
    const optimization = this.optimizations.get(optimizationId);
    if (!optimization) return null;

    const variances = {};
    for (const [key, expectedValue] of Object.entries(optimization.expectedImpact)) {
      variances[key] = {
        expected: expectedValue,
        actual: actualMetrics[key],
        variance: ((actualMetrics[key] - expectedValue) / expectedValue) * 100
      };
    }

    return {
      optimizationId,
      variances,
      successRate: Object.values(variances).filter(v => Math.abs(v.variance) < 10).length / Object.keys(variances).length
    };
  }
}

module.exports = GlobalOptimizer;
