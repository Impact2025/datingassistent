'use client';

/**
 * Pattern Quiz Account Gate - Creates account during quiz flow
 *
 * Converts email gate into full account creation for better conversion:
 * - Collects name, email, password
 * - Creates account via signup API
 * - Returns userId for quiz submission
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Lock, Eye, EyeOff } from 'lucide-react';

interface PatternAccountGateProps {
  onSubmit: (email: string, firstName: string, acceptsMarketing: boolean, userId: number) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function PatternAccountGate({
  onSubmit,
  onBack,
  isSubmitting,
}: PatternAccountGateProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Validation
  const isValidEmail = email.includes('@') && email.includes('.');
  const isValidName = firstName.trim().length >= 2;
  const isValidPassword = password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

  const canSubmit = isValidEmail && isValidName && isValidPassword && !isSubmitting && !isCreatingAccount;

  // Password requirement indicators
  const passwordChecks = [
    { label: '8+ karakters', met: password.length >= 8 },
    { label: 'Hoofdletter', met: /[A-Z]/.test(password) },
    { label: 'Kleine letter', met: /[a-z]/.test(password) },
    { label: 'Cijfer', met: /[0-9]/.test(password) },
    { label: 'Speciaal teken', met: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsCreatingAccount(true);
    setError(null);

    try {
      // Create account via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: firstName.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registratie mislukt');
      }

      const data = await response.json();
      console.log('Account created for quiz:', data.user.id);

      // Save to localStorage for later use
      if (typeof window !== 'undefined') {
        localStorage.setItem('quiz_user_id', data.user.id.toString());
        localStorage.setItem('quiz_user_name', firstName.trim());
      }

      // Continue with quiz submission
      onSubmit(email.trim(), firstName.trim(), acceptsMarketing, data.user.id);
    } catch (err: any) {
      console.error('Account creation error:', err);

      if (err.message?.includes('emailadres is al bij ons bekend') || err.message?.includes('already exists')) {
        setError('Dit e-mailadres is al geregistreerd. Probeer in te loggen of gebruik een ander e-mailadres.');
      } else {
        setError(err.message || 'Er is een fout opgetreden. Probeer het opnieuw.');
      }
      setIsCreatingAccount(false);
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
                Je resultaat is klaar!
              </h1>
              <p className="text-gray-500">
                Maak een gratis account aan om je persoonlijke analyse te bekijken.
              </p>
            </div>

            {/* What they get */}
            <div className="mb-6 space-y-2">
              {[
                'Je attachment patroon onthuld',
                'Hoe dit je dating saboteert',
                'Concrete tips om het te doorbreken',
                'Toegang tot je persoonlijke dashboard',
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Kies een wachtwoord
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimaal 8 karakters"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password requirements */}
                {password.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {passwordChecks.map((check) => (
                      <span
                        key={check.label}
                        className={`text-xs px-2 py-1 rounded-full ${
                          check.met
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {check.met ? '✓' : '○'} {check.label}
                      </span>
                    ))}
                  </div>
                )}
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

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full px-6 py-4 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingAccount || isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Account aanmaken...
                  </>
                ) : (
                  <>
                    Bekijk Mijn Resultaat
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Trust anchor */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Lock className="w-3 h-3" />
              <span>Je gegevens zijn veilig en worden niet gedeeld.</span>
            </div>

            {/* Login link */}
            <p className="mt-4 text-center text-sm text-gray-500">
              Al een account?{' '}
              <a href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                Log in
              </a>
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
