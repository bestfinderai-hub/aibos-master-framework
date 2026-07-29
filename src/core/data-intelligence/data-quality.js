/**
 * Data Quality Engine
 * Validates, cleans, deduplicates data
 */

class DataQualityEngine {
  constructor() {
    this.validationRules = new Map();
    this.cleaningRules = new Map();
  }

  /**
   * Validate record
   */
  validateRecord(record, schema) {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = record[field];

      // Required field
      if (rules.required && (value === null || value === undefined || value === '')) {
        errors.push({ field, error: 'required' });
      }

      // Type validation
      if (value && rules.type) {
        if (!this.validateType(value, rules.type)) {
          errors.push({ field, error: 'type_mismatch' });
        }
      }

      // Format validation
      if (value && rules.format) {
        if (!this.validateFormat(value, rules.format)) {
          errors.push({ field, error: 'format_invalid' });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      record
    };
  }

  /**
   * Type validation
   */
  validateType(value, type) {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return /^\+?[\d\s\-()]{10,}$/.test(value);
      case 'url':
        return /^https?:\/\//.test(value);
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'date':
        return !isNaN(new Date(value));
      default:
        return true;
    }
  }

  /**
   * Format validation
   */
  validateFormat(value, format) {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+?[\d\s\-()]{10,}$/,
      url: /^https?:\/\/\S+$/,
      uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      zipcode: /^\d{5}(-\d{4})?$/
    };

    return patterns[format] ? patterns[format].test(value) : true;
  }

  /**
   * Detect duplicates
   */
  detectDuplicates(records, key) {
    const seen = new Map();
    const duplicates = [];

    for (const record of records) {
      const keyValue = record[key];

      if (seen.has(keyValue)) {
        duplicates.push({
          original: seen.get(keyValue),
          duplicate: record,
          similarity: 0.95 // Exact match on key
        });
      } else {
        seen.set(keyValue, record);
      }
    }

    return duplicates;
  }

  /**
   * Merge duplicate records
   */
  mergeDuplicates(record1, record2, strategy = 'prefer_newer') {
    const merged = { ...record1 };

    for (const [key, value] of Object.entries(record2)) {
      if (strategy === 'prefer_newer') {
        if (record2.updatedAt > record1.updatedAt) {
          merged[key] = value;
        }
      } else if (strategy === 'prefer_filled') {
        if (!merged[key] && value) {
          merged[key] = value;
        }
      }
    }

    return merged;
  }

  /**
   * Detect outliers
   */
  detectOutliers(records, field) {
    const values = records.map(r => r[field]).filter(v => typeof v === 'number');

    if (values.length < 3) return [];

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdev = Math.sqrt(variance);

    // 3-sigma rule: values > 3 std devs from mean are outliers
    const threshold = 3;

    return records.filter(r => {
      const value = r[field];
      return typeof value === 'number' && Math.abs(value - mean) > threshold * stdev;
    });
  }

  /**
   * Enrich record
   */
  enrichRecord(record) {
    const enriched = { ...record };

    // Add derived fields
    enriched.name_length = (enriched.name || '').length;
    enriched.email_domain = enriched.email?.split('@')[1];
    enriched.phone_country = enriched.phone?.substring(0, 3);

    // Add timestamps
    enriched.enrichedAt = new Date();

    return enriched;
  }

  /**
   * Calculate data quality score
   */
  getQualityScore(record) {
    let score = 100;

    // Deduct for missing fields
    const emptyFields = Object.values(record).filter(v => !v).length;
    score -= emptyFields * 5;

    // Deduct for invalid formats
    if (record.email && !this.validateType(record.email, 'email')) score -= 10;
    if (record.phone && !this.validateType(record.phone, 'phone')) score -= 10;

    // Bonus for completeness
    const filledFields = Object.values(record).filter(v => v).length;
    const completeness = (filledFields / Object.keys(record).length) * 100;
    if (completeness > 80) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Clean record
   */
  cleanRecord(record) {
    const cleaned = {};

    for (const [key, value] of Object.entries(record)) {
      if (value === null || value === undefined) {
        cleaned[key] = null;
      } else if (typeof value === 'string') {
        // Trim whitespace
        cleaned[key] = value.trim().toLowerCase();
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}

module.exports = DataQualityEngine;
