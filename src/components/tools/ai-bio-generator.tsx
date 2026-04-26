'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Sparkles, Copy, RefreshCw, CheckCircle, ArrowLeft,
  Heart, Zap, Briefcase, Eye, AlertCircle, Save, Edit3, Info,
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { getValidToken } from '@/lib/client-auth';

interface BioVariant {
  id: string;
  content: string;
  reason: string;
}

interface AiBioGeneratorProps {
  embedded?: boolean;
}

const STYLE_CONFIG = [
  { value: 'fun',        label: 'Energiek',    icon: Zap,       color: 'text-amber-600' },
  { value: 'serious',    label: 'Betrouwbaar', icon: Briefcase, color: 'text-blue-600'  },
  { value: 'flirty',     label: 'Flirterig',   icon: Heart,     color: 'text-rose-600'  },
  { value: 'mysterious', label: 'Mysterieus',  icon: Eye,       color: 'text-purple-600'},
] as const;

const LENGTH_CONFIG = [
  { value: 'short',  label: 'Kort',   range: '60-80',   min: 60,  max: 80  },
  { value: 'medium', label: 'Medium', range: '80-120',  min: 80,  max: 120 },
  { value: 'long',   label: 'Lang',   range: '120-150', min: 120, max: 150 },
] as const;

const EXAMPLE_INPUT =
  '29-jarige projectmanager, houd van bergwandelen en goede koffie. Lees veel non-fictie en kook graag op zondag. Op zoek naar iemand met wie ik diepgaande gesprekken kan voeren én spontaan op avontuur kan gaan.';

function CharBar({ len, min, max }: { len: number; min: number; max: number }) {
  const pct = Math.min((len / max) * 100, 120);
  const inRange = len >= min && len <= max;
  const tooLong = len > max;
  const color = tooLong ? 'bg-red-500' : inRange ? 'bg-green-500' : 'bg-amber-400';
  const label = tooLong
    ? `${len - max} te lang`
    : inRange
    ? `${len} tekens — goed`
    : len < min
    ? `${min - len} tekens te kort`
    : '';

  return (
    <div className="space-y-1">
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <p className={`text-xs ${tooLong ? 'text-red-500' : inRange ? 'text-green-600' : 'text-amber-600'}`}>{label}</p>
    </div>
  );
}

function InputQuality({ len }: { len: number }) {
  if (len === 0) return null;
  if (len < 30) return <span className="text-xs text-red-500">Te kort — voeg meer details toe</span>;
  if (len < 80) return <span className="text-xs text-amber-600">Voeg meer details toe voor betere resultaten</span>;
  return <span className="text-xs text-green-600">Goede basis voor 3 sterke bio-varianten</span>;
}

