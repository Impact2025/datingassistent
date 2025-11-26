import { NextRequest, NextResponse } from 'next/server';

// Mock data voor development - later vervangen door database queries
const mockLes = {
  id: 1,
  module_id: 1,
  slug: 'introductie-module-1',
  titel: 'Introductie Module 1: Goed Jezelf Kennen',
  beschrijving: 'Waarom zelfkennis de basis is voor aantrekkelijke profielen',
  volgorde: 1,
  type: 'les',
  duur_minuten: 15,
  video_url: null, // Later invullen met HeyGen video
  content: `
    <h2>Welkom bij je eerste les!</h2>
    <p>Voordat we beginnen met het optimaliseren van je dating profiel, is het essentieel om jezelf goed te kennen. Waarom? Omdat authentieke mensen aantrekkelijker zijn dan mensen die doen alsof.</p>

    <p>In deze les gaan we ontdekken:</p>
    <ul>
      <li>Wat je écht zoekt in een relatie</li>
      <li>Welke kwaliteiten je hebt om te bieden</li>
      <li>Hoe je deze inzichten gebruikt voor betere matches</li>
    </ul>

    <p>Klaar om te beginnen? Laten we eerst een paar oefeningen doen om je dating persoonlijkheid te ontdekken.</p>
  `,
  is_actief: true,
  oefeningen: [
    {
      id: 1,
      les_id: 1,
      titel: 'Wat zoek je in een relatie?',
      beschrijving: 'Beschrijf in 3-5 zinnen wat voor relatie je wilt opbouwen',
      type: 'tekst' as const,
      config: {
        placeholder: 'Bijvoorbeeld: Ik zoek iemand die avontuurlijk is, goed kan luisteren, en samen van quality time houdt...',
        minLength: 50,
        maxLength: 300
      },
      irisContext: 'Gebruiker beschrijft wat ze zoeken in een relatie. Geef warme feedback en stel gerichte vragen om dieper te graven.',
      volgorde: 1
    },
    {
      id: 2,
      les_id: 1,
      titel: 'Jouw unieke kwaliteiten',
      beschrijving: 'Welke 3 kwaliteiten maak jij uniek als partner?',
      type: 'tekst' as const,
      config: {
        placeholder: 'Bijvoorbeeld: 1. Ik ben een goede luisteraar, 2. Ik maak mensen aan het lachen, 3. Ik ben loyaal...',
        minLength: 30,
        maxLength: 200
      },
      irisContext: 'Gebruiker beschrijft eigen kwaliteiten. Erken deze en help ze te zien hoe waardevol ze zijn.',
      volgorde: 2
    }
  ]
};

export async function GET(
  req: NextRequest,
  { params }: { params: { moduleSlug: string; lesSlug: string } }
) {
  try {
    const { moduleSlug, lesSlug } = params;

    // Later: Haal les op uit database
    // const les = await prisma.lessen.findFirst({
    //   where: {
    //     slug: lesSlug,
    //     module: { slug: moduleSlug },
    //     is_actief: true
    //   },
    //   include: {
    //     oefeningen: {
    //       orderBy: { volgorde: 'asc' }
    //     }
    //   }
    // });

    // Voor nu: return mock data als de slugs matchen
    if (moduleSlug === 'mindset-voorbereiding' && lesSlug === 'introductie-module-1') {
      return NextResponse.json({
        les: mockLes,
        module: {
          slug: moduleSlug,
          titel: 'Goed Jezelf Kennen - De Basis'
        }
      });
    }

    // Les niet gevonden
    return NextResponse.json(
      { error: 'Les niet gevonden' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching les:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van de les' },
      { status: 500 }
    );
  }
}