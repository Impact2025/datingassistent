"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, MessageCircle } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

export default function ProfielPage() {
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
            <h1 className="text-xl font-bold text-gray-900">Profiel Coach</h1>
            <p className="text-sm text-gray-600">Foto, bio en profiel optimalisatie</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <Card className="border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-600" />
              Profiel Optimalisatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Upload je profielfoto's en bio voor professionele AI-analyse en optimalisatie tips.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => router.push('/tools?tool=photo')}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Foto Analyse
              </Button>

              <Button
                onClick={() => router.push('/tools?tool=chat')}
                variant="outline"
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Bio Coach
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="font-semibold text-gray-900 mb-2">Volledige Tool Komt Binnenkort</h3>
              <p className="text-gray-600 text-sm mb-4">
                We werken hard aan een complete profiel optimalisatie tool met AI-analyse.
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