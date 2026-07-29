/**
 * Data Intelligence Tests
 */

const DataQualityEngine = require('../data-quality');
const CustomerProfiler = require('../customer-profiler');
const PredictiveModels = require('../predictive-models');

describe('DataQualityEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new DataQualityEngine();
  });

  describe('validateRecord', () => {
    test('should validate required fields', () => {
      const schema = {
        email: { required: true, type: 'email' },
        phone: { required: false, type: 'phone' }
      };

      const record = { email: 'test@example.com' };
      const result = engine.validateRecord(record, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should catch missing required fields', () => {
      const schema = {
        email: { required: true, type: 'email' }
      };

      const record = { email: '' };
      const result = engine.validateRecord(record, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('required');
    });

    test('should validate email format', () => {
      const schema = { email: { type: 'email' } };
      const validRecord = { email: 'user@example.com' };
      const invalidRecord = { email: 'invalid-email' };

      const validResult = engine.validateRecord(validRecord, schema);
      const invalidResult = engine.validateRecord(invalidRecord, schema);

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
    });

    test('should validate phone format', () => {
      const schema = { phone: { type: 'phone' } };
      const validRecord = { phone: '+1234567890' };
      const invalidRecord = { phone: '123' };

      const validResult = engine.validateRecord(validRecord, schema);
      const invalidResult = engine.validateRecord(invalidRecord, schema);

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('detectDuplicates', () => {
    test('should find duplicate records by key', () => {
      const records = [
        { id: 1, name: 'John' },
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ];

      const duplicates = engine.detectDuplicates(records, 'id');

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].similarity).toBe(0.95);
    });

    test('should handle empty records', () => {
      const duplicates = engine.detectDuplicates([], 'id');
      expect(duplicates).toHaveLength(0);
    });
  });

  describe('mergeDuplicates', () => {
    test('should merge with prefer_newer strategy', () => {
      const record1 = {
        id: 1,
        name: 'John',
        email: 'old@example.com',
        updatedAt: new Date('2026-01-01')
      };

      const record2 = {
        id: 1,
        name: 'John Smith',
        email: 'new@example.com',
        updatedAt: new Date('2026-01-02')
      };

      const merged = engine.mergeDuplicates(record1, record2, 'prefer_newer');

      expect(merged.name).toBe('John Smith');
      expect(merged.email).toBe('new@example.com');
    });

    test('should merge with prefer_filled strategy', () => {
      const record1 = { id: 1, name: 'John', email: 'john@example.com' };
      const record2 = { id: 1, phone: '1234567890' };

      const merged = engine.mergeDuplicates(record1, record2, 'prefer_filled');

      expect(merged.name).toBe('John');
      expect(merged.email).toBe('john@example.com');
      expect(merged.phone).toBe('1234567890');
    });
  });

  describe('detectOutliers', () => {
    test('should detect outliers using 3-sigma rule', () => {
      const records = [
        { id: 1, value: 10 },
        { id: 2, value: 12 },
        { id: 3, value: 11 },
        { id: 4, value: 100 } // Outlier
      ];

      const outliers = engine.detectOutliers(records, 'value');

      expect(outliers.length).toBeGreaterThan(0);
      expect(outliers.some(o => o.value === 100)).toBe(true);
    });

    test('should handle insufficient data', () => {
      const records = [{ id: 1, value: 10 }, { id: 2, value: 12 }];
      const outliers = engine.detectOutliers(records, 'value');

      expect(outliers).toHaveLength(0);
    });
  });

  describe('enrichRecord', () => {
    test('should add derived fields', () => {
      const record = {
        name: 'John',
        email: 'john@example.com',
        phone: '+1234567890'
      };

      const enriched = engine.enrichRecord(record);

      expect(enriched.name_length).toBe(4);
      expect(enriched.email_domain).toBe('example.com');
      expect(enriched.phone_country).toBe('+12');
      expect(enriched.enrichedAt).toBeDefined();
    });
  });

  describe('getQualityScore', () => {
    test('should calculate quality score', () => {
      const record = {
        name: 'John',
        email: 'john@example.com',
        phone: '+1234567890'
      };

      const score = engine.getQualityScore(record);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should penalize invalid formats', () => {
      const validRecord = { email: 'john@example.com' };
      const invalidRecord = { email: 'invalid-email' };

      const validScore = engine.getQualityScore(validRecord);
      const invalidScore = engine.getQualityScore(invalidRecord);

      expect(validScore).toBeGreaterThan(invalidScore);
    });
  });

  describe('cleanRecord', () => {
    test('should clean and normalize data', () => {
      const record = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  '
      };

      const cleaned = engine.cleanRecord(record);

      expect(cleaned.name).toBe('john doe');
      expect(cleaned.email).toBe('john@example.com');
    });
  });
});

describe('CustomerProfiler', () => {
  let profiler;

  beforeEach(() => {
    profiler = new CustomerProfiler();
  });

  describe('buildProfile', () => {
    test('should build complete customer profile', () => {
      const sources = {
        crm: {
          name: 'Acme Corp',
          company: 'Acme Inc',
          industry: 'Technology',
          employees: 500,
          email: 'contact@acme.com',
          title: 'CEO'
        },
        usage: {
          actions: [
            { feature: 'api', timestamp: new Date(), status: 'success' },
            { feature: 'dashboard', timestamp: new Date(), status: 'success' }
          ]
        },
        engagement: {
          interactions: [
            { type: 'email', opened: true, clicked: true },
            { type: 'support', createdAt: new Date(), resolvedAt: new Date() }
          ],
          nps: 9
        },
        billing: {
          plan: 'pro',
          mrr: 1000,
          paymentMethod: 'credit_card'
        }
      };

      const profile = profiler.buildProfile('cust_123', sources);

      expect(profile.customerId).toBe('cust_123');
      expect(profile.demographics.name).toBe('Acme Corp');
      expect(profile.firmographics.industry).toBe('Technology');
      expect(profile.behavioral).toBeDefined();
      expect(profile.engagement).toBeDefined();
      expect(profile.financial).toBeDefined();
      expect(profile.health).toBeDefined();
    });

    test('should calculate health score', () => {
      const sources = {
        crm: { name: 'Test' },
        usage: { actions: [] },
        engagement: { interactions: [], nps: 9 },
        billing: { mrr: 1000 }
      };

      const profile = profiler.buildProfile('cust_123', sources);

      expect(profile.health.score).toBeDefined();
      expect(profile.health.status).toMatch(/healthy|at_risk|critical/);
    });
  });

  describe('updateProfile', () => {
    test('should update existing profile', () => {
      const sources = {
        crm: { name: 'Old Name' },
        usage: { actions: [] },
        engagement: { interactions: [] },
        billing: { mrr: 1000 }
      };

      const profile = profiler.buildProfile('cust_123', sources);
      const updated = profiler.updateProfile('cust_123', {
        demographics: { name: 'New Name' }
      });

      expect(updated.demographics.name).toBe('New Name');
      expect(updated.updatedAt).toBeGreaterThanOrEqual(profile.createdAt);
    });
  });

  describe('identifyRiskFactors', () => {
    test('should identify risk factors', () => {
      const profile = {
        behavioral: { daysInactive: 90, errorRate: 0.2 },
        engagement: { supportTicketsCreated: 10, netPromoterScore: 5 },
        financial: { hasOutstandingInvoices: true }
      };

      const risks = profiler.identifyRiskFactors(profile);

      expect(risks.length).toBeGreaterThan(0);
      expect(risks.some(r => r.type === 'inactivity')).toBe(true);
    });
  });
});

describe('PredictiveModels', () => {
  let models;

  beforeEach(() => {
    models = new PredictiveModels();
  });

  describe('predictChurn', () => {
    test('should predict churn risk for inactive customer', () => {
      const profile = {
        behavioral: { daysInactive: 120, errorRate: 0.1, apiCallsPerDay: 10 },
        engagement: { supportTicketsCreated: 15, emailClickRate: 0.01 },
        financial: { hasOutstandingInvoices: false }
      };

      const churnScore = models.predictChurn(profile);

      expect(churnScore).toBeGreaterThan(50);
    });

    test('should predict low churn for healthy customer', () => {
      const profile = {
        behavioral: { daysInactive: 1, errorRate: 0.01, apiCallsPerDay: 100 },
        engagement: { supportTicketsCreated: 1, emailClickRate: 0.3, netPromoterScore: 9 },
        financial: { hasOutstandingInvoices: false }
      };

      const churnScore = models.predictChurn(profile);

      expect(churnScore).toBeLessThan(50);
    });
  });

  describe('predictExpansion', () => {
    test('should predict expansion for highly engaged customer', () => {
      const profile = {
        behavioral: {
          apiCallsPerDay: 2000,
          mostUsedFeatures: [
            { feature: 'api', count: 100 },
            { feature: 'dashboard', count: 50 },
            { feature: 'reports', count: 40 },
            { feature: 'export', count: 35 },
            { feature: 'webhooks', count: 30 },
            { feature: 'custom-domains', count: 25 },
            { feature: 'sso', count: 20 },
            { feature: 'audit-logs', count: 15 }
          ],
          errorRate: 0.01
        },
        engagement: { emailClickRate: 0.4, netPromoterScore: 9 },
        financial: { monthlyRecurringRevenue: 2000 }
      };

      const expansionScore = models.predictExpansion(profile);

      expect(expansionScore).toBeGreaterThan(50);
    });
  });

  describe('predictLeadScore', () => {
    test('should score high-quality lead', () => {
      const leadData = {
        industry: 'Technology',
        employees: 500,
        revenue: 50000000,
        emailOpens: 5,
        websiteVisits: 10,
        demoRequested: true,
        contentDownloads: 3,
        daysSinceLastVisit: 2,
        totalWebsiteVisits: 15,
        totalTimeOnSite: 45,
        usedMobileAndDesktop: true,
        pagesVisited: 8,
        emailValidated: true,
        phoneValidated: true,
        title: 'VP of Engineering'
      };

      const score = models.predictLeadScore(leadData);

      expect(score).toBeGreaterThan(70);
    });

    test('should score low-quality lead', () => {
      const leadData = {
        industry: 'Unknown',
        employees: 1,
        revenue: 0,
        emailOpens: 0,
        websiteVisits: 0,
        demoRequested: false,
        daysSinceLastVisit: 1000,
        totalTimeOnSite: 0,
        pagesVisited: 1
      };

      const score = models.predictLeadScore(leadData);

      expect(score).toBeLessThan(30);
    });
  });

  describe('getChurnRiskLevel', () => {
    test('should classify churn risk levels', () => {
      expect(models.getChurnRiskLevel(80)).toBe('critical');
      expect(models.getChurnRiskLevel(60)).toBe('high');
      expect(models.getChurnRiskLevel(30)).toBe('medium');
      expect(models.getChurnRiskLevel(10)).toBe('low');
    });
  });

  describe('getLeadGrade', () => {
    test('should assign lead grades A-F', () => {
      expect(models.getLeadGrade(95)).toBe('A');
      expect(models.getLeadGrade(80)).toBe('B');
      expect(models.getLeadGrade(65)).toBe('C');
      expect(models.getLeadGrade(50)).toBe('D');
      expect(models.getLeadGrade(30)).toBe('F');
    });
  });

  describe('predictNextAction', () => {
    test('should recommend urgent action for critical churn', () => {
      const profile = {
        behavioral: { daysInactive: 150, errorRate: 0.2, apiCallsPerDay: 1 },
        engagement: { supportTicketsCreated: 20, emailClickRate: 0 },
        financial: { hasOutstandingInvoices: true }
      };

      const action = models.predictNextAction(profile);

      expect(action.action).toBe('immediate_outreach');
      expect(action.priority).toBe('urgent');
    });

    test('should recommend upgrade for expansion opportunity', () => {
      const features = [];
      for (let i = 0; i < 8; i++) {
        features.push({ feature: 'feature_' + i, count: 100 });
      }

      const profile = {
        behavioral: {
          daysInactive: 1,
          errorRate: 0.01,
          apiCallsPerDay: 5000,
          mostUsedFeatures: features
        },
        engagement: {
          emailClickRate: 0.5,
          netPromoterScore: 10,
          supportTicketsCreated: 0
        },
        financial: { monthlyRecurringRevenue: 5000 }
      };

      const action = models.predictNextAction(profile);

      expect(action.action).toBe('upgrade_offer');
    });
  });
});
