'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { PremiumGateProps } from '../types/module3.types';

export function PremiumGate({ title, description, features, onUpgrade }: PremiumGateProps) {
  const handleUpgrade = () => {
    // Navigate to pricing page
    window.location.href = '/prijzen';
  };

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Lock className="w-5 h-5" />
          {title}
        </CardTitle>
        <p className="text-gray-600 mt-2">{description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Inclusief in Premium:
          </h4>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-700">{index + 1}</span>
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Badge */}
        <div className="text-center">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-semibold">
            <Crown className="w-4 h-4 mr-2" />
            Premium Feature
          </Badge>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          <Crown className="w-5 h-5 mr-2" />
          Upgrade naar Premium
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {/* Additional Info */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>✓ 30 dagen geld terug garantie</p>
          <p>✓ Direct toegang tot alle premium modules</p>
          <p>✓ Ongelimiteerde AI coaching</p>
        </div>
      </CardContent>
    </Card>
  );
}