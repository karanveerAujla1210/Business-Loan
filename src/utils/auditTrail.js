const { sequelize, Sequelize } = require('../config/database');
const { logger } = require('./logger');

const AuditLog = sequelize.define('audit_log', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  action: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  entity_type: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  entity_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  old_values: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  new_values: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  ip_address: {
    type: Sequelize.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  timestamps: false,
  tableName: 'audit_log',
});

class AuditTrail {
  async log(data) {
    try {
      await AuditLog.create({
        user_id: data.userId,
        action: data.action,
        entity_type: data.entityType,
        entity_id: data.entityId,
        old_values: data.oldValues ? JSON.stringify(data.oldValues) : null,
        new_values: data.newValues ? JSON.stringify(data.newValues) : null,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
      });

      logger.info('Audit log created', {
        action: data.action,
        entityType: data.entityType,
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Error creating audit log', error);
    }
  }

  async getAuditLogs(filters = {}) {
    try {
      const where = {};
      
      if (filters.userId) where.user_id = filters.userId;
      if (filters.action) where.action = filters.action;
      if (filters.entityType) where.entity_type = filters.entityType;
      if (filters.entityId) where.entity_id = filters.entityId;

      const logs = await AuditLog.findAll({
        where,
        order: [['created_at', 'DESC']],
        limit: filters.limit || 100,
      });

      return logs;
    } catch (error) {
      logger.error('Error fetching audit logs', error);
      throw error;
    }
  }

  middleware() {
    return async (req, res, next) => {
      const originalSend = res.send;

      res.send = function(data) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const sensitiveActions = ['POST', 'PUT', 'DELETE', 'PATCH'];
          
          if (sensitiveActions.includes(req.method)) {
            const auditData = {
              userId: req.user?.id,
              action: `${req.method} ${req.path}`,
              entityType: req.path.split('/')[3] || 'unknown',
              ipAddress: req.ip,
              userAgent: req.get('user-agent'),
              newValues: req.body,
            };

            AuditTrail.prototype.log(auditData).catch(err => {
              logger.error('Audit middleware error', err);
            });
          }
        }

        originalSend.call(this, data);
      };

      next();
    };
  }
}

module.exports = new AuditTrail();
