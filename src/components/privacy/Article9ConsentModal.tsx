'use client';

import { useState } from 'react';
import { Shield, Lock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Article9ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
  /** Welke categorieën worden in deze flow verwerkt */
  categories?: Array<'sexual_preference' | 'psychological' | 'reflections'>;
}

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  sexual_preference: {
    title: 'Seksuele voorkeur',
    description:
      'Je datingvoorkeur (man / vrouw / beide) — dit valt onder "gegevens waaruit seksueel gedrag kan worden afgeleid" (Artikel 9 AVG).',
  },
  psychological: {
    title: 'Psychologische profieldata',
    description:
      'Hechtingsstijl, persoonlijkheidsinzichten, angsten en relatiepatronen — gevoelige psychologische gegevens.',
  },
  reflections: {
    title: 'Persoonlijke reflecties',
    description:
      'Dagelijkse antwoorden op coachingvragen over relaties, zelfbeeld en ervaringen.',
  },
};

export function Article9ConsentModal({
  onAccept,
  onDecline,
  categories = ['sexual_preference', 'psychological', 'reflections'],
}: Article9ConsentModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/user/article9-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: '1.0' }),
      });
      onAccept();
    } catch {
      // Toestemming niet opgeslagen — toch doorgaan blokkeren
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    onDecline();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              Toestemming voor gevoelige gegevens
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Artikel 9 AVG — uitdrukkelijke toestemming vereist
            </p>
          </div>
        </div>

        {/* Uitleg */}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Om je persoonlijke coaching te leveren, verwerken wij de volgende <strong>bijzondere categorieën persoonsgegevens</strong>. De wet vereist dat je hier expliciet mee instemt.
        </p>

        {/* Categorieën */}
        <ul className="space-y-3">
          {categories.map((cat) => {
            const label = CATEGORY_LABELS[cat];
            if (!label) return null;
            return (
              <li key={cat} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Lock className="w-4 h-4 text-coral-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{label.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Verwerking buiten EU */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Gepseudonimiseerde versies van deze gegevens worden verwerkt door AI-diensten (Anthropic/OpenRouter) op servers in de <strong>Verenigde Staten</strong>, met standaardcontractbepalingen (SCC&apos;s) als waarborg.
          </p>
        </div>

        {/* Rechten reminder */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Je toestemming is altijd intrekbaar via{' '}
          <a href="/dashboard?tab=privacy" className="underline inline-flex items-center gap-0.5">
            Instellingen → Privacy <ExternalLink className="w-3 h-3" />
          </a>
          . Intrekking geldt voor toekomstige verwerking, niet met terugwerkende kracht.
        </p>

        {/* Knoppen */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="flex-1 bg-coral-500 hover:bg-coral-600 text-white font-semibold"
          >
            {isLoading ? 'Opslaan…' : 'Ja, ik ga uitdrukkelijk akkoord'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isLoading}
            className="flex-1"
          >
            Nee, sla over
          </Button>
        </div>

        <p className="text-[11px] text-center text-gray-400">
          Grondslag: Art. 9 lid 2 sub a AVG | Versie 1.0 | DatingAssistent.nl
        </p>
      </div>
    </div>
  );
}

// Hook voor gebruik in onboarding flows
export function useArticle9Consent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [showModal, setShowModal] = useState(false);

  const checkConsent = async () => {
    try {
      const res = await fetch('/api/user/article9-consent');
      if (res.ok) {
        const data = await res.json();
        setHasConsent(data.hasConsent);
        if (!data.hasConsent) setShowModal(true);
        return data.hasConsent as boolean;
      }
    } catch {
      // Bij fout: toon modal voor zekerheid
    }
    setShowModal(true);
    return false;
  };

  const handleAccept = () => {
    setHasConsent(true);
    setShowModal(false);
  };

  const handleDecline = () => {
    setHasConsent(false);
    setShowModal(false);
  };

  return { hasConsent, showModal, checkConsent, handleAccept, handleDecline };
}
