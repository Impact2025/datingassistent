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

  // Get locked tools count for upgrade banner
  const lockedTools = useMemo(() => {
    return getLockedToolsForTier(userTier);
  }, [userTier]);

  // 🎯 ALLE TOOLS GEORGANISEERD IN CATEGORIEËN
  const allTools = [
    // 🎯 PROFIEL & PERSOONLIJKHEID
    {
      id: "hechtingsstijl",
      category: "profile",
      label: "🏆 Hechtingsstijl QuickScan",
      icon: Heart,
      description: "Ontdek je hechtingsdynamiek - de basis van hoe je liefhebt en verbindt",
      component: <AttachmentAssessmentFlow />,
      badge: "AI-PRO",
      color: "from-purple-500 to-pink-500",
      featured: true
    },
    {
      id: "emotionele-ready",
      category: "profile",
      label: "💙 Emotionele Ready Scan",
      icon: Sparkles,
      description: "Ben je klaar voor dating? Ontdek je emotionele beschikbaarheid",
      component: <EmotioneleReadinessFlow />,
      badge: "AI",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "zelfbeeld",
      category: "profile",
      label: "🪩 Zelfbeeld & Eerste Indruk",
      icon: UserCircle2,
      description: "AI-gedreven profiel analyse voor optimale eerste indruk",
      component: <ZelfbeeldFlow />,
      badge: "AI-PRO",
      color: "from-purple-500 to-indigo-500"
    },
    {
      id: "dating-stijl",
      category: "profile",
      label: "🎭 Dating Stijl Scan",
      icon: Users,
      description: "Ontdek je dating stijl en blinde vlekken",
      component: <DatingStyleFlow />,
      badge: "AI",
      color: "from-orange-500 to-red-500"
    },
    {
      id: "profile-builder",
      category: "profile",
      label: "📝 Profiel Bouwer",
      icon: FileText,
      description: "Maak je ideale profieltekst met AI hulp",
      component: <InteractiveProfileCoach />,
      badge: "Aanbevolen",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "photo-analysis",
      category: "profile",
      label: "📷 Foto Analyse",
      icon: Camera,
      description: "AI feedback op je profielfoto's",
      component: <PhotoAnalysisTab />,
      badge: "AI",
      color: "from-indigo-500 to-pink-500"
    },
    {
      id: "platform-match",
      category: "profile",
      label: "🎯 Platform Match",
      icon: Target,
      description: "Welke dating app past bij jou?",
      component: <PlatformMatchTool />,
      badge: "AI",
      color: "from-teal-500 to-cyan-500"
    },
    {
      id: "skills-scan",
      category: "profile",
      label: "🏅 Vaardigheden Scan",
      icon: Award,
      description: "Ontdek je sterke punten",
      component: <SkillsAssessmentTab />,
      badge: "Nieuw",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "stats",
      category: "profile",
      label: "📊 Stats",
      icon: CheckCircle2,
      description: "Overzicht van je voortgang",
      component: <StatsTab />,
      badge: "Overzicht",
      color: "from-gray-500 to-slate-500"
    },

    // 💬 COMMUNICATIE
    {
      id: "chat-coach",
      category: "communication",
      label: "💬 Chat Coach",
      icon: MessageCircle,
      description: "Stel vragen aan je AI dating coach",
      component: <ChatCoachTab />,
      badge: "24/7",
      color: "from-blue-500 to-indigo-600",
      featured: true
    },
    {
      id: "gespreks-assistent",
      category: "communication",
      label: "💭 GespreksAssistent",
      icon: MessageCircle,
      description: "AI analyse van je dating gesprekken",
      component: <GespreksAssistent onTabChange={onTabChange} />,
      badge: "AI",
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: "openers",
      category: "communication",
      label: "✨ Openingszinnen",
      icon: Sparkles,
      description: "Genereer effectieve openingsberichten",
      component: <OpeningszinnenTool />,
      badge: "Persoonlijk",
      color: "from-pink-500 to-rose-600"
    },
    {
      id: "icebreakers",
      category: "communication",
      label: "⚡ IJsbrekers",
      icon: Zap,
      description: "Perfecte gesprekstarters voor elke situatie",
      component: <IJsbrekerGeneratorTool />,
      badge: "Context",
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "safety",
      category: "communication",
      label: "🛡️ Veiligheidscheck",
      icon: Shield,
      description: "Analyseer gesprekken op veiligheid en rode vlaggen",
      component: <VeiligheidscheckTool />,
      badge: "Essentieel",
      color: "from-emerald-500 to-teal-600"
    },

    // 📅 DATING & RELATIES
    {
      id: "date-planner",
      category: "dating",
      label: "📅 Date Planner",
      icon: Calendar,
      description: "Plan geslaagde dates met checklists en ideeën",
      component: <DatePlannerTab />,
      badge: "Populair",
      color: "from-rose-500 to-pink-600",
      featured: true
    },
    {
      id: "date-ideeen",
      category: "dating",
      label: "💡 Date Ideeën",
      icon: CalendarHeart,
      description: "Krijg inspiratie voor unieke en leuke dates",
      component: <DateIdeasProForm />,
      badge: "AI",
      color: "from-orange-500 to-rose-600"
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

  // Featured tools (shown prominently)
  const featuredTools = allTools.filter(tool => tool.featured);

  // Category counts
  const categoryCounts = {
    all: allTools.length,
    profile: allTools.filter(t => t.category === "profile").length,
    communication: allTools.filter(t => t.category === "communication").length,
    dating: allTools.filter(t => t.category === "dating").length
  };

  const openToolModal = (toolId: string) => {
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

  return (
    <div className="space-y-6 pb-8">
      {/* Header met zoekfunctie */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pink-500" />
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
                  className="h-8 text-xs gap-1.5 border-pink-200 text-pink-600 hover:bg-pink-50"
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

      {/* Featured Tools - Uitgelicht */}
      {!searchQuery && activeCategory === "all" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Uitgelichte Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card
                    key={tool.id}
                    className="cursor-pointer transition-all duration-200 border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg bg-gradient-to-br from-white to-pink-50 dark:from-gray-800 dark:to-pink-900/10"
                    onClick={() => openToolModal(tool.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-50 mb-1">
                            {tool.label}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {tool.description}
                          </p>
                          {tool.badge && (
                            <Badge variant="secondary" className="mt-2 text-[10px]">
                              {tool.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorieën Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Alle ({categoryCounts.all})
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs sm:text-sm">
            🎯 Profiel ({categoryCounts.profile})
          </TabsTrigger>
          <TabsTrigger value="communication" className="text-xs sm:text-sm">
            💬 Chat ({categoryCounts.communication})
          </TabsTrigger>
          <TabsTrigger value="dating" className="text-xs sm:text-sm">
            📅 Dating ({categoryCounts.dating})
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
                    <div className="w-12 h-12 border-3 border-gray-300 border-t-pink-500 rounded-full animate-spin mx-auto" />
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
