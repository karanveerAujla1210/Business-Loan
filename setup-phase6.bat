@echo off
echo ========================================
echo Phase 6 Compliance and Optimization Setup
echo ========================================
echo.

echo [1/4] Verifying all dependencies...
call npm install

echo.
echo [2/4] Generating encryption key...
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))" > encryption_key.txt
echo Encryption key saved to encryption_key.txt
echo Add this to your .env file!

echo.
echo [3/4] Creating database indexes...
echo Run these SQL commands on your database:
echo.
echo CREATE INDEX idx_user_mobile ON [user](mobile);
echo CREATE INDEX idx_applicant_status ON applicants(status);
echo CREATE INDEX idx_repayment_due_date ON repaymentTransactionsHistory(due_date);
echo CREATE INDEX idx_audit_log_user ON audit_log(user_id);
echo CREATE INDEX idx_audit_log_created ON audit_log(created_at);
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo Phase 6 Features
echo ========================================
echo.
echo Compliance:
echo   GET  /api/v1/compliance/privacy-policy  - Privacy policy
echo   GET  /api/v1/compliance/export-data     - Export user data (GDPR)
echo   POST /api/v1/compliance/delete-data     - Delete user data (GDPR)
echo   POST /api/v1/compliance/consent         - Consent management
echo.
echo Data Privacy:
echo   - PII encryption/decryption
echo   - Data masking
echo   - Data anonymization
echo   - Access logging
echo.
echo Performance:
echo   - Response caching
echo   - Batch processing
echo   - Performance measurement
echo   - Query optimization
echo.
echo Data Retention:
echo   - Automated cleanup (daily 2 AM)
echo   - 90 days for logs
echo   - 365 days for audit trail
echo   - 30 days for deleted users
echo.
echo Production Readiness:
echo   - Review PRODUCTION_READINESS.md
echo   - Complete all checklist items
echo   - Run security audit
echo   - Perform load testing
echo.
echo Next Steps:
echo 1. Add ENCRYPTION_KEY to .env
echo 2. Create database indexes
echo 3. Review PRODUCTION_READINESS.md
echo 4. Complete pre-production checklist
echo 5. Review PHASE6_IMPLEMENTATION.md
echo.
pause
