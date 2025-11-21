import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Insert a test review
    await sql`
      INSERT INTO reviews (name, role, content, avatar, rating)
      VALUES (
        'Test Gebruiker',
        'Gebruiker sinds 1 maand',
        'Dit is een test review om te controleren of het systeem werkt.',
        'https://placehold.co/100x100/1c1c2e/e0e0e0?text=T',
        5
      )
    `;

    // Fetch all reviews to verify
    const result = await sql`
      SELECT 
        id,
        name,
        role,
        content,
        avatar,
        rating,
        created_at
      FROM reviews 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      message: 'Test review added successfully',
      reviews: result.rows
    });

  } catch (error: any) {
    console.error('Error testing reviews:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to test reviews',
        error: error.message
      },
      { status: 500 }
    );
  }
}