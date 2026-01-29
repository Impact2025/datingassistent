import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the newsletter_subscribers table if it doesn't exist
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      source VARCHAR(100) DEFAULT 'website',
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at TIMESTAMP,
      metadata JSONB DEFAULT '{}'::jsonb
    )
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { email, source = 'contact-page' } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    // Ensure table exists
    await ensureTable();

    // Check if already subscribed
    const existing = await sql`
      SELECT id, status FROM newsletter_subscribers WHERE email = ${email.toLowerCase()}
    `;

    if (existing.rows.length > 0) {
      const subscriber = existing.rows[0];

      if (subscriber.status === 'active') {
        return NextResponse.json(
          { message: 'Je bent al geabonneerd op onze nieuwsbrief!', alreadySubscribed: true },
          { status: 200 }
        );
      }

      // Reactivate if previously unsubscribed
      await sql`
        UPDATE newsletter_subscribers
        SET status = 'active', unsubscribed_at = NULL, subscribed_at = CURRENT_TIMESTAMP
        WHERE email = ${email.toLowerCase()}
      `;

      return NextResponse.json(
        { message: 'Welkom terug! Je bent opnieuw geabonneerd.', resubscribed: true },
        { status: 200 }
      );
    }

    // Insert new subscriber
    await sql`
      INSERT INTO newsletter_subscribers (email, source, metadata)
      VALUES (${email.toLowerCase()}, ${source}, ${JSON.stringify({ userAgent: request.headers.get('user-agent') })})
    `;

    return NextResponse.json(
      { message: 'Bedankt voor je aanmelding! Je ontvangt binnenkort onze nieuwsbrief.', success: true },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Newsletter subscription error:', error);

    // Handle unique constraint violation (shouldn't happen due to our check, but just in case)
    if (error.code === '23505') {
      return NextResponse.json(
        { message: 'Je bent al geabonneerd op onze nieuwsbrief!', alreadySubscribed: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Er is iets misgegaan. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht' },
        { status: 400 }
      );
    }

    await ensureTable();

    const result = await sql`
      SELECT status, subscribed_at FROM newsletter_subscribers WHERE email = ${email.toLowerCase()}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ subscribed: false });
    }

    return NextResponse.json({
      subscribed: result.rows[0].status === 'active',
      subscribedAt: result.rows[0].subscribed_at
    });

  } catch (error) {
    console.error('Newsletter status check error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
