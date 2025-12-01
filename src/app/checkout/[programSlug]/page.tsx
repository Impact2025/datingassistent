'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  CreditCard,
  Lock,
  ArrowLeft,
  Sparkles,
  Shield
} from 'lucide-react';
import Image from 'next/image';

interface ProgramData {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  transformation_promise: string;
  price_regular: number;
  price_beta: number | null;
  duration_days: number;
  tangible_proof: string;
  tier: string;
  outcomes: string[];
  features: { text: string; type: string }[];
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params.programSlug as string;

  const [program, setProgram] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/programs?slug=${programSlug}`);
        if (!response.ok) {
          throw new Error('Program not found');
        }
        const data = await response.json();
        setProgram(data);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError(err instanceof Error ? err.message : 'Failed to load program');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [programSlug]);

  const handlePayment = async () => {
    if (!program) return;

    setProcessingPayment(true);
    setError(null);

    try {
      // Create MultiSafePay payment
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          programSlug: program.slug,
          amount: program.price_beta || program.price_regular
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment creation failed');
      }

      const { payment_url } = await response.json();

      // Redirect to MultiSafePay payment page
      window.location.href = payment_url;

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Checkout laden...</p>
        </div>
      </div>
    );
  }

  if (error && !program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900">Programma niet gevonden</h2>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => router.push('/#programmas')}>
              Terug naar programma's
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!program) return null;

  const finalPrice = program.price_beta || program.price_regular;
  const discount = program.price_beta ? program.price_regular - program.price_beta : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-pink-500" />
                  Bestelling afronden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Program Info */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-8 h-8 text-pink-500 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {program.name}
                      </h3>
                      <p className="text-gray-700 italic mb-3">
                        "{program.tagline}"
                      </p>
                      <p className="text-gray-600 text-sm">
                        {program.transformation_promise}
                      </p>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    ✨ Wat je krijgt:
                  </h4>
                  <ul className="space-y-2">
                    {program.outcomes.slice(0, 4).map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Payment Methods */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    💳 Betaalmethoden:
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {['ideal', 'visa', 'mastercard', 'paypal', 'bancontact'].map((method) => (
                      <div
                        key={method}
                        className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-pink-300 transition-colors"
                      >
                        <span className="text-xs text-gray-600 uppercase font-medium">
                          {method}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Veilig betalen via MultiSafePay
                  </p>
                </div>

                {/* Security */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 mb-1">
                        100% Veilig & Gegarandeerd
                      </p>
                      <p className="text-blue-700">
                        SSL-versleutelde betaling • 30 dagen geld-terug garantie • Geen automatische verlenging
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {processingPayment ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Doorsturen naar betalen...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Ga naar betalen (€{finalPrice})
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Na het klikken word je doorgestuurd naar de beveiligde betaalomgeving van MultiSafePay
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overzicht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>{program.name}</span>
                      <span>€{program.price_regular}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Beta Launch Korting</span>
                        <span>-€{discount}</span>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Totaal</span>
                        <span>€{finalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Programma duur:</span>
                      <span className="font-semibold">{program.duration_days} dagen</span>
                    </div>
                  </div>

                  {/* Guarantees */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>30 dagen geld-terug garantie</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Direct toegang na betaling</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Levenslange toegang tot materiaal</span>
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-sm text-green-700 font-medium">
                      {program.tangible_proof}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
