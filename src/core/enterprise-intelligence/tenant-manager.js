/**
 * Tenant Manager
 * Multi-tenant support with isolation and resource quotas
 */

class TenantManager {
  constructor() {
    this.tenants = new Map(); // tenantId -> tenant config
    this.tenantsByDomain = new Map(); // domain -> tenantId
    this.resourceQuotas = new Map(); // tenantId -> quotas
    this.usage = new Map(); // tenantId -> usage metrics
  }

  // ============================================================================
  // TENANT MANAGEMENT
  // ============================================================================

  createTenant(tenantId, config) {
    if (!tenantId || !config.name) {
      throw new Error('Must provide tenantId and name');
    }

    const tenant = {
      id: tenantId,
      name: config.name,
      type: config.type || 'standard', // standard, enterprise, reseller
      createdAt: new Date(),
      status: 'active',
      owner: config.owner,
      email: config.email,
      domain: config.domain,
      customDomain: config.customDomain,
      plan: config.plan || 'professional',
      features: this.getFeaturesByPlan(config.plan || 'professional'),
      settings: config.settings || {},
      metadata: config.metadata || {},
      dataLocation: config.dataLocation || 'us-east-1',
      isolationLevel: config.isolationLevel || 'application' // application, database, infrastructure
    };

    this.tenants.set(tenantId, tenant);

    // Index by domain
    if (config.domain) {
      this.tenantsByDomain.set(config.domain, tenantId);
    }

    // Initialize resource quotas
    this.resourceQuotas.set(tenantId, this.getDefaultQuotas(config.plan));

    // Initialize usage tracking
    this.usage.set(tenantId, {
      apiCalls: 0,
      storage: 0,
      users: 0,
      workflows: 0,
      contacts: 0,
      activeWorkflows: 0,
      monthlyActiveUsers: 0
    });

    return tenant;
  }

  getTenant(tenantId) {
    return this.tenants.get(tenantId);
  }

  getTenantByDomain(domain) {
    const tenantId = this.tenantsByDomain.get(domain);
    return tenantId ? this.tenants.get(tenantId) : null;
  }

