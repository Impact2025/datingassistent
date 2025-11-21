"use client";

import { useState } from 'react';
import { SkillsAssessment } from '@/components/dashboard/skills-assessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Lucide from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import type { UserProfile } from '@/lib/types';

// Extended UserProfile type for skills assessment
interface ExtendedUserProfile extends UserProfile {
  datingExperience?: 'beginner' | 'intermediate' | 'advanced';
  strengths?: string[];
  areasForImprovement?: string[];
}

export function SkillsAssessmentTab() {
  const { userProfile } = useUser();
  const [showAssessment, setShowAssessment] = useState(false);

  // Type guard to check if userProfile has assessment fields
  const hasAssessmentData = (profile: UserProfile): profile is ExtendedUserProfile => {
    return (
      'datingExperience' in profile ||
      'strengths' in profile ||
      'areasForImprovement' in profile
    );
  };

  // Check if user has already taken the assessment
  const hasTakenAssessment = userProfile && hasAssessmentData(userProfile) && (
    userProfile.datingExperience ||
    (userProfile.strengths && userProfile.strengths.length > 0) ||
    (userProfile.areasForImprovement && userProfile.areasForImprovement.length > 0)
  );

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Award className="w-6 h-6 text-pink-600" />
            <span className="text-pink-600">Dating Vaardigheden Beoordeling</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Ontdek je huidige niveau in online daten en ontvang persoonlijke aanbevelingen 
            voor modules en cursussen die bij jouw niveau en doelen passen.
          </p>
          
          {hasTakenAssessment && !showAssessment ? (
            <div className="space-y-6">
              <div className="bg-background p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Je eerdere beoordeling</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    hasAssessmentData(userProfile) && userProfile.datingExperience === 'beginner' ? 'bg-blue-100 text-blue-800' :
                    hasAssessmentData(userProfile) && userProfile.datingExperience === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    hasAssessmentData(userProfile) && userProfile.datingExperience === 'advanced' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {hasAssessmentData(userProfile) && userProfile.datingExperience === 'beginner' ? 'Beginner' :
                     hasAssessmentData(userProfile) && userProfile.datingExperience === 'intermediate' ? 'Gemiddeld' : 
                     hasAssessmentData(userProfile) && userProfile.datingExperience === 'advanced' ? 'Gevorderd' : 'Niet bepaald'}
                  </span>
                </div>
                
                {hasAssessmentData(userProfile) && userProfile.strengths && userProfile.strengths.length > 0 && (
                  <div className="mb-3">
                    <h4 className="font-medium mb-1">Sterke punten:</h4>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.strengths.map((strength, index) => (
                        <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {hasAssessmentData(userProfile) && userProfile.areasForImprovement && userProfile.areasForImprovement.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Verbeterpunten:</h4>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.areasForImprovement.map((area, index) => (
                        <span key={index} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Button onClick={() => setShowAssessment(true)}>
                Beoordeling opnieuw doen
              </Button>
            </div>
          ) : showAssessment || !hasTakenAssessment ? (
            <SkillsAssessment />
          ) : (
            <div className="text-center py-8">
              <Lucide.ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ontdek je dating vaardigheden</h3>
              <p className="text-muted-foreground mb-6">
                Neem een korte beoordeling om je huidige niveau te bepalen en 
                persoonlijke aanbevelingen te ontvangen.
              </p>
              <Button onClick={() => setShowAssessment(true)}>
                Start beoordeling
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}