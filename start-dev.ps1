Write-Host "==========================================="
Write-Host " Moov KPI Dashboard - Development Mode"
Write-Host "==========================================="
Write-Host ""

Write-Host "Starting development services..."
Write-Host ""

Write-Host "1. Starting Docker services (DB, Redis, Backend)..."
docker-compose up -d postgres redis backend

Write-Host ""
Write-Host "2. Starting Frontend Dev Server..."
Write-Host "   - Access your app at: http://localhost:5173"
Write-Host "   - Hot reload is enabled"
Write-Host ""

Set-Location frontend
npm run dev

Write-Host ""
Write-Host "Development server stopped."
Read-Host "Press Enter to exit"