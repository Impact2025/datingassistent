'use client';

/**
 * Pattern Quiz Email Gate - Brand Style (Pink Minimalist)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface PatternEmailGateProps {
  onSubmit: (email: string, firstName: string, acceptsMarketing: boolean) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function PatternEmailGate({
  onSubmit,
  onBack,
  isSubmitting,
}: PatternEmailGateProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);

  const isValidEmail = email.includes('@') && email.includes('.');
  const isValidName = firstName.trim().length >= 2;
  const canSubmit = isValidEmail && isValidName && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(email.trim(), firstName.trim(), acceptsMarketing);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Je resultaat is klaar
              </h1>
              <p className="text-gray-500">
                Vul je gegevens in om je persoonlijke analyse te ontvangen.
              </p>
            </div>

            {/* What they get */}
            <div className="mb-8 space-y-2">
              {[
                'Je attachment type',
                'Hoe dit je dating beïnvloedt',
                'Eén concrete tip',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-pink-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Voornaam
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Je voornaam"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  autoComplete="given-name"
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                  autoComplete="email"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsMarketing}
                  onChange={(e) => setAcceptsMarketing(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-500">
                  Ontvang ook mijn beste dating inzichten per mail
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full px-6 py-4 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Bezig...
                  </>
                ) : (
                  <>
                    Toon Mijn Resultaat
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-400 text-center">
              Je gegevens zijn veilig en worden niet gedeeld.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Back button */}
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
