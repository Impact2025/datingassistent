/**
 * ADMIN DATA HOOKS
 * High-performance data fetching met SWR caching
 * Wereldklasse admin panel ondersteuning
 */

import useSWR, { SWRConfiguration } from 'swr';
import { useCallback, useMemo } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalAssessments: number;
  completedAssessments: number;
  usersWithProgress: number;
  averageReadinessScore: number;
  revenue: number;
  conversionRate: number;
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    ai: 'healthy' | 'warning' | 'error';
  };
  recentActivity: Activity[];
  // Groei metrics
  growth: {
    users: { value: number; percentage: number; trend: 'up' | 'down' | 'stable' };
    revenue: { value: number; percentage: number; trend: 'up' | 'down' | 'stable' };
    activeUsers: { value: number; percentage: number; trend: 'up' | 'down' | 'stable' };
    conversions: { value: number; percentage: number; trend: 'up' | 'down' | 'stable' };
  };
}

export interface Activity {
  id: string;
  type: 'signup' | 'login' | 'assessment' | 'subscription' | 'purchase';
  user: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Coupon {
  id: number;
  code: string;
  package_type: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  display_name: string | null;
  subscription_type: string | null;
  subscription_status: string | null;
  role: string;
  created_at: string;
  last_login: string | null;
}

export interface AuditLog {
  id: string;
  userId: number;
  action: string;
  resource: string;
  success: boolean;
  ipAddress: string;
  timestamp: string;
  details: Record<string, unknown>;
}

// =============================================================================
// FETCHER
// =============================================================================

const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error('API request failed');
    (error as any).status = response.status;
    (error as any).info = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
};

// =============================================================================
// SWR CONFIGURATION
// =============================================================================

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // 5 seconden deduplication
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: (error) => {
    // Niet opnieuw proberen bij auth errors
    return error?.status !== 401 && error?.status !== 403;
  },
};

// Real-time config voor dashboard
const realTimeConfig: SWRConfiguration = {
  ...defaultConfig,
  refreshInterval: 30000, // 30 seconden auto-refresh
  revalidateOnFocus: true,
};

// Static config voor data die niet vaak verandert
const staticConfig: SWRConfiguration = {
  ...defaultConfig,
  revalidateOnFocus: false,
  refreshInterval: 0,
  dedupingInterval: 60000, // 1 minuut
};

// =============================================================================
// DASHBOARD HOOK
// =============================================================================

export function useAdminDashboard() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean; stats: DashboardStats }>(
    '/api/admin/dashboard',
    fetcher,
    realTimeConfig
  );

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    stats: data?.stats,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error,
    refresh,
  };
}

// =============================================================================
// ENHANCED DASHBOARD HOOK (met groei berekeningen)
// =============================================================================

export function useAdminDashboardEnhanced() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ success: boolean; stats: DashboardStats }>(
    '/api/admin/dashboard/enhanced',
    fetcher,
    realTimeConfig
  );

  const refresh = useCallback(() => mutate(), [mutate]);

  // Bereken trends
  const trends = useMemo(() => {
    if (!data?.stats?.growth) return null;
    const g = data.stats.growth;
    return {
      usersGrowing: g.users.trend === 'up',
      revenueGrowing: g.revenue.trend === 'up',
      activeUsersGrowing: g.activeUsers.trend === 'up',
      conversionsGrowing: g.conversions.trend === 'up',
    };
  }, [data?.stats?.growth]);

  return {
    stats: data?.stats,
    trends,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error,
    refresh,
  };
}

// =============================================================================
// COUPONS HOOK
// =============================================================================

