@echo off
echo ========================================
echo Phase 1 Security Implementation Setup
echo ========================================
echo.

echo [1/5] Installing new dependencies...
call npm install express-rate-limit helmet csurf winston sequelize-cli

echo.
echo [2/5] Creating logs directory...
if not exist "logs" mkdir logs

echo.
echo [3/5] Creating migrations directory...
if not exist "src\migrations" mkdir src\migrations
if not exist "src\seeders" mkdir src\seeders

echo.
echo [4/5] Backing up current .env file...
if exist ".env" (
    copy .env .env.backup
    echo .env backed up to .env.backup
)

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo IMPORTANT: Next Steps
echo ========================================
echo.
echo 1. Update your .env file with new variables from .env.example.new
echo 2. Generate strong secrets (32+ characters):
echo    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo.
echo 3. Remove sensitive files from git:
echo    git rm --cached certs/* private.key public.key .env
echo.
echo 4. Rotate ALL credentials (DB, API keys, secrets)
echo.
echo 5. Review PHASE1_IMPLEMENTATION.md for detailed instructions
echo.
echo 6. Review SECURITY.md for security best practices
echo.
echo ========================================
echo Ready to start? Run: npm run dev
echo ========================================
pause
