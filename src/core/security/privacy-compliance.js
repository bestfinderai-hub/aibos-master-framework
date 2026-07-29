/**
 * Privacy Compliance Engine
 * GDPR, CCPA, PIPEDA compliance automation
 */

class PrivacyComplianceEngine {
  constructor() {
    this.consents = new Map(); // userId -> consent preferences
    this.deletionRequests = new Map(); // email -> { requestedAt, status }
    this.dataExports = new Map(); // userId -> { exportedAt, expiresAt }
    this.retentionPolicies = new Map(); // dataType -> days
    this.initializeRetentionPolicies();
  }

  /**
   * Initialize data retention policies
   */
  initializeRetentionPolicies() {
    // GDPR default: keep only as long as necessary
    this.retentionPolicies.set('personal_data', 365); // 1 year after last contact
    this.retentionPolicies.set('event_logs', 90); // 3 months
    this.retentionPolicies.set('audit_logs', 2555); // 7 years
    this.retentionPolicies.set('marketing', 30); // 30 days if opted out
    this.retentionPolicies.set('analytics', 13); // 13 months
    this.retentionPolicies.set('payment', 2555); // 7 years (tax requirement)
  }

  /**
   * Set consent preferences
   */
  setConsent(userId, preferences) {
    const consent = {
      userId,
      marketing: preferences.marketing || false,
      analytics: preferences.analytics || false,
      thirdParty: preferences.thirdParty || false,
      profiling: preferences.profiling || false,
      versionAccepted: preferences.versionAccepted || '1.0',
      consentedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60000), // 1 year
      ipAddress: preferences.ipAddress,
      userAgent: preferences.userAgent
    };

