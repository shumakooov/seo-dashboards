import { Pool } from 'pg';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Конфигурация подключения к PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'seo-dashboards',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: false, // Отключаем SSL
  max: 20, // максимальное количество подключений
  idleTimeoutMillis: 30000, // время простоя перед закрытием
  connectionTimeoutMillis: 2000, // таймаут подключения
});

// Проверка подключения
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Логируем параметры подключения для отладки
console.log('Database connection config:', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  database: process.env.DB_NAME || 'seo-dashboards',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD ? '***' : 'not set',
  ssl: false
});

export default pool;
