'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { IrisWelkom } from '@/components/iris/IrisWelkom';
import { OefeningSection } from '@/components/oefening/OefeningSection';
import { AdvancedOefeningSection } from '@/components/oefening/AdvancedOefeningSection';
import { Play, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// Professionele cursus data voor Module 1 Pro
const mockCursusData = {
  'mindset-voorbereiding': {
    'zelfreflectie-basis': {
      id: 1,
      titel: 'Les 1.1: Het Kompas - Wat zoek je écht?',
      beschrijving: 'Ontdek je kernverlangen in relaties',
      content: `
        <h2>Welkom bij Les 1.1: Het Kompas</h2>
        <p>Voordat we beginnen met het optimaliseren van je dating profiel, is het essentieel om jezelf goed te kennen. Waarom? Omdat authentieke mensen aantrekkelijker zijn dan mensen die doen alsof.</p>

        <p>In deze les gaan we ontdekken:</p>
        <ul>
          <li>Wat je écht zoekt in een relatie</li>
          <li>Welke kwaliteiten je hebt om te bieden</li>
          <li>Hoe je deze inzichten gebruikt voor betere matches</li>
        </ul>

        <p>Klaar om te beginnen? Laten we eerst een paar oefeningen doen om je dating persoonlijkheid te ontdekken.</p>
      `,
      videoUrl: null,
      volgendeLes: 'de-spiegel',
      oefeningen: [
        {
          id: 1,
          titel: 'Wat zoek je in een relatie?',
          beschrijving: 'Beschrijf in 3-5 zinnen wat voor relatie je wilt opbouwen',
          type: 'tekst' as const,
          config: {
            placeholder: 'Bijvoorbeeld: Ik zoek iemand die avontuurlijk is, goed kan luisteren, en samen van quality time houdt...',
            minLength: 50,
            maxLength: 300
          },
          irisContext: 'Gebruiker beschrijft wat ze zoeken in een relatie. Geef warme feedback en stel gerichte vragen om dieper te graven.'
        },
        {
          id: 2,
          titel: 'Jouw unieke kwaliteiten',
          beschrijving: 'Welke 3 kwaliteiten maak jij uniek als partner?',
          type: 'tekst' as const,
          config: {
            placeholder: 'Bijvoorbeeld: 1. Ik ben een goede luisteraar, 2. Ik maak mensen aan het lachen, 3. Ik ben loyaal...',
            minLength: 30,
            maxLength: 200
          },
          irisContext: 'Gebruiker beschrijft eigen kwaliteiten. Erken deze en help ze te zien hoe waardevol ze zijn.'
        }
      ]
    },
    'de-spiegel': {
      id: 2,
      titel: 'Les 1.2: De Spiegel - Zelfreflectie',
      beschrijving: 'Ontdek je hechtingsstijl en relatiepatronen',
      content: `
        <h2>Les 1.2: De Spiegel</h2>
        <p>Nu we weten wat je zoekt, gaan we dieper kijken naar jezelf. Welke relatiepatronen heb je? Hoe ga je om met intimiteit en onafhankelijkheid?</p>

        <p>Deze les helpt je om:</p>
        <ul>
          <li>Je hechtingsstijl te begrijpen</li>
          <li>Oude patronen te herkennen</li>
          <li>Gezondere relatiegewoontes te ontwikkelen</li>
        </ul>
      `,
      videoUrl: null,
      vorigeLes: 'zelfreflectie-basis',
      volgendeLes: 'de-magneet',
      oefeningen: [
        {
          id: 3,
          titel: 'Hechtingsstijl Assessment',
          beschrijving: 'Ontdek je natuurlijke manier van hechten in relaties',
          type: 'psychometric-test' as const,
          config: {
            vragen: [
              {
                id: 'q1',
                vraag: 'Ik vind het moeilijk om anderen volledig te vertrouwen.',
                schaal: 'angst'
              },
              {
                id: 'q2',
                vraag: 'Ik maak me vaak zorgen dat mijn partner me zal verlaten.',
                schaal: 'angst'
              },
              {
                id: 'q3',
                vraag: 'Ik heb behoefte aan constante geruststelling van mijn partner.',
                schaal: 'angst'
              },
              {
                id: 'q4',
                vraag: 'Ik vind het moeilijk om emotioneel afhankelijk te zijn van anderen.',
                schaal: 'vermijding'
              },
              {
                id: 'q5',
                vraag: 'Ik geef er de voorkeur aan om dingen alleen te doen.',
                schaal: 'vermijding'
              },
              {
                id: 'q6',
                vraag: 'Ik voel me ongemakkelijk wanneer anderen te dichtbij komen.',
                schaal: 'vermijding'
              },
              {
                id: 'q7',
                vraag: 'Ik vertrouw erop dat anderen er voor me zullen zijn als ik ze nodig heb.',
                schaal: 'veilig'
              },
              {
                id: 'q8',
                vraag: 'Ik vind het gemakkelijk om intiem te zijn met mijn partner.',
                schaal: 'veilig'
              },
              {
                id: 'q9',
                vraag: 'Ik geloof dat de meeste mensen oprecht zijn in hun bedoelingen.',
                schaal: 'veilig'
              }
            ]
          },
          irisContext: 'Gebruiker doet een hechtingsstijl assessment. Help ze om hun resultaten te begrijpen en hoe dit hun dating gedrag beïnvloedt.'
        }
      ]
    },
    'de-magneet': {
      id: 3,
      titel: 'Les 1.3: De Magneet - Wat trekt jou aan?',
      beschrijving: 'Ontdek welke kwaliteiten jou magnetisch maken',
      content: `
        <h2>Les 1.3: De Magneet</h2>
        <p>Iedereen heeft natuurlijke aantrekkingskracht. In deze les ontdekken we welke 'magneetkrachten' jij hebt die mensen naar je toe trekken.</p>

        <p>Deze les helpt je om:</p>
        <ul>
          <li>Je natuurlijke aantrekkingskracht te begrijpen</li>
          <li>Je sterkste kanten te versterken</li>
          <li>Authentieker te daten</li>
        </ul>
      `,
      videoUrl: null,
      vorigeLes: 'de-spiegel',
      volgendeLes: 'de-radar',
      oefeningen: [
        {
          id: 4,
          titel: 'Magneetkrachten Assessment',
          beschrijving: 'Ontdek welke kwaliteiten jou aantrekkelijk maken',
          type: 'multi-scale-test' as const,
          config: {
            vragen: [
              { id: 'q1', tekst: 'Hoe sterk ben je in intellectuele gesprekken?', schaal: 'intellectueel' },
              { id: 'q2', tekst: 'Hoe goed ben je in het tonen van empathie?', schaal: 'emotioneel' },
              { id: 'q3', tekst: 'Hoe energiek en positief ben je in sociale situaties?', schaal: 'energie' },
              { id: 'q4', tekst: 'Hoe betrouwbaar en consistent ben je?', schaal: 'stabiliteit' },
              { id: 'q5', tekst: 'Hoe intrigerend en mysterieus ben je?', schaal: 'mysterie' },
              { id: 'q6', tekst: 'Hoe diepgaand zijn je ideeën en inzichten?', schaal: 'intellectueel' },
              { id: 'q7', tekst: 'Hoe goed kun je emotionele steun bieden?', schaal: 'emotioneel' },
              { id: 'q8', tekst: 'Hoe inspireer je anderen met je enthousiasme?', schaal: 'energie' },
              { id: 'q9', tekst: 'Hoe creëer je een gevoel van veiligheid?', schaal: 'stabiliteit' },
              { id: 'q10', tekst: 'Hoe wek je nieuwsgierigheid bij anderen?', schaal: 'mysterie' }
            ],
            antwoordOpties: [
              { waarde: 1, label: 'Helemaal niet' },
              { waarde: 2, label: 'Een beetje' },
              { waarde: 3, label: 'Gemiddeld' },
              { waarde: 4, label: 'Behoorlijk' },
              { waarde: 5, label: 'Zeer sterk' }
            ]
          },
          irisContext: 'Gebruiker doet een magneetkrachten assessment. Help ze hun natuurlijke aantrekkingskracht te begrijpen en hoe ze dit kunnen versterken in hun dating profiel.'
        }
      ]
    },
    'de-radar': {
      id: 4,
      titel: 'Les 1.4: De Radar - Rode vlaggen & triggers',
      beschrijving: 'Leer je angsten en triggers herkennen',
      content: `
        <h2>Les 1.4: De Radar</h2>
        <p>Een goede radar helpt je om gevaar te vermijden en kansen te zien. In deze les leer je je eigen angsten en triggers kennen.</p>

        <p>Deze les helpt je om:</p>
        <ul>
          <li>Je grootste angsten te identificeren</li>
          <li>Triggers te herkennen</li>
          <li>Gezondere keuzes te maken</li>
        </ul>
      `,
      videoUrl: null,
      vorigeLes: 'de-magneet',
      volgendeLes: 'de-grond',
      oefeningen: [
        {
          id: 5,
          titel: 'Gereedheids Check',
          beschrijving: 'Beoordeel je emotionele gereedheid voor dating',
          type: 'pilaren-score' as const,
          config: {
            pilaren: [
              {
                id: 'onafhankelijkheid',
                naam: 'Emotionele Onafhankelijkheid',
                beschrijving: 'Kun je gelukkig zijn zonder partner?',
                uitersten: {
                  laag: 'Afhankelijk van anderen',
                  hoog: 'Gelukkig alleen'
                }
              },
              {
                id: 'ex-neutraliteit',
                naam: 'Ex-Neutraliteit',
                beschrijving: 'Ben je emotioneel klaar voor nieuwe liefde?',
                uitersten: {
                  laag: 'Nog emotioneel verbonden',
                  hoog: 'Volledig klaar voor nieuw'
                }
              },
              {
                id: 'basis-op-orde',
                naam: 'Basis op Orde',
                beschrijving: 'Heb je stabiele levensbasis?',
                uitersten: {
                  laag: 'Veel chaos in leven',
                  hoog: 'Stabiele fundering'
                }
              },
              {
                id: 'zelfacceptatie',
                naam: 'Zelfacceptatie',
                beschrijving: 'Houd je van jezelf zoals je bent?',
                uitersten: {
                  laag: 'Veel zelfkritiek',
                  hoog: 'Volledig zelfacceptatie'
                }
              }
            ]
          },
          irisContext: 'Gebruiker doet een gereedheids check. Help ze eerlijk te zijn over hun emotionele staat en geef gerichte adviezen voor verbetering.'
        }
      ]
    },
    'de-grond': {
      id: 5,
      titel: 'Les 1.5: De Grond - Kernkwaliteiten',
      beschrijving: 'Bepaal je niet-onderhandelbare kwaliteiten',
      content: `
        <h2>Les 1.5: De Grond</h2>
        <p>Net zoals een huis een sterke fundering nodig heeft, hebben relaties kernkwaliteiten nodig. In deze les bepaal je welke kwaliteiten niet-onderhandelbaar zijn.</p>

        <p>Deze les helpt je om:</p>
        <ul>
          <li>Je kernwaarden te definiëren</li>
          <li>Duidelijke grenzen te stellen</li>
          <li>Betere matches aan te trekken</li>
        </ul>
      `,
      videoUrl: null,
      vorigeLes: 'de-radar',
      volgendeLes: 'de-kaart',
      oefeningen: [
        {
          id: 6,
          titel: 'Angst Ranking',
          beschrijving: 'Rangschik je grootste dating angsten van meest naar minst aanwezig',
          type: 'ranking' as const,
          config: {
            items: [
              { id: 'afwijzing', label: 'Afwijzing - Bang om afgewezen te worden' },
              { id: 'kwetsbaarheid', label: 'Kwetsbaarheid - Moeite met emotioneel openstellen' },
              { id: 'vrijheid', label: 'Verlies van vrijheid - Angst om vast te zitten' },
              { id: 'oordeel', label: 'Oordeel van anderen - Wat zullen mensen denken?' },
              { id: 'waardeloos', label: 'Niet goed genoeg zijn - Voel je waardeloos' },
              { id: 'verandering', label: 'Verandering - Bang voor wat er gaat gebeuren' },
              { id: 'intimiteit', label: 'Intimiteit - Moeite met fysieke/emotionele nabijheid' },
              { id: 'vertrouwen', label: 'Vertrouwen - Moeite met anderen te geloven' }
            ]
          },
          irisContext: 'Gebruiker rangschikt hun dating angsten. Help ze te begrijpen welke angsten hun gedrag beïnvloeden en hoe ze hiermee kunnen omgaan.'
        }
      ]
    },
    'de-kaart': {
      id: 6,
      titel: 'Les 1.6: De Kaart - Jouw dating strategie',
      beschrijving: 'Breng alles samen in een persoonlijk plan',
      content: `
        <h2>Les 1.6: De Kaart</h2>
        <p>Nu je jezelf beter kent, is het tijd om een strategie te maken. Deze les helpt je om al je inzichten samen te brengen in een concreet actieplan.</p>

        <p>Deze les helpt je om:</p>
        <ul>
          <li>Een persoonlijk dating plan te maken</li>
          <li>Concrete doelen te stellen</li>
          <li>Je voortgang te meten</li>
        </ul>
      `,
      videoUrl: null,
      vorigeLes: 'de-grond',
      oefeningen: [
        {
          id: 7,
          titel: 'Kernkwaliteiten Selectie',
          beschrijving: 'Kies je niet-onderhandelbare partner kwaliteiten',
          type: 'kernkwaliteiten-selector' as const,
          config: {
            presetItems: [
              'Betrouwbaarheid', 'Eerlijkheid', 'Empathie', 'Respect', 'Loyaliteit',
              'Communicatie', 'Humor', 'Intelligentie', 'Ambition', 'Creativiteit',
              'Liefdevol', 'Ondersteunend', 'Gelijkwaardig', 'Groei-mindset', 'Spiritueel',
              'Avontuurlijk', 'Rustig', 'Sociaal', 'Praktisch', 'Romantisch'
            ],
            categorieën: [
              { id: 'essentieel', label: 'Niet-onderhandelbaar', max: 5, color: 'pink' },
              { id: 'niceToHave', label: 'Leuk om te hebben', max: 10, color: 'yellow' },
              { id: 'irrelevant', label: 'Maakt niet uit', max: 100, color: 'gray' }
            ],
            validatie: {
              maxEssentieel: 5,
              foutmelding: 'Kies maximaal 5 niet-onderhandelbare kwaliteiten'
            }
          },
          irisContext: 'Gebruiker selecteert kernkwaliteiten voor hun ideale partner. Help ze te focussen op wat echt belangrijk is voor duurzame relaties.'
        }
      ]
    }
  }
};

interface LesContainerProps {
  moduleSlug: string;
  lesSlug: string;
}

export function LesContainer({ moduleSlug, lesSlug }: LesContainerProps) {
  const [currentOefening, setCurrentOefening] = useState(0);
  const [completedOefeningen, setCompletedOefeningen] = useState<Set<number>>(new Set());
  const [videoGezien, setVideoGezien] = useState(false);

  // Get the current lesson data
  const currentLes = mockCursusData[moduleSlug]?.[lesSlug];

  if (!currentLes) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Les niet gevonden</h2>
            <p className="text-gray-600">Deze les bestaat nog niet.</p>
            <Link href={`/cursus/${moduleSlug}`}>
              <Button className="mt-4">Terug naar module</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const voortgang = (completedOefeningen.size / currentLes.oefeningen.length) * 100;

  const handleOefeningComplete = (oefeningId: number) => {
    setCompletedOefeningen(prev => new Set([...prev, oefeningId]));
  };

  const volgendeOefening = () => {
    if (currentOefening < currentLes.oefeningen.length - 1) {
      setCurrentOefening(currentOefening + 1);
    }
  };

  const vorigeOefening = () => {
    if (currentOefening > 0) {
      setCurrentOefening(currentOefening - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header met voortgang */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/cursus/${moduleSlug}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar module
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {currentLes.titel}
          </h1>
          <p className="text-gray-600 mb-4">
            {currentLes.beschrijving}
          </p>

          {/* Voortgang bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Voortgang</span>
              <span>{completedOefeningen.size} van {currentLes.oefeningen.length} oefeningen</span>
            </div>
            <Progress value={voortgang} className="h-3" />
          </div>
        </div>
      </div>

      {/* Les content */}
      <div className="space-y-8">
        {/* Video sectie (placeholder voor HeyGen) */}
        {currentLes.videoUrl && (
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Video komt binnenkort beschikbaar</p>
                </div>
              </div>
              <Button
                onClick={() => setVideoGezien(true)}
                className="w-full"
                disabled={videoGezien}
              >
                {videoGezien ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Video bekeken
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Video bekijken
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Les tekst */}
        <Card>
          <CardContent className="p-6">
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: currentLes.content }}
            />
          </CardContent>
        </Card>

        {/* Iris welkomstbericht */}
        <IrisWelkom bericht="Hoi! Welkom bij deze les. Ik ben Iris en ik help je om het maximale uit deze oefeningen te halen. Neem je tijd en schrijf op wat écht bij je past." />

        {/* Oefeningen */}
        {currentLes.oefeningen.map((oefening, index) => {
          // Check if this is an advanced exercise type
          const isAdvancedType = ['psychometric-test', 'multi-scale-test', 'pilaren-score', 'ranking', 'kernkwaliteiten-selector', 'strategy-planning'].includes(oefening.type);

          if (isAdvancedType) {
            return (
              <AdvancedOefeningSection
                key={oefening.id}
                oefening={oefening}
                isActive={index === currentOefening}
                isCompleted={completedOefeningen.has(oefening.id)}
                onComplete={() => handleOefeningComplete(oefening.id)}
                moduleSlug={moduleSlug}
                lesSlug={lesSlug}
              />
            );
          } else {
            return (
              <OefeningSection
                key={oefening.id}
                oefening={oefening}
                isActive={index === currentOefening}
                isCompleted={completedOefeningen.has(oefening.id)}
                onComplete={() => handleOefeningComplete(oefening.id)}
                moduleSlug={moduleSlug}
                lesSlug={lesSlug}
              />
            );
          }
        })}

        {/* Navigatie */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-sm">
          <Button
            variant="outline"
            onClick={vorigeOefening}
            disabled={currentOefening === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vorige oefening
          </Button>

          <div className="text-sm text-gray-600">
            Oefening {currentOefening + 1} van {currentLes.oefeningen.length}
          </div>

          <Button
            onClick={volgendeOefening}
            disabled={currentOefening === currentLes.oefeningen.length - 1}
          >
            Volgende oefening
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Les compleet */}
        {completedOefeningen.size === currentLes.oefeningen.length && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">
                Les voltooid! 🎉
              </h3>
              <p className="text-green-700 mb-4">
                Goed gedaan! Je hebt alle oefeningen voltooid. Deze inzichten helpen je om een authentieker profiel te maken.
              </p>
              <div className="flex gap-3 justify-center">
                {currentLes.vorigeLes && (
                  <Link href={`/cursus/${moduleSlug}/${currentLes.vorigeLes}`}>
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Vorige les
                    </Button>
                  </Link>
                )}
                <Link href={`/cursus/${moduleSlug}`}>
                  <Button variant="outline">
                    Terug naar module
                  </Button>
                </Link>
                {currentLes.volgendeLes && (
                  <Link href={`/cursus/${moduleSlug}/${currentLes.volgendeLes}`}>
                    <Button>
                      Volgende les
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}