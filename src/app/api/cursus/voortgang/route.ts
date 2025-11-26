import { NextRequest, NextResponse } from 'next/server';

// Mock voortgang data - later vervangen door database
const mockVoortgang = new Map<string, any>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gebruikerId = searchParams.get('gebruikerId');
    const lesId = searchParams.get('lesId');

    if (!gebruikerId) {
      return NextResponse.json({ error: 'Gebruiker ID is verplicht' }, { status: 400 });
    }

    // Later: Haal voortgang op uit database
    // const voortgang = await prisma.les_voortgang.findMany({
    //   where: { gebruiker_id: gebruikerId },
    //   include: { les: true }
    // });

    // Voor nu: return lege voortgang
    const voortgang = Array.from(mockVoortgang.values()).filter(
      (v: any) => v.gebruiker_id === gebruikerId
    );

    return NextResponse.json({ voortgang });
  } catch (error) {
    console.error('Error fetching voortgang:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van de voortgang' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { gebruikerId, lesId, status, videoGezien, oefeningenKlaar } = await req.json();

    if (!gebruikerId || !lesId) {
      return NextResponse.json(
        { error: 'Gebruiker ID en les ID zijn verplicht' },
        { status: 400 }
      );
    }

    const voortgangKey = `${gebruikerId}-${lesId}`;
    const now = new Date().toISOString();

    // Update mock voortgang
    const bestaandeVoortgang = mockVoortgang.get(voortgangKey) || {
      gebruiker_id: gebruikerId,
      les_id: parseInt(lesId),
      status: 'niet_gestart',
      video_gezien: false,
      oefeningen_klaar: false,
      started_at: null,
      completed_at: null,
      updated_at: now
    };

    // Update velden
    if (status) bestaandeVoortgang.status = status;
    if (videoGezien !== undefined) bestaandeVoortgang.video_gezien = videoGezien;
    if (oefeningenKlaar !== undefined) bestaandeVoortgang.oefeningen_klaar = oefeningenKlaar;

    // Set timestamps
    if (status === 'bezig' && !bestaandeVoortgang.started_at) {
      bestaandeVoortgang.started_at = now;
    }
    if (status === 'voltooid' && !bestaandeVoortgang.completed_at) {
      bestaandeVoortgang.completed_at = now;
    }

    bestaandeVoortgang.updated_at = now;
    mockVoortgang.set(voortgangKey, bestaandeVoortgang);

    // Later: Update database
    // await prisma.les_voortgang.upsert({
    //   where: {
    //     gebruiker_id_les_id: {
    //       gebruiker_id: gebruikerId,
    //       les_id: parseInt(lesId)
    //     }
    //   },
    //   update: {
    //     status,
    //     video_gezien: videoGezien,
    //     oefeningen_klaar: oefeningenKlaar,
    //     completed_at: status === 'voltooid' ? new Date() : undefined,
    //     updated_at: new Date()
    //   },
    //   create: {
    //     gebruiker_id: gebruikerId,
    //     les_id: parseInt(lesId),
    //     status,
    //     video_gezien: videoGezien || false,
    //     oefeningen_klaar: oefeningenKlaar || false
    //   }
    // });

    return NextResponse.json({
      voortgang: bestaandeVoortgang,
      success: true
    });
  } catch (error) {
    console.error('Error updating voortgang:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het bijwerken van de voortgang' },
      { status: 500 }
    );
  }
}