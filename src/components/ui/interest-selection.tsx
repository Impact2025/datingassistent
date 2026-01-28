"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/providers/user-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Interest {
  id: string;
  label: string;
  icon: string;
  color: string;
  description?: string;
}

interface InterestSelectionProps {
  selectedInterests: string[];
  onSelectionChange: (interests: string[]) => void;
  title?: string;
  subtitle?: string;
  maxSelections?: number;
  showExistingData?: boolean;
}

const INTEREST_CATEGORIES: Interest[] = [
  {
    id: 'food-drink',
    label: 'Eten & Drinken',
    icon: '🍽️',
    color: 'bg-orange-100 border-orange-200 text-orange-800',
    description: 'Restaurants, cafés, koken, wijnproeven'
  },
  {
    id: 'adventure',
    label: 'Avontuur & Outdoor',
    icon: '🏔️',
    color: 'bg-green-100 border-green-200 text-green-800',
    description: 'Wandelen, klimmen, stedentrip, natuur'
  },
  {
    id: 'culture',
    label: 'Cultuur & Creatief',
    icon: '🎨',
    color: 'bg-purple-100 border-purple-200 text-purple-800',
    description: 'Musea, theater, kunst, fotografie, muziek'
  },
  {
    id: 'sports',
    label: 'Sportief & Actief',
    icon: '⚽',
    color: 'bg-blue-100 border-blue-200 text-blue-800',
    description: 'Sporten, fitness, dansen, yoga'
  },
  {
    id: 'chill',
    label: 'Chill & Cozy',
    icon: '🛋️',
    color: 'bg-coral-100 border-coral-200 text-coral-800',
    description: 'Thuis koken, Netflix, spelletjes, knuffelen'
  },
  {
    id: 'luxury',
    label: 'Luxe & Romantisch',
    icon: '💎',
    color: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    description: 'Fine dining, spa, concerten, reizen'
  },
  {
    id: 'budget',
    label: 'Low Budget / Spontaan',
    icon: '💰',
    color: 'bg-green-100 border-green-200 text-green-800',
    description: 'Gratis activiteiten, markt, park, thuis'
  }
];

export function InterestSelection({
  selectedInterests,
  onSelectionChange,
  title = "Selecteer je interesses",
  subtitle = "Kies minimaal 2 interesses voor de beste date ideeën",
  maxSelections = 5,
  showExistingData = true
}: InterestSelectionProps) {
  const { userProfile } = useUser();

  // Pre-select interests based on existing user data
  useEffect(() => {
    if (showExistingData && userProfile?.interests && selectedInterests.length === 0) {
      const existingInterests = userProfile.interests.map((interest: string) => {
        // Map existing interests to our categories
        const lowerInterest = interest.toLowerCase();
        if (lowerInterest.includes('eten') || lowerInterest.includes('drinken') || lowerInterest.includes('restaurant')) {
          return 'food-drink';
        }
        if (lowerInterest.includes('wandelen') || lowerInterest.includes('natuur') || lowerInterest.includes('buiten')) {
          return 'adventure';
        }
        if (lowerInterest.includes('kunst') || lowerInterest.includes('muziek') || lowerInterest.includes('theater')) {
          return 'culture';
        }
        if (lowerInterest.includes('sport') || lowerInterest.includes('fitness') || lowerInterest.includes('actief')) {
          return 'sports';
        }
        if (lowerInterest.includes('thuis') || lowerInterest.includes('koken') || lowerInterest.includes('film')) {
          return 'chill';
        }
        if (lowerInterest.includes('luxe') || lowerInterest.includes('romantisch') || lowerInterest.includes('spa')) {
          return 'luxury';
        }
        return null;
      }).filter(Boolean) as string[];

      if (existingInterests.length > 0) {
        onSelectionChange(existingInterests);
      }
    }
  }, [userProfile, showExistingData, selectedInterests.length, onSelectionChange]);

  const handleInterestToggle = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      // Remove interest
      onSelectionChange(selectedInterests.filter(id => id !== interestId));
    } else {
      // Add interest (check max selections)
      if (selectedInterests.length < maxSelections) {
        onSelectionChange([...selectedInterests, interestId]);
      }
    }
  };

  const getInterestById = (id: string) => INTEREST_CATEGORIES.find(cat => cat.id === id);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {maxSelections && (
          <p className="text-xs text-muted-foreground mt-1">
            {selectedInterests.length}/{maxSelections} geselecteerd
          </p>
        )}
      </div>

      {showExistingData && userProfile?.interests && userProfile.interests.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 mb-2">
            💡 Gebaseerd op je profiel heb ik alvast interesses geselecteerd:
          </p>
          <div className="flex flex-wrap gap-1">
            {userProfile.interests.slice(0, 3).map((interest: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INTEREST_CATEGORIES.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          const isDisabled = !isSelected && selectedInterests.length >= maxSelections;

          return (
            <button
              key={interest.id}
              onClick={() => handleInterestToggle(interest.id)}
              disabled={isDisabled}
              className={cn(
                "p-4 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md",
                isSelected
                  ? `${interest.color} border-current shadow-md scale-105`
                  : "border-gray-200 hover:border-gray-300 bg-white",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{interest.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-semibold text-sm mb-1",
                    isSelected ? "text-current" : "text-gray-900"
                  )}>
                    {interest.label}
                  </h4>
                  <p className={cn(
                    "text-xs leading-tight",
                    isSelected ? "text-current opacity-80" : "text-gray-600"
                  )}>
                    {interest.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-current rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedInterests.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Geselecteerde interesses:</p>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interestId) => {
              const interest = getInterestById(interestId);
              return interest ? (
                <Badge key={interestId} className={interest.color}>
                  {interest.icon} {interest.label}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}