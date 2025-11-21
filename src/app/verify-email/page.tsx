'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!searchParams) {
        setStatus('error');
        setMessage('URL parameters niet beschikbaar.');
        return;
      }

      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Geen verificatie token gevonden in de URL.');
        return;
      }

      try {
        console.log('🔐 Verifying email with token...');

        // Call the verification API
        const response = await fetch('/api/auth/verify-email-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setStatus('error');
          setMessage(result.error || 'Verificatie mislukt.');
          return;
        }

        const user = result.user;
        setUserName(user.name);
        setStatus('success');
        setMessage('Je emailadres is succesvol geverifieerd!');

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true&email=' + encodeURIComponent(user.email));
        }, 3000);

      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('Er is een fout opgetreden tijdens de verificatie.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email Verificatie
          </h2>
          <p className="text-gray-600">
            Bezig met verifiëren van je emailadres...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Email Geverifieerd! ✅
          </h2>
          <p className="text-gray-600 mb-4">
            Welkom bij DatingAssistent, {userName}!
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {message} Je wordt automatisch doorgestuurd naar de inlogpagina.
          </p>
          <LoadingSpinner className="mx-auto" />
          <p className="text-xs text-gray-400 mt-4">
            Als je niet automatisch wordt doorgestuurd,{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-xs"
              onClick={() => router.push('/login?verified=true')}
            >
              klik hier
            </Button>
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verificatie Mislukt ❌
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Naar Inloggen
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/register')}
              className="w-full"
            >
              Opnieuw Registreren
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Hulp nodig? Neem contact op met{' '}
            <a href="mailto:support@datingassistent.nl" className="text-blue-500 hover:underline">
              support@datingassistent.nl
            </a>
          </p>
        </div>
      </div>
    );
  }

  return null;
}