/**
 * DEL 8: Outreach Sequences
 * Multi-touch outreach campaigns with personalization and sequencing
 */

interface OutreachMessage {
  type: 'email' | 'linkedin' | 'call' | 'video' | 'whitepaper' | 'demo';
  subject?: string;
  body: string;
  cta: string; // Call to action
  delay: number; // Days after previous touch
  personalizationTokens: string[]; // e.g., {{firstName}}, {{company}}
  expectedResponseRate: number; // 0-100
}

interface OutreachSequence {
  id: string;
  name: string;
  targetRole: string;
  touchCount: number;
  duration: number; // total days
  messages: OutreachMessage[];
  expectedConversionRate: number; // % to next stage
  successMetrics: {
    openRate: number; // %
    responseRate: number; // %
    conversionRate: number; // %
  };
}

interface CampaignPerformance {
  sequenceId: string;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  converted: number;
  abandoned: number;
  successRate: number; // %
}

export class OutreachSequences {
  /**
   * Create outreach sequence for decision maker
   */
  createSequence(
    targetRole: string,
    companyName: string,
    painPoints: string[],
    value: string
  ): OutreachSequence {
    const messages: OutreachMessage[] = [
      {
        type: 'email',
        subject: `Quick thought on ${painPoints[0] || 'your priorities'}, ${targetRole}`,
        body: `Hi {{firstName}},

I noticed {{company}} is making smart moves in ${painPoints[0] || 'their space'}.

Most teams like yours struggle with ${painPoints[0]}, which typically costs ${painPoints[1] ? '2-3 weeks/sprint' : '10-15% of revenue'}.

I've helped similar teams cut that in half.

Worth a quick conversation?

${value}`,
        cta: 'Can we chat for 15 min?',
        delay: 0,
        personalizationTokens: ['{{firstName}}', '{{company}}'],
        expectedResponseRate: 8,
      },
      {
        type: 'linkedin',
        body: `Just saw your recent updates at {{company}}. Love the ${value}-focused approach.

Sounds like you're tackling ${painPoints[0]}. Would be happy to share what's working for other ${targetRole}s.`,
        cta: 'Connect on a call',
        delay: 2,
        personalizationTokens: ['{{firstName}}', '{{company}}'],
        expectedResponseRate: 12,
      },
      {
        type: 'email',
        subject: `${targetRole} at {{company}} + ${painPoints[0]} = potential missed revenue`,
        body: `${targetRole},

Quick follow-up on my last note.

Most teams don't realize that ${painPoints[0]} directly impacts ${painPoints[1] || 'customer lifetime value'}.

The fix? ${value}.

Teams using this see a ${value} within 30 days.

Let me show you:
- Benchmark: How {{company}} compares to peers
- Quick audit: Your specific ${painPoints[0]} risks
- Roadmap: 90-day implementation

Just 20 minutes. Worth it?

Cheers`,
        cta: 'Let\`s schedule',
        delay: 4,
        personalizationTokens: ['{{firstName}}', '{{company}}'],
        expectedResponseRate: 6,
      },
      {
        type: 'whitepaper',
        body: `Hi {{firstName}},

Last attempt to get on your radar.

Attached: "The ${painPoints[0]} Playbook" for teams at {{company}}'s stage.

Free PDF, 5-min read. Zero obligation.

If it resonates, reply and let's talk.

If not, no worries — best of luck with the initiatives.

Cheers`,
        cta: 'Review & reply',
        delay: 6,
        personalizationTokens: ['{{firstName}}', '{{company}}'],
        expectedResponseRate: 4,
      },
      {
        type: 'video',
        body: `${targetRole},

Recorded a quick 90-second video showing how {{company}} could tackle ${painPoints[0]}.

[video link]

Worth a watch?`,
        cta: 'Watch now',
        delay: 8,
        personalizationTokens: ['{{firstName}}', '{{company}}'],
        expectedResponseRate: 10,
      },
      {
        type: 'demo',
        body: `Quick ask:

Are you open to seeing how to cut ${painPoints[0]} by 50% at {{company}}?

If yes, I'll record a custom 15-min demo just for your team.

Let me know.`,
        cta: 'See demo',
        delay: 10,
        personalizationTokens: ['{{firstName}}', '{{company}}'],
        expectedResponseRate: 5,
      },
    ];

    const totalDays = messages.reduce((sum, m) => sum + m.delay, 0) + 7;
    const totalResponses = messages.reduce((sum, m) => sum + m.expectedResponseRate, 0);
    const conversionRate = Math.min(totalResponses / 100, 0.15); // Max 15%

    return {
      id: `seq-${Date.now()}`,
      name: `${targetRole} at {{company}} - ${painPoints[0]}`,
      targetRole,
      touchCount: messages.length,
      duration: totalDays,
      messages,
      expectedConversionRate: Math.round(conversionRate * 100),
      successMetrics: {
        openRate: 35,
        responseRate: Math.round(totalResponses / 6),
        conversionRate: Math.round(conversionRate * 100),
      },
    };
  }

