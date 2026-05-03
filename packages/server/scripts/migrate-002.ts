import fs from 'fs';
import path from 'path';
import pool from '../src/config/database';

async function runMigration002() {
  try {
    console.log('Starting database migration 002 (simplify tables)...');
    
    // Читаем SQL файл миграции
    const migrationPath = path.join(__dirname, '../src/migrations/002_simplify_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Выполняем миграцию
    await pool.query(migrationSQL);
    
    console.log('Migration 002 completed successfully!');
    console.log('Unnecessary columns removed from pagespeed_records and pagespeed_daily_summary');
    
  } catch (error) {
    console.error('Migration 002 failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration002();
