'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContextualTooltip } from '@/components/shared/contextual-tooltip';
import { useProfileAnalytics } from '@/lib/profile-analytics';
import { useABTest } from '@/lib/ab-testing';
import { useUser } from '@/providers/user-provider';
import {
  FileText,
  CheckCircle,
  Target,
  RotateCcw,
  ArrowRight,
  Copy
} from 'lucide-react';

interface ProfileOption {
  id: string;
  title: string;
  content: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

interface QuizAnswer {
  questionId: string;
  answerId: string | string[];
  label: string;
  content?: string;
  fields?: Record<string, string | number>;
}

interface ProfileResultsProps {
  profiles: ProfileOption[];
  answers: QuizAnswer[];
  onReset: () => void;
  markAsCompleted: (actionName: string, metadata?: Record<string, any>) => Promise<boolean>;
  onProfileUsed?: (profile: ProfileOption) => void;
}

export function ProfileResults({ profiles, answers, onReset, markAsCompleted, onProfileUsed }: ProfileResultsProps) {
  const { user } = useUser();
  const { trackEvent } = useProfileAnalytics();
  const { trackConversion: trackProfileConversion } = useABTest('profile_variants');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate session ID for analytics (this should be passed from parent component)
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfile(profileId);

    // Track profile selection
    if (user?.id) {
      trackEvent({
        userId: user.id.toString(),
        sessionId,
        eventType: 'profile_selected',
        metadata: {
          profile_id: profileId,
          profile_title: profiles.find(p => p.id === profileId)?.title
        }
      });

      // Track A/B test conversion
      trackProfileConversion(profileId.split('-')[1], user.id.toString(), 'profile_selected');
    }
  };

  const handleCopy = async (profileId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(profileId);

      // Track profile copy event
      if (user?.id) {
        trackEvent({
          userId: user.id.toString(),
          sessionId,
          eventType: 'profile_copied',
          metadata: {
            profile_id: profileId,
            profile_title: profiles.find(p => p.id === profileId)?.title,
            content_length: content.length
          }
        });

        // Track A/B test conversion for copying
        trackProfileConversion(profileId.split('-')[1], user.id.toString(), 'profile_copied');
      }

      await markAsCompleted('bio_copied', { profile_id: profileId });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleUseProfile = async () => {
    if (!selectedProfile) return;

    const selectedProfileData = profiles.find(p => p.id === selectedProfile);
    if (!selectedProfileData) return;

    try {
      // Save profile to user's profile
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profileData: {
            aiGeneratedProfile: selectedProfileData.content,
            profileTitle: selectedProfileData.title,
            profileScore: selectedProfileData.score,
            strengths: selectedProfileData.strengths,
            improvements: selectedProfileData.improvements
          },
          profileType: 'ai_generated'
        })
      });

      if (response.ok) {
        // Track profile usage event
        if (user?.id) {
          trackEvent({
            userId: user.id.toString(),
            sessionId,
            eventType: 'profile_shared',
            metadata: {
              profile_id: selectedProfile,
              profile_title: selectedProfileData.title,
              profile_score: selectedProfileData.score
            }
          });

          // Track A/B test conversion for using profile
          trackProfileConversion(selectedProfile.split('-')[1], user.id.toString(), 'profile_used');
        }

        await markAsCompleted('profile_used', {
          profile_id: selectedProfile,
          profile_title: selectedProfileData.title
        });

        // Call the onProfileUsed callback if provided
        onProfileUsed?.(selectedProfileData);

        // Show success message (you could add a toast notification here)
        alert('Profiel succesvol opgeslagen! Je kunt het nu gebruiken in je dating apps.');
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Er is een fout opgetreden bij het opslaan van je profiel. Probeer het opnieuw.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Profiel Analyse Compleet
          </CardTitle>
          <p className="text-muted-foreground">
            Op basis van je antwoorden hebben we 3 professionele profiel opties gegenereerd.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Analyse Resultaten
            <ContextualTooltip content="Deze kenmerken zijn gebruikt om je profielen te genereren." showIcon />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {answers.map((answer, index) => (
              <div key={index} className="text-center p-3 border rounded-lg">
                <div className="text-sm font-medium">
                  {Array.isArray(answer.answerId) ? answer.label : answer.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex justify-center gap-4 mb-6">
          {profiles.map((profile) => (
            <div key={`title-${profile.id}`} className="text-center">
              <h3 className={`text-lg font-semibold px-4 py-2 rounded-lg transition-colors ${
                selectedProfile === profile.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}>
                {profile.title}
              </h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className={`cursor-pointer transition-all ${
              selectedProfile === profile.id ? 'ring-2 ring-primary shadow-sm' : 'hover:shadow-sm'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Score: {profile.score}</Badge>
                  <ContextualTooltip content="Kopieer deze tekst naar je dating app profiel">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(profile.id, profile.content);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className={`w-4 h-4 ${copiedId === profile.id ? 'text-primary' : ''}`} />
                    </Button>
                  </ContextualTooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg max-h-48 overflow-y-auto relative">
                    {copiedId === profile.id && (
                      <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                        Gekopieerd
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">
                      {profile.content.length > 200
                        ? profile.content.substring(0, 200) + '...'
                        : profile.content
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{profile.strengths[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">{profile.improvements[0]}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleProfileSelect(profile.id)}
                    variant={selectedProfile === profile.id ? "default" : "outline"}
                    className="w-full"
                  >
                    {selectedProfile === profile.id ? 'Geselecteerd' : 'Selecteren'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Opnieuw Beginnen
            </Button>
            {selectedProfile && (
              <Button
                onClick={handleUseProfile}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Profiel Gebruiken
              </Button>
            )}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Kopieer je favoriete profiel naar je dating apps voor optimale resultaten.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}