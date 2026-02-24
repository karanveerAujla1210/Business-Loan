const { logger } = require('../utils/logger');
const crypto = require('crypto');

class DataPrivacy {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    this.algorithm = 'aes-256-cbc';
  }

  encryptPII(data) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Encryption error', error);
      throw error;
    }
  }

  decryptPII(encryptedData) {
    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Decryption error', error);
      throw error;
    }
  }

  maskPII(data, type = 'default') {
    if (!data) return data;

    switch (type) {
      case 'mobile':
        return data.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');
      case 'email':
        return data.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      case 'aadhaar':
        return data.replace(/(\d{4})\d{4}(\d{4})/, '$1****$2');
      case 'pan':
        return data.replace(/(.{3})(.{4})(.*)/, '$1****$3');
      default:
        return '***';
    }
  }

  anonymizeData(data) {
    const anonymized = { ...data };
    const piiFields = ['mobile', 'email', 'aadhaar', 'pan', 'name', 'address'];
    
    piiFields.forEach(field => {
      if (anonymized[field]) {
        anonymized[field] = this.maskPII(anonymized[field], field);
      }
    });

    return anonymized;
  }

  async logDataAccess(userId, dataType, action, ipAddress) {
    logger.info('Data access logged', {
      userId,
      dataType,
      action,
      ipAddress,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new DataPrivacy();
