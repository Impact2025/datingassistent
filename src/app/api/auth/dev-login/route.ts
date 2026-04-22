import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { signToken, cookieConfig } from '@/lib/jwt-config';

// Localhost-only shortcut: bypass email auth for local development.
// Returns 404 on any non-localhost host.
export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const email = new URL(request.url).searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Pass ?email=your@email.com' }, { status: 400 });
  }

  const result = await sql`
    SELECT id, name, email FROM users WHERE email = ${email.toLowerCase().trim()}
  `;

  if (result.rows.length === 0) {
    return NextResponse.json({ error: `No user found for ${email}` }, { status: 404 });
  }

  const user = result.rows[0];
  const token = await signToken({ id: user.id, email: user.email, displayName: user.name });

  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  response.cookies.set(cookieConfig.name, token, cookieConfig.options);
  return response;
}
