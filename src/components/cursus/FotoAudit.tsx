'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Camera, CheckCircle, AlertCircle } from 'lucide-react';

interface FotoVraag {
  id: string;
  label: string;
  vraag: string;
  type: 'slider';
  min: number;
  max: number;
}

interface DiversiteitItem {
  id: string;
  label: string;
}

interface ActionPlanItem {
  id: string;
  label: string;
  tips?: string[];
}

interface FotoAuditProps {
  titel: string;
  beschrijving: string;
  fotoVragen: FotoVraag[];
  diversiteitCheck: DiversiteitItem[];
  actionPlanItems: {
    verwijderen: ActionPlanItem[];
    maken: ActionPlanItem[];
  };
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface FotoAuditResultaten {
  beeldScores: Record<string, number>;
  energieType: string;
  diversiteitChecklist: Record<string, boolean>;
  actionPlan: {
    teVerwijderen: string[];
    teMaken: string[];
  };
  isValid: boolean;
}

export function FotoAudit({
  titel,
  beschrijving,
  fotoVragen,
  diversiteitCheck,
  actionPlanItems,
  irisContext,
  onComplete,
  onPrevious
}: FotoAuditProps) {
  const [beeldScores, setBeeldScores] = useState<Record<string, number>>({});
  const [energieType, setEnergieType] = useState<string>('');
  const [diversiteitChecklist, setDiversiteitChecklist] = useState<Record<string, boolean>>({});
  const [actionPlan, setActionPlan] = useState({
    teVerwijderen: [] as string[],
    teMaken: [] as string[]
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize state
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    fotoVragen.forEach(vraag => {
      initialScores[vraag.id] = 5; // Start at middle
    });

    const initialChecklist: Record<string, boolean> = {};
    diversiteitCheck.forEach(item => {
      initialChecklist[item.id] = false;
    });

    setBeeldScores(initialScores);
    setDiversiteitChecklist(initialChecklist);
  }, [fotoVragen, diversiteitCheck]);

  const handleScoreChange = (vraagId: string, score: number[]) => {
    setBeeldScores(prev => ({
      ...prev,
      [vraagId]: score[0]
    }));
  };

  const handleDiversiteitChange = (itemId: string, checked: boolean) => {
    setDiversiteitChecklist(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleActionPlanChange = (type: 'teVerwijderen' | 'teMaken', itemId: string, checked: boolean) => {
    setActionPlan(prev => ({
      ...prev,
      [type]: checked
        ? [...prev[type], itemId]
        : prev[type].filter(id => id !== itemId)
    }));
  };

  const handleSubmit = () => {
    const resultaten: FotoAuditResultaten = {
      beeldScores,
      energieType,
      diversiteitChecklist,
      actionPlan,
      isValid: true // Always valid for now
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const isValid = Object.keys(beeldScores).length === fotoVragen.length && energieType !== '';
  const totaalScore = Object.values(beeldScores).reduce((sum, score) => sum + score, 0);
  const gemiddeldeScore = fotoVragen.length > 0 ? Math.round(totaalScore / fotoVragen.length) : 0;

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Foto Audit Voltooid
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Gemiddelde BEELD-score: {gemiddeldeScore}/10. {energieType && `Energie: ${energieType}.`}
            </p>
          </CardContent>
        </Card>

        {/* BEELD Scores Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Jouw BEELD Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fotoVragen.map(vraag => (
                <div key={vraag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{vraag.label}</span>
                  <Badge variant={beeldScores[vraag.id] >= 7 ? 'default' : beeldScores[vraag.id] >= 4 ? 'secondary' : 'destructive'}>
                    {beeldScores[vraag.id]}/10
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Plan Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Jouw Foto Actieplan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actionPlan.teVerwijderen.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Te Verwijderen:</h4>
                  <ul className="space-y-1">
                    {actionPlan.teVerwijderen.map(itemId => {
                      const item = actionPlanItems.verwijderen.find(i => i.id === itemId);
                      return item ? (
                        <li key={itemId} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          {item.label}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}

              {actionPlan.teMaken.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Te Maken:</h4>
                  <ul className="space-y-1">
                    {actionPlan.teMaken.map(itemId => {
                      const item = actionPlanItems.maken.find(i => i.id === itemId);
                      return item ? (
                        <li key={itemId} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {item.label}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* BEELD Framework Explanation */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-center">
            <h3 className="font-bold text-blue-900 mb-2">Het BEELD-Framework™</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="bg-white p-2 rounded">B = Beste Versie</div>
              <div className="bg-white p-2 rounded">E = Expressie</div>
              <div className="bg-white p-2 rounded">E = Energie</div>
              <div className="bg-white p-2 rounded">L = Levensstijl</div>
              <div className="bg-white p-2 rounded col-span-2 md:col-span-4">D = Diversiteit</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BEELD Scores */}
      <Card>
        <CardHeader>
          <CardTitle>BEELD Scores (1-10)</CardTitle>
          <p className="text-sm text-gray-600">Beoordeel je huidige foto's op elk element</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {fotoVragen.map(vraag => (
            <div key={vraag.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium">{vraag.label}</label>
                <Badge variant="outline">{beeldScores[vraag.id] || 0}/10</Badge>
              </div>
              <p className="text-sm text-gray-600">{vraag.vraag}</p>
              <Slider
                value={[beeldScores[vraag.id] || 5]}
                onValueChange={(value) => handleScoreChange(vraag.id, value)}
                max={vraag.max}
                min={vraag.min}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Energie Type */}
      <Card>
        <CardHeader>
          <CardTitle>Energie Type</CardTitle>
          <p className="text-sm text-gray-600">Welke energie straal je uit op je foto's?</p>
        </CardHeader>
        <CardContent>
          <Select value={energieType} onValueChange={setEnergieType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer je energie type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Avontuurlijk">Avontuurlijk</SelectItem>
              <SelectItem value="Warm">Warm</SelectItem>
              <SelectItem value="Succesvol">Succesvol</SelectItem>
              <SelectItem value="Creatief">Creatief</SelectItem>
              <SelectItem value="Relaxed">Relaxed</SelectItem>
              <SelectItem value="Onduidelijk">Onduidelijk</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Diversiteit Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Diversiteit Check</CardTitle>
          <p className="text-sm text-gray-600">Welke soorten foto's heb je?</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {diversiteitCheck.map(item => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={diversiteitChecklist[item.id] || false}
                  onCheckedChange={(checked) => handleDiversiteitChange(item.id, checked as boolean)}
                />
                <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Actieplan</CardTitle>
          <p className="text-sm text-gray-600">Wat ga je doen om je foto's te verbeteren?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Te Verwijderen */}
          <div>
            <h4 className="font-semibold text-red-700 mb-3">Te Verwijderen:</h4>
            <div className="space-y-2">
              {actionPlanItems.verwijderen.map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`verwijder-${item.id}`}
                    checked={actionPlan.teVerwijderen.includes(item.id)}
                    onCheckedChange={(checked) => handleActionPlanChange('teVerwijderen', item.id, checked as boolean)}
                  />
                  <label htmlFor={`verwijder-${item.id}`} className="text-sm">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Te Maken */}
          <div>
            <h4 className="font-semibold text-green-700 mb-3">Te Maken:</h4>
            <div className="space-y-3">
              {actionPlanItems.maken.map(item => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`maken-${item.id}`}
                      checked={actionPlan.teMaken.includes(item.id)}
                      onCheckedChange={(checked) => handleActionPlanChange('teMaken', item.id, checked as boolean)}
                    />
                    <label htmlFor={`maken-${item.id}`} className="text-sm font-medium">
                      {item.label}
                    </label>
                  </div>
                  {item.tips && (
                    <ul className="ml-6 space-y-1">
                      {item.tips.map((tip, index) => (
                        <li key={index} className="text-xs text-gray-600">• {tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation */}
      {!isValid && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Bijna klaar!</h4>
                <p className="text-sm text-yellow-800">
                  Beoordeel alle BEELD-elementen en selecteer je energie type.
                </p>
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
            disabled={!isValid}
            className="w-full bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
            size="lg"
          >
            Foto Audit Opslaan & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}