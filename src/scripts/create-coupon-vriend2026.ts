/**
 * Aanmaken: coupon VRIEND2026
 * 100% korting op het Transformatie programma, onbeperkt gebruik, geen vervaldatum.
 *
 * Run: npx tsx src/scripts/create-coupon-vriend2026.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { sql } from '@vercel/postgres';

async function run() {
  console.log('🎟️  Coupon VRIEND2026 aanmaken...\n');

  try {
    const result = await sql`
      INSERT INTO coupons (
        code, package_type, discount_type, discount_value,
        max_uses, used_count, is_active
      ) VALUES (
        'VRIEND2026', 'transformatie', 'percentage', 100,
        NULL, 0, true
      )
      ON CONFLICT (code) DO UPDATE SET
        discount_type  = EXCLUDED.discount_type,
        discount_value = EXCLUDED.discount_value,
        is_active      = true,
        updated_at     = NOW()
      RETURNING id, code, discount_type, discount_value, is_active
    `;

    const c = result.rows[0];
    console.log(`✅ Coupon aangemaakt:`);
    console.log(`   Code:    ${c.code}`);
    console.log(`   Korting: ${c.discount_value}% (${c.discount_type})`);
    console.log(`   Actief:  ${c.is_active}`);
    console.log('\nGebruik VRIEND2026 op de checkout voor gratis toegang.');
  } catch (err) {
    console.error('❌ Fout:', err);
    process.exit(1);
  }
}

run();
