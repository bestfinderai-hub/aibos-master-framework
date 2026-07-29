/**
 * Security & Compliance Tests
 */

const EncryptionService = require('../encryption-service');
const RBACEngine = require('../rbac-engine');
const AuditLogger = require('../audit-logger');
const PrivacyComplianceEngine = require('../privacy-compliance');

describe('EncryptionService', () => {
  let encryption;

  beforeEach(() => {
    encryption = new EncryptionService();
  });

  describe('encrypt/decrypt', () => {
    test('should encrypt and decrypt data', () => {
      const original = 'user@example.com';
      const encrypted = encryption.encrypt(original, 'pii');

      expect(encrypted.data).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();

      const decrypted = encryption.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });

    test('should handle null data', () => {
      const encrypted = encryption.encrypt(null);
      expect(encrypted).toBeNull();
    });

    test('should fail gracefully with invalid encrypted object', () => {
      const invalid = {
        data: 'invalid_hex',
        iv: 'invalid_iv',
        authTag: 'invalid_tag',
        fieldType: 'pii'
      };

      const result = encryption.decrypt(invalid);
      expect(result).toBeNull();
    });

    test('should identify sensitive fields', () => {
      expect(encryption.shouldEncrypt('email')).toBe(true);
      expect(encryption.shouldEncrypt('phone')).toBe(true);
      expect(encryption.shouldEncrypt('credit_card')).toBe(true);
      expect(encryption.shouldEncrypt('name')).toBe(false);
    });
  });

  describe('batch operations', () => {
    test('should encrypt batch of records', () => {
      const records = [
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' }
      ];

      const encrypted = encryption.encryptBatch(records, ['email']);

      expect(encrypted).toHaveLength(2);
      expect(encrypted[0].email.data).toBeDefined();
      expect(encrypted[1].email.data).toBeDefined();
    });

    test('should decrypt batch of records', () => {
      const records = [
        { name: 'John', email: 'john@example.com' }
      ];

      const encrypted = encryption.encryptBatch(records, ['email']);
      const decrypted = encryption.decryptBatch(encrypted, ['email']);

      expect(decrypted[0].email).toBe('john@example.com');
    });
  });

  describe('password hashing', () => {
    test('should hash password', () => {
      const password = 'securePassword123';
      const hashed = encryption.hashPassword(password);

      expect(hashed.hash).toBeDefined();
      expect(hashed.salt).toBeDefined();
      expect(hashed.algorithm).toBe('pbkdf2_sha256');
    });

    test('should verify correct password', () => {
      const password = 'securePassword123';
      const hashed = encryption.hashPassword(password);
      const isValid = encryption.verifyPassword(password, hashed);

      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', () => {
      const password = 'securePassword123';
      const hashed = encryption.hashPassword(password);
      const isValid = encryption.verifyPassword('wrongPassword', hashed);

      expect(isValid).toBe(false);
    });
  });

  describe('token generation', () => {
    test('should generate secure random tokens', () => {
      const token1 = encryption.generateToken();
      const token2 = encryption.generateToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes * 2 (hex)
    });

    test('should generate CSRF tokens', () => {
      const csrf = encryption.generateCSRFToken();

      expect(csrf.token).toBeDefined();
      expect(csrf.createdAt).toBeDefined();
      expect(csrf.expiresAt).toBeDefined();
      expect(csrf.expiresAt > csrf.createdAt).toBe(true);
    });

    test('should verify valid CSRF token', () => {
      const csrf = encryption.generateCSRFToken();
      const isValid = encryption.verifyCSRFToken(csrf.token, csrf);

      expect(isValid).toBe(true);
    });

    test('should reject invalid CSRF token', () => {
      const csrf = encryption.generateCSRFToken();
      const isValid = encryption.verifyCSRFToken('invalid_token', csrf);

      expect(isValid).toBe(false);
    });

    test('should reject expired CSRF token', () => {
      const csrf = encryption.generateCSRFToken();
      csrf.expiresAt = new Date(Date.now() - 1000); // Expired
      const isValid = encryption.verifyCSRFToken(csrf.token, csrf);

      expect(isValid).toBe(false);
    });
  });

  describe('key rotation', () => {
    test('should rotate encryption keys', () => {
      const rotation = encryption.rotateKeys();

      expect(rotation.rotatedAt).toBeDefined();
      expect(rotation.keyId).toBeDefined();
    });
  });
});

