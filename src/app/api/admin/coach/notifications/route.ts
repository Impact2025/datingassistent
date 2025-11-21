import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getCoachIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.userId) {
      return payload.userId as number;
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const coachId = await getCoachIdFromToken(request);
    if (!coachId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return mock notifications since database tables don't exist yet
    // TODO: Replace with actual database queries when tables are created
    const mockNotifications = [
      {
        id: 1,
        userId: 1,
        userName: 'Jan Jansen',
        type: 'goal_progress',
        priority: 'high',
        title: 'Jan heeft zijn eerste doel bereikt!',
        message: 'Jan heeft succesvol zijn profiel volledig ingevuld. Dit is een belangrijke mijlpaal voor zijn dating journey.',
        createdAt: '2024-11-13T14:30:00Z'
      },
      {
        id: 2,
        userId: 2,
        userName: 'Marie Pieters',
        type: 'low_activity',
        priority: 'medium',
        title: 'Marie is een week niet actief geweest',
        message: 'Marie heeft de afgelopen week niet ingelogd. Misschien een reminder sturen om haar te motiveren?',
        createdAt: '2024-11-12T10:15:00Z'
      },
      {
        id: 3,
        userId: 3,
        userName: 'Peter de Vries',
        type: 'struggling',
        priority: 'urgent',
        title: 'Peter worstelt met matches krijgen',
        message: 'Peter heeft al 2 weken geen nieuwe matches. Zijn profiel of aanpak zou optimalisatie nodig kunnen hebben.',
        createdAt: '2024-11-11T16:45:00Z'
      },
      {
        id: 4,
        userId: 4,
        userName: 'Linda Bakker',
        type: 'success',
        priority: 'medium',
        title: 'Linda heeft haar eerste date gehad!',
        message: 'Geweldig nieuws! Linda heeft succesvol haar eerste date gehad via het platform. Een mooi moment om te vieren.',
        createdAt: '2024-11-10T13:20:00Z'
      },
      {
        id: 5,
        userId: 1,
        userName: 'Jan Jansen',
        type: 'course_completion',
        priority: 'low',
        title: 'Jan heeft een cursus afgerond',
        message: 'Jan heeft de "Profieltekst die werkt" cursus succesvol afgerond. Goed gedaan!',
        createdAt: '2024-11-09T11:30:00Z'
      }
    ];

    // Try to get real notifications from database, fallback to mock data
    try {
      const notificationsResult = await sql`
        SELECT
          id,
          user_id as "userId",
          'system' as type,
          'medium' as priority,
          'Nieuwe notificatie' as title,
          'Dit is een automatische notificatie' as message,
          created_at as "createdAt",
          name as "userName"
        FROM users
        WHERE email NOT LIKE '%hotmail.com%'
        LIMIT 5
      `;

      if (notificationsResult.rows.length > 0) {
        return NextResponse.json(notificationsResult.rows);
      }
    } catch (dbError) {
      console.log('Database not available for notifications, using mock data');
    }

    // Return mock data if database is not available
    return NextResponse.json(mockNotifications);
  } catch (error) {
    console.error('Error fetching coach notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const coachId = await getCoachIdFromToken(request);
    if (!coachId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action, response } = body;

    if (action === 'acknowledge') {
      await sql`
        UPDATE ai_coach_notifications
        SET
          coach_acknowledged = true,
          coach_response = ${response || null},
          updated_at = NOW()
        WHERE id = ${notificationId}
      `;
    } else if (action === 'dismiss') {
      await sql`
        UPDATE ai_coach_notifications
        SET
          coach_acknowledged = true,
          coach_response = 'Afgehandeld - Geen actie nodig',
          updated_at = NOW()
        WHERE id = ${notificationId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}