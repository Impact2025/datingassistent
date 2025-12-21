"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, MessageSquare, UserCircle2, Camera, Heart, ArrowRight, X } from 'lucide-react';
import { useAIContext } from '@/hooks/use-ai-context';
import { useUser } from '@/providers/user-provider';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';
import { ToolModal, ToolModalHeader, getToolMetadata, hasModalComponent } from '@/components/tools';

interface PersonalizedRecommendation {
  tool: string;
  title: string;
  description: string;
  reason: string;
  urgency: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  actionLabel: string;
}

interface PersonalizedWelcomeProps {
  onTabChange?: (tab: string) => void;
}

export function PersonalizedWelcome({ onTabChange }: PersonalizedWelcomeProps) {
  const router = useRouter();
  const { user } = useUser();
  const { context, getContextSummary } = useAIContext();
  const [recommendation, setRecommendation] = useState<PersonalizedRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Modal state for tools
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    route: string | null;
    title: string;
    subtitle: string;
    component: React.ComponentType<any> | null;
  }>({
    isOpen: false,
    route: null,
    title: '',
    subtitle: '',
    component: null,
  });

  // Check if user has seen this today
  useEffect(() => {
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem('personalized_welcome_last_seen');
    if (lastSeen === today) {
      setDismissed(true);
    }
  }, []);

  // Generate personalized recommendation
  useEffect(() => {
    if (!user?.id || !context || dismissed) return;

    const generateRecommendation = async () => {
      try {
        setLoading(true);

        // Simple logic-based recommendations first
        let simpleRecommendation: PersonalizedRecommendation | null = null;

        // Check if user has taken attachment assessment
        const assessmentResponse = await fetch(`/api/attachment-assessment?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
          }
        });

        let hasTakenAssessment = false;
        if (assessmentResponse.ok) {
          const assessmentData = await assessmentResponse.json();
          hasTakenAssessment = !!assessmentData.assessment;
        }

        // Priority 1: Attachment style assessment for all users who haven't taken it
        if (!hasTakenAssessment) {
          simpleRecommendation = {
            tool: 'hechtingsstijl',
            title: 'Ontdek je relatiepatronen',
            description: 'Leer hoe je hechtingsstijl je dating gedrag beïnvloedt',
            reason: 'Wetenschappelijk onderbouwde inzichten voor betere relaties',
            urgency: 'high',
            icon: <Heart className="w-5 h-5" />,
            actionLabel: 'Hechtingsstijl Test'
          };
        }
        // New users - recommend profile building
        else if (!context.toolUsage || Object.values(context.toolUsage).reduce((sum, count) => sum + count, 0) < 3) {
          simpleRecommendation = {
            tool: 'profiel-persoonlijkheid',
            title: 'Start met je profiel',
            description: 'Een goed profiel is de basis van succes in dating',
            reason: 'Nieuwe gebruikers zien vaak de beste resultaten met een compleet profiel',
            urgency: 'high',
            icon: <UserCircle2 className="w-5 h-5" />,
            actionLabel: 'Profiel Optimaliseren'
          };
        }
        // Users who haven't used communication tools recently
        else if (!context.toolUsage?.chatCoach || context.toolUsage.chatCoach < 2) {
          simpleRecommendation = {
            tool: 'communicatie-matching',
            title: 'Verbeter je communicatie',
            description: 'Leer effectiever communiceren met matches',
            reason: 'Goede communicatie is cruciaal voor succesvolle dates',
            urgency: 'high',
            icon: <MessageSquare className="w-5 h-5" />,
            actionLabel: 'Communicatie Tools'
          };
        }
        // Users who haven't analyzed photos
        else if (!context.toolUsage?.photoAnalysis || context.toolUsage.photoAnalysis === 0) {
          simpleRecommendation = {
            tool: 'profiel-persoonlijkheid',
            title: 'Check je foto\'s',
            description: 'Laat AI je profielfoto\'s analyseren',
            reason: 'De juiste foto\'s maken een groot verschil',
            urgency: 'medium',
            icon: <Camera className="w-5 h-5" />,
            actionLabel: 'Foto Analyse'
          };
        }

        // If we have a simple recommendation, use it
        if (simpleRecommendation) {
          setRecommendation(simpleRecommendation);
          setLoading(false);
          return;
        }

        // Use AI for more sophisticated recommendations with timeout and caching
        const cacheKey = `ai_recommendation_${user.id}`;
        const cachedData = localStorage.getItem(cacheKey);

        // Check cache (valid for 6 hours)
        if (cachedData) {
          try {
            const { recommendation: cached, timestamp } = JSON.parse(cachedData);
            const sixHours = 6 * 60 * 60 * 1000;
            if (Date.now() - timestamp < sixHours) {
              const toolConfig = getToolConfig();
              const config = toolConfig[cached.tool as keyof typeof toolConfig] || toolConfig['profiel-persoonlijkheid'];
              setRecommendation({
                ...cached,
                icon: config.icon,
                actionLabel: config.actionLabel
              });
              setLoading(false);
              return;
            }
          } catch {
            // Invalid cache, continue to fetch
          }
        }

        // Helper to get tool config
        function getToolConfig() {
          return {
            'profiel-persoonlijkheid': {
              icon: <UserCircle2 className="w-5 h-5" />,
              actionLabel: 'Profiel Tools'
            },
            'communicatie-matching': {
              icon: <MessageSquare className="w-5 h-5" />,
              actionLabel: 'Communicatie Hub'
            },
            'daten-relaties': {
              icon: <Heart className="w-5 h-5" />,
              actionLabel: 'Date Planning'
            },
            'groei-doelen': {
              icon: <Target className="w-5 h-5" />,
              actionLabel: 'Doelen Stelling'
            }
          };
        }

        const contextSummary = getContextSummary();
        const prompt = `Je bent een dating coach expert. Gebaseerd op deze gebruikerscontext, geef één specifieke tool aanbeveling.

Context: ${contextSummary}

Geef een JSON response met:
{
  "tool": "profiel-persoonlijkheid" | "communicatie-matching" | "daten-relaties" | "groei-doelen",
  "title": "Korte titel (max 4 woorden)",
  "description": "Korte beschrijving (max 8 woorden)",
  "reason": "Waarom deze tool nu relevant is (max 12 woorden)",
  "urgency": "high" | "medium" | "low"
}

Kies de tool die NU het meest waardevol is voor deze gebruiker.`;

        // Timeout for AI call
        const timeoutId = setTimeout(() => {}, 5000);

        try {
          const openRouter = getOpenRouterClient();
          const response = await Promise.race([
            openRouter.createChatCompletion(
              OPENROUTER_MODELS.CLAUDE_35_HAIKU,
              [{ role: 'user', content: prompt }],
              { temperature: 0.3, max_tokens: 200 }
            ),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('AI timeout')), 5000)
            )
          ]);

          clearTimeout(timeoutId);

          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const aiRecommendation = JSON.parse(jsonMatch[0]);
            const toolConfig = getToolConfig();
            const config = toolConfig[aiRecommendation.tool as keyof typeof toolConfig] || toolConfig['profiel-persoonlijkheid'];

            const finalRecommendation = {
              ...aiRecommendation,
              icon: config.icon,
              actionLabel: config.actionLabel
            };

            // Cache the result
            localStorage.setItem(cacheKey, JSON.stringify({
              recommendation: aiRecommendation,
              timestamp: Date.now()
            }));

            setRecommendation(finalRecommendation);
            setLoading(false);
            return;
          }
        } catch (aiError) {
          clearTimeout(timeoutId);
          console.log('AI recommendation skipped (timeout or error):', aiError);
        }

        // Fallback if AI fails
        setRecommendation({
          tool: 'communicatie-matching',
          title: 'Probeer onze tools',
          description: 'Ontdek wat DatingAssistent voor je kan doen',
          reason: 'Onze AI tools helpen je succesvoller te daten',
          urgency: 'medium',
          icon: <Sparkles className="w-5 h-5" />,
          actionLabel: 'Tools Verkennen'
        });
        setLoading(false);
      } catch (error) {
        console.error('Error generating recommendation:', error);
        // Fallback recommendation
        setRecommendation({
          tool: 'communicatie-matching',
          title: 'Probeer onze tools',
          description: 'Ontdek wat DatingAssistent voor je kan doen',
          reason: 'Onze AI tools helpen je succesvoller te daten',
          urgency: 'medium',
          icon: <Sparkles className="w-5 h-5" />,
          actionLabel: 'Tools Verkennen'
        });
      } finally {
        setLoading(false);
      }
    };

    generateRecommendation();
  }, [user?.id, context, dismissed]);

  const handleAction = (tool: string) => {
    // Track that user engaged with recommendation
    // This would update the AI context to learn from user behavior

    // Tools that should open in modal
    const modalRoutes: Record<string, string> = {
      'hechtingsstijl': '/hechtingsstijl',
      'datingstijl': '/dating-style',
    };

    // Check if tool has a modal route
    const route = modalRoutes[tool];
    if (route && hasModalComponent(route)) {
      const metadata = getToolMetadata(route);
      if (metadata) {
        setActiveModal({
          isOpen: true,
          route,
          title: metadata.title,
          subtitle: metadata.subtitle,
          component: metadata.component,
        });
        return;
      }
    }

    // Navigate to the recommended tool using the provided callback
    if (onTabChange) {
      onTabChange(tool);
    } else {
      // Fallback to hash navigation if no callback provided
      window.location.hash = tool;
    }
  };

  const closeModal = () => {
    setActiveModal({
      isOpen: false,
      route: null,
      title: '',
      subtitle: '',
      component: null,
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    const today = new Date().toDateString();
    localStorage.setItem('personalized_welcome_last_seen', today);
  };

  if (dismissed || loading || !recommendation) return null;

  const ModalComponent = activeModal.component;

  return (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-4 sm:p-6">
        {/* Mobile: Stack layout, Desktop: Side-by-side */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          {/* Icon - smaller on mobile */}
          <div className="flex-shrink-0 flex items-center gap-3 sm:block">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {recommendation.icon}
            </div>
            {/* Title on same line as icon on mobile */}
            <div className="sm:hidden flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base text-pink-600">{recommendation.title}</h3>
                {recommendation.urgency === 'high' && (
                  <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-xl shadow-lg whitespace-nowrap">
                    Tip
                  </span>
                )}
                {recommendation.urgency === 'medium' && (
                  <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-xl shadow-lg whitespace-nowrap">
                    Aanbevolen
                  </span>
                )}
                {recommendation.urgency === 'low' && (
                  <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-xl shadow-lg whitespace-nowrap">
                    Tip
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title - hidden on mobile (shown above) */}
            <div className="hidden sm:flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-lg text-pink-600">{recommendation.title}</h3>
              {recommendation.urgency === 'high' && (
                <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-xl shadow-lg">
                  Tip
                </span>
              )}
              {recommendation.urgency === 'medium' && (
                <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-xl shadow-lg">
                  Aanbevolen
                </span>
              )}
              {recommendation.urgency === 'low' && (
                <span className="px-2 py-0.5 bg-pink-500 text-white text-xs rounded-xl shadow-lg">
                  Tip
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground mb-2">{recommendation.description}</p>
            <p className="text-xs sm:text-sm text-primary/80 italic">"{recommendation.reason}"</p>

            {/* Buttons - stack on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-4">
              <Button
                onClick={() => handleAction(recommendation.tool)}
                size="sm"
                className="gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto justify-center"
              >
                {recommendation.actionLabel}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground text-xs sm:text-sm"
              >
                <X className="w-4 h-4 mr-1" />
                Vandaag overslaan
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Tool Modal */}
      {ModalComponent && (
        <ToolModal isOpen={activeModal.isOpen} onClose={closeModal}>
          <ToolModalHeader
            title={activeModal.title}
            subtitle={activeModal.subtitle}
            onClose={closeModal}
          />
          <ModalComponent onClose={closeModal} />
        </ToolModal>
      )}
    </>
  );
}