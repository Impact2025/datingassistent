"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
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
  Globe,
  Crown
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
}

export default function MeerPage() {
  const router = useRouter();
  const { user, logout } = useUser();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const menuItems: MenuItem[] = [
    // Profile Section
    {
      id: 'profile',
      icon: <User className="w-5 h-5" />,
      title: 'Profiel',
      subtitle: 'Foto, bio en persoonlijke info',
      route: '/profile',
      type: 'navigation',
    },
    {
      id: 'subscription',
      icon: <Crown className="w-5 h-5" />,
      title: 'Abonnement',
      subtitle: 'Pro features en upgrades',
      route: '/subscription',
      badge: 'Pro',
      type: 'navigation',
    },

    // Communication Section
    {
      id: 'community',
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'Community',
      subtitle: 'Forum en peer support',
      route: '/community',
      type: 'navigation',
    },

    // Settings Section
    {
      id: 'notifications',
      icon: <Bell className="w-5 h-5" />,
      title: 'Notificaties',
      subtitle: 'Push berichten en alerts',
      type: 'toggle',
    },
    {
      id: 'dark-mode',
      icon: <Moon className="w-5 h-5" />,
      title: 'Donkere modus',
      subtitle: 'Makkelijker voor de ogen',
      type: 'toggle',
    },
    {
      id: 'language',
      icon: <Globe className="w-5 h-5" />,
      title: 'Taal',
      subtitle: 'Nederlands',
      route: '/settings/language',
      type: 'navigation',
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
      title: 'Privacy & Veiligheid',
      subtitle: 'Gegevens en account beveiliging',
      route: '/privacy',
      type: 'navigation',
    },

    // Account Actions
    {
      id: 'logout',
      icon: <LogOut className="w-5 h-5" />,
      title: 'Uitloggen',
      subtitle: 'Veilig afmelden',
      action: () => {
        logout();
        router.push('/login');
      },
      type: 'action',
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route);
    } else if (item.action) {
      item.action();
    }
  };

  const groupedItems = {
    profile: menuItems.filter(item => ['profile', 'subscription'].includes(item.id)),
    communication: menuItems.filter(item => item.id === 'community'),
    settings: menuItems.filter(item => ['notifications', 'dark-mode', 'language'].includes(item.id)),
    support: menuItems.filter(item => ['help', 'privacy'].includes(item.id)),
    account: menuItems.filter(item => item.id === 'logout'),
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
        <Card className="border-0 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">
                  {user?.name || 'Dating Expert'}
                </h2>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-pink-100 text-pink-700 text-xs">
                    Pro Member
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Level 12
                  </Badge>
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
                {section === 'communication' && 'Communicatie'}
                {section === 'settings' && 'Instellingen'}
                {section === 'support' && 'Support'}
                {section === 'account' && 'Account'}
              </h3>

              <div className="space-y-1">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="border-0 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
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
                              <h4 className="font-medium text-gray-900">
                                {item.title}
                              </h4>
                              {item.badge && (
                                <Badge className="bg-pink-100 text-pink-700 text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-sm text-gray-600">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right side content */}
                        <div className="flex items-center">
                          {item.type === 'toggle' && item.id === 'notifications' && (
                            <Switch
                              checked={notifications}
                              onCheckedChange={setNotifications}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          {item.type === 'toggle' && item.id === 'dark-mode' && (
                            <Switch
                              checked={darkMode}
                              onCheckedChange={setDarkMode}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          {(item.type === 'navigation' || item.type === 'action') && (
                            <div className="w-5 h-5 text-gray-400">
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
        <Card className="border-0 bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-gray-500 space-y-1">
              <div>DatingAssistent v2.1.0</div>
              <div>© 2025 Impact Media Group</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}