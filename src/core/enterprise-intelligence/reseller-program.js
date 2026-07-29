/**
 * Reseller Program
 * Commission tracking, partner management, and revenue sharing
 */

class ResellerProgram {
  constructor() {
    this.partners = new Map(); // partnerId -> partner config
    this.commissions = new Map(); // partnerId -> commission rates
    this.sales = []; // all sales by partners
    this.payouts = new Map(); // partnerId -> payout history
  }

  // ============================================================================
  // PARTNER MANAGEMENT
  // ============================================================================

  registerPartner(partnerId, partnerConfig) {
    if (!partnerId || !partnerConfig.name || !partnerConfig.email) {
      throw new Error('Must provide partnerId, name, and email');
    }

    const partner = {
      id: partnerId,
      name: partnerConfig.name,
      email: partnerConfig.email,
      type: partnerConfig.type || 'reseller', // reseller, affiliate, partner
      status: 'active',
      website: partnerConfig.website,
      contactPerson: partnerConfig.contactPerson,
      industry: partnerConfig.industry,
      country: partnerConfig.country,
      apiKey: this.generateApiKey(),
      tier: partnerConfig.tier || 'silver', // bronze, silver, gold, platinum
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null,
      onboardingStatus: 'incomplete',
      taxId: partnerConfig.taxId,
      bankDetails: partnerConfig.bankDetails || {}
    };

    this.partners.set(partnerId, partner);

    // Initialize commission rates
    this.setCommissionRates(partnerId, this.getDefaultCommissionRates(partner.tier));

    // Initialize payout tracking
    this.payouts.set(partnerId, []);

    return partner;
  }

  getPartner(partnerId) {
    return this.partners.get(partnerId);
  }

  updatePartner(partnerId, updates) {
    const partner = this.partners.get(partnerId);
    if (!partner) throw new Error(`Partner ${partnerId} not found`);

    Object.assign(partner, updates);
    partner.updatedAt = new Date();

    return partner;
  }

  approvePartner(partnerId) {
    const partner = this.partners.get(partnerId);
    if (!partner) throw new Error(`Partner ${partnerId} not found`);

    partner.status = 'approved';
    partner.approvedAt = new Date();
    partner.onboardingStatus = 'complete';

    return partner;
  }

  listPartners(filter = {}) {
    let partners = Array.from(this.partners.values());

    if (filter.type) {
      partners = partners.filter(p => p.type === filter.type);
    }

    if (filter.status) {
      partners = partners.filter(p => p.status === filter.status);
    }

    if (filter.tier) {
      partners = partners.filter(p => p.tier === filter.tier);
    }

    if (filter.country) {
      partners = partners.filter(p => p.country === filter.country);
    }

    return partners;
  }

  // ============================================================================
  // COMMISSION RATES
  // ============================================================================

  getDefaultCommissionRates(tier) {
    const rates = {
      bronze: {
        recurring: 0.15, // 15%
        oneTime: 0.20,
        implementation: 0.10,
        support: 0.05,
        resaleDiscount: 0.20
      },
      silver: {
        recurring: 0.25,
        oneTime: 0.30,
        implementation: 0.15,
        support: 0.10,
        resaleDiscount: 0.25
      },
      gold: {
        recurring: 0.35,
        oneTime: 0.40,
        implementation: 0.20,
        support: 0.15,
        resaleDiscount: 0.30
      },
      platinum: {
        recurring: 0.45,
        oneTime: 0.50,
        implementation: 0.25,
        support: 0.20,
        resaleDiscount: 0.35
      }
    };

    return rates[tier] || rates.silver;
  }

  setCommissionRates(partnerId, rates) {
    this.commissions.set(partnerId, {
      partnerId,
      rates,
      effectiveFrom: new Date(),
      updatedAt: new Date()
    });

    return this.commissions.get(partnerId);
  }

  upgradeTier(partnerId, newTier) {
    const partner = this.partners.get(partnerId);
    if (!partner) throw new Error(`Partner ${partnerId} not found`);

    partner.tier = newTier;
    partner.updatedAt = new Date();

    // Update commission rates
    this.setCommissionRates(partnerId, this.getDefaultCommissionRates(newTier));

    return partner;
  }

