'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, ArrowRight, MessageCircle, Camera, Target, Heart,
  Copy, Check, Sparkles, User, AlertTriangle, Loader2, RefreshCw,
  ChevronDown, ChevronUp, Calendar,
} from 'lucide-react';

interface IntegratieHubProps {
  sessionId: number;
  onComplete: () => void;
}

interface CoreValue {
  key: string;
  name: string;
  description: string;
}

type IntegrationId = 'profiel_coach' | 'chat_coach' | 'match_analyse' | 'date_planner' | 'opener_lab';

interface Integration {
  id: IntegrationId;
  name: string;
  tagline: string;
  icon: JSX.Element;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  benefits: string[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'profiel_coach',
    name: 'Profiel Coach',
    tagline: '3 bio varianten op maat + foto tips',
    icon: <Camera className="w-5 h-5" />,
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    benefits: [
      'Bio\'s die jouw kernwaarden uitstralen zonder ze te noemen',
      'Foto tips die passen bij jouw persoonlijkheid',
      'Unieke highlights die de juiste matches aantrekken',
    ],
  },
  {
    id: 'chat_coach',
    name: 'Chat Coach',
    tagline: '5 openers + gesprekstips + rode vlag signalen',
    icon: <MessageCircle className="w-5 h-5" />,
    accentColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    benefits: [
      'Klaar-om-te-sturen openers die bij jou passen',
      'Tips om gesprekken te verdiepen op basis van jouw stijl',
      'Concrete signalen om rode vlaggen vroeg te herkennen',
    ],
  },
  {
    id: 'match_analyse',
    name: 'Match Analyse',
    tagline: 'Must-haves, deal-breakers + testvragen',
    icon: <User className="w-5 h-5" />,
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    benefits: [
      'Jouw persoonlijke must-have lijst gebaseerd op kernwaarden',
      'Deal-breakers beschreven als concreet gedrag',
      '5 vragen om compatibiliteit vroeg te testen',
    ],
  },
  {
    id: 'date_planner',
    name: 'Date Planner',
    tagline: '5 date ideeën die passen bij jouw waarden',
    icon: <Calendar className="w-5 h-5" />,
    accentColor: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    benefits: [
      'Dates die jouw energie geven en bij jou passen',
      'Uitleg waarom elke date aansluit bij jouw kernwaarden',
      'Praktische tips om het nóg beter te maken',
    ],
  },
  {
    id: 'opener_lab',
    name: 'Opener Lab',
    tagline: '5 copy-paste openingszinnen + wanneer te gebruiken',
    icon: <Target className="w-5 h-5" />,
    accentColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    benefits: [
      'Openingszinnen die authentiek klinken — jouw toon, jouw stijl',
      'Verschillende stijlen voor verschillende situaties',
      'Tips over wanneer je welke opener het best inzet',
    ],
  },
];

