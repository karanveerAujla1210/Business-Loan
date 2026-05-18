const { sequelize } = require('../config/database');

const ensureConsentTable = async () => {
  const dialect = sequelize.getDialect();

  if (dialect === 'mssql') {
    await sequelize.query(`
      IF OBJECT_ID('user_consent_preferences', 'U') IS NULL
      BEGIN
        CREATE TABLE user_consent_preferences (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NOT NULL,
          consent_type NVARCHAR(100) NOT NULL,
          granted BIT NOT NULL,
          updated_at DATETIME NOT NULL DEFAULT GETDATE()
        );
        CREATE UNIQUE INDEX uq_user_consent_type ON user_consent_preferences(user_id, consent_type);
      END
    `);
    return;
  }

  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS user_consent_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      consent_type VARCHAR(100) NOT NULL,
      granted BOOLEAN NOT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_consent_type (user_id, consent_type)
    )
  `);
};

const saveUserConsent = async ({ userId, consentType, granted }) => {
  await ensureConsentTable();

  const dialect = sequelize.getDialect();
  if (dialect === 'mssql') {
    await sequelize.query(
      `
      MERGE user_consent_preferences AS target
      USING (SELECT :userId AS user_id, :consentType AS consent_type) AS source
      ON target.user_id = source.user_id AND target.consent_type = source.consent_type
      WHEN MATCHED THEN
        UPDATE SET granted = :granted, updated_at = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (user_id, consent_type, granted, updated_at)
        VALUES (:userId, :consentType, :granted, GETDATE());
      `,
      { replacements: { userId, consentType, granted } }
    );
    return;
  }

  await sequelize.query(
    `
    INSERT INTO user_consent_preferences (user_id, consent_type, granted, updated_at)
    VALUES (:userId, :consentType, :granted, NOW())
    ON DUPLICATE KEY UPDATE
      granted = VALUES(granted),
      updated_at = NOW()
    `,
    { replacements: { userId, consentType, granted } }
  );
};

module.exports = {
  saveUserConsent,
};
