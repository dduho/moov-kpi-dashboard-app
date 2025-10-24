@echo off
REM Script to start the backend server without Redis

echo Starting Moov KPI Backend Server (without Redis)...
echo.

REM Set environment variable to disable Redis
set REDIS_AVAILABLE=false

REM Navigate to the correct directory
cd /d "%~dp0src"

REM Start the server
echo Server will start on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
node app.js