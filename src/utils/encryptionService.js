/**
 * Encryption Service using AES-256-CBC
 * For encrypting sensitive PII (Aadhaar, PAN, etc.)
 * @author MiniBusiness Loan
 */

const crypto = require('crypto');
const { logger } = require('./logger');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

// Validate encryption key at startup
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  logger.error('ENCRYPTION_KEY must be exactly 32 characters (256-bit AES key)');
  logger.error(`Current length: ${ENCRYPTION_KEY ? ENCRYPTION_KEY.length : 0}`);
  process.exit(1);
}

/**
 * Encrypt plaintext using AES-256-CBC
 * @param {string} plaintext - Text to encrypt
 * @returns {string} IV:EncryptedData (hex format)
 */
function encrypt(plaintext) {
  try {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new Error('Plaintext must be a non-empty string');
    }

    // Generate random IV (16 bytes)
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV:EncryptedData for decryption
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption failed', { error: error.message });
    throw new Error(`Encryption error: ${error.message}`);
  }
}

/**
 * Decrypt ciphertext using AES-256-CBC
 * @param {string} encryptedData - IV:EncryptedData format
 * @returns {string} Decrypted plaintext
 */
function decrypt(encryptedData) {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Encrypted data must be a non-empty string');
    }

    // Split IV and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format. Expected IV:EncryptedData');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', { error: error.message });
    throw new Error(`Decryption error: ${error.message}`);
  }
}

/**
 * Mask Aadhaar number
 * Example: 123456789012 → XXXX-XXXX-9012
 * @param {string} aadhaar - Full Aadhaar number
 * @returns {string} Masked Aadhaar
 */
function maskAadhaar(aadhaar) {
  try {
    if (!aadhaar || aadhaar.length !== 12) {
      throw new Error('Aadhaar must be 12 digits');
    }
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  } catch (error) {
    logger.error('Aadhaar masking failed', { error: error.message });
    return 'XXXX-XXXX-XXXX'; // Safe fallback
  }
}

/**
 * Mask PAN number
 * Example: ABCDE1234F → ABCD****F
 * @param {string} pan - Full PAN number
 * @returns {string} Masked PAN
 */
function maskPAN(pan) {
  try {
    if (!pan || pan.length !== 10) {
      throw new Error('PAN must be 10 characters');
    }
    return `${pan.slice(0, 4)}****${pan.slice(-1)}`;
  } catch (error) {
    logger.error('PAN masking failed', { error: error.message });
    return '****MASKED****';
  }
}

/**
 * Mask bank account number
 * Example: 12345678901234 → 1234-****-****-5678
 * @param {string} accountNumber - Full account number
 * @returns {string} Masked account number
 */
function maskBankAccount(accountNumber) {
  try {
    if (!accountNumber || accountNumber.length < 8) {
      throw new Error('Account number must be at least 8 digits');
    }
    const first4 = accountNumber.slice(0, 4);
    const last4 = accountNumber.slice(-4);
    return `${first4}-****-****-${last4}`;
  } catch (error) {
    logger.error('Bank account masking failed', { error: error.message });
    return '****-****-****-****';
  }
}

/**
 * Validate encryption key
 * @returns {boolean} True if valid
 */
function validateEncryptionKey() {
  return ENCRYPTION_KEY && ENCRYPTION_KEY.length === 32;
}

module.exports = {
  encrypt,
  decrypt,
  maskAadhaar,
  maskPAN,
  maskBankAccount,
  validateEncryptionKey,
};
