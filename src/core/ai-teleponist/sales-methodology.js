/**
 * Sales Methodology Engine
 * Tracks SPIN, BANT, Challenger, MEDDIC
 */

class SalesMethodologyEngine {
  constructor() {
    this.methodologies = {
      bant: this.initBANT(),
      spin: this.initSPIN(),
      challenger: this.initChallenger(),
      meddic: this.initMEDDIC()
    };
  }

  initBANT() {
    return {
      name: 'BANT',
      questions: {
        budget: [],
        authority: [],
        need: [],
        timeline: []
      },
      tracked: false
    };
  }

  initSPIN() {
    return {
      name: 'SPIN',
      questions: {
        situation: [],
        problem: [],
        implication: [],
        needPayoff: []
      },
      tracked: false
    };
  }

  initChallenger() {
    return {
      name: 'Challenger Sale',
      phases: {
        teach: false,
        tailor: false,
        takeControl: false
      },
      tracked: false
    };
  }

  initMEDDIC() {
    return {
      name: 'MEDDIC',
      elements: {
        metrics: false,
        economicBuyer: false,
        decisionCriteria: false,
        decisionProcess: false,
        identifyPain: false,
        champion: false
      },
      tracked: false
    };
  }

  /**
   * Analyze segment for methodology questions
   */
  analyzeForMethodology(segment, methodology = 'bant') {
    const method = this.methodologies[methodology];
    if (!method) throw new Error('Unknown methodology');

    const lower = segment.toLowerCase();

    if (methodology === 'bant') {
      return this.analyzeBAN(lower, method);
    } else if (methodology === 'spin') {
      return this.analyzeSPIN(lower, method);
    }

    return { found: false };
  }

  analyzeBAN(lower, bant) {
    const found = {};

    // Budget questions
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('price')) {
      found.budget = true;
      bant.questions.budget.push('Budget discussed');
    }

    // Authority questions
    if (lower.includes('decision') || lower.includes('approve') || lower.includes('authority')) {
      found.authority = true;
      bant.questions.authority.push('Authority established');
    }

    // Need questions
    if (lower.includes('need') || lower.includes('require') || lower.includes('problem')) {
      found.need = true;
      bant.questions.need.push('Need identified');
    }

    // Timeline
    if (lower.includes('when') || lower.includes('timeline') || lower.includes('quarter')) {
      found.timeline = true;
      bant.questions.timeline.push('Timeline clarified');
    }

    return { found, coverage: this.getBACoverage(bant) };
  }

  analyzeSPIN(lower, spin) {
    const found = {};

    if (lower.includes('situation') || lower.includes('currently')) {
      found.situation = true;
      spin.questions.situation.push('Situation assessed');
    }

    if (lower.includes('problem') || lower.includes('challenge')) {
      found.problem = true;
      spin.questions.problem.push('Problem discovered');
    }

    if (lower.includes('impact') || lower.includes('consequence')) {
      found.implication = true;
      spin.questions.implication.push('Implication explored');
    }

    if (lower.includes('benefit') || lower.includes('value')) {
      found.needPayoff = true;
      spin.questions.needPayoff.push('Need-payoff established');
    }

    return { found };
  }

  getBACoverage(bant) {
    const total = Object.values(bant.questions).reduce((sum, arr) => sum + arr.length, 0);
    const categories = Object.values(bant.questions).filter(arr => arr.length > 0).length;
    return { total, categories, complete: categories === 4 };
  }

  /**
   * Get methodology score
   */
  getMethodologyScore(methodology, coverage) {
    if (methodology === 'bant') {
      const { categories } = coverage;
      return Math.round((categories / 4) * 100);
    }
    return 0;
  }
}

module.exports = SalesMethodologyEngine;
