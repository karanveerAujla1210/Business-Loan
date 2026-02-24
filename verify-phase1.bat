@echo off
echo ========================================
echo Phase 1 Installation Verification
echo ========================================
echo.

set ERRORS=0

echo [1/10] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js not found
    set /a ERRORS+=1
) else (
    echo [PASS] Node.js installed
)

echo.
echo [2/10] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] npm not found
    set /a ERRORS+=1
) else (
    echo [PASS] npm installed
)

echo.
echo [3/10] Checking node_modules...
if exist "node_modules\" (
    echo [PASS] Dependencies installed
) else (
    echo [FAIL] Dependencies not installed - Run: npm install
    set /a ERRORS+=1
)

echo.
echo [4/10] Checking logs directory...
if exist "logs\" (
    echo [PASS] Logs directory exists
) else (
    echo [WARN] Logs directory missing - Will be created on first run
)

echo.
echo [5/10] Checking migrations directory...
if exist "src\migrations\" (
    echo [PASS] Migrations directory exists
) else (
    echo [WARN] Migrations directory missing - Run: mkdir src\migrations
)

echo.
echo [6/10] Checking .env file...
if exist ".env" (
    echo [PASS] .env file exists
    findstr /C:"SESSION_SECRET_KEY" .env >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARN] SESSION_SECRET_KEY not found in .env
    )
    findstr /C:"JWT_SECRET" .env >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARN] JWT_SECRET not found in .env
    )
) else (
    echo [FAIL] .env file not found - Copy from .env.example.new
    set /a ERRORS+=1
)

echo.
echo [7/10] Checking security middlewares...
if exist "src\middlewares\rateLimiter.js" (
    echo [PASS] rateLimiter.js exists
) else (
    echo [FAIL] rateLimiter.js missing
    set /a ERRORS+=1
)

if exist "src\middlewares\sanitization.js" (
    echo [PASS] sanitization.js exists
) else (
    echo [FAIL] sanitization.js missing
    set /a ERRORS+=1
)

if exist "src\middlewares\security.js" (
    echo [PASS] security.js exists
) else (
    echo [FAIL] security.js missing
    set /a ERRORS+=1
)

if exist "src\middlewares\errorHandler.js" (
    echo [PASS] errorHandler.js exists
) else (
    echo [FAIL] errorHandler.js missing
    set /a ERRORS+=1
)

echo.
echo [8/10] Checking health controller...
if exist "src\controllers\HealthController.js" (
    echo [PASS] HealthController.js exists
) else (
    echo [FAIL] HealthController.js missing
    set /a ERRORS+=1
)

echo.
echo [9/10] Checking documentation...
if exist "SECURITY.md" (
    echo [PASS] SECURITY.md exists
) else (
    echo [WARN] SECURITY.md missing
)

if exist "PHASE1_IMPLEMENTATION.md" (
    echo [PASS] PHASE1_IMPLEMENTATION.md exists
) else (
    echo [WARN] PHASE1_IMPLEMENTATION.md missing
)

if exist "QUICK_START.md" (
    echo [PASS] QUICK_START.md exists
) else (
    echo [WARN] QUICK_START.md missing
)

echo.
echo [10/10] Checking package.json dependencies...
findstr /C:"express-rate-limit" package.json >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] express-rate-limit not in package.json
    set /a ERRORS+=1
) else (
    echo [PASS] express-rate-limit found
)

findstr /C:"helmet" package.json >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] helmet not in package.json
    set /a ERRORS+=1
) else (
    echo [PASS] helmet found
)

findstr /C:"winston" package.json >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] winston not in package.json
    set /a ERRORS+=1
) else (
    echo [PASS] winston found
)

echo.
echo ========================================
echo Verification Complete
echo ========================================
echo.

if %ERRORS% equ 0 (
    echo [SUCCESS] All critical checks passed!
    echo.
    echo Next steps:
    echo 1. Update .env with your credentials
    echo 2. Generate secrets: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    echo 3. Remove sensitive files: git rm --cached certs/* private.key public.key .env
    echo 4. Start application: npm run dev
    echo.
    echo See QUICK_START.md for detailed instructions
) else (
    echo [FAILED] %ERRORS% critical check(s) failed
    echo.
    echo Please fix the errors above before proceeding.
    echo Run: setup-phase1.bat to install missing components
)

echo.
pause