export function IntegratieHub({ sessionId, onComplete }: IntegratieHubProps) {
  const [completedIntegrations, setCompletedIntegrations] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<IntegrationId | null>(null);
  const [loadingId, setLoadingId] = useState<IntegrationId | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<string, unknown>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;
      try {
        const res = await fetch('/api/waarden-kompas', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.integrations?.length) setCompletedIntegrations(data.integrations);
        if (data.results?.core_values) {
          const cv = typeof data.results.core_values === 'string'
            ? JSON.parse(data.results.core_values)
            : data.results.core_values;
          setCoreValues(cv.slice(0, 5));
        }
      } catch {
        // silent
      }
    };
    load();
  }, []);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback silent
    }
  };

  const handleGenerate = async (id: IntegrationId) => {
    if (loadingId) return;
    setLoadingId(id);
    setExpandedId(null);
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;
      const res = await fetch('/api/waarden-kompas/generate-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ integrationId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedContent((prev) => ({ ...prev, [id]: data.content }));
        setExpandedId(id);
      }
    } catch {
      // silent — show retry in UI
    } finally {
      setLoadingId(null);
    }
  };

  const markIntegrated = async (id: IntegrationId) => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (token) {
        await fetch('/api/waarden-kompas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: 'save_integration', data: { integrationId: id } }),
        });
      }
    } catch {
      // silent
    }
    setCompletedIntegrations((prev) => [...new Set([...prev, id])]);
    setExpandedId(null);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;
      const res = await fetch('/api/waarden-kompas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'complete_session' }),
      });
      if (res.ok) onComplete();
    } catch {
      // silent
    } finally {
      setCompleting(false);
    }
  };

  const completedCount = completedIntegrations.length;
  const allDone = completedCount === INTEGRATIONS.length;

  // --- Content renderers ---

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyText(text, id)}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-coral-600 transition-colors ml-auto flex-shrink-0"
      title="Kopieer"
    >
      {copiedKey === id
        ? <><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-green-600">Gekopieerd</span></>
        : <><Copy className="w-3.5 h-3.5" /><span>Kopieer</span></>
      }
    </button>
  );

  const renderContent = (id: IntegrationId, content: Record<string, unknown>) => {
    if (id === 'profiel_coach') {
      const bios = content.bios as string[] || [];
      const fotoTips = content.fotoTips as string[] || [];
      const highlights = content.highlights as string[] || [];
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Jouw 3 Bio Varianten</h4>
            <div className="space-y-3">
              {bios.map((bio, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge variant="secondary" className="text-xs">Variant {i + 1}</Badge>
                    <CopyButton text={bio} id={`bio-${i}`} />
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">{bio}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Foto Tips</h4>
              <ul className="space-y-2">
                {fotoTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">📸</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Jouw Highlights</h4>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">✨</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (id === 'chat_coach') {
      const openers = content.openers as string[] || [];
      const gespreksTips = content.gespreksTips as string[] || [];
      const rodEvlagSignalen = content.rodEvlagSignalen as string[] || [];
      return (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">5 Klaar-om-te-sturen Openers</h4>
            <div className="space-y-2">
              {openers.map((opener, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-gray-800 text-sm leading-relaxed flex-1">{opener}</p>
                  <CopyButton text={opener} id={`opener-chat-${i}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Gesprekstips</h4>
              <ul className="space-y-2">
                {gespreksTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-white border border-gray-100 rounded-lg p-3">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">💬</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Rode Vlag Signalen</h4>
              <ul className="space-y-2">
                {rodEvlagSignalen.map((sig, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-800 bg-red-50 border border-red-100 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {sig}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (id === 'match_analyse') {
      const mustHaves = content.mustHaves as string[] || [];
      const dealBreakers = content.dealBreakers as string[] || [];
      const testVragen = content.testVragen as string[] || [];
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Jouw Must-Haves</h4>
              <ul className="space-y-2">
                {mustHaves.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800 bg-green-50 border border-green-100 rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Jouw Deal-Breakers</h4>
              <ul className="space-y-2">
                {dealBreakers.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-800 bg-red-50 border border-red-100 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">5 Testvragen om Compatibiliteit te Peilen</h4>
            <div className="space-y-2">
              {testVragen.map((vraag, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-gray-800 text-sm leading-relaxed flex-1">{vraag}</p>
                  <CopyButton text={vraag} id={`vraag-${i}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (id === 'date_planner') {
      const dates = content.dates as Array<{ naam: string; omschrijving: string; waarom: string; tip: string }> || [];
      return (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">5 Date Ideeën op Maat</h4>
          {dates.map((date, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                <h5 className="font-semibold text-gray-900">{date.naam}</h5>
              </div>
              <p className="text-gray-700 text-sm mb-2 leading-relaxed">{date.omschrijving}</p>
              <div className="flex items-start gap-2 text-sm text-purple-800 bg-purple-50 rounded-lg p-2 mb-2">
                <Heart className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span>{date.waarom}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 rounded-lg p-2">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span><strong>Tip:</strong> {date.tip}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (id === 'opener_lab') {
      const openers = content.openers as Array<{ tekst: string; stijl: string; wanneer: string }> || [];
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">5 Openingszinnen — Klaar om te Sturen</h4>
          {openers.map((opener, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">{opener.stijl}</Badge>
                <CopyButton text={opener.tekst} id={`lab-opener-${i}`} />
              </div>
              <p className="text-gray-900 text-sm font-medium leading-relaxed mb-3 bg-orange-50 rounded-lg p-3 border border-orange-100">
                "{opener.tekst}"
              </p>
              <p className="text-gray-500 text-xs">
                <span className="font-medium text-gray-600">Wanneer: </span>{opener.wanneer}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <Card className="bg-gradient-to-br from-coral-50 to-purple-50 border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Sparkles className="w-8 h-8 text-coral-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Activeer jouw Waarden Kompas
          </h1>
          <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed">
            Genereer voor elke tool gepersonaliseerde content op basis van jouw kernwaarden.
            Alles is klaar om direct te gebruiken.
          </p>

          {coreValues.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {coreValues.map((v) => (
                <span key={v.key} className="bg-white text-coral-700 border border-coral-200 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                  {v.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Voortgang</span>
          <span className="text-sm font-bold text-coral-600">{completedCount} / {INTEGRATIONS.length} geactiveerd</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-coral-500 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${(completedCount / INTEGRATIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Integration Cards */}
      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const isCompleted = completedIntegrations.includes(integration.id);
          const isLoading = loadingId === integration.id;
          const isExpanded = expandedId === integration.id;
          const content = generatedContent[integration.id] as Record<string, unknown> | undefined;
          const hasContent = Boolean(content);

          return (
            <div
              key={integration.id}
              className={`rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden ${
                isCompleted
                  ? 'border-green-200 bg-green-50/30'
                  : isExpanded
                  ? `${integration.borderColor} bg-white shadow-md`
                  : 'border-gray-100 bg-white'
              }`}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 ${integration.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className={integration.accentColor}>{integration.icon}</span>
                  </div>

                  {/* Title + tagline */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{integration.name}</h3>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Geactiveerd
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5">{integration.tagline}</p>

                    {/* Benefits — only show when not expanded and not completed */}
                    {!isExpanded && !isCompleted && (
                      <ul className="mt-3 space-y-1.5">
                        {integration.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-gray-400 mt-0.5">•</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    {isCompleted ? (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isExpanded ? 'Inklappen' : 'Bekijken'}
                      </button>
                    ) : isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Genereren...</span>
                      </div>
                    ) : hasContent && !isExpanded ? (
                      <button
                        onClick={() => setExpandedId(integration.id)}
                        className={`text-sm font-medium ${integration.accentColor} flex items-center gap-1`}
                      >
                        <ChevronDown className="w-4 h-4" />
                        Bekijk resultaat
                      </button>
                    ) : !isExpanded ? (
                      <Button
                        onClick={() => handleGenerate(integration.id)}
                        disabled={Boolean(loadingId)}
                        size="sm"
                        className="bg-coral-500 hover:bg-coral-600 text-white rounded-full text-sm px-4"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Genereer
                      </Button>
                    ) : null}

                    {isExpanded && !isCompleted && (
                      <button
                        onClick={() => setExpandedId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1"
                      >
                        <ChevronUp className="w-3 h-3" />
                        Inklappen
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className={`mx-5 mb-5 ${integration.bgColor} rounded-xl p-6 text-center`}>
                  <Loader2 className={`w-8 h-8 animate-spin ${integration.accentColor} mx-auto mb-3`} />
                  <p className="text-sm font-medium text-gray-700">AI genereert jouw {integration.name}...</p>
                  <p className="text-xs text-gray-500 mt-1">Dit duurt 5-10 seconden</p>
                </div>
              )}

              {/* Generated Content */}
              {isExpanded && content && (
                <div className="px-5 pb-5">
                  <div className={`border-t ${integration.borderColor} pt-5`}>
                    {renderContent(integration.id, content)}

                    {/* Footer actions */}
                    <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleGenerate(integration.id)}
                        disabled={Boolean(loadingId)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Opnieuw genereren
                      </button>

                      {!isCompleted && (
                        <Button
                          onClick={() => markIntegrated(integration.id)}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Klaar, opslaan
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Card */}
      {allDone && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-2xl shadow-sm">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Jouw Waarden Kompas is volledig actief
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
              Je hebt gepersonaliseerde content gegenereerd voor alle 5 tools.
              Alles is gebaseerd op wat jij écht belangrijk vindt.
            </p>

            <div className="bg-white/70 rounded-xl p-5 mb-8 text-left max-w-sm mx-auto">
              <ul className="space-y-2 text-sm text-gray-700">
                {INTEGRATIONS.map((integ) => (
                  <li key={integ.id} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{integ.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={handleComplete}
              disabled={completing}
              className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all px-10 py-4 text-lg"
              size="lg"
            >
              {completing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Opslaan...</>
              ) : (
                <>Start met Waarde-Gedreven Dating<ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
