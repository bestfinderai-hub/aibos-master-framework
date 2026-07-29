/**
 * Pricing & Billing Service
 * Manages tier pricing, usage tracking, and billing
 */

class PricingService {
  constructor() {
    this.tiers = {
      starter: {
        name: 'Starter',
        price: 0,
        apiCallsPerMonth: 100,
        projects: 1,
        support: 'community'
      },
      professional: {
        name: 'Professional',
        price: 99,
        apiCallsPerMonth: 100000,
        projects: 5,
        support: 'email',
        integrations: 3
      },
      enterprise: {
        name: 'Enterprise',
        price: 'custom',
        apiCallsPerMonth: 'unlimited',
        projects: 'unlimited',
        support: 'dedicated',
        sla: '99.9%',
        whiteLabel: true
      }
    };
  }

  getTier(tierName) {
    return this.tiers[tierName.toLowerCase()];
  }

  calculateMonthlyBill(tier, usage = {}) {
    const tierConfig = this.getTier(tier);
    if (!tierConfig) throw new Error('Invalid tier');

    let bill = tierConfig.price;

    if (usage.apiCalls > tierConfig.apiCallsPerMonth) {
      const overageCalls = usage.apiCalls - tierConfig.apiCallsPerMonth;
      bill += (overageCalls / 1000) * 0.10;
    }

    if (usage.extraProjects > 0) {
      bill += usage.extraProjects * 20;
    }

    return parseFloat(bill.toFixed(2));
  }

  recommendUpgrade(currentTier, usage) {
    const current = this.getTier(currentTier);
    if (!current) return null;

    if (usage.apiCalls > current.apiCallsPerMonth * 0.8) {
      return 'Ready for upgrade';
    }
    return null;
  }

  calculateAnnualSavings(monthlyBill, discountPercent = 15) {
    const annual = monthlyBill * 12;
    return {
      monthly: monthlyBill,
      annual,
      withDiscount: annual * (1 - discountPercent / 100),
      savings: (annual * discountPercent) / 100
    };
  }
}

module.exports = PricingService;
