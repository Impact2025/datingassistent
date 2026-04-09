import { sql } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function migrate() {
  console.log('🚀 Adding UTM + referral columns to payment_transactions...\n');

  try {
    await sql`SELECT 1`;
    console.log('✅ Database connected\n');

    const columns = [
      { name: 'utm_source',    type: 'VARCHAR(255)' },
      { name: 'utm_medium',    type: 'VARCHAR(255)' },
      { name: 'utm_campaign',  type: 'VARCHAR(255)' },
      { name: 'referral_code', type: 'VARCHAR(100)' },
    ];

    for (const col of columns) {
      try {
        await sql.query(
          `ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`
        );
        console.log(`✅ ${col.name} (${col.type})`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('already exists')) {
          console.log(`ℹ️  ${col.name} bestaat al`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n🎉 Klaar!');
  } catch (err) {
    console.error('❌ Mislukt:', err);
    process.exit(1);
  }

  process.exit(0);
}

migrate();
