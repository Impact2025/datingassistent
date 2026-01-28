"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Lucide from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import type { UserProfile } from '@/lib/types';
import { MODULES, ASSESSMENT_MODULE } from '@/lib/data';

interface LearningPathStep {
  id: number;
  title: string;
  description: string;
  type: 'module' | 'assessment' | 'course';
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  recommended?: boolean;
}

// Extended UserProfile type for skills assessment
interface ExtendedUserProfile extends UserProfile {
  datingExperience?: 'beginner' | 'intermediate' | 'advanced';
}

export function LearningPath() {
  const { userProfile } = useUser();
  const [learningPath, setLearningPath] = useState<LearningPathStep[]>([]);

  useEffect(() => {
    if (userProfile) {
      generateLearningPath(userProfile);
    }
  }, [userProfile]);

  const generateLearningPath = (profile: UserProfile) => {
    const path: LearningPathStep[] = [];
    
    // Start with skills assessment
    path.push({
      id: ASSESSMENT_MODULE.id,
      title: ASSESSMENT_MODULE.title,
      description: ASSESSMENT_MODULE.theme,
      type: 'assessment',
      status: 'available',
      recommended: true
    });
    
    // Type guard to check if userProfile has datingExperience
    const hasDatingExperience = (profile: UserProfile): profile is ExtendedUserProfile => {
      return 'datingExperience' in profile;
    };
    
    // Determine experience level
    const experienceLevel = hasDatingExperience(profile) ? profile.datingExperience : 'beginner';
    
    // Add modules based on experience level
    if (experienceLevel === 'beginner') {
      // Beginner path - start with basics
      path.push(
        {
          id: 1,
          title: MODULES[0].title,
          description: MODULES[0].theme,
          type: 'module',
          status: 'available',
          recommended: true
        },
        {
          id: 3,
          title: MODULES[2].title,
          description: MODULES[2].theme,
          type: 'module',
          status: 'locked'
        },
        {
          id: 2,
          title: MODULES[1].title,
          description: MODULES[1].theme,
          type: 'module',
          status: 'locked'
        }
      );
    } else if (experienceLevel === 'intermediate') {
      // Intermediate path - focus on conversation skills
      path.push(
        {
          id: 4,
          title: MODULES[3].title,
          description: MODULES[3].theme,
          type: 'module',
          status: 'available',
          recommended: true
        },
        {
          id: 5,
          title: MODULES[4].title,
          description: MODULES[4].theme,
          type: 'module',
          status: 'locked'
        },
        {
          id: 6,
          title: MODULES[5].title,
          description: MODULES[5].theme,
          type: 'module',
          status: 'locked'
        }
      );
    } else {
      // Advanced path - focus on relationship building
      path.push(
        {
          id: 5,
          title: MODULES[4].title,
          description: MODULES[4].theme,
          type: 'module',
          status: 'available',
          recommended: true
        },
        {
          id: 6,
          title: MODULES[5].title,
          description: MODULES[5].theme,
          type: 'module',
          status: 'locked'
        },
        {
          id: 4,
          title: MODULES[3].title,
          description: MODULES[3].theme,
          type: 'module',
          status: 'locked'
        }
      );
    }
    
    setLearningPath(path);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Lucide.CheckCircle className="text-green-500" />;
      case 'in-progress':
        return <Lucide.Clock className="text-yellow-500" />;
      case 'available':
        return <Lucide.Unlock className="text-blue-500" />;
      case 'locked':
        return <Lucide.Lock className="text-gray-400" />;
      default:
        return <Lucide.Circle className="text-gray-300" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Voltooid';
      case 'in-progress':
        return 'Bezig';
      case 'available':
        return 'Beschikbaar';
      case 'locked':
        return 'Vergrendeld';
      default:
        return 'Onbekend';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Map className="text-primary" />
            Jouw Persoonlijke Leertraject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Volg dit aangeraden leertraject om je dating vaardigheden systematisch te verbeteren.
          </p>
          
          <div className="space-y-4">
            {learningPath.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  step.status === 'available' || step.status === 'in-progress' 
                    ? 'bg-background border-primary/20' 
                    : step.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-muted/50 border-muted'
                }`}
              >
                <div className="flex flex-col items-center mt-1">
                  <div className="relative">
                    {getStatusIcon(step.status)}
                    {step.recommended && (
                      <Lucide.Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  {index < learningPath.length - 1 && (
                    <div className="h-8 w-0.5 bg-border mt-1"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      step.status === 'completed' ? 'bg-green-100 text-green-800' :
                      step.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      step.status === 'available' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(step.status)}
                    </span>
                  </div>
                  
                  {step.recommended && (
                    <div className="flex items-center gap-1 mt-2">
                      <Lucide.Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-yellow-700 font-medium">Aanbevolen volgende stap</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    {step.status === 'available' && (
                      <Button size="sm" className="bg-coral-500 hover:bg-coral-600">
                        Start nu
                      </Button>
                    )}
                    {step.status === 'in-progress' && (
                      <Button size="sm" variant="outline">
                        Ga verder
                      </Button>
                    )}
                    {step.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        Bekijk opnieuw
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}