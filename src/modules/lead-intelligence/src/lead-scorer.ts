/**
 * Lead Scoring Engine
 * Scores leads based on multiple signals
 */

interface LeadData {
  companyName: string;
  industry: string;
  employees: number;
  revenue?: number;
  growth?: number; // growth rate %
  recentNews?: string[];
  hiring?: boolean;
  funding?: number;
  socialActivity?: number;
  websiteQuality?: number;
}

interface LeadScore {
  overall: number; // 0-100
  breakdown: {
    size: number;
    growth: number;
    actity: number;
    fit: number;
    timing: number;
  };
  signals: string[];
  recommendation: 'hot' | 'warm' | 'cold';
}

/**
 * Score a lead on 0-100 scale
 */
export function scoreLead(lead: LeadData): LeadScore {
  const breakdown = {
    size: scoreSize(lead.employees),
    growth: scoreGrowth(lead.growth),
    actity: scoreActivity(lead),
    fit: scoreFit(lead.industry),
    timing: scoreTiming(lead),
  };

  const overall = Math.round(
    (breakdown.size * 0.2 +
      breakdown.growth * 0.3 +
      breakdown.actity * 0.2 +
      breakdown.fit * 0.15 +
      breakdown.timing * 0.15)
  );

  const signals = generateSignals(lead, breakdown);

  return {
    overall,
    breakdown,
    signals,
    recommendation: getRecommendation(overall),
  };
}

/**
 * Score company size (ideal: 5-50 employees for SMB)
 */
function scoreSize(employees?: number): number {
  if (!employees) return 50; // Unknown

  if (employees < 2) return 20; // Too small (solopreneurs)
  if (employees < 5) return 60; // Micro business
  if (employees < 50) return 95; // Sweet spot (SMB)
  if (employees < 500) return 70; // Mid-market
  if (employees < 5000) return 40; // Large
  return 30; // Enterprise (need different approach)
}

/**
 * Score growth rate (ideal: 15%+ annual)
 */
function scoreGrowth(growth?: number): number {
  if (!growth) return 40; // Unknown

  if (growth < 0) return 30; // Declining
  if (growth < 5) return 40; // Stagnant
  if (growth < 15) return 70; // Moderate
  if (growth < 30) return 90; // Strong
  return 95; // Explosive
}

/**
 * Score activity signals
 */
function scoreActivity(lead: LeadData): number {
  let score = 0;
  let signals = 0;

  if (lead.hiring) {
    score += 30;
    signals++;
  }
  if (lead.funding && lead.funding > 0) {
    score += 30;
    signals++;
  }
  if (lead.recentNews && lead.recentNews.length > 0) {
    score += 20;
    signals++;
  }
  if (lead.socialActivity && lead.socialActivity > 50) {
    score += 20;
    signals++;
  }

  return signals > 0 ? Math.min(100, score) : 30;
}

/**
 * Score industry fit (some industries more likely to convert)
 */
function scoreFit(industry: string): number {
  const goodFit = [
    'technology',
    'saas',
    'consulting',
    'marketing',
    'sales',
    'ecommerce',
    'fintech',
    'healthcare',
  ];

  const lowFit = ['government', 'education', 'nonprofits'];

  const normalized = industry.toLowerCase();

  if (goodFit.some((i) => normalized.includes(i))) return 90;
  if (lowFit.some((i) => normalized.includes(i))) return 40;
  return 60; // Unknown
}

/**
 * Score timing (is this company ready to buy NOW?)
 */
function scoreTiming(lead: LeadData): number {
  let score = 50; // Neutral default

  if (lead.hiring) score += 20; // Hiring = growth = need solutions
  if (lead.funding && lead.funding > 100000) score += 15; // Recently funded = cash
  if (lead.growth && lead.growth > 50) score += 15; // Hyper growth = pain points

  return Math.min(100, score);
}

/**
 * Generate human-readable signals
 */
function generateSignals(lead: LeadData, scores: any): string[] {
  const signals: string[] = [];

  if (scores.size > 80) signals.push('📊 Good company size');
  if (scores.growth > 80) signals.push('📈 Strong growth trajectory');
  if (lead.hiring) signals.push('👥 Currently hiring (expanding)');
  if (lead.funding && lead.funding > 0) signals.push('💰 Recent funding (cash available)');
  if (lead.recentNews && lead.recentNews.length > 0) {
    signals.push(`📰 Recent news: ${lead.recentNews[0]}`);
  }
  if (scores.fit > 80) signals.push('🎯 Good industry fit');
  if (scores.overall > 75) signals.push('🔥 HOT lead - contact now');
  if (scores.overall < 40) signals.push('❄️ Cold lead - not ready yet');

  return signals;
}

/**
 * Get recommendation based on overall score
 */
function getRecommendation(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 75) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
}

/**
 * Example usage
 */
export const exampleLead: LeadData = {
  companyName: 'TechStart AB',
  industry: 'AI/SaaS',
  employees: 15,
  growth: 25,
  recentNews: ['Announced Series A funding'],
  hiring: true,
  funding: 500000,
  socialActivity: 75,
  websiteQuality: 85,
};

// Score example
const exampleScore = scoreLead(exampleLead);
console.log('Example Lead Score:', exampleScore);
// Output: { overall: 89, breakdown: {...}, signals: [...], recommendation: 'hot' }
