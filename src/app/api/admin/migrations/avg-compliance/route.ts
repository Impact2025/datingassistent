import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Eenmalige migratie: AVG/GDPR compliance kolommen
// Aanroepen via GET /api/admin/migrations/avg-compliance?secret=<CRON_SECRET>
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // 1. Artikel 9 toestemming kolommen
    await sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS article9_consent         BOOLEAN   DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS article9_consent_at      TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS article9_consent_version VARCHAR(10) DEFAULT '1.0'
    `;
    results.push('✅ article9_consent kolommen toegevoegd');

    // 2. Verwerkingsbeperking (Art. 18)
    await sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS processing_restricted    BOOLEAN   DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS processing_restricted_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS processing_restricted_reason TEXT
    `;
    results.push('✅ processing_restricted kolommen toegevoegd');

    // 3. data_requests tabel aanmaken met volledige constraint (als nog niet bestaat)
    await sql`
      CREATE TABLE IF NOT EXISTS data_requests (
        id            SERIAL PRIMARY KEY,
        user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        request_type  TEXT    NOT NULL CHECK (request_type IN ('export','delete','modify','restrict','object')),
        status        TEXT    NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','processing','completed','failed','cancelled')),
        requested_at  TIMESTAMPTZ DEFAULT NOW(),
        completed_at  TIMESTAMPTZ,
        data          JSONB,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    results.push('✅ data_requests tabel gecontroleerd');

    // 4. CHECK constraint updaten voor bestaande tabel
    //    PostgreSQL genereert automatisch een naam als data_requests_request_type_check
    await sql`
      ALTER TABLE data_requests
        DROP CONSTRAINT IF EXISTS data_requests_request_type_check
    `;
    await sql`
      ALTER TABLE data_requests
        ADD CONSTRAINT data_requests_request_type_check
        CHECK (request_type IN ('export','delete','modify','restrict','object'))
    `;
    results.push('✅ data_requests CHECK constraint uitgebreid met restrict/object');

    // 5. Indexen
    await sql`CREATE INDEX IF NOT EXISTS idx_data_requests_user_id   ON data_requests(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_data_requests_type       ON data_requests(request_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_data_requests_status     ON data_requests(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_article9_consent   ON users(article9_consent)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_data_retention     ON users(data_retention_until)`;
    results.push('✅ Indexen aangemaakt');

    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error('Migratie fout:', error);
    return NextResponse.json(
      { success: false, error: error.message, results },
      { status: 500 }
    );
  }
}
