@echo off
echo ========================================
echo Phase 5 Business Features Setup
echo ========================================
echo.

echo [1/3] Verifying dependencies...
call npm install

echo.
echo [2/3] Creating database tables...
echo Creating audit_log table...
echo Run this SQL manually on your database:
echo.
echo CREATE TABLE audit_log (
echo   id INT PRIMARY KEY IDENTITY(1,1),
echo   user_id INT NULL,
echo   action VARCHAR(100) NOT NULL,
echo   entity_type VARCHAR(50) NOT NULL,
echo   entity_id INT NULL,
echo   old_values TEXT NULL,
echo   new_values TEXT NULL,
echo   ip_address VARCHAR(45) NULL,
echo   user_agent VARCHAR(255) NULL,
echo   created_at DATETIME DEFAULT GETDATE()
echo );
echo.

echo [3/3] Setup complete!
echo.
echo ========================================
echo Available Features
echo ========================================
echo.
echo Dashboards:
echo   http://localhost:3000/analytics        - Analytics Dashboard
echo   http://localhost:3000/dashboard        - Monitoring Dashboard
echo   http://localhost:3000/api-docs         - API Documentation
echo.
echo Reporting Endpoints:
echo   GET  /api/v1/reports/daily             - Daily report
echo   GET  /api/v1/reports/loans             - Loan statistics
echo   GET  /api/v1/reports/repayments        - Payment statistics
echo   GET  /api/v1/reports/customers         - Customer statistics
echo.
echo Automated Features:
echo   - Daily EMI reminders (9 AM)
echo   - Overdue payment alerts (10 AM)
echo   - Weekly reports (Monday 8 AM)
echo   - Audit trail logging
echo   - Performance monitoring
echo.
echo Next Steps:
echo 1. Create audit_log table in database
echo 2. Visit http://localhost:3000/analytics
echo 3. Configure notification schedule if needed
echo 4. Review PHASE5_IMPLEMENTATION.md
echo.
pause
