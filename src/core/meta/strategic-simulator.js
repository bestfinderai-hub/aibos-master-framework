/**
 * Strategic Simulator
 * "What-if" analysis for business decisions
 */

class StrategicSimulator {
  constructor() {
    this.simulations = new Map(); // simulationId -> simulation
    this.scenarios = new Map(); // scenarioId -> scenario
    this.baselineMetrics = {};
  }

  // ============================================================================
  // BASELINE & SCENARIO SETUP
  // ============================================================================

  setBaseline(metrics) {
    this.baselineMetrics = { ...metrics };
    return {
      timestamp: new Date(),
      metrics: this.baselineMetrics
    };
  }

  getBaseline() {
    return this.baselineMetrics;
  }

  // ============================================================================
  // PRICING SIMULATIONS
  // ============================================================================

  simulatePricingChange(changePercent, currentMRR = 250000, currentChurn = 0.05) {
    const scenarios = [];

    // Best case: minimal churn increase
    scenarios.push({
      name: 'Best Case',
      probability: 0.25,
      churnIncrease: changePercent * 0.05,
      outcome: this.calculatePricingOutcome(currentMRR, changePercent, currentChurn, changePercent * 0.05)
    });

    // Expected case: moderate churn increase
    scenarios.push({
      name: 'Expected Case',
      probability: 0.50,
      churnIncrease: changePercent * 0.15,
      outcome: this.calculatePricingOutcome(currentMRR, changePercent, currentChurn, changePercent * 0.15)
    });

    // Worst case: high churn increase
    scenarios.push({
      name: 'Worst Case',
      probability: 0.25,
      churnIncrease: changePercent * 0.30,
      outcome: this.calculatePricingOutcome(currentMRR, changePercent, currentChurn, changePercent * 0.30)
    });

    const simulation = {
      id: this.generateId('sim'),
      type: 'pricing',
      parameter: `${changePercent > 0 ? '+' : ''}${changePercent}%`,
      scenarios,
      expectedValue: this.calculateExpectedValue(scenarios),
      recommendedAction: this.getPricingRecommendation(scenarios),
      riskFactors: ['customer_churn', 'market_reaction', 'competitive_pressure']
    };

    this.simulations.set(simulation.id, simulation);
    return simulation;
  }

  calculatePricingOutcome(currentMRR, priceChange, currentChurn, additionalChurn) {
    const newChurn = Math.min(currentChurn + additionalChurn, 0.15); // cap at 15%
    const newPrice = currentMRR * (1 + priceChange);
    const customerRetention = 1 - newChurn;
    const projectedMRR = newPrice * customerRetention;

    return {
      projectedMRR,
      mrrChange: projectedMRR - currentMRR,
      mrrChangePercent: ((projectedMRR - currentMRR) / currentMRR) * 100,
      projectedChurn: newChurn,
      customerImpact: customerRetention,
      confidence: 0.7
    };
  }

  getPricingRecommendation(scenarios) {
    const expected = scenarios.find(s => s.name === 'Expected Case');
    if (!expected || expected.outcome.mrrChange > 0) {
      return 'RECOMMEND: Proceed with price increase';
    } else if (expected.outcome.mrrChange > -25000) {
      return 'CONSIDER: Risk is manageable, but monitor churn closely';
    } else {
      return 'DO NOT RECOMMEND: Expected MRR decrease exceeds acceptable threshold';
    }
  }

  // ============================================================================
  // FEATURE LAUNCH SIMULATIONS
  // ============================================================================

  simulateFeatureLaunch(feature) {
    if (!feature.name || !feature.targetSegment || !feature.developmentCost === undefined) {
      throw new Error('Feature must have name, targetSegment, and developmentCost');
    }

    const scenarios = [];

    // Best case: high adoption and revenue impact
    scenarios.push({
      name: 'Best Case',
      probability: 0.20,
      adoptionRate: 0.60,
      outcome: this.calculateFeatureOutcome(feature, 0.60, 0.80)
    });

    // Expected case: moderate adoption
    scenarios.push({
      name: 'Expected Case',
      probability: 0.60,
      adoptionRate: 0.35,
      outcome: this.calculateFeatureOutcome(feature, 0.35, 0.50)
    });

    // Worst case: low adoption
    scenarios.push({
      name: 'Worst Case',
      probability: 0.20,
      adoptionRate: 0.10,
      outcome: this.calculateFeatureOutcome(feature, 0.10, 0.20)
    });

    const simulation = {
      id: this.generateId('sim'),
      type: 'feature_launch',
      featureName: feature.name,
      targetSegment: feature.targetSegment,
      scenarios,
      expectedValue: this.calculateExpectedValue(scenarios),
      roi: this.calculateFeatureROI(scenarios, feature.developmentCost),
      breakEvenMonths: this.calculateBreakEven(scenarios, feature.developmentCost),
      marketPosition: this.assessMarketPosition(feature)
    };

    this.simulations.set(simulation.id, simulation);
    return simulation;
  }

