/**
 * Fix Script: Corrigeer Transformatie programma prijzen
 *
 * Probleem: price_regular en price_beta waren per ongeluk in centen opgeslagen
 * (29700, 14700) terwijl de rest van de codebase euro-waarden verwacht (297, 147).
 *
 * Fix: sla correcte euro-waarden op zodat de checkout correct €297 / €147 toont.
 *
 * Run: npx tsx src/scripts/fix-transformatie-prices.ts
 */

import * as dotenv from 'dotenv';

dotenv.config();

import { sql } from '@vercel/postgres';

async function fix() {
  console.log('🔧 Transformatie prijzen corrigeren...\n');

  try {
    // Check current values
    const current = await sql`
      SELECT id, name, price_regular, price_beta
      FROM programs
      WHERE slug = 'transformatie'
      LIMIT 1
    `;

    if (current.rows.length === 0) {
      console.error('❌ Transformatie programma niet gevonden');
      process.exit(1);
    }

    const prog = current.rows[0];
    console.log(`Huidig: price_regular=${prog.price_regular}, price_beta=${prog.price_beta}`);

    // Update to correct euro values
    await sql`
      UPDATE programs
      SET price_regular = 297,
          price_beta    = 147
      WHERE slug = 'transformatie'
    `;

    // Verify
    const updated = await sql`
      SELECT price_regular, price_beta FROM programs WHERE slug = 'transformatie' LIMIT 1
    `;
    const u = updated.rows[0];
    console.log(`✅ Bijgewerkt: price_regular=${u.price_regular}, price_beta=${u.price_beta}`);
    console.log('\n✅ Klaar. De checkout toont nu €297 / €147 correct.');
  } catch (err) {
    console.error('❌ Fout:', err);
    process.exit(1);
  }
}

fix();
