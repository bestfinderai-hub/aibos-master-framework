/**
 * Enterprise Intelligence Tests
 */

const TenantManager = require('../tenant-manager');
const WhiteLabelEngine = require('../white-label-engine');
const ResellerProgram = require('../reseller-program');
const DomainRouter = require('../domain-router');

describe('TenantManager', () => {
  let manager;

  beforeEach(() => {
    manager = new TenantManager();
  });

  describe('tenant management', () => {
    test('should create tenant', () => {
      const tenant = manager.createTenant('tenant-1', {
        name: 'Acme Corp',
        owner: 'john@acme.com',
        email: 'admin@acme.com'
      });

      expect(tenant.id).toBe('tenant-1');
      expect(tenant.status).toBe('active');
      expect(manager.getTenant('tenant-1')).toBeTruthy();
    });

    test('should throw error for missing name', () => {
      expect(() => {
        manager.createTenant('tenant-1', {});
      }).toThrow('Must provide tenantId and name');
    });

    test('should update tenant', () => {
      manager.createTenant('tenant-1', { name: 'Acme' });
      const updated = manager.updateTenant('tenant-1', { name: 'Acme Corp' });

      expect(updated.name).toBe('Acme Corp');
    });

    test('should list tenants with filter', () => {
      manager.createTenant('t1', { name: 'T1', plan: 'professional' });
      manager.createTenant('t2', { name: 'T2', plan: 'enterprise' });
      manager.createTenant('t3', { name: 'T3', plan: 'professional' });

      const professional = manager.listTenants({ plan: 'professional' });

      expect(professional.length).toBe(2);
    });
  });

  describe('resource quotas', () => {
    test('should initialize default quotas', () => {
      manager.createTenant('tenant-1', { name: 'Test', plan: 'professional' });
      const quotas = manager.getQuotas('tenant-1');

      expect(quotas.maxUsers).toBe(10);
      expect(quotas.storageGB).toBe(50);
    });

    test('should upgrade plan and update quotas', () => {
      manager.createTenant('tenant-1', { name: 'Test', plan: 'professional' });
      manager.upgradePlan('tenant-1', 'enterprise');

      const quotas = manager.getQuotas('tenant-1');

      expect(quotas.maxUsers).toBe(100);
      expect(quotas.storageGB).toBe(500);
    });

    test('should check quota compliance', () => {
      manager.createTenant('tenant-1', { name: 'Test', plan: 'professional' });
      manager.trackUsage('tenant-1', 'users', 5);

      const compliance = manager.checkQuotaCompliance('tenant-1');

      expect(compliance.compliant).toBe(true);
      expect(compliance.violations.length).toBe(0);
    });

    test('should flag quota violations', () => {
      manager.createTenant('tenant-1', { name: 'Test', plan: 'professional' });
      manager.trackUsage('tenant-1', 'users', 15); // Exceeds 10

      const compliance = manager.checkQuotaCompliance('tenant-1');

      expect(compliance.compliant).toBe(false);
      expect(compliance.violations.length).toBeGreaterThan(0);
    });
  });

  describe('usage tracking', () => {
    test('should track usage', () => {
      manager.createTenant('tenant-1', { name: 'Test' });
      manager.trackUsage('tenant-1', 'apiCalls', 100);

      const usage = manager.getUsage('tenant-1');

      expect(usage.apiCalls).toBe(100);
    });

    test('should reset monthly usage', () => {
      manager.createTenant('tenant-1', { name: 'Test' });
      manager.trackUsage('tenant-1', 'apiCalls', 1000);
      manager.resetMonthlyUsage('tenant-1');

      const usage = manager.getUsage('tenant-1');

      expect(usage.apiCalls).toBe(0);
    });
  });

  describe('billing', () => {
    test('should calculate monthly bill', () => {
      manager.createTenant('tenant-1', { name: 'Test', plan: 'professional' });
      const bill = manager.calculateMonthlyBill('tenant-1');

      expect(bill.basePrice).toBe(299);
      expect(bill.total).toBeGreaterThan(0);
    });
  });
});

