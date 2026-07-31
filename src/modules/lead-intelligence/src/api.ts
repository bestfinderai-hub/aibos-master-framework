/**
 * Lead Intelligence API Endpoints
 */

import { Router, Request, Response } from 'express';
import { scoreLead, LeadData } from './lead-scorer';
import { CompanyIntelligence } from './company-intelligence';
import { DecisionMakerResearch } from './decision-maker-research';
import { OutreachSequences } from './outreach-sequences';

const router = Router();
const companyIntel = new CompanyIntelligence();
const decisionMaker = new DecisionMakerResearch();
const outreach = new OutreachSequences();

/**
 * POST /leads/score
 * Score a single lead
 */
router.post('/score', async (req: Request, res: Response) => {
  try {
    const leadData: LeadData = req.body;

    // Validate input
    if (!leadData.companyName) {
      return res.status(400).json({ error: 'companyName is required' });
    }

    // Score the lead
    const score = scoreLead(leadData);

    res.json({
      success: true,
      lead: leadData,
      score,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to score lead' });
  }
});

/**
 * POST /leads/batch-score
 * Score multiple leads
 */
router.post('/batch-score', async (req: Request, res: Response) => {
  try {
    const { leads }: { leads: LeadData[] } = req.body;

    if (!Array.isArray(leads)) {
      return res.status(400).json({ error: 'leads must be an array' });
    }

    const scores = leads.map((lead) => ({
      lead,
      score: scoreLead(lead),
    }));

    // Sort by score (highest first)
    scores.sort((a, b) => b.score.overall - a.score.overall);

    res.json({
      success: true,
      count: scores.length,
      scores,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to batch score leads' });
  }
});

/**
 * POST /leads/find
 * Find companies matching criteria
 * TODO: Integrate with data sources (Allabolag, LinkedIn, etc)
 */
router.post('/find', async (req: Request, res: Response) => {
  try {
    const { industry, employees_min, employees_max, growth_min } = req.body;

    // TODO: Query data sources
    // 1. Search Allabolag API for companies matching criteria
    // 2. Enrich with LinkedIn, news, social data
    // 3. Score each lead
    // 4. Return top 50 by score

    res.json({
      success: true,
      leads: [], // TODO: implement
      count: 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to find leads' });
  }
});

/**
 * GET /leads/:id
 * Get lead details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Get lead from database
    // 1. Look up lead by ID
    // 2. Return full profile with history

    res.json({
      success: true,
      lead: {}, // TODO: implement
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

/**
 * PUT /leads/:id
 * Update lead (e.g., mark as contacted, contacted, won)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // TODO: Update lead status in database

    res.json({
      success: true,
      message: 'Lead updated',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

/**
 * POST /companies/profile
 * Build company intelligence profile
 */
router.post('/companies/profile', async (req: Request, res: Response) => {
  try {
    const profile = companyIntel.buildProfile(req.body);
    const stackAnalysis = companyIntel.analyzeStackModernization(profile.techStack);
    const competitors = companyIntel.analyzeCompetitors(profile.competitors);
    const fit = companyIntel.scoreCompanyFit(profile);

    res.json({
      success: true,
      profile,
      stackAnalysis,
      competitors,
      companyFitScore: fit,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to build company profile' });
  }
});

/**
 * POST /decision-makers/identify
 * Identify decision makers in company
 */
router.post('/decision-makers/identify', async (req: Request, res: Response) => {
  try {
    const { company, department } = req.body;

    if (!company) {
      return res.status(400).json({ error: 'company is required' });
    }

    const makers = decisionMaker.identifyDecisionMakers(company, department);
    const committee = decisionMaker.buildBuyingCommittee(makers);
    const strategy = decisionMaker.generateOutreachStrategy(committee);

    const scores = makers.map(maker => ({
      maker,
      score: decisionMaker.scoreDecisionMaker(maker),
    }));

    res.json({
      success: true,
      makers: scores,
      committee,
      strategy,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to identify decision makers' });
  }
});

/**
 * POST /outreach/create-sequence
 * Create personalized outreach sequence
 */
router.post('/outreach/create-sequence', async (req: Request, res: Response) => {
  try {
    const { targetRole, company, painPoints, value } = req.body;

    if (!targetRole || !company || !painPoints || !value) {
      return res.status(400).json({
        error: 'targetRole, company, painPoints, and value are required',
      });
    }

    const sequence = outreach.createSequence(targetRole, company, painPoints, value);

    res.json({
      success: true,
      sequence,
      estimatedTouchPoints: sequence.touchCount,
      estimatedDuration: `${sequence.duration} days`,
      expectedConversion: `${sequence.expectedConversionRate}%`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create outreach sequence' });
  }
});

/**
 * POST /outreach/personalize
 * Personalize message with actual data
 */
router.post('/outreach/personalize', async (req: Request, res: Response) => {
  try {
    const { message, data } = req.body;

    const personalized = outreach.personalizeMessage(message, data);

    res.json({
      success: true,
      message: personalized,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to personalize message' });
  }
});

/**
 * POST /outreach/campaign
 * Generate multi-sequence campaign
 */
router.post('/outreach/campaign', async (req: Request, res: Response) => {
  try {
    const { decisionMakers, painPoints, value } = req.body;

    const campaign = outreach.generateCampaign(decisionMakers, painPoints, value);

    res.json({
      success: true,
      campaign,
      totalSequences: campaign.length,
      estimatedOutreaches: campaign.reduce((sum, c) => sum + c.sequence.touchCount, 0),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate campaign' });
  }
});

/**
 * POST /outreach/track
 * Track campaign performance
 */
router.post('/outreach/track', async (req: Request, res: Response) => {
  try {
    const { sequenceId, sent, responses } = req.body;

    const performance = outreach.trackPerformance(sequenceId, sent, responses);

    res.json({
      success: true,
      performance,
      healthStatus: performance.successRate > 8 ? 'healthy' : performance.successRate > 3 ? 'needs optimization' : 'critical',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track performance' });
  }
});

export default router;