  calculateFeatureOutcome(feature, adoptionRate, satisfactionRate) {
    const segmentSize = feature.segmentSize || 100; // default 100 customers
    const adoptingCustomers = Math.round(segmentSize * adoptionRate);
    const monthlyArpu = feature.estimatedARPU || 100;
    const monthlyRevenue = adoptingCustomers * monthlyArpu;
    const annualRevenue = monthlyRevenue * 12;

    return {
      adoptingCustomers,
      adoptionRate,
      satisfactionRate,
      monthlyRevenue,
      annualRevenue,
      grossMargin: annualRevenue * 0.70, // assume 70% margin
      paybackMonths: feature.developmentCost / (monthlyRevenue || 1),
      confidence: 0.65
    };
  }

  calculateFeatureROI(scenarios, developmentCost) {
    const expected = scenarios.find(s => s.name === 'Expected Case');
    const annualRevenue = expected.outcome.annualRevenue;
    const roi = ((annualRevenue - developmentCost) / developmentCost) * 100;

    return {
      yearOneROI: roi,
      paybackPeriod: developmentCost / (annualRevenue / 12),
      threYearValue: annualRevenue * 3 - developmentCost,
      recommendBuild: roi > 100
    };
  }

  calculateBreakEven(scenarios, developmentCost) {
    const expected = scenarios.find(s => s.name === 'Expected Case');
    const monthlyRevenue = expected.outcome.monthlyRevenue;

    return monthlyRevenue > 0 ? Math.ceil(developmentCost / monthlyRevenue) : null;
  }

  assessMarketPosition(feature) {
    return {
      competitiveAdvantage: feature.competitive ? 'high' : 'medium',
      marketSize: feature.marketSize || 'medium',
      timeToMarket: feature.complexity === 'high' ? 6 : feature.complexity === 'medium' ? 3 : 1,
      defensibility: feature.defensibility || 'medium'
    };
  }

  // ============================================================================
  // HIRING SIMULATIONS
  // ============================================================================

  simulateHiring(hires) {
    if (!Array.isArray(hires) || hires.length === 0) {
      throw new Error('Must provide array of hiring scenarios');
    }

    const scenarios = [];

    // Best case: high utilization and productivity
    scenarios.push({
      name: 'Best Case',
      probability: 0.25,
      productivity: 1.2,
      outcome: this.calculateHiringOutcome(hires, 1.2, 0.95)
    });

    // Expected case: normal productivity
    scenarios.push({
      name: 'Expected Case',
      probability: 0.50,
      productivity: 1.0,
      outcome: this.calculateHiringOutcome(hires, 1.0, 0.85)
    });

    // Worst case: onboarding delays and turnover
    scenarios.push({
      name: 'Worst Case',
      probability: 0.25,
      productivity: 0.7,
      outcome: this.calculateHiringOutcome(hires, 0.7, 0.70)
    });

    const simulation = {
      id: this.generateId('sim'),
      type: 'hiring',
      headcount: hires.length,
      totalAnnualCost: hires.reduce((sum, h) => sum + (h.salary || 0), 0),
      scenarios,
      expectedValue: this.calculateExpectedValue(scenarios),
      velocityImpact: this.calculateVelocityImpact(hires),
      payoffMonths: this.calculateHiringPayoff(hires)
    };

    this.simulations.set(simulation.id, simulation);
    return simulation;
  }

  calculateHiringOutcome(hires, productivityMultiplier, retentionRate) {
    const totalAnnualCost = hires.reduce((sum, h) => sum + (h.salary || 120000), 0);
    const baseBenefits = hires.length * 120000; // assume $120k value per person
    const actualBenefits = baseBenefits * productivityMultiplier;
    const expectedRetention = hires.length * retentionRate;
    const costOfTurnover = hires.length * (1 - retentionRate) * 50000; // $50k replacement cost

    return {
      totalAnnualCost,
      projectedBenefits: actualBenefits,
      netBenefit: actualBenefits - totalAnnualCost - costOfTurnover,
      retentionRate,
      expectedRetention,
      costOfTurnover,
      payoffMonths: totalAnnualCost / (actualBenefits / 12)
    };
  }

