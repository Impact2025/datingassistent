'use client';

/**
 * Hook for managing Iris chat usage limits
 * Provides real-time usage status and limit checking
 */

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';

export interface IrisUsageStatus {
  allowed: boolean;
  tier: 'free' | 'kickstart' | 'transformatie' | 'vip';
  current: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  resetTime: string;
  resetTimeHuman: string;
  percentageUsed: number;
}

interface UseIrisUsageReturn {
  usageStatus: IrisUsageStatus | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  updateFromResponse: (status: IrisUsageStatus) => void;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch usage status');
  }
  return res.json();
};

/**
 * Hook to get and manage Iris chat usage limits
 *
 * @example
 * ```tsx
 * const { usageStatus, isLoading, refresh } = useIrisUsage();
 *
 * if (!usageStatus?.allowed) {
 *   return <div>Limiet bereikt! Reset over {usageStatus.resetTimeHuman}</div>;
 * }
 * ```
 */
export function useIrisUsage(): UseIrisUsageReturn {
  const [localStatus, setLocalStatus] = useState<IrisUsageStatus | null>(null);

  const { data, error, isLoading, mutate } = useSWR<IrisUsageStatus>(
    '/api/iris/usage',
    fetcher,
    {
      // Refresh every 60 seconds
      refreshInterval: 60000,
      // Revalidate on focus
      revalidateOnFocus: true,
      // Keep previous data while revalidating
      keepPreviousData: true,
    }
  );

  // Use local status if available (updated from chat responses), otherwise use SWR data
  const usageStatus = localStatus || data || null;

  // Update local status from chat response (faster than waiting for SWR)
  const updateFromResponse = useCallback((status: IrisUsageStatus) => {
    setLocalStatus(status);
  }, []);

  // Refresh SWR data and clear local status
  const refresh = useCallback(() => {
    setLocalStatus(null);
    mutate();
  }, [mutate]);

  // Clear local status when SWR data updates
  useEffect(() => {
    if (data && localStatus) {
      // If SWR data is newer or different, use it
      setLocalStatus(null);
    }
  }, [data]);

  return {
    usageStatus,
    isLoading,
    error: error || null,
    refresh,
    updateFromResponse,
  };
}

/**
 * Get tier display name in Dutch
 */
export function getTierDisplayName(tier: IrisUsageStatus['tier']): string {
  const names: Record<IrisUsageStatus['tier'], string> = {
    free: 'Gratis',
    kickstart: 'Kickstart',
    transformatie: 'Transformatie',
    vip: 'VIP',
  };
  return names[tier];
}

/**
 * Get tier badge color classes
 */
export function getTierColorClasses(tier: IrisUsageStatus['tier']): string {
  const colors: Record<IrisUsageStatus['tier'], string> = {
    free: 'bg-gray-100 text-gray-700 border-gray-200',
    kickstart: 'bg-pink-50 text-pink-700 border-pink-200',
    transformatie: 'bg-purple-50 text-purple-700 border-purple-200',
    vip: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return colors[tier];
}

/**
 * Get usage bar color based on percentage
 */
export function getUsageBarColor(percentageUsed: number): string {
  if (percentageUsed >= 90) return 'bg-red-500';
  if (percentageUsed >= 70) return 'bg-orange-500';
  if (percentageUsed >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
}
