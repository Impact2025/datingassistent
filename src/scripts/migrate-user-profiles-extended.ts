import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function migrateUserProfilesExtended() {
  console.log('🚀 Starting user_profiles_extended interests migration to JSONB');

  await sql`ALTER TABLE user_profiles_extended
    ALTER COLUMN interests DROP DEFAULT`;

  await sql`ALTER TABLE user_profiles_extended
    ALTER COLUMN interests TYPE JSONB
    USING COALESCE(to_jsonb(interests), '[]'::jsonb)`;

  await sql`ALTER TABLE user_profiles_extended
    ALTER COLUMN interests SET DEFAULT '[]'::jsonb`;

  console.log('✅ user_profiles_extended interests column migrated to JSONB');
}

migrateUserProfilesExtended()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
