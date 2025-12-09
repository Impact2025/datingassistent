'use client';

/**
 * KickstartDayFlow - Wrapper for DayViewer to work in modal context
 * Integrates Kickstart daily content into dashboard modal system
 */

import { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { DayViewer } from './DayViewer';
import { Button } from '@/components/ui/button';
import type {
  DayDetailResponse,
  UpdateDayProgressInput,
} from '@/types/kickstart.types';

interface KickstartDayFlowProps {
  dayNumber: number;
  onClose?: () => void;
  onNavigate?: (dayNumber: number) => void;
}

export function KickstartDayFlow({ dayNumber, onClose, onNavigate }: KickstartDayFlowProps) {
  const [data, setData] = useState<DayDetailResponse & { hasAccess: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/kickstart/day/${dayNumber}`);
        if (!response.ok) {
          throw new Error('Kon dag niet laden');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er ging iets mis');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dayNumber]);

  const handleNavigate = (newDayNumber: number) => {
    if (onNavigate) {
      onNavigate(newDayNumber);
    }
  };

  const handleProgressUpdate = async (updateData: UpdateDayProgressInput) => {
    try {
      const response = await fetch('/api/kickstart/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Kon voortgang niet opslaan');
      }

      const result = await response.json();

      // Update local state with new progress
      if (data) {
        setData({
          ...data,
          progress: result.progress,
        });
      }

      // If day is complete, show success
      if (result.isComplete) {
        console.log('Day complete!');
      }
    } catch (err) {
      console.error('Progress update error:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Dag {dayNumber} laden...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oeps!</h2>
          <p className="text-gray-600 mb-4">{error || 'Deze dag kon niet worden geladen'}</p>
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Terug naar Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Check access
  if (!data.hasAccess) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nog niet beschikbaar</h2>
          <p className="text-gray-600 mb-4">
            Deze dag wordt ontgrendeld wanneer je de vorige dagen hebt voltooid.
          </p>
          {onClose && (
            <Button onClick={onClose} variant="outline">
              Terug naar Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Close button for modal context */}
      {onClose && (
        <div className="absolute top-0 right-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Day Content */}
      <DayViewer
        day={data.day}
        progress={data.progress}
        hasAccess={data.hasAccess}
        navigation={data.navigation}
        onNavigate={handleNavigate}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}
