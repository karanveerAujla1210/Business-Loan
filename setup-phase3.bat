@echo off
echo ========================================
echo Phase 3 Documentation and DevOps Setup
echo ========================================
echo.

echo [1/5] Installing Swagger dependencies...
call npm install swagger-jsdoc swagger-ui-express

echo.
echo [2/5] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Docker not found. Please install Docker Desktop.
    echo Download from: https://www.docker.com/products/docker-desktop
) else (
    echo [PASS] Docker installed
)

echo.
echo [3/5] Building Docker image...
docker build -t minibusiness-api:latest .
if %errorlevel% neq 0 (
    echo [WARN] Docker build failed. Check Dockerfile.
) else (
    echo [PASS] Docker image built successfully
)

echo.
echo [4/5] Creating documentation directories...
if not exist "docs" mkdir docs

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo Available Commands
echo ========================================
echo.
echo Docker:
echo   docker-compose up -d          - Start all services
echo   docker-compose down           - Stop all services
echo   docker-compose logs -f app    - View logs
echo   deploy.bat                    - Deploy to environment
echo.
echo API Documentation:
echo   Start server: npm run dev
echo   Visit: http://localhost:3000/api-docs
echo.
echo Next Steps:
echo 1. Review API_DOCS.md for complete API documentation
echo 2. Test Swagger UI at http://localhost:3000/api-docs
echo 3. Build Docker image: docker build -t minibusiness-api .
echo 4. Run with Docker: docker-compose up -d
echo 5. Review PHASE3_IMPLEMENTATION.md for details
echo.
pause
