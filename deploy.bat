@echo off
echo ========================================
echo MiniBusiness Loan CRM - Deployment
echo ========================================
echo.

set /p ENV="Enter environment (dev/staging/prod): "

if "%ENV%"=="dev" (
    echo Deploying to Development...
    docker-compose up -d --build
) else if "%ENV%"=="staging" (
    echo Deploying to Staging...
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
) else if "%ENV%"=="prod" (
    echo Deploying to Production...
    docker-compose -f docker-compose.prod.yml up -d --build
) else (
    echo Invalid environment. Use: dev, staging, or prod
    exit /b 1
)

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak

echo.
echo Checking health...
curl http://localhost:3000/api/v1/health

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo View logs: docker-compose logs -f app
echo Stop services: docker-compose down
echo.
pause
