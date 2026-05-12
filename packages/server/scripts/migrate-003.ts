import fs from 'fs';
import path from 'path';
import pool from '../src/config/database';

async function runMigration003() {
  try {
    console.log('Starting database migration 003 (create sites table)...');
    
    // Читаем SQL файл миграции
    const migrationPath = path.join(__dirname, '../src/migrations/003_create_sites_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Выполняем миграцию
    await pool.query(migrationSQL);
    
    console.log('Migration 003 completed successfully!');
    console.log('Sites table created with indexes and triggers');
    
  } catch (error) {
    console.error('Migration 003 failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration003();
