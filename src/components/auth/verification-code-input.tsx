'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface VerificationCodeInputProps {
  userId: number;
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
  onResendCode: () => void;
}

export function VerificationCodeInput({
  userId,
  onSuccess,
  onError,
  onResendCode
}: VerificationCodeInputProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer voor resend cooldown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Focus eerste input bij mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Alleen cijfers toestaan
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance naar volgende input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit als alle digits ingevuld
    if (value && index === 5 && newCode.every(digit => digit !== '')) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleInputKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Ga terug naar vorige input bij backspace op lege input
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);

      // Focus laatste input
      inputRefs.current[5]?.focus();

      // Auto-submit
      handleVerifyCode(pastedData);
    }
  };

  const handleVerifyCode = async (verificationCode: string) => {
    if (isVerifying) return;

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save the token to localStorage for authentication persistence
        if (data.token) {
          localStorage.setItem('datespark_auth_token', data.token);
          console.log('✅ Token saved to localStorage after email verification');
        }
        onSuccess(data.user);
      } else {
        setError(data.error || 'Verificatie mislukt');
        onError(data.error || 'Verificatie mislukt');
      }
    } catch (error) {
      const errorMessage = 'Netwerkfout. Probeer het opnieuw.';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (isResending || resendTimer > 0) return;

    setIsResending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendTimer(60); // Reset timer
        onResendCode();
      } else {
        setError(data.error || 'Kon geen nieuwe code versturen');
      }
    } catch (error) {
      setError('Netwerkfout bij het versturen van nieuwe code');
    } finally {
      setIsResending(false);
    }
  };

  const fullCode = code.join('');

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Code Input Fields */}
      <div className="space-y-5">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold mb-2 dark:text-white">Voer je verificatie code in</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            We hebben een 6-cijferige code gestuurd naar je email
          </p>
        </div>

        <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(index, e)}
              className="w-11 h-12 sm:w-12 sm:h-14 text-center focus:border-coral-500 focus:ring-coral-500 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isVerifying}
            />
          ))}
        </div>

        {/* Verify Button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={() => handleVerifyCode(fullCode)}
            disabled={isVerifying || fullCode.length !== 6}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white font-semibold rounded-full shadow-lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifiëren...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verifieer Code
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resend Code */}
      <div className="text-center space-y-2 pt-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Geen code ontvangen?
        </p>
        <Button
          variant="outline"
          onClick={handleResendCode}
          disabled={isResending || resendTimer > 0}
          className="text-sm"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Versturen...
            </>
          ) : resendTimer > 0 ? (
            `Nieuwe code over ${resendTimer}s`
          ) : (
            'Stuur nieuwe code'
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Check je spam folder als je geen email hebt ontvangen
        </p>
      </div>
    </div>
  );
}