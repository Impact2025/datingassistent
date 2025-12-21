/**
 * Cron Job: Q&A Session Reminders
 *
 * Sends email reminders to users enrolled in Transformatie
 * about upcoming Q&A sessions (24 hours before).
 *
 * Schedule: Run daily at 10:00 AM
 * Trigger: https://yourapp.com/api/cron/qa-reminders (secured with cron secret)
 *
 * Setup in Vercel:
 * 1. Add CRON_SECRET to environment variables
 * 2. Add to vercel.json: { "crons": [{ "path": "/api/cron/qa-reminders", "schedule": "0 10 * * *" }]}
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

// Initialize Resend lazily to avoid build-time errors
const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get sessions happening tomorrow (24 hour reminder)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    const sessionsResult = await sql`
      SELECT
        id,
        title,
        description,
        session_date,
        session_time,
        duration_minutes,
        zoom_link,
        status
      FROM qa_sessions
      WHERE session_date = ${tomorrowDate}
        AND status = 'scheduled'
        AND zoom_link IS NOT NULL
      ORDER BY session_time ASC
    `;

    const sessions = sessionsResult.rows;

    if (sessions.length === 0) {
      return NextResponse.json({
        message: 'No sessions tomorrow',
        count: 0,
      });
    }

    // Get all users enrolled in Transformatie program
    const usersResult = await sql`
      SELECT DISTINCT u.id, u.email, u.name
      FROM users u
      INNER JOIN user_enrollments ue ON u.id = ue.user_id
      INNER JOIN programs p ON ue.program_id = p.id
      WHERE p.slug = 'transformatie'
        AND ue.status = 'active'
        AND u.email IS NOT NULL
    `;

    const users = usersResult.rows;

    if (users.length === 0) {
      return NextResponse.json({
        message: 'No enrolled users found',
        sessions: sessions.length,
        users: 0,
      });
    }

    // Send email to each user for each session
    const emailPromises = [];

    for (const session of sessions) {
      const sessionDateTime = new Date(`${session.session_date}T${session.session_time}`);
      const formattedDate = sessionDateTime.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const formattedTime = sessionDateTime.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const resend = getResend();
      for (const user of users) {
        const emailPromise = resend.emails.send({
          from: 'DatingAssistent <noreply@datingassistent.nl>',
          to: user.email,
          subject: `Morgen: ${session.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #E61E63;">Herinnering: Q&A Sessie Morgen!</h2>

              <p>Hoi ${user.name || 'daar'},</p>

              <p>Dit is een herinnering dat je morgen kunt deelnemen aan de live Q&A sessie:</p>

              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">${session.title}</h3>
                ${session.description ? `<p style="color: #666;">${session.description}</p>` : ''}

                <p style="margin: 10px 0;">
                  <strong>📅 Datum:</strong> ${formattedDate}<br/>
                  <strong>🕐 Tijd:</strong> ${formattedTime}<br/>
                  <strong>⏱️ Duur:</strong> ${session.duration_minutes} minuten
                </p>

                <a href="${session.zoom_link}"
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                  Deelnemen via Zoom
                </a>
              </div>

              <p style="color: #666; font-size: 14px;">
                Zorg dat je op tijd bent! De sessie start precies op de aangegeven tijd.
              </p>

              <p style="color: #666; font-size: 14px;">
                Vragen? Noteer ze alvast zodat je ze tijdens de sessie kunt stellen.
              </p>

              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

              <p style="color: #999; font-size: 12px;">
                Je ontvangt deze email omdat je bent ingeschreven voor het Transformatie programma.
              </p>
            </div>
          `,
        });

        emailPromises.push(emailPromise);
      }
    }

    // Send all emails
    const results = await Promise.allSettled(emailPromises);

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // Log results
    console.log(`✅ Q&A Reminders sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      message: 'Reminders sent',
      sessions: sessions.length,
      users: users.length,
      emailsSent: successful,
      emailsFailed: failed,
      tomorrow: tomorrowDate,
    });

  } catch (error) {
    console.error('Error sending Q&A reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