  updateTenant(tenantId, updates) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);

    Object.assign(tenant, updates);
    tenant.updatedAt = new Date();

    // Update domain index if domain changed
    if (updates.domain && updates.domain !== tenant.domain) {
      if (tenant.domain) {
        this.tenantsByDomain.delete(tenant.domain);
      }
      this.tenantsByDomain.set(updates.domain, tenantId);
    }

    return tenant;
  }

  deleteTenant(tenantId) {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;

    // Clean up indices
    if (tenant.domain) {
      this.tenantsByDomain.delete(tenant.domain);
    }
    if (tenant.customDomain) {
      this.tenantsByDomain.delete(tenant.customDomain);
    }

    this.tenants.delete(tenantId);
    this.resourceQuotas.delete(tenantId);
    this.usage.delete(tenantId);

    return true;
  }

  listTenants(filter = {}) {
    let tenants = Array.from(this.tenants.values());

    if (filter.type) {
      tenants = tenants.filter(t => t.type === filter.type);
    }

    if (filter.plan) {
      tenants = tenants.filter(t => t.plan === filter.plan);
    }

    if (filter.status) {
      tenants = tenants.filter(t => t.status === filter.status);
    }

    if (filter.owner) {
      tenants = tenants.filter(t => t.owner === filter.owner);
    }

    return tenants;
  }

  // ============================================================================
  // RESOURCE QUOTAS
  // ============================================================================

  getDefaultQuotas(plan) {
    const quotas = {
      professional: {
        apiCallsPerMonth: 1000000,
        storageGB: 50,
        maxUsers: 10,
        maxWorkflows: 100,
        maxContacts: 10000,
        concurrentWorkflows: 10,
        customDomains: 1,
        ssoEnabled: false,
        advancedAnalytics: false,
        whitelabel: false,
        customBranding: false,
        dedicatedSupport: false
      },
      enterprise: {
        apiCallsPerMonth: 10000000,
        storageGB: 500,
        maxUsers: 100,
        maxWorkflows: 1000,
        maxContacts: 1000000,
        concurrentWorkflows: 100,
        customDomains: 5,
        ssoEnabled: true,
        advancedAnalytics: true,
        whitelabel: true,
        customBranding: true,
        dedicatedSupport: true
      },
      reseller: {
        apiCallsPerMonth: 50000000,
        storageGB: 2000,
        maxUsers: 500,
        maxWorkflows: 5000,
        maxContacts: 5000000,
        concurrentWorkflows: 500,
        customDomains: 50,
        ssoEnabled: true,
        advancedAnalytics: true,
        whitelabel: true,
        customBranding: true,
        dedicatedSupport: true,
        resellerPortal: true,
        whitelabelAPI: true
      }
    };

    return quotas[plan] || quotas.professional;
  }

  getFeaturesByPlan(plan) {
    const features = {
      professional: [
        'contacts', 'workflows', 'basic_analytics', 'api_access', 'email_integration'
      ],
      enterprise: [
        'contacts', 'workflows', 'advanced_analytics', 'api_access', 'email_integration',
        'sso', 'custom_branding', 'priority_support', 'data_export', 'api_webhooks'
      ],
      reseller: [
        'contacts', 'workflows', 'advanced_analytics', 'api_access', 'email_integration',
        'sso', 'custom_branding', 'priority_support', 'data_export', 'api_webhooks',
        'reseller_portal', 'white_label', 'sub_accounts', 'revenue_sharing'
      ]
    };

    return features[plan] || features.professional;
  }

  getQuotas(tenantId) {
    const quotas = this.resourceQuotas.get(tenantId);
    if (!quotas) throw new Error(`No quotas for tenant ${tenantId}`);

    return quotas;
  }

  updateQuotas(tenantId, updates) {
    const quotas = this.resourceQuotas.get(tenantId);
    if (!quotas) throw new Error(`No quotas for tenant ${tenantId}`);

    Object.assign(quotas, updates);
    return quotas;
  }

  upgradePlan(tenantId, newPlan) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);

    tenant.plan = newPlan;
    tenant.features = this.getFeaturesByPlan(newPlan);
    this.resourceQuotas.set(tenantId, this.getDefaultQuotas(newPlan));

    return tenant;
  }

  // ============================================================================
  // USAGE TRACKING
  // ============================================================================

  trackUsage(tenantId, metric, value = 1) {
    const usage = this.usage.get(tenantId);
    if (!usage) throw new Error(`Usage tracking not initialized for ${tenantId}`);

    if (typeof usage[metric] === 'number') {
      usage[metric] += value;
    }

    return usage;
  }

  getUsage(tenantId) {
    return this.usage.get(tenantId);
  }

  checkQuota(tenantId, metric) {
    const usage = this.usage.get(tenantId);
    const quotas = this.resourceQuotas.get(tenantId);

    if (!usage || !quotas) return null;

    // Map metric names to quota keys
    const quotaKey = this.mapMetricToQuota(metric);
    const quota = quotas[quotaKey];
    const currentUsage = usage[metric];

    if (!quota) return null;

    return {
      metric,
      usage: currentUsage,
      quota,
      percentageUsed: (currentUsage / quota) * 100,
      remaining: quota - currentUsage,
      exceeded: currentUsage > quota,
      threshold90: currentUsage > quota * 0.9,
      threshold100: currentUsage >= quota
    };
  }

  mapMetricToQuota(metric) {
    const mapping = {
      apiCalls: 'apiCallsPerMonth',
      storage: 'storageGB',
      users: 'maxUsers',
      workflows: 'maxWorkflows',
      contacts: 'maxContacts',
      activeWorkflows: 'concurrentWorkflows'
    };

    return mapping[metric] || metric;
  }

  checkQuotaCompliance(tenantId) {
    const metrics = ['apiCalls', 'storage', 'users', 'workflows', 'contacts', 'activeWorkflows'];
    const violations = [];

    for (const metric of metrics) {
      const quota = this.checkQuota(tenantId, metric);
      if (quota && quota.exceeded) {
        violations.push({
          metric,
          usage: quota.usage,
          quota: quota.quota,
          action: 'exceeded'
        });
      } else if (quota && quota.threshold90) {
        violations.push({
          metric,
          usage: quota.usage,
          quota: quota.quota,
          action: 'warning'
        });
      }
    }

    return {
      compliant: violations.filter(v => v.action === 'exceeded').length === 0,
      violations,
      timestamp: new Date()
    };
  }

  resetMonthlyUsage(tenantId) {
    const usage = this.usage.get(tenantId);
    if (!usage) return null;

    usage.apiCalls = 0;
    usage.monthlyActiveUsers = 0;

    return usage;
  }

  // ============================================================================
  // TENANT ISOLATION
  // ============================================================================

  generateTenantContext(tenantId) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);

    return {
      tenantId,
      tenantName: tenant.name,
      userId: null,
      userRole: 'admin',
      permissions: this.getTenantPermissions(tenantId),
      dataLocation: tenant.dataLocation,
      isolationLevel: tenant.isolationLevel,
      timestamp: new Date()
    };
  }

  getTenantPermissions(tenantId) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return [];

    const basePermissions = [
      'read:contacts',
      'write:contacts',
      'read:workflows',
      'write:workflows'
    ];

    const enterprisePermissions = [
      'read:analytics',
      'write:analytics',
      'manage:team',
      'manage:billing',
      'manage:integrations',
      'manage:api_keys',
      'manage:webhooks'
    ];

    const resellerPermissions = [
      'create:sub_tenant',
      'manage:sub_tenant',
      'manage:reseller_program',
      'view:revenue',
      'manage:branding'
    ];

    let permissions = basePermissions;

    if (tenant.type === 'enterprise' || tenant.type === 'reseller') {
      permissions.push(...enterprisePermissions);
    }

    if (tenant.type === 'reseller') {
      permissions.push(...resellerPermissions);
    }

    return permissions;
  }

  validateTenantContext(tenantId, requiredPermissions = []) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) return false;

    if (tenant.status !== 'active') return false;

    if (requiredPermissions.length === 0) return true;

    const permissions = this.getTenantPermissions(tenantId);
    return requiredPermissions.every(perm => permissions.includes(perm));
  }

  // ============================================================================
  // BILLING & REVENUE
  // ============================================================================

  calculateMonthlyBill(tenantId) {
    const tenant = this.getTenant(tenantId);
    const quotas = this.getQuotas(tenantId);

    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);

    const basePrices = {
      professional: 299,
      enterprise: 999,
      reseller: 2999
    };

    const basePrice = basePrices[tenant.plan] || basePrices.professional;

    // Overage charges
    const usage = this.getUsage(tenantId);
    let overageCharges = 0;

    if (usage.apiCalls > quotas.apiCallsPerMonth) {
      const overageApiCalls = usage.apiCalls - quotas.apiCallsPerMonth;
      overageCharges += (overageApiCalls / 1000000) * 100; // $100 per 1M calls
    }

    if (usage.storage > quotas.storageGB) {
      const overageStorage = usage.storage - quotas.storageGB;
      overageCharges += overageStorage * 10; // $10 per GB
    }

    if (usage.users > quotas.maxUsers) {
      const overageUsers = usage.users - quotas.maxUsers;
      overageCharges += overageUsers * 50; // $50 per user
    }

    const total = basePrice + overageCharges;

    return {
      tenantId,
      basePrice,
      overageCharges,
      total,
      currency: 'USD',
      billingPeriod: 'monthly',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  getTenantStats() {
    const tenants = Array.from(this.tenants.values());

    return {
      totalTenants: tenants.length,
      byType: {
        standard: tenants.filter(t => t.type === 'standard').length,
        enterprise: tenants.filter(t => t.type === 'enterprise').length,
        reseller: tenants.filter(t => t.type === 'reseller').length
      },
      byPlan: {
        professional: tenants.filter(t => t.plan === 'professional').length,
        enterprise: tenants.filter(t => t.plan === 'enterprise').length,
        reseller: tenants.filter(t => t.plan === 'reseller').length
      },
      activeTenants: tenants.filter(t => t.status === 'active').length,
      churnedTenants: tenants.filter(t => t.status === 'churned').length
    };
  }

  exportTenantConfig(tenantId) {
    const tenant = this.getTenant(tenantId);
    const quotas = this.getQuotas(tenantId);

    return {
      tenant,
      quotas,
      timestamp: new Date()
    };
  }

  importTenantConfig(config) {
    const tenant = this.createTenant(config.tenant.id, config.tenant);
    this.resourceQuotas.set(config.tenant.id, config.quotas);
    return tenant;
  }
}

module.exports = TenantManager;