  /**
   * Personalize message with actual data
   */
  personalizeMessage(
    message: OutreachMessage,
    data: Record<string, string>
  ): OutreachMessage {
    let personalizedBody = message.body;
    let personalizedSubject = message.subject;

    for (const token of message.personalizationTokens) {
      const key = token.replace(/{{|}}/g, '');
      const value = data[key] || token;

      personalizedBody = personalizedBody.replace(new RegExp(token, 'g'), value);
      if (personalizedSubject) {
        personalizedSubject = personalizedSubject.replace(new RegExp(token, 'g'), value);
      }
    }

    return {
      ...message,
      subject: personalizedSubject,
      body: personalizedBody,
    };
  }

  /**
   * Generate multi-sequence campaign
   */
  generateCampaign(
    decisionMakers: Array<{ name: string; role: string; company: string }>,
    painPoints: string[],
    value: string
  ) {
    return decisionMakers.map(dm => ({
      maker: dm,
      sequence: this.createSequence(dm.role, dm.company, painPoints, value),
      schedule: this.generateSchedule(dm),
    }));
  }

  /**
   * Track campaign performance
   */
  trackPerformance(sequenceId: string, sent: number, responses: number): CampaignPerformance {
    const opened = Math.round(sent * 0.35);
    const clicked = Math.round(opened * 0.4);
    const replied = Math.round(clicked * 0.15);
    const converted = Math.round(replied * 0.4);
    const abandoned = sent - opened;

    return {
      sequenceId,
      sent,
      opened,
      clicked,
      replied,
      converted,
      abandoned,
      successRate: (converted / sent) * 100,
    };
  }

  /**
   * Optimize sequence based on performance
   */
  optimizeSequence(
    sequence: OutreachSequence,
    performance: CampaignPerformance
  ): OutreachSequence {
    if (performance.successRate < 3) {
      // Low performance: adjust messaging and timing
      return {
        ...sequence,
        messages: sequence.messages.map(msg => ({
          ...msg,
          expectedResponseRate: msg.expectedResponseRate + 2, // Slight boost for A/B test
        })),
      };
    }

    if (performance.successRate > 10) {
      // High performance: reduce touches
      return {
        ...sequence,
        messages: sequence.messages.slice(0, 4), // Keep best 4 touches
      };
    }

    return sequence;
  }

  // Private helpers

  private generateSchedule(dm: { name: string; role: string; company: string }): string[] {
    const schedule: string[] = [];
    let currentDay = 0;

    for (let i = 0; i < 6; i++) {
      schedule.push(`Day ${currentDay}: Touch ${i + 1}`);
      currentDay += Math.floor(Math.random() * 4) + 2; // Random 2-5 day gaps
    }

    return schedule;
  }
}
