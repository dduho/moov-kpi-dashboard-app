#!/bin/bash

echo "==========================================="
echo " Moov KPI Dashboard - Development Mode"
echo "==========================================="
echo ""

echo "Starting development services..."
echo ""

echo "1. Starting Docker services (DB, Redis, Backend)..."
docker-compose up -d postgres redis backend

echo ""
echo "2. Starting Frontend Dev Server..."
echo "   - Access your app at: http://localhost:5173"
echo "   - Hot reload is enabled"
echo ""

cd frontend
npm run dev

echo ""
echo "Development server stopped."