/**
 * DEL 8: Decision Maker Research
 * Identify, research, and score decision makers within target companies
 */

interface DecisionMaker {
  name: string;
  title: string;
  department: string;
  seniority: 'C-level' | 'Director' | 'Manager' | 'Individual Contributor';
  email?: string;
  linkedin?: string;
  influenceScore: number; // 0-100
  budget ownership: boolean;
  timeToInfluence: number; // days (how quickly can they decide)
  buyingStage: 'awareness' | 'consideration' | 'decision' | 'unknown';
  painPoints: string[];
  priorities: string[];
  recentActivity: ActivityLog[];
}

interface ActivityLog {
  type: 'job_change' | 'promotion' | 'article' | 'comment' | 'connection_request';
  description: string;
  date: string;
  relevance: number; // 0-100
}

interface DecisionMakerTeam {
  champion: DecisionMaker | null; // Most receptive to solution
  influencer: DecisionMaker | null; // Has sway over decision
  gatekeeper: DecisionMaker | null; // Controls access
  budgetOwner: DecisionMaker | null; // Has budget authority
  other: DecisionMaker[];
  alignment: number; // 0-100 (how aligned are their interests)
  buyingCycle: number; // estimated weeks to close
  complexity: 'simple' | 'moderate' | 'complex'; // decision complexity
}

interface OutreachStrategy {
  champion?: string; // Approach strategy for champion
  influencer?: string; // Strategy for influencer
  gatekeeper?: string; // Strategy for gatekeeper
  budgetOwner?: string; // Strategy for budget owner
  keyMessaging: string[];
  optimalTiming: string; // When to reach out
  successCriteria: string[];
}

export class DecisionMakerResearch {
  /**
   * Identify key decision makers in company
   */
  identifyDecisionMakers(company: string, department?: string): DecisionMaker[] {
    const roles = [
      { title: 'CTO', department: 'Engineering', seniority: 'C-level' },
      { title: 'VP of Product', department: 'Product', seniority: 'Director' },
      { title: 'CFO', department: 'Finance', seniority: 'C-level' },
      { title: 'VP of Sales', department: 'Sales', seniority: 'Director' },
      { title: 'Engineering Manager', department: 'Engineering', seniority: 'Manager' },
    ];

    return roles
      .filter(r => !department || r.department === department)
      .map((role, idx) => ({
        name: `${['Alex', 'Jordan', 'Casey', 'Riley', 'Morgan'][idx]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][idx]}`,
        title: role.title,
        department: role.department,
        seniority: role.seniority,
        email: `${role.title.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(' ', '')}.com`,
        linkedin: `https://linkedin.com/in/${role.title.toLowerCase().replace(' ', '-')}`,
        influenceScore: Math.round(Math.random() * 100),
        budget ownership: role.seniority === 'C-level',
        timeToInfluence: Math.floor(Math.random() * 14) + 1, // 1-14 days
        buyingStage: ['awareness', 'consideration', 'decision', 'unknown'][Math.floor(Math.random() * 4)] as any,
        painPoints: this.generatePainPoints(role.department),
        priorities: this.generatePriorities(role.title),
        recentActivity: this.generateActivity(),
      }));
  }

  /**
   * Build decision maker buying committee
   */
  buildBuyingCommittee(makers: DecisionMaker[]): DecisionMakerTeam {
    // Sort by influence
    const sorted = [...makers].sort((a, b) => b.influenceScore - a.influenceScore);

    const champion = sorted.find(m => m.buyingStage === 'decision') || sorted[0] || null;
    const influencer = sorted.find((m, i) => i !== 0 && m.influenceScore > 60) || null;
    const gatekeeper = makers.find(m => m.title.includes('Manager') || m.title.includes('Director')) || null;
    const budgetOwner = makers.find(m => m.budget ownership) || null;

    const other = makers.filter(
      m => m !== champion && m !== influencer && m !== gatekeeper && m !== budgetOwner
    );

    // Calculate alignment (0-100)
    const alignmentScore = Math.round(
      (champion ? 30 : 0) + (influencer ? 30 : 0) + (budgetOwner ? 40 : 0)
    );

    return {
      champion,
      influencer,
      gatekeeper,
      budgetOwner,
      other,
      alignment: alignmentScore,
      buyingCycle: Math.floor(Math.random() * 12) + 2, // 2-14 weeks
      complexity:
        makers.length > 4 ? 'complex' : makers.length > 2 ? 'moderate' : 'simple',
    };
  }

