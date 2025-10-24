-- Initialisation de la base de données Moov KPI Dashboard

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS mmtg_dashboard;

-- Utiliser la base de données
\c mmtg_dashboard;

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

-- Table des KPIs
CREATE TABLE IF NOT EXISTS kpis (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    value DECIMAL(10,2),
    target DECIMAL(10,2),
    unit VARCHAR(20),
    category VARCHAR(50),
    date_recorded DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des revenus
CREATE TABLE IF NOT EXISTS revenues (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(12,2) NOT NULL,
    source VARCHAR(100),
    category VARCHAR(50),
    date_recorded DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des données IMT
CREATE TABLE IF NOT EXISTS imt_data (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(10,2),
    period VARCHAR(20),
    date_recorded DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer quelques données de test
INSERT INTO users (username, email, hashed_password) VALUES
('admin', 'admin@moov.ci', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeCt1uB0Y4I5J3l6e') -- password: admin123
ON CONFLICT (username) DO NOTHING;

-- Insérer quelques KPIs de test
INSERT INTO kpis (name, value, target, unit, category, date_recorded) VALUES
('Active Users', 12500, 15000, 'users', 'engagement', CURRENT_DATE),
('Revenue', 2500000, 3000000, 'XOF', 'financial', CURRENT_DATE),
('Conversion Rate', 3.5, 5.0, '%', 'performance', CURRENT_DATE)
ON CONFLICT DO NOTHING;