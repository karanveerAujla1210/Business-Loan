@echo off
echo ========================================
echo Phase 4 Monitoring and Observability Setup
echo ========================================
echo.

echo [1/4] Installing monitoring dependencies...
call npm install

echo.
echo [2/4] Creating monitoring directories...
if not exist "public" mkdir public

echo.
echo [3/4] Testing monitoring endpoints...
echo Starting server in background...
start /B npm run dev

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Testing endpoints...
curl http://localhost:3000/api/v1/health
echo.
curl http://localhost:3000/api/v1/metrics
echo.

echo.
echo [4/4] Setup complete!
echo.
echo ========================================
echo Available Monitoring Tools
echo ========================================
echo.
echo Dashboards:
echo   http://localhost:3000/dashboard        - Monitoring Dashboard
echo   http://localhost:3000/api-docs         - API Documentation
echo.
echo Endpoints:
echo   GET  /api/v1/health                    - Health check
echo   GET  /api/v1/metrics                   - Application metrics
echo   POST /api/v1/metrics/reset             - Reset metrics
echo   GET  /api/v1/metrics/prometheus        - Prometheus metrics
echo.
echo Alerting:
echo   Configure ALERT_EMAIL in .env for email alerts
echo   Thresholds: Error rate 5%%, Response time 2s, Memory 80%%
echo.
echo Prometheus:
echo   1. Install Prometheus
echo   2. Use prometheus.yml configuration
echo   3. Access at http://localhost:9090
echo.
echo Next Steps:
echo 1. Visit http://localhost:3000/dashboard
echo 2. Configure email alerts in .env
echo 3. Review PHASE4_IMPLEMENTATION.md
echo.
pause
