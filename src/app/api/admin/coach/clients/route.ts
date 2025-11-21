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

    // For now, return mock data since database tables don't exist yet
    // TODO: Replace with actual database queries when tables are created
    const mockClients = [
      {
        id: 1,
        name: 'Jan Jansen',
        email: 'jan.jansen@email.nl',
        join_date: '2024-10-15T10:00:00Z',
        last_activity: '2024-11-13T14:30:00Z',
        goals_completed: 3,
        total_goals: 5,
        risk_level: 'low',
        recentSuccesses: [
          'Profiel volledig ingevuld',
          'Eerste date gepland',
          'Nieuwe cursus afgerond'
        ],
        pendingNotifications: 2
      },
      {
        id: 2,
        name: 'Marie Pieters',
        email: 'marie.pieters@email.nl',
        join_date: '2024-10-20T09:15:00Z',
        last_activity: '2024-11-12T16:45:00Z',
        goals_completed: 2,
        total_goals: 4,
        risk_level: 'medium',
        recentSuccesses: [
          'Foto\'s geoptimaliseerd',
          'Bio verbeterd'
        ],
        pendingNotifications: 1
      },
      {
        id: 3,
        name: 'Peter de Vries',
        email: 'peter.devries@email.nl',
        join_date: '2024-11-01T11:30:00Z',
        last_activity: '2024-11-10T13:20:00Z',
        goals_completed: 1,
        total_goals: 3,
        risk_level: 'high',
        recentSuccesses: [
          'Account aangemaakt'
        ],
        pendingNotifications: 3
      },
      {
        id: 4,
        name: 'Linda Bakker',
        email: 'linda.bakker@email.nl',
        join_date: '2024-10-25T08:45:00Z',
        last_activity: '2024-11-14T10:15:00Z',
        goals_completed: 4,
        total_goals: 6,
        risk_level: 'low',
        recentSuccesses: [
          'Profiel compleet',
          'Matches gekregen',
          'Gesprekken gevoerd',
          'Date gehad'
        ],
        pendingNotifications: 0
      }
    ];

    // Try to get real data from database, fallback to mock data
    try {
      const clientsResult = await sql`
        SELECT id, name, email, created_at as join_date, last_login as last_activity
        FROM users
        WHERE email NOT LIKE '%hotmail.com%' -- Exclude admin accounts
        LIMIT 10
      `;

      if (clientsResult.rows.length > 0) {
        // Enhance real data with mock progress data
        const enhancedClients = clientsResult.rows.map((client: any, index: number) => ({
          ...client,
          goals_completed: Math.floor(Math.random() * 5) + 1,
          total_goals: Math.floor(Math.random() * 3) + 3,
          risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          recentSuccesses: [
            'Profiel bijgewerkt',
            'Nieuwe cursus gestart',
            'Foto\'s geüpload',
            'Eerste berichten verstuurd'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          pendingNotifications: Math.floor(Math.random() * 4)
        }));

        return NextResponse.json(enhancedClients);
      }
    } catch (dbError) {
      console.log('Database not available, using mock data');
    }

    // Return mock data if database is not available
    return NextResponse.json(mockClients);
  } catch (error) {
    console.error('Error fetching coach clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}