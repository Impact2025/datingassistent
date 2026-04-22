"use client";

import { useState, Suspense, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserCircle2, Sparkles, Camera, Users, Award, CheckCircle2, FileText, Target, Heart, User,
  MessageCircle, Zap, Shield, Calendar, CalendarHeart, HelpCircle, Search, Lock, Play
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import existing profile components
import { InteractiveProfileCoach } from "./interactive-profile-coach";
import { PhotoAnalysisTab } from "./photo-analysis-tab";
import { PlatformMatchTool } from "./platform-match-tool";
import { SkillsAssessmentTab } from "./skills-assessment-tab";
import { StatsTab } from "./stats-tab";
import { ContextualHelpButton } from "@/components/onboarding/contextual-help-button";
import { AttachmentAssessmentFlow } from "@/components/attachment-assessment/attachment-assessment-flow";
import { EmotioneleReadinessFlow } from "@/components/emotional-readiness/emotionele-readiness-flow";
import { DatingStyleFlow } from "@/components/dating-style/dating-style-flow";
import { ZelfbeeldFlow } from "@/components/zelfbeeld/zelfbeeld-flow";
import { ToolModal, ToolModalHeader } from "@/components/tools";

// Import communication components
import { ChatCoachTab } from "./chat-coach-tab";
import { OpeningszinnenTool } from "./openingszinnen-tool";
import { IJsbrekerGeneratorTool } from "./ijsbreker-generator-tool";
import { VeiligheidscheckTool } from "./veiligheidscheck-tool";
import { GespreksAssistent } from "./gespreks-assistent";

// Import dating & relations components
import { DatePlannerTab } from "./date-planner-tab";
import { DateIdeasProForm } from "./date-ideas-pro-form";

// Import access control
import { useAccessControl } from "@/hooks/use-access-control";
import { checkProfileSuiteToolAccess, getLockedToolsForTier } from "@/lib/access-control";
import { LockedToolCard, UpgradeBanner } from "@/components/ui/locked-tool-card";
import { ToolsGuidedTour } from "@/components/onboarding/tools-guided-tour";

interface ProfileSuiteProps {
  onTabChange?: (tab: string) => void;
}

export function ProfileSuite({ onTabChange }: ProfileSuiteProps) {
  // Access control
  const { userTier, isLoading: accessLoading } = useAccessControl();
  const [showTour, setShowTour] = useState(false);

  // Modal state for tools
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    toolId: string | null;
    title: string;
    subtitle: string;
    component: React.ReactNode | null;
    category: string;
  }>({
    isOpen: false,
    toolId: null,
    title: '',
    subtitle: '',
    component: null,
    category: ''
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoOpenTool, setAutoOpenTool] = useState<string | null>(null);

  // Check URL for tool parameter to auto-open
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const toolParam = urlParams.get('tool');

    if (toolParam) {
      setAutoOpenTool(toolParam);

      // Clean up URL
      const newUrl = window.location.pathname + window.location.search.replace(/[?&]tool=[^&]+/, '').replace(/^&/, '?');
      window.history.replaceState({}, '', newUrl || window.location.pathname);
    }
  }, []);

  // Check if user should see tour (new Kickstart user)
  useEffect(() => {
    if (accessLoading) return;

    const hasSeenTour = localStorage.getItem('tools-hub-tour-seen');
    const isKickstartUser = userTier === 'kickstart';

    // Show tour for new Kickstart users who haven't seen it
    if (isKickstartUser && !hasSeenTour) {
      // Delay to let the page render first
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [userTier, accessLoading]);

  // Get locked tools count for upgrade banner
  const lockedTools = useMemo(() => {
    return getLockedToolsForTier(userTier);
  }, [userTier]);

  // 🎯 ALLE TOOLS GEORGANISEERD IN CATEGORIEËN
  // Kleuren zijn systematisch per categorie:
  //   profiel → coral/purple palette
  //   communicatie → blue/indigo palette
  //   dating → rose/orange palette
  const allTools = [
    // PROFIEL & PERSOONLIJKHEID
    {
      id: "hechtingsstijl",
      category: "profile",
      label: "Hechtingsstijl QuickScan",
      icon: Heart,
      description: "Ontdek je hechtingsdynamiek - de basis van hoe je liefhebt en verbindt",
      component: <AttachmentAssessmentFlow />,
      badge: undefined,
      color: "from-purple-500 to-coral-500",
      featured: true
    },
    {
      id: "emotionele-ready",
      category: "profile",
      label: "Emotionele Ready Scan",
      icon: Sparkles,
      description: "Ben je klaar voor dating? Ontdek je emotionele beschikbaarheid",
      component: <EmotioneleReadinessFlow />,
      badge: undefined,
      color: "from-coral-500 to-rose-500"
    },
    {
      id: "zelfbeeld",
      category: "profile",
      label: "Zelfbeeld & Eerste Indruk",
      icon: UserCircle2,
      description: "AI-gedreven profiel analyse voor optimale eerste indruk",
      component: <ZelfbeeldFlow />,
      badge: undefined,
      color: "from-purple-500 to-violet-600"
    },
    {
      id: "dating-stijl",
      category: "profile",
      label: "Dating Stijl Scan",
      icon: Users,
      description: "Ontdek je dating stijl en blinde vlekken",
      component: <DatingStyleFlow />,
      badge: undefined,
      color: "from-rose-500 to-coral-400"
    },
    {
      id: "profile-builder",
      category: "profile",
      label: "Profiel Bouwer",
      icon: FileText,
      description: "Maak je ideale profieltekst met AI hulp",
      component: <InteractiveProfileCoach />,
      badge: "Aanbevolen",
      color: "from-coral-500 to-purple-500"
    },
    {
      id: "photo-analysis",
      category: "profile",
      label: "Foto Analyse",
      icon: Camera,
      description: "AI feedback op je profielfoto's",
      component: <PhotoAnalysisTab />,
      badge: undefined,
      color: "from-violet-500 to-purple-600"
    },
    {
      id: "platform-match",
      category: "profile",
      label: "Platform Match",
      icon: Target,
      description: "Welke dating app past bij jou?",
      component: <PlatformMatchTool />,
      badge: undefined,
      color: "from-coral-400 to-rose-500"
    },
    {
      id: "skills-scan",
      category: "profile",
      label: "Vaardigheden Scan",
      icon: Award,
      description: "Ontdek je sterke punten",
      component: <SkillsAssessmentTab />,
      badge: "Nieuw",
      color: "from-purple-400 to-coral-500"
    },
    {
      id: "stats",
      category: "profile",
      label: "Stats",
      icon: CheckCircle2,
      description: "Overzicht van je voortgang",
      component: <StatsTab />,
      badge: undefined,
      color: "from-gray-400 to-slate-500"
    },

    // COMMUNICATIE
    {
      id: "chat-coach",
      category: "communication",
      label: "Chat Coach",
      icon: MessageCircle,
      description: "Stel vragen aan je AI dating coach",
      component: <ChatCoachTab />,
      badge: undefined,
      color: "from-blue-500 to-indigo-600",
      featured: true
    },
    {
      id: "gespreks-assistent",
      category: "communication",
      label: "GespreksAssistent",
      icon: MessageCircle,
      description: "AI analyse van je dating gesprekken",
      component: <GespreksAssistent onTabChange={onTabChange} />,
      badge: undefined,
      color: "from-indigo-500 to-blue-600"
    },
    {
      id: "openers",
      category: "communication",
      label: "Openingszinnen",
      icon: Sparkles,
      description: "Genereer effectieve openingsberichten",
      component: <OpeningszinnenTool />,
      badge: undefined,
      color: "from-blue-400 to-cyan-500"
    },
    {
      id: "icebreakers",
      category: "communication",
      label: "IJsbrekers",
      icon: Zap,
      description: "Perfecte gesprekstarters voor elke situatie",
      component: <IJsbrekerGeneratorTool />,
      badge: undefined,
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: "safety",
      category: "communication",
      label: "Veiligheidscheck",
      icon: Shield,
      description: "Analyseer gesprekken op veiligheid en rode vlaggen",
      component: <VeiligheidscheckTool />,
      badge: undefined,
      color: "from-indigo-500 to-blue-700"
    },

    // DATING & RELATIES
    {
      id: "date-planner",
      category: "dating",
      label: "Date Planner",
      icon: Calendar,
      description: "Plan geslaagde dates met checklists en ideeën",
      component: <DatePlannerTab />,
      badge: "Populair",
      color: "from-rose-500 to-orange-500",
      featured: true
    },
    {
      id: "date-ideeen",
      category: "dating",
      label: "Date Ideeën",
      icon: CalendarHeart,
      description: "Krijg inspiratie voor unieke en leuke dates",
      component: <DateIdeasProForm />,
      badge: undefined,
      color: "from-orange-500 to-rose-500"
    }
  ];

  // Filter tools based on category and search
  const filteredTools = useMemo(() => {
    let filtered = allTools;

    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(tool => tool.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.label.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, searchQuery, allTools]);

  // Category counts
  const categoryCounts = {
    all: allTools.length,
    profile: allTools.filter(t => t.category === "profile").length,
    communication: allTools.filter(t => t.category === "communication").length,
    dating: allTools.filter(t => t.category === "dating").length
  };

  const openToolModal = (toolId: string) => {
    // Special handling for chat-coach - navigate to coach tab instead of opening modal
    if (toolId === 'chat-coach') {
      onTabChange?.('coach');
      return;
    }

    const tool = allTools.find(t => t.id === toolId);
    if (tool) {
      setActiveModal({
        isOpen: true,
        toolId: tool.id,
        title: tool.label,
        subtitle: tool.description,
        component: tool.component,
        category: tool.category
      });
    }
  };

  const closeModal = () => {
    setActiveModal({
      isOpen: false,
      toolId: null,
      title: '',
      subtitle: '',
      component: null,
      category: ''
    });
  };

  // Auto-open tool when autoOpenTool is set
  useEffect(() => {
    if (autoOpenTool) {
      setTimeout(() => {
        openToolModal(autoOpenTool);
        setAutoOpenTool(null);
      }, 300);
    }
  }, [autoOpenTool]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header met zoekfunctie */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-coral-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-coral-500" />
                Jouw Tools
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredTools.length} tools beschikbaar • Alles wat je nodig hebt voor dating succes
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Tour button */}
              {userTier !== 'free' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTour(true)}
                  className="h-8 text-xs gap-1.5 border-coral-200 text-coral-600 hover:bg-coral-50"
                >
                  <Play className="w-3 h-3" />
                  Rondleiding
                </Button>
              )}
              <ContextualHelpButton
                tutorialId="tools-hub-basics"
                helpTitle="Tools Hub Hulp"
                helpText="Alle tools op één plek. Van profiel optimalisatie tot date planning."
                variant="icon"
                size="sm"
                quickTips={[
                  {
                    icon: <Heart className="w-4 h-4 text-purple-600" />,
                    title: "Begin met jezelf kennen",
                    description: "Hechtingsstijl en Dating Stijl scans"
                  },
                  {
                    icon: <MessageCircle className="w-4 h-4 text-blue-600" />,
                    title: "Chat Coach",
                    description: "24/7 AI begeleiding voor al je vragen"
                  },
                  {
                    icon: <Calendar className="w-4 h-4 text-rose-600" />,
                    title: "Date Planner",
                    description: "Plan perfecte dates met checklists"
                  }
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Zoekbalk */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Zoek een tool... (bijv. 'chat', 'foto', 'date')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tools Tiers Banner - 3-Tier System */}
      {!searchQuery && activeCategory === "all" && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="cursor-pointer border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all"
            onClick={() => window.location.href = '/essentials'}
          >
            <CardContent className="p-4">
              <Badge className="bg-green-500 text-white border-0 text-xs mb-2">🆓 GRATIS</Badge>
              <h3 className="font-bold text-gray-900 mb-1">Essentials</h3>
              <p className="text-sm text-gray-600">Badges, Activity Logger & meer</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-all"
            onClick={() => window.location.href = '/kickstart-toolkit'}
          >
            <CardContent className="p-4">
              <Badge className="bg-blue-500 text-white border-0 text-xs mb-2">💎 KICKSTART</Badge>
              <h3 className="font-bold text-gray-900 mb-1">Kickstart Toolkit</h3>
              <p className="text-sm text-gray-600">AI Tools voor gesprekken & profielen</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-coral-50 hover:shadow-lg transition-all"
            onClick={() => window.location.href = '/pro-arsenal'}
          >
            <CardContent className="p-4">
              <Badge className="bg-purple-500 text-white border-0 text-xs mb-2">⭐ PREMIUM</Badge>
              <h3 className="font-bold text-gray-900 mb-1">Pro Arsenal</h3>
              <p className="text-sm text-gray-600">Skills, Date Planner & Unlimited</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categorieën Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Alle ({categoryCounts.all})
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            Profiel ({categoryCounts.profile})
          </TabsTrigger>
          <TabsTrigger value="communication" className="text-xs sm:text-sm">
            Chat ({categoryCounts.communication})
          </TabsTrigger>
          <TabsTrigger value="dating" className="text-xs sm:text-sm">
            Dating ({categoryCounts.dating})
          </TabsTrigger>
        </TabsList>

        {/* Tools Grid */}
        <TabsContent value={activeCategory} className="mt-0">
          {filteredTools.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Geen tools gevonden voor "{searchQuery}"
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-4"
                >
                  Reset zoekopdracht
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredTools.map((tool) => {
                // Check tool access
                const accessInfo = checkProfileSuiteToolAccess(tool.id, userTier, 0);

                return (
                  <LockedToolCard
                    key={tool.id}
                    tool={{
                      id: tool.id,
                      label: tool.label,
                      icon: tool.icon,
                      description: tool.description,
                      badge: tool.badge,
                      color: tool.color
                    }}
                    accessLevel={accessInfo.accessLevel}
                    remaining={accessInfo.remaining}
                    limit={accessInfo.limit}
                    lockedMessage={accessInfo.lockedMessage}
                    upgradeMessage={accessInfo.upgradeMessage}
                    upgradeTier={accessInfo.upgradeTier}
                    onUnlockedClick={() => openToolModal(tool.id)}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Upgrade Banner for users with locked tools */}
      {lockedTools.length > 0 && userTier !== 'vip' && (
        <UpgradeBanner
          lockedCount={lockedTools.length}
          upgradeTier={userTier === 'kickstart' ? 'transformatie' : 'transformatie'}
          className="mt-6"
        />
      )}

      {/* Tool Modal */}
      <ToolModal isOpen={activeModal.isOpen} onClose={closeModal}>
        <ToolModalHeader
          title={activeModal.title}
          subtitle={activeModal.subtitle}
          onBack={closeModal}
          onClose={closeModal}
        />

        {/* Tool Content with Suspense for lazy loading */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeModal.component && (
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-3 border-gray-300 border-t-coral-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-600">Tool laden...</p>
                  </div>
                </div>
              }
            >
              {activeModal.component}
            </Suspense>
          )}
        </div>
      </ToolModal>

      {/* Guided Tour for Kickstart users */}
      <ToolsGuidedTour
        isOpen={showTour}
        onClose={() => {
          setShowTour(false);
          localStorage.setItem('tools-hub-tour-seen', 'true');
        }}
        onComplete={() => {
          setShowTour(false);
          localStorage.setItem('tools-hub-tour-seen', 'true');
        }}
        userTier={userTier}
      />
    </div>
  );
}
