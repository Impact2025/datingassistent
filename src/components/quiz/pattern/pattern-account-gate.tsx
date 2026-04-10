'use client';

/**
 * Pattern Quiz Account Gate - Simplified Lead Capture
 *
 * Shown AFTER the preview (user has already seen partial results).
 * Collects only name + email. No password required.
 *
 * Account is created with a temporary auto-generated password.
 * User receives a "complete your account" email to set their own password.
 *
 * Psychology: Friction is earned. User already confirmed the result is accurate.
 * Asking only for name + email maximises conversion at this step.
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Check, Mail } from 'lucide-react';

interface PatternAccountGateProps {
  onSubmit: (email: string, firstName: string, acceptsMarketing: boolean, userId: number) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

/** Generate a temporary password meeting all requirements */
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

  return [...required, ...extra]
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function PatternAccountGate({ onSubmit, onBack, isSubmitting }: PatternAccountGateProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [acceptsMarketing, setAcceptsMarketing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // OTP login state (always required to verify email)
  const [otpMode, setOtpMode] = useState(false);
  const [otpUserId, setOtpUserId] = useState<number | null>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isValidEmail = email.includes('@') && email.includes('.');
  const isValidName = firstName.trim().length >= 2;
  const canSubmit = isValidEmail && isValidName && !isSubmitting && !isCreatingAccount;

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (value && index === 5 && next.every(d => d !== '')) {
      verifyOtp(next.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    if (!otpUserId) return;
    setIsVerifyingOtp(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/verify-login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: otpUserId, code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verificatie mislukt');
      // Logged in — continue quiz flow
      onSubmit(email.trim(), firstName.trim(), acceptsMarketing, data.user.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Er is een fout opgetreden';
      setError(message);
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resendCode = async () => {
    if (!otpUserId || isSendingCode) return;
    setIsSendingCode(true);
    setError(null);
    try {
      await fetch('/api/auth/send-login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsCreatingAccount(true);
    setError(null);

    try {
      const tempPassword = generateTempPassword();

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: firstName.trim(),
          email: email.trim(),
          password: tempPassword,
          needsPasswordSetup: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.error || 'Registratie mislukt';

        if (message.includes('al bij ons bekend') || message.includes('already exists') || message.includes('probleem met deze registratie')) {
          // Email already exists — send a login code and switch to OTP mode
          const loginCodeResponse = await fetch('/api/auth/send-login-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          });
          const loginCodeData = await loginCodeResponse.json();

          if (loginCodeResponse.ok) {
            setOtpUserId(loginCodeData.userId);
            setIsNewUser(false);
            setOtpMode(true);
          } else {
            // Fallback: show friendly message with login link
            setError('Je hebt al een account. Ga naar de loginpagina om in te loggen.');
          }
          setIsCreatingAccount(false);
          return;
        }

        throw new Error(message);
      }

      const data = await response.json();

      if (typeof window !== 'undefined') {
        localStorage.setItem('quiz_user_id', data.user.id.toString());
        localStorage.setItem('quiz_user_name', firstName.trim());
      }

      // Send OTP to verify the email is real before showing results
      const loginCodeResponse = await fetch('/api/auth/send-login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const loginCodeData = await loginCodeResponse.json();

      if (loginCodeResponse.ok) {
        setOtpUserId(loginCodeData.userId);
        setIsNewUser(true);
        setOtpMode(true);
        setIsCreatingAccount(false);
      } else {
        // Fallback: just continue if OTP send fails
        onSubmit(email.trim(), firstName.trim(), acceptsMarketing, data.user.id);
      }
      return;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Er is een fout opgetreden';
      setError(message);
      setIsCreatingAccount(false);
    }
  };

  // ── OTP Screen ────────────────────────────────────────────────────────────
  if (otpMode) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-coral-50 rounded-full mx-auto mb-6">
                <Mail className="w-6 h-6 text-coral-500" />
              </div>

              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {isNewUser ? 'Jouw analyse staat klaar' : 'Check je inbox'}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isNewUser
                    ? <>We stuurden je persoonlijke analyse naar <strong>{email}</strong>. Vul de code in om hem te bekijken.</>
                    : <>Je hebt al een account. We stuurden een code naar <strong>{email}</strong>.</>
                  }
                </p>
              </div>

              <div className="flex gap-2 justify-center mb-6">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-coral-500 transition-colors"
                    disabled={isVerifyingOtp}
                  />
                ))}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center"
                >
                  {error}
                </motion.div>
              )}

              {isVerifyingOtp && (
                <div className="flex justify-center mb-4">
                  <div className="w-5 h-5 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <p className="text-center text-sm text-gray-500">
                Geen code ontvangen?{' '}
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={isSendingCode}
                  className="text-coral-600 hover:text-coral-700 font-medium disabled:opacity-50"
                >
                  {isSendingCode ? 'Versturen...' : 'Stuur opnieuw'}
                </button>
              </p>
            </motion.div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-4">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => { setOtpMode(false); setOtpDigits(['', '', '', '', '', '']); setError(null); }}
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

  // ── Registration Screen ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Waar sturen we je volledige analyse naartoe?
              </h1>
              <p className="text-gray-500">
                Gratis. Je kunt je altijd uitschrijven.
              </p>
            </div>

            {/* What they unlock */}
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-coral-500 transition-colors"
                  autoComplete="email"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptsMarketing}
                  onChange={(e) => setAcceptsMarketing(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-coral-500 focus:ring-coral-500"
                />
                <span className="text-sm text-gray-500">
                  Ontvang ook mijn beste dating inzichten per mail
                </span>
              </label>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                >
                  {error}{' '}
                  {error.includes('loginpagina') && (
                    <a href={`/login?email=${encodeURIComponent(email)}`} className="underline font-medium">
                      Log in
                    </a>
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
