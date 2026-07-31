/**
 * DEL 8: Company Intelligence Profiles
 * Deep analysis of company: growth, tech stack, competitors, market position
 */

interface CompanyProfile {
  companyName: string;
  domain: string;
  industry: string;
  employees: number;
  revenue?: number;
  funding?: { amount: number; round: string; date: string }[];
  techStack: string[];
  competitors: string[];
  marketPosition: 'leader' | 'challenger' | 'niche' | 'emerging';
  growthMetrics: {
    yearlySalesGrowth: number; // %
    employeeGrowth: number; // %
    fundingMomentum: number; // score 0-100
  };
  signals: CompanySignal[];
}

interface CompanySignal {
  type: 'hiring' | 'funding' | 'product' | 'partnership' | 'expansion' | 'acquisition';
  description: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  relevance: number; // 0-100
}

interface TechStackAnalysis {
  currentStack: string[];
  missingCapabilities: string[];
  modernizationGap: number; // 0-100 (how outdated)
  recommendedTech: string[];
  migrationComplexity: 'low' | 'medium' | 'high';
}

interface CompetitorAnalysis {
  competitor: string;
  marketShare: number; // %
  strengths: string[];
  weaknesses: string[];
  differentiator: string;
  threatLevel: number; // 0-100
}

export class CompanyIntelligence {
  /**
   * Build comprehensive company profile
   */
  buildProfile(data: Partial<CompanyProfile>): CompanyProfile {
    const profile: CompanyProfile = {
      companyName: data.companyName || '',
      domain: data.domain || '',
      industry: data.industry || '',
      employees: data.employees || 0,
      revenue: data.revenue,
      funding: data.funding || [],
      techStack: data.techStack || [],
      competitors: data.competitors || [],
      marketPosition: data.marketPosition || 'niche',
      growthMetrics: {
        yearlySalesGrowth: data.growthMetrics?.yearlySalesGrowth || 0,
        employeeGrowth: data.growthMetrics?.employeeGrowth || 0,
        fundingMomentum: this.calculateFundingMomentum(data.funding || []),
      },
      signals: data.signals || [],
    };

    return profile;
  }

  /**
   * Analyze company's tech stack and modernization needs
   */
  analyzeStackModernization(techStack: string[]): TechStackAnalysis {
    const modernTechs = [
      'React',
      'Vue.js',
      'Next.js',
      'TypeScript',
      'Node.js',
      'Python',
      'PostgreSQL',
      'Kubernetes',
      'AWS',
      'GraphQL',
      'Microservices',
    ];

    const currentModern = techStack.filter(t =>
      modernTechs.some(m => m.toLowerCase().includes(t.toLowerCase()))
    ).length;

    const modernizationGap = Math.round(
      ((techStack.length - currentModern) / Math.max(techStack.length, 1)) * 100
    );

    return {
      currentStack: techStack,
      missingCapabilities: this.identifyGaps(techStack),
      modernizationGap,
      recommendedTech: this.recommendTech(techStack),
      migrationComplexity: modernizationGap > 70 ? 'high' : modernizationGap > 40 ? 'medium' : 'low',
    };
  }

  /**
   * Analyze competitive landscape
   */
  analyzeCompetitors(competitors: string[]): CompetitorAnalysis[] {
    return competitors.map(competitor => ({
      competitor,
      marketShare: Math.random() * 30 + 5, // Mock: 5-35%
      strengths: this.generateStrengths(competitor),
      weaknesses: this.generateWeaknesses(competitor),
      differentiator: `${competitor} differentiates through proprietary ${['AI', 'user experience', 'pricing', 'integrations'][Math.floor(Math.random() * 4)]}`,
      threatLevel: Math.round(Math.random() * 100),
    }));
  }

  /**
   * Score company's overall attractiveness for engagement
   */
  scoreCompanyFit(profile: CompanyProfile): number {
    const scores = {
      size: Math.min(profile.employees / 500, 1) * 25, // Max 25 points
      growth: Math.min(profile.growthMetrics.yearlySalesGrowth / 50, 1) * 25,
      momentum: profile.growthMetrics.fundingMomentum * 0.3, // Max 30 points
      signals: Math.min(profile.signals.length / 5, 1) * 20, // Max 20 points
    };

    return Math.round(scores.size + scores.growth + scores.momentum + scores.signals);
  }

  // Private helpers

  private calculateFundingMomentum(funding: { date: string }[]): number {
    if (!funding.length) return 0;

    const recentFunding = funding.filter(f => {
      const fundDate = new Date(f.date);
      const daysSince = (Date.now() - fundDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince < 365;
    });

    return Math.min(recentFunding.length * 25, 100);
  }

  private identifyGaps(techStack: string[]): string[] {
    const essentials = ['API', 'Database', 'Frontend', 'Monitoring', 'Security'];
    const covered = techStack.map(t => t.toLowerCase());

    return essentials.filter(e => !covered.some(c => c.includes(e.toLowerCase())));
  }

  private recommendTech(techStack: string[]): string[] {
    const recommendations: string[] = [];

    if (!techStack.some(t => t.toLowerCase().includes('typescript'))) {
      recommendations.push('TypeScript');
    }
    if (!techStack.some(t => t.toLowerCase().includes('kubernetes'))) {
      recommendations.push('Kubernetes');
    }
    if (!techStack.some(t => t.toLowerCase().includes('graphql'))) {
      recommendations.push('GraphQL');
    }

    return recommendations;
  }

  private generateStrengths(competitor: string): string[] {
    const options = [
      'Market presence',
      'Brand recognition',
      'Enterprise support',
      'Feature completeness',
      'Integration ecosystem',
      'Pricing model',
    ];
    return options.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private generateWeaknesses(competitor: string): string[] {
    const options = [
      'Complex onboarding',
      'High cost of ownership',
      'Limited customization',
      'Legacy codebase',
      'Poor documentation',
      'Slow innovation',
    ];
    return options.slice(0, Math.floor(Math.random() * 3) + 2);
  }
}