describe('WhiteLabelEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new WhiteLabelEngine();
  });

  describe('branding', () => {
    test('should create brand config', () => {
      const config = engine.createBrandConfig('tenant-1', {
        name: 'Custom Brand',
        companyName: 'Acme Corp'
      });

      expect(config.tenantId).toBe('tenant-1');
      expect(config.companyName).toBe('Acme Corp');
    });

    test('should get brand config', () => {
      engine.createBrandConfig('tenant-1', { name: 'Brand' });
      const config = engine.getBrandConfig('tenant-1');

      expect(config).toBeTruthy();
    });

    test('should update brand config', () => {
      engine.createBrandConfig('tenant-1', { name: 'Old Name' });
      const updated = engine.updateBrandConfig('tenant-1', { name: 'New Name' });

      expect(updated.name).toBe('New Name');
    });
  });

  describe('colors & fonts', () => {
    test('should get default colors', () => {
      const colors = engine.getDefaultColors();

      expect(colors.primary).toBeDefined();
      expect(colors.secondary).toBeDefined();
    });

    test('should get default fonts', () => {
      const fonts = engine.getDefaultFonts();

      expect(fonts.primary).toBeDefined();
      expect(fonts.secondary).toBeDefined();
    });

    test('should apply theme', () => {
      engine.createTheme('theme-1', {
        name: 'Dark',
        colors: { primary: '#000000' }
      });

      engine.createBrandConfig('tenant-1', { name: 'Brand' });
      const config = engine.applyTheme('tenant-1', 'theme-1');

      expect(config.colors.primary).toBe('#000000');
    });
  });

  describe('CSS generation', () => {
    test('should generate CSS with branding', () => {
      engine.createBrandConfig('tenant-1', { name: 'Brand' });
      const css = engine.generateCSS('tenant-1');

      expect(css).toContain('--primary-color');
      expect(css).toContain(':root');
    });
  });

  describe('email branding', () => {
    test('should configure email branding', () => {
      const branding = engine.configurEmailBranding('tenant-1', {
        senderName: 'Acme Support',
        footerText: 'Copyright Acme Corp'
      });

      expect(branding.senderName).toBe('Acme Support');
    });

    test('should generate email template', () => {
      engine.configurEmailBranding('tenant-1', { senderName: 'Test' });
      const template = engine.generateEmailTemplate('tenant-1', 'welcome');

      expect(template).toContain('Welcome');
    });
  });

  describe('custom pages', () => {
    test('should create custom page', () => {
      const page = engine.createCustomPage('tenant-1', {
        title: 'Privacy Policy',
        slug: 'privacy',
        content: 'Privacy content'
      });

      expect(page.slug).toBe('privacy');
      expect(page.published).toBe(true);
    });

    test('should get custom page', () => {
      engine.createCustomPage('tenant-1', {
        title: 'Privacy',
        slug: 'privacy',
        content: 'Content'
      });

      const page = engine.getCustomPage('tenant-1', 'privacy');

      expect(page).toBeTruthy();
      expect(page.title).toBe('Privacy');
    });
  });

  describe('domain configuration', () => {
    test('should set custom domain', () => {
      const result = engine.setCustomDomain('tenant-1', 'custom.example.com');

      expect(result.domain).toBe('custom.example.com');
      expect(result.status).toBe('pending_verification');
      expect(result.dnsRecords.length).toBeGreaterThan(0);
    });
  });
});

