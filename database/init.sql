-- Initialisation de la base de données Moov KPI Dashboard pour PostgreSQL

-- Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer les tables de base si elles n'existent pas

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des KPIs quotidiens
CREATE TABLE IF NOT EXISTS daily_kpis (
    id SERIAL PRIMARY KEY,
    date VARCHAR(8) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    period VARCHAR(50),
    success_trx INTEGER DEFAULT 0,
    amount DECIMAL(15,2) DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    commission DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    failed_trx INTEGER DEFAULT 0,
    expired_trx INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 0,
    revenue_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, business_type)
);

-- Table des KPIs horaires
CREATE TABLE IF NOT EXISTS hourly_kpis (
    id SERIAL PRIMARY KEY,
    date VARCHAR(8) NOT NULL,
    hour INTEGER NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    total_success INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    total_fee DECIMAL(15,2) DEFAULT 0,
    total_commission DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, hour, business_type)
);

-- Table des KPIs hebdomadaires
CREATE TABLE IF NOT EXISTS weekly_kpis (
    id SERIAL PRIMARY KEY,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    year INTEGER NOT NULL,
    week_number INTEGER NOT NULL,
    monday_revenue DECIMAL(15,2) DEFAULT 0,
    tuesday_revenue DECIMAL(15,2) DEFAULT 0,
    wednesday_revenue DECIMAL(15,2) DEFAULT 0,
    thursday_revenue DECIMAL(15,2) DEFAULT 0,
    friday_revenue DECIMAL(15,2) DEFAULT 0,
    saturday_revenue DECIMAL(15,2) DEFAULT 0,
    sunday_revenue DECIMAL(15,2) DEFAULT 0,
    monday_transactions INTEGER DEFAULT 0,
    tuesday_transactions INTEGER DEFAULT 0,
    wednesday_transactions INTEGER DEFAULT 0,
    thursday_transactions INTEGER DEFAULT 0,
    friday_transactions INTEGER DEFAULT 0,
    saturday_transactions INTEGER DEFAULT 0,
    sunday_transactions INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    avg_daily_revenue DECIMAL(15,2) DEFAULT 0,
    avg_daily_transactions INTEGER DEFAULT 0,
    revenue_change_percent DECIMAL(5,2) DEFAULT 0,
    transaction_change_percent DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(week_start_date)
);

-- Table des performances horaires
CREATE TABLE IF NOT EXISTS hourly_performance (
    id SERIAL PRIMARY KEY,
    date VARCHAR(8) NOT NULL,
    hour INTEGER NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    transaction_amount DECIMAL(15,2) DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    transaction_count_change DECIMAL(5,2) DEFAULT 0,
    transaction_amount_change DECIMAL(5,2) DEFAULT 0,
    revenue_change DECIMAL(5,2) DEFAULT 0,
    peak_hour_indicator BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, hour, business_type)
);

-- Table des analyses comparatives
CREATE TABLE IF NOT EXISTS comparative_analytics (
    id SERIAL PRIMARY KEY,
    date VARCHAR(8) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    current_day_transaction_count INTEGER DEFAULT 0,
    last_day_transaction_count INTEGER DEFAULT 0,
    transaction_count_gap INTEGER DEFAULT 0,
    current_day_amount DECIMAL(15,2) DEFAULT 0,
    last_day_amount DECIMAL(15,2) DEFAULT 0,
    amount_gap DECIMAL(15,2) DEFAULT 0,
    current_day_revenue DECIMAL(15,2) DEFAULT 0,
    last_day_revenue DECIMAL(15,2) DEFAULT 0,
    revenue_gap DECIMAL(15,2) DEFAULT 0,
    trend VARCHAR(20) CHECK (trend IN ('increasing', 'decreasing', 'stable')),
    performance_indicator VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, business_type)
);

-- Table des transactions IMT (modifiée avec channel et hour)
CREATE TABLE IF NOT EXISTS imt_transactions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    country VARCHAR(50),
    imt_business VARCHAR(50),
    channel VARCHAR(50) NOT NULL, -- ETHUB_SEND, ETHUB_RECV, MFS_SEND, MFS_RECV
    hour INTEGER, -- 0-23 for hourly data, null for daily
    total_success INTEGER,
    total_failed INTEGER,
    amount DECIMAL(20,2), -- In millions XOF
    revenue DECIMAL(20,2), -- In thousands XOF
    commission DECIMAL(20,2), -- In thousands XOF
    tax DECIMAL(20,2), -- In thousands XOF
    success_rate DECIMAL(5,4),
    balance DECIMAL(20,2), -- In millions XOF
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, country, imt_business, channel, hour)
);

-- Table des statistiques IMT par pays
CREATE TABLE IF NOT EXISTS imt_country_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    country VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('RECEIVE', 'SEND')),
    hub_type VARCHAR(10) NOT NULL CHECK (hub_type IN ('ETHUB', 'MFS')),
    count INTEGER DEFAULT 0,
    amount DECIMAL(20,2) DEFAULT 0, -- In millions XOF
    revenue DECIMAL(20,2) DEFAULT 0, -- In thousands XOF
    commission DECIMAL(20,2) DEFAULT 0, -- In thousands XOF
    tax DECIMAL(20,2) DEFAULT 0, -- In thousands XOF
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, country, direction, hub_type)
);

-- Table des soldes IMT
CREATE TABLE IF NOT EXISTS imt_balances (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    country VARCHAR(50) NOT NULL,
    ethub_receive_balance DECIMAL(20,2) DEFAULT 0, -- In millions XOF
    ethub_send_balance DECIMAL(20,2) DEFAULT 0, -- In millions XOF
    mfs_receive_balance DECIMAL(20,2) DEFAULT 0, -- In millions XOF
    mfs_send_balance DECIMAL(20,2) DEFAULT 0, -- In millions XOF
    balance_status VARCHAR(20) DEFAULT 'Healthy' CHECK (balance_status IN ('Healthy', 'Warning', 'Critical')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, country)
);