export function AiBioGenerator({ embedded = false }: AiBioGeneratorProps) {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const { toast } = useToast();

  const [userInput, setUserInput]         = useState('');
  const [selectedStyle, setSelectedStyle] = useState<'fun' | 'serious' | 'flirty' | 'mysterious'>('fun');
  const [selectedLength, setSelectedLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [variants, setVariants]           = useState<BioVariant[]>([]);
  const [editedBios, setEditedBios]       = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating]   = useState(false);
  const [savingId, setSavingId]           = useState<string | null>(null);
  const [savedId, setSavedId]             = useState<string | null>(null);
  const [copiedId, setCopiedId]           = useState<string | null>(null);
  const [error, setError]                 = useState<string | null>(null);

  const activeLengthConf = LENGTH_CONFIG.find(l => l.value === selectedLength)!;

  const generateBios = async () => {
    if (!userInput.trim()) return;
    setIsGenerating(true);
    setError(null);
    setVariants([]);
    setEditedBios({});
    setSavedId(null);

    try {
      const token = getValidToken();
      const res = await fetch('/api/tools/bio-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userInput, style: selectedStyle, length: selectedLength }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Fout ${res.status}`);
      }

      const data = await res.json();
      const bios: BioVariant[] = (data.bios || []).map((b: { id: string; content: string; reason?: string }) => ({
        id: b.id,
        content: b.content,
        reason: b.reason || '',
      }));
      setVariants(bios);

      // Pre-fill editable bios with generated content
      const initial: Record<string, string> = {};
      bios.forEach(b => { initial[b.id] = b.content; });
      setEditedBios(initial);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Onbekende fout';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const getBioText = (id: string) => editedBios[id] ?? variants.find(v => v.id === id)?.content ?? '';

  const copyBio = async (id: string) => {
    const text = getBioText(id);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: 'Kopiëren mislukt', description: 'Selecteer de tekst handmatig.', variant: 'destructive' });
    }
  };

  const saveBio = async (id: string) => {
    const text = getBioText(id);
    if (!user?.id) {
      toast({ title: 'Niet ingelogd', variant: 'destructive' });
      return;
    }
    setSavingId(id);
    try {
      const token = getValidToken();
      const updatedProfile = { ...(userProfile || {}), bio: text };
      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: user.id, profile: updatedProfile }),
      });
      if (!res.ok) throw new Error();
      setSavedId(id);
      toast({ title: 'Bio opgeslagen', description: 'Je profiel is bijgewerkt.' });
      setTimeout(() => router.push('/dashboard?tab=profiel'), 1500);
    } catch {
      toast({ title: 'Opslaan mislukt', variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 pb-20'}>

      {/* Standalone header */}
      {!embedded && (
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Bio Generator</h1>
              <p className="text-xs text-gray-500">3 gepersonaliseerde varianten in seconden</p>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-2xl mx-auto space-y-5 ${embedded ? 'pt-2' : 'p-4'}`}>

        {/* ── INPUT SECTION ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-800">Over jezelf</label>
              <button
                onClick={() => setUserInput(EXAMPLE_INPUT)}
                className="text-xs text-coral-600 hover:text-coral-700 font-medium transition-colors"
              >
                Laad voorbeeld
              </button>
            </div>
            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Bijv: 28-jarige marketeer, hou van hardlopen en bergen, reist graag buiten de toeristische route. Op zoek naar iemand met wie ik diepgaande gesprekken kan voeren én samen kunnen lachen..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-coral-400 focus:ring-2 focus:ring-coral-100 outline-none transition-all leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <InputQuality len={userInput.trim().length} />
              <span className={`text-xs ${userInput.length > 400 ? 'text-amber-500' : 'text-gray-400'}`}>
                {userInput.length} tekens
              </span>
            </div>
          </div>

          {/* Style selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Stijl</label>
            <div className="grid grid-cols-4 gap-2">
              {STYLE_CONFIG.map(s => {
                const Icon = s.icon;
                const active = selectedStyle === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setSelectedStyle(s.value as typeof selectedStyle)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-center ${
                      active
                        ? 'border-coral-500 bg-coral-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-coral-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium leading-tight ${active ? 'text-coral-700' : 'text-gray-600'}`}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Length selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Lengte</label>
            <div className="grid grid-cols-3 gap-2">
              {LENGTH_CONFIG.map(l => {
                const active = selectedLength === l.value;
                return (
                  <button
                    key={l.value}
                    onClick={() => setSelectedLength(l.value as typeof selectedLength)}
                    className={`py-2.5 rounded-xl border-2 transition-all text-center ${
                      active
                        ? 'border-coral-500 bg-coral-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className={`text-sm font-medium ${active ? 'text-coral-700' : 'text-gray-700'}`}>{l.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{l.range}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Generate */}
          <Button
            onClick={generateBios}
            disabled={userInput.trim().length < 15 || isGenerating}
            className="w-full bg-coral-500 hover:bg-coral-600 disabled:opacity-40 text-white rounded-full py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {isGenerating ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Bio's genereren...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Genereer 3 Bio Varianten</>
            )}
          </Button>
        </div>

        {/* ── LOADING SKELETON ── */}
        {isGenerating && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-gray-100 rounded-full" />
                  <div className="h-4 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 rounded w-4/6" />
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full" />
                <div className="flex gap-2 pt-1">
                  <div className="h-9 bg-gray-100 rounded-full flex-1" />
                  <div className="h-9 bg-gray-100 rounded-full flex-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── RESULTS ── */}
        {!isGenerating && variants.length > 0 && (
          <div className="space-y-4">

            {/* Header row */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-gray-700">3 varianten — bewerk en kies de beste</h2>
              <button
                onClick={generateBios}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-coral-600 font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Opnieuw
              </button>
            </div>

            {variants.map((variant, idx) => {
              const bioText = getBioText(variant.id);
              const { min, max } = activeLengthConf;

              return (
                <div
                  key={variant.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                    savedId === variant.id ? 'border-green-300' : 'border-gray-100'
                  }`}
                >
                  {/* Card top bar */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-0">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Variant {idx + 1}
                    </span>
                    <button
                      onClick={() => copyBio(variant.id)}
                      className={`flex items-center gap-1 text-xs font-medium transition-colors px-2.5 py-1 rounded-full ${
                        copiedId === variant.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {copiedId === variant.id
                        ? <><CheckCircle className="w-3.5 h-3.5" />Gekopieerd</>
                        : <><Copy className="w-3.5 h-3.5" />Kopieer</>
                      }
                    </button>
                  </div>

                  {/* Editable bio */}
                  <div className="px-5 pt-3 pb-2">
                    <div className="relative">
                      <textarea
                        value={bioText}
                        onChange={e => setEditedBios(prev => ({ ...prev, [variant.id]: e.target.value }))}
                        rows={4}
                        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 leading-relaxed focus:border-coral-400 focus:bg-white focus:ring-2 focus:ring-coral-100 outline-none transition-all"
                      />
                      <Edit3 className="absolute right-3 bottom-3 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
                    </div>
                    <div className="mt-2">
                      <CharBar len={bioText.length} min={min} max={max} />
                    </div>
                  </div>

                  {/* Why it works */}
                  {variant.reason && (
                    <div className="mx-5 mb-3 flex items-start gap-2 bg-blue-50 rounded-lg px-3 py-2">
                      <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">{variant.reason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-5 pb-5">
                    <Button
                      onClick={() => saveBio(variant.id)}
                      disabled={savingId === variant.id || savedId === variant.id}
                      className={`w-full rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                        savedId === variant.id
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-coral-500 hover:bg-coral-600 text-white'
                      }`}
                    >
                      {savedId === variant.id ? (
                        <><CheckCircle className="w-4 h-4 mr-2" />Opgeslagen in profiel</>
                      ) : savingId === variant.id ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Opslaan...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" />Gebruik deze bio</>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Pro tips */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Zo haal je het meeste uit je bio</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  Bewerk de bio in de tekstvelden hierboven — pas woorden aan totdat het echt jouw stem klinkt
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  De kleurindicator toont of je bio de optimale lengte heeft
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  Test verschillende stijlen door opnieuw te genereren — elke run geeft andere varianten
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <Toaster />
      {!embedded && <BottomNavigation />}
    </div>
  );
}
