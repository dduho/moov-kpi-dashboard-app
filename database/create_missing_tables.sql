-- Create missing tables for analytics functionality

-- Table des statistiques quotidiennes par canal
CREATE TABLE IF NOT EXISTS channel_daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    channel VARCHAR(50) NOT NULL,
    users_count INTEGER DEFAULT 0,
    transactions_count INTEGER DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    amount DECIMAL(15,2) DEFAULT 0,
    monthly_total_revenue DECIMAL(15,2) DEFAULT 0,
    monthly_avg_revenue DECIMAL(15,2) DEFAULT 0,
    monthly_total_transactions INTEGER DEFAULT 0,
    monthly_avg_transactions INTEGER DEFAULT 0,
    mom_revenue_percent DECIMAL(8,4) DEFAULT 0,
    mom_transactions_percent DECIMAL(8,4) DEFAULT 0,
    includes_mfs BOOLEAN DEFAULT false,
    includes_ethub BOOLEAN DEFAULT false,
    service_active BOOLEAN DEFAULT true,
    day_of_month INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, channel)
);

-- Table des comparaisons annuelles
CREATE TABLE IF NOT EXISTS yearly_comparisons (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    value DECIMAL(15,2) DEFAULT 0,
    monthly_total DECIMAL(15,2) DEFAULT 0,
    monthly_avg DECIMAL(15,2) DEFAULT 0,
    mom_percent DECIMAL(8,4) DEFAULT 0,
    yoy_percent DECIMAL(8,4) DEFAULT 0,
    metric_type VARCHAR(50) NOT NULL DEFAULT 'revenue',
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month, day, metric_type, category)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channel_daily_stats_date ON channel_daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_channel_daily_stats_channel ON channel_daily_stats(channel);
CREATE INDEX IF NOT EXISTS idx_channel_daily_stats_year_month ON channel_daily_stats(year, month);
CREATE INDEX IF NOT EXISTS idx_yearly_comparisons_year ON yearly_comparisons(year);
CREATE INDEX IF NOT EXISTS idx_yearly_comparisons_month ON yearly_comparisons(month);
CREATE INDEX IF NOT EXISTS idx_yearly_comparisons_metric_type ON yearly_comparisons(metric_type);