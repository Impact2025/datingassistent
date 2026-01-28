"use client";

import { Suspense } from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/providers/user-provider';
import { useTheme } from '@/providers/theme-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Settings,
  CreditCard,
  MessageCircle,
  Shield,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Globe,
  Crown,
  Star,
  TrendingUp,
  CheckCircle,
  X,
  GraduationCap,
  Wrench
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  route?: string;
  action?: () => void;
  badge?: string;
  type: 'navigation' | 'toggle' | 'action';
  disabled?: boolean;
}

function MeerPageContent() {
  const router = useRouter();
  const { user, logout, userProfile } = useUser();
  const { theme, setTheme, actualTheme, mounted } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userTier, setUserTier] = useState<string>('free');
  const [gamificationStats, setGamificationStats] = useState<{
    totalPoints: number;
    currentLevel: number;
    levelProgress: number;
    levelTitle: string;
    pointsToNextLevel: number;
    nextLevelPoints: number;
  } | null>(null);

  // Check user's program enrollment to determine tier
  useEffect(() => {
    const checkUserTier = async () => {
      if (!user?.id) return;

      try {
        // Check enrolled programs
        const response = await fetch(`/api/user/enrolled-programs?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();

          // Determine highest tier based on enrollments
          if (data.programs?.some((p: any) => p.program_slug === 'vip')) {
            setUserTier('vip');
          } else if (data.programs?.some((p: any) => p.program_slug === 'transformatie')) {
            setUserTier('transformatie');
          } else if (data.programs?.some((p: any) => p.program_slug === 'kickstart')) {
            setUserTier('kickstart');
          } else {
            setUserTier('free');
          }
        }
      } catch (error) {
        console.error('Failed to check user tier:', error);
      }
    };

    checkUserTier();
  }, [user?.id]);

  // Fetch real gamification stats
  useEffect(() => {
    const fetchGamificationStats = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/gamification/stats?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setGamificationStats({
            totalPoints: data.totalPoints || 0,
            currentLevel: data.currentLevel || 1,
            levelProgress: data.levelProgress || 0,
            levelTitle: data.levelTitle || 'Nieuweling',
            pointsToNextLevel: data.pointsToNextLevel || 100,
            nextLevelPoints: data.nextLevelPoints || 100,
          });
        }
      } catch (error) {
        console.error('Failed to fetch gamification stats:', error);
        // Fallback to default values if API fails
        setGamificationStats({
          totalPoints: 0,
          currentLevel: 1,
          levelProgress: 0,
          levelTitle: 'Nieuweling',
          pointsToNextLevel: 100,
          nextLevelPoints: 100,
        });
      }
    };

    fetchGamificationStats();
  }, [user?.id]);

  // Load user preferences on mount
  useEffect(() => {
    if (mounted) {
      // Load notification preferences
      const savedNotifications = localStorage.getItem('notifications_enabled');
      if (savedNotifications !== null) {
        setNotificationsEnabled(JSON.parse(savedNotifications));
      }
    }
  }, [mounted]);

  // Save notification preferences
  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notifications_enabled', JSON.stringify(enabled));

    // Here you could also send to backend API
    console.log('Notifications', enabled ? 'enabled' : 'disabled');
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If system, switch to opposite of current actual theme
      setTheme(actualTheme === 'dark' ? 'light' : 'dark');
    }
  };

  const menuItems: MenuItem[] = [
    // Profile Section
    {
      id: 'profile',
      icon: <User className="w-5 h-5" />,
      title: 'Profiel',
      subtitle: 'Foto, bio en persoonlijke info',
      route: '/profiel',
      type: 'navigation',
    },
    {
      id: 'subscription',
      icon: <Crown className="w-5 h-5" />,
      title: 'Abonnement',
      subtitle: user?.subscriptionType === 'premium' ? 'Je huidige abonnement beheren' : 'Programma\'s en upgrades',
      route: '/dashboard?tab=subscription',
      badge: user?.subscriptionType === 'premium' ? 'Pro' : undefined,
      type: 'navigation',
    },

    // Communication Section
    {
      id: 'chat',
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Chat Coach',
      subtitle: 'AI hulp bij gesprekken',
      route: '/chat',
      type: 'navigation',
    },
    {
      id: 'cursussen',
      icon: <GraduationCap className="w-5 h-5" />,
      title: 'Cursussen',
      subtitle: 'Leer dating vaardigheden',
      route: '/cursussen',
      type: 'navigation',
    },
    {
      id: 'tools',
      icon: <Wrench className="w-5 h-5" />,
      title: 'Dating Tools',
      subtitle: 'Profiel, foto\'s, openers en meer',
      route: '/tools',
      type: 'navigation',
    },
    {
      id: 'community',
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Community',
      subtitle: 'Forum en peer support',
      route: '/community',
      disabled: true,
      type: 'navigation',
    },

    // Settings Section
    {
      id: 'notifications',
      icon: <Bell className="w-5 h-5" />,
      title: 'Notificaties',
      subtitle: notificationsEnabled ? 'Aan - Je ontvangt herinneringen' : 'Uit - Geen notificaties',
      type: 'toggle',
    },
    {
      id: 'theme',
      icon: actualTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />,
      title: actualTheme === 'dark' ? 'Lichte modus' : 'Donkere modus',
      subtitle: actualTheme === 'dark' ? 'Aan - Donker thema actief' : 'Uit - Licht thema actief',
      type: 'toggle',
    },

    // Support Section
    {
      id: 'help',
      icon: <HelpCircle className="w-5 h-5" />,
      title: 'Help & Support',
      subtitle: 'FAQ, tutorials en contact',
      route: '/help',
      type: 'navigation',
    },
    {
      id: 'privacy',
      icon: <Shield className="w-5 h-5" />,
      title: 'Data & Privacy Beheer',
      subtitle: 'Gegevens beheren en privacy instellingen',
      route: '/mobile-data-management',
      type: 'navigation',
    },

    // Account Actions
    {
      id: 'logout',
      icon: <LogOut className="w-5 h-5" />,
      title: 'Uitloggen',
      subtitle: 'Veilig afmelden',
      action: () => setShowLogoutConfirm(true),
      type: 'action',
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.disabled) return;

    if (item.route) {
      router.push(item.route);
    } else if (item.action) {
      item.action();
    }
  };

  const groupedItems = {
    profile: menuItems.filter(item => ['profile', 'subscription'].includes(item.id)),
    features: menuItems.filter(item => ['chat', 'cursussen', 'tools', 'community'].includes(item.id)),
    settings: menuItems.filter(item => ['notifications', 'theme'].includes(item.id)),
    support: menuItems.filter(item => ['help', 'privacy'].includes(item.id)),
    account: menuItems.filter(item => item.id === 'logout'),
  };

  // Get user level from real gamification stats
  const getUserLevel = () => {
    return gamificationStats?.currentLevel || 1;
  };

  // Calculate progress to next level as percentage
  const getUserProgress = () => {
    if (!gamificationStats) return 0;

    const { pointsToNextLevel, nextLevelPoints } = gamificationStats;

    // Calculate progress based on points earned towards next level
    if (nextLevelPoints > 0) {
      // pointsToNextLevel = remaining points needed
      // nextLevelPoints = total points required for next level
      // So earned points = nextLevelPoints - pointsToNextLevel
      const earnedPoints = nextLevelPoints - pointsToNextLevel;
      const progressPercentage = Math.floor((earnedPoints / nextLevelPoints) * 100);
      return Math.min(100, Math.max(0, progressPercentage));
    }

    // Fallback if no next level exists (max level reached)
    return 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Meer</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Instellingen en account</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Profile Card */}
        <Card className="border-0 bg-gradient-to-r from-coral-50 to-coral-100 dark:from-coral-950/30 dark:to-coral-900/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg">
                <Image
                  src="/images/LogoDatingAssistent.png"
                  alt="DatingAssistent Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {user?.name || 'Dating Expert'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs px-2 py-1 ${
                    userTier === 'vip'
                      ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-200'
                      : userTier === 'transformatie'
                      ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 border-indigo-200'
                      : userTier === 'kickstart'
                      ? 'bg-gradient-to-r from-coral-100 to-coral-200 text-coral-700 border-coral-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {userTier === 'vip' ? 'VIP'
                      : userTier === 'transformatie' ? 'Transformatie'
                      : userTier === 'kickstart' ? 'Kickstart'
                      : 'Free Account'}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1 border-gray-300">
                    Level {getUserLevel()}
                  </Badge>
                </div>
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Voortgang</span>
                    <span>{getUserProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-coral-400 to-coral-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getUserProgress()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Sections */}
        {Object.entries(groupedItems).map(([section, items]) => (
          items.length > 0 && (
            <div key={section}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-1">
                {section === 'profile' && 'Profiel'}
                {section === 'features' && 'Features'}
                {section === 'settings' && 'Instellingen'}
                {section === 'support' && 'Support'}
                {section === 'account' && 'Account'}
              </h3>

              <div className="space-y-1">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className={`border-0 transition-colors ${
                      item.disabled
                        ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
                        : 'bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleMenuClick(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <div className="text-gray-600 dark:text-gray-300">
                              {item.icon}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${item.disabled ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {item.title}
                              </h4>
                              {item.badge && (
                                <Badge className="bg-coral-100 text-coral-700 text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className={`text-sm ${item.disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right side content */}
                        <div className="flex items-center">
                          {item.type === 'toggle' && item.id === 'notifications' && (
                            <Switch
                              checked={notificationsEnabled}
                              onCheckedChange={handleNotificationToggle}
                              onClick={(e) => e.stopPropagation()}
                              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                            />
                          )}
                          {item.type === 'toggle' && item.id === 'theme' && mounted && (
                            <Switch
                              checked={actualTheme === 'dark'}
                              onCheckedChange={handleThemeToggle}
                              onClick={(e) => e.stopPropagation()}
                              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                            />
                          )}
                          {(item.type === 'navigation' || item.type === 'action') && (
                            <div className={`w-5 h-5 ${item.disabled ? 'text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                              →
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ))}

        {/* App Info */}
        <Card className="border-0 bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <div>DatingAssistent v2.1.0</div>
              <div>© 2025 Impact Media Group</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <LogOut className="w-5 h-5 text-red-500" />
                Uitloggen bevestigen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Weet je zeker dat je wilt uitloggen? Je wordt teruggestuurd naar de inlogpagina.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1"
                >
                  Annuleren
                </Button>
                <Button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Uitloggen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
export default function MeerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500" />
      </div>
    }>
      <MeerPageContent />
    </Suspense>
  );
}
