-- Создание таблицы для хранения сайтов
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для быстрого поиска по URL
CREATE INDEX IF NOT EXISTS idx_sites_url ON sites(url);

-- Создание индекса для сортировки по дате создания
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at DESC);
