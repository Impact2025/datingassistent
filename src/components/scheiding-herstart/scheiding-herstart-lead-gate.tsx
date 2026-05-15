'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Check } from 'lucide-react';

interface ScheidingHerstartLeadGateProps {
  onSubmit: (email: string, firstName: string, acceptsMarketing: boolean) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ScheidingHerstartLeadGate({
  onSubmit,
  onBack,
  isSubmitting,
}: ScheidingHerstartLeadGateProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const isValidName = firstName.trim().length >= 2;
  const canSubmit = isValidEmail && isValidName && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(email.trim(), firstName.trim(), acceptsMarketing);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Waar sturen we je volledige analyse naartoe?
              </h1>
              <p className="text-gray-500">Gratis. Je kunt je altijd uitschrijven.</p>
            </div>

            <div className="mb-6 space-y-2">
              {[
                'Je volledige Herstart Analyse (jouw profiel + wat dit betekent)',
                'Je persoonlijk 3-fase Actieplan (week 1 · maand 1 · maand 3)',
                'De Rebound Risico Indicator — hoe groot is jouw risico?',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center pb-1">
              Meer dan 2.800 mensen gingen je voor · Geen spam
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Voornaam
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Je voornaam"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 transition-colors"
                  autoComplete="given-name"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 transition-colors"
                  autoComplete="email"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsMarketing}
                  onChange={e => setAcceptsMarketing(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                />
                <span className="text-sm text-gray-500">
                  Ontvang ook praktische inzichten over daten na een scheiding
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full px-6 py-4 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Even geduld...
                  </>
                ) : (
                  <>
                    Bekijk Mijn Volledige Analyse
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Lock className="w-3 h-3" />
              <span>Je gegevens zijn veilig en worden nooit gedeeld.</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Terug</span>
          </button>
        </div>
      </div>
    </div>
  );
}
