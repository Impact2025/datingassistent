import { logger } from '@/lib/logger';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
logger.log('Loading environment variables from:', envPath);
config({ path: envPath });

logger.log('Environment variables loaded:');
logger.log('MULTISAFEPAY_API_KEY:', process.env.MULTISAFEPAY_API_KEY ? `Set (length: ${process.env.MULTISAFEPAY_API_KEY.length})` : 'Not set');
logger.log('MSP_API_KEY:', process.env.MSP_API_KEY ? `Set (length: ${process.env.MSP_API_KEY.length})` : 'Not set');
logger.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'Set' : 'Not set');