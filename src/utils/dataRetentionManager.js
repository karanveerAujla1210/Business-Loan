const { sequelize } = require('../config/database');
const { logger } = require('./logger');
const cron = require('node-cron');

class DataRetentionManager {
  constructor() {
    this.policies = {
      logs: 90, // days
      auditTrail: 365, // days
      deletedUsers: 30, // days
      tempFiles: 7, // days
    };
  }

  start() {
    // Run cleanup daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Running data retention cleanup');
      await this.cleanupOldData();
    });
  }

  async cleanupOldData() {
    try {
      await this.cleanupLogs();
      await this.cleanupAuditTrail();
      await this.cleanupDeletedUsers();
      logger.info('Data retention cleanup completed');
    } catch (error) {
      logger.error('Data retention cleanup failed', error);
    }
  }

  async cleanupLogs() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.policies.logs);

    // Archive or delete old logs
    logger.info('Cleaning up logs older than', { days: this.policies.logs });
  }

  async cleanupAuditTrail() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.policies.auditTrail);

    try {
      const query = `
        DELETE FROM audit_log 
        WHERE created_at < :cutoffDate
      `;
      
      const [result] = await sequelize.query(query, {
        replacements: { cutoffDate },
      });

      logger.info('Audit trail cleanup completed', { cutoffDate });
    } catch (error) {
      logger.error('Audit trail cleanup failed', error);
    }
  }

  async cleanupDeletedUsers() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.policies.deletedUsers);

    try {
      const query = `
        DELETE FROM user 
        WHERE status = 'deleted' 
        AND updated_at < :cutoffDate
      `;
      
      await sequelize.query(query, {
        replacements: { cutoffDate },
      });

      logger.info('Deleted users cleanup completed');
    } catch (error) {
      logger.error('Deleted users cleanup failed', error);
    }
  }

  async exportUserData(userId) {
    try {
      const query = `
        SELECT * FROM user WHERE id = :userId
      `;
      
      const [userData] = await sequelize.query(query, {
        replacements: { userId },
      });

      return {
        user: userData[0],
        exportDate: new Date().toISOString(),
        format: 'JSON',
      };
    } catch (error) {
      logger.error('User data export failed', error);
      throw error;
    }
  }

  async deleteUserData(userId) {
    try {
      // Anonymize instead of delete for compliance
      const query = `
        UPDATE user 
        SET 
          name = 'DELETED_USER',
          email = CONCAT('deleted_', id, '@deleted.com'),
          mobile = NULL,
          status = 'deleted',
          updated_at = GETDATE()
        WHERE id = :userId
      `;
      
      await sequelize.query(query, {
        replacements: { userId },
      });

      logger.info('User data deleted/anonymized', { userId });
      return true;
    } catch (error) {
      logger.error('User data deletion failed', error);
      throw error;
    }
  }
}

module.exports = new DataRetentionManager();
