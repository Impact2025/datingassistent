import { initializeDatabase } from '../lib/db-schema';

async function initDatabase() {
  try {
    console.log('Initializing database...');
    const result = await initializeDatabase();
    console.log('Database initialization result:', result);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization
initDatabase();