const { sequelize } = require('../src/config/database');

const getStatements = () => {
  const dialect = sequelize.getDialect();
  if (dialect === 'mssql') {
    return [
      'CREATE INDEX idx_user_mobile ON [user](mobile);',
      'CREATE INDEX idx_applicants_status ON applicants(status);',
      'CREATE INDEX idx_repayment_due_date ON repaymentTransactionsHistory(due_date);',
    ];
  }

  return [
    'CREATE INDEX idx_user_mobile ON `user`(mobile);',
    'CREATE INDEX idx_applicants_status ON applicants(status);',
    'CREATE INDEX idx_repayment_due_date ON repaymentTransactionsHistory(due_date);',
  ];
};

async function run() {
  const statements = getStatements();
  for (const sql of statements) {
    try {
      await sequelize.query(sql);
      console.log(`Applied: ${sql}`);
    } catch (error) {
      console.log(`Skipped or failed: ${sql} -> ${error.message}`);
    }
  }
  await sequelize.close();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