  getCommissionRates(partnerId) {
    const commission = this.commissions.get(partnerId);
    if (!commission) throw new Error(`Commission rates not set for ${partnerId}`);

    return commission.rates;
  }

  // ============================================================================
  // SALES & REVENUE TRACKING
  // ============================================================================

  recordSale(partnerId, saleConfig) {
    if (!partnerId || !saleConfig.customerId || !saleConfig.amount === undefined) {
      throw new Error('Must provide partnerId, customerId, and amount');
    }

    const partner = this.partners.get(partnerId);
    if (!partner) throw new Error(`Partner ${partnerId} not found`);

    const sale = {
      id: this.generateId('sale'),
      partnerId,
      partnerName: partner.name,
      customerId: saleConfig.customerId,
      customerName: saleConfig.customerName,
      amount: saleConfig.amount,
      type: saleConfig.type || 'recurring', // recurring, oneTime, implementation, support
      product: saleConfig.product || 'aibos',
      plan: saleConfig.plan || 'professional',
      billingPeriod: saleConfig.billingPeriod || 'monthly',
      commissionRate: null,
      commissionAmount: null,
      status: 'recorded', // recorded, approved, paid
      recordedAt: new Date(),
      approvedAt: null,
      paidAt: null,
      notes: saleConfig.notes
    };

    // Calculate commission
    const rates = this.getCommissionRates(partnerId);
    const typeRates = {
      recurring: rates.recurring,
      oneTime: rates.oneTime,
      implementation: rates.implementation,
      support: rates.support
    };

    sale.commissionRate = typeRates[sale.type] || rates.recurring;
    sale.commissionAmount = sale.amount * sale.commissionRate;

    this.sales.push(sale);

    return sale;
  }

  approveSale(saleId) {
    const sale = this.sales.find(s => s.id === saleId);
    if (!sale) throw new Error(`Sale ${saleId} not found`);

    sale.status = 'approved';
    sale.approvedAt = new Date();

    return sale;
  }

  getSalesForPartner(partnerId, filter = {}) {
    let sales = this.sales.filter(s => s.partnerId === partnerId);

    if (filter.status) {
      sales = sales.filter(s => s.status === filter.status);
    }

    if (filter.type) {
      sales = sales.filter(s => s.type === filter.type);
    }

    if (filter.from) {
      sales = sales.filter(s => s.recordedAt >= filter.from);
    }

    if (filter.to) {
      sales = sales.filter(s => s.recordedAt <= filter.to);
    }

    return sales;
  }

  // ============================================================================
  // COMMISSION CALCULATIONS
  // ============================================================================

