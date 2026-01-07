'use client';

/**
 * Pattern Quiz Email Gate
 *
 * Email capture step after quiz completion.
 * Follows the blueprint for maximum conversion.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  User,
  CheckCircle,
  Shield,
  Sparkles,
} from 'lucide-react';

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

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(email.trim(), firstName.trim(), acceptsMarketing);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-pink-200 shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4 text-white text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Je resultaat is klaar</p>
            </div>

            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                {/* What They'll Receive */}
                <div className="text-center space-y-3">
                  <p className="text-gray-700 leading-relaxed">
                    Op basis van je antwoorden heb ik je{' '}
                    <strong className="text-gray-900">Dating Patroon</strong>{' '}
                    geïdentificeerd — inclusief:
                  </p>

                  <div className="space-y-2 text-left max-w-sm mx-auto">
                    {[
                      'Welk attachment type je hebt',
                      'Hoe dit je dating gedrag beïnvloedt',
                      'De #1 valkuil waar jij waarschijnlijk in trapt',
                      'Eén concrete tip die je vandaag kunt toepassen',
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <p className="text-center text-gray-600 font-medium">
                    Waar mag ik je resultaat naartoe sturen?
                  </p>

                  <div className="space-y-3">
                    {/* First Name */}
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Je voornaam"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12 pl-10 text-base border-2 focus:border-pink-500"
                        autoComplete="given-name"
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="jouw@email.nl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-10 text-base border-2 focus:border-pink-500"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Marketing Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptsMarketing}
                      onChange={(e) => setAcceptsMarketing(e.target.checked)}
                      className="mt-1 w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-600">
                      Je ontvangt ook mijn beste dating inzichten — geen spam,
                      afmelden kan altijd.
                    </span>
                  </label>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full h-12 text-base bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Bezig met analyseren...
                      </>
                    ) : (
                      <>
                        Toon Mijn Resultaat
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Je gegevens zijn 100% veilig en privé</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button variant="ghost" onClick={onBack} className="text-gray-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar vragen
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
