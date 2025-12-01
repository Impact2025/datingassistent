'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import Confetti from 'react-confetti';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push('/dashboard');
  };

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
                🎉 Gefeliciteerd!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-700"
              >
                Je betaling is succesvol voltooid
              </motion.p>
            </div>

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
                      <span>Je hebt direct toegang tot je programma</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Je ontvangt een bevestigingsmail met alle details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Begin vandaag nog met je dating transformatie!</span>
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
                Start met je programma
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
