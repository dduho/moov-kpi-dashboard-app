-- Moov KPI Dashboard - Database Initialization Script
-- This script is executed automatically when PostgreSQL container starts for the first time

-- Create the database (if not already created by environment variables)
-- The database 'mmtg_dashboard' is created by POSTGRES_DB environment variable

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables for KPI tracking
-- These will be managed by Sequelize, but we ensure the database is properly initialized

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialized successfully for Moov KPI Dashboard';
END $$;
