@echo off
echo ========================================
echo Phase 2 Testing and Quality Setup
echo ========================================
echo.

echo [1/6] Installing testing dependencies...
call npm install --save-dev jest supertest @eslint/js eslint eslint-config-prettier eslint-plugin-jest eslint-plugin-node eslint-plugin-security prettier husky lint-staged globals

echo.
echo [2/6] Creating test directories...
if not exist "tests" mkdir tests
if not exist "tests\unit" mkdir tests\unit
if not exist "tests\integration" mkdir tests\integration
if not exist "tests\fixtures" mkdir tests\fixtures

echo.
echo [3/6] Creating coverage directory...
if not exist "coverage" mkdir coverage

echo.
echo [4/6] Initializing Husky...
call npx husky install

echo.
echo [5/6] Setting up git hooks...
call npx husky add .husky\pre-commit "npx lint-staged"

echo.
echo [6/6] Running initial tests...
call npm test

echo.
echo ========================================
echo Phase 2 Setup Complete!
echo ========================================
echo.
echo Available Commands:
echo   npm test              - Run all tests with coverage
echo   npm run test:watch    - Run tests in watch mode
echo   npm run test:unit     - Run unit tests only
echo   npm run test:integration - Run integration tests only
echo   npm run lint          - Check code quality
echo   npm run lint:fix      - Fix linting issues
echo   npm run format        - Format code with Prettier
echo   npm run format:check  - Check code formatting
echo.
echo Next Steps:
echo 1. Review test results and coverage report
echo 2. Write additional tests for your controllers
echo 3. Run 'npm run lint:fix' to fix any linting issues
echo 4. Run 'npm run format' to format all code
echo 5. Review PHASE2_IMPLEMENTATION.md for details
echo.
pause