  calculateVelocityImpact(hires) {
    const seniorCount = hires.filter(h => h.level === 'senior').length;
    const juniorCount = hires.filter(h => h.level === 'junior').length;

    // Velocity gain: seniors immediately productive, juniors need ramp
    const immediateGain = seniorCount * 1.2; // 20% productivity boost per senior
    const sixMonthGain = (seniorCount * 1.2 + juniorCount * 0.8); // juniors at 80% by 6 months
    const twelveMonthGain = hires.length; // everyone fully productive by 12 months

    return {
      immediate: immediateGain,
      sixMonths: sixMonthGain,
      twelveMonths: twelveMonthGain,
      onboardingOverhead: juniorCount * 0.2 // 20% overhead per junior
    };
  }

  calculateHiringPayoff(hires) {
    const scenario = hires.reduce((sum, h) => sum + (h.salary || 120000), 0);
    const benefitPerPerson = 120000;
    const totalBenefit = hires.length * benefitPerPerson;

    return Math.ceil(scenario / (totalBenefit / 12));
  }

  // ============================================================================
  // TECH DEBT SIMULATIONS
  // ============================================================================

  simulateTechDebtInvestment(investment) {
    if (!investment.currentDebt || !investment.investmentAmount === undefined) {
      throw new Error('Must provide currentDebt and investmentAmount');
    }

    const scenarios = [];

    scenarios.push({
      name: 'Aggressive Paydown',
      probability: 0.35,
      debtReduction: 0.60,
      outcome: this.calculateDebtOutcome(investment, 0.60, 1.3)
    });

    scenarios.push({
      name: 'Balanced Approach',
      probability: 0.50,
      debtReduction: 0.40,
      outcome: this.calculateDebtOutcome(investment, 0.40, 1.1)
    });

    scenarios.push({
      name: 'Conservative',
      probability: 0.15,
      debtReduction: 0.20,
      outcome: this.calculateDebtOutcome(investment, 0.20, 1.0)
    });

    const simulation = {
      id: this.generateId('sim'),
      type: 'tech_debt',
      currentDebt: investment.currentDebt,
      investmentAmount: investment.investmentAmount,
      scenarios,
      expectedValue: this.calculateExpectedValue(scenarios),
      velocityGain: this.calculateVelocityGainFromDebtPaydown(investment),
      riskReduction: this.calculateRiskReduction(investment)
    };

    this.simulations.set(simulation.id, simulation);
    return simulation;
  }

  calculateDebtOutcome(investment, debtReductionPercent, velocityGain) {
    const debtRemaining = investment.currentDebt * (1 - debtReductionPercent);
    const timeToPayoff = debtRemaining / (debtRemaining / 12); // assume 12 months to further payoff
    const monthlyVelocityGain = (velocityGain - 1) * 10; // 10-30% monthly velocity gain
    const annualProductivityGain = monthlyVelocityGain * 12 * 50000; // assume $50k/person velocity value

    return {
      debtRemaining,
      debtReductionPercent,
      timeToPayoff,
      velocityGain,
      annualProductivityGain,
      incidentRateReduction: debtReductionPercent * 0.5, // 50% reduction per debt point
      confidence: 0.75
    };
  }

  calculateVelocityGainFromDebtPaydown(investment) {
    const currentVelocity = investment.currentVelocity || 100;
    const debtImpact = (investment.currentDebt / 1000) * 10; // rough estimate
    const baselineVelocity = currentVelocity + debtImpact;
    const afterPaydown = baselineVelocity * 1.3; // 30% improvement
    const improvement = afterPaydown - currentVelocity;

    return {
      currentVelocity,
      afterPaydown,
      improvement,
      improvementPercent: (improvement / currentVelocity) * 100
    };
  }

  calculateRiskReduction(investment) {
    const currentIncidents = investment.currentIncidents || 5;
    const incidentCost = investment.incidentCost || 10000;
    const projectedIncidents = currentIncidents * 0.4; // 60% reduction
    const savedCosts = (currentIncidents - projectedIncidents) * incidentCost;

    return {
      currentIncidents,
      projectedIncidents,
      incidentReduction: currentIncidents - projectedIncidents,
      annualSavings: savedCosts,
      payoffFromRiskReduction: investment.investmentAmount / (savedCosts / 12)
    };
  }

