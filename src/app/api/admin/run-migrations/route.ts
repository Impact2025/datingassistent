/**
 * Admin: Run pending database migrations
 *
 * POST /api/admin/run-migrations
 * Body: { migration: 'utm-tracking' | 'affiliate-system' | 'all' }
 *
 * Idempotent — safe to run multiple times (all statements use IF NOT EXISTS).
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

const MIGRATIONS: Record<string, { description: string; statements: string[] }> = {
  'utm-tracking': {
    description: 'UTM tracking columns + email_tracking unique constraint',
    statements: [
      // email_tracking fix
      `ALTER TABLE email_tracking ADD COLUMN IF NOT EXISTS email_type VARCHAR(100)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_email_tracking_user_type ON email_tracking (user_id, email_type) WHERE email_type IS NOT NULL`,
      // UTM columns
      `ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100)`,
      `ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100)`,
      `ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100)`,
      `CREATE INDEX IF NOT EXISTS idx_payment_utm_source ON payment_transactions (utm_source) WHERE utm_source IS NOT NULL`,
    ],
  },
  'affiliate-system': {
    description: 'Affiliate partners, clicks, conversions tables',
    statements: [
      `CREATE TABLE IF NOT EXISTS affiliate_partners (
        id              SERIAL PRIMARY KEY,
        name            VARCHAR(200) NOT NULL,
        email           VARCHAR(255) NOT NULL UNIQUE,
        company         VARCHAR(200),
        referral_code   VARCHAR(20)  NOT NULL UNIQUE,
        commission_pct  DECIMAL(5,2) NOT NULL DEFAULT 30.00,
        status          VARCHAR(20)  NOT NULL DEFAULT 'active',
        payout_email    VARCHAR(255),
        notes           TEXT,
        created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id              SERIAL PRIMARY KEY,
        partner_id      INT          NOT NULL REFERENCES affiliate_partners(id),
        referral_code   VARCHAR(20)  NOT NULL,
        ip_address      VARCHAR(45),
        user_agent      TEXT,
        landing_page    VARCHAR(500),
        utm_campaign    VARCHAR(100),
        clicked_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS affiliate_conversions (
        id              SERIAL PRIMARY KEY,
        partner_id      INT          NOT NULL REFERENCES affiliate_partners(id),
        referral_code   VARCHAR(20)  NOT NULL,
        order_id        VARCHAR(100) NOT NULL,
        user_id         INT          NOT NULL,
        sale_amount     DECIMAL(10,2) NOT NULL,
        commission_pct  DECIMAL(5,2)  NOT NULL,
        commission_amt  DECIMAL(10,2) NOT NULL,
        status          VARCHAR(20)   NOT NULL DEFAULT 'pending',
        converted_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        approved_at     TIMESTAMPTZ,
        paid_at         TIMESTAMPTZ
      )`,
      `ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20)`,
      `CREATE INDEX IF NOT EXISTS idx_payment_referral_code ON payment_transactions (referral_code) WHERE referral_code IS NOT NULL`,
      `CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON affiliate_clicks (referral_code, clicked_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_pid ON affiliate_conversions (partner_id, status)`,
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const { migration } = await request.json();

    const toRun = migration === 'all'
      ? Object.keys(MIGRATIONS)
      : MIGRATIONS[migration] ? [migration] : null;

    if (!toRun) {
      return NextResponse.json(
        { error: `Unknown migration. Available: ${Object.keys(MIGRATIONS).join(', ')}, all` },
        { status: 400 }
      );
    }

    const results: Record<string, { success: boolean; statementsRun: number; error?: string }> = {};

    for (const key of toRun) {
      const m = MIGRATIONS[key];
      let statementsRun = 0;
      try {
        const client = await db.connect();
        try {
          for (const statement of m.statements) {
            await client.query(statement);
            statementsRun++;
          }
        } finally {
          client.release();
        }
        results[key] = { success: true, statementsRun };
      } catch (err) {
        results[key] = {
          success: false,
          statementsRun,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    }

    const allSuccess = Object.values(results).every((r) => r.success);
    return NextResponse.json({ success: allSuccess, results });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
