/**
 * Contact & Company Manager
 * Centralized customer data management
 */

class ContactManager {
  constructor() {
    this.contacts = new Map();
    this.companies = new Map();
    this.deals = new Map();
  }

  // ===== CONTACTS =====

  createContact(data) {
    const id = Math.random().toString(36).substr(2, 9);
    const contact = {
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      title: data.title,
      company: data.company,
      tags: data.tags || [],
      customFields: data.customFields || {},
      interactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  getContact(contactId) {
    return this.contacts.get(contactId);
  }

  updateContact(contactId, updates) {
    const contact = this.contacts.get(contactId);
    if (!contact) throw new Error('Contact not found');

    Object.assign(contact, updates);
    contact.updatedAt = new Date();
    return contact;
  }

  // ===== COMPANIES =====

  createCompany(data) {
    const id = Math.random().toString(36).substr(2, 9);
    const company = {
      id,
      name: data.name,
      domain: data.domain,
      industry: data.industry,
      size: data.size,
      revenue: data.revenue,
      location: data.location,
      contacts: [],
      deals: [],
      healthScore: 50,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.companies.set(id, company);
    return company;
  }

  getCompany(companyId) {
    const company = this.companies.get(companyId);
    if (!company) return null;

    // Enrich with related contacts + deals
    return {
      ...company,
      contacts: company.contacts.map(id => this.contacts.get(id)),
      deals: company.deals.map(id => this.deals.get(id))
    };
  }

  // ===== DEALS =====

  createDeal(data) {
    const id = Math.random().toString(36).substr(2, 9);
    const deal = {
      id,
      name: data.name,
      amount: data.amount,
      stage: 'initial_contact', // initial_contact → qualified → proposal → negotiation → won/lost
      probability: this.stageProbability(data.stage),
      closeDate: data.closeDate,
      owner: data.owner,
      company: data.company,
      contacts: data.contacts || [],
      notes: '',
      timeline: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.deals.set(id, deal);
    return deal;
  }

  updateDealStage(dealId, newStage) {
    const deal = this.deals.get(dealId);
    if (!deal) throw new Error('Deal not found');

    deal.stage = newStage;
    deal.probability = this.stageProbability(newStage);
    deal.timeline.push({
      stage: newStage,
      timestamp: new Date()
    });
    deal.updatedAt = new Date();

    return deal;
  }

  stageProbability(stage) {
    const probs = {
      initial_contact: 10,
      qualified: 25,
      proposal: 50,
      negotiation: 75,
      won: 100,
      lost: 0
    };
    return probs[stage] || 0;
  }

  // ===== ANALYTICS =====

  getPipeline() {
    const stages = {};
    for (const deal of this.deals.values()) {
      if (!stages[deal.stage]) stages[deal.stage] = { count: 0, value: 0 };
      stages[deal.stage].count++;
      stages[deal.stage].value += deal.amount;
    }
    return stages;
  }

  getAverageSalesCycle() {
    const completedDeals = Array.from(this.deals.values())
      .filter(d => ['won', 'lost'].includes(d.stage));

    if (completedDeals.length === 0) return 0;

    const cycles = completedDeals.map(d => {
      const start = d.createdAt;
      const end = d.timeline[d.timeline.length - 1]?.timestamp || new Date();
      return (end - start) / (1000 * 60 * 60 * 24); // days
    });

    return Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
  }

  getWinRate() {
    const completed = Array.from(this.deals.values())
      .filter(d => ['won', 'lost'].includes(d.stage));

    if (completed.length === 0) return 0;

    const won = completed.filter(d => d.stage === 'won').length;
    return ((won / completed.length) * 100).toFixed(2);
  }

  getWeightedForecast() {
    let total = 0;
    for (const deal of this.deals.values()) {
      if (!['won', 'lost'].includes(deal.stage)) {
        total += (deal.amount * deal.probability) / 100;
      }
    }
    return Math.round(total);
  }
}

module.exports = ContactManager;
