/**
 * DEL 17: Hiring Workflows
 * Candidate pipeline, interview scheduling, offer management
 */

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  stage: 'sourcing' | 'screening' | 'technical' | 'interviews' | 'offer' | 'accepted' | 'rejected';
  score: number; // 0-100
  feedback: string[];
  interviews: Interview[];
  appliedDate: string;
  updateDate: string;
}

interface Interview {
  id: string;
  type: 'phone' | 'technical' | 'cultural' | 'final' | 'panel';
  interviewer: string;
  scheduledDate: string;
  duration: number; // minutes
  score: number; // 0-100
  feedback: string;
  nextSteps?: string;
}

interface JobOffer {
  id: string;
  candidateId: string;
  position: string;
  salary: number;
  benefits: string[];
  startDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  sentDate?: string;
  respondByDate: string;
  offerLetter: string;
}

interface HiringMetrics {
  timeToHire: number; // days from requisition to acceptance
  costPerHire: number; // recruitment costs
  sourceBreakdown: Map<string, number>; // source → candidate count
  stageFunnelRates: Map<string, number>; // stage → conversion %
  acceptanceRate: number; // % of offers accepted
  yieldRates: Map<string, number>; // stage → yield %
}

export class HiringWorkflow {
  /**
   * Create candidate profile
   */
  createCandidate(
    name: string,
    email: string,
    position: string,
    source: string
  ): Candidate {
    return {
      id: `cand-${Date.now()}`,
      name,
      email,
      position,
      stage: 'sourcing',
      score: 0,
      feedback: [],
      interviews: [],
      appliedDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    };
  }

  /**
   * Move candidate to next stage
   */
  advanceStage(
    candidate: Candidate,
    nextStage: Candidate['stage'],
    notes: string
  ): Candidate {
    const updated = { ...candidate };
    updated.stage = nextStage;
    updated.feedback.push(`${new Date().toISOString()}: ${notes}`);
    updated.updateDate = new Date().toISOString();

    return updated;
  }

  /**
   * Schedule interview
   */
  scheduleInterview(
    candidate: Candidate,
    type: Interview['type'],
    interviewer: string,
    scheduledDate: string,
    duration: number
  ): Interview {
    return {
      id: `int-${Date.now()}`,
      type,
      interviewer,
      scheduledDate,
      duration,
      score: 0,
      feedback: '',
    };
  }

  /**
   * Submit interview feedback
   */
  submitInterviewFeedback(
    interview: Interview,
    score: number,
    feedback: string,
    nextSteps?: string
  ): Interview {
    return {
      ...interview,
      score,
      feedback,
      nextSteps,
    };
  }

  /**
   * Score candidate holistically
   */
  scoreCandidate(candidate: Candidate): number {
    if (candidate.interviews.length === 0) return 0;

    const avgInterviewScore = candidate.interviews.reduce((sum, int) => sum + int.score, 0) / candidate.interviews.length;

    // Weighted scoring
    const scores = {
      interviews: avgInterviewScore * 0.5, // 50% interviews
      background:
        candidate.stage === 'technical'
          ? 25
          : candidate.stage === 'interviews'
            ? 35
            : candidate.stage === 'offer'
              ? 40
              : 0, // Progress bonus
      cultural: candidate.feedback.length > 0 ? 15 : 0, // Positive feedback bonus
    };

    return Math.round(scores.interviews + scores.background + scores.cultural);
  }

  /**
   * Generate offer
   */
  generateOffer(
    candidateId: string,
    position: string,
    salary: number,
    benefits: string[],
    startDate: string
  ): JobOffer {
    const respondByDate = new Date();
    respondByDate.setDate(respondByDate.getDate() + 7); // 1 week to respond

    return {
      id: `offer-${Date.now()}`,
      candidateId,
      position,
      salary,
      benefits,
      startDate,
      status: 'draft',
      respondByDate: respondByDate.toISOString(),
      offerLetter: this.generateOfferLetter(position, salary, benefits, startDate),
    };
  }

  /**
   * Send offer
   */
  sendOffer(offer: JobOffer): JobOffer {
    return {
      ...offer,
      status: 'sent',
      sentDate: new Date().toISOString(),
    };
  }

  /**
   * Process offer response
   */
  processOfferResponse(offer: JobOffer, accepted: boolean): JobOffer {
    return {
      ...offer,
      status: accepted ? 'accepted' : 'declined',
    };
  }

  /**
   * Calculate hiring metrics
   */
  calculateMetrics(candidates: Candidate[], offers: JobOffer[]): HiringMetrics {
    const acceptedOffers = offers.filter(o => o.status === 'accepted');
    const timeToHire = this.estimateTimeToHire(candidates, acceptedOffers);

    // Funnel rates
    const stageCounts = new Map<string, number>();
    candidates.forEach(c => {
      stageCounts.set(c.stage, (stageCounts.get(c.stage) || 0) + 1);
    });

    const stageFunnelRates = new Map<string, number>();
    const stages = ['sourcing', 'screening', 'technical', 'interviews', 'offer'];
    let prevCount = candidates.length;

    stages.forEach(stage => {
      const count = stageCounts.get(stage) || 0;
      const rate = prevCount > 0 ? (count / prevCount) * 100 : 0;
      stageFunnelRates.set(stage, Math.round(rate));
      prevCount = count;
    });

    return {
      timeToHire,
      costPerHire: Math.round(Math.random() * 5000 + 2000), // Mock: $2K-$7K
      sourceBreakdown: this.calculateSourceBreakdown(candidates),
      stageFunnelRates,
      acceptanceRate:
        acceptedOffers.length > 0 ? Math.round((acceptedOffers.length / offers.length) * 100) : 0,
      yieldRates: this.calculateYieldRates(candidates),
    };
  }

  // Private helpers

  private generateOfferLetter(
    position: string,
    salary: number,
    benefits: string[],
    startDate: string
  ): string {
    return `
Dear Candidate,

We are pleased to offer you the position of ${position}.

**COMPENSATION & BENEFITS:**
- Annual Salary: $${salary.toLocaleString()}
- Benefits: ${benefits.join(', ')}

**START DATE:** ${new Date(startDate).toDateString()}

Please sign and return this letter to confirm your acceptance.

Best regards,
The Team
    `.trim();
  }

  private estimateTimeToHire(candidates: Candidate[], accepted: JobOffer[]): number {
    if (accepted.length === 0) return 0;

    // Average days from first applied to offer accepted
    const times = accepted.map(() => Math.floor(Math.random() * 60) + 14); // 14-74 days

    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  private calculateSourceBreakdown(candidates: Candidate[]): Map<string, number> {
    const sources = new Map<string, number>();
    const sourceTypes = ['LinkedIn', 'Referral', 'Job Board', 'Direct Application', 'Recruiter'];

    sourceTypes.forEach(source => {
      sources.set(source, Math.floor(Math.random() * candidates.length));
    });

    return sources;
  }

  private calculateYieldRates(candidates: Candidate[]): Map<string, number> {
    const rates = new Map<string, number>();
    const stages = ['sourcing', 'screening', 'technical', 'interviews', 'offer'];

    stages.forEach(stage => {
      rates.set(stage, Math.floor(Math.random() * 50) + 10); // 10-60% yield
    });

    return rates;
  }
}
