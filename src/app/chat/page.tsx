"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Heart, Zap } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

export default function ChatPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tools')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chat Coach</h1>
            <p className="text-sm text-gray-600">Gespreksanalyse en advies</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <Card className="border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-600" />
              Chat Optimalisatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Upload je chatgesprekken voor AI-analyse en krijg persoonlijke tips om betere connecties te maken.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => router.push('/tools?tool=opener')}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Opener Lab - Effectieve openingszinnen
              </Button>

              <Button
                onClick={() => router.push('/tools?tool=voice')}
                variant="outline"
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Voice Notes - Audio analyse
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-semibold text-gray-900 mb-2">Chat Coach Komt Binnenkort</h3>
              <p className="text-gray-600 text-sm mb-4">
                We ontwikkelen een geavanceerde chat analyse tool met AI-gedreven inzichten voor betere gesprekken.
              </p>
              <Button
                onClick={() => router.push('/tools')}
                variant="outline"
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
              >
                Bekijk Alle Tools
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}