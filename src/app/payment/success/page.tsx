'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Confetti from 'react-confetti';

type PaymentStatus = 'verifying' | 'success' | 'pending' | 'failed' | 'error';

interface VerificationResult {
  success: boolean;
  status: string;
  message: string;
  details?: {
    packageType?: string;
    programName?: string;
    amount?: number;
  };
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('verifying');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_POLLS = 30; // 30 polls * 2 seconds = 60 seconds max wait
  const POLL_INTERVAL = 2000; // 2 seconds

  // Verify payment status
  const verifyPayment = useCallback(async () => {
    if (!orderId) {
      setPaymentStatus('error');
      setVerificationResult({
        success: false,
        status: 'error',
        message: 'Geen order ID gevonden. Controleer je bevestigingsmail.'
      });
      return;
    }

    try {
      const response = await fetch(`/api/payment/verify?orderId=${encodeURIComponent(orderId)}`);
      const data: VerificationResult = await response.json();

      if (data.success) {
        setPaymentStatus('success');
        setVerificationResult(data);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else if (data.status === 'pending' || data.status === 'initialized') {
        setPaymentStatus('pending');
        setVerificationResult(data);
      } else if (data.status === 'cancelled' || data.status === 'failed' || data.status === 'expired') {
        setPaymentStatus('failed');
        setVerificationResult(data);
      } else {
        // Unknown status, keep polling
        setPaymentStatus('pending');
        setVerificationResult(data);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('error');
      setVerificationResult({
        success: false,
        status: 'error',
        message: 'Kon de betaling niet verifiëren. Controleer je bevestigingsmail.'
      });
    }
  }, [orderId]);

  // Initial verification and polling
  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Initial verification
    verifyPayment();
  }, [verifyPayment]);

  // Polling for pending payments
  useEffect(() => {
    if (paymentStatus !== 'pending' || pollCount >= MAX_POLLS) return;

    const timer = setTimeout(() => {
      setPollCount(prev => prev + 1);
      verifyPayment();
    }, POLL_INTERVAL);

    return () => clearTimeout(timer);
  }, [paymentStatus, pollCount, verifyPayment]);

  // Stop polling after max attempts
  useEffect(() => {
    if (pollCount >= MAX_POLLS && paymentStatus === 'pending') {
      setPaymentStatus('error');
      setVerificationResult({
        success: false,
        status: 'timeout',
        message: 'De verificatie duurde te lang. Je betaling wordt mogelijk nog verwerkt. Controleer je e-mail voor bevestiging.'
      });
    }
  }, [pollCount, paymentStatus]);

  const handleContinue = () => {
    // Redirect to onboarding for new users, dashboard for existing
    router.push('/onboarding/welcome');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setPollCount(0);
    setPaymentStatus('verifying');
    verifyPayment();
  };

  const handleBackToPayment = () => {
    router.push('/select-package');
  };

  // Verifying state
  if (paymentStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Betaling verifiëren...</h1>
                <p className="text-gray-600">Even geduld, we controleren je betaling.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Pending state (polling)
  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-2 border-yellow-300 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Betaling wordt verwerkt</h1>
                <p className="text-gray-600">{verificationResult?.message || 'Dit kan enkele seconden duren...'}</p>
                <p className="text-sm text-gray-500">Poging {pollCount + 1} van {MAX_POLLS}</p>
              </div>
              {orderId && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-mono text-xs text-gray-700">{orderId}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Failed/Error state
  if (paymentStatus === 'failed' || paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-2 border-red-200 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {paymentStatus === 'failed' ? 'Betaling niet geslaagd' : 'Verificatie probleem'}
                </h1>
                <p className="text-gray-600">{verificationResult?.message}</p>
              </div>
              {orderId && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-mono text-xs text-gray-700">{orderId}</p>
                </div>
              )}
              <div className="space-y-3">
                {retryCount < 3 && (
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Opnieuw proberen
                  </Button>
                )}
                <Button
                  onClick={handleBackToPayment}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  Terug naar betaling
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Hulp nodig? Mail <a href="mailto:support@datingassistent.nl" className="text-pink-500 hover:underline">support@datingassistent.nl</a>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-2 border-green-500 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl mx-auto"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            {/* Success Message */}
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-gray-900"
              >
                Gefeliciteerd!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-700"
              >
                {verificationResult?.message || 'Je betaling is succesvol voltooid'}
              </motion.p>
            </div>

            {/* Package Info */}
            {verificationResult?.details?.packageType && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                {verificationResult.details.packageType.charAt(0).toUpperCase() + verificationResult.details.packageType.slice(1)} pakket geactiveerd
              </motion.div>
            )}

            {/* Order ID */}
            {orderId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <p className="text-sm text-gray-600">Bevestigingsnummer:</p>
                <p className="font-mono text-sm text-gray-900 mt-1">{orderId}</p>
              </motion.div>
            )}

            {/* What's Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100 text-left"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">
                    Wat gebeurt er nu?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Je account is geactiveerd en klaar voor gebruik</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Je ontvangt een bevestigingsmail met alle details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Iris, je persoonlijke coach, staat klaar om je te begeleiden!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Start je dating journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Support */}
            <p className="text-xs text-gray-500">
              Vragen? Mail ons op <a href="mailto:support@datingassistent.nl" className="text-pink-500 hover:underline">support@datingassistent.nl</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
