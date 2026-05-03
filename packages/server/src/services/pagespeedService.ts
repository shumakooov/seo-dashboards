import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface PagespeedRecord {
  id?: string;
  url: string;
  strategy: 'desktop' | 'mobile';
  performance_score?: number;
  first_contentful_paint?: number;
  largest_contentful_paint?: number;
  cumulative_layout_shift?: number;
  total_blocking_time?: number;
  raw_data?: any;
  created_at?: Date;
}

export interface PagespeedDailySummary {
  id?: string;
  url: string;
  date: string;
  avg_performance_score?: number;
  desktop_performance_score?: number;
  mobile_performance_score?: number;
  record_count?: number;
  created_at?: Date;
}

// Сохранение Pagespeed данных
export const savePagespeedData = async (data: Omit<PagespeedRecord, 'id' | 'created_at'>): Promise<PagespeedRecord> => {
  const query = `
    INSERT INTO pagespeed_records (
      url, strategy, performance_score, first_contentful_paint, 
      largest_contentful_paint, cumulative_layout_shift, total_blocking_time, raw_data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const values = [
    data.url,
    data.strategy,
    data.performance_score,
    data.first_contentful_paint,
    data.largest_contentful_paint,
    data.cumulative_layout_shift,
    data.total_blocking_time,
    JSON.stringify(data.raw_data)
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Получение истории данных для графика
export const getPagespeedHistory = async (url: string, days: number = 30): Promise<any[]> => {
  const query = `
    SELECT 
      DATE(created_at) as date,
      AVG(CASE WHEN strategy = 'desktop' THEN performance_score END) as desktop,
      AVG(CASE WHEN strategy = 'mobile' THEN performance_score END) as mobile
    FROM pagespeed_records 
    WHERE url = $1 
      AND created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 12
  `;
  
  const result = await pool.query(query, [url]);
  
  // Форматируем данные для графика
  return result.rows.reverse().map(row => ({
    name: new Date(row.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
    desktop: Math.round(row.desktop || 0),
    mobile: Math.round(row.mobile || 0)
  }));
};

// Получение последних данных для URL
export const getLatestPagespeedData = async (url: string): Promise<{ desktop: PagespeedRecord | null, mobile: PagespeedRecord | null }> => {
  const query = `
    SELECT DISTINCT ON (strategy) *
    FROM pagespeed_records 
    WHERE url = $1 
    ORDER BY strategy, created_at DESC
  `;
  
  const result = await pool.query(query, [url]);
  
  const desktop = result.rows.find(row => row.strategy === 'desktop') || null;
  const mobile = result.rows.find(row => row.strategy === 'mobile') || null;
  
  return { desktop, mobile };
};

// Создание ежедневной сводки
export const createDailySummary = async (url: string, date: string): Promise<PagespeedDailySummary> => {
  const query = `
    INSERT INTO pagespeed_daily_summary (
      url, date, avg_performance_score, desktop_performance_score,
      mobile_performance_score, record_count
    )
    SELECT 
      $1 as url,
      $2 as date,
      AVG(performance_score) as avg_performance_score,
      AVG(CASE WHEN strategy = 'desktop' THEN performance_score END) as desktop_performance_score,
      AVG(CASE WHEN strategy = 'mobile' THEN performance_score END) as mobile_performance_score,
      COUNT(*) as record_count
    FROM pagespeed_records 
    WHERE url = $3 AND DATE(created_at) = $2
    ON CONFLICT (url, date) 
    DO UPDATE SET
      avg_performance_score = EXCLUDED.avg_performance_score,
      desktop_performance_score = EXCLUDED.desktop_performance_score,
      mobile_performance_score = EXCLUDED.mobile_performance_score,
      record_count = EXCLUDED.record_count
    RETURNING *
  `;
  
  const result = await pool.query(query, [url, date, url]);
  return result.rows[0];
};
