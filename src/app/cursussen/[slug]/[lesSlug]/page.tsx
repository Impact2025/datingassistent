'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button-system';
import { ArrowLeft, ArrowRight, CheckCircle, Play } from 'lucide-react';
import { IrisChatPanel } from '@/components/iris/IrisChatPanel';
import { ComparisonSectie } from './components/ComparisonSectie';
import { InsightSectie } from './components/InsightSectie';
import { ExamplesSectie } from './components/ExamplesSectie';
import { InteractiveSectie } from './components/InteractiveSectie';
import { useUser } from '@/providers/user-provider';
import { getCanonicalSlug } from '@/lib/cursus-slug-utils';

interface LesData {
  id: number;
  cursus_id: number;
  slug: string;
  titel: string;
  beschrijving?: string;
  volgorde: number;
  secties: any[];
  user_progress: {
    status: string;
    voltooide_secties: number[];
    laatste_sectie_id: number | null;
    quiz_scores: Record<number, number>;
  };
  navigatie: {
    vorige: { id: number; slug: string; titel: string } | null;
    volgende: { id: number; slug: string; titel: string } | null;
  };
  cursus: {
    id: number;
    slug: string;
    titel: string;
  };
}

export default function LesViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { slug: rawSlug, lesSlug } = params as { slug: string; lesSlug: string };
  const { user } = useUser();

  // ✨ WERELDKLASSE: Redirect to canonical URL if using alias
  useEffect(() => {
    const { canonical, wasAlias } = getCanonicalSlug(rawSlug);
    if (wasAlias) {
      console.log(`🔄 Redirecting from alias ${rawSlug} to canonical ${canonical}`);
      router.replace(`/cursussen/${canonical}/${lesSlug}`);
    }
  }, [rawSlug, lesSlug, router]);

  const slug = rawSlug; // API will handle the alias resolution

  const [les, setLes] = useState<LesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [huidigeSecties, setHuidigeSecties] = useState(0);

  useEffect(() => {
    if (slug && lesSlug) {
      fetchLes();
    }
  }, [slug, lesSlug]);

  const fetchLes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cursussen/${slug}/${lesSlug}`);

      if (!response.ok) {
        throw new Error('Les niet gevonden');
      }

      const data = await response.json();
      console.log('🔍 DEBUG: Fetched lesson data:', data);
      console.log('🔍 DEBUG: Secties array:', data.les?.secties);

      // Log details of each sectie
      data.les?.secties?.forEach((s: any, i: number) => {
        console.log(`📝 Section ${i + 1}:`, {
          type: s.sectie_type,
          titel: s.titel,
          hasInhoud: !!s.inhoud,
          inhoud: s.inhoud
        });
      });

      setLes(data.les);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching les:', err);
    } finally {
      setLoading(false);
    }
  };

  const markSectieCompleted = async (sectieId: number, extraData?: any) => {
    if (!les) return;

    // Update local state
    const updatedVoltooide = [...les.user_progress.voltooide_secties];
    if (!updatedVoltooide.includes(sectieId)) {
      updatedVoltooide.push(sectieId);
    }

    setLes({
      ...les,
      user_progress: {
        ...les.user_progress,
        voltooide_secties: updatedVoltooide,
        laatste_sectie_id: sectieId
      }
    });

    // Save to backend
    if (!user?.id) {
      console.warn('⚠️ No user logged in, cannot save progress');
      return;
    }

    try {
      const response = await fetch(`/api/cursussen/${slug}/${lesSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sectieId,
          lesId: les.id,
          cursusId: les.cursus.id,
          status: 'completed',
          ...extraData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      console.log('✅ Progress saved to database for user', user.id);
    } catch (err) {
      console.error('❌ Error saving progress:', err);
    }
  };

  const renderSectie = (sectie: any, index: number) => {
    const isCompleted = les?.user_progress.voltooide_secties.includes(sectie.id);

    switch (sectie.sectie_type) {
      case 'video':
        return (
          <VideoSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markSectieCompleted(sectie.id)}
          />
        );

      case 'tekst':
        return (
          <TekstSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markSectieCompleted(sectie.id)}
          />
        );

      case 'kernpunten':
        return (
          <KernpuntenSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markSectieCompleted(sectie.id)}
          />
        );

      case 'quiz':
        return (
          <QuizSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={(score, antwoorden) => {
              markSectieCompleted(sectie.id, {
                quizScore: score,
                quizAntwoorden: antwoorden
              });
              // Update local quiz score
              setLes(prev => prev ? {
                ...prev,
                user_progress: {
                  ...prev.user_progress,
                  quiz_scores: { ...prev.user_progress.quiz_scores, [sectie.id]: score }
                }
              } : null);
            }}
          />
        );

      case 'reflectie':
        return (
          <ReflectieSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={(antwoord: string) => {
              markSectieCompleted(sectie.id, {
                reflectieAntwoord: antwoord
              });
            }}
          />
        );

      case 'opdracht':
        return (
          <OpdrachtSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={(voltooide: number[]) => {
              markSectieCompleted(sectie.id, {
                opdrachtVoltooide: voltooide
              });
            }}
          />
        );

      case 'tool':
        return (
          <ToolSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markSectieCompleted(sectie.id)}
          />
        );

      case 'tip':
        return (
          <TipSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markSectieCompleted(sectie.id)}
          />
        );

      case 'actieplan':
        return (
          <ActieplanSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={(voltooideActies: number[]) => {
              markSectieCompleted(sectie.id, {
                actieplanVoltooide: voltooideActies
              });
            }}
          />
        );

      case 'comparison':
        return (
          <ComparisonSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markSectieCompleted(sectie.id)}
          />
        );

      case 'insight':
        return (
          <InsightSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markSectieCompleted(sectie.id)}
          />
        );

      case 'examples':
        return (
          <ExamplesSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markSectieCompleted(sectie.id)}
          />
        );

      case 'interactive':
        return (
          <InteractiveSectie
            key={sectie.id}
            sectie={sectie}
            isCompleted={isCompleted}
            onComplete={() => markSectieCompleted(sectie.id)}
          />
        );

      default:
        return (
          <Card key={sectie.id} className="mb-6">
            <CardContent className="p-6">
              <p className="text-gray-500">Onbekend sectie type: {sectie.sectie_type}</p>
              <p className="text-xs text-gray-400 mt-2">Type: {sectie.sectie_type}</p>
            </CardContent>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-48 bg-white rounded shadow-sm"></div>
            <div className="h-32 bg-white rounded shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !les) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <Card className="max-w-md border-0 shadow-sm bg-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Les niet gevonden</h2>
            <p className="text-gray-600 mb-6 text-sm">{error || 'Deze les bestaat niet of is niet beschikbaar.'}</p>
            <Link href={`/cursussen/${slug}`}>
              <SecondaryButton>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar cursus
              </SecondaryButton>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSecties = les.secties.length;
  const voltooideSecties = les.user_progress.voltooide_secties.length;
  const progressPercentage = totalSecties > 0 ? Math.round((voltooideSecties / totalSecties) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Clean & Minimal */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link
            href={`/cursussen/${slug}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {les.cursus.titel}
          </Link>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{les.titel}</h1>

          {les.beschrijving && (
            <p className="text-gray-600 text-sm">{les.beschrijving}</p>
          )}

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">
                {voltooideSecties} van {totalSecties} secties voltooid
              </span>
              <span className="font-medium text-pink-600">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Secties */}
        <div className="space-y-6">
          {les.secties.map((sectie, index) => renderSectie(sectie, index))}
        </div>

        {/* Iris AI Coach */}
        <div className="mt-12">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">AI</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Iris Insights</h3>
                  <p className="text-sm text-gray-600">Je persoonlijke dating coach</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Heb je vragen over deze les? Stel ze aan Iris.
              </p>
              <IrisChatPanel
                initialContext={`De gebruiker volgt nu de cursus "${les.cursus.titel}", les: "${les.titel}".
                  Deze les bevat ${les.secties.length} secties over verschillende onderwerpen.
                  Je kunt de gebruiker helpen met vragen over de les inhoud, praktische tips, en hoe ze de theorie kunnen toepassen in hun dating leven.`}
                variant="compact"
              />
            </CardContent>
          </Card>
        </div>

        {/* Navigatie */}
        <div className="mt-12">
          <div className="flex justify-between items-center gap-4">
            <div>
              {les.navigatie.vorige ? (
                <Link href={`/cursussen/${slug}/${les.navigatie.vorige.slug}`}>
                  <SecondaryButton>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Vorige les
                  </SecondaryButton>
                </Link>
              ) : (
                <div></div>
              )}
            </div>

            <div>
              {les.navigatie.volgende ? (
                <Link href={`/cursussen/${slug}/${les.navigatie.volgende.slug}`}>
                  <PrimaryButton>
                    Volgende les
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </PrimaryButton>
                </Link>
              ) : (
                <Link href={`/cursussen/${slug}`}>
                  <PrimaryButton>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Cursus afronden
                  </PrimaryButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SECTIE COMPONENTS ====================

function VideoSectie({ sectie, isCompleted, onComplete }: any) {
  const [watched, setWatched] = useState(isCompleted);

  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-pink-500" />}
        </div>

        {sectie.beschrijving && (
          <p className="text-gray-600 mb-6">{sectie.beschrijving}</p>
        )}

        {/* Intro tekst */}
        {sectie.inhoud?.introTekst && (
          <p className="text-gray-700 mb-6">{sectie.inhoud.introTekst}</p>
        )}

        {/* Video Player */}
        {sectie.inhoud?.videoUrl ? (
          sectie.inhoud.videoUrl.includes('youtube.com') || sectie.inhoud.videoUrl.includes('vimeo.com') ? (
            // YouTube/Vimeo embed
            <div className="bg-black rounded-lg aspect-video mb-6 overflow-hidden">
              <iframe
                className="w-full h-full"
                src={sectie.inhoud.videoUrl}
                title={sectie.titel}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            // Lokale video (MP4, WebM, etc.)
            <div className="bg-black rounded-lg aspect-video mb-6 overflow-hidden">
              <video
                className="w-full h-full"
                controls
                controlsList="nodownload"
                onEnded={() => {
                  setWatched(true);
                  onComplete();
                }}
              >
                <source src={sectie.inhoud.videoUrl} type="video/mp4" />
                Je browser ondersteunt deze video niet.
              </video>
            </div>
          )
        ) : (
          <div className="bg-gray-100 rounded-lg aspect-video mb-6 flex flex-col items-center justify-center text-gray-400">
            <Play className="w-12 h-12 mb-2" />
            <p className="text-sm">Video wordt binnenkort toegevoegd</p>
          </div>
        )}

        {!watched && (
          <button
            onClick={() => {
              setWatched(true);
              onComplete();
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Markeer als bekeken
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function TekstSectie({ sectie, isCompleted, onComplete }: any) {
  const content = sectie.inhoud?.body || sectie.inhoud?.tekst || sectie.inhoud?.intro || sectie.inhoud?.vraag || '';
  const voorbeelden = sectie.inhoud?.voorbeelden;
  const categorieen = sectie.inhoud?.categorieen;
  const waarschuwing = sectie.inhoud?.waarschuwing;
  const isMarkdown = sectie.inhoud?.format === 'markdown' || content.includes('**') || content.includes('\n\n');

  // State voor geselecteerde optie(s)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  // Simple markdown parser
  const renderContent = (text: string) => {
    if (!isMarkdown) return text;

    return text.split('\n\n').map((paragraph, idx) => {
      // Bold text
      let formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic text
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Line breaks
      formatted = formatted.replace(/\n/g, '<br />');

      return (
        <p
          key={idx}
          className="text-gray-700 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  const handleOptieClick = (idx: number) => {
    if (isCompleted) return; // Niet klikbaar als al voltooid

    setSelectedOptions(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx) // Deselect
        : [...prev, idx] // Select
    );
  };

  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        {sectie.titel && (
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{sectie.titel}</h3>
            {isCompleted && <CheckCircle className="w-5 h-5 text-pink-500" />}
          </div>
        )}

        {/* Intro or main content */}
        {content && (
          <div className="prose max-w-none mb-6">
            {isMarkdown ? renderContent(content) : (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
            )}
          </div>
        )}

        {/* Categorieen (voor oefening type) */}
        {categorieen && Array.isArray(categorieen) && (
          <div className="space-y-4 mb-6">
            {categorieen.map((cat: any, idx: number) => (
              <div key={idx} className="p-5 rounded-lg border-2 border-gray-200 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2 text-base">{cat.naam}</h4>
                {cat.beschrijving && (
                  <p className="text-sm text-gray-600 mb-3 italic">{cat.beschrijving}</p>
                )}
                {cat.voorbeelden && Array.isArray(cat.voorbeelden) && (
                  <ul className="space-y-2">
                    {cat.voorbeelden.map((vb: string, vidx: number) => (
                      <li key={vidx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-pink-500 mt-1">•</span>
                        <span>{vb}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Opties voor hook-type secties - NU INTERACTIEF */}
        {sectie.inhoud?.opties && (
          <div className="space-y-3 mb-6">
            {sectie.inhoud.opties.map((optie: any, idx: number) => {
              const isSelected = selectedOptions.includes(idx);

              return (
                <div
                  key={idx}
                  onClick={() => handleOptieClick(idx)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isCompleted ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-pink-500'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-white fill-current" />
                    )}
                  </div>
                  <span className={`text-gray-800 font-medium ${isSelected ? 'text-gray-900' : ''}`}>
                    {optie.tekst || optie}
                  </span>
                </div>
              );
            })}
            {sectie.inhoud?.context && (
              <p className="text-sm text-gray-600 mt-4 italic">{sectie.inhoud.context}</p>
            )}
          </div>
        )}

        {/* Voorbeelden (voor "Van Vaag naar Concreet" type secties) */}
        {voorbeelden && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {voorbeelden.vaag && (
              <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-red-500">❌</span> Vaag
                </h4>
                <ul className="space-y-2">
                  {voorbeelden.vaag.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {voorbeelden.concreet && (
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <span className="text-green-500">✓</span> Concreet
                </h4>
                <ul className="space-y-2">
                  {voorbeelden.concreet.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-green-800">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Waarschuwing (voor oefening type) */}
        {waarschuwing && (
          <div className="p-4 rounded-lg bg-amber-50 border-l-4 border-amber-500 mb-6">
            <p className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-1">
              <span>⚠️</span> Let op:
            </p>
            <p className="text-sm text-amber-800">{waarschuwing}</p>
          </div>
        )}

        {!isCompleted && (
          <button
            onClick={onComplete}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Gelezen
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function KernpuntenSectie({ sectie, isCompleted, onComplete }: any) {
  const items = sectie.inhoud?.items || [];
  const punten = sectie.inhoud?.punten || [];
  const intro = sectie.inhoud?.intro || '';

  // Gebruik items voor Meesterschap in Relaties, punten voor Dating Fundament PRO
  const displayItems = items.length > 0 ? items : punten;

  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{sectie.titel || 'Kernpunten'}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-pink-500" />}
        </div>

        {intro && (
          <p className="text-gray-700 mb-6 leading-relaxed">{intro}</p>
        )}

        <ul className="space-y-4 mb-6">
          {displayItems.map((item: any, idx: number) => {
            // Support beide structuren: {naam, desc} en {titel, beschrijving} en {icon, titel, beschrijving}
            const titel = item.naam || item.titel || '';
            const beschrijving = item.desc || item.beschrijving || '';
            const icon = item.icon || null;

            // Skip items met lege titel en beschrijving
            if (!titel && !beschrijving) return null;

            return (
              <li key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {icon ? (
                  <div className="shrink-0 text-2xl mt-0.5">
                    {icon}
                  </div>
                ) : (
                  <div className="shrink-0 w-7 h-7 rounded-md bg-pink-500 text-white flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </div>
                )}
                <div className="flex-1">
                  {titel && <div className="font-semibold text-gray-900 mb-1">{titel}</div>}
                  {beschrijving && <div className="text-gray-600 text-sm leading-relaxed">{beschrijving}</div>}
                </div>
              </li>
            );
          })}
        </ul>

        {!isCompleted && (
          <button
            onClick={onComplete}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Begrepen
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function QuizSectie({ sectie, isCompleted, onComplete }: any) {
  const vragen = sectie.quiz_vragen || [];
  const savedAntwoorden = sectie.user_progress?.quiz_antwoorden || {};
  const savedScore = sectie.user_progress?.quiz_score || null;
  const [antwoorden, setAntwoorden] = useState<Record<number, string>>(savedAntwoorden);
  const [submitted, setSubmitted] = useState(isCompleted);
  const [score, setScore] = useState<number | null>(savedScore);

  const handleSubmit = () => {
    let correct = 0;
    vragen.forEach((vraag: any) => {
      // Check of het antwoord correct is
      const gekozenOptie = vraag.opties?.find((opt: any) =>
        typeof opt === 'object' ? opt.id === antwoorden[vraag.id] : opt === antwoorden[vraag.id]
      );

      if (typeof gekozenOptie === 'object' && gekozenOptie.correct) {
        correct++;
      } else if (antwoorden[vraag.id] === vraag.correct_antwoord) {
        correct++;
      }
    });

    const percentage = Math.round((correct / vragen.length) * 100);
    setScore(percentage);
    setSubmitted(true);
    onComplete(percentage, antwoorden);
  };

  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{sectie.titel || 'Quiz'}</h3>
          {submitted && <CheckCircle className="w-5 h-5 text-pink-500" />}
        </div>

        {sectie.beschrijving && (
          <p className="text-gray-600 mb-6">{sectie.beschrijving}</p>
        )}

        <div className="space-y-6">
          {vragen.map((vraag: any, idx: number) => (
            <div key={vraag.id} className="border-l-2 border-gray-300 pl-5">
              <p className="font-semibold text-gray-900 mb-3">
                {idx + 1}. {vraag.vraag}
              </p>

              <div className="space-y-2">
                {vraag.opties.map((optie: any, optieIdx: number) => {
                  // Ondersteun zowel object als string opties
                  const optieId = typeof optie === 'object' ? optie.id : optie;
                  const optieTekst = typeof optie === 'object' ? optie.tekst : optie;
                  const isCorrect = typeof optie === 'object' ? optie.correct : optie === vraag.correct_antwoord;

                  return (
                    <label
                      key={optieIdx}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        submitted
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : antwoorden[vraag.id] === optieId
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white'
                          : antwoorden[vraag.id] === optieId
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`vraag-${vraag.id}`}
                        value={optieId}
                        checked={antwoorden[vraag.id] === optieId}
                        onChange={(e) => setAntwoorden({ ...antwoorden, [vraag.id]: e.target.value })}
                        disabled={submitted}
                        className="text-pink-500"
                      />
                      <span className={`text-sm ${submitted && isCorrect ? 'font-semibold' : ''}`}>
                        {optieTekst}
                      </span>
                    </label>
                  );
                })}
              </div>

              {submitted && vraag.uitleg && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Uitleg:</strong> {vraag.uitleg}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {!submitted && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(antwoorden).length !== vragen.length}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Quiz indienen
            </button>
          </div>
        )}

        {submitted && score !== null && (
          <div className="mt-6 p-5 bg-green-50 rounded-lg border-2 border-green-200">
            <p className="text-base font-semibold text-green-900">
              Score: {score}% ({Object.values(antwoorden).filter((a, i) => a === vragen[i]?.correct_antwoord).length}/{vragen.length} correct)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReflectieSectie({ sectie, isCompleted, onComplete }: any) {
  const savedAntwoord = sectie.user_progress?.reflectie_antwoord || '';
  const [antwoord, setAntwoord] = useState(savedAntwoord);
  const [saved, setSaved] = useState(isCompleted);

  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{sectie.titel || 'Reflectievraag'}</h3>
          {saved && <CheckCircle className="w-5 h-5 text-pink-500" />}
        </div>

        {/* Reflectievraag kan in vragen array zitten of als enkele vraag */}
        <p className="text-gray-700 mb-6 leading-relaxed">
          {sectie.inhoud?.vragen?.[0] || sectie.inhoud?.vraag || sectie.beschrijving}
        </p>

        <textarea
          className="w-full min-h-[120px] p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all text-gray-900 placeholder:text-gray-400"
          placeholder="Schrijf hier je antwoord..."
          value={antwoord}
          onChange={(e) => setAntwoord(e.target.value)}
          disabled={saved}
        />

        {!saved && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSaved(true);
                onComplete(antwoord);
              }}
              disabled={antwoord.trim().length === 0}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Opslaan
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OpdrachtSectie({ sectie, isCompleted, onComplete }: any) {
  const acties = sectie.inhoud?.acties || [];
  const introTekst = sectie.inhoud?.tekst || '';
  const savedVoltooide = sectie.user_progress?.opdracht_voltooide_taken || [];
  const [voltooide, setVoltooide] = useState<number[]>(isCompleted ? acties.map((_: any, i: number) => i) : savedVoltooide);

  const handleTaakToggle = (idx: number) => {
    setVoltooide(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const allCompleted = voltooide.length === acties.length && acties.length > 0;

  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{sectie.titel || 'In de Praktijk'}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-pink-500" />}
        </div>

        {introTekst && (
          <p className="text-gray-700 mb-6 leading-relaxed">{introTekst}</p>
        )}

        <div className="space-y-3 mb-6">
          {acties.map((actie: string, idx: number) => (
            <label
              key={idx}
              className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:bg-pink-50 hover:border-pink-300 transition-all"
            >
              <input
                type="checkbox"
                checked={voltooide.includes(idx)}
                onChange={() => handleTaakToggle(idx)}
                disabled={isCompleted}
                className="mt-1 w-5 h-5 text-pink-500 rounded"
              />
              <span className={voltooide.includes(idx) ? 'line-through text-gray-500' : 'text-gray-800'}>
                {actie}
              </span>
            </label>
          ))}
        </div>

        {!isCompleted && allCompleted && (
          <button
            onClick={() => onComplete(voltooide)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Opdracht voltooien
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function ToolSectie({ sectie, isCompleted, onComplete }: any) {
  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{sectie.titel}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-pink-500" />}
        </div>

        {/* Intro tekst */}
        {sectie.inhoud?.introTekst && (
          <p className="text-gray-700 mb-6 leading-relaxed">{sectie.inhoud.introTekst}</p>
        )}

        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg mb-6">
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">Tool:</strong> {sectie.inhoud?.toolId || sectie.inhoud?.tool_naam || 'Onbekend'}
          </p>
        </div>

        {!isCompleted && (
          <button
            onClick={onComplete}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {sectie.inhoud?.ctaTekst || 'Tool gebruikt'}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

function TipSectie({ sectie, isCompleted, onComplete }: any) {
  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow border-l-4 border-pink-500">
      <CardContent className="p-8">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-8 h-8 rounded-md bg-pink-500 text-white flex items-center justify-center text-sm font-medium">
            TIP
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{sectie.titel || 'Pro Tip'}</h3>
            <p className="text-gray-600 leading-relaxed">{sectie.inhoud?.tip || sectie.beschrijving}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActieplanSectie({ sectie, isCompleted, onComplete }: any) {
  const acties = sectie.inhoud?.acties || sectie.inhoud?.taken || [];
  const savedVoltooideActies = sectie.user_progress?.actieplan_voltooide_acties || [];
  const [voltooideActies, setVoltooideActies] = useState<number[]>(
    isCompleted ? acties.map((_: any, i: number) => i) : savedVoltooideActies
  );

  const handleActieToggle = (idx: number) => {
    setVoltooideActies(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const allCompleted = voltooideActies.length === acties.length && acties.length > 0;

  return (
    <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{sectie.titel || 'Actieplan'}</h3>
          {isCompleted && <CheckCircle className="w-5 h-5 text-pink-500" />}
        </div>

        {sectie.beschrijving && (
          <p className="text-gray-700 mb-6 leading-relaxed">{sectie.beschrijving}</p>
        )}

        <div className="space-y-3 mb-6">
          {acties.map((actie: any, idx: number) => {
            const actieTekst = typeof actie === 'string' ? actie : actie.tekst || actie.actie;
            const deadline = typeof actie === 'object' ? actie.deadline : null;

            return (
              <label
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  voltooideActies.includes(idx)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={voltooideActies.includes(idx)}
                  onChange={() => handleActieToggle(idx)}
                  disabled={isCompleted}
                  className="mt-1 w-5 h-5 text-pink-500 rounded"
                />
                  <div className="flex-1">
                    <span className={`text-gray-900 font-medium ${
                      voltooideActies.includes(idx) ? 'line-through text-gray-500' : ''
                    }`}>
                      {actieTekst}
                    </span>
                    {deadline && (
                      <div className="text-xs text-gray-500 mt-1">
                        Deadline: {deadline}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-pink-500">{voltooideActies.length}</span> van{' '}
            <span className="font-semibold">{acties.length}</span> acties voltooid
          </div>

          {!isCompleted && allCompleted && (
            <button
              onClick={() => onComplete(voltooideActies)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Actieplan voltooien
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
