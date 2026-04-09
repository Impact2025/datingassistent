import { logger } from '@/lib/logger';
import { initializeDatabase } from '../lib/db-schema';

async function initDatabase() {
  try {
    logger.log('Initializing database...');
    const result = await initializeDatabase();
    logger.log('Database initialization result:', result);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initDatabase();