  // ============================================================================
  // MARKET ENTRY SIMULATIONS
  // ============================================================================

  simulateMarketEntry(market) {
    if (!market.name || !market.tam === undefined || !market.entryInvestment === undefined) {
      throw new Error('Must provide market name, TAM, and entryInvestment');
    }

    const scenarios = [];

    scenarios.push({
      name: 'Successful Entry',
      probability: 0.30,
      marketShare: 0.05,
      outcome: this.calculateMarketOutcome(market, 0.05, 0.80)
    });

    scenarios.push({
      name: 'Moderate Success',
      probability: 0.50,
      marketShare: 0.02,
      outcome: this.calculateMarketOutcome(market, 0.02, 0.50)
    });

    scenarios.push({
      name: 'Limited Traction',
      probability: 0.20,
      marketShare: 0.005,
      outcome: this.calculateMarketOutcome(market, 0.005, 0.20)
    });

    const simulation = {
      id: this.generateId('sim'),
      type: 'market_entry',
      market: market.name,
      scenarios,
      expectedValue: this.calculateExpectedValue(scenarios),
      competitiveThreat: this.assessCompetitiveThreat(market),
      strategicFit: this.assessStrategicFit(market)
    };

    this.simulations.set(simulation.id, simulation);
    return simulation;
  }

  calculateMarketOutcome(market, marketShare, successRate) {
    const tam = market.tam;
    const addressableMarket = tam * marketShare;
    const projectedRevenue = addressableMarket * 0.3; // 30% conversion
    const annualRevenue = projectedRevenue * successRate;

    return {
      marketShare,
      addressableMarket,
      projectedRevenue,
      annualRevenue,
      paybackMonths: market.entryInvestment / (annualRevenue / 12 || 1),
      successRate,
      confidence: 0.60
    };
  }

  assessCompetitiveThreat(market) {
    return {
      competitorCount: market.competitors || 5,
      marketMaturity: market.maturity || 'growth',
      barrierToEntry: market.barrierToEntry || 'medium',
      defensibility: market.defensibility || 'medium'
    };
  }

  assessStrategicFit(market) {
    return {
      synergyWithCore: market.synergy || 'medium',
      resourceRequirement: market.resourceRequirement || 'medium',
      timeToMarket: market.timeToMarket || 12,
      alignmentWithStrategy: market.alignment || 0.7
    };
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  calculateExpectedValue(scenarios) {
    return scenarios.reduce((sum, scenario) => {
      const outcomeValue = scenario.outcome.projectedMRR ||
                          scenario.outcome.annualRevenue ||
                          scenario.outcome.netBenefit ||
                          scenario.outcome.annualProductivityGain ||
                          scenario.outcome.annualRevenue ||
                          0;
      return sum + (outcomeValue * scenario.probability);
    }, 0);
  }

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getSimulation(simulationId) {
    return this.simulations.get(simulationId);
  }

  getAllSimulations() {
    return Array.from(this.simulations.values());
  }

  compareSimulations(simulationIds) {
    const simulations = simulationIds.map(id => this.simulations.get(id)).filter(Boolean);

    return {
      count: simulations.length,
      simulations,
      comparison: {
        bestCase: simulations.sort((a, b) => this.getBestCaseOutcome(b) - this.getBestCaseOutcome(a))[0],
        expectedValue: simulations.sort((a, b) => b.expectedValue - a.expectedValue)[0],
        leastRisky: simulations.sort((a, b) => this.getDownsideRisk(a) - this.getDownsideRisk(b))[0]
      }
    };
  }

  getBestCaseOutcome(simulation) {
    const bestCase = simulation.scenarios.find(s => s.name === 'Best Case');
    return bestCase?.outcome?.projectedMRR ||
           bestCase?.outcome?.annualRevenue ||
           bestCase?.outcome?.netBenefit ||
           0;
  }

  getDownsideRisk(simulation) {
    const worstCase = simulation.scenarios.find(s => s.name === 'Worst Case');
    return worstCase?.outcome?.projectedMRR ||
           worstCase?.outcome?.annualRevenue ||
           worstCase?.outcome?.netBenefit ||
           0;
  }
}

module.exports = StrategicSimulator;
