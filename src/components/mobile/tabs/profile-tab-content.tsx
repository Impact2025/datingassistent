"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  Star,
  Crown,
  TrendingUp,
  Award,
  Heart,
  Edit3,
  Mail,
  Lock,
  Palette,
  Moon,
  Globe
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================================
// PROFILE TAB - User Profile & Settings
// ============================================================================

interface ProfileTabContentProps {
  user: any;
  userProfile: any;
}

// Menu Item Component
function MenuItem({
  icon: Icon,
  label,
  description,
  onClick,
  badge,
  danger = false,
  chevron = true
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
  badge?: string;
  danger?: boolean;
  chevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
        "hover:bg-gray-50 active:scale-98",
        danger && "hover:bg-red-50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        danger ? "bg-red-50" : "bg-gray-100"
      )}>
        <Icon className={cn("w-5 h-5", danger ? "text-red-500" : "text-gray-600")} />
      </div>
      <div className="flex-1 text-left">
        <p className={cn("font-medium", danger ? "text-red-600" : "text-gray-900")}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      {badge && (
        <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs font-medium rounded-full">
          {badge}
        </span>
      )}
      {chevron && <ChevronRight className="w-5 h-5 text-gray-300" />}
    </button>
  );
}

// Stats Card
function ProfileStat({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={cn("w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// Section Header
function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">
      {title}
    </h3>
  );
}

export function ProfileTabContent({ user, userProfile }: ProfileTabContentProps) {
  const router = useRouter();
  const [isPro] = useState(userProfile?.subscription_tier === 'pro' || userProfile?.subscription_tier === 'premium');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const accountMenuItems = [
    {
      icon: Edit3,
      label: 'Profiel Bewerken',
      description: 'Naam, bio en voorkeuren',
      onClick: () => router.push('/profiel/bewerken'),
    },
    {
      icon: Camera,
      label: 'Foto\'s Beheren',
      description: 'Upload en organiseer foto\'s',
      onClick: () => router.push('/profiel/fotos'),
    },
    {
      icon: Mail,
      label: 'E-mail Wijzigen',
      description: user?.email || 'Niet ingesteld',
      onClick: () => router.push('/settings/email'),
    },
    {
      icon: Lock,
      label: 'Wachtwoord',
      description: 'Wijzig je wachtwoord',
      onClick: () => router.push('/settings/password'),
    },
  ];

  const preferencesMenuItems = [
    {
      icon: Bell,
      label: 'Notificaties',
      description: 'Push en email meldingen',
      onClick: () => router.push('/settings/notifications'),
    },
    {
      icon: Palette,
      label: 'Uiterlijk',
      description: 'Thema en kleuren',
      onClick: () => router.push('/settings/appearance'),
    },
    {
      icon: Globe,
      label: 'Taal',
      description: 'Nederlands',
      onClick: () => router.push('/settings/language'),
    },
    {
      icon: Moon,
      label: 'Dark Mode',
      description: 'Automatisch',
      onClick: () => {},
      badge: 'Binnenkort',
    },
  ];

  const supportMenuItems = [
    {
      icon: HelpCircle,
      label: 'Help & FAQ',
      description: 'Veelgestelde vragen',
      onClick: () => router.push('/help'),
    },
    {
      icon: Shield,
      label: 'Privacy & Veiligheid',
      description: 'Je gegevens beschermen',
      onClick: () => router.push('/privacy'),
    },
  ];

  return (
    <div className="p-4 space-y-5">
      {/* Profile Header Card */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-3 border-white/30">
                {userProfile?.avatar_url ? (
                  <Image
                    src={userProfile.avatar_url}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{user?.name || 'Gebruiker'}</h1>
                {isPro && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-[10px] font-bold flex items-center gap-0.5">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm">{user?.email}</p>
              <p className="text-white/60 text-xs mt-1">Lid sinds {new Date(user?.created_at || Date.now()).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-2">
            <ProfileStat
              label="Dagen actief"
              value="47"
              icon={TrendingUp}
              color="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
            <ProfileStat
              label="Streak"
              value="7"
              icon={Award}
              color="bg-gradient-to-br from-orange-500 to-red-500"
            />
            <ProfileStat
              label="Achievements"
              value="12"
              icon={Star}
              color="bg-gradient-to-br from-amber-500 to-yellow-500"
            />
            <ProfileStat
              label="Level"
              value="3"
              icon={Heart}
              color="bg-gradient-to-br from-pink-500 to-rose-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Banner (for non-pro users) */}
      {!isPro && (
        <button
          onClick={() => router.push('/upgrade')}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold">Upgrade naar Pro</h3>
              <p className="text-white/80 text-sm">Ontgrendel alle premium features</p>
            </div>
            <ChevronRight className="w-6 h-6 text-white/60" />
          </div>
        </button>
      )}

      {/* Account Section */}
      <div className="space-y-1">
        <SectionHeader title="Account" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-1">
            {accountMenuItems.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Preferences Section */}
      <div className="space-y-1">
        <SectionHeader title="Voorkeuren" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-1">
            {preferencesMenuItems.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Support Section */}
      <div className="space-y-1">
        <SectionHeader title="Ondersteuning" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-1">
            {supportMenuItems.map((item, index) => (
              <MenuItem key={index} {...item} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-1">
          <MenuItem
            icon={LogOut}
            label="Uitloggen"
            onClick={handleLogout}
            danger
            chevron={false}
          />
        </CardContent>
      </Card>

      {/* App Version */}
      <p className="text-center text-xs text-gray-400 py-4">
        DatingAssistent v2.0.0
      </p>
    </div>
  );
}

export default ProfileTabContent;
