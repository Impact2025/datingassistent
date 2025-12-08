/**
 * useScanManager - Centralized scan management hook
 * Handles all scan-related logic: opening, closing, status tracking
 */

import { useState, useCallback, useEffect } from 'react';
import { SCAN_TYPES, SCAN_URLS, getScanTypeFromUrl, isScanUrl } from '@/lib/constants/dashboard';
import { AttachmentAssessmentFlow } from '@/components/attachment-assessment/attachment-assessment-flow';
import { DatingStyleFlow } from '@/components/dating-style/dating-style-flow';
import { EmotioneleReadinessFlow } from '@/components/emotional-readiness/emotionele-readiness-flow';

export interface ScanStatus {
  scanType: string;
  isCompleted: boolean;
  lastCompletedAt?: string;
  canRetake: boolean;
  daysUntilRetake?: number;
  latestResult?: any;
  totalAttempts: number;
  assessmentId?: number;
}

export interface ScanModalState {
  isOpen: boolean;
  scanType: string | null;
  title: string;
  component: React.ReactNode | null;
}

export interface ScanMetadata {
  title: string;
  description: string;
  quote: string;
  badgeText: string;
  color: 'pink' | 'purple' | 'blue' | 'green';
  icon: any;
  href: string;
}

// Scan metadata configuration
const SCAN_METADATA: Record<string, ScanMetadata> = {
  [SCAN_TYPES.HECHTINGSSTIJL]: {
    title: 'Hechtingsstijl QuickScan',
    description: 'Ontdek hoe jouw hechtingspatroon je relaties beïnvloedt',
    quote: 'Begrijpen hoe jij liefhebt is de basis van betere dates',
    badgeText: 'Aanbevolen',
    color: 'purple',
    icon: 'Heart',
    href: SCAN_URLS[SCAN_TYPES.HECHTINGSSTIJL],
  },
  [SCAN_TYPES.DATINGSTIJL]: {
    title: 'Dating Style & Blind Spots',
    description: 'Leer je dating patterns en blinde vlekken kennen',
    quote: 'Ontdek je dating patronen en blinde vlekken',
    badgeText: 'Populair',
    color: 'pink',
    icon: 'Target',
    href: SCAN_URLS[SCAN_TYPES.DATINGSTIJL],
  },
  [SCAN_TYPES.EMOTIONELE_READINESS]: {
    title: 'Emotional Readiness Check',
    description: 'Evalueer je emotionele gereedheid voor dating',
    quote: 'Ben je klaar voor dating? Leer het in 3-4 minuten',
    badgeText: 'Tip',
    color: 'blue',
    icon: 'Brain',
    href: SCAN_URLS[SCAN_TYPES.EMOTIONELE_READINESS],
  },
  [SCAN_TYPES.LEVENSVISIE]: {
    title: 'Levensvisie & Toekomstkompas',
    description: 'Ontdek je toekomstvisie en ideale partner profiel',
    quote: 'Visualiseer je toekomst en vind je ideale match',
    badgeText: 'Nieuw',
    color: 'green',
    icon: 'Compass',
    href: SCAN_URLS[SCAN_TYPES.LEVENSVISIE],
  },
  [SCAN_TYPES.RELATIEPATRONEN]: {
    title: 'Relatiepatronen Analyse',
    description: 'Herken je terugkerende patronen en groei strategieën',
    quote: 'Doorbreek oude patronen en groei in relaties',
    badgeText: 'Diepgaand',
    color: 'purple',
    icon: 'Repeat',
    href: SCAN_URLS[SCAN_TYPES.RELATIEPATRONEN],
  },
};

