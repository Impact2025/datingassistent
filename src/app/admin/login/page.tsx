"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Loader2, Smartphone, Key, AlertTriangle, CheckCircle } from "lucide-react";
import { useUser } from "@/providers/user-provider";

// =============================================================================
// TYPES
// =============================================================================

type LoginStep = 'credentials' | '2fa' | '2fa-setup' | 'backup-codes-display';

interface TwoFAState {
  userId: number;
  requires2FA: boolean;
  has2FASetup: boolean;
  setupData?: {
    secret: string;
    qrCode: string;
  };
  backupCodes?: string[];
}

// =============================================================================
// 2FA CODE INPUT COMPONENT
// =============================================================================

function TwoFACodeInput({
  value,
  onChange,
  disabled
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit;
    const result = newValue.join('').slice(0, 6);
    onChange(result);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AdminLoginPage() {
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [twoFAState, setTwoFAState] = useState<TwoFAState | null>(null);
  const router = useRouter();
  const { login } = useUser();

  // Auto-submit wanneer 6 digits zijn ingevoerd
  useEffect(() => {
    if (twoFACode.length === 6 && step === '2fa') {
      handle2FAVerify();
    }
  }, [twoFACode]);

  // =============================================================================
  // STEP 1: CREDENTIALS LOGIN
  // =============================================================================

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Login met email/password
      await login(email, password);

      // Check admin status
      const adminCheck = await fetch("/api/auth/check-admin");
      const adminData = await adminCheck.json();

      if (!adminData.isAdmin) {
        setError("Je hebt geen admin rechten");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }

      // Check 2FA status
      const twoFACheck = await fetch("/api/admin/2fa/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const twoFAData = await twoFACheck.json();

      if (twoFAData.requires2FA) {
        // User heeft 2FA enabled - vraag om code
        setTwoFAState({
          userId: twoFAData.userId,
          requires2FA: true,
          has2FASetup: true
        });
        setStep('2fa');
      } else {
        // Geen 2FA - forceer setup voor admins
        setTwoFAState({
          userId: twoFAData.userId,
          requires2FA: false,
          has2FASetup: false
        });
        await initiate2FASetup(twoFAData.userId);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login mislukt. Controleer je gegevens.");
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // STEP 2: 2FA VERIFICATION
  // =============================================================================

  const handle2FAVerify = async () => {
    if (twoFACode.length !== 6 || !twoFAState) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/2fa/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: twoFAState.userId,
          token: twoFACode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ongeldige code. Probeer opnieuw.");
        setTwoFACode("");
        return;
      }

      // Succes - naar admin dashboard
      router.push("/admin");
    } catch (err: any) {
      console.error("2FA verification error:", err);
      setError("Verificatie mislukt. Probeer opnieuw.");
      setTwoFACode("");
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // 2FA SETUP (voor nieuwe admins)
  // =============================================================================

  const initiate2FASetup = async (userId: number) => {
    setLoading(true);
    setError("");

    try {
      // Haal CSRF token
      const csrfRes = await fetch("/api/csrf");
      const { csrfToken } = await csrfRes.json();

      const response = await fetch("/api/admin/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (!response.ok) {
        // Als 2FA al enabled is, ga naar verificatie
        if (data.error?.includes('already enabled')) {
          setTwoFAState(prev => prev ? { ...prev, has2FASetup: true, requires2FA: true } : null);
          setStep('2fa');
          return;
        }
        throw new Error(data.error || "Setup mislukt");
      }

      setTwoFAState(prev => prev ? {
        ...prev,
        setupData: {
          secret: data.secret,
          qrCode: data.qrCode
        }
      } : null);
      setStep('2fa-setup');
    } catch (err: any) {
      console.error("2FA setup error:", err);
      setError(err.message || "2FA setup mislukt");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetupVerify = async () => {
    if (twoFACode.length !== 6 || !twoFAState) return;

    setLoading(true);
    setError("");

    try {
      // Haal CSRF token
      const csrfRes = await fetch("/api/csrf");
      const { csrfToken } = await csrfRes.json();

      const response = await fetch("/api/admin/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify({
          userId: twoFAState.userId,
          token: twoFACode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ongeldige code. Probeer opnieuw.");
        setTwoFACode("");
        return;
      }

      // Toon backup codes als die zijn gegenereerd
      if (data.backupCodes && data.backupCodes.length > 0) {
        setTwoFAState(prev => prev ? { ...prev, backupCodes: data.backupCodes } : null);
        setStep('backup-codes-display');
      } else {
        // Succes - naar admin dashboard
        router.push("/admin");
      }
    } catch (err: any) {
      console.error("2FA setup verification error:", err);
      setError("Verificatie mislukt. Probeer opnieuw.");
      setTwoFACode("");
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // BACKUP CODE LOGIN
  // =============================================================================

  const [showBackupCodeInput, setShowBackupCodeInput] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  const handleBackupCodeLogin = async () => {
    if (!backupCode || !twoFAState) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/2fa/backup-codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: twoFAState.userId,
          code: backupCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ongeldige backup code");
        setBackupCode("");
        return;
      }

      // Succes - naar admin dashboard
      router.push("/admin");
    } catch (err: any) {
      console.error("Backup code login error:", err);
      setError("Verificatie mislukt. Probeer opnieuw.");
      setBackupCode("");
    } finally {
      setLoading(false);
    }
  };

  // =============================================================================
  // RENDER: CREDENTIALS FORM
  // =============================================================================

  if (step === 'credentials') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl shadow-blue-500/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-blue-200">DatingAssistent Beveiligd Beheer</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl">Inloggen</CardTitle>
              <CardDescription className="text-center">
                Voer je admin credentials in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="admin@datingassistent.nl"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Wachtwoord
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-base font-medium shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Bezig met inloggen...
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5 mr-2" />
                      Inloggen
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <a
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Terug naar website
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-blue-200 text-sm">
            <Shield className="w-4 h-4" />
            <span>Beveiligd met 2-Factor Authenticatie</span>
          </div>
        </div>
      </main>
    );
  }

  // =============================================================================
  // RENDER: 2FA VERIFICATION
  // =============================================================================

  if (step === '2fa') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-2xl shadow-green-500/30">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">2FA Verificatie</h1>
            <p className="text-blue-200">Voer de code van je authenticator app in</p>
          </div>

          {/* 2FA Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl">Beveiligingscode</CardTitle>
              <CardDescription className="text-center">
                Open je authenticator app en voer de 6-cijferige code in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <TwoFACodeInput
                value={twoFACode}
                onChange={setTwoFACode}
                disabled={loading}
              />

              <Button
                onClick={handle2FAVerify}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-base font-medium shadow-lg"
                disabled={loading || twoFACode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifiëren...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Verifiëren
                  </>
                )}
              </Button>

              {/* Backup code optie */}
              {!showBackupCodeInput ? (
                <div className="text-center space-y-2">
                  <button
                    onClick={() => setShowBackupCodeInput(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Gebruik backup code
                  </button>
                  <br />
                  <button
                    onClick={() => {
                      setStep('credentials');
                      setTwoFACode("");
                      setError("");
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Terug naar inloggen
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 text-center">
                    Voer een van je backup codes in:
                  </p>
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    className="w-full px-4 py-3 text-center font-mono text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleBackupCodeLogin}
                    variant="outline"
                    className="w-full py-3"
                    disabled={loading || backupCode.length < 8}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifiëren...
                      </>
                    ) : (
                      "Backup code gebruiken"
                    )}
                  </Button>
                  <button
                    onClick={() => {
                      setShowBackupCodeInput(false);
                      setBackupCode("");
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ← Terug naar authenticator code
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // =============================================================================
  // RENDER: 2FA SETUP (FORCED)
  // =============================================================================

  if (step === '2fa-setup' && twoFAState?.setupData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4 shadow-2xl shadow-orange-500/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">2FA Vereist</h1>
            <p className="text-blue-200">Stel twee-factor authenticatie in voor je admin account</p>
          </div>

          {/* Setup Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
                <Smartphone className="w-6 h-6" />
                Authenticator App Setup
              </CardTitle>
              <CardDescription className="text-center">
                Scan de QR-code met Google Authenticator, Authy of een andere TOTP app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl shadow-inner border-2 border-gray-100">
                  <img
                    src={twoFAState.setupData.qrCode}
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Manual entry secret */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-2 text-center">
                  Of voer deze code handmatig in:
                </p>
                <p className="font-mono text-sm text-center bg-white px-4 py-2 rounded border select-all break-all">
                  {twoFAState.setupData.secret}
                </p>
              </div>

              {/* Verification */}
              <div>
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Voer de 6-cijferige code in om te bevestigen:
                </p>
                <TwoFACodeInput
                  value={twoFACode}
                  onChange={setTwoFACode}
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handle2FASetupVerify}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white py-3 text-base font-medium shadow-lg"
                disabled={loading || twoFACode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Activeren...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    2FA Activeren & Inloggen
                  </>
                )}
              </Button>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Belangrijk!</p>
                    <p>Bewaar de secret key op een veilige plek. Je hebt deze nodig als je je telefoon verliest.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // =============================================================================
  // RENDER: BACKUP CODES DISPLAY (after setup)
  // =============================================================================

  if (step === 'backup-codes-display' && twoFAState?.backupCodes) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-2xl shadow-green-500/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">2FA Geactiveerd!</h1>
            <p className="text-blue-200">Bewaar je backup codes op een veilige plek</p>
          </div>

          {/* Backup Codes Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-xl flex items-center justify-center gap-2 text-green-700">
                <Key className="w-6 h-6" />
                Backup Codes
              </CardTitle>
              <CardDescription className="text-center">
                Gebruik deze codes als je geen toegang hebt tot je authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Dit is de enige keer dat je deze codes ziet!</p>
                    <p>Bewaar ze op een veilige plek. Elke code kan maar één keer worden gebruikt.</p>
                  </div>
                </div>
              </div>

              {/* Backup Codes Grid */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  {twoFAState.backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="font-mono text-sm bg-white px-3 py-2 rounded border text-center select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const codes = twoFAState.backupCodes?.join('\n') || '';
                  navigator.clipboard.writeText(codes);
                  alert('Backup codes gekopieerd naar klembord!');
                }}
              >
                <Key className="w-4 h-4 mr-2" />
                Kopieer alle codes
              </Button>

              {/* Continue button */}
              <Button
                onClick={() => router.push("/admin")}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-base font-medium shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Ik heb de codes opgeslagen - Doorgaan
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return null;
}
