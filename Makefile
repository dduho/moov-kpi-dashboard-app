# Moov KPI Dashboard - Development Makefile

.PHONY: help install dev build test lint clean docker-up docker-down docker-logs

# Default target
help:
	@echo "Available commands:"
	@echo "  install       - Install dependencies for backend and frontend"
	@echo "  dev           - Start development servers"
	@echo "  build         - Build the application"
	@echo "  test          - Run tests"
	@echo "  lint          - Run linting"
	@echo "  clean         - Clean build artifacts"
	@echo "  docker-up     - Start Docker containers"
	@echo "  docker-down   - Stop Docker containers"
	@echo "  docker-logs   - Show Docker logs"
	@echo "  setup         - Initial project setup"

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Dependencies installed successfully!"

# Development servers
dev:
	@echo "Starting development servers..."
	@echo "Backend will be available at http://localhost:3000"
	@echo "Frontend will be available at http://localhost:5173"
	@echo "Press Ctrl+C to stop all servers"
	make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

# Build application
build:
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Build completed!"

# Testing
test:
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test

# Linting
lint:
	@echo "Linting backend..."
	cd backend && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint

# Cleaning
clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	@echo "Clean completed!"

# Docker commands
docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "Containers started! Application will be available at:"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend: http://localhost:3000"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down

docker-logs:
	docker-compose logs -f

# Initial setup
setup:
	@echo "Setting up the project..."
	@echo "Copying environment files..."
	cp backend/.env.example backend/.env
	cp frontend/.env.example frontend/.env
	@echo "Installing dependencies..."
	make install
	@echo "Starting Docker services..."
	make docker-up
	@echo "Setup completed!"
	@echo "Please edit the .env files with your configuration values."
	@echo "Then run 'make dev' to start development servers."

# Database commands
db-init:
	@echo "Initializing database..."
	docker-compose exec postgres psql -U postgres -c "CREATE DATABASE IF NOT EXISTS mmtg_dashboard;"
	@echo "Database initialized!"

db-migrate:
	@echo "Running database migrations..."
	cd backend && npm run migrate
	@echo "Migrations completed!"

db-seed:
	@echo "Seeding database..."
	cd backend && npm run seed
	@echo "Database seeded!"

# Deployment
deploy-dev:
	@echo "Deploying to development environment..."
	docker-compose -f docker-compose.dev.yml up -d --build

deploy-prod:
	@echo "Deploying to production environment..."
	docker-compose -f docker-compose.prod.yml up -d --build

# Utility commands
format:
	@echo "Formatting code..."
	cd frontend && npm run format

check-env:
	@echo "Checking environment files..."
	@if [ ! -f backend/.env ]; then echo "❌ backend/.env missing"; else echo "✅ backend/.env exists"; fi
	@if [ ! -f frontend/.env ]; then echo "❌ frontend/.env missing"; else echo "✅ frontend/.env exists"; fi

status:
	@echo "Project status:"
	@echo "Backend dependencies:" && cd backend && npm list --depth=0 | head -n 5
	@echo "Frontend dependencies:" && cd frontend && npm list --depth=0 | head -n 5
	@echo "Docker containers:" && docker-compose ps

# Quick development cycle
dev-cycle: clean install build test lint
	@echo "Development cycle completed!"