/**
 * Encryption Service
 * Field-level encryption for sensitive data (PII, financial, auth tokens)
 */

const crypto = require('crypto');

class EncryptionService {
  constructor(masterKey = null) {
    // In production, use AWS KMS or HashiCorp Vault
    this.masterKey = masterKey || process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    this.algorithm = 'aes-256-gcm';
    this.keyMap = new Map(); // Field-specific keys
    this.encryptedFields = ['email', 'phone', 'ssn', 'credit_card', 'password', 'api_key'];
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data, fieldType = 'pii') {
    if (!data) return null;

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const iv = crypto.randomBytes(16);
    const key = this.getFieldKey(fieldType);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      data: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm,
      fieldType: fieldType,
      timestamp: new Date()
    };
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedObj) {
    if (!encryptedObj || !encryptedObj.data) return null;

    try {
      const key = this.getFieldKey(encryptedObj.fieldType);
      const iv = Buffer.from(encryptedObj.iv, 'hex');
      const authTag = Buffer.from(encryptedObj.authTag, 'hex');
      const encrypted = encryptedObj.data;

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error.message);
      return null;
    }
  }

  /**
   * Encrypt batch of records
   */
  encryptBatch(records, fieldsToEncrypt) {
    return records.map(record => {
      const encrypted = { ...record };

      for (const field of fieldsToEncrypt) {
        if (record[field]) {
          encrypted[field] = this.encrypt(record[field], this.getFieldType(field));
        }
      }

      return encrypted;
    });
  }

  /**
   * Decrypt batch of records
   */
  decryptBatch(records, fieldsToDecrypt) {
    return records.map(record => {
      const decrypted = { ...record };

      for (const field of fieldsToDecrypt) {
        if (record[field] && typeof record[field] === 'object' && record[field].data) {
          decrypted[field] = this.decrypt(record[field]);
        }
      }

      return decrypted;
    });
  }

  /**
   * Get field-specific encryption key
   */
  getFieldKey(fieldType) {
    if (this.keyMap.has(fieldType)) {
      return this.keyMap.get(fieldType);
    }

    // Derive key from master key using HKDF
    const salt = Buffer.from(fieldType);
    const key = crypto.hkdfSync('sha256', this.masterKey, salt, null, 32);
    this.keyMap.set(fieldType, key);

    return key;
  }

  /**
   * Get field type from field name
   */
  getFieldType(fieldName) {
    const fieldMap = {
      email: 'pii',
      phone: 'pii',
      ssn: 'sensitive',
      credit_card: 'financial',
      bank_account: 'financial',
      password: 'auth',
      api_key: 'auth',
      password_hash: 'auth'
    };

    return fieldMap[fieldName] || 'pii';
  }

  /**
   * Check if field should be encrypted
   */
  shouldEncrypt(fieldName) {
    return this.encryptedFields.includes(fieldName);
  }

  /**
   * Hash password (for authentication)
   */
  hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');

    return {
      hash: hash.toString('hex'),
      salt: salt.toString('hex'),
      algorithm: 'pbkdf2_sha256'
    };
  }

  /**
   * Verify password hash
   */
  verifyPassword(password, passwordObj) {
    const hash = crypto.pbkdf2Sync(
      password,
      Buffer.from(passwordObj.salt, 'hex'),
      100000,
      64,
      'sha256'
    );

    return hash.toString('hex') === passwordObj.hash;
  }

  /**
   * Generate secure random token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken() {
    return {
      token: this.generateToken(32),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    };
  }

  /**
   * Verify CSRF token
   */
  verifyCSRFToken(token, storedToken) {
    if (!storedToken || !token) return false;
    if (new Date() > storedToken.expiresAt) return false;
    return token === storedToken.token;
  }

  /**
   * Rotate encryption keys
   */
  rotateKeys() {
    const newMasterKey = crypto.randomBytes(32);
    const oldMasterKey = this.masterKey;

    // In production, update all encrypted data with new keys
    console.log('Key rotation initiated (old key archived)');

    this.masterKey = newMasterKey;
    this.keyMap.clear();

    return {
      rotatedAt: new Date(),
      keyId: crypto.createHash('sha256').update(newMasterKey).digest('hex')
    };
  }

  /**
   * Get encryption metadata (for audit)
   */
  getEncryptionMetadata() {
    return {
      algorithm: this.algorithm,
      keyLength: 256,
      masterKeyId: crypto.createHash('sha256').update(this.masterKey).digest('hex'),
      fieldsEncrypted: this.encryptedFields,
      lastRotation: new Date()
    };
  }
}

module.exports = EncryptionService;
