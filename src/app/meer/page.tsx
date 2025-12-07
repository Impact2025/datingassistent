"use client";

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

export default function MeerPage() {
  const router = useRouter();
  const { user, logout, userProfile } = useUser();
  const { theme, setTheme, actualTheme, mounted } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  // Calculate user level/progress (mock data for now)
  const getUserLevel = () => {
    // This could be calculated based on user activity, tools used, etc.
    return 12; // Mock level
  };

  const getUserProgress = () => {
    // This could be calculated based on completed actions
    return 75; // Mock progress percentage
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
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
            <h1 className="text-xl font-bold text-gray-900">Meer</h1>
            <p className="text-sm text-gray-600">Instellingen en account</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Profile Card */}
        <Card className="border-0 bg-gradient-to-r from-pink-50 to-pink-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg">
                <Image
                  src="/images/LogoDatingAssistent.png"
                  alt="DatingAssistent Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 text-lg">
                  {user?.name || 'Dating Expert'}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs px-2 py-1 ${
                    user?.subscriptionType === 'premium'
                      ? 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 border-pink-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {user?.subscriptionType === 'premium' ? 'Pro Member' : 'Free Account'}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2 py-1 border-gray-300">
                    Level {getUserLevel()}
                  </Badge>
                </div>
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Voortgang</span>
                    <span>{getUserProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-400 to-pink-500 h-2 rounded-full transition-all duration-300"
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
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
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
                        ? 'bg-gray-50 cursor-not-allowed opacity-60'
                        : 'bg-white cursor-pointer hover:bg-gray-50'
                    }`}
                    onClick={() => handleMenuClick(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-gray-600">
                              {item.icon}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${item.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                                {item.title}
                              </h4>
                              {item.badge && (
                                <Badge className="bg-pink-100 text-pink-700 text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className={`text-sm ${item.disabled ? 'text-gray-400' : 'text-gray-600'}`}>
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
                            <div className={`w-5 h-5 ${item.disabled ? 'text-gray-300' : 'text-gray-400'}`}>
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
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-gray-500 space-y-1">
              <div>DatingAssistent v2.1.0</div>
              <div>© 2025 Impact Media Group</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-red-500" />
                Uitloggen bevestigen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
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