'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface Categorie {
  id: string;
  label: string;
  max: number | null;
  color: string;
}

interface KernkwaliteitenSelectorProps {
  titel: string;
  beschrijving: string;
  presetItems: string[];
  categorieën: Categorie[];
  validatie: {
    maxEssentieel: number;
    foutmelding: string;
  };
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface SelectorResultaat {
  essentieel: string[];
  niceToHave: string[];
  irrelevant: string[];
  isValid: boolean;
}

export function KernkwaliteitenSelector({
  titel,
  beschrijving,
  presetItems,
  categorieën,
  validatie,
  irisContext,
  onComplete,
  onPrevious
}: KernkwaliteitenSelectorProps) {
  const [categorieënState, setCategorieënState] = useState<Record<string, string[]>>({
    essentieel: [],
    niceToHave: [],
    irrelevant: []
  });
  const [beschikbareItems, setBeschikbareItems] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize with preset items
  useEffect(() => {
    setBeschikbareItems([...presetItems]);
  }, [presetItems]);

  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, categorieId: string) => {
    e.preventDefault();

    if (!draggedItem) return;

    // Check if categorie has a maximum
    const categorie = categorieën.find(c => c.id === categorieId);
    if (categorie && categorie.max !== null && categorieënState[categorieId].length >= categorie.max) {
      return; // Don't allow drop if max reached
    }

    // Remove from current location
    const newState = { ...categorieënState };
    const newBeschikbaar = [...beschikbareItems];

    // Remove from any existing categorie
    Object.keys(newState).forEach(key => {
      const index = newState[key].indexOf(draggedItem);
      if (index > -1) {
        newState[key].splice(index, 1);
      }
    });

    // Remove from beschikbaar if it's there
    const beschikbaarIndex = newBeschikbaar.indexOf(draggedItem);
    if (beschikbaarIndex > -1) {
      newBeschikbaar.splice(beschikbaarIndex, 1);
    }

    // Add to target categorie
    newState[categorieId].push(draggedItem);

    setCategorieënState(newState);
    setBeschikbareItems(newBeschikbaar);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    const resultaten: SelectorResultaat = {
      essentieel: categorieënState.essentieel,
      niceToHave: categorieënState.niceToHave,
      irrelevant: categorieënState.irrelevant,
      isValid: categorieënState.essentieel.length <= validatie.maxEssentieel
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const isValid = categorieënState.essentieel.length <= validatie.maxEssentieel;
  const totaalItems = Object.values(categorieënState).flat().length + beschikbareItems.length;

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Resultaten Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Kernkwaliteiten Geselecteerd
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je hebt {categorieënState.essentieel.length} essentiële kwaliteiten gekozen. Dit vormt de basis van je dating strategie.
            </p>
          </CardContent>
        </Card>

        {/* Essentieel Highlight */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Jouw Essentiële Kwaliteiten</h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {categorieënState.essentieel.map((kwaliteit, index) => (
                  <Badge key={kwaliteit} className="bg-purple-600 text-white px-3 py-1">
                    {index + 1}. {kwaliteit}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Deze {categorieënState.essentieel.length} kwaliteiten zijn niet-onderhandelbaar voor jou in een partner.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Overzicht */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-purple-700">Essentieel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categorieënState.essentieel.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Nice-to-have</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categorieënState.niceToHave.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">Irrelevant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categorieënState.irrelevant.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Hoe te categoriseren:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Essentieel:</strong> Maximaal {validatie.maxEssentieel} - Niet-onderhandelbaar</li>
                <li>• <strong>Nice-to-have:</strong> Leuk als het er is, maar niet cruciaal</li>
                <li>• <strong>Irrelevant:</strong> Maakt niet uit voor jou</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drag & Drop Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Beschikbare Items */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Beschikbare Kwaliteiten</CardTitle>
            <p className="text-sm text-gray-600">Sleep naar categorieën</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 min-h-[300px]">
              {beschikbareItems.map((item) => (
                <div
                  key={item}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className={`p-3 rounded-lg border-2 border-dashed border-gray-300 cursor-move transition-all hover:border-purple-300 hover:bg-purple-50 ${
                    draggedItem === item ? 'border-purple-400 bg-purple-50 shadow-lg' : ''
                  }`}
                >
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
              {beschikbareItems.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Alle kwaliteiten zijn gecategoriseerd
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categorieën */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {categorieën.map((categorie) => {
            const itemsInCategorie = categorieënState[categorie.id];
            const isOverMax = categorie.max !== null && itemsInCategorie.length > categorie.max;
            const isEssentieelOverMax = categorie.id === 'essentieel' && itemsInCategorie.length > validatie.maxEssentieel;

            return (
              <Card
                key={categorie.id}
                className={`transition-all ${
                  isOverMax ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, categorie.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-lg ${
                      categorie.color === 'pink' ? 'text-pink-700' :
                      categorie.color === 'gray' ? 'text-gray-700' : 'text-gray-700'
                    }`}>
                      {categorie.label}
                    </CardTitle>
                    <Badge variant={isOverMax ? 'destructive' : 'outline'}>
                      {itemsInCategorie.length}{categorie.max ? `/${categorie.max}` : ''}
                    </Badge>
                  </div>
                  {categorie.id === 'essentieel' && (
                    <p className="text-sm text-gray-600">
                      Maximaal {validatie.maxEssentieel} - Niet-onderhandelbaar
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`space-y-2 min-h-[200px] p-2 rounded-lg border-2 border-dashed ${
                    isOverMax ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}>
                    {itemsInCategorie.map((item) => (
                      <div
                        key={item}
                        className={`p-2 rounded border ${
                          categorie.color === 'pink' ? 'bg-pink-50 border-pink-200' :
                          categorie.color === 'gray' ? 'bg-gray-50 border-gray-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                    {itemsInCategorie.length === 0 && (
                      <div className="text-center text-gray-400 py-4">
                        Sleep kwaliteiten hierheen
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Validation Message */}
      {!isValid && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Te veel essentiële kwaliteiten</h4>
                <p className="text-sm text-red-800">{validatie.foutmelding}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || totaalItems === 0}
            className="w-full bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
            size="lg"
          >
            Kernkwaliteiten Opslaan & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {totaalItems === 0 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Categoriseer eerst alle kwaliteiten
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}