export function useAdminCoupons() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Coupon[]>(
    '/api/admin/coupons',
    fetcher,
    defaultConfig
  );

  const refresh = useCallback(() => mutate(), [mutate]);

  // Coupon stats
  const stats = useMemo(() => {
    if (!data) return null;
    return {
      total: data.length,
      active: data.filter(c => c.is_active).length,
      totalUsed: data.reduce((sum, c) => sum + c.used_count, 0),
      expiringThisMonth: data.filter(c => {
        if (!c.valid_until) return false;
        const expiry = new Date(c.valid_until);
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return expiry <= nextMonth && expiry >= now;
      }).length,
    };
  }, [data]);

  // CRUD operations
  const createCoupon = useCallback(async (couponData: Partial<Coupon>) => {
    const response = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(couponData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create coupon');
    }

    await mutate();
    return response.json();
  }, [mutate]);

  const updateCoupon = useCallback(async (id: number, updates: Partial<Coupon>) => {
    const response = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update coupon');
    }

    await mutate();
    return response.json();
  }, [mutate]);

  const deleteCoupon = useCallback(async (id: number) => {
    const response = await fetch(`/api/admin/coupons/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete coupon');
    }

    await mutate();
    return response.json();
  }, [mutate]);

  const toggleStatus = useCallback(async (id: number, currentStatus: boolean) => {
    return updateCoupon(id, { is_active: !currentStatus });
  }, [updateCoupon]);

  return {
    coupons: data || [],
    stats,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error,
    refresh,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleStatus,
  };
}

// =============================================================================
// USERS HOOK
// =============================================================================

export function useAdminUsers(options?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', options.page.toString());
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.search) params.set('search', options.search);
  if (options?.role) params.set('role', options.role);

  const url = `/api/admin/users?${params.toString()}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }>(url, fetcher, defaultConfig);

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    users: data?.users || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error,
    refresh,
  };
}

// =============================================================================
// AUDIT LOGS HOOK
// =============================================================================

export function useAdminAuditLogs(options?: {
  page?: number;
  limit?: number;
  action?: string;
  userId?: number;
  success?: boolean;
}) {
  const params = new URLSearchParams();
  if (options?.page) params.set('page', options.page.toString());
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.action) params.set('action', options.action);
  if (options?.userId) params.set('userId', options.userId.toString());
  if (options?.success !== undefined) params.set('success', options.success.toString());

  const url = `/api/admin/security/audit-logs?${params.toString()}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    logs: AuditLog[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(url, fetcher, staticConfig);

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    logs: data?.logs || [],
    total: data?.total || 0,
    pagination: data?.pagination,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error,
    refresh,
  };
}

// =============================================================================
// SYSTEM HEALTH HOOK
// =============================================================================

export function useSystemHealth() {
  const { data, error, isLoading, mutate } = useSWR<{
    database: { status: string; latency: number };
    api: { status: string; latency: number };
    ai: { status: string; latency: number };
    memory: { used: number; total: number };
    uptime: number;
  }>('/api/admin/system/health', fetcher, {
    ...realTimeConfig,
    refreshInterval: 10000, // Check elke 10 seconden
  });

  const refresh = useCallback(() => mutate(), [mutate]);

  const overallStatus = useMemo(() => {
    if (!data) return 'unknown';
    const statuses = [data.database.status, data.api.status, data.ai.status];
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  }, [data]);

  return {
    health: data,
    overallStatus,
    isLoading,
    error,
    refresh,
  };
}

// =============================================================================
// ANALYTICS HOOK
// =============================================================================

export function useAdminAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    userGrowth: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number }>;
    activeUsers: Array<{ date: string; count: number }>;
    conversions: Array<{ date: string; rate: number }>;
    topPages: Array<{ path: string; views: number }>;
    deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  }>(`/api/admin/analytics?period=${period}`, fetcher, staticConfig);

  const refresh = useCallback(() => mutate(), [mutate]);

  return {
    analytics: data,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error,
    refresh,
  };
}

// =============================================================================
// PREFETCH UTILITIES
// =============================================================================

export async function prefetchAdminData() {
  // Prefetch common admin data voor snellere navigatie
  const urls = [
    '/api/admin/dashboard',
    '/api/admin/coupons',
  ];

  await Promise.allSettled(
    urls.map(url =>
      fetch(url, { credentials: 'include' })
        .then(res => res.json())
        .catch(() => null)
    )
  );
}
