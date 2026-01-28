import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    // Insert default badges
    await sql`
      INSERT INTO badges (name, description, icon_url, criteria)
      VALUES 
        ('Eerste Stappen', 'Voltooi je eerste module', '/badges/first-steps.svg', '{"type": "module_completion", "count": 1}'),
        ('Leergierig', 'Voltooi 5 modules', '/badges/curious.svg', '{"type": "module_completion", "count": 5}'),
        ('Expert', 'Voltooi alle modules', '/badges/expert.svg', '{"type": "module_completion", "count": 6}'),
        ('Sociaal', 'Plaats je eerste forum post', '/badges/social.svg', '{"type": "forum_post", "count": 1}'),
        ('Behulpzaam', 'Help 3 andere gebruikers met antwoorden', '/badges/helpful.svg', '{"type": "forum_reply", "count": 3}'),
        ('Consistent', 'Gebruik de app 7 dagen achter elkaar', '/badges/consistent.svg', '{"type": "daily_usage", "days": 7}')
      ON CONFLICT DO NOTHING
    `;

    // Insert default forum categories
    await sql`
      INSERT INTO forum_categories (name, description, icon, color, sort_order)
      VALUES 
        ('Algemeen', 'Algemene discussies over daten en relaties', 'message-square', '#3b82f6', 1),
        ('Profiel Advies', 'Vragen en tips over profieloptimalisatie', 'user', '#10b981', 2),
        ('Gesprekken', 'Tips voor het starten en voeren van gesprekken', 'message-circle', '#8b5cf6', 3),
        ('Dates & Activiteiten', 'Ideeën voor dates en activiteiten', 'calendar', '#f59e0b', 4),
        ('Veiligheid & Privacy', 'Vragen over veiligheid en privacy', 'shield', '#ef4444', 5),
        ('Succesverhalen', 'Deel je successen en ervaringen', 'heart', '#FF7B54', 6)
      ON CONFLICT DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      message: 'Community data initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        badges: 6,
        categories: 6
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize community data',
        details: error.message,
      },
      { status: 500 }
    );
  }
}