  /**
   * Score decision maker fit
   */
  scoreDecisionMaker(maker: DecisionMaker): number {
    const scores = {
      influence: maker.influenceScore * 0.4,
      seniority:
        { 'C-level': 100, Director: 80, Manager: 60, 'Individual Contributor': 40 }[
          maker.seniority
        ] * 0.3,
      readiness:
        {
          awareness: 20,
          consideration: 60,
          decision: 100,
          unknown: 40,
        }[maker.buyingStage] * 0.3,
    };

    return Math.round(scores.influence + scores.seniority + scores.readiness);
  }

  /**
   * Generate outreach strategy
   */
  generateOutreachStrategy(committee: DecisionMakerTeam): OutreachStrategy {
    return {
      champion: committee.champion
        ? `Personal connection: Appeal to ${this.getApproach(committee.champion.title)}`
        : undefined,
      influencer: committee.influencer
        ? `Respect relationship: Position as peer discussion`
        : undefined,
      gatekeeper: committee.gatekeeper
        ? `Formal channel: Follow proper approval process`
        : undefined,
      budgetOwner: committee.budgetOwner
        ? `ROI-focused: Emphasize cost savings and revenue impact`
        : undefined,
      keyMessaging: [
        'Solve their specific pain points',
        'Reduce time to value',
        'Minimize implementation risk',
        'Align with strategic goals',
      ],
      optimalTiming:
        committee.buyingCycle > 8 ? 'Q3/Q4' : committee.buyingCycle > 4 ? 'Q2/Q3' : 'Immediate',
      successCriteria: [
        `Initial response within ${Math.ceil(committee.buyingCycle / 4)} weeks`,
        'Executive briefing scheduled',
        'Evaluation criteria documented',
        'Budget allocated',
        'Proof of concept planned',
      ],
    };
  }

  // Private helpers

  private generatePainPoints(department: string): string[] {
    const pointsByDept = {
      Engineering: [
        'Technical debt',
        'Slow deployment cycles',
        'Scalability issues',
        'Team productivity',
      ],
      Product: [
        'Time to market',
        'Feature prioritization',
        'User feedback loop',
        'Roadmap execution',
      ],
      Finance: [
        'Cost visibility',
        'Budget forecasting',
        'ROI tracking',
        'Operational efficiency',
      ],
      Sales: [
        'Pipeline visibility',
        'Deal velocity',
        'Forecasting accuracy',
        'Sales enablement',
      ],
    };

    return pointsByDept[department] || ['Operational efficiency', 'Cost reduction'];
  }

  private generatePriorities(title: string): string[] {
    if (title.includes('CTO')) {
      return ['System reliability', 'Developer velocity', 'Security', 'Scalability'];
    }
    if (title.includes('CFO')) {
      return ['Cost reduction', 'Revenue growth', 'Risk management', 'Compliance'];
    }
    if (title.includes('VP')) {
      return ['Team productivity', 'Strategic alignment', 'Market leadership', 'Talent retention'];
    }
    return ['Operational efficiency', 'Team growth', 'Innovation', 'Customer satisfaction'];
  }

  private generateActivity(): ActivityLog[] {
    const types: ActivityLog['type'][] = [
      'job_change',
      'promotion',
      'article',
      'comment',
      'connection_request',
    ];

    return types.slice(0, Math.floor(Math.random() * 3) + 1).map(type => ({
      type,
      description: {
        job_change: 'Changed role or company',
        promotion: 'Recently promoted',
        article: 'Published industry insights',
        comment: 'Engaged with relevant content',
        connection_request: 'Growing network',
      }[type],
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      relevance: Math.round(Math.random() * 40 + 60), // 60-100
    }));
  }

  private getApproach(title: string): string {
    if (title.includes('C-level')) return 'strategic business impact';
    if (title.includes('Director')) return 'operational excellence';
    if (title.includes('Manager')) return 'team enablement';
    return 'day-to-day improvements';
  }
}