describe('RBACEngine', () => {
  let rbac;

  beforeEach(() => {
    rbac = new RBACEngine();
  });

  describe('roles and permissions', () => {
    test('should assign roles to users', () => {
      rbac.assignRole('user_123', 'manager', 'tenant_1');
      const role = rbac.getUserRole('user_123');

      expect(role.role).toBe('manager');
      expect(role.tenantId).toBe('tenant_1');
    });

    test('should check permissions', () => {
      rbac.assignRole('user_123', 'admin', 'tenant_1');

      expect(rbac.hasPermission('user_123', 'read:dashboard')).toBe(true);
      expect(rbac.hasPermission('user_123', 'write:users')).toBe(true);
    });

    test('should handle wildcard permissions', () => {
      rbac.assignRole('user_123', 'user', 'tenant_1');

      // User has read:contacts but not read:*
      expect(rbac.hasPermission('user_123', 'read:contacts')).toBe(true);
    });

    test('should deny access to unassigned users', () => {
      expect(rbac.hasPermission('user_unknown', 'read:dashboard')).toBe(false);
    });

    test('should handle multiple permission checks (AND)', () => {
      rbac.assignRole('user_123', 'admin', 'tenant_1');

      const result = rbac.hasAllPermissions('user_123', [
        'read:dashboard',
        'write:users'
      ]);

      expect(result).toBe(true);
    });

    test('should handle multiple permission checks (OR)', () => {
      rbac.assignRole('user_123', 'user', 'tenant_1');

      const result = rbac.hasAnyPermission('user_123', [
        'manage:users',
        'read:contacts'
      ]);

      expect(result).toBe(true);
    });
  });

  describe('resource-level access', () => {
    test('should grant resource access', () => {
      rbac.assignRole('user_123', 'user', 'tenant_1');
      rbac.grantResourceAccess('user_123', 'resource_456', ['read', 'write']);

      const hasAccess = rbac.hasResourceAccess('user_123', 'resource_456', 'read');
      expect(hasAccess).toBe(true);
    });

    test('should revoke resource access', () => {
      rbac.assignRole('user_123', 'user', 'tenant_1');
      rbac.grantResourceAccess('user_123', 'resource_456', ['read', 'write']);
      rbac.revokeResourceAccess('user_123', 'resource_456', ['write']);

      expect(rbac.hasResourceAccess('user_123', 'resource_456', 'write')).toBe(false);
      expect(rbac.hasResourceAccess('user_123', 'resource_456', 'read')).toBe(true);
    });
  });

  describe('tenant isolation', () => {
    test('should enforce tenant isolation', () => {
      rbac.assignRole('user_123', 'manager', 'tenant_1');
      rbac.assignRole('user_456', 'manager', 'tenant_2');

      const tenant1 = rbac.getTenantAccess('user_123');
      const tenant2 = rbac.getTenantAccess('user_456');

      expect(tenant1).toBe('tenant_1');
      expect(tenant2).toBe('tenant_2');
      expect(tenant1).not.toBe(tenant2);
    });
  });

  describe('custom roles', () => {
    test('should create custom roles', () => {
      rbac.createCustomRole('analyst', ['read:reports', 'read:data'], 60);
      rbac.assignRole('user_123', 'analyst', 'tenant_1');

      expect(rbac.hasPermission('user_123', 'read:reports')).toBe(true);
      expect(rbac.hasPermission('user_123', 'write:reports')).toBe(false);
    });

    test('should list all roles', () => {
      const roles = rbac.listRoles();

      expect(roles.length).toBeGreaterThanOrEqual(4); // admin, manager, user, guest
      expect(roles.map(r => r.name)).toContain('admin');
    });
  });
});

