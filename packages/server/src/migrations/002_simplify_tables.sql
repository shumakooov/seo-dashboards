-- Упрощение таблиц - удаление ненужных колонок

-- Удаляем ненужные колонки из pagespeed_records
ALTER TABLE pagespeed_records 
DROP COLUMN IF EXISTS accessibility_score,
DROP COLUMN IF EXISTS best_practices_score,
DROP COLUMN IF EXISTS seo_score,
DROP COLUMN IF EXISTS updated_at;

-- Удаляем ненужные колонки из pagespeed_daily_summary
ALTER TABLE pagespeed_daily_summary 
DROP COLUMN IF EXISTS avg_accessibility_score,
DROP COLUMN IF EXISTS avg_best_practices_score,
DROP COLUMN IF EXISTS avg_seo_score;

-- Удаляем триггер для updated_at (больше не нужен)
DROP TRIGGER IF EXISTS update_pagespeed_records_updated_at ON pagespeed_records;
DROP FUNCTION IF EXISTS update_updated_at_column();
