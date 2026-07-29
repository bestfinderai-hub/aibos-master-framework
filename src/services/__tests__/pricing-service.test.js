/**
 * Pricing Service Tests
 */

const PricingService = require('../../../src/services/pricing-service');

describe('PricingService', () => {
  let pricing;

  beforeEach(() => {
    pricing = new PricingService();
  });

  test('should get starter tier', () => {
    const tier = pricing.getTier('starter');
    expect(tier.name).toBe('Starter');
    expect(tier.price).toBe(0);
    expect(tier.apiCallsPerMonth).toBe(100);
  });

  test('should get professional tier', () => {
    const tier = pricing.getTier('professional');
    expect(tier.price).toBe(99);
    expect(tier.apiCallsPerMonth).toBe(100000);
  });

  test('should calculate bill for starter (free)', () => {
    const bill = pricing.calculateMonthlyBill('starter');
    expect(bill).toBe(0);
  });

  test('should calculate bill with overages', () => {
    const bill = pricing.calculateMonthlyBill('professional', {
      apiCalls: 150000
    });
    const overageCharges = (50000 / 1000) * 0.10; // 5.00
    expect(bill).toBe(99 + overageCharges);
  });

  test('should calculate bill with extra projects', () => {
    const bill = pricing.calculateMonthlyBill('professional', {
      extraProjects: 2
    });
    expect(bill).toBe(99 + 40); // 2 extra * 20
  });

  test('should recommend upgrade at 80% usage', () => {
    const recommendation = pricing.recommendUpgrade('professional', {
      apiCalls: 85000
    });
    expect(recommendation).toBe('Ready for upgrade');
  });

  test('should calculate annual savings', () => {
    const savings = pricing.calculateAnnualSavings(99);
    expect(savings.monthly).toBe(99);
    expect(savings.annual).toBe(99 * 12);
    expect(savings.savings).toBeCloseTo(99 * 12 * 0.15, 1);
  });

  test('should get trial offer', () => {
    const trial = pricing.getTrialOffer('professional');
    expect(trial.duration).toBe('14 days');
    expect(trial.creditAfterTrial).toBe(50);
  });
});