export function useScanManager(userId?: number) {
  const [scanModal, setScanModal] = useState<ScanModalState>({
    isOpen: false,
    scanType: null,
    title: '',
    component: null,
  });

  const [scanStatus, setScanStatus] = useState<Record<string, ScanStatus>>({});
  const [loading, setLoading] = useState(false);

  // Fetch scan status on mount
  useEffect(() => {
    const fetchScanStatus = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/scans/status?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();

          // Map scan status by scan type for easy lookup
          if (data?.scans) {
            const statusMap: Record<string, ScanStatus> = {};
            data.scans.forEach((scan: ScanStatus) => {
              statusMap[scan.scanType] = scan;
            });
            setScanStatus(statusMap);
          }
        }
      } catch (error) {
        console.error('Error fetching scan status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScanStatus();
  }, [userId]);

  // Get scan component by type
  const getScanComponent = useCallback((scanType: string, onClose: () => void): React.ReactNode => {
    const normalizedType = scanType.toLowerCase().replace('-', '');

    switch (normalizedType) {
      case SCAN_TYPES.HECHTINGSSTIJL:
        return <AttachmentAssessmentFlow onClose={onClose} />;
      case SCAN_TYPES.DATING_STYLE:
      case SCAN_TYPES.DATINGSTIJL:
        return <DatingStyleFlow onClose={onClose} />;
      case SCAN_TYPES.EMOTIONELE_READINESS:
      case 'emotionelereadiness':
        return <EmotioneleReadinessFlow onClose={onClose} />;
      default:
        return null;
    }
  }, []);

  // Open scan modal
  const openScan = useCallback((scanType: string, customTitle?: string) => {
    const metadata = SCAN_METADATA[scanType];
    const title = customTitle || metadata?.title || 'Scan';

    const component = getScanComponent(scanType, () => closeScan());

    if (component) {
      setScanModal({
        isOpen: true,
        scanType,
        title,
        component,
      });
    }
  }, [getScanComponent]);

  // Close scan modal
  const closeScan = useCallback(() => {
    setScanModal({
      isOpen: false,
      scanType: null,
      title: '',
      component: null,
    });
  }, []);

  // Handle action click (can be scan or regular navigation)
  const handleActionClick = useCallback((
    action: { href?: string; tab?: string; actionHref?: string },
    onTabChange?: (tab: string) => void,
    router?: any
  ) => {
    const href = action.href || action.actionHref;

    // Check if this is a scan
    if (href && isScanUrl(href)) {
      const scanType = getScanTypeFromUrl(href);
      if (scanType) {
        const metadata = SCAN_METADATA[scanType];
        openScan(scanType, metadata?.title);
        return;
      }
    }

    // Regular navigation
    if (href && router) {
      router.push(href);
    } else if (action.tab && onTabChange) {
      onTabChange(action.tab);
    }
  }, [openScan]);

  // Get completion status for a scan
  const getCompletionStatus = useCallback((scanType: string) => {
    const status = scanStatus[scanType];

    if (!status) return undefined;

    return {
      isCompleted: status.isCompleted,
      completedAt: status.lastCompletedAt,
      canRetake: status.canRetake,
      daysUntilRetake: status.daysUntilRetake,
      latestResult: status.latestResult,
      totalAttempts: status.totalAttempts,
    };
  }, [scanStatus]);

  // Get scan metadata
  const getScanMetadata = useCallback((scanType: string): ScanMetadata | undefined => {
    return SCAN_METADATA[scanType];
  }, []);

  // Check if URL is a scan
  const isUrlScan = useCallback((url: string): boolean => {
    return isScanUrl(url);
  }, []);

  // Refresh scan status
  const refreshScanStatus = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/scans/status?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();

        if (data?.scans) {
          const statusMap: Record<string, ScanStatus> = {};
          data.scans.forEach((scan: ScanStatus) => {
            statusMap[scan.scanType] = scan;
          });
          setScanStatus(statusMap);
        }
      }
    } catch (error) {
      console.error('Error refreshing scan status:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    // State
    scanModal,
    scanStatus,
    loading,

    // Actions
    openScan,
    closeScan,
    handleActionClick,
    refreshScanStatus,

    // Helpers
    getCompletionStatus,
    getScanMetadata,
    isUrlScan,
  };
}
