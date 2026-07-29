/**
 * White Label Engine
 * Branding customization and white-label deployments
 */

class WhiteLabelEngine {
  constructor() {
    this.brandConfigs = new Map(); // tenantId -> branding config
    this.themes = new Map(); // themeId -> theme definition
    this.customPages = new Map(); // tenantId -> pages
  }

  // ============================================================================
  // BRANDING CONFIGURATION
  // ============================================================================

  createBrandConfig(tenantId, config) {
    const brandConfig = {
      id: this.generateId('brand'),
      tenantId,
      name: config.name || 'Default',
      logo: config.logo, // URL to logo
      favicon: config.favicon, // URL to favicon
      companyName: config.companyName,
      companyLogo: config.companyLogo,
      colors: config.colors || this.getDefaultColors(),
      fonts: config.fonts || this.getDefaultFonts(),
      emailBranding: config.emailBranding || {},
      helpText: config.helpText || {},
      customDomain: config.customDomain,
      sslCertificate: config.sslCertificate,
      customization: {
        hideAIBOSBranding: config.hideAIBOSBranding || false,
        customFooter: config.customFooter,
        customHeader: config.customHeader,
        privacyPolicyUrl: config.privacyPolicyUrl,
        termsOfServiceUrl: config.termsOfServiceUrl
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };

    this.brandConfigs.set(tenantId, brandConfig);
    return brandConfig;
  }

  getBrandConfig(tenantId) {
    return this.brandConfigs.get(tenantId);
  }

  updateBrandConfig(tenantId, updates) {
    const config = this.brandConfigs.get(tenantId);
    if (!config) throw new Error(`Brand config not found for ${tenantId}`);

    Object.assign(config, updates);
    config.updatedAt = new Date();

    return config;
  }

  // ============================================================================
  // COLOR & THEME MANAGEMENT
  // ============================================================================

  getDefaultColors() {
    return {
      primary: '#007AFF', // iOS blue
      secondary: '#5AC8FA', // Light blue
      accent: '#FF2D55', // Red
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E5E5EA',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30'
    };
  }

  getDefaultFonts() {
    return {
      primary: 'Inter, system-ui, -apple-system, sans-serif',
      secondary: 'Menlo, Monaco, monospace'
    };
  }

  createTheme(themeId, definition) {
    const theme = {
      id: themeId,
      name: definition.name,
      colors: definition.colors || this.getDefaultColors(),
      fonts: definition.fonts || this.getDefaultFonts(),
      components: definition.components || {},
      createdAt: new Date(),
      public: definition.public || false
    };

    this.themes.set(themeId, theme);
    return theme;
  }

  applyTheme(tenantId, themeId) {
    const theme = this.themes.get(themeId);
    if (!theme) throw new Error(`Theme ${themeId} not found`);

    const config = this.brandConfigs.get(tenantId) || {};
    config.colors = theme.colors;
    config.fonts = theme.fonts;

    this.brandConfigs.set(tenantId, config);
    return config;
  }

  getPublicThemes() {
    return Array.from(this.themes.values()).filter(t => t.public);
  }

  generateCSS(tenantId) {
    const config = this.getBrandConfig(tenantId);
    if (!config) return this.getDefaultCSS();

    const { colors, fonts } = config;

    return `
:root {
  --primary-color: ${colors.primary};
  --secondary-color: ${colors.secondary};
  --accent-color: ${colors.accent};
  --background-color: ${colors.background};
  --text-color: ${colors.text};
  --text-secondary-color: ${colors.textSecondary};
  --border-color: ${colors.border};
  --success-color: ${colors.success};
  --warning-color: ${colors.warning};
  --error-color: ${colors.error};
  --font-family-primary: ${fonts.primary};
  --font-family-secondary: ${fonts.secondary};
}

body {
  font-family: var(--font-family-primary);
  color: var(--text-color);
  background-color: var(--background-color);
}

a {
  color: var(--primary-color);
}

a:hover {
  color: var(--secondary-color);
}

button, .btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-family: var(--font-family-primary);
}

button:hover, .btn:hover {
  background-color: var(--secondary-color);
}

.btn-secondary {
  background-color: var(--secondary-color);
}

.btn-danger {
  background-color: var(--error-color);
}

input, textarea, select {
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  font-family: var(--font-family-primary);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.alert-success {
  background-color: var(--success-color);
  color: white;
}

.alert-warning {
  background-color: var(--warning-color);
  color: white;
}

.alert-error {
  background-color: var(--error-color);
  color: white;
}
    `;
  }

  getDefaultCSS() {
    return this.generateCSS(null);
  }

  // ============================================================================
  // EMAIL BRANDING
  // ============================================================================

  configurEmailBranding(tenantId, emailConfig) {
    const config = this.getBrandConfig(tenantId) || {};

    config.emailBranding = {
      headerImage: emailConfig.headerImage,
      footerText: emailConfig.footerText,
      footerLogo: emailConfig.footerLogo,
      senderName: emailConfig.senderName || 'AIBOS',
      senderEmail: emailConfig.senderEmail,
      replyTo: emailConfig.replyTo,
      unsubscribeText: emailConfig.unsubscribeText,
      trackingPixel: emailConfig.trackingPixel || true
    };

    this.brandConfigs.set(tenantId, config);
    return config.emailBranding;
  }

  generateEmailTemplate(tenantId, templateType) {
    const config = this.getBrandConfig(tenantId) || {};
    const branding = config.emailBranding || {};

    const templates = {
      welcome: this.generateWelcomeEmail(branding),
      notification: this.generateNotificationEmail(branding),
      digest: this.generateDigestEmail(branding),
      alert: this.generateAlertEmail(branding)
    };

    return templates[templateType] || templates.notification;
  }

  generateWelcomeEmail(branding) {
    return `
<html>
  <body style="font-family: ${branding.fontFamily || 'Arial, sans-serif'}">
    ${branding.headerImage ? `<img src="${branding.headerImage}" style="max-width: 100%" />` : ''}
    <h1>Welcome to ${branding.senderName}</h1>
    <p>Thank you for joining us.</p>
    <a href="[ACTIVATION_LINK]" style="background: #007AFF; color: white; padding: 10px 20px;">Get Started</a>
    <hr />
    <footer>${branding.footerText}</footer>
  </body>
</html>
    `;
  }

  generateNotificationEmail(branding) {
    return `
<html>
  <body style="font-family: ${branding.fontFamily || 'Arial, sans-serif'}">
    <p>Hi [USER_NAME],</p>
    <p>[NOTIFICATION_CONTENT]</p>
    <footer>${branding.footerText}</footer>
  </body>
</html>
    `;
  }

  generateDigestEmail(branding) {
    return `
<html>
  <body style="font-family: ${branding.fontFamily || 'Arial, sans-serif'}">
    <p>Hi [USER_NAME],</p>
    <p>Here's your weekly digest:</p>
    [DIGEST_CONTENT]
    <footer>${branding.footerText}</footer>
  </body>
</html>
    `;
  }

  generateAlertEmail(branding) {
    return `
<html>
  <body style="font-family: ${branding.fontFamily || 'Arial, sans-serif'}; background: #FFF3CD;">
    <p>Alert: [ALERT_MESSAGE]</p>
    <p><a href="[ACTION_URL]">Take Action</a></p>
    <footer>${branding.footerText}</footer>
  </body>
</html>
    `;
  }

  // ============================================================================
  // CUSTOM PAGES
  // ============================================================================

  createCustomPage(tenantId, pageConfig) {
    const pageId = this.generateId('page');
    const page = {
      id: pageId,
      tenantId,
      title: pageConfig.title,
      slug: pageConfig.slug || pageConfig.title.toLowerCase().replace(/\s+/g, '-'),
      content: pageConfig.content,
      type: pageConfig.type || 'custom', // custom, privacy, terms, help
      published: pageConfig.published !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!this.customPages.has(tenantId)) {
      this.customPages.set(tenantId, []);
    }

    this.customPages.get(tenantId).push(page);
    return page;
  }

  getCustomPage(tenantId, slug) {
    const pages = this.customPages.get(tenantId) || [];
    return pages.find(p => p.slug === slug && p.published);
  }

  updateCustomPage(tenantId, pageId, updates) {
    const pages = this.customPages.get(tenantId) || [];
    const page = pages.find(p => p.id === pageId);

    if (!page) throw new Error(`Page ${pageId} not found`);

    Object.assign(page, updates);
    page.updatedAt = new Date();

    return page;
  }

  listCustomPages(tenantId, publishedOnly = true) {
    let pages = this.customPages.get(tenantId) || [];

    if (publishedOnly) {
      pages = pages.filter(p => p.published);
    }

    return pages;
  }

  // ============================================================================
  // DOMAIN CONFIGURATION
  // ============================================================================

  setCustomDomain(tenantId, domain, sslConfig = null) {
    const config = this.getBrandConfig(tenantId) || {};

    config.customDomain = domain;
    config.sslCertificate = sslConfig || {
      provider: 'letsencrypt',
      autoRenew: true,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    this.brandConfigs.set(tenantId, config);

    return {
      domain,
      status: 'pending_verification',
      dnsRecords: this.generateDNSRecords(domain),
      ssl: config.sslCertificate
    };
  }

  generateDNSRecords(domain) {
    return [
      {
        type: 'CNAME',
        name: domain,
        value: 'app.aibos.io',
        ttl: 3600
      },
      {
        type: 'TXT',
        name: `_acme-challenge.${domain}`,
        value: `verification-${Math.random().toString(36).substr(2, 9)}`,
        ttl: 300
      }
    ];
  }

  verifyCustomDomain(tenantId, domain) {
    const config = this.getBrandConfig(tenantId);

    if (!config || config.customDomain !== domain) {
      return {
        verified: false,
        error: 'Domain not configured'
      };
    }

    return {
      verified: true,
      domain,
      ssl: 'valid',
      expiryDate: config.sslCertificate?.expiryDate
    };
  }

  // ============================================================================
  // HELP & DOCUMENTATION
  // ============================================================================

  configureHelpText(tenantId, helpTexts) {
    const config = this.getBrandConfig(tenantId) || {};

    config.helpText = {
      appName: helpTexts.appName || 'AIBOS',
      supportEmail: helpTexts.supportEmail,
      supportUrl: helpTexts.supportUrl,
      documentationUrl: helpTexts.documentationUrl,
      helpCenterUrl: helpTexts.helpCenterUrl,
      contactUsUrl: helpTexts.contactUsUrl,
      feedbackUrl: helpTexts.feedbackUrl
    };

    this.brandConfigs.set(tenantId, config);
    return config.helpText;
  }

  // ============================================================================
  // EXPORT & IMPORT
  // ============================================================================

  exportBrandConfig(tenantId) {
    const config = this.getBrandConfig(tenantId);
    const pages = this.customPages.get(tenantId) || [];

    return {
      config,
      pages,
      exportedAt: new Date()
    };
  }

  importBrandConfig(tenantId, exportedData) {
    this.createBrandConfig(tenantId, exportedData.config);

    if (exportedData.pages) {
      for (const page of exportedData.pages) {
        this.createCustomPage(tenantId, page);
      }
    }

    return this.getBrandConfig(tenantId);
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getBrandingPreview(tenantId) {
    const config = this.getBrandConfig(tenantId) || this.getDefaultBranding();

    return {
      logoUrl: config.logo,
      companyName: config.companyName || 'My Company',
      colors: config.colors,
      fonts: config.fonts,
      customDomain: config.customDomain,
      hideAIBOSBranding: config.customization?.hideAIBOSBranding || false
    };
  }

  getDefaultBranding() {
    return {
      colors: this.getDefaultColors(),
      fonts: this.getDefaultFonts(),
      customization: {
        hideAIBOSBranding: false
      }
    };
  }
}

module.exports = WhiteLabelEngine;
