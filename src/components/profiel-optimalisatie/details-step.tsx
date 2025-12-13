"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface DetailsStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  profileData: any;
}

export function DetailsStep({ onComplete, onBack, profileData }: DetailsStepProps) {
  const [details, setDetails] = useState({
    height: profileData.height || '',
    education: profileData.education || '',
    work: profileData.work || '',
    location: profileData.location || '',
    interests: profileData.interests || []
  });

  const [interestInput, setInterestInput] = useState('');

  const addInterest = () => {
    if (interestInput.trim() && details.interests.length < 10) {
      setDetails(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (index: number) => {
    setDetails(prev => ({
      ...prev,
      interests: prev.interests.filter((_: any, i: number) => i !== index)
    }));
  };

  const canContinue = details.height && details.work;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Terug naar Route</span>
          </button>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              ✓ Details & Afwerking
            </h1>
            <p className="text-gray-600 mt-2">
              Laatste details voor een compleet profiel
            </p>
          </div>
        </div>

        <Card className="p-8 border-0 shadow-lg space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Lengte
              </label>
              <Input
                type="text"
                placeholder="Bijv: 178 cm"
                value={details.height}
                onChange={(e) => setDetails(prev => ({ ...prev, height: e.target.value }))}
                className="border-2 border-gray-200 focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Opleiding
              </label>
              <Input
                type="text"
                placeholder="Bijv: HBO"
                value={details.education}
                onChange={(e) => setDetails(prev => ({ ...prev, education: e.target.value }))}
                className="border-2 border-gray-200 focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Werk
              </label>
              <Input
                type="text"
                placeholder="Bijv: Software Developer"
                value={details.work}
                onChange={(e) => setDetails(prev => ({ ...prev, work: e.target.value }))}
                className="border-2 border-gray-200 focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Woonplaats
              </label>
              <Input
                type="text"
                placeholder="Bijv: Amsterdam"
                value={details.location}
                onChange={(e) => setDetails(prev => ({ ...prev, location: e.target.value }))}
                className="border-2 border-gray-200 focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Interesses
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Voeg interesse toe..."
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                  className="border-2 border-gray-200 focus:border-gray-900"
                />
                <Button onClick={addInterest} variant="outline" className="border-2 border-gray-900">
                  Toevoegen
                </Button>
              </div>
              {details.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {details.interests.map((interest: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full flex items-center gap-2"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(idx)}
                        className="hover:text-gray-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => onComplete({ ...details, completeness: 100 })}
            disabled={!canContinue}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium group"
            size="lg"
          >
            Voltooien & Resultaten Bekijken
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