describe('AuditLogger', () => {
  let auditor;

  beforeEach(() => {
    auditor = new AuditLogger();
  });

  describe('logging', () => {
    test('should log actions', async () => {
      const entry = await auditor.log({
        action: 'data:create',
        userId: 'user_123',
        resourceType: 'contact',
        resourceId: 'contact_456'
      });

      expect(entry.id).toBeDefined();
      expect(entry.timestamp).toBeDefined();
      expect(entry.action).toBe('data:create');
    });

    test('should log authentication events', async () => {
      const entry = await auditor.logAuth('user_123', 'login', '192.168.1.1', true);

      expect(entry.action).toBe('auth:login');
      expect(entry.status).toBe('success');
    });

    test('should log security incidents', async () => {
      const entry = await auditor.logSecurityIncident('breach', 'critical', {
        affectedRecords: 1000
      });

      expect(entry.action).toBe('security:breach');
      expect(entry.severity).toBe('critical');
    });
  });

  describe('querying', () => {
    test('should query logs by userId', async () => {
      await auditor.log({
        action: 'data:create',
        userId: 'user_123',
        resourceType: 'contact'
      });

      const results = auditor.query({ userId: 'user_123' });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].userId).toBe('user_123');
    });

    test('should query logs by action pattern', async () => {
      await auditor.log({ action: 'data:create', userId: 'user_123' });
      await auditor.log({ action: 'data:delete', userId: 'user_456' });

      const results = auditor.query({ action: 'data:*' });

      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    test('should search logs', async () => {
      await auditor.log({
        action: 'data:create',
        userId: 'user_123',
        resourceId: 'contact_456'
      });

      const results = auditor.search('contact_456');

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('compliance reporting', () => {
    test('should export logs as CSV', async () => {
      await auditor.log({ action: 'data:create', userId: 'user_123' });

      const csv = auditor.export('2024-01-01', '2026-12-31', 'csv');

      expect(csv).toContain('action');
      expect(csv).toContain('userId');
    });

    test('should generate audit summary', async () => {
      await auditor.log({ action: 'data:create', userId: 'user_123' });
      await auditor.log({ action: 'data:delete', userId: 'user_456' });

      const summary = auditor.getSummary('2024-01-01', '2026-12-31');

      expect(summary.totalEvents).toBeGreaterThanOrEqual(2);
      expect(summary.byAction['data:create']).toBeGreaterThanOrEqual(1);
    });
  });

  describe('anomaly detection', () => {
    test('should detect multiple failed logins', async () => {
      for (let i = 0; i < 5; i++) {
        await auditor.logAuth('user_123', 'login', '192.168.1.1', false);
      }

      const anomalies = auditor.detectAnomalies('user_123');

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies.some(a => a.type === 'multiple_failed_logins')).toBe(true);
    });
  });
});

describe('PrivacyComplianceEngine', () => {
  let privacy;

  beforeEach(() => {
    privacy = new PrivacyComplianceEngine();
  });

  describe('consent management', () => {
    test('should set consent preferences', () => {
      privacy.setConsent('user_123', {
        marketing: true,
        analytics: true,
        thirdParty: false
      });

      const consent = privacy.getConsent('user_123');

      expect(consent.marketing).toBe(true);
      expect(consent.analytics).toBe(true);
      expect(consent.thirdParty).toBe(false);
    });

    test('should withdraw consent', () => {
      privacy.setConsent('user_123', {
        marketing: true,
        analytics: true
      });

      privacy.withdrawConsent('user_123', ['marketing']);
      const consent = privacy.getConsent('user_123');

      expect(consent.marketing).toBe(false);
      expect(consent.analytics).toBe(true);
    });

    test('should check consent for purpose', () => {
      privacy.setConsent('user_123', { marketing: true });

      expect(privacy.hasConsentFor('user_123', 'marketing')).toBe(true);
      expect(privacy.hasConsentFor('user_123', 'analytics')).toBe(false);
    });
  });

  describe('GDPR data subject rights', () => {
    test('should export personal data (right of access)', () => {
      const dataExport = privacy.exportPersonalData('user_123');

      expect(dataExport.data.personalInfo).toBeDefined();
      expect(dataExport.data.activityLog).toBeDefined();
      expect(dataExport.format).toBe('json');
    });

    test('should handle right to erasure', async () => {
      const request = await privacy.erasePersonalData('user_123', 'user_request');

      expect(request.status).toBe('pending');
      expect(request.processingDeadline).toBeDefined();
    });

    test('should check deletion status', async () => {
      await privacy.erasePersonalData('user_123');
      const isMarked = privacy.isMarkedForDeletion('user_123');

      expect(isMarked).toBe(true);
    });

    test('should restrict processing', () => {
      const restricted = privacy.restrictProcessing('user_123', ['marketing']);

      expect(restricted.marketing).toBe(false);
    });

    test('should support data portability', () => {
      const portable = privacy.portabilityData('user_123');

      expect(portable.portableFormat).toBe('json');
      expect(portable.transferToThirdParty).toBe(true);
    });
  });

  describe('retention policies', () => {
    test('should set retention policy', () => {
      privacy.setRetentionPolicy('test_data', 30);
      const policy = privacy.getRetentionPolicy('test_data');

      expect(policy).toBe(30);
    });

    test('should calculate deletion date', () => {
      privacy.setRetentionPolicy('event_logs', 90);

      const createdAt = new Date('2026-01-01');
      const deletionDate = privacy.calculateDeletionDate(createdAt, 'event_logs');

      const daysDiff = Math.floor((deletionDate - createdAt) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(90);
    });
  });

  describe('breach notification', () => {
    test('should notify breach', () => {
      const notification = privacy.notifyBreach(['user_123', 'user_456'], 'Data breach');

      expect(notification.breachId).toBeDefined();
      expect(notification.affectedUsers).toHaveLength(2);
      expect(notification.notificationDeadline).toBeDefined();
    });
  });

  describe('PIA', () => {
    test('should conduct privacy impact assessment', () => {
      const pia = privacy.conductPIA('data_processing', ['email', 'phone']);

      expect(pia.risks).toBeDefined();
      expect(pia.risks.length).toBeGreaterThan(0);
      expect(pia.outcome).toBe('acceptable_with_mitigations');
    });
  });
});
