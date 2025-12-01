"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Flame, Zap, Clock, Target, Sparkles, ArrowRight } from 'lucide-react';

interface AttachmentIntroProps {
  onStart: () => void;
  loading: boolean;
}

export function AttachmentIntro({ onStart, loading }: AttachmentIntroProps) {
  return (
    <div className="p-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-pink-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ontdek Je Hechtingsstijl
        </h2>

        <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
          In slechts 3-5 minuten krijg je praktische inzichten in hoe je relaties aangaat.
          Geen therapie, wel nuttige kennis voor betere dating beslissingen.
        </p>

        <div className="flex items-center justify-center gap-4 mb-8">
          <Badge variant="outline" className="px-4 py-2 border-gray-200">
            <Clock className="w-4 h-4 mr-2 text-pink-500" />
            3-5 minuten
          </Badge>
          <Badge variant="outline" className="px-4 py-2 border-gray-200">
            <Target className="w-4 h-4 mr-2 text-pink-500" />
            12 vragen
          </Badge>
        </div>
      </div>

      {/* Attachment Styles Preview */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
          4 Hechtingsstijlen
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Veilig (Secure)</h4>
                  <p className="text-sm text-gray-600 mb-3">Evenwichtig en vertrouwend</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Comfortabel met intimiteit en onafhankelijkheid. Gezonde relatiepatronen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Flame className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Angstig (Anxious)</h4>
                  <p className="text-sm text-gray-600 mb-3">Zoekt veel bevestiging</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Sterke behoefte aan zekerheid. Kan intens reageren op afstand.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Vermijdend (Avoidant)</h4>
                  <p className="text-sm text-gray-600 mb-3">Waardeert onafhankelijkheid</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Trekt zich terug bij te veel nabijheid. Voorkeur voor autonomie.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Angstig-Vermijdend</h4>
                  <p className="text-sm text-gray-600 mb-3">Conflicterende behoeften</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Wisselt tussen sterke afhankelijkheid en plotselinge afstand.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
          Wat Je Krijgt
        </h3>

        <div className="space-y-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Concrete Inzichten</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Begrijp hoe je relatiepatronen werken in dating situaties.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Praktische Tips</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Direct toepasbare strategieën voor betere dating ervaringen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tool Integratie</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Gekoppelde oefeningen in Chat Coach, Profiel Coach en meer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Start Button */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="text-center">
            <Button
              onClick={onStart}
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 text-base rounded-full shadow-lg hover:shadow-xl transition-all mb-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Bezig met starten...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start QuickScan
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <p className="text-sm text-gray-600">
              Anoniem • AVG-proof • Geen verplichtingen
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}