/**
 * Lead Intelligence API Endpoints
 */

import { Router, Request, Response } from 'express';
import { scoreLead, LeadData } from './lead-scorer';

const router = Router();

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

export default router;
