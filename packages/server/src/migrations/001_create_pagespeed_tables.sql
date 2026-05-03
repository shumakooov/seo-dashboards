-- Создание таблицы для хранения Pagespeed данных
CREATE TABLE IF NOT EXISTS pagespeed_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(2048) NOT NULL,
    strategy VARCHAR(10) NOT NULL CHECK (strategy IN ('desktop', 'mobile')),
    performance_score DECIMAL(5,2),
    accessibility_score DECIMAL(5,2),
    best_practices_score DECIMAL(5,2),
    seo_score DECIMAL(5,2),
    first_contentful_paint DECIMAL(10,2),
    largest_contentful_paint DECIMAL(10,2),
    cumulative_layout_shift DECIMAL(10,4),
    total_blocking_time DECIMAL(10,2),
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для быстрого поиска по URL и стратегии
CREATE INDEX IF NOT EXISTS idx_pagespeed_url_strategy ON pagespeed_records(url, strategy);

-- Создание индекса для сортировки по дате
CREATE INDEX IF NOT EXISTS idx_pagespeed_created_at ON pagespeed_records(created_at DESC);

-- Создание таблицы для ежедневных агрегированных данных
CREATE TABLE IF NOT EXISTS pagespeed_daily_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(2048) NOT NULL,
    date DATE NOT NULL,
    avg_performance_score DECIMAL(5,2),
    avg_accessibility_score DECIMAL(5,2),
    avg_best_practices_score DECIMAL(5,2),
    avg_seo_score DECIMAL(5,2),
    desktop_performance_score DECIMAL(5,2),
    mobile_performance_score DECIMAL(5,2),
    record_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(url, date)
);

-- Создание индекса для ежедневных данных
CREATE INDEX IF NOT EXISTS idx_pagespeed_daily_url_date ON pagespeed_daily_summary(url, date DESC);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_pagespeed_records_updated_at
    BEFORE UPDATE ON pagespeed_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
