"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  Copy,
  CheckCircle,
  Heart,
  Shield,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface ConversationScript {
  id: string;
  situatie: string;
  beschrijving: string;
  script: string;
  categorie: 'grenzen' | 'communicatie' | 'veiligheid' | 'intensiteit';
  icoon: React.ReactNode;
  kleur: string;
  tips?: string[];
}

interface ConversationScriptsProps {
  scripts: any;
  onScriptUsed?: (scriptId: string) => void;
}

export function ConversationScripts({ scripts, onScriptUsed }: ConversationScriptsProps) {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [customizedScripts, setCustomizedScripts] = useState<Record<string, string>>({});

  const copyToClipboard = async (text: string, scriptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(scriptId);
      setTimeout(() => setCopiedScript(null), 2000);

      if (onScriptUsed) {
        onScriptUsed(scriptId);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCustomization = (scriptId: string, customText: string) => {
    setCustomizedScripts(prev => ({
      ...prev,
      [scriptId]: customText
    }));
  };

  // Default scripts based on attachment styles
  const defaultScripts: ConversationScript[] = [
    {
      id: 'inconsistent_reageren',
      situatie: 'Bij inconsistent reageren',
      beschrijving: 'Wanneer iemand traag reageert op berichten',
      script: 'Hey, ik merk dat ik wat ga invullen. Hoe is jouw week qua drukte?',
      categorie: 'communicatie',
      icoon: <MessageCircle className="w-5 h-5" />,
      kleur: 'text-blue-600 bg-blue-50 border-blue-200',
      tips: [
        'Stelt duidelijkheid vragen zonder te beschuldigen',
        'Toont begrip voor drukte',
        'Houdt de deur open voor gesprek'
      ]
    },
    {
      id: 'ruimte_nodig',
      situatie: 'Ruimte nodig',
      beschrijving: 'Wanneer je emotionele ruimte wilt creëren',
      script: 'Ik vind dit leuk, en ik wil het goed doen. Mag ik even landen en dan reageer ik later op je?',
      categorie: 'grenzen',
      icoon: <Shield className="w-5 h-5" />,
      kleur: 'text-green-600 bg-green-50 border-green-200',
      tips: [
        'Wees eerlijk over je behoeften',
        'Geef een tijdlijn voor reactie',
        'Toont respect voor jezelf en ander'
      ]
    },
    {
      id: 'grenzen_stellen',
      situatie: 'Grenzen stellen',
      beschrijving: 'Duidelijke grenzen communiceren',
      script: 'Ik voel me prettiger als we iets duidelijker afstemmen hoe vaak we appen.',
      categorie: 'grenzen',
      icoon: <AlertTriangle className="w-5 h-5" />,
      kleur: 'text-orange-600 bg-orange-50 border-orange-200',
      tips: [
        'Focus op je gevoelens ("ik voel me...")',
        'Wees specifiek over wat je wilt',
        'Houdt de communicatie open'
      ]
    },
    {
      id: 'intensiteit_verlagen',
      situatie: 'Intensiteit verlagen',
      beschrijving: 'Bij te snelle emotionele intensiteit',
      script: 'Ik vind dit leuk, maar laten we een rustig tempo kiezen zodat we het echt goed leren kennen.',
      categorie: 'veiligheid',
      icoon: <Heart className="w-5 h-5" />,
      kleur: 'text-pink-600 bg-pink-50 border-pink-200',
      tips: [
        'Erken wat je leuk vindt',
        'Stel een alternatief tempo voor',
        'Toont commitment aan kwaliteit boven snelheid'
      ]
    },
    {
      id: 'check_in',
      situatie: 'Check-in na date',
      beschrijving: 'Reflecteren na een date',
      script: 'Ik heb genoten van onze date. Hoe kijk jij erop terug?',
      categorie: 'communicatie',
      icoon: <Sparkles className="w-5 h-5" />,
      kleur: 'text-purple-600 bg-purple-50 border-purple-200',
      tips: [
        'Toont interesse in de ander',
        'Opent deur voor eerlijk gesprek',
        'Helpt verwachtingen afstemmen'
      ]
    },
    {
      id: 'herstel_na_conflict',
      situatie: 'Herstel na conflict',
      beschrijving: 'Terugkomen na een misverstand',
      script: 'Ik wil dit graag oplossen. Mag ik uitleggen hoe ik het bedoelde?',
      categorie: 'communicatie',
      icoon: <RefreshCw className="w-5 h-5" />,
      kleur: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      tips: [
        'Toont bereidheid tot herstel',
        'Neemt verantwoordelijkheid',
        'Focus op oplossing, niet schuld'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          💬 Conversation Scripts
        </h3>
        <p className="text-gray-600 text-sm">
          Kant-en-klare teksten voor verschillende situaties, afgestemd op je hechtingsstijl
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {defaultScripts.map((script) => {
          const customizedText = customizedScripts[script.id] || script.script;
          const isCopied = copiedScript === script.id;

          return (
            <Card key={script.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${script.kleur}`}>
                    {script.icoon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{script.situatie}</CardTitle>
                    <p className="text-sm text-gray-600">{script.beschrijving}</p>
                  </div>
                </div>

                <Badge variant="outline" className="w-fit text-xs capitalize">
                  {script.categorie}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Script Text */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800 italic">"{customizedText}"</p>
                </div>

                {/* Customization */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Pas aan (optioneel):
                  </label>
                  <Textarea
                    placeholder="Pas het script aan naar jouw woorden..."
                    value={customizedScripts[script.id] || ''}
                    onChange={(e) => handleCustomization(script.id, e.target.value)}
                    className="text-sm min-h-[60px]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(customizedText, script.id)}
                    className="flex-1"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Gekopieerd!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Kopiëren
                      </>
                    )}
                  </Button>
                </div>

                {/* Tips */}
                {script.tips && script.tips.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips:</h5>
                    <ul className="space-y-1">
                      {script.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Heart className="w-6 h-6 text-pink-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Scripts als Bouwstenen
            </h4>
            <p className="text-gray-700 text-sm mb-3">
              Deze scripts zijn bedoeld als uitgangspunt, geen vaste teksten.
              Gebruik ze om te oefenen met assertieve communicatie die past bij je hechtingsstijl.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Voor Veilig Hechting:</h5>
                <p className="text-gray-600">Direct en duidelijk communiceren</p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Voor Angstig Hechting:</h5>
                <p className="text-gray-600">Geruststelling vragen zonder te pushen</p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Voor Vermijdend Hechting:</h5>
                <p className="text-gray-600">Grenzen stellen met respect voor autonomie</p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-1">Voor Angstig-Vermijdend:</h5>
                <p className="text-gray-600">Balans tussen nabijheid en ruimte</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}