  calculatePartnerCommissions(partnerId, period = null) {
    let sales = this.getSalesForPartner(partnerId, { status: 'approved' });

    if (period) {
      sales = sales.filter(s =>
        s.approvedAt >= period.from && s.approvedAt <= period.to
      );
    }

    const breakdown = {
      recurring: 0,
      oneTime: 0,
      implementation: 0,
      support: 0
    };

    let totalCommission = 0;

    for (const sale of sales) {
      breakdown[sale.type] = (breakdown[sale.type] || 0) + sale.commissionAmount;
      totalCommission += sale.commissionAmount;
    }

    return {
      partnerId,
      period: period || { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() },
      salesCount: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + s.amount, 0),
      breakdown,
      totalCommission,
      calculatedAt: new Date()
    };
  }

  calculateAggregateCommissions(period = null) {
    const byPartner = {};

    for (const [partnerId] of this.partners.entries()) {
      const commission = this.calculatePartnerCommissions(partnerId, period);
      byPartner[partnerId] = commission;
    }

    return {
      totalPartners: Object.keys(byPartner).length,
      byPartner,
      totalCommissions: Object.values(byPartner).reduce((sum, c) => sum + c.totalCommission, 0),
      period: period || { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() },
      calculatedAt: new Date()
    };
  }

  // ============================================================================
  // PAYOUTS
  // ============================================================================

  initiateMonthlyPayouts(month = null) {
    const targetDate = month || new Date();
    const period = {
      from: new Date(targetDate.getFullYear(), targetDate.getMonth(), 1),
      to: new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
    };

    const payouts = [];

    for (const [partnerId] of this.partners.entries()) {
      const partner = this.partners.get(partnerId);
      if (partner.status !== 'approved') continue;

      const commission = this.calculatePartnerCommissions(partnerId, period);

      if (commission.totalCommission > 0) {
        const payout = {
          id: this.generateId('payout'),
          partnerId,
          partnerName: partner.name,
          period,
          amount: commission.totalCommission,
          commissionBreakdown: commission.breakdown,
          status: 'pending', // pending, approved, processed, paid, failed
          processedAt: null,
          paidAt: null,
          transactionId: null,
          notes: null,
          createdAt: new Date()
        };

        payouts.push(payout);

        // Add to partner's payout history
        this.payouts.get(partnerId).push(payout);
      }
    }

    return payouts;
  }

  approvePayout(payoutId) {
    for (const [, payouts] of this.payouts.entries()) {
      const payout = payouts.find(p => p.id === payoutId);
      if (payout) {
        payout.status = 'approved';
        payout.processedAt = new Date();
        return payout;
      }
    }

    throw new Error(`Payout ${payoutId} not found`);
  }

  processPayout(payoutId) {
    for (const [, payouts] of this.payouts.entries()) {
      const payout = payouts.find(p => p.id === payoutId);
      if (payout) {
        payout.status = 'processed';
        payout.transactionId = this.generateId('txn');
        return payout;
      }
    }

    throw new Error(`Payout ${payoutId} not found`);
  }

  getPayoutHistory(partnerId) {
    const payouts = this.payouts.get(partnerId) || [];
    return payouts.sort((a, b) => b.createdAt - a.createdAt);
  }

  // ============================================================================
  // PARTNER PORTAL DATA
  // ============================================================================

  getPartnerDashboard(partnerId) {
    const partner = this.partners.get(partnerId);
    if (!partner) throw new Error(`Partner ${partnerId} not found`);

    const sales = this.getSalesForPartner(partnerId);
    const commission = this.calculatePartnerCommissions(partnerId);
    const payouts = this.getPayoutHistory(partnerId);
    const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'approved');
    const totalPaidOut = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

    return {
      partner: {
        id: partner.id,
        name: partner.name,
        tier: partner.tier,
        status: partner.status
      },
      sales: {
        total: sales.length,
        thisMonth: sales.filter(s => this.isThisMonth(s.recordedAt)).length,
        approved: sales.filter(s => s.status === 'approved').length,
        pending: sales.filter(s => s.status === 'recorded').length
      },
      revenue: {
        thisMonth: commission.totalRevenue,
        totalRevenue: sales.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.amount, 0)
      },
      commission: {
        thisMonth: commission.totalCommission,
        breakdown: commission.breakdown,
        pending: pendingPayouts.reduce((sum, p) => sum + p.amount, 0),
        paidToDate: totalPaidOut
      },
      payouts: {
        pending: pendingPayouts.map(p => ({
          id: p.id,
          amount: p.amount,
          period: p.period,
          status: p.status
        })),
        recent: payouts.slice(0, 5)
      }
    };
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateApiKey() {
    return `pk_${Math.random().toString(36).substr(2)}_${Date.now()}`;
  }

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  isThisMonth(date) {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() &&
           date.getMonth() === now.getMonth();
  }

  getPartnerStats() {
    const partners = Array.from(this.partners.values());
    const approvedPartners = partners.filter(p => p.status === 'approved');

    return {
      totalPartners: partners.length,
      approvedPartners: approvedPartners.length,
      byTier: {
        bronze: partners.filter(p => p.tier === 'bronze').length,
        silver: partners.filter(p => p.tier === 'silver').length,
        gold: partners.filter(p => p.tier === 'gold').length,
        platinum: partners.filter(p => p.tier === 'platinum').length
      },
      totalSales: this.sales.length,
      totalCommissionsAllocated: this.sales.reduce((sum, s) => sum + (s.commissionAmount || 0), 0),
      totalSalesValue: this.sales.reduce((sum, s) => sum + s.amount, 0)
    };
  }

  exportPartnerReport(partnerId) {
    const partner = this.partners.get(partnerId);
    const sales = this.getSalesForPartner(partnerId);
    const commissions = this.calculatePartnerCommissions(partnerId);
    const payouts = this.getPayoutHistory(partnerId);

    return {
      partner,
      sales,
      commissions,
      payouts,
      exportedAt: new Date()
    };
  }
}

module.exports = ResellerProgram;
