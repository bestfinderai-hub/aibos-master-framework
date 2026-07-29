/**
 * Billing API Routes
 * Manage subscriptions, tiers, and usage
 */

const express = require('express');
const PricingService = require('../../services/pricing-service');

const router = express.Router();
const pricing = new PricingService();

/**
 * GET /api/billing/tiers
 * Get all available tiers
 */
router.get('/tiers', (req, res) => {
  try {
    const tiers = Object.entries(pricing.tiers).map(([key, tier]) => ({
      id: key,
      ...tier
    }));
    res.json({ success: true, tiers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/billing/tier/:name
 * Get specific tier details
 */
router.get('/tier/:name', (req, res) => {
  try {
    const tier = pricing.getTier(req.params.name);
    if (!tier) return res.status(404).json({ error: 'Tier not found' });
    res.json({ success: true, tier });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/billing/calculate
 * Calculate bill for usage
 */
router.post('/calculate', (req, res) => {
  try {
    const { tier, usage } = req.body;
    const bill = pricing.calculateMonthlyBill(tier, usage);
    res.json({ success: true, bill });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/billing/recommend
 * Get upgrade recommendation
 */
router.post('/recommend', (req, res) => {
  try {
    const { currentTier, usage } = req.body;
    const recommendation = pricing.recommendUpgrade(currentTier, usage);
    res.json({ success: true, recommendation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/billing/savings/:monthlyBill
 * Calculate annual savings with discount
 */
router.get('/savings/:monthlyBill', (req, res) => {
  try {
    const bill = parseFloat(req.params.monthlyBill);
    const savings = pricing.calculateAnnualSavings(bill);
    res.json({ success: true, savings });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/billing/trial
 * Get trial offer
 */
router.post('/trial', (req, res) => {
  try {
    const { tier } = req.body;
    const trial = pricing.getTrialOffer(tier);
    res.json({ success: true, trial });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
