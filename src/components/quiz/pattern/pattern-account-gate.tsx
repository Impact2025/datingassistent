'use client';

/**
 * Pattern Quiz Account Gate
 *
 * Shown AFTER the preview. Collects only name + email — no password.
 *
 * NEW USER:      register → JWT returned → onSubmit called → quiz continues.
 * EXISTING USER: send magic link → show "check inbox" screen.
 *                User clicks link → authenticated → redirected back to quiz
 *                → quiz auto-resumes (handled by PatternQuiz orchestrator).
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Check, Mail } from 'lucide-react';

interface PatternAccountGateProps {
  onSubmit: (email: string, firstName: string, acceptsMarketing: boolean, userId: number) => void;
  onBack: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onClearError?: () => void;
  initialEmail?: string;
  initialFirstName?: string;
}

function generateTempPassword(): string {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const nums    = '23456789';
  const special = '!@#$%&*';
  const all     = upper + lower + nums + special;
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    nums[Math.floor(Math.random() * nums.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const extra = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...required, ...extra].sort(() => Math.random() - 0.5).join('');
}

export function PatternAccountGate({
  onSubmit,
  onBack,
  isSubmitting,
  submitError,
  onClearError,
  initialEmail = '',
  initialFirstName = '',
}: PatternAccountGateProps) {
  const [email, setEmail] = useState(initialEmail);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Magic link sent state — only for existing users
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const isValidEmail = email.includes('@') && email.includes('.');
  const isValidName = firstName.trim().length >= 2;
  const canSubmit = isValidEmail && isValidName && !isSubmitting && !isCreatingAccount;

  const sendMagicLink = async () => {
    if (isSendingLink) return;
    setIsSendingLink(true);
    setError(null);
    try {
      await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          next: '/quiz/dating-patroon',
        }),
      });
      setMagicLinkSent(true);
      setResendCooldown(60);
    } catch {
      setError('Kon de inloglink niet versturen. Probeer het opnieuw.');
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsCreatingAccount(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: firstName.trim(),
          email: email.trim(),
          password: generateTempPassword(),
          needsPasswordSetup: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errorCode === 'USER_ALREADY_EXISTS') {
          // Existing user → send magic link instead of OTP
          await sendMagicLink();
          return;
        }
        throw new Error(data.error || 'Registratie mislukt');
      }

      // New user — token returned immediately, continue quiz
      if (data.token) {
        localStorage.setItem('datespark_auth_token', data.token);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('quiz_user_id', data.user.id.toString());
        localStorage.setItem('quiz_user_name', firstName.trim());
      }
      onSubmit(email.trim(), firstName.trim(), acceptsMarketing, data.user.id);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // ── Magic link sent screen ────────────────────────────────────────────────
  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-coral-50 rounded-full mx-auto mb-6">
                <Mail className="w-8 h-8 text-coral-500" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Check je inbox
              </h1>
              <p className="text-gray-500 text-base leading-relaxed mb-2">
                We stuurden een inloglink naar
              </p>
              <p className="font-semibold text-gray-900 mb-6">{email}</p>

              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-left space-y-2 mb-8">
                <p>Klik op de link in de email om in te loggen.</p>
                <p>Je komt daarna automatisch terug op de quiz.</p>
                <p>Geen email? Check ook je spam.</p>
              </div>

              <button
                type="button"
                onClick={sendMagicLink}
                disabled={resendCooldown > 0 || isSendingLink}
                className="w-full px-6 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-50 transition-colors"
              >
                {isSendingLink
                  ? 'Versturen...'
                  : resendCooldown > 0
                    ? `Opnieuw sturen (${resendCooldown}s)`
                    : 'Stuur opnieuw'
                }
              </button>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-4">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => { setMagicLinkSent(false); setError(null); }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Ander e-mailadres</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
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
                'Je volledige patroon analyse',
                'Je grootste valkuil (en hoe je hem omzeilt)',
                'Een concrete tip die je vandaag kunt toepassen',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-coral-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-coral-500 transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-coral-500 transition-colors"
                  autoComplete="email"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsMarketing}
                  onChange={e => setAcceptsMarketing(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-coral-500 focus:ring-coral-500"
                />
                <span className="text-sm text-gray-500">
                  Ontvang ook mijn beste dating inzichten per mail
                </span>
              </label>

              {(error || submitError) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                >
                  {error || submitError}
                  {submitError && (
                    <button
                      type="button"
                      onClick={onClearError}
                      className="ml-2 underline"
                    >
                      Wis fout
                    </button>
                  )}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full px-6 py-4 bg-coral-500 text-white rounded-full font-semibold hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingAccount || isSubmitting ? (
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

            <p className="mt-4 text-center text-sm text-gray-500">
              Al een account?{' '}
              <a href="/login" className="text-coral-600 hover:text-coral-700 font-medium">
                Log in
              </a>
            </p>
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
