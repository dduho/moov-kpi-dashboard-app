@echo off
echo Starting Moov KPI Backend with in-memory cache (no Redis required)...
cd /d "%~dp0src"
node app.js
pause