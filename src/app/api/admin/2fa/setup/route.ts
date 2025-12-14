import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';
import { generateTwoFactorSecret, hashBackupCodes } from '@/lib/two-factor-auth';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request);
    
    if (adminUser.email !== 'admin@datingassistent.nl') {
      return NextResponse.json({ error: 'Only admin can setup 2FA' }, { status: 403 });
    }

    const { secret, qrCodeUrl, backupCodes } = await generateTwoFactorSecret(adminUser.email);
    const hashedBackupCodes = await hashBackupCodes(backupCodes);

    await sql`
      UPDATE users
      SET
        two_factor_secret = ${secret},
        two_factor_backup_codes = ${JSON.stringify(hashedBackupCodes)},
        two_factor_enabled = false,
        updated_at = NOW()
      WHERE id = ${adminUser.id}
    `;

    return NextResponse.json({
      success: true,
      qrCodeUrl,
      backupCodes,
      secret
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
  }
}