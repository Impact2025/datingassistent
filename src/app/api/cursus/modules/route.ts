import { NextRequest, NextResponse } from 'next/server';

// Mock data voor development - later vervangen door database queries
const mockModules = [
  {
    id: 1,
    slug: 'mindset-voorbereiding',
    titel: 'Goed Jezelf Kennen - De Basis',
    beschrijving: 'Ontdek wat je écht zoekt in de liefde. Waarom zelfkennis de basis is voor aantrekkelijke profielen.',
    icon: 'Brain',
    volgorde: 1,
    toegang_niveau: 'free',
    is_actief: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    slug: 'profiel-optimalisatie',
    titel: 'Profiel van Onzichtbaar naar Onweerstaanbaar',
    beschrijving: 'Transformeer je dating profiel van onzichtbaar naar onweerstaanbaar met bewezen technieken.',
    icon: 'User',
    volgorde: 2,
    toegang_niveau: 'core',
    is_actief: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 3,
    slug: 'gesprekken-masterclass',
    titel: 'Gesprekken van Awkward naar Awesome',
    beschrijving: 'Leer hoe je van eerste bericht naar diepgaande gesprekken gaat. Van opener tot eerste date.',
    icon: 'MessageCircle',
    volgorde: 3,
    toegang_niveau: 'pro',
    is_actief: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 4,
    slug: 'date-planning-expert',
    titel: 'Date Planning voor Succesvolle Ontmoetingen',
    beschrijving: 'Plan perfecte dates die leiden tot tweede dates. Van locatie keuze tot gespreksonderwerpen.',
    icon: 'CalendarHeart',
    volgorde: 4,
    toegang_niveau: 'pro',
    is_actief: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
];

export async function GET(req: NextRequest) {
  try {
    // Later: Haal modules op uit database
    // const modules = await prisma.modules.findMany({
    //   where: { is_actief: true },
    //   orderBy: { volgorde: 'asc' }
    // });

    // Voor nu: filter alleen actieve modules
    const activeModules = mockModules.filter(module => module.is_actief);

    return NextResponse.json({
      modules: activeModules,
      total: activeModules.length
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van de modules' },
      { status: 500 }
    );
  }
}