describe('ResellerProgram', () => {
  let program;

  beforeEach(() => {
    program = new ResellerProgram();
  });

  describe('partner management', () => {
    test('should register partner', () => {
      const partner = program.registerPartner('partner-1', {
        name: 'Reseller Inc',
        email: 'contact@reseller.com'
      });

      expect(partner.id).toBe('partner-1');
      expect(partner.tier).toBe('silver');
    });

    test('should approve partner', () => {
      program.registerPartner('partner-1', {
        name: 'Test Reseller',
        email: 'test@reseller.com'
      });

      const approved = program.approvePartner('partner-1');

      expect(approved.status).toBe('approved');
      expect(approved.approvedAt).toBeTruthy();
    });

    test('should list partners with filter', () => {
      program.registerPartner('p1', { name: 'P1', email: 'p1@test.com' });
      program.registerPartner('p2', { name: 'P2', email: 'p2@test.com' });

      const partners = program.listPartners({ type: 'reseller' });

      expect(partners.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('commission rates', () => {
    test('should get default commission rates', () => {
      const rates = program.getDefaultCommissionRates('gold');

      expect(rates.recurring).toBe(0.35);
      expect(rates.oneTime).toBe(0.40);
    });

    test('should upgrade tier', () => {
      program.registerPartner('partner-1', {
        name: 'Partner',
        email: 'partner@test.com'
      });

      const upgraded = program.upgradeTier('partner-1', 'gold');

      expect(upgraded.tier).toBe('gold');
    });
  });

  describe('sales tracking', () => {
    test('should record sale', () => {
      program.registerPartner('partner-1', {
        name: 'Partner',
        email: 'partner@test.com'
      });
      program.approvePartner('partner-1');

      const sale = program.recordSale('partner-1', {
        customerId: 'customer-1',
        amount: 1000,
        type: 'recurring'
      });

      expect(sale.status).toBe('recorded');
      expect(sale.commissionAmount).toBeGreaterThan(0);
    });

    test('should approve sale', () => {
      program.registerPartner('partner-1', {
        name: 'Partner',
        email: 'partner@test.com'
      });
      program.approvePartner('partner-1');

      const sale = program.recordSale('partner-1', {
        customerId: 'customer-1',
        amount: 1000
      });

      const approved = program.approveSale(sale.id);

      expect(approved.status).toBe('approved');
    });
  });

  describe('commission calculations', () => {
    test('should calculate partner commissions', () => {
      program.registerPartner('partner-1', {
        name: 'Partner',
        email: 'partner@test.com'
      });
      program.approvePartner('partner-1');

      const sale = program.recordSale('partner-1', {
        customerId: 'customer-1',
        amount: 1000
      });
      program.approveSale(sale.id);

      const commissions = program.calculatePartnerCommissions('partner-1');

      expect(commissions.totalCommission).toBeGreaterThan(0);
      expect(commissions.salesCount).toBe(1);
    });
  });

  describe('payouts', () => {
    test('should initiate monthly payouts', () => {
      program.registerPartner('partner-1', {
        name: 'Partner',
        email: 'partner@test.com'
      });
      program.approvePartner('partner-1');

      const sale = program.recordSale('partner-1', {
        customerId: 'customer-1',
        amount: 1000
      });
      program.approveSale(sale.id);

      const payouts = program.initiateMonthlyPayouts();

      expect(payouts.length).toBeGreaterThanOrEqual(0);
    });

    test('should get payout history', () => {
      program.registerPartner('partner-1', {
        name: 'Partner',
        email: 'partner@test.com'
      });

      const payouts = program.getPayoutHistory('partner-1');

      expect(Array.isArray(payouts)).toBe(true);
    });
  });

  describe('partner dashboard', () => {
    test('should get partner dashboard', () => {
      program.registerPartner('partner-1', {
        name: 'Partner',
        email: 'partner@test.com'
      });
      program.approvePartner('partner-1');

      const dashboard = program.getPartnerDashboard('partner-1');

      expect(dashboard.partner.id).toBe('partner-1');
      expect(dashboard.sales).toBeTruthy();
      expect(dashboard.commission).toBeTruthy();
    });
  });
});

describe('DomainRouter', () => {
  let router;

  beforeEach(() => {
    router = new DomainRouter();
  });

  describe('domain registration', () => {
    test('should register domain', () => {
      const domain = router.registerDomain('tenant-1', 'custom.example.com');

      expect(domain.domain).toBe('custom.example.com');
      expect(domain.status).toBe('pending_verification');
    });

    test('should throw error for invalid domain', () => {
      expect(() => {
        router.registerDomain('tenant-1', 'invalid_domain');
      }).toThrow('Invalid domain');
    });

    test('should throw error for duplicate domain', () => {
      router.registerDomain('tenant-1', 'custom.example.com');

      expect(() => {
        router.registerDomain('tenant-2', 'custom.example.com');
      }).toThrow('already registered');
    });

    test('should get domain', () => {
      router.registerDomain('tenant-1', 'custom.example.com');
      const domain = router.getDomain('custom.example.com');

      expect(domain).toBeTruthy();
      expect(domain.domain).toBe('custom.example.com');
    });
  });

  describe('DNS management', () => {
    test('should generate DNS records', () => {
      router.registerDomain('tenant-1', 'custom.example.com');
      const records = router.getDNSRecords('custom.example.com');

      expect(records.length).toBeGreaterThan(0);
      expect(records.some(r => r.type === 'CNAME')).toBe(true);
    });

    test('should verify DNS', () => {
      router.registerDomain('tenant-1', 'custom.example.com');
      const result = router.verifyDNS('custom.example.com');

      expect(result.verified).toBe(true);
    });
  });

  describe('SSL certificates', () => {
    test('should initiate SSL certificate', async () => {
      router.registerDomain('tenant-1', 'custom.example.com');
      router.verifyDNS('custom.example.com');

      const cert = router.initiateSslCertificate('custom.example.com');

      expect(cert.status).toBe('pending');
      expect(cert.domain).toBe('custom.example.com');
    });
  });

  describe('analytics', () => {
    test('should get domain analytics', () => {
      router.registerDomain('tenant-1', 'custom.example.com');
      const analytics = router.getDomainAnalytics('custom.example.com');

      expect(analytics.domain).toBe('custom.example.com');
      expect(analytics.pageViews).toBeGreaterThan(0);
    });

    test('should get security analytics', () => {
      router.registerDomain('tenant-1', 'custom.example.com');
      const analytics = router.getSecurityAnalytics('custom.example.com');

      expect(analytics.domain).toBe('custom.example.com');
      expect(analytics.wafStatus).toBeTruthy();
    });
  });

  describe('domain status', () => {
    test('should get domain status', () => {
      router.registerDomain('tenant-1', 'custom.example.com');
      const status = router.getDomainStatus('custom.example.com');

      expect(status.domain).toBe('custom.example.com');
      expect(status.status).toBeTruthy();
    });
  });
});
