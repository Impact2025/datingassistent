import 'dotenv/config';
import { sql } from '@vercel/postgres';
import { logger } from '@/lib/logger';

async function migrateUserProfilesExtended() {
  logger.log('🚀 Starting user_profiles_extended interests migration to JSONB');

  await sql`ALTER TABLE user_profiles_extended
    ALTER COLUMN interests DROP DEFAULT`;

  await sql`ALTER TABLE user_profiles_extended
    ALTER COLUMN interests TYPE JSONB
    USING COALESCE(to_jsonb(interests), '[]'::jsonb)`;

  await sql`ALTER TABLE user_profiles_extended
    ALTER COLUMN interests SET DEFAULT '[]'::jsonb`;

  logger.log('✅ user_profiles_extended interests column migrated to JSONB');
}

migrateUserProfilesExtended()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
