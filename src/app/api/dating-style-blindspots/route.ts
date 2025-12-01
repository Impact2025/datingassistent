import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET: Get user's dating style blindspots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // For now, return mock blindspots data
    // In a real implementation, this would analyze user's dating history and patterns
    const mockBlindspots = [
      {
        title: "Te snel commitment zoeken",
        description: "Je neigt naar het zoeken van snelle verbindingen, wat soms druk kan zetten op nieuwe dates.",
        impactLevel: 3,
        solution: "Focus eerst op het leren kennen van de persoon voordat je denkt aan toekomstplannen."
      },
      {
        title: "Verkeerde partner types kiezen",
        description: "Je kiest vaak partners die niet goed bij je behoeften passen.",
        impactLevel: 4,
        solution: "Maak een lijst van je kernwaarden en gebruik deze als leidraad bij het kiezen van dates."
      },
      {
        title: "Communicatie problemen negeren",
        description: "Je merkt rode vlaggen in communicatie soms niet op.",
        impactLevel: 2,
        solution: "Let op consistentie tussen woorden en daden, en vertrouw je intuïtie."
      }
    ];

    return NextResponse.json({
      success: true,
      blindspots: mockBlindspots
    });

  } catch (error: any) {
    console.error('Error fetching dating style blindspots:', error);
    return NextResponse.json({
      error: 'Failed to fetch blindspots',
      message: error.message
    }, { status: 500 });
  }
}