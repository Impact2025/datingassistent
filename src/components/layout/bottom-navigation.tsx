'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { User, Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

const triggerHaptic = () => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

function BottomNavigationInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') || null;

  const isHome = (pathname === '/dashboard' && !tab) || tab === 'home';
  const isPad = tab === 'pad';
  const isCoach = tab === 'coach';
  const isProfiel = tab === 'profiel' || tab === 'settings' || tab === 'subscription' || tab === 'data-management';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 dark:bg-gray-950/98 backdrop-blur-xl border-t border-gray-100/80 dark:border-gray-800 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Hoofdnavigatie"
    >
      <div className="flex items-end justify-around px-3 pt-2 pb-1.5">

        {/* Home */}
        <Link
          href="/dashboard"
          onClick={triggerHaptic}
          aria-label={`Home${isHome ? ' (huidige pagina)' : ''}`}
          aria-current={isHome ? 'page' : undefined}
          className={cn(
            'flex flex-col items-center min-w-[60px] px-2 py-1.5 rounded-xl active:scale-95 transition-all duration-150',
            isHome ? 'bg-coral-50/80 dark:bg-gray-800/80' : ''
          )}
        >
          <div className="w-[22px] h-[22px] mb-0.5 relative">
            <Image
              src="/images/Logo Icon DatingAssistent.png"
              alt=""
              aria-hidden="true"
              fill
              className={cn('object-contain transition-opacity', isHome ? 'opacity-100' : 'opacity-40')}
              unoptimized
            />
          </div>
          <span className={cn(
            'text-[10px] font-medium transition-colors',
            isHome ? 'text-coral-500 font-semibold' : 'text-gray-400 dark:text-gray-500'
          )}>Home</span>
        </Link>

        {/* Mijn Reis (Pad) */}
        <Link
          href="/dashboard?tab=pad"
          onClick={triggerHaptic}
          aria-label={`Mijn Reis${isPad ? ' (huidige pagina)' : ''}`}
          aria-current={isPad ? 'page' : undefined}
          className={cn(
            'flex flex-col items-center min-w-[60px] px-2 py-1.5 rounded-xl active:scale-95 transition-all duration-150',
            isPad ? 'bg-coral-50/80 dark:bg-gray-800/80' : ''
          )}
        >
          <Heart
            className={cn('w-[22px] h-[22px] mb-0.5 transition-all', isPad ? 'text-coral-500' : 'text-gray-400 dark:text-gray-500')}
            strokeWidth={isPad ? 2.5 : 2}
            aria-hidden="true"
          />
          <span className={cn(
            'text-[10px] font-medium transition-colors',
            isPad ? 'text-coral-500 font-semibold' : 'text-gray-400 dark:text-gray-500'
          )}>Mijn Reis</span>
        </Link>

        {/* Coach — raised center button */}
        <div className="flex flex-col items-center -mt-[22px]">
          <Link
            href="/dashboard?tab=coach"
            onClick={triggerHaptic}
            aria-label={`Coach${isCoach ? ' (huidige pagina)' : ''}`}
            aria-current={isCoach ? 'page' : undefined}
            className="flex flex-col items-center"
          >
            <div className={cn(
              'w-[56px] h-[56px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 border-[3px] border-white dark:border-gray-950',
              isCoach
                ? 'bg-gradient-to-br from-coral-500 to-rose-500 shadow-[0_6px_24px_rgba(239,88,73,0.55)] scale-[1.06]'
                : 'bg-gradient-to-br from-coral-400 to-coral-600 shadow-[0_4px_18px_rgba(239,88,73,0.38)]'
            )}>
              <Sparkles
                className="w-[24px] h-[24px] text-white"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>
            <span className={cn(
              'text-[10px] mt-1 font-bold tracking-wider uppercase transition-colors',
              isCoach ? 'text-coral-500' : 'text-gray-500 dark:text-gray-400'
            )}>Coach</span>
          </Link>
        </div>

        {/* Profiel */}
        <Link
          href="/dashboard?tab=profiel"
          onClick={triggerHaptic}
          aria-label={`Profiel${isProfiel ? ' (huidige pagina)' : ''}`}
          aria-current={isProfiel ? 'page' : undefined}
          className={cn(
            'flex flex-col items-center min-w-[60px] px-2 py-1.5 rounded-xl active:scale-95 transition-all duration-150',
            isProfiel ? 'bg-violet-50/80 dark:bg-gray-800/80' : ''
          )}
        >
          <User
            className={cn('w-[22px] h-[22px] mb-0.5 transition-all', isProfiel ? 'text-violet-500' : 'text-gray-400 dark:text-gray-500')}
            strokeWidth={isProfiel ? 2.5 : 2}
            aria-hidden="true"
          />
          <span className={cn(
            'text-[10px] font-medium transition-colors',
            isProfiel ? 'text-violet-500 font-semibold' : 'text-gray-400 dark:text-gray-500'
          )}>Profiel</span>
        </Link>

      </div>
    </nav>
  );
}

export function BottomNavigation() {
  return (
    <Suspense fallback={null}>
      <BottomNavigationInner />
    </Suspense>
  );
}