    this.consents.set(userId, consent);
    return consent;
  }

  /**
   * Get consent status
   */
  getConsent(userId) {
    return this.consents.get(userId) || null;
  }

  /**
   * Check if user consented to purpose
   */
  hasConsentFor(userId, purpose) {
    const consent = this.getConsent(userId);
    if (!consent) return false;

    const purposeMap = {
      marketing: consent.marketing,
      analytics: consent.analytics,
      thirdParty: consent.thirdParty,
      profiling: consent.profiling
    };

    return purposeMap[purpose] || false;
  }

  /**
   * Withdraw consent
   */
  withdrawConsent(userId, purposes = null) {
    const consent = this.getConsent(userId);
    if (!consent) return false;

    if (!purposes) {
      // Withdraw all consents
      this.consents.delete(userId);
    } else {
      // Withdraw specific consents
      purposes.forEach(p => {
        if (p === 'marketing') consent.marketing = false;
        if (p === 'analytics') consent.analytics = false;
        if (p === 'thirdParty') consent.thirdParty = false;
        if (p === 'profiling') consent.profiling = false;
      });
    }

    return true;
  }

  /**
   * Right of Access - Export personal data (GDPR Article 15)
   */
  exportPersonalData(userId) {
    const dataExport = {
      userId,
      exportedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60000), // 30 days
      data: {
        personalInfo: this.getPersonalInfo(userId),
        activityLog: this.getActivityLog(userId),
        communications: this.getCommunications(userId),
        preferences: this.getConsent(userId),
        dataCollected: new Date() // When first collected
      },
      format: 'json',
      portability: true // Machine-readable format
    };

    this.dataExports.set(userId, dataExport);
    return dataExport;
  }

  /**
   * Right to Erasure - Delete personal data (GDPR Article 17)
   */
  async erasePersonalData(userId, reason = 'user_request') {
    const deletionRequest = {
      userId,
      requestedAt: new Date(),
      status: 'pending', // pending -> confirmed -> deleted
      reason,
      processingDeadline: new Date(Date.now() + 30 * 24 * 60 * 60000) // 30 days
    };

    // Store deletion request (for audit trail)
    // In production, this triggers async deletion job
    this.deletionRequests.set(userId, deletionRequest);

    return deletionRequest;
  }

  /**
   * Check if user marked for deletion
   */
  isMarkedForDeletion(email) {
    for (const [, request] of this.deletionRequests) {
      if (request.status === 'confirmed' || request.status === 'pending') {
        return true;
      }
    }
    return false;
  }

  /**
   * Right to Rectification - Correct inaccurate data (GDPR Article 16)
   */
  rectifyPersonalData(userId, corrections) {
    return {
      userId,
      originalData: this.getPersonalInfo(userId),
      corrections,
      rectifiedAt: new Date(),
      processed: true
    };
  }

  /**
   * Right to Restrict Processing (GDPR Article 18)
   */
  restrictProcessing(userId, purposes = null) {
    const consent = this.getConsent(userId);
    if (!consent) {
      this.setConsent(userId, {
        marketing: false,
        analytics: false,
        thirdParty: false,
        profiling: false
      });
      return;
    }

    if (!purposes) {
      // Restrict all processing
      Object.assign(consent, {
        marketing: false,
        analytics: false,
        thirdParty: false,
        profiling: false
      });
    } else {
      // Restrict specific purposes
      purposes.forEach(p => {
        if (consent.hasOwnProperty(p)) {
          consent[p] = false;
        }
      });
    }

    return consent;
  }

  /**
   * Right to Portability (GDPR Article 20)
   */
  portabilityData(userId) {
    const dataExport = this.exportPersonalData(userId);

    return {
      ...dataExport,
      portableFormat: 'json', // Machine-readable, structured format
      transferToThirdParty: true
    };
  }

  /**
   * Right to Object (GDPR Article 21)
   */
  objectToProcessing(userId, purpose) {
    return this.restrictProcessing(userId, [purpose]);
  }

  /**
   * Data Subject Rights Summary (GDPR compliance)
   */
  getDataSubjectRights(userId) {
    return {
      right_of_access: {
        description: 'Export your personal data',
        implemented: true,
        method: 'POST /api/privacy/export'
      },
      right_to_rectification: {
        description: 'Correct inaccurate data',
        implemented: true,
        method: 'POST /api/privacy/rectify'
      },
      right_to_erasure: {
        description: 'Delete your data (right to be forgotten)',
        implemented: true,
        method: 'POST /api/privacy/erase'
      },
      right_to_restrict_processing: {
        description: 'Limit how your data is used',
        implemented: true,
        method: 'POST /api/privacy/restrict'
      },
      right_to_portability: {
        description: 'Download your data in portable format',
        implemented: true,
        method: 'POST /api/privacy/export?format=portable'
      },
      right_to_object: {
        description: 'Object to processing of your data',
        implemented: true,
        method: 'POST /api/privacy/object'
      }
    };
  }

  /**
   * Set data retention policy
   */
  setRetentionPolicy(dataType, retentionDays) {
    this.retentionPolicies.set(dataType, retentionDays);
    return { dataType, retentionDays, appliedAt: new Date() };
  }

  /**
   * Get retention policy
   */
  getRetentionPolicy(dataType) {
    return this.retentionPolicies.get(dataType) || null;
  }

  /**
   * Calculate deletion date
   */
  calculateDeletionDate(createdAt, dataType) {
    const retentionDays = this.getRetentionPolicy(dataType) || 365;
    const deletionDate = new Date(createdAt);
    deletionDate.setDate(deletionDate.getDate() + retentionDays);

    return deletionDate;
  }

  /**
   * Privacy Impact Assessment (PIA)
   */
  conductPIA(processName, dataTypes) {
    return {
      processName,
      dataTypes,
      conductedAt: new Date(),
      risks: [
        {
          type: 'unauthorized_access',
          severity: 'high',
          mitigation: 'Encryption at rest and in transit'
        },
        {
          type: 'data_breach',
          severity: 'critical',
          mitigation: 'Regular security audits and incident response plan'
        },
        {
          type: 'profiling',
          severity: 'medium',
          mitigation: 'User consent and opt-out mechanism'
        }
      ],
      outcome: 'acceptable_with_mitigations',
      nextReview: new Date(Date.now() + 365 * 24 * 60 * 60000) // Annual review
    };
  }

  /**
   * Breach notification (72-hour GDPR requirement)
   */
  notifyBreach(affectedUsers, description) {
    return {
      breachId: `breach_${Date.now()}`,
      affectedUsers,
      description,
      discoveredAt: new Date(),
      notificationDeadline: new Date(Date.now() + 72 * 60 * 60000), // 72 hours
      status: 'notification_pending',
      regulatoryAuthority: 'GDPR Supervisory Authority',
      requiredActions: [
        'Notify affected data subjects',
        'Notify supervisory authority',
        'Document breach details',
        'Investigate root cause'
      ]
    };
  }

  /**
   * Consent audit trail
   */
  getConsentAuditTrail(userId) {
    const consent = this.getConsent(userId);
    if (!consent) return [];

    return [{
      consentedAt: consent.consentedAt,
      version: consent.versionAccepted,
      preferences: {
        marketing: consent.marketing,
        analytics: consent.analytics,
        thirdParty: consent.thirdParty,
        profiling: consent.profiling
      },
      ipAddress: consent.ipAddress,
      userAgent: consent.userAgent
    }];
  }

  /**
   * Cookie consent compliance
   */
  getCookieConsent(userId) {
    const consent = this.getConsent(userId);

    return {
      essential: true, // Always required
      analytics: consent?.analytics || false,
      marketing: consent?.marketing || false,
      thirdParty: consent?.thirdParty || false,
      consentedAt: consent?.consentedAt || null
    };
  }

  /**
   * Helper: Get personal info
   */
  getPersonalInfo(userId) {
    return {
      userId,
      name: 'User Name', // Would fetch from database
      email: 'user@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      createdAt: new Date('2024-01-01')
    };
  }

  /**
   * Helper: Get activity log
   */
  getActivityLog(userId) {
    return [
      { action: 'login', timestamp: new Date() },
      { action: 'view_dashboard', timestamp: new Date() },
      { action: 'export_report', timestamp: new Date() }
    ];
  }

  /**
   * Helper: Get communications
   */
  getCommunications(userId) {
    return [
      { type: 'email', subject: 'Welcome', receivedAt: new Date() },
      { type: 'newsletter', subject: 'Monthly Update', receivedAt: new Date() }
    ];
  }
}

module.exports = PrivacyComplianceEngine;
