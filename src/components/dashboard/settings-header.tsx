"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, CreditCard, Shield } from 'lucide-react';

interface SettingsHeaderProps {
  activeTab: 'settings' | 'subscription' | 'data-management';
  onTabChange: (tab: string) => void;
}

export function SettingsHeader({ activeTab, onTabChange }: SettingsHeaderProps) {
  const tabInfo = {
    settings: { title: 'Instellingen', icon: Settings, description: 'Beheer je account en voorkeuren' },
    subscription: { title: 'Abonnement', icon: CreditCard, description: 'Bekijk en wijzig je abonnement' },
    'data-management': { title: 'Data & Privacy', icon: Shield, description: 'Beheer je persoonlijke gegevens' }
  };

  const { title, icon: Icon, description } = tabInfo[activeTab];

  return (
    <div className="mb-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange('home')}
        className="mb-4 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Terug naar Dashboard
      </Button>

      {/* Page header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>

      {/* Quick navigation tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('settings')}
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          Instellingen
        </Button>
        <Button
          variant={activeTab === 'subscription' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('subscription')}
          className="gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Abonnement
        </Button>
        <Button
          variant={activeTab === 'data-management' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('data-management')}
          className="gap-2"
        >
          <Shield className="w-4 h-4" />
          Data & Privacy
        </Button>
      </div>
    </div>